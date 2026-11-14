import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminInventoryService } from '@/services/adminInventory';
import { adminProductsQueryKey } from '@/hooks/useAdminProducts';
export function useInventoryAdjustment() { const client = useQueryClient(); return useMutation({ mutationFn: ({ productId, delta, reason }: { productId: string; delta: number; reason: string }) => adminInventoryService.adjust(productId, delta, reason), onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: adminProductsQueryKey }), client.invalidateQueries({ queryKey: ['admin', 'dashboard'] })]) }); }
