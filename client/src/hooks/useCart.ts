import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { cartService } from '@/services/cart';
import type { ApiResponse, Cart } from '@/types';

export const cartQueryKey = ['cart'] as const;

export function useCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: cartQueryKey,
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  });

  const setCart = (response: ApiResponse<Cart>) => {
    queryClient.setQueryData(cartQueryKey, response);
  };
  const addMutation = useMutation({ mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => cartService.addItem(productId, quantity), onSuccess: setCart });
  const updateMutation = useMutation({ mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => cartService.updateItem(itemId, quantity), onSuccess: setCart });
  const removeMutation = useMutation({ mutationFn: (itemId: string) => cartService.removeItem(itemId), onSuccess: setCart });

  return {
    ...query,
    cart: query.data?.data,
    addItem: addMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    removeItem: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
