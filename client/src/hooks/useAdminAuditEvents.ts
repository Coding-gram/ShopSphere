import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminAuditEventService } from '@/services/adminAuditEvents';
import type { AdminAuditFilters } from '@/types';
export const adminAuditEventsQueryKey = ['admin', 'audit-events'] as const;
export function useAdminAuditEvents(filters: AdminAuditFilters) { const { isAuthenticated, isAdmin } = useAuth(); const query = useQuery({ queryKey: [...adminAuditEventsQueryKey, filters], queryFn: () => adminAuditEventService.getEvents(filters), enabled: isAuthenticated && isAdmin }); return { ...query, events: query.data?.data ?? [], pagination: query.data?.pagination }; }
