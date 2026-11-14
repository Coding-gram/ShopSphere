import api from '@/lib/api';
import type { ApiResponse } from '@/types';
export const adminInventoryService = { adjust: (productId: string, delta: number, reason: string) => api.post<unknown, ApiResponse<{ stock: number }>>(`/admin/inventory/${productId}/adjustments`, { delta, reason }) };
