import api from '@/lib/api';
import type { AdminCustomer, AdminCustomerFilters, ApiResponse, PaginatedResponse } from '@/types';
export const adminCustomerService = { getCustomers: (filters: AdminCustomerFilters) => api.get<unknown, PaginatedResponse<AdminCustomer>>('/admin/customers', { params: filters }), getCustomer: (id: string) => api.get<unknown, ApiResponse<AdminCustomer>>(`/admin/customers/${id}`), updateStatus: (id: string, isActive: boolean) => api.patch<unknown, ApiResponse<AdminCustomer>>(`/admin/customers/${id}/status`, { isActive }) };
