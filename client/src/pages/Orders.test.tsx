import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Orders from './Orders';

const { mockUseOrders } = vi.hoisted(() => ({ mockUseOrders: vi.fn() }));
vi.mock('@/hooks/useOrders', () => ({ useOrders: (...args: unknown[]) => mockUseOrders(...args) }));

const order = {
  _id: 'order-1',
  orderNumber: 'ORD-1001',
  items: [{ product: 'product-1', name: 'Merino Sweater', image: '', quantity: 2, price: 1250 }],
  shippingAddress: { fullName: 'Asha Sharma', phone: '9876543210', street: '42 Market Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
  subtotal: 2500,
  shippingCost: 0,
  tax: 0,
  total: 2500,
  status: 'placed' as const,
  paymentStatus: 'pending' as const,
  statusHistory: [{ status: 'placed' as const, timestamp: '2026-01-01T00:00:00Z' }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderOrders() {
  return render(<MemoryRouter initialEntries={['/orders']}><Orders /></MemoryRouter>);
}

describe('Orders page', () => {
  it('shows a loading state', () => {
    mockUseOrders.mockReturnValue({ orders: [], pagination: undefined, isLoading: true, isError: false });
    renderOrders();
    expect(screen.getByLabelText('Loading orders')).toBeInTheDocument();
  });

  it('shows an empty state', () => {
    mockUseOrders.mockReturnValue({ orders: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false }, isLoading: false, isError: false });
    renderOrders();
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });

  it('shows an error state with retry', () => {
    const refetch = vi.fn();
    mockUseOrders.mockReturnValue({ orders: [], pagination: undefined, isLoading: false, isError: true, error: new Error('Order service unavailable'), refetch });
    renderOrders();
    expect(screen.getByText('Order service unavailable')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders order history cards and pagination', () => {
    mockUseOrders.mockReturnValue({ orders: [order], pagination: { page: 1, limit: 10, total: 11, totalPages: 2, hasMore: true }, isLoading: false, isError: false });
    renderOrders();
    expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    expect(screen.getByText('Merino Sweater')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view order ord-1001/i })).toHaveAttribute('href', '/orders/order-1');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });
});
