import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const { mockUseAdminDashboard } = vi.hoisted(() => ({ mockUseAdminDashboard: vi.fn() }));
vi.mock('@/hooks/useAdminDashboard', () => ({ useAdminDashboard: () => mockUseAdminDashboard() }));

describe('AdminDashboard', () => {
  it('renders server-derived metrics and recent orders', () => {
    mockUseAdminDashboard.mockReturnValue({
      dashboard: {
        metrics: { totalOrders: 3, paidOrders: 1, revenue: 1200, averageOrderValue: 1200 },
        statusCounts: { placed: 1, paid: 1, packed: 0, shipped: 0, delivered: 0, cancelled: 1 },
        recentOrders: [{ _id: 'order-1', orderNumber: 'ORD-1001', total: 1200, status: 'paid', paymentStatus: 'paid', createdAt: '2026-11-10T00:00:00.000Z', customer: { _id: 'customer-1', name: 'Asha', email: 'asha@example.com' } }],
      },
      isLoading: false,
      isError: false,
    });

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view order ord-1001/i })).toHaveAttribute('href', '/admin/orders/order-1');
  });

  it('renders accessible loading and empty states', () => {
    mockUseAdminDashboard.mockReturnValue({ dashboard: undefined, isLoading: true, isError: false });
    const { rerender } = render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument();
    mockUseAdminDashboard.mockReturnValue({ dashboard: { metrics: { totalOrders: 0, paidOrders: 0, revenue: 0, averageOrderValue: 0 }, statusCounts: {}, recentOrders: [] }, isLoading: false, isError: false });
    rerender(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });
});
