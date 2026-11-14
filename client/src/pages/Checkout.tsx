import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, LockKeyhole, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AddressBook } from '@/components/address/AddressBook';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { cartQueryKey, useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { checkoutService } from '@/services/checkout';
import { paymentService } from '@/services/payments';
import { formatPrice } from '@/lib/utils';
import type { Order, SimulatedPaymentOutcome } from '@/types';

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, isLoading: isCartLoading, isError: isCartError, error: cartError, refetch: refetchCart } = useCart();
  const { addresses } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string>();
  const [order, setOrder] = useState<Order>();
  const [checkoutError, setCheckoutError] = useState<string>();
  const [paymentError, setPaymentError] = useState<string>();
  const checkoutIdempotencyKey = useRef<string | undefined>(undefined);
  const paymentIdempotencyKey = useRef<string | undefined>(undefined);
  const placeOrder = useMutation({ mutationFn: checkoutService.placeOrder });
  const processPayment = useMutation({ mutationFn: paymentService.processPayment });

  useEffect(() => {
    document.title = 'Checkout — ShopSphere';
    return () => { document.title = 'ShopSphere'; };
  }, []);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses.find((address) => address.isDefault)?._id ?? addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);

  async function submitOrder() {
    if (!selectedAddressId) {
      setCheckoutError('Select or add a delivery address before placing your order.');
      return;
    }

    setCheckoutError(undefined);
    try {
      checkoutIdempotencyKey.current ??= crypto.randomUUID();
      const response = await placeOrder.mutateAsync({
        addressId: selectedAddressId,
        idempotencyKey: checkoutIdempotencyKey.current,
      });
      setOrder(response.data);
      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success('Order created — payment is still required');
    } catch (requestError) {
      setCheckoutError(requestError instanceof Error ? requestError.message : 'We could not place your order. Please review your cart and try again.');
    }
  }

  if (isCartLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8"><div className="h-10 w-36 animate-pulse rounded bg-muted" /><div className="mt-8 grid gap-8 lg:grid-cols-2"><div className="h-96 animate-pulse rounded-lg bg-muted" /><div className="h-72 animate-pulse rounded-lg bg-muted" /></div></div>;
  }
  if (isCartError) return <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8"><ErrorDisplay message={cartError.message || 'We could not load your cart.'} onRetry={() => refetchCart()} /></div>;

  async function submitPayment(outcome: SimulatedPaymentOutcome) {
    if (!order) return;

    setPaymentError(undefined);
    paymentIdempotencyKey.current ??= crypto.randomUUID();

    try {
      const response = await processPayment.mutateAsync({
        orderId: order._id,
        outcome,
        idempotencyKey: paymentIdempotencyKey.current,
      });
      const paymentResult = response.data;
      setOrder((currentOrder) => currentOrder ? {
        ...currentOrder,
        status: paymentResult.order.status,
        paymentStatus: paymentResult.order.paymentStatus,
      } : currentOrder);

      if (paymentResult.order.paymentStatus === 'paid') {
        toast.success('Simulated payment successful');
      } else {
        paymentIdempotencyKey.current = undefined;
        setPaymentError('Payment failed. Your order remains unpaid, and you can retry safely.');
      }
    } catch (requestError) {
      setPaymentError(requestError instanceof Error ? requestError.message : 'Payment could not be processed. Please try again.');
    }
  }

  if (order?.paymentStatus === 'paid') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
        <section className="rounded-lg border border-border bg-card p-6 text-center shadow-sm sm:p-10" aria-labelledby="confirmation-title">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Order confirmed</p>
          <h1 id="confirmation-title" className="mt-2 font-heading text-4xl font-semibold text-foreground sm:text-5xl">Thank you for your order</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Your order <span className="font-medium text-foreground">{order.orderNumber}</span> has been recorded. We’ll use the delivery details you selected.</p>
          <Separator className="my-7" />
          <div className="flex items-center justify-between text-left"><span className="text-sm text-muted-foreground">Final total</span><span className="text-2xl font-semibold text-foreground">{formatPrice(order.total)}</span></div>
          <Button asChild size="lg" className="mt-8 bg-accent text-on-accent hover:bg-accent/90"><Link to="/products">Continue shopping</Link></Button>
        </section>
      </div>
    );
  }

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-10" aria-labelledby="payment-title">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Order created</p>
          <h1 id="payment-title" className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">Complete your payment</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Order <span className="font-medium text-foreground">{order.orderNumber}</span> is reserved but unpaid. Choose a clearly simulated outcome below for this assessment flow.</p>
          <div className="mt-6 flex items-center justify-between border-y border-border py-4">
            <span className="text-sm text-muted-foreground">Order total</span>
            <span className="text-xl font-semibold text-foreground">{formatPrice(order.total)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment status</span>
            <span className="font-medium capitalize text-foreground">Payment {order.paymentStatus}</span>
          </div>
          <p className="mt-6 text-sm font-medium text-foreground">Simulated payment</p>
          <p className="mt-1 text-xs text-muted-foreground">No real payment details or money are collected.</p>
          {paymentError && <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{paymentError}</p>}
          {order.paymentStatus === 'failed' && !paymentError && <p role="status" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">Payment failed. Retry when you are ready.</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button type="button" disabled={processPayment.isPending} onClick={() => submitPayment('success')} className="bg-accent text-on-accent hover:bg-accent/90">
              {processPayment.isPending ? 'Processing…' : 'Simulate payment success'}
            </Button>
            <Button type="button" variant="outline" disabled={processPayment.isPending} onClick={() => submitPayment('failure')}>
              {order.paymentStatus === 'failed' ? 'Retry payment' : 'Simulate payment failure'}
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">A failed attempt does not mark the order paid or create another order. Retrying uses the same order with a new payment attempt.</p>
        </section>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8"><EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add an item before you begin checkout." actionLabel="Browse products" onAction={() => navigate('/products')} className="min-h-[55vh]" /></div>;
  }

  const hasUnavailableItem = cart.items.some((item) => !item.product?.isActive || !item.product.stock || item.quantity > item.product.stock);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Secure checkout</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-foreground sm:text-5xl">Delivery & review</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review your delivery details and complete the simulated payment after your order is created.</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <AddressBook selectedAddressId={selectedAddressId} onSelect={setSelectedAddressId} onAddressSaved={(address) => setSelectedAddressId(address._id)} title="Delivery address" />

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6" aria-label="Checkout review">
          <h2 className="font-heading text-2xl font-semibold text-foreground">Order review</h2>
          <ul className="mt-5 divide-y divide-border">
            {cart.items.map((item) => <li key={item._id} className="flex justify-between gap-4 py-3 text-sm"><span className="min-w-0 text-muted-foreground">{item.product?.name ?? 'Unavailable product'} <span aria-label={`Quantity ${item.quantity}`}>× {item.quantity}</span></span><span className="shrink-0 font-medium text-foreground">{formatPrice(item.lineTotal)}</span></li>)}
          </ul>
          <Separator className="my-5" />
          <div className="flex justify-between gap-4"><span className="font-medium text-foreground">Estimated total</span><span className="text-xl font-semibold text-foreground">{formatPrice(cart.total)}</span></div>
          {checkoutError && <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{checkoutError}</p>}
          {hasUnavailableItem && <p className="mt-4 text-sm text-destructive">Your cart has an unavailable item. Return to the cart to update it.</p>}
          <Button type="button" size="lg" disabled={placeOrder.isPending || hasUnavailableItem} onClick={submitOrder} className="mt-6 w-full bg-accent text-on-accent hover:bg-accent/90">
            {placeOrder.isPending ? 'Verifying order…' : 'Place order'}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Your delivery information is only used for this order.</p>
        </aside>
      </div>
    </div>
  );
}
