import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(200),
    description: z.string().trim().min(10).max(5000),
    price: z.number().min(0, 'Price must be non-negative'),
    compareAtPrice: z.number().min(0).optional(),
    category: z.string().min(1, 'Category is required'),
    images: z.array(z.string().url()).optional(),
    variants: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          value: z.string().trim().min(1),
          sku: z.string().trim().optional(),
          price: z.number().min(0).optional(),
          stock: z.number().int().min(0),
        }),
      )
      .optional(),
    stock: z.number().int().min(0).default(0),
    sku: z.string().trim().min(1).max(50),
    tags: z.array(z.string().trim()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    price: z.number().min(0).optional(),
    compareAtPrice: z.number().min(0).nullable().optional(),
    category: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    variants: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          value: z.string().trim().min(1),
          sku: z.string().trim().optional(),
          price: z.number().min(0).optional(),
          stock: z.number().int().min(0),
        }),
      )
      .optional(),
    stock: z.number().int().min(0).optional(),
    sku: z.string().trim().min(1).max(50).optional(),
    tags: z.array(z.string().trim()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(50).default(12).optional(),
      sort: z.enum(['price', 'createdAt', 'name', 'avgRating']).default('createdAt').optional(),
      order: z.enum(['asc', 'desc']).default('desc').optional(),
      category: z.string().optional(),
      search: z.string().optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      featured: z.coerce.boolean().optional(),
    })
    .refine(
      ({ minPrice, maxPrice }) =>
        minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
      { message: 'Minimum price cannot be greater than maximum price', path: ['maxPrice'] },
    ),
});

export const adminProductQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    category: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid category identifier').optional(),
    isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    lowStock: z.enum(['true']).optional(),
  }).strict(),
});

