import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from '@/hooks/useAuth';
import api from '@/lib/api';
import type { User, ApiResponse } from '@/types';

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
