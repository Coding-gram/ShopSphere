import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderAuditEvent } from '../models/OrderAuditEvent.js';

const addressInput = {
  fullName: 'Asha Sharma',
  phone: '9876543210',
  street: '42 Market Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  country: 'India',
};

async function registerCustomer(email: string): Promise<string[]> {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Order Customer', email, password: 'Password123' })
    .expect(201);

  return response.headers['set-cookie'] as unknown as string[];
}

async function checkoutOrder(cookies: string[], key: string) {
  const category = await Category.create({ name: `Category ${crypto.randomUUID()}` });
  const product = await Product.create({
    name: `Product ${crypto.randomUUID()}`,
    description: 'A product used to verify customer order behavior.',
    price: 1250,
    category: category._id,
    stock: 8,
    sku: `SKU-${crypto.randomUUID()}`,
  });
  const address = await request(app).post('/api/v1/addresses').set('Cookie', cookies).send(addressInput).expect(201);
  await request(app)
    .post('/api/v1/cart/items')
    .set('Cookie', cookies)
    .send({ productId: product._id.toString(), quantity: 2 })
    .expect(201);
  const order = await request(app)
    .post('/api/v1/checkout')
    .set('Cookie', cookies)
    .set('Idempotency-Key', key)
    .send({ addressId: address.body.data._id })
    .expect(201);

  return { order: order.body.data, product };
}

function cancelOrder(cookies: string[], orderId: string, idempotencyKey: string, reason = 'Ordered the wrong item') {
  return request(app)
    .post(`/api/v1/orders/${orderId}/cancel`)
    .set('Cookie', cookies)
    .set('Idempotency-Key', idempotencyKey)
    .send({ reason });
}

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Phase 5.3 customer order read API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('lists only the authenticated customer orders newest first with pagination and returns owned details', async () => {
    const ownerCookies = await registerCustomer('orders-owner@example.com');
    const first = await checkoutOrder(ownerCookies, 'orders-first-key');
    const second = await checkoutOrder(ownerCookies, 'orders-second-key');
    const otherCookies = await registerCustomer('orders-other@example.com');

    const list = await request(app).get('/api/v1/orders?page=1&limit=1').set('Cookie', ownerCookies).expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0]._id).toBe(second.order._id);
    expect(list.body.pagination).toMatchObject({ page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true });

    const detail = await request(app).get(`/api/v1/orders/${first.order._id}`).set('Cookie', ownerCookies).expect(200);
    expect(detail.body.data).toMatchObject({ _id: first.order._id, items: [{ quantity: 2, price: 1250 }], shippingAddress: addressInput });

    await request(app).get(`/api/v1/orders/${first.order._id}`).set('Cookie', otherCookies).expect(404);
    await request(app).get('/api/v1/orders').expect(401);
  });
});

describe('Phase 5.3 customer cancellation API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('cancels an eligible order, restores its reserved stock once, and records an immutable audit event', async () => {
    const cookies = await registerCustomer('cancel-success@example.com');
    const { order, product } = await checkoutOrder(cookies, 'cancel-success-checkout');

    const cancelled = await request(app)
      .post(`/api/v1/orders/${order._id}/cancel`)
      .set('Cookie', cookies)
      .set('Idempotency-Key', 'cancel-success-key')
      .send({ reason: 'Ordered the wrong item' })
      .expect(200);

    expect(cancelled.body.data).toMatchObject({
      replayed: false,
      order: { _id: order._id, status: 'cancelled', paymentStatus: 'pending' },
    });
    expect(await Order.findById(order._id).lean()).toMatchObject({
      status: 'cancelled',
      paymentStatus: 'pending',
      cancellationIdempotencyKey: 'cancel-success-key',
    });
    expect((await Product.findById(product._id))?.stock).toBe(8);
    expect(await OrderAuditEvent.find({ order: order._id, eventType: 'order_cancelled' }).lean())
      .toMatchObject([{ actorType: 'customer', fromStatus: 'placed', toStatus: 'cancelled', note: 'Cancelled: Ordered the wrong item' }]);

    const replay = await request(app)
      .post(`/api/v1/orders/${order._id}/cancel`)
      .set('Cookie', cookies)
      .set('Idempotency-Key', 'cancel-success-key')
      .send({ reason: 'Ordered the wrong item' })
      .expect(200);
    expect(replay.body.data).toMatchObject({ replayed: true, order: { _id: order._id, status: 'cancelled' } });
    expect((await Product.findById(product._id))?.stock).toBe(8);
  });

  it('allows paid orders to be cancelled without changing their simulated payment snapshot', async () => {
    const cookies = await registerCustomer('cancel-paid@example.com');
    const { order, product } = await checkoutOrder(cookies, 'cancel-paid-checkout');
    await request(app)
      .post(`/api/v1/orders/${order._id}/payments`)
      .set('Cookie', cookies)
      .set('Idempotency-Key', 'cancel-paid-payment')
      .send({ outcome: 'success' })
      .expect(200);

    const cancelled = await cancelOrder(cookies, order._id, 'cancel-paid-key', 'No longer needed').expect(200);
    expect(cancelled.body.data.order).toMatchObject({ status: 'cancelled', paymentStatus: 'paid' });
    expect((await Product.findById(product._id))?.stock).toBe(8);
    expect(await OrderAuditEvent.find({ order: order._id, eventType: 'order_cancelled' }).lean())
      .toMatchObject([{ fromStatus: 'paid', toStatus: 'cancelled' }]);
  });

  it('handles concurrent cancellation retries and competing keys without restoring stock twice', async () => {
    const cookies = await registerCustomer('cancel-concurrent@example.com');
    const duplicate = await checkoutOrder(cookies, 'cancel-duplicate-checkout');
    const duplicateResponses = await Promise.all([
      cancelOrder(cookies, duplicate.order._id, 'cancel-duplicate-key'),
      cancelOrder(cookies, duplicate.order._id, 'cancel-duplicate-key'),
    ]);
    expect(duplicateResponses.map((response) => response.status).sort()).toEqual([200, 200]);
    expect((await Product.findById(duplicate.product._id))?.stock).toBe(8);
    expect(await OrderAuditEvent.countDocuments({ order: duplicate.order._id, eventType: 'order_cancelled' })).toBe(1);

    const competing = await checkoutOrder(cookies, 'cancel-competing-checkout');
    const competingResponses = await Promise.all([
      cancelOrder(cookies, competing.order._id, 'cancel-competing-a'),
      cancelOrder(cookies, competing.order._id, 'cancel-competing-b'),
    ]);
    expect(competingResponses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect((await Product.findById(competing.product._id))?.stock).toBe(8);
    expect(await OrderAuditEvent.countDocuments({ order: competing.order._id, eventType: 'order_cancelled' })).toBe(1);
  });

  it('enforces ownership, idempotency fingerprints, bounded reasons, and eligible states without changing inventory', async () => {
    const ownerCookies = await registerCustomer('cancel-owner@example.com');
    const otherCookies = await registerCustomer('cancel-other@example.com');
    const owned = await checkoutOrder(ownerCookies, 'cancel-owner-checkout');

    await request(app).post(`/api/v1/orders/${owned.order._id}/cancel`).send({ reason: 'Ordered the wrong item' }).expect(401);
    await request(app)
      .post(`/api/v1/orders/${owned.order._id}/cancel`)
      .set('Cookie', ownerCookies)
      .send({ reason: 'Ordered the wrong item' })
      .expect(400);
    await cancelOrder(otherCookies, owned.order._id, 'cancel-other-key').expect(404);
    await request(app)
      .post(`/api/v1/orders/${owned.order._id}/cancel`)
      .set('Cookie', ownerCookies)
      .set('Idempotency-Key', 'cancel-invalid-reason')
      .send({ reason: '  ' })
      .expect(400);
    await request(app)
      .post(`/api/v1/orders/${owned.order._id}/cancel`)
      .set('Cookie', ownerCookies)
      .set('Idempotency-Key', 'cancel-extra-metadata')
      .send({ reason: 'Ordered the wrong item', metadata: { ignored: false } })
      .expect(400);

    await cancelOrder(ownerCookies, owned.order._id, 'cancel-fingerprint-key', 'Ordered the wrong item').expect(200);
    const mismatch = await cancelOrder(ownerCookies, owned.order._id, 'cancel-fingerprint-key', 'Changed reason').expect(409);
    expect(mismatch.body.message).toMatch(/idempotency/i);
    await cancelOrder(ownerCookies, owned.order._id, 'cancel-after-cancelled-key').expect(409);
    await request(app)
      .post(`/api/v1/orders/${owned.order._id}/cancel`)
      .set('Cookie', ownerCookies)
      .set('Idempotency-Key', 'cancel-long-reason')
      .send({ reason: 'a'.repeat(301) })
      .expect(400);

    for (const status of ['packed', 'shipped', 'delivered'] as const) {
      const ineligible = await checkoutOrder(ownerCookies, `cancel-${status}-checkout`);
      await Order.updateOne({ _id: ineligible.order._id }, { $set: { status, paymentStatus: 'paid' } });
      await cancelOrder(ownerCookies, ineligible.order._id, `cancel-${status}-key`).expect(409);
      expect((await Product.findById(ineligible.product._id))?.stock).toBe(6);
    }
  });
});
