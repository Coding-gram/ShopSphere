import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupTestDB, teardownTestDB, clearCollections, app } from './setup.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Register a user and return cookies for authenticated requests */
async function registerAndLogin(
  data: { name: string; email: string; password: string },
): Promise<string[]> {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(data)
    .expect(201);
  return res.headers['set-cookie'] as unknown as string[];
}

async function loginUser(
  email: string,
  password: string,
): Promise<string[]> {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);
  return res.headers['set-cookie'] as unknown as string[];
}

async function createAdminUser(): Promise<string[]> {
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'Admin@123456',
    role: 'admin',
  });
  return loginUser('admin@test.com', 'Admin@123456');
}

async function seedCategory(name: string, adminCookies: string[]): Promise<string> {
  const res = await request(app)
    .post('/api/v1/categories')
    .set('Cookie', adminCookies)
    .send({ name, description: `${name} description` })
    .expect(201);
  return res.body.data._id;
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

// ═══════════════════════════════════════════════════════════════════════════
// A. Health Check
// ═══════════════════════════════════════════════════════════════════════════

describe('Health Check', () => {
  it('GET /api/v1/health returns 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, status: 'ok' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// B. Authentication API
// ═══════════════════════════════════════════════════════════════════════════

describe('Auth API', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  // ── Registration ──────────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('B1: registers a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'Test@12345' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      });
      // Sets auth cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(String(cookies)).toContain('token=');
    });

    it('B2: rejects duplicate email registration', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'User A', email: 'dup@example.com', password: 'Password123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'User B', email: 'dup@example.com', password: 'Password456' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('B10: registration cannot assign admin role (ignores role field)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Sneaky Admin',
          email: 'sneaky@example.com',
          password: 'Password123',
          role: 'admin',
        });

      expect(res.status).toBe(201);
      // Role should always be 'customer' regardless of what was sent
      expect(res.body.data.role).toBe('customer');

      // Verify in DB as well
      const user = await User.findOne({ email: 'sneaky@example.com' });
      expect(user?.role).toBe('customer');
    });

    it('B-V1: rejects registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('B-V2: rejects registration with short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: '12' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('B-V3: rejects registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Correct@123',
        role: 'customer',
      });
    });

    it('B3: logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'Correct@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('login@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('B4: rejects login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('B4b: rejects login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'Whatever123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Current User ──────────────────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    it('B5: returns current user when authenticated', async () => {
      const cookies = await registerAndLogin({
        name: 'Me User',
        email: 'me@example.com',
        password: 'Password123',
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('me@example.com');
      expect(res.body.data.name).toBe('Me User');
    });

    it('B6: returns 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('E2: password never appears in response', async () => {
      const cookies = await registerAndLogin({
        name: 'Secure User',
        email: 'secure@example.com',
        password: 'Password123',
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.password).toBeUndefined();
    });
  });

  // ── Profile Update ────────────────────────────────────────────────────

  describe('PUT /api/v1/auth/me', () => {
    it('B7: updates user profile', async () => {
      const cookies = await registerAndLogin({
        name: 'Old Name',
        email: 'profile@example.com',
        password: 'Password123',
      });

      const res = await request(app)
        .put('/api/v1/auth/me')
        .set('Cookie', cookies)
        .send({ name: 'New Name', phone: '1234567890' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New Name');
      expect(res.body.data.phone).toBe('1234567890');
    });
  });

  // ── Change Password ───────────────────────────────────────────────────

  describe('PUT /api/v1/auth/change-password', () => {
    it('B8: changes password successfully', async () => {
      const cookies = await registerAndLogin({
        name: 'PW User',
        email: 'pw@example.com',
        password: 'OldPassword1',
      });

      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Cookie', cookies)
        .send({ currentPassword: 'OldPassword1', newPassword: 'NewPassword1' });

      expect(res.status).toBe(200);

      // Old password should no longer work
      const loginOld = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'pw@example.com', password: 'OldPassword1' });
      expect(loginOld.status).toBe(401);

      // New password should work
      const loginNew = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'pw@example.com', password: 'NewPassword1' });
      expect(loginNew.status).toBe(200);
    });

    it('B8b: rejects change with wrong current password', async () => {
      const cookies = await registerAndLogin({
        name: 'PW User2',
        email: 'pw2@example.com',
        password: 'Correct123',
      });

      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Cookie', cookies)
        .send({ currentPassword: 'Wrong123456', newPassword: 'NewPass123' });

      expect(res.status).toBe(400);
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    it('B9: logs out and auth no longer works', async () => {
      const cookies = await registerAndLogin({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'Password123',
      });

      // Verify authenticated first
      const beforeLogout = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookies);
      expect(beforeLogout.status).toBe(200);

      // Logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookies);
      expect(logoutRes.status).toBe(200);

      // The logout response sets the cookie to empty — use those cookies
      const logoutCookies = logoutRes.headers['set-cookie'] as unknown as string[];

      const afterLogout = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', logoutCookies);
      expect(afterLogout.status).toBe(401);
    });
  });

  // ── Cookie Security ───────────────────────────────────────────────────

  describe('Cookie Configuration', () => {
    it('E4: auth cookie is httpOnly', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Cookie User', email: 'cookie@example.com', password: 'Password123' });

      const cookies = String(res.headers['set-cookie']);
      expect(cookies).toContain('HttpOnly');
    });

    it('E4b: auth cookie has proper path', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Path User', email: 'path@example.com', password: 'Password123' });

      const cookies = String(res.headers['set-cookie']);
      expect(cookies).toContain('Path=/');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// C. Product API
// ═══════════════════════════════════════════════════════════════════════════

describe('Product API', () => {
  let adminCookies: string[];
  let customerCookies: string[];
  let categoryId: string;

  beforeAll(async () => {
    await clearCollections();
    // Create admin
    adminCookies = await createAdminUser();
    // Create customer
    customerCookies = await registerAndLogin({
      name: 'Customer',
      email: 'customer@test.com',
      password: 'Customer123',
    });
    // Create a category
    categoryId = await seedCategory('Electronics', adminCookies);

    // Create test products
    const products = [
      {
        name: 'Product Alpha',
        description: 'Description for Alpha product for testing purposes here',
        price: 1000,
        compareAtPrice: 1500,
        category: categoryId,
        stock: 50,
        sku: 'TST-ALPHA-001',
        tags: ['alpha', 'test'],
        isFeatured: true,
      },
      {
        name: 'Product Beta',
        description: 'Description for Beta product for testing purposes here',
        price: 2000,
        category: categoryId,
        stock: 30,
        sku: 'TST-BETA-002',
        tags: ['beta', 'test'],
        isFeatured: true,
      },
      {
        name: 'Product Gamma',
        description: 'Description for Gamma product for testing purposes here',
        price: 500,
        category: categoryId,
        stock: 100,
        sku: 'TST-GAMMA-003',
        tags: ['gamma'],
        isFeatured: false,
      },
      {
        name: 'Product Delta',
        description: 'Description for Delta product for testing purposes here',
        price: 3000,
        category: categoryId,
        stock: 10,
        sku: 'TST-DELTA-004',
        tags: ['delta'],
        isFeatured: false,
      },
      {
        name: 'Product Epsilon',
        description: 'Description for Epsilon product for testing here yes',
        price: 750,
        category: categoryId,
        stock: 25,
        sku: 'TST-EPSILON-005',
        tags: ['epsilon'],
        isFeatured: false,
      },
    ];

    for (const product of products) {
      await request(app)
        .post('/api/v1/products')
        .set('Cookie', adminCookies)
        .send(product)
        .expect(201);
    }
  });

  // ── Product Listing ───────────────────────────────────────────────────

  describe('GET /api/v1/products', () => {
    it('C1: lists all products', async () => {
      const res = await request(app).get('/api/v1/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(5);
    });

    it('C2: search filters by text', async () => {
      const res = await request(app).get('/api/v1/products?search=Alpha');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names).toContain('Product Alpha');
    });

    it('C3: filters by category', async () => {
      // Create a second category with no products
      const cat2Id = await seedCategory('Fashion', adminCookies);
      const res = await request(app).get(`/api/v1/products?category=fashion`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);

      // Clean up
      await request(app)
        .delete(`/api/v1/categories/${cat2Id}`)
        .set('Cookie', adminCookies);
    });

    it('C3b: switches between populated categories without retaining the previous category', async () => {
      const footwearCategoryId = await seedCategory('Footwear', adminCookies);
      const beautyCategoryId = await seedCategory('Beauty', adminCookies);

      await Product.create([
        {
          name: 'Footwear Switch Product',
          description: 'A product created to verify category switching remains isolated.',
          price: 1200,
          category: footwearCategoryId,
          stock: 8,
          sku: 'TST-SWITCH-FOOTWEAR',
        },
        {
          name: 'Beauty Switch Product',
          description: 'A product created to verify category switching remains isolated.',
          price: 1400,
          category: beautyCategoryId,
          stock: 8,
          sku: 'TST-SWITCH-BEAUTY',
        },
      ]);

      const footwearResponse = await request(app).get('/api/v1/products?category=footwear');
      const beautyResponse = await request(app).get('/api/v1/products?category=beauty');

      expect(footwearResponse.status).toBe(200);
      expect(footwearResponse.body.data.map((product: { sku: string }) => product.sku))
        .toEqual(['TST-SWITCH-FOOTWEAR']);
      expect(beautyResponse.status).toBe(200);
      expect(beautyResponse.body.data.map((product: { sku: string }) => product.sku))
        .toEqual(['TST-SWITCH-BEAUTY']);
    });

    it('C4: sorts by price ascending', async () => {
      const res = await request(app).get('/api/v1/products?sort=price&order=asc');

      expect(res.status).toBe(200);
      const prices = res.body.data.map((p: { price: number }) => p.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it('C4b: sorts by price descending', async () => {
      const res = await request(app).get('/api/v1/products?sort=price&order=desc');

      expect(res.status).toBe(200);
      const prices = res.body.data.map((p: { price: number }) => p.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
    });

    it('C5: pagination works correctly', async () => {
      const res = await request(app).get('/api/v1/products?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(3);

      // Page 2 should have different products
      const res2 = await request(app).get('/api/v1/products?page=2&limit=2');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(2);
      expect(res2.body.data[0]._id).not.toBe(res.body.data[0]._id);
    });

    it('C5b: price range filtering', async () => {
      const res = await request(app).get('/api/v1/products?minPrice=800&maxPrice=2100');

      expect(res.status).toBe(200);
      for (const product of res.body.data) {
        expect(product.price).toBeGreaterThanOrEqual(800);
        expect(product.price).toBeLessThanOrEqual(2100);
      }
    });

    it('C5c: unknown category filtering never falls back to all products', async () => {
      const res = await request(app).get('/api/v1/products?category=does-not-exist');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('C5d: rejects a price range whose minimum exceeds its maximum', async () => {
      const res = await request(app).get('/api/v1/products?minPrice=2100&maxPrice=800');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Featured Products ─────────────────────────────────────────────────

  describe('GET /api/v1/products/featured', () => {
    it('C6: returns only featured products', async () => {
      const res = await request(app).get('/api/v1/products/featured');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      for (const product of res.body.data) {
        expect(product.isFeatured).toBe(true);
      }
    });
  });

  // ── Product Detail ────────────────────────────────────────────────────

  describe('GET /api/v1/products/:slug', () => {
    it('C7: returns product by slug', async () => {
      const res = await request(app).get('/api/v1/products/product-alpha');

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Product Alpha');
      expect(res.body.data.slug).toBe('product-alpha');
      expect(res.body.data.price).toBe(1000);
      // Category should be populated
      expect(res.body.data.category).toHaveProperty('name');
    });

    it('C8: returns 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/v1/products/does-not-exist');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Admin Product CRUD ────────────────────────────────────────────────

  describe('Admin Product Operations', () => {
    it('C9: admin can create a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Cookie', adminCookies)
        .send({
          name: 'Admin Created Product',
          description: 'Product created by admin for testing purposes here',
          price: 999,
          category: categoryId,
          stock: 5,
          sku: 'TST-ADMIN-006',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Admin Created Product');
      expect(res.body.data.slug).toBe('admin-created-product');
    });

    it('C10: customer CANNOT create a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Cookie', customerCookies)
        .send({
          name: 'Customer Product',
          description: 'This should fail because customer is not admin',
          price: 100,
          category: categoryId,
          stock: 1,
          sku: 'TST-CUST-007',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('C10b: unauthenticated user CANNOT create a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({
          name: 'Anon Product',
          description: 'This should fail because no auth was provided',
          price: 100,
          category: categoryId,
          stock: 1,
          sku: 'TST-ANON-008',
        });

      expect(res.status).toBe(401);
    });

    it('C11: admin can update a product', async () => {
      // Get the product ID
      const listRes = await request(app).get('/api/v1/products/product-beta');
      const productId = listRes.body.data._id;

      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Cookie', adminCookies)
        .send({ price: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(2500);
    });

    it('C12: admin can soft-delete a product', async () => {
      // Get the gamma product
      const listRes = await request(app).get('/api/v1/products/product-gamma');
      const productId = listRes.body.data._id;

      const res = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);

      // Product should no longer appear in public listing
      const afterDelete = await request(app).get('/api/v1/products/product-gamma');
      expect(afterDelete.status).toBe(404);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D. Category API
// ═══════════════════════════════════════════════════════════════════════════

describe('Category API', () => {
  let adminCookies: string[];
  let customerCookies: string[];

  beforeAll(async () => {
    await clearCollections();
    adminCookies = await createAdminUser();
    customerCookies = await registerAndLogin({
      name: 'Cat Customer',
      email: 'catcust@test.com',
      password: 'Customer123',
    });
  });

  describe('GET /api/v1/categories', () => {
    it('D1: lists categories', async () => {
      // Create a category first
      await seedCategory('Clothing', adminCookies);

      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/categories/:slug', () => {
    it('D2: returns category by slug', async () => {
      const res = await request(app).get('/api/v1/categories/clothing');

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Clothing');
      expect(res.body.data.slug).toBe('clothing');
    });

    it('D2b: returns 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/v1/categories/nope');
      expect(res.status).toBe(404);
    });
  });

  describe('Admin Category CRUD', () => {
    it('D3: admin creates a category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', adminCookies)
        .send({ name: 'Books', description: 'Literature and reading' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Books');
      expect(res.body.data.slug).toBe('books');
    });

    it('D3b: admin updates a category', async () => {
      const listRes = await request(app).get('/api/v1/categories/books');
      const catId = listRes.body.data._id;

      const res = await request(app)
        .put(`/api/v1/categories/${catId}`)
        .set('Cookie', adminCookies)
        .send({ description: 'Updated book description' });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Updated book description');
    });

    it('D4: customer CANNOT create a category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', customerCookies)
        .send({ name: 'Sneaky Category' });

      expect(res.status).toBe(403);
    });

    it('D5: cannot delete category with products', async () => {
      // Create category + product
      const catRes = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', adminCookies)
        .send({ name: 'HasProducts' });
      const catId = catRes.body.data._id;

      await request(app)
        .post('/api/v1/products')
        .set('Cookie', adminCookies)
        .send({
          name: 'Blocking Product',
          description: 'This product blocks category deletion test',
          price: 100,
          category: catId,
          stock: 1,
          sku: 'BLK-001',
        });

      const res = await request(app)
        .delete(`/api/v1/categories/${catId}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('product');
    });

    it('D5b: cannot delete category with subcategories', async () => {
      // Create parent + child category
      const parentRes = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', adminCookies)
        .send({ name: 'ParentCat' });
      const parentId = parentRes.body.data._id;

      await request(app)
        .post('/api/v1/categories')
        .set('Cookie', adminCookies)
        .send({ name: 'ChildCat', parent: parentId });

      const res = await request(app)
        .delete(`/api/v1/categories/${parentId}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('subcategory');
    });

    it('D5c: can delete empty category', async () => {
      const catRes = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', adminCookies)
        .send({ name: 'Deletable' });
      const catId = catRes.body.data._id;

      const res = await request(app)
        .delete(`/api/v1/categories/${catId}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);

      // Verify it's gone
      const after = await request(app).get('/api/v1/categories/deletable');
      expect(after.status).toBe(404);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// E. Security & Validation
// ═══════════════════════════════════════════════════════════════════════════

describe('Security & Validation', () => {
  let adminCookies: string[];

  beforeAll(async () => {
    await clearCollections();
    adminCookies = await createAdminUser();
  });

  it('E1: invalid JSON body returns 4xx', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .set('Content-Type', 'application/json')
      .send('{ not valid json');

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('E2: password is never in any auth response', async () => {
    // Register
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'PW Check', email: 'pwcheck@test.com', password: 'Password123' });
    expect(regRes.body.data.password).toBeUndefined();

    // Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'pwcheck@test.com', password: 'Password123' });
    expect(loginRes.body.data.password).toBeUndefined();

    // Get me
    const cookies = loginRes.headers['set-cookie'] as unknown as string[];
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookies);
    expect(meRes.body.data.password).toBeUndefined();
  });

  it('E3: unauthenticated admin endpoints return 401', async () => {
    const endpoints = [
      { method: 'post', url: '/api/v1/products' },
      { method: 'put', url: '/api/v1/products/fakeid' },
      { method: 'delete', url: '/api/v1/products/fakeid' },
      { method: 'post', url: '/api/v1/categories' },
      { method: 'put', url: '/api/v1/categories/fakeid' },
      { method: 'delete', url: '/api/v1/categories/fakeid' },
    ] as const;

    for (const ep of endpoints) {
      const res = await (request(app) as any)[ep.method](ep.url).send({});
      expect(res.status).toBe(401);
    }
  });

  it('E3b: customer role on admin endpoints returns 403', async () => {
    const cookies = await registerAndLogin({
      name: 'Not Admin',
      email: 'notadmin@test.com',
      password: 'Password123',
    });

    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookies)
      .send({
        name: 'Forbidden Product',
        description: 'Should be forbidden because customer not admin role',
        price: 100,
        category: '507f1f77bcf86cd799439011',
        stock: 1,
        sku: 'FORBIDDEN-001',
      });

    expect(res.status).toBe(403);
  });

  it('E5: unknown route returns 404', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
  });

  it('E6: product creation with invalid category returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookies)
      .send({
        name: 'Bad Category Product',
        description: 'This product has an invalid category reference id',
        price: 100,
        category: '507f1f77bcf86cd799439011',
        stock: 1,
        sku: 'BADCAT-001',
      });

    expect(res.status).toBe(400);
  });

  it('E7: product creation with missing required fields returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookies)
      .send({ name: 'Incomplete' });

    expect(res.status).toBe(400);
  });
});

