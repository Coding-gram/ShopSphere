import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { InventoryAdjustment } from '../models/InventoryAdjustment.js';
async function admin() { const user = await User.create({ name: 'Inventory Admin', email: `inventory-${crypto.randomUUID()}@example.com`, password: 'AdminPassword123', role: 'admin' }); const login = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'AdminPassword123' }); return { user, cookies: login.headers['set-cookie'] as unknown as string[] }; }
beforeAll(setupTestDB); afterAll(teardownTestDB);
describe('Phase 6 inventory adjustments', () => {
  beforeEach(clearCollections);

  it('atomically records a bounded stock adjustment and rejects negative stock', async () => {
    const { user, cookies } = await admin();
    const category = await Category.create({ name: 'Inventory' });
    const product = await Product.create({ name: 'Inventory item', description: 'Product used for transactional inventory adjustment tests.', price: 100, category: category._id, stock: 4, sku: 'INV-1' });
    const success = await request(app).post(`/api/v1/admin/inventory/${product._id}/adjustments`).set('Cookie', cookies).send({ delta: -3, reason: 'Cycle count correction' }).expect(200);
    expect(success.body.data.stock).toBe(1);
    expect(await InventoryAdjustment.findOne({ product: product._id }).lean()).toMatchObject({ actor: user._id, previousQuantity: 4, newQuantity: 1, delta: -3, reason: 'Cycle count correction' });
    await request(app).post(`/api/v1/admin/inventory/${product._id}/adjustments`).set('Cookie', cookies).send({ delta: -2, reason: 'Cannot oversell' }).expect(409);
    expect((await Product.findById(product._id))?.stock).toBe(1);
  });

  it('rejects direct stock edits so every post-creation change is auditable', async () => {
    const { cookies } = await admin();
    const category = await Category.create({ name: 'Inventory catalog' });
    const product = await Product.create({ name: 'Inventory edit item', description: 'Product used to verify direct stock edits cannot bypass inventory audit.', price: 100, category: category._id, stock: 4, sku: 'INV-EDIT-1' });
    await request(app).put(`/api/v1/admin/products/${product._id}`).set('Cookie', cookies).send({ stock: 2 }).expect(400);
    expect((await Product.findById(product._id))?.stock).toBe(4);
    expect(await InventoryAdjustment.countDocuments({ product: product._id })).toBe(0);
  });
});
