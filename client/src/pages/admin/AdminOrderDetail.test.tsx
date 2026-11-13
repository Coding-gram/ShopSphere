import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminOrderDetail from './AdminOrderDetail';

const { mockUseAdminOrder, mockUseAdminOrderTransition } = vi.hoisted(() => ({
  mockUseAdminOrder: vi.fn(),
  mockUseAdminOrderTransition: vi.fn(),
}));
vi.mock('@/hooks/useAdminOrders', () => ({
  useAdminOrder: (...args: unknown[]) => mockUseAdminOrder(...args),
  useAdminOrderTransition: (...args: unknown[]) => mockUseAdminOrderTransition(...args),
}));

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
  statusHistory: [{ status: 'placed' as const, timestamp: '2026-01-01T00:00:00Z' }, { status: 'paid' as const, timestamp: '2026-01-01T01:00:00Z' }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderPage() {
  return render(<MemoryRouter initialEntries={['/admin/orders/order-1']}><Routes><Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} /></Routes></MemoryRouter>);
}

describe('AdminOrderDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminOrderTransition.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('shows allowlisted customer, payment, address, and history details', () => {
    mockUseAdminOrder.mockReturnValue({ order, isLoading: false, isError: false });
    renderPage();
    expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    expect(screen.getByText('asha@example.com')).toBeInTheDocument();
    expect(screen.getByText('Payment paid')).toBeInTheDocument();
    expect(screen.getByText(/42 Market Road/)).toBeInTheDocument();
    expect(screen.getByText('Status history')).toBeInTheDocument();
  });

  it('requires confirmation before advancing an eligible order and submits the bounded note', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockUseAdminOrder.mockReturnValue({ order, isLoading: false, isError: false });
    mockUseAdminOrderTransition.mockReturnValue({ mutateAsync, isPending: false });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Mark as packed' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Transition note'), { target: { value: 'Picked and ready' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm transition' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ orderId: 'order-1', status: 'packed', note: 'Picked and ready' }));
  });

  it('shows a meaningful transition error without closing the confirmation dialog', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Order status changed concurrently. Refresh and try again.'));
    mockUseAdminOrder.mockReturnValue({ order, isLoading: false, isError: false });
    mockUseAdminOrderTransition.mockReturnValue({ mutateAsync, isPending: false });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Mark as packed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm transition' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Order status changed concurrently');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows a retryable error state', () => {
    const refetch = vi.fn();
    mockUseAdminOrder.mockReturnValue({ order: undefined, isLoading: false, isError: true, error: new Error('Order not found'), refetch });
    renderPage();
    expect(screen.getByText('Order not found')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(refetch).toHaveBeenCalled();
  });
});
