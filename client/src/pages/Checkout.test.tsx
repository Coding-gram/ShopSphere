import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Checkout from './Checkout';

const { mockUseCart, mockUseAddresses, mockPlaceOrder, mockProcessPayment, mockCartState } = vi.hoisted(() => ({
  mockUseCart: vi.fn(),
  mockUseAddresses: vi.fn(),
  mockPlaceOrder: vi.fn(),
  mockProcessPayment: vi.fn(),
  mockCartState: { current: undefined as { items: Array<{ _id: string; product: { name: string; isActive: boolean; stock: number }; quantity: number; lineTotal: number }>; total: number } | undefined },
}));

vi.mock('@/hooks/useCart', () => ({ cartQueryKey: ['cart'], useCart: () => mockUseCart() }));
vi.mock('@/hooks/useAddresses', () => ({ useAddresses: () => mockUseAddresses() }));
vi.mock('@/components/address/AddressBook', () => ({
  AddressBook: ({ selectedAddressId, onSelect }: { selectedAddressId?: string; onSelect: (id: string) => void }) => (
    <button type="button" onClick={() => onSelect('address-1')}>{selectedAddressId ? 'Address selected' : 'Select address'}</button>
  ),
}));
vi.mock('@/services/checkout', () => ({ checkoutService: { placeOrder: mockPlaceOrder } }));
vi.mock('@/services/payments', () => ({ paymentService: { processPayment: mockProcessPayment } }));

const order = {
  _id: 'order-1',
  orderNumber: 'ORD-1001',
  items: [{ product: 'product-1', name: 'Merino Sweater', image: '', quantity: 1, price: 2500 }],
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

function renderCheckout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><MemoryRouter><Checkout /></MemoryRouter></QueryClientProvider>);
}

describe('Checkout payment flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartState.current = {
      items: [{ _id: 'cart-item-1', product: { name: 'Merino Sweater', isActive: true, stock: 5 }, quantity: 1, lineTotal: 2500 }],
      total: 2500,
    };
    mockUseCart.mockImplementation(() => ({
      cart: mockCartState.current,
      isLoading: false,
      isError: false,
    }));
    mockUseAddresses.mockReturnValue({ addresses: [{ _id: 'address-1', isDefault: true }] });
    mockPlaceOrder.mockImplementation(async () => {
      mockCartState.current = undefined;
      return { data: order };
    });
  });

  it('creates a pending order before offering simulated payment', async () => {
    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: 'Address selected' }));
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => expect(mockPlaceOrder).toHaveBeenCalled());
    expect(await screen.findByText('Simulated payment')).toBeInTheDocument();
    expect(screen.getByText('Payment pending')).toBeInTheDocument();
    expect(screen.queryByText('Order confirmed')).not.toBeInTheDocument();
  });

  it('shows failure and retries payment without creating another order', async () => {
    mockProcessPayment
      .mockResolvedValueOnce({ data: { replayed: false, order: { ...order, status: 'placed', paymentStatus: 'failed' }, paymentAttempt: { _id: 'attempt-1', status: 'failed', amount: 2500, currency: 'INR', failureCode: 'SIMULATED_DECLINE', createdAt: order.createdAt } } })
      .mockResolvedValueOnce({ data: { replayed: false, order: { ...order, status: 'paid', paymentStatus: 'paid' }, paymentAttempt: { _id: 'attempt-2', status: 'succeeded', amount: 2500, currency: 'INR', createdAt: order.createdAt } } });

    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: 'Address selected' }));
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await screen.findByText('Simulated payment');

    fireEvent.click(screen.getByRole('button', { name: 'Simulate payment failure' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Payment failed');
    expect(screen.getByRole('button', { name: 'Retry payment' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Simulate payment success' }));
    await waitFor(() => expect(mockProcessPayment).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Order confirmed')).toBeInTheDocument();
    expect(mockPlaceOrder).toHaveBeenCalledTimes(1);
  });
});
