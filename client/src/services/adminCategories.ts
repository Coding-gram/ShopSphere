import api from '@/lib/api';
import type { ApiResponse, Category } from '@/types';
export type AdminCategoryInput = { name: string; description?: string; image?: string; parent?: string | null; isActive?: boolean };
export const adminCategoryService = { getCategories: () => api.get<unknown, ApiResponse<Category[]>>('/admin/categories'), createCategory: (input: AdminCategoryInput) => api.post<unknown, ApiResponse<Category>>('/admin/categories', input), updateCategory: (id: string, input: Partial<AdminCategoryInput>) => api.put<unknown, ApiResponse<Category>>(`/admin/categories/${id}`, input), deleteCategory: (id: string) => api.delete<unknown, ApiResponse<null>>(`/admin/categories/${id}`) };
