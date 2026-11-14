import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ARTISAN_SCENTED_CANDLE_IMAGE, CATALOG_PRODUCT_IMAGES } from './catalogAssets.js';
import { catalogAdditions } from './catalogAdditions.js';

// ── Sample data ──────────────────────────────────────────────────────────────

const categories = [
  { name: 'Clothing', description: 'Premium apparel for every occasion', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600' },
  { name: 'Accessories', description: 'Curated accessories to complement your style', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600' },
  { name: 'Footwear', description: 'Handcrafted shoes for comfort and elegance', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' },
  { name: 'Home & Living', description: 'Elevate your living spaces', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600' },
  { name: 'Beauty', description: 'Premium skincare and beauty essentials', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600' },
];

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user (never exposed via public registration)
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@shopsphere.com',
      password: 'Admin@123456',
      role: 'admin',
    });
    console.log(`👤 Admin created: ${admin.email}`);

    // Create test customer
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@shopsphere.com',
      password: 'Customer@123',
      role: 'customer',
    });
    console.log(`👤 Customer created: ${customer.email}`);

    // Create categories one by one so pre-save hooks generate slugs
    const createdCategories = [];
    for (const cat of categories) {
      createdCategories.push(await Category.create(cat));
    }
    console.log(`📁 ${createdCategories.length} categories created`);

    const catMap = Object.fromEntries(
      createdCategories.map((c) => [c.name, c._id]),
    );

    // Create products
    const products = [
      {
        name: 'Merino Wool Overcoat',
        description: 'A timeless merino wool overcoat crafted from premium Italian fabric. Features a tailored silhouette, notch lapel, and double-breasted closure. Perfect for the discerning individual who values both warmth and sophistication.',
        price: 12999,
        compareAtPrice: 16999,
        category: catMap['Clothing'],
        images: [
          'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800',
        ],
        stock: 25,
        sku: 'SS-CLO-001',
        tags: ['overcoat', 'wool', 'winter', 'premium'],
        isFeatured: true,
        avgRating: 4.7,
        reviewCount: 23,
      },
      {
        name: 'Cashmere Crew Sweater',
        description: 'Luxuriously soft cashmere crew neck sweater in a versatile neutral tone. Lightweight yet warm, with ribbed cuffs and hem. A wardrobe essential that pairs effortlessly with everything.',
        price: 6499,
        category: catMap['Clothing'],
        images: [CATALOG_PRODUCT_IMAGES['SS-CLO-002']],
        stock: 40,
        sku: 'SS-CLO-002',
        tags: ['cashmere', 'sweater', 'knitwear'],
        isFeatured: true,
        avgRating: 4.9,
        reviewCount: 41,
      },
      {
        name: 'Linen Tailored Trousers',
        description: 'Relaxed yet refined linen trousers with a tailored fit. Features a comfortable elasticated waistband, side pockets, and a clean front pleat. Ideal for warm weather styling.',
        price: 4299,
        category: catMap['Clothing'],
        images: [CATALOG_PRODUCT_IMAGES['SS-CLO-003']],
        stock: 35,
        sku: 'SS-CLO-003',
        tags: ['linen', 'trousers', 'summer'],
        isFeatured: false,
        avgRating: 4.5,
        reviewCount: 17,
      },
      {
        name: 'Handcrafted Leather Tote',
        description: 'Artisan-made leather tote bag in rich cognac. Features vegetable-tanned leather that develops a beautiful patina over time. Interior zip pocket and magnetic snap closure.',
        price: 8999,
        compareAtPrice: 11499,
        category: catMap['Accessories'],
        images: [CATALOG_PRODUCT_IMAGES['SS-ACC-001']],
        stock: 15,
        sku: 'SS-ACC-001',
        tags: ['leather', 'tote', 'bag', 'handcrafted'],
        isFeatured: true,
        avgRating: 4.8,
        reviewCount: 32,
      },
      {
        name: 'Silk Pocket Square Set',
        description: 'A set of three premium silk pocket squares in complementary tones. Hand-rolled edges with a subtle sheen that elevates any blazer or suit jacket.',
        price: 2499,
        category: catMap['Accessories'],
        images: ['https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800'],
        stock: 50,
        sku: 'SS-ACC-002',
        tags: ['silk', 'pocket-square', 'formal'],
        isFeatured: false,
        avgRating: 4.6,
        reviewCount: 9,
      },
      {
        name: 'Italian Leather Oxford Shoes',
        description: 'Classic Oxford shoes handmade in Italy from full-grain calfskin leather. Blake-stitched construction with a leather sole. A cornerstone of the well-dressed wardrobe.',
        price: 15499,
        compareAtPrice: 18999,
        category: catMap['Footwear'],
        images: [CATALOG_PRODUCT_IMAGES['SS-FTW-001']],
        stock: 20,
        sku: 'SS-FTW-001',
        tags: ['oxford', 'leather', 'formal', 'italian'],
        isFeatured: true,
        avgRating: 4.9,
        reviewCount: 56,
      },
      {
        name: 'Suede Chelsea Boots',
        description: 'Elegant suede Chelsea boots with elastic side panels and a pull tab. Crepe sole for comfort. Pairs beautifully with both casual and smart-casual outfits.',
        price: 9999,
        category: catMap['Footwear'],
        images: [CATALOG_PRODUCT_IMAGES['SS-FTW-002']],
        stock: 18,
        sku: 'SS-FTW-002',
        tags: ['chelsea', 'suede', 'boots'],
        isFeatured: true,
        avgRating: 4.7,
        reviewCount: 28,
      },
      {
        name: 'Artisan Scented Candle Trio',
        description: 'Three hand-poured soy wax candles in ceramic vessels. Scents include Bergamot & Cedar, White Tea & Sage, and Amber & Vanilla. 45-hour burn time each.',
        price: 3499,
        category: catMap['Home & Living'],
        images: [ARTISAN_SCENTED_CANDLE_IMAGE],
        stock: 60,
        sku: 'SS-HOM-001',
        tags: ['candles', 'home', 'fragrance', 'gift'],
        isFeatured: false,
        avgRating: 4.8,
        reviewCount: 44,
      },
      {
        name: 'Japanese Ceramic Tea Set',
        description: 'Minimalist Japanese-inspired ceramic tea set including a teapot and four cups. Matte finish with an organic glaze. A meditative addition to your daily ritual.',
        price: 5999,
        category: catMap['Home & Living'],
        images: [CATALOG_PRODUCT_IMAGES['SS-HOM-002']],
        stock: 12,
        sku: 'SS-HOM-002',
        tags: ['tea', 'ceramic', 'japanese', 'minimalist'],
        isFeatured: true,
        avgRating: 4.6,
        reviewCount: 15,
      },
      {
        name: 'Vitamin C Brightening Serum',
        description: 'A potent 20% Vitamin C serum with hyaluronic acid and ferulic acid. Brightens, firms, and protects. Clean formulation in a UV-protective amber glass bottle.',
        price: 1999,
        category: catMap['Beauty'],
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'],
        stock: 80,
        sku: 'SS-BTY-001',
        tags: ['serum', 'skincare', 'vitamin-c', 'brightening'],
        isFeatured: false,
        avgRating: 4.4,
        reviewCount: 67,
      },
      {
        name: 'Rose Quartz Face Roller',
        description: 'Genuine rose quartz face roller with dual-ended design. Promotes lymphatic drainage, reduces puffiness, and enhances product absorption. Comes in a velvet pouch.',
        price: 1499,
        category: catMap['Beauty'],
        images: [CATALOG_PRODUCT_IMAGES['SS-BTY-002']],
        stock: 45,
        sku: 'SS-BTY-002',
        tags: ['face-roller', 'skincare', 'beauty-tools'],
        isFeatured: false,
        avgRating: 4.3,
        reviewCount: 22,
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Essential crew-neck t-shirt in GOTS-certified organic cotton. Heavyweight 220gsm fabric with a relaxed fit. Garment-dyed for a lived-in softness from day one.',
        price: 1999,
        compareAtPrice: 2499,
        category: catMap['Clothing'],
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
        stock: 100,
        sku: 'SS-CLO-004',
        tags: ['organic', 'cotton', 'tshirt', 'basics'],
        isFeatured: false,
        avgRating: 4.5,
        reviewCount: 89,
      },
      ...catalogAdditions.map(({ categoryName, ...product }) => ({
        ...product,
        category: catMap[categoryName],
      })),
    ];

    // Create products one by one so pre-save hooks generate slugs
    const createdProducts = [];
    for (const prod of products) {
      createdProducts.push(await Product.create(prod));
    }
    console.log(`🛍️  ${createdProducts.length} products created`);

    console.log('\n✅ Seed complete!');
    console.log('──────────────────────────────────');
    console.log('Admin login:    admin@shopsphere.com / Admin@123456');
    console.log('Customer login: customer@shopsphere.com / Customer@123');
    console.log('──────────────────────────────────');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();

