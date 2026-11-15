import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Product } from '@/types';
import {
  FALLBACK_PRODUCTS,
  getFallbackProduct,
  getFallbackProducts,
} from '@/data/fallbackCatalog';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sale?: boolean;
  newArrivals?: boolean;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.order) params.set('order', filters.order);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.featured) params.set('featured', 'true');
    if (filters.sale) params.set('sale', 'true');
    if (filters.newArrivals) params.set('newArrivals', 'true');

    const query = params.toString();
    try {
      return await api.get<unknown, PaginatedResponse<Product>>(
        `/products${query ? `?${query}` : ''}`
      );
    } catch {
      return getFallbackProducts(filters);
    }
  },

  async getProduct(slug: string): Promise<ApiResponse<Product>> {
    try {
      return await api.get<unknown, ApiResponse<Product>>(`/products/${slug}`);
    } catch {
      const match = getFallbackProduct(slug);
      if (match) {
        return {
          success: true,
          statusCode: 200,
          message: 'Product retrieved from fallback',
          data: match,
        };
      }
      throw new Error('Product not found');
    }
  },

  async getFeatured(limit = 8): Promise<ApiResponse<Product[]>> {
    try {
      return await api.get<unknown, ApiResponse<Product[]>>(
        `/products/featured?limit=${limit}`
      );
    } catch {
      const featured = FALLBACK_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit);
      return {
        success: true,
        statusCode: 200,
        message: 'Featured products retrieved from fallback',
        data: featured,
      };
    }
  },
};
