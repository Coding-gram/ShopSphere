import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

const { transitionOrder } = vi.hoisted(() => ({ transitionOrder: vi.fn().mockResolvedValue({ data: {} }) }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true, isAdmin: true }) }));
vi.mock('@/services/adminOrders', () => ({ adminOrderService: { transitionOrder } }));

import { useAdminOrderTransition } from './useAdminOrders';

describe('useAdminOrderTransition', () => {
  it('refreshes admin order history and its detail after a lifecycle transition', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useAdminOrderTransition(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ orderId: 'order-1', status: 'packed', note: 'Ready to dispatch' });
    });

    expect(transitionOrder).toHaveBeenCalledWith('order-1', 'packed', 'Ready to dispatch');
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'orders'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'orders', 'order-1'] });
  });
});
