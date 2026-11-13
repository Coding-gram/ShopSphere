import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Order } from '../models/Order.js';
import { OrderAuditEvent } from '../models/OrderAuditEvent.js';
import { PaymentAttempt } from '../models/PaymentAttempt.js';
import { assertOrderTransition, canTransitionOrder } from '../modules/orders/orderStateMachine.js';
import { migrateLegacyOrderStatuses } from '../scripts/orderStatusMigration.js';
import { clearCollections, setupTestDB, teardownTestDB } from './setup.js';

async function createOrder(overrides: Partial<Record<string, unknown>> = {}) {
  const productId = new mongoose.Types.ObjectId();

  return Order.create({
    user: new mongoose.Types.ObjectId(),
    orderNumber: `ORD-${crypto.randomUUID()}`,
    items: [{ product: productId, name: 'State machine test product', image: '', quantity: 1, price: 1000 }],
    shippingAddress: {
      fullName: 'Asha Sharma',
      phone: '9876543210',
      street: '42 Market Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    subtotal: 1000,
    shippingCost: 0,
    tax: 0,
    total: 1000,
    status: 'placed',
    paymentStatus: 'pending',
    statusHistory: [{ status: 'placed', timestamp: new Date(), note: 'Order placed' }],
    ...overrides,
  });
}

async function writeLegacyOrder(
  orderId: mongoose.Types.ObjectId,
  status: string,
  paymentStatus: string,
  history: string[] = [status],
) {
  await Order.collection.updateOne(
    { _id: orderId },
    {
      $set: {
        status,
        paymentStatus,
        statusHistory: history.map((historyStatus) => ({ status: historyStatus, timestamp: new Date() })),
      },
    },
  );
}

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearCollections();
});

describe('Phase 5.1 order state machine', () => {
  it('accepts only canonical lifecycle steps and permitted cancellations', () => {
    expect(canTransitionOrder('placed', 'paid')).toBe(true);
    expect(canTransitionOrder('placed', 'cancelled')).toBe(true);
    expect(canTransitionOrder('paid', 'packed')).toBe(true);
    expect(canTransitionOrder('paid', 'cancelled')).toBe(true);
    expect(canTransitionOrder('packed', 'shipped')).toBe(true);
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true);

    expect(() => assertOrderTransition('placed', 'packed')).toThrow('Invalid order status transition');
    expect(() => assertOrderTransition('delivered', 'cancelled')).toThrow('Invalid order status transition');
    expect(() => assertOrderTransition('cancelled', 'paid')).toThrow('Invalid order status transition');

    try {
      assertOrderTransition('placed', 'packed');
    } catch (error) {
      expect(error).toMatchObject({ statusCode: 409 });
    }
  });
});

describe('Phase 5.1 persistence foundations', () => {
  it('makes payment attempts idempotent per order and keeps audit events immutable', async () => {
    const order = await createOrder();

    await PaymentAttempt.create({
      order: order._id,
      idempotencyKey: 'payment-attempt-1',
      amount: order.total,
      currency: 'INR',
      provider: 'simulated',
    });

    await expect(PaymentAttempt.create({
      order: order._id,
      idempotencyKey: 'payment-attempt-1',
      amount: order.total,
      currency: 'INR',
      provider: 'simulated',
    })).rejects.toMatchObject({ code: 11000 });

    const auditEvent = await OrderAuditEvent.create({
      order: order._id,
      actorType: 'system',
      eventType: 'order_placed',
      toStatus: 'placed',
      note: 'Order created by checkout.',
    });

    auditEvent.note = 'Customer-modified note';
    await expect(auditEvent.save()).rejects.toThrow('immutable');
    await expect(OrderAuditEvent.updateOne(
      { _id: auditEvent._id },
      { $set: { note: 'Customer-modified note' } },
    )).rejects.toThrow('immutable');
    await expect(OrderAuditEvent.deleteOne({ _id: auditEvent._id })).rejects.toThrow('immutable');

    await expect(OrderAuditEvent.create({
      order: order._id,
      actorType: 'customer',
      eventType: 'order_status_changed',
      toStatus: 'paid',
    })).rejects.toThrow('actor identifier');
  });
});

describe('Phase 5.1 legacy order migration', () => {
  it('migrates known legacy statuses without inferring a payment and is repeatable', async () => {
    const paidOrder = await createOrder({ paymentStatus: 'paid' });
    const ambiguousOrder = await createOrder();

    await writeLegacyOrder(paidOrder._id, 'processing', 'paid', ['pending', 'confirmed', 'processing']);
    await writeLegacyOrder(ambiguousOrder._id, 'confirmed', 'pending', ['pending', 'confirmed']);

    const firstRun = await migrateLegacyOrderStatuses();
    expect(firstRun).toMatchObject({ migrated: 2, skipped: 0 });

    const migratedPaidOrder = await Order.findById(paidOrder._id).lean();
    expect(migratedPaidOrder).toMatchObject({ status: 'packed', paymentStatus: 'paid' });
    expect(migratedPaidOrder?.statusHistory.map((entry) => entry.status)).toEqual(['placed', 'paid', 'packed']);

    const migratedAmbiguousOrder = await Order.findById(ambiguousOrder._id).lean();
    expect(migratedAmbiguousOrder).toMatchObject({ status: 'placed', paymentStatus: 'pending' });
    expect(migratedAmbiguousOrder?.statusHistory.map((entry) => entry.status)).toEqual(['placed', 'placed']);
    expect(migratedAmbiguousOrder?.statusHistory[1]?.note).toMatch(/payment state was not paid/i);

    expect(await migrateLegacyOrderStatuses()).toMatchObject({ migrated: 0, skipped: 2 });
  });

  it('refuses unknown legacy data before changing any orders', async () => {
    const knownOrder = await createOrder();
    const unknownOrder = await createOrder();
    await writeLegacyOrder(knownOrder._id, 'pending', 'pending');
    await writeLegacyOrder(unknownOrder._id, 'unknown-legacy-state', 'pending');

    await expect(migrateLegacyOrderStatuses()).rejects.toThrow('Unsupported order statuses');

    const unchangedOrder = await Order.findById(knownOrder._id).lean();
    expect(unchangedOrder?.status).toBe('pending');
  });
});
