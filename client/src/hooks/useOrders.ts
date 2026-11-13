import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { cartQueryKey } from '@/hooks/useCart';
import { orderService } from '@/services/orders';

export const ordersQueryKey = ['orders'] as const;
export const orderQueryKey = (orderId: string) => ['orders', orderId] as const;

export function useOrders(page = 1) {
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: [...ordersQueryKey, page],
    queryFn: () => orderService.getOrders(page),
    enabled: isAuthenticated,
  });

  return {
    ...query,
    orders: query.data?.data ?? [],
    pagination: query.data?.pagination,
  };
}

export function useOrder(orderId: string | undefined) {
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: orderId ? orderQueryKey(orderId) : ['orders', 'missing'],
    queryFn: () => orderService.getOrder(orderId as string),
    enabled: isAuthenticated && Boolean(orderId),
  });

  return { ...query, order: query.data?.data };
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason, idempotencyKey }: { orderId: string; reason: string; idempotencyKey: string }) =>
      orderService.cancelOrder(orderId, reason, idempotencyKey),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ordersQueryKey }),
        queryClient.invalidateQueries({ queryKey: orderQueryKey(variables.orderId) }),
        queryClient.invalidateQueries({ queryKey: cartQueryKey }),
      ]);
    },
  });
}
