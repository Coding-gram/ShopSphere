import api from '@/lib/api';
import type { AdminDashboard, ApiResponse } from '@/types';

interface DataResetResult {
  deleted: Record<string, number>;
}

export const adminDashboardService = {
  getDashboard(dateFrom?: string, dateTo?: string) {
    return api.get<unknown, ApiResponse<AdminDashboard>>('/admin/dashboard', {
      params: { ...(dateFrom ? { dateFrom } : {}), ...(dateTo ? { dateTo } : {}) },
    });
  },

  resetData() {
    return api.delete<unknown, ApiResponse<DataResetResult>>('/admin/data/reset');
  },
};
