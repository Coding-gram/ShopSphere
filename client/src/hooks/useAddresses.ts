import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { addressService } from '@/services/addresses';
import type { AddressInput } from '@/types';

export const addressesQueryKey = ['addresses'] as const;

export function useAddresses() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: addressesQueryKey,
    queryFn: addressService.getAddresses,
    enabled: isAuthenticated,
  });

  const refresh = async () => queryClient.invalidateQueries({ queryKey: addressesQueryKey });
  const createMutation = useMutation({ mutationFn: (input: AddressInput) => addressService.createAddress(input), onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: ({ addressId, input }: { addressId: string; input: AddressInput }) => addressService.updateAddress(addressId, input), onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: (addressId: string) => addressService.deleteAddress(addressId), onSuccess: refresh });

  return {
    ...query,
    addresses: query.data?.data ?? [],
    createAddress: createMutation.mutateAsync,
    updateAddress: updateMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
