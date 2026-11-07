import api from '@/lib/api';
import type { ApiResponse, Category } from '@/types';

export const categoryService = {
  getCategories() {
    return api.get<unknown, ApiResponse<Category[]>>('/categories');
  },

  getCategory(slug: string) {
    return api.get<unknown, ApiResponse<Category>>(`/categories/${slug}`);
  },
};

