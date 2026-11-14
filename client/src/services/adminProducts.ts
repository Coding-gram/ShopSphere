import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Product } from '@/types';

export interface AdminProductFilters { page?: number; limit?: number; search?: string; category?: string; isActive?: boolean; lowStock?: boolean; }
export interface AdminProductInput { name: string; description: string; price: number; category: string; sku: string; stock?: number; images?: string[]; tags?: string[]; isActive?: boolean; isFeatured?: boolean; }

export const adminProductService = {
  getProducts(filters: AdminProductFilters) { return api.get<unknown, PaginatedResponse<Product>>('/admin/products', { params: filters }); },
  createProduct(input: AdminProductInput) { return api.post<unknown, ApiResponse<Product>>('/admin/products', input); },
  updateProduct(id: string, input: Partial<AdminProductInput>) { return api.put<unknown, ApiResponse<Product>>(`/admin/products/${id}`, input); },
  deleteProduct(id: string) { return api.delete<unknown, ApiResponse<null>>(`/admin/products/${id}`); },
};
