import { describe, expect, it, vi } from 'vitest';

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock('@/lib/api', () => ({ default: { get, patch } }));

import { adminOrderService } from './adminOrders';

describe('adminOrderService', () => {
  it('sends only supported filters to the paginated admin order endpoint', () => {
    adminOrderService.getOrders({ page: 2, status: 'paid', paymentStatus: 'paid', search: 'asha@example.com' });
    expect(get).toHaveBeenCalledWith('/admin/orders', { params: { page: 2, status: 'paid', paymentStatus: 'paid', search: 'asha@example.com' } });
  });

  it('sends an allowlisted lifecycle status and optional note', () => {
    adminOrderService.transitionOrder('order-1', 'packed', 'Ready to dispatch');
    expect(patch).toHaveBeenCalledWith('/admin/orders/order-1/status', { status: 'packed', note: 'Ready to dispatch' });
  });
});
