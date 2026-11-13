import api from '@/lib/api';
import type { ApiResponse, Order } from '@/types';

export interface CheckoutRequest {
  addressId: string;
  idempotencyKey: string;
}

export const checkoutService = {
  placeOrder({ addressId, idempotencyKey }: CheckoutRequest) {
    return api.post<unknown, ApiResponse<Order>>('/checkout', { addressId }, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
};
