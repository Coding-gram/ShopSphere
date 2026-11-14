import api from '@/lib/api';
import type { AdminAuditEvent, AdminAuditFilters, PaginatedResponse } from '@/types';
export const adminAuditEventService = { getEvents: (filters: AdminAuditFilters) => api.get<unknown, PaginatedResponse<AdminAuditEvent>>('/admin/audit-events', { params: filters }) };
