import api from '@/lib/api';
import type { ApiResponse, Order } from '@/types';

export const checkoutService = {
  placeOrder(addressId: string) {
    return api.post<unknown, ApiResponse<Order>>('/checkout', { addressId });
  },
};
