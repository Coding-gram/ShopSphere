import api from '@/lib/api';
import type { ApiResponse, Category } from '@/types';
import { FALLBACK_CATEGORIES } from '@/data/fallbackCatalog';

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const res = await api.get<unknown, ApiResponse<Category[]>>('/categories');
      if (!res || !Array.isArray(res.data) || res.data.length === 0) {
        return {
          success: true,
          statusCode: 200,
          message: 'Categories retrieved from fallback',
          data: FALLBACK_CATEGORIES,
        };
      }
      return res;
    } catch {
      return {
        success: true,
        statusCode: 200,
        message: 'Categories retrieved from fallback',
        data: FALLBACK_CATEGORIES,
      };
    }
  },

  async getCategory(slug: string): Promise<ApiResponse<Category>> {
    try {
      const res = await api.get<unknown, ApiResponse<Category>>(`/categories/${slug}`);
      if (!res || !res.data || typeof res.data !== 'object') {
        const match = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
        if (match) {
          return {
            success: true,
            statusCode: 200,
            message: 'Category retrieved from fallback',
            data: match,
          };
        }
      }
      return res;
    } catch {
      const match = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
      if (match) {
        return {
          success: true,
          statusCode: 200,
          message: 'Category retrieved from fallback',
          data: match,
        };
      }
      throw new Error('Category not found');
    }
  },
};

