import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

const { cancelOrder } = vi.hoisted(() => ({ cancelOrder: vi.fn().mockResolvedValue({ data: { replayed: false } }) }));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock('@/services/orders', () => ({ orderService: { cancelOrder } }));

import { useCancelOrder } from './useOrders';

describe('useCancelOrder', () => {
  it('invalidates order history, detail, and cart queries after cancellation', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useCancelOrder(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ orderId: 'order-1', reason: 'Wrong item', idempotencyKey: 'cancel-key' });
    });

    expect(cancelOrder).toHaveBeenCalledWith('order-1', 'Wrong item', 'cancel-key');
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders', 'order-1'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['cart'] });
  });
});
