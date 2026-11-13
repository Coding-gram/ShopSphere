import api from '@/lib/api';
import type {
  AdminLifecycleStatus,
  AdminOrder,
  AdminOrderFilters,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const adminOrderService = {
  getOrders(filters: AdminOrderFilters) {
    return api.get<unknown, PaginatedResponse<AdminOrder>>('/admin/orders', { params: filters });
  },

  getOrder(orderId: string) {
    return api.get<unknown, ApiResponse<AdminOrder>>(`/admin/orders/${orderId}`);
  },

  transitionOrder(orderId: string, status: AdminLifecycleStatus, note?: string) {
    return api.patch<unknown, ApiResponse<AdminOrder>>(`/admin/orders/${orderId}/status`, {
      status,
      ...(note ? { note } : {}),
    });
  },
};
