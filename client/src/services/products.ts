import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Product } from '@/types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export const productService = {
  getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.featured) params.set('featured', 'true');

    const query = params.toString();
    return api.get<unknown, PaginatedResponse<Product>>(
      `/products${query ? `?${query}` : ''}`
    );
  },

  getProduct(slug: string) {
    return api.get<unknown, ApiResponse<Product>>(`/products/${slug}`);
  },

  getFeatured() {
    return api.get<unknown, PaginatedResponse<Product>>(
      '/products?featured=true&limit=8'
    );
  },
};

