import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminProductService, type AdminProductFilters, type AdminProductInput } from '@/services/adminProducts';

export const adminProductsQueryKey = ['admin', 'products'] as const;
export function useAdminProducts(filters: AdminProductFilters) { const { isAuthenticated, isAdmin } = useAuth(); const query = useQuery({ queryKey: [...adminProductsQueryKey, filters], queryFn: () => adminProductService.getProducts(filters), enabled: isAuthenticated && isAdmin }); return { ...query, products: query.data?.data ?? [], pagination: query.data?.pagination }; }
function useCatalogMutation<T>(mutationFn: (value: T) => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: adminProductsQueryKey }), client.invalidateQueries({ queryKey: ['admin', 'dashboard'] })]) }); }
export function useCreateAdminProduct() { return useCatalogMutation<AdminProductInput>((input) => adminProductService.createProduct(input)); }
export function useUpdateAdminProduct() { return useCatalogMutation<{ id: string; input: Partial<AdminProductInput> }>(({ id, input }) => adminProductService.updateProduct(id, input)); }
export function useDeleteAdminProduct() { return useCatalogMutation<string>((id) => adminProductService.deleteProduct(id)); }
