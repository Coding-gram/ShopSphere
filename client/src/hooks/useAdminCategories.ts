import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminCategoryService, type AdminCategoryInput } from '@/services/adminCategories';
export const adminCategoriesQueryKey = ['admin', 'categories'] as const;
export function useAdminCategories() { const { isAuthenticated, isAdmin } = useAuth(); const query = useQuery({ queryKey: adminCategoriesQueryKey, queryFn: adminCategoryService.getCategories, enabled: isAuthenticated && isAdmin }); return { ...query, categories: query.data?.data ?? [] }; }
function mutation<T>(fn: (input: T) => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: adminCategoriesQueryKey }), client.invalidateQueries({ queryKey: ['categories'] })]) }); }
export function useCreateAdminCategory() { return mutation<AdminCategoryInput>(adminCategoryService.createCategory); }
export function useUpdateAdminCategory() { return mutation<{ id: string; input: Partial<AdminCategoryInput> }>(({ id, input }) => adminCategoryService.updateCategory(id, input)); }
export function useDeleteAdminCategory() { return mutation<string>(adminCategoryService.deleteCategory); }
