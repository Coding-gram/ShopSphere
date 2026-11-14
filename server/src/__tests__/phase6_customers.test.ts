import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
async function createAdmin() { const user = await User.create({ name: 'Customer Admin', email: `customer-admin-${crypto.randomUUID()}@example.com`, password: 'AdminPassword123', role: 'admin' }); const login = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'AdminPassword123' }); return { user, cookies: login.headers['set-cookie'] as unknown as string[] }; }
async function customer(name: string, email: string) { return User.create({ name, email, password: 'Password123' }); }
beforeAll(setupTestDB); afterAll(teardownTestDB);
describe('Phase 6 customer management', () => {
  beforeEach(clearCollections);

  it('paginates allowlisted customer records and supplies account order summaries', async () => {
    const { cookies } = await createAdmin();
    const first = await customer('Asha Customer', 'asha.customer@example.com');
    await User.updateOne({ _id: first._id }, { $set: { phone: '9876543210' } });
    await customer('Bela Customer', 'bela.customer@example.com');
    await Order.create({ user: first._id, orderNumber: 'ORD-CUSTOMER-1', items: [{ product: first._id, name: 'Item', image: '', quantity: 1, price: 500 }], shippingAddress: { fullName: 'Asha', phone: '9876543210', street: 'Road', city: 'Pune', state: 'MH', pincode: '411001', country: 'India' }, subtotal: 500, shippingCost: 0, tax: 0, total: 500, status: 'paid', paymentStatus: 'paid', statusHistory: [{ status: 'paid', timestamp: new Date() }] });
    const list = await request(app).get('/api/v1/admin/customers?page=1&limit=1&search=asha').set('Cookie', cookies).expect(200);
    expect(list.body.data).toEqual([expect.objectContaining({ _id: first._id.toString(), email: 'asha.customer@example.com', orderSummary: { totalOrders: 1, paidOrderTotal: 500 } })]);
    expect(list.body.data[0]).not.toHaveProperty('password');
    expect(list.body.data[0]).not.toHaveProperty('phone');
    const detail = await request(app).get(`/api/v1/admin/customers/${first._id}`).set('Cookie', cookies).expect(200);
    expect(detail.body.data.orderSummary).toMatchObject({ totalOrders: 1, paidOrderTotal: 500 });
  });

  it('only permits an active admin to toggle customers, prevents role changes, and invalidates existing customer sessions', async () => {
    const { cookies } = await createAdmin();
    const target = await customer('Target Customer', 'target.customer@example.com');
    const targetLogin = await request(app).post('/api/v1/auth/login').send({ email: target.email, password: 'Password123' }).expect(200);
    await request(app).patch(`/api/v1/admin/customers/${target._id}/status`).set('Cookie', cookies).send({ isActive: false }).expect(200);
    expect((await User.findById(target._id))?.isActive).toBe(false);
    await request(app).get('/api/v1/cart').set('Cookie', targetLogin.headers['set-cookie']).expect(403);
    await request(app).patch(`/api/v1/admin/customers/${target._id}/status`).set('Cookie', cookies).send({ isActive: true, role: 'admin' }).expect(400);
    const { user: admin, cookies: adminCookies } = await createAdmin();
    await request(app).patch(`/api/v1/admin/customers/${admin._id}/status`).set('Cookie', adminCookies).send({ isActive: false }).expect(404);
  });
});
