import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '@/hooks/useAuth';
import { authService } from '@/services/auth';
import api from '@/lib/api';
import type { User, ApiResponse } from '@/types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<unknown, ApiResponse<User>>('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.data);
    return res.data;
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      const res = await authService.register(data);
      setUser(res.data);
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    queryClient.removeQueries({ queryKey: ['cart'] });
    queryClient.removeQueries({ queryKey: ['addresses'] });
    queryClient.removeQueries({ queryKey: ['orders'] });
    queryClient.removeQueries({ queryKey: ['admin', 'orders'] });
  }, [queryClient]);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string }) => {
    const res = await authService.updateProfile(data);
    setUser(res.data);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, isAdmin, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
