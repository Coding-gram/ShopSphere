import { Product, type IProduct } from '../../models/Product.js';
import { Category } from '../../models/Category.js';
import { ApiError } from '../../utils/ApiError.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

// ── List products (public) ───────────────────────────────────────────────────

export async function listProducts(query: ProductQuery) {
  const {
    page = 1,
    limit = 12,
    sort = 'createdAt',
    order = 'desc',
    category,
    search,
    minPrice,
    maxPrice,
    featured,
  } = query;

  const filter: Record<string, unknown> = { isActive: true };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.$gte = minPrice;
    if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
    filter.price = priceFilter;
  }

  if (featured !== undefined) {
    filter.isFeatured = featured;
  }

  const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

// ── Get single product by slug (public) ──────────────────────────────────────

export async function getProductBySlug(slug: string) {
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug')
    .lean();

  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

// ── Get featured products (public) ───────────────────────────────────────────

export async function getFeaturedProducts(limit = 8) {
  return Product.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
}

// ── Admin: create product ────────────────────────────────────────────────────

export async function createProduct(data: Partial<IProduct>) {
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) throw new ApiError(400, 'Invalid category');

  const product = await Product.create(data);
  return product.populate('category', 'name slug');
}

// ── Admin: update product ────────────────────────────────────────────────────

export async function updateProduct(id: string, data: Partial<IProduct>) {
  if (data.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) throw new ApiError(400, 'Invalid category');
  }

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

// ── Admin: delete (soft-delete) product ──────────────────────────────────────

export async function deleteProduct(id: string) {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
}
