import api from '@/lib/api';
import type { ApiResponse, User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login(data: LoginPayload) {
    return api.post<unknown, ApiResponse<User>>('/auth/login', data);
  },

  register(data: RegisterPayload) {
    return api.post<unknown, ApiResponse<User>>('/auth/register', data);
  },

  logout() {
    return api.post<unknown, ApiResponse<null>>('/auth/logout');
  },

  getMe() {
    return api.get<unknown, ApiResponse<User>>('/auth/me');
  },

  updateProfile(data: UpdateProfilePayload) {
    return api.put<unknown, ApiResponse<User>>('/auth/profile', data);
  },

  changePassword(data: ChangePasswordPayload) {
    return api.put<unknown, ApiResponse<null>>('/auth/change-password', data);
  },
};

