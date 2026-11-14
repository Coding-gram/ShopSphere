import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminCustomerService } from '@/services/adminCustomers';
import type { AdminCustomerFilters } from '@/types';
export const adminCustomersQueryKey = ['admin', 'customers'] as const; export const adminCustomerQueryKey = (id: string) => ['admin', 'customers', id] as const;
export function useAdminCustomers(filters: AdminCustomerFilters) { const { isAuthenticated, isAdmin } = useAuth(); const query = useQuery({ queryKey: [...adminCustomersQueryKey, filters], queryFn: () => adminCustomerService.getCustomers(filters), enabled: isAuthenticated && isAdmin }); return { ...query, customers: query.data?.data ?? [], pagination: query.data?.pagination }; }
export function useAdminCustomer(id: string | undefined) { const { isAuthenticated, isAdmin } = useAuth(); const query = useQuery({ queryKey: id ? adminCustomerQueryKey(id) : ['admin', 'customers', 'missing'], queryFn: () => adminCustomerService.getCustomer(id as string), enabled: isAuthenticated && isAdmin && Boolean(id) }); return { ...query, customer: query.data?.data }; }
export function useUpdateAdminCustomerStatus() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminCustomerService.updateStatus(id, isActive), onSuccess: async (_data, variables) => { await Promise.all([client.invalidateQueries({ queryKey: adminCustomersQueryKey }), client.invalidateQueries({ queryKey: adminCustomerQueryKey(variables.id) })]); } }); }
