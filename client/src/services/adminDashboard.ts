import api from '@/lib/api';
import type { AdminDashboard, ApiResponse } from '@/types';

export const adminDashboardService = {
  getDashboard(dateFrom?: string, dateTo?: string) {
    return api.get<unknown, ApiResponse<AdminDashboard>>('/admin/dashboard', {
      params: { ...(dateFrom ? { dateFrom } : {}), ...(dateTo ? { dateTo } : {}) },
    });
  },
};
