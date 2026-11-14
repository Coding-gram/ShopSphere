import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app, clearCollections, setupTestDB, teardownTestDB } from './setup.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderAuditEvent } from '../models/OrderAuditEvent.js';
import { isTransactionUnsupportedError } from '../modules/checkout/checkout.service.js';

async function registerCustomer(email: string): Promise<string[]> {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Cart Customer', email, password: 'Password123' })
    .expect(201);

  return response.headers['set-cookie'] as unknown as string[];
}

async function createProduct(stock = 8, price = 1250) {
  const category = await Category.create({ name: `Category ${crypto.randomUUID()}` });
  return Product.create({
    name: `Product ${crypto.randomUUID()}`,
    description: 'A product used to verify secure cart behavior.',
    price,
    category: category._id,
    stock,
    sku: `SKU-${crypto.randomUUID()}`,
  });
}

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Phase 4 cart API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('rejects unauthenticated cart access', async () => {
    const response = await request(app).get('/api/v1/cart');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('persists added items and returns server-calculated totals', async () => {
    const cookies = await registerCustomer('cart-persistence@example.com');
    const product = await createProduct();

    const added = await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 2 })
      .expect(201);

    expect(added.body.data).toMatchObject({
      items: [
        {
          product: { _id: product._id.toString(), name: product.name },
          quantity: 2,
          price: 1250,
        },
      ],
      itemCount: 2,
      subtotal: 2500,
      total: 2500,
    });

    const reloaded = await request(app)
      .get('/api/v1/cart')
      .set('Cookie', cookies)
      .expect(200);

    expect(reloaded.body.data).toMatchObject({ itemCount: 2, subtotal: 2500, total: 2500 });
    expect(reloaded.body.data.items).toHaveLength(1);
  });

  it('updates and removes only the authenticated customer cart item', async () => {
    const cookies = await registerCustomer('cart-update@example.com');
    const product = await createProduct();

    const added = await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);
    const itemId = added.body.data.items[0]._id;

    const updated = await request(app)
      .patch(`/api/v1/cart/items/${itemId}`)
      .set('Cookie', cookies)
      .send({ quantity: 3 })
      .expect(200);
    expect(updated.body.data).toMatchObject({ itemCount: 3, subtotal: 3750 });

    const removed = await request(app)
      .delete(`/api/v1/cart/items/${itemId}`)
      .set('Cookie', cookies)
      .expect(200);
    expect(removed.body.data).toMatchObject({ itemCount: 0, subtotal: 0, total: 0, items: [] });
  });

  it('rejects quantities outside the policy and quantities above available stock', async () => {
    const cookies = await registerCustomer('cart-limits@example.com');
    const product = await createProduct(3);

    const zeroQuantity = await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 0 });
    expect(zeroQuantity.status).toBe(400);

    const policyLimit = await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 11 });
    expect(policyLimit.status).toBe(400);

    const stockLimit = await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 4 });
    expect(stockLimit.status).toBe(400);
    expect(stockLimit.body.message).toMatch(/insufficient stock/i);
  });
});

const addressInput = {
  fullName: 'Asha Sharma',
  phone: '9876543210',
  street: '42 Market Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  country: 'India',
};

describe('Phase 4 address API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('rejects unauthenticated address access', async () => {
    const response = await request(app).get('/api/v1/addresses');

    expect(response.status).toBe(401);
  });

  it('creates, updates, lists, and deletes customer addresses while maintaining a default', async () => {
    const cookies = await registerCustomer('addresses@example.com');

    const first = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', cookies)
      .send(addressInput)
      .expect(201);
    expect(first.body.data).toMatchObject({ ...addressInput, isDefault: true });

    const second = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', cookies)
      .send({ ...addressInput, street: '7 Lake View', isDefault: true })
      .expect(201);

    const list = await request(app)
      .get('/api/v1/addresses')
      .set('Cookie', cookies)
      .expect(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.data.filter((address: { isDefault: boolean }) => address.isDefault)).toHaveLength(1);
    expect(list.body.data.find((address: { _id: string }) => address._id === first.body.data._id).isDefault).toBe(false);

    const updated = await request(app)
      .put(`/api/v1/addresses/${second.body.data._id}`)
      .set('Cookie', cookies)
      .send({ ...addressInput, street: '9 New Street', isDefault: false })
      .expect(200);
    expect(updated.body.data.street).toBe('9 New Street');
    expect(updated.body.data.isDefault).toBe(true);

    await request(app)
      .delete(`/api/v1/addresses/${second.body.data._id}`)
      .set('Cookie', cookies)
      .expect(200);

    const afterDelete = await request(app)
      .get('/api/v1/addresses')
      .set('Cookie', cookies)
      .expect(200);
    expect(afterDelete.body.data).toMatchObject([{ _id: first.body.data._id, isDefault: true }]);
  });

  it('validates address input and prevents access to another customer address', async () => {
    const ownerCookies = await registerCustomer('address-owner@example.com');
    const otherCookies = await registerCustomer('address-other@example.com');

    const invalid = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', ownerCookies)
      .send({ ...addressInput, pincode: 'not-a-pincode' });
    expect(invalid.status).toBe(400);

    const created = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', ownerCookies)
      .send(addressInput)
      .expect(201);

    const otherUpdate = await request(app)
      .put(`/api/v1/addresses/${created.body.data._id}`)
      .set('Cookie', otherCookies)
      .send({ ...addressInput, city: 'Mumbai' });
    expect(otherUpdate.status).toBe(404);

    const otherDelete = await request(app)
      .delete(`/api/v1/addresses/${created.body.data._id}`)
      .set('Cookie', otherCookies);
    expect(otherDelete.status).toBe(404);
  });
});

describe('Phase 4 checkout API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('identifies standalone MongoDB transaction errors for checkout fallback', () => {
    const transactionError = Object.assign(
      new Error('Transaction numbers are only allowed on a replica set member or mongos'),
      { code: 20 },
    );

    expect(isTransactionUnsupportedError(transactionError)).toBe(true);
    expect(isTransactionUnsupportedError(new Error('A different database error'))).toBe(false);
  });

  it('places an order when the connected MongoDB does not support transactions', async () => {
    const cookies = await registerCustomer('checkout-standalone@example.com');
    const product = await createProduct(3, 900);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);
    const address = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', cookies)
      .send(addressInput)
      .expect(201);

    const session = {
      endSession: vi.fn().mockResolvedValue(undefined),
      withTransaction: vi.fn().mockRejectedValue(
        Object.assign(
          new Error('Transaction numbers are only allowed on a replica set member or mongos'),
          { code: 20 },
        ),
      ),
    } as unknown as mongoose.ClientSession;
    const startSession = vi.spyOn(mongoose, 'startSession').mockResolvedValue(session);

    try {
      const placed = await request(app)
        .post('/api/v1/checkout')
        .set('Cookie', cookies)
        .set('Idempotency-Key', 'checkout-standalone')
        .send({ addressId: address.body.data._id })
        .expect(201);

      expect(placed.body.data).toMatchObject({
        total: 900,
        status: 'placed',
        items: [{ product: product._id.toString(), quantity: 1, price: 900 }],
      });
      expect(session.withTransaction).toHaveBeenCalledOnce();
    } finally {
      startSession.mockRestore();
    }
  });

  it('restores stock if standalone checkout cannot reserve every cart item', async () => {
    const cookies = await registerCustomer('checkout-standalone-stock@example.com');
    const firstProduct = await createProduct(3, 900);
    const secondProduct = await createProduct(1, 1200);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: firstProduct._id.toString(), quantity: 1 })
      .expect(201);
    await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: secondProduct._id.toString(), quantity: 1 })
      .expect(201);
    const address = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', cookies)
      .send(addressInput)
      .expect(201);

    secondProduct.stock = 0;
    await secondProduct.save();

    const session = {
      endSession: vi.fn().mockResolvedValue(undefined),
      withTransaction: vi.fn().mockRejectedValue(
        Object.assign(
          new Error('Transaction numbers are only allowed on a replica set member or mongos'),
          { code: 20 },
        ),
      ),
    } as unknown as mongoose.ClientSession;
    const startSession = vi.spyOn(mongoose, 'startSession').mockResolvedValue(session);

    try {
      await request(app)
        .post('/api/v1/checkout')
        .set('Cookie', cookies)
        .set('Idempotency-Key', 'checkout-standalone-stock')
        .send({ addressId: address.body.data._id })
        .expect(409);

      expect((await Product.findById(firstProduct._id))?.stock).toBe(3);
      expect(await Order.countDocuments()).toBe(0);
    } finally {
      startSession.mockRestore();
    }
  });

  it('rejects unauthenticated checkout', async () => {
    const response = await request(app).post('/api/v1/checkout').send({ addressId: 'a'.repeat(24) });

    expect(response.status).toBe(401);
  });

  it('rejects client supplied totals and creates an order from the current product price', async () => {
    const cookies = await registerCustomer('checkout-price@example.com');
    const product = await createProduct(4, 1000);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 2 })
      .expect(201);
    const address = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', cookies)
      .send(addressInput)
      .expect(201);

    const rejectedTotal = await request(app)
      .post('/api/v1/checkout')
      .set('Cookie', cookies)
      .set('Idempotency-Key', 'checkout-price-invalid')
      .send({ addressId: address.body.data._id, total: 1 });
    expect(rejectedTotal.status).toBe(400);

    product.price = 1200;
    await product.save();

    const placed = await request(app)
      .post('/api/v1/checkout')
      .set('Cookie', cookies)
      .set('Idempotency-Key', 'checkout-price-order')
      .send({ addressId: address.body.data._id });
    expect(placed.status).toBe(201);

    expect(placed.body.data).toMatchObject({
      subtotal: 2400,
      total: 2400,
      status: 'placed',
      paymentStatus: 'pending',
      statusHistory: [expect.objectContaining({ status: 'placed' })],
      items: [{ product: product._id.toString(), quantity: 2, price: 1200 }],
      shippingAddress: addressInput,
    });
    expect(placed.body.data.orderNumber).toMatch(/^ORD-/);

    const persistedOrder = await Order.findOne({ orderNumber: placed.body.data.orderNumber });
    expect(persistedOrder?.subtotal).toBe(2400);
    expect(persistedOrder?.items[0].price).toBe(1200);
    expect(await OrderAuditEvent.find({ order: persistedOrder?._id }).lean()).toMatchObject([
      { actorType: 'system', eventType: 'order_placed', toStatus: 'placed' },
    ]);

    const cart = await request(app).get('/api/v1/cart').set('Cookie', cookies).expect(200);
    expect(cart.body.data).toMatchObject({ items: [], itemCount: 0, total: 0 });
    const remainingProduct = await Product.findById(product._id);
    expect(remainingProduct?.stock).toBe(2);
  });

  it('rejects stale stock without creating an order or clearing the cart', async () => {
    const cookies = await registerCustomer('checkout-stock@example.com');
    const product = await createProduct(2, 1000);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', cookies)
      .send({ productId: product._id.toString(), quantity: 2 })
      .expect(201);
    const address = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', cookies)
      .send(addressInput)
      .expect(201);

    product.stock = 1;
    await product.save();

    const response = await request(app)
      .post('/api/v1/checkout')
      .set('Cookie', cookies)
      .set('Idempotency-Key', 'checkout-stale-stock')
      .send({ addressId: address.body.data._id });

    expect(response.status).toBe(409);
    expect(await Order.countDocuments()).toBe(0);
    const cart = await request(app).get('/api/v1/cart').set('Cookie', cookies).expect(200);
    expect(cart.body.data.itemCount).toBe(2);
  });

  it('does not accept another customer delivery address', async () => {
    const customerCookies = await registerCustomer('checkout-customer@example.com');
    const addressOwnerCookies = await registerCustomer('checkout-address-owner@example.com');
    const product = await createProduct();

    await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', customerCookies)
      .send({ productId: product._id.toString(), quantity: 1 })
      .expect(201);
    const address = await request(app)
      .post('/api/v1/addresses')
      .set('Cookie', addressOwnerCookies)
      .send(addressInput)
      .expect(201);

    const response = await request(app)
      .post('/api/v1/checkout')
      .set('Cookie', customerCookies)
      .set('Idempotency-Key', 'checkout-foreign-address')
      .send({ addressId: address.body.data._id });

    expect(response.status).toBe(404);
    expect(await Order.countDocuments()).toBe(0);
  });
});
