import api from '@/lib/api';
import type { Address, AddressInput, ApiResponse } from '@/types';

export const addressService = {
  getAddresses() {
    return api.get<unknown, ApiResponse<Address[]>>('/addresses');
  },

  createAddress(input: AddressInput) {
    return api.post<unknown, ApiResponse<Address>>('/addresses', input);
  },

  updateAddress(addressId: string, input: AddressInput) {
    return api.put<unknown, ApiResponse<Address>>(`/addresses/${addressId}`, input);
  },

  deleteAddress(addressId: string) {
    return api.delete<unknown, ApiResponse<Address>>(`/addresses/${addressId}`);
  },
};
