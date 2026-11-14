import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminDashboardService } from '@/services/adminDashboard';

export const adminDashboardQueryKey = ['admin', 'dashboard'] as const;

export function useAdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const query = useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: () => adminDashboardService.getDashboard(),
    enabled: isAuthenticated && isAdmin,
  });
  return { ...query, dashboard: query.data?.data };
}
