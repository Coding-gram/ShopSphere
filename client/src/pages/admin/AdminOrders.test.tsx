import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminOrders from './AdminOrders';

const { mockUseAdminOrders } = vi.hoisted(() => ({ mockUseAdminOrders: vi.fn() }));
vi.mock('@/hooks/useAdminOrders', () => ({ useAdminOrders: (...args: unknown[]) => mockUseAdminOrders(...args) }));

const order = {
  _id: 'order-1',
  orderNumber: 'ORD-1001',
  customer: { _id: 'customer-1', name: 'Asha Sharma', email: 'asha@example.com' },
  items: [{ product: 'product-1', name: 'Merino Sweater', image: '', quantity: 2, price: 1250 }],
  shippingAddress: { fullName: 'Asha Sharma', phone: '9876543210', street: '42 Market Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
  subtotal: 2500,
  shippingCost: 0,
  tax: 0,
  total: 2500,
  status: 'paid' as const,
  paymentStatus: 'paid' as const,
  statusHistory: [{ status: 'paid' as const, timestamp: '2026-01-01T00:00:00Z' }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderPage() {
  return render(<MemoryRouter initialEntries={['/admin/orders']}><AdminOrders /></MemoryRouter>);
}

describe('AdminOrders page', () => {
  it('shows a loading state while admin orders load', () => {
    mockUseAdminOrders.mockReturnValue({ orders: [], pagination: undefined, isLoading: true, isError: false });
    renderPage();
    expect(screen.getByLabelText('Loading orders')).toBeInTheDocument();
  });

  it('shows a retryable error state', () => {
    const refetch = vi.fn();
    mockUseAdminOrders.mockReturnValue({ orders: [], pagination: undefined, isLoading: false, isError: true, error: new Error('Order service unavailable'), refetch });
    renderPage();
    expect(screen.getByText('Order service unavailable')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when no orders match the active filters', () => {
    mockUseAdminOrders.mockReturnValue({ orders: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false }, isLoading: false, isError: false });
    renderPage();
    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('renders an order table and applies an accessible status filter', async () => {
    mockUseAdminOrders.mockReturnValue({
      orders: [order],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasMore: false },
      isLoading: false,
      isError: false,
    });
    renderPage();

    expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    expect(screen.getByText('Asha Sharma')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view order ord-1001/i })).toHaveAttribute('href', '/admin/orders/order-1');
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'paid' } });
    await waitFor(() => expect(mockUseAdminOrders).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'paid' })));
  });
});
