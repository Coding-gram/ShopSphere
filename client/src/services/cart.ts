import api from '@/lib/api';
import type { ApiResponse, Cart } from '@/types';

export const cartService = {
  getCart() {
    return api.get<unknown, ApiResponse<Cart>>('/cart');
  },

  addItem(productId: string, quantity: number) {
    return api.post<unknown, ApiResponse<Cart>>('/cart/items', { productId, quantity });
  },

  updateItem(itemId: string, quantity: number) {
    return api.patch<unknown, ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
  },

  removeItem(itemId: string) {
    return api.delete<unknown, ApiResponse<Cart>>(`/cart/items/${itemId}`);
  },
};
