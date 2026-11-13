import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { OrderAuditEvent } from '../models/OrderAuditEvent.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

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

async function createAdmin(email = `admin-${crypto.randomUUID()}@example.com`) {
  const admin = await User.create({
    name: 'Order Administrator',
    email,
    password: 'AdminPassword123',
    role: 'admin',
  });
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'AdminPassword123' })
    .expect(200);
  return { admin, cookies: response.headers['set-cookie'] as unknown as string[] };
}

async function createOrder(email: string, checkoutKey: string) {
  const cookies = await registerCustomer(email);
  const category = await Category.create({ name: `Category ${crypto.randomUUID()}` });
  const product = await Product.create({
    name: `Order product ${crypto.randomUUID()}`,
    description: 'A product used to test the admin order management flow.',
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
    .set('Idempotency-Key', checkoutKey)
    .send({ addressId: address.body.data._id })
    .expect(201);

  return { cookies, product, order: order.body.data };
}

function transition(adminCookies: string[], orderId: string, status: 'packed' | 'shipped' | 'delivered', note?: string) {
  return request(app)
    .patch(`/api/v1/admin/orders/${orderId}/status`)
    .set('Cookie', adminCookies)
    .send({ status, ...(note ? { note } : {}) });
}

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Phase 5.4 admin order access', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('lists filtered orders with pagination and returns an allowlisted admin detail view', async () => {
    const { cookies: adminCookies } = await createAdmin();
    const first = await createOrder('alice.orders@example.com', 'admin-list-first');
    const second = await createOrder('beena.orders@example.com', 'admin-list-second');
    await Order.updateOne({ _id: second.order._id }, { $set: { status: 'paid', paymentStatus: 'paid' } });
    await Order.collection.updateOne({ _id: new mongoose.Types.ObjectId(first.order._id) }, { $set: { createdAt: new Date('2026-01-01T12:00:00.000Z') } });
    await Order.collection.updateOne({ _id: new mongoose.Types.ObjectId(second.order._id) }, { $set: { createdAt: new Date('2026-02-01T12:00:00.000Z') } });
    expect((await Order.findById(second.order._id))?.createdAt.toISOString()).toBe('2026-02-01T12:00:00.000Z');

    const list = await request(app)
      .get('/api/v1/admin/orders?page=1&limit=1&status=paid&paymentStatus=paid&search=beena.orders@example.com')
      .set('Cookie', adminCookies)
      .expect(200);

    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0]).toMatchObject({
      _id: second.order._id,
      status: 'paid',
      paymentStatus: 'paid',
      customer: { email: 'beena.orders@example.com', name: 'Order Customer' },
    });
    expect(list.body.pagination).toMatchObject({ page: 1, limit: 1, total: 1, totalPages: 1, hasMore: false });

    const detail = await request(app).get(`/api/v1/admin/orders/${first.order._id}`).set('Cookie', adminCookies).expect(200);
    expect(detail.body.data).toMatchObject({
      _id: first.order._id,
      customer: { email: 'alice.orders@example.com', name: 'Order Customer' },
      items: [{ quantity: 2, price: 1250 }],
      shippingAddress: addressInput,
    });
    expect(detail.body.data.customer).not.toHaveProperty('password');
    expect(detail.body.data).not.toHaveProperty('paymentAttempts');

    const byDate = await request(app)
      .get('/api/v1/admin/orders?dateFrom=2026-02-01&dateTo=2026-02-01')
      .set('Cookie', adminCookies)
      .expect(200);
    expect(byDate.body.data.map((order: { _id: string }) => order._id)).toEqual([second.order._id]);
  });

  it('rejects unauthenticated and customer access to every admin order endpoint', async () => {
    const customer = await createOrder('customer-blocked@example.com', 'admin-blocked-order');

    await request(app).get('/api/v1/admin/orders').expect(401);
    await request(app).get('/api/v1/admin/orders').set('Cookie', customer.cookies).expect(403);
    await request(app).get(`/api/v1/admin/orders/${customer.order._id}`).set('Cookie', customer.cookies).expect(403);
    await transition(customer.cookies, customer.order._id, 'packed').expect(403);

    const { cookies: adminCookies } = await createAdmin();
    await request(app)
      .get('/api/v1/admin/orders?dateFrom=2026-02-30')
      .set('Cookie', adminCookies)
      .expect(400);
    await request(app)
      .get('/api/v1/admin/orders?includePaymentAttempts=true')
      .set('Cookie', adminCookies)
      .expect(400);
  });
});

describe('Phase 5.4 admin lifecycle transitions', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('requires an active admin, advances only the canonical lifecycle, and creates an immutable audit event', async () => {
    const { admin, cookies: adminCookies } = await createAdmin();
    const customer = await createOrder('transition-customer@example.com', 'admin-transition-order');
    await request(app)
      .post(`/api/v1/orders/${customer.order._id}/payments`)
      .set('Cookie', customer.cookies)
      .set('Idempotency-Key', 'admin-transition-payment')
      .send({ outcome: 'success' })
      .expect(200);

    const packed = await transition(adminCookies, customer.order._id, 'packed', 'Ready for dispatch').expect(200);
    expect(packed.body.data).toMatchObject({ status: 'packed', paymentStatus: 'paid' });
    expect(await OrderAuditEvent.find({ order: customer.order._id, eventType: 'order_status_changed' }).lean())
      .toMatchObject([{
        actorType: 'admin',
        actorId: admin._id,
        eventType: 'order_status_changed',
        fromStatus: 'paid',
        toStatus: 'packed',
        note: 'Ready for dispatch',
      }]);

    await transition(adminCookies, customer.order._id, 'delivered').expect(409);
    await transition(adminCookies, customer.order._id, 'shipped').expect(200);
    await transition(adminCookies, customer.order._id, 'delivered').expect(200);

    const inactive = await createAdmin('inactive-admin@example.com');
    await User.updateOne({ _id: inactive.admin._id }, { $set: { isActive: false } });
    const other = await createOrder('inactive-admin-customer@example.com', 'inactive-admin-order');
    await request(app)
      .post(`/api/v1/orders/${other.order._id}/payments`)
      .set('Cookie', other.cookies)
      .set('Idempotency-Key', 'inactive-admin-payment')
      .send({ outcome: 'success' })
      .expect(200);
    await transition(inactive.cookies, other.order._id, 'packed').expect(403);
    expect((await Order.findById(other.order._id))?.status).toBe('paid');
  });

  it('serializes competing status changes and rejects invalid input without mutating the order', async () => {
    const { cookies: adminCookies } = await createAdmin();
    const customer = await createOrder('concurrent-transition@example.com', 'concurrent-transition-order');
    await request(app)
      .post(`/api/v1/orders/${customer.order._id}/payments`)
      .set('Cookie', customer.cookies)
      .set('Idempotency-Key', 'concurrent-transition-payment')
      .send({ outcome: 'success' })
      .expect(200);

    const responses = await Promise.all([
      transition(adminCookies, customer.order._id, 'packed', 'Pick complete'),
      transition(adminCookies, customer.order._id, 'shipped', 'Ship immediately'),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect((await Order.findById(customer.order._id))?.status).toBe('packed');
    expect(await OrderAuditEvent.countDocuments({ order: customer.order._id, eventType: 'order_status_changed' })).toBe(1);

    await request(app)
      .patch(`/api/v1/admin/orders/${customer.order._id}/status`)
      .set('Cookie', adminCookies)
      .send({ status: 'paid', paymentStatus: 'refunded' })
      .expect(400);
    await request(app)
      .patch(`/api/v1/admin/orders/${customer.order._id}/status`)
      .set('Cookie', adminCookies)
      .send({ status: 'shipped', note: 'a'.repeat(301) })
      .expect(400);
    expect((await Order.findById(customer.order._id))?.status).toBe('packed');
  });
});
