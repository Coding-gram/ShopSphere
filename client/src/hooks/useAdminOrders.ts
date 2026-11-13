import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminOrderService } from '@/services/adminOrders';
import type { AdminLifecycleStatus, AdminOrderFilters } from '@/types';

export const adminOrdersQueryKey = ['admin', 'orders'] as const;
export const adminOrderQueryKey = (orderId: string) => ['admin', 'orders', orderId] as const;

export function useAdminOrders(filters: AdminOrderFilters) {
  const { isAuthenticated, isAdmin } = useAuth();
  const query = useQuery({
    queryKey: [...adminOrdersQueryKey, filters],
    queryFn: () => adminOrderService.getOrders(filters),
    enabled: isAuthenticated && isAdmin,
  });

  return { ...query, orders: query.data?.data ?? [], pagination: query.data?.pagination };
}

export function useAdminOrder(orderId: string | undefined) {
  const { isAuthenticated, isAdmin } = useAuth();
  const query = useQuery({
    queryKey: orderId ? adminOrderQueryKey(orderId) : ['admin', 'orders', 'missing'],
    queryFn: () => adminOrderService.getOrder(orderId as string),
    enabled: isAuthenticated && isAdmin && Boolean(orderId),
  });

  return { ...query, order: query.data?.data };
}

export function useAdminOrderTransition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: AdminLifecycleStatus; note?: string }) =>
      adminOrderService.transitionOrder(orderId, status, note),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey }),
        queryClient.invalidateQueries({ queryKey: adminOrderQueryKey(variables.orderId) }),
      ]);
    },
  });
}
