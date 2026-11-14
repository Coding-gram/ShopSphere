import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

async function adminSession() {
  const user = await User.create({ name: 'Catalog Admin', email: `catalog-admin-${crypto.randomUUID()}@example.com`, password: 'AdminPassword123', role: 'admin' });
  const login = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'AdminPassword123' }).expect(200);
  return { user, cookies: login.headers['set-cookie'] as unknown as string[] };
}

beforeAll(setupTestDB);
afterAll(teardownTestDB);

describe('Phase 6 admin catalog', () => {
  beforeEach(clearCollections);

  it('lists active and inactive products, and supports validated admin product lifecycle actions', async () => {
    const { cookies } = await adminSession();
    const category = await Category.create({ name: 'Catalog' });
    const inactive = await Product.create({ name: 'Inactive catalog item', description: 'An inactive product for the administrative catalog listing.', price: 500, category: category._id, stock: 4, sku: 'INACTIVE-1', isActive: false });
    const created = await request(app).post('/api/v1/admin/products').set('Cookie', cookies).send({ name: 'Managed Product', description: 'A product created through the administrative catalog endpoint.', price: 1200, category: category._id.toString(), stock: 5, sku: 'MANAGED-1', images: ['https://images.example.com/managed.jpg'] }).expect(201);
    expect(created.body.data.stock).toBe(5);
    const list = await request(app).get('/api/v1/admin/products?search=catalog&isActive=false').set('Cookie', cookies).expect(200);
    expect(list.body.data).toEqual([expect.objectContaining({ _id: inactive._id.toString(), isActive: false })]);
    await request(app).put(`/api/v1/admin/products/${created.body.data._id}`).set('Cookie', cookies).send({ price: 1300, images: ['https://images.example.com/changed.jpg'] }).expect(200);
    await request(app).delete(`/api/v1/admin/products/${created.body.data._id}`).set('Cookie', cookies).expect(200);
    expect((await Product.findById(created.body.data._id))?.isActive).toBe(false);
  });

  it('prevents customer and inactive-admin catalog changes', async () => {
    await request(app).get('/api/v1/admin/products').expect(401);
    const customer = await User.create({ name: 'Customer', email: 'catalog-customer@example.com', password: 'Password123' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: customer.email, password: 'Password123' }).expect(200);
    await request(app).get('/api/v1/admin/products').set('Cookie', login.headers['set-cookie']).expect(403);
    const { user, cookies } = await adminSession();
    await User.updateOne({ _id: user._id }, { $set: { isActive: false } });
    await request(app).post('/api/v1/admin/products').set('Cookie', cookies).send({}).expect(403);
  });

  it('manages categories while preserving parent and deletion safeguards', async () => {
    const { cookies } = await adminSession();
    const parent = await request(app).post('/api/v1/admin/categories').set('Cookie', cookies).send({ name: 'Parent category' }).expect(201);
    const child = await request(app).post('/api/v1/admin/categories').set('Cookie', cookies).send({ name: 'Child category', parent: parent.body.data._id }).expect(201);
    const list = await request(app).get('/api/v1/admin/categories').set('Cookie', cookies).expect(200);
    expect(list.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: child.body.data._id, parent: parent.body.data._id })]));
    await request(app).delete(`/api/v1/admin/categories/${parent.body.data._id}`).set('Cookie', cookies).expect(400);
    await request(app).put(`/api/v1/admin/categories/${child.body.data._id}`).set('Cookie', cookies).send({ name: 'Renamed child' }).expect(200);
  });
});
