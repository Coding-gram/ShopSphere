import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

async function signInAdmin() {
  const admin = await User.create({
    name: 'Dashboard Administrator',
    email: 'dashboard-admin@example.com',
    password: 'AdminPassword123',
    role: 'admin',
  });
  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: admin.email, password: 'AdminPassword123' })
    .expect(200);
  return login.headers['set-cookie'] as unknown as string[];
}

async function createOrder(input: { status: 'placed' | 'paid' | 'cancelled'; paymentStatus: 'pending' | 'paid'; total: number; createdAt: Date }) {
  const customer = await User.create({
    name: `Customer ${crypto.randomUUID()}`,
    email: `customer-${crypto.randomUUID()}@example.com`,
    password: 'Password123',
  });
  const order = await Order.create({
    user: customer._id,
    orderNumber: `ORD-${crypto.randomUUID()}`,
    items: [{ product: customer._id, name: 'Snapshot item', image: '', quantity: 1, price: input.total }],
    shippingAddress: { fullName: 'Customer', phone: '9876543210', street: '1 Market Street', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    subtotal: input.total,
    shippingCost: 0,
    tax: 0,
    total: input.total,
    status: input.status,
    paymentStatus: input.paymentStatus,
    statusHistory: [{ status: input.status, timestamp: input.createdAt }],
  });
  await Order.collection.updateOne({ _id: order._id }, { $set: { createdAt: input.createdAt, updatedAt: input.createdAt } });
  return order;
}

beforeAll(setupTestDB);
afterAll(teardownTestDB);

describe('Phase 6 dashboard reporting', () => {
  beforeEach(clearCollections);

  it('returns server-derived sales metrics, order status counts, and recent orders for an administrator', async () => {
    const cookies = await signInAdmin();
    const paid = await createOrder({ status: 'paid', paymentStatus: 'paid', total: 1200, createdAt: new Date('2026-11-10T12:00:00.000Z') });
    await createOrder({ status: 'placed', paymentStatus: 'pending', total: 850, createdAt: new Date('2026-11-11T12:00:00.000Z') });
    await createOrder({ status: 'cancelled', paymentStatus: 'paid', total: 999, createdAt: new Date('2026-11-12T12:00:00.000Z') });

    const response = await request(app)
      .get('/api/v1/admin/dashboard?dateFrom=2026-11-01&dateTo=2026-11-30')
      .set('Cookie', cookies)
      .expect(200);

    expect(response.body.data.metrics).toMatchObject({ totalOrders: 3, paidOrders: 1, revenue: 1200, averageOrderValue: 1200 });
    expect(response.body.data.statusCounts).toMatchObject({ paid: 1, placed: 1, cancelled: 1 });
    expect(response.body.data.recentOrders).toEqual(expect.arrayContaining([
      expect.objectContaining({ _id: paid._id.toString(), total: 1200, customer: expect.objectContaining({ email: expect.stringContaining('@example.com') }) }),
    ]));
  });

  it('rejects anonymous and customer reporting access and validates a date range', async () => {
    await request(app).get('/api/v1/admin/dashboard').expect(401);
    const customer = await User.create({ name: 'Customer', email: 'customer@example.com', password: 'Password123' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: customer.email, password: 'Password123' }).expect(200);
    await request(app).get('/api/v1/admin/dashboard').set('Cookie', login.headers['set-cookie']).expect(403);
    const cookies = await signInAdmin();
    await request(app).get('/api/v1/admin/dashboard?dateFrom=2026-12-01&dateTo=2026-11-01').set('Cookie', cookies).expect(400);
  });
});
