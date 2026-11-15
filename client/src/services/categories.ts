import api from '@/lib/api';
import type { ApiResponse, Category } from '@/types';
import { FALLBACK_CATEGORIES } from '@/data/fallbackCatalog';

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      return await api.get<unknown, ApiResponse<Category[]>>('/categories');
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
      return await api.get<unknown, ApiResponse<Category>>(`/categories/${slug}`);
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

