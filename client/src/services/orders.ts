import api from '@/lib/api';
import type { ApiResponse, Order, PaginatedResponse } from '@/types';

export const orderService = {
  getOrders(page = 1, limit = 10) {
    return api.get<unknown, PaginatedResponse<Order>>('/orders', { params: { page, limit } });
  },

  getOrder(orderId: string) {
    return api.get<unknown, ApiResponse<Order>>(`/orders/${orderId}`);
  },

  cancelOrder(orderId: string, reason: string, idempotencyKey: string) {
    return api.post<unknown, ApiResponse<{ replayed: boolean; order: Order }>>(
      `/orders/${orderId}/cancel`,
      { reason },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
  },
};
