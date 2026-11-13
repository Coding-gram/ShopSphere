import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderAuditEvent } from '../models/OrderAuditEvent.js';
import { PaymentAttempt } from '../models/PaymentAttempt.js';

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
    .send({ name: 'Payment Customer', email, password: 'Password123' })
    .expect(201);

  return response.headers['set-cookie'] as unknown as string[];
}

async function createProduct(stock = 6, price = 1250) {
  const category = await Category.create({ name: `Category ${crypto.randomUUID()}` });
  return Product.create({
    name: `Product ${crypto.randomUUID()}`,
    description: 'A product used to verify payment behavior.',
    price,
    category: category._id,
    stock,
    sku: `SKU-${crypto.randomUUID()}`,
  });
}

async function createCheckoutFixture(email: string, quantity = 2, stock = 6) {
  const cookies = await registerCustomer(email);
  const product = await createProduct(stock);

  await request(app)
    .post('/api/v1/cart/items')
    .set('Cookie', cookies)
    .send({ productId: product._id.toString(), quantity })
    .expect(201);

  const address = await request(app)
    .post('/api/v1/addresses')
    .set('Cookie', cookies)
    .send(addressInput)
    .expect(201);

  return { cookies, product, addressId: address.body.data._id as string };
}

function checkout(cookies: string[], addressId: string, idempotencyKey: string) {
  return request(app)
    .post('/api/v1/checkout')
    .set('Cookie', cookies)
    .set('Idempotency-Key', idempotencyKey)
    .send({ addressId });
}

function pay(cookies: string[], orderId: string, idempotencyKey: string, outcome: 'success' | 'failure') {
  return request(app)
    .post(`/api/v1/orders/${orderId}/payments`)
    .set('Cookie', cookies)
    .set('Idempotency-Key', idempotencyKey)
    .send({ outcome });
}

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Phase 5.2 idempotent checkout API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('replays an identical checkout key without creating a second order or decrementing stock twice', async () => {
    const fixture = await createCheckoutFixture('checkout-replay@example.com');

    const first = await checkout(fixture.cookies, fixture.addressId, 'checkout-replay-key').expect(201);
    const replay = await checkout(fixture.cookies, fixture.addressId, 'checkout-replay-key').expect(200);

    expect(replay.body.data._id).toBe(first.body.data._id);
    expect(await Order.countDocuments()).toBe(1);
    expect((await Product.findById(fixture.product._id))?.stock).toBe(4);
  });

  it('rejects a checkout key reused with a different request fingerprint', async () => {
    const fixture = await createCheckoutFixture('checkout-fingerprint@example.com');
    const secondAddress = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', fixture.cookies)
      .send({ ...addressInput, street: '9 Different Street' })
      .expect(201);

    await checkout(fixture.cookies, fixture.addressId, 'checkout-fingerprint-key').expect(201);
    const mismatch = await checkout(
      fixture.cookies,
      secondAddress.body.data._id,
      'checkout-fingerprint-key',
    ).expect(409);

    expect(mismatch.body.message).toMatch(/idempotency/i);
    expect(await Order.countDocuments()).toBe(1);
    expect((await Product.findById(fixture.product._id))?.stock).toBe(4);
  });

  it('serializes concurrent duplicate checkout requests', async () => {
    const fixture = await createCheckoutFixture('checkout-concurrent@example.com');

    const responses = await Promise.all([
      checkout(fixture.cookies, fixture.addressId, 'checkout-concurrent-key'),
      checkout(fixture.cookies, fixture.addressId, 'checkout-concurrent-key'),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 201]);
    expect(responses[0].body.data._id).toBe(responses[1].body.data._id);
    expect(await Order.countDocuments()).toBe(1);
    expect((await Product.findById(fixture.product._id))?.stock).toBe(4);
  });
});

describe('Phase 5.2 simulated payment API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('uses the persisted order total, marks a successful payment paid, and audits the transition', async () => {
    const fixture = await createCheckoutFixture('payment-success@example.com');
    const order = await checkout(fixture.cookies, fixture.addressId, 'payment-success-checkout').expect(201);

    const payment = await pay(fixture.cookies, order.body.data._id, 'payment-success-key', 'success').expect(200);

    expect(payment.body.data).toMatchObject({
      replayed: false,
      order: { _id: order.body.data._id, status: 'paid', paymentStatus: 'paid' },
      paymentAttempt: { status: 'succeeded', amount: 2500, currency: 'INR' },
    });
    expect(await Order.findById(order.body.data._id).lean()).toMatchObject({ status: 'paid', paymentStatus: 'paid' });
    expect((await Product.findById(fixture.product._id))?.stock).toBe(4);
    expect((await OrderAuditEvent.find({ order: order.body.data._id }).sort({ createdAt: 1 }).lean()).map((event) => event.eventType))
      .toEqual(['order_placed', 'payment_attempted', 'payment_succeeded']);
  });

  it('records a failed payment, allows a new-key retry, and replays the original failure', async () => {
    const fixture = await createCheckoutFixture('payment-retry@example.com');
    const order = await checkout(fixture.cookies, fixture.addressId, 'payment-retry-checkout').expect(201);

    const failed = await pay(fixture.cookies, order.body.data._id, 'payment-failure-key', 'failure').expect(200);
    expect(failed.body.data).toMatchObject({
      order: { status: 'placed', paymentStatus: 'failed' },
      paymentAttempt: { status: 'failed', failureCode: 'SIMULATED_DECLINED' },
    });

    const replay = await pay(fixture.cookies, order.body.data._id, 'payment-failure-key', 'failure').expect(200);
    expect(replay.body.data).toMatchObject({ replayed: true, paymentAttempt: { _id: failed.body.data.paymentAttempt._id, status: 'failed' } });

    const mismatch = await pay(fixture.cookies, order.body.data._id, 'payment-failure-key', 'success').expect(409);
    expect(mismatch.body.message).toMatch(/idempotency/i);

    await pay(fixture.cookies, order.body.data._id, 'payment-retry-success-key', 'success').expect(200);
    expect(await Order.findById(order.body.data._id).lean()).toMatchObject({ status: 'paid', paymentStatus: 'paid' });
    expect(await PaymentAttempt.countDocuments({ order: order.body.data._id })).toBe(2);
    expect((await Product.findById(fixture.product._id))?.stock).toBe(4);
    expect((await OrderAuditEvent.find({ order: order.body.data._id }).sort({ createdAt: 1 }).lean()).map((event) => event.eventType))
      .toEqual(['order_placed', 'payment_attempted', 'payment_failed', 'payment_attempted', 'payment_succeeded']);
  });

  it('allows only one concurrent payment attempt to transition a placed order', async () => {
    const fixture = await createCheckoutFixture('payment-concurrent@example.com');
    const order = await checkout(fixture.cookies, fixture.addressId, 'payment-concurrent-checkout').expect(201);

    const responses = await Promise.all([
      pay(fixture.cookies, order.body.data._id, 'payment-concurrent-a', 'success'),
      pay(fixture.cookies, order.body.data._id, 'payment-concurrent-b', 'success'),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect(await PaymentAttempt.countDocuments({ order: order.body.data._id })).toBe(1);
    expect(await Order.findById(order.body.data._id).lean()).toMatchObject({ status: 'paid', paymentStatus: 'paid' });
    expect((await OrderAuditEvent.find({ order: order.body.data._id, eventType: 'payment_succeeded' }).lean())).toHaveLength(1);
  });

  it('replays concurrent duplicate payment keys without recording a second attempt', async () => {
    const fixture = await createCheckoutFixture('payment-duplicate-concurrent@example.com');
    const order = await checkout(fixture.cookies, fixture.addressId, 'payment-duplicate-concurrent-checkout').expect(201);

    const responses = await Promise.all([
      pay(fixture.cookies, order.body.data._id, 'payment-duplicate-concurrent-key', 'success'),
      pay(fixture.cookies, order.body.data._id, 'payment-duplicate-concurrent-key', 'success'),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 200]);
    expect(responses[0].body.data.paymentAttempt._id).toBe(responses[1].body.data.paymentAttempt._id);
    expect(await PaymentAttempt.countDocuments({ order: order.body.data._id })).toBe(1);
  });

  it('requires authentication, ownership, idempotency keys, strict input, and a placed order', async () => {
    const fixture = await createCheckoutFixture('payment-owner@example.com');
    const order = await checkout(fixture.cookies, fixture.addressId, 'payment-owner-checkout').expect(201);
    const otherCookies = await registerCustomer('payment-other@example.com');

    await request(app).post(`/api/v1/orders/${order.body.data._id}/payments`).send({ outcome: 'success' }).expect(401);
    await pay(otherCookies, order.body.data._id, 'payment-other-key', 'success').expect(404);
    await request(app)
      .post(`/api/v1/orders/${order.body.data._id}/payments`)
      .set('Cookie', fixture.cookies)
      .send({ outcome: 'success' })
      .expect(400);
    await request(app)
      .post(`/api/v1/orders/${order.body.data._id}/payments`)
      .set('Cookie', fixture.cookies)
      .set('Idempotency-Key', 'payment-extra-amount')
      .send({ outcome: 'success', amount: 1 })
      .expect(400);
    await request(app)
      .post(`/api/v1/orders/${order.body.data._id}/payments`)
      .set('Cookie', fixture.cookies)
      .set('Idempotency-Key', 'payment-invalid-outcome')
      .send({ outcome: 'unexpected' })
      .expect(400);

    await Order.updateOne({ _id: order.body.data._id }, { $set: { status: 'packed', paymentStatus: 'paid' } });
    await pay(fixture.cookies, order.body.data._id, 'payment-invalid-state', 'success').expect(409);
    expect(await PaymentAttempt.countDocuments({ order: order.body.data._id })).toBe(0);
  });
});
