import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import OrderDetail from './OrderDetail';

const { mockUseOrder, mockUseCancelOrder } = vi.hoisted(() => ({ mockUseOrder: vi.fn(), mockUseCancelOrder: vi.fn() }));
vi.mock('@/hooks/useOrders', () => ({ useOrder: (...args: unknown[]) => mockUseOrder(...args), useCancelOrder: (...args: unknown[]) => mockUseCancelOrder(...args) }));

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

function renderDetail() {
  return render(<MemoryRouter initialEntries={['/orders/order-1']}><Routes><Route path="/orders/:orderId" element={<OrderDetail />} /></Routes></MemoryRouter>);
}

describe('OrderDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCancelOrder.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('renders tracking, items, totals, delivery address, and payment status', () => {
    mockUseOrder.mockReturnValue({ order, isLoading: false, isError: false });
    renderDetail();
    expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    expect(screen.getAllByText('Placed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Merino Sweater')).toBeInTheDocument();
    expect(screen.getByText('Asha Sharma')).toBeInTheDocument();
    expect(screen.getByText('Payment pending')).toBeInTheDocument();
  });

  it('opens cancellation confirmation and submits a bounded reason', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockUseOrder.mockReturnValue({ order, isLoading: false, isError: false });
    mockUseCancelOrder.mockReturnValue({ mutateAsync, isPending: false });
    renderDetail();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cancellation reason'), { target: { value: 'Ordered the wrong item' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order-1', reason: 'Ordered the wrong item', idempotencyKey: expect.any(String) })));
  });

  it('reuses the cancellation key when a network error requires a retry', async () => {
    const mutateAsync = vi.fn().mockRejectedValueOnce(new Error('Request timed out')).mockResolvedValueOnce({});
    mockUseOrder.mockReturnValue({ order, isLoading: false, isError: false });
    mockUseCancelOrder.mockReturnValue({ mutateAsync, isPending: false });
    renderDetail();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    fireEvent.change(screen.getByLabelText('Cancellation reason'), { target: { value: 'Ordered the wrong item' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2));
    expect(mutateAsync.mock.calls[0]?.[0].idempotencyKey).toBe(mutateAsync.mock.calls[1]?.[0].idempotencyKey);
  });

  it('shows a detail error state', () => {
    mockUseOrder.mockReturnValue({ order: undefined, isLoading: false, isError: true, error: new Error('Order not found'), refetch: vi.fn() });
    renderDetail();
    expect(screen.getByText('Order not found')).toBeInTheDocument();
  });
});
