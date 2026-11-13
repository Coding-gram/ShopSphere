import { describe, expect, it, vi } from 'vitest';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('@/lib/api', () => ({ default: { get, post } }));

import { orderService } from './orders';

describe('orderService', () => {
  it('requests paginated customer orders with server-owned query parameters', () => {
    orderService.getOrders(2, 10);
    expect(get).toHaveBeenCalledWith('/orders', { params: { page: 2, limit: 10 } });
  });

  it('sends only a bounded cancellation reason and idempotency key', () => {
    orderService.cancelOrder('507f1f77bcf86cd799439011', 'Wrong item', 'cancel-key-1');
    expect(post).toHaveBeenCalledWith(
      '/orders/507f1f77bcf86cd799439011/cancel',
      { reason: 'Wrong item' },
      { headers: { 'Idempotency-Key': 'cancel-key-1' } },
    );
  });
});
