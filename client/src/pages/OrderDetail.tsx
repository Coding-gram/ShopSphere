import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Package, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { CancelOrderDialog } from '@/components/orders/CancelOrderDialog';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useCancelOrder, useOrder } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const lifecycle: OrderStatus[] = ['placed', 'paid', 'packed', 'shipped', 'delivered'];
const lifecycleLabels: Record<OrderStatus, string> = { placed: 'Placed', paid: 'Paid', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

function DetailSkeleton() {
  return <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8" aria-busy="true" aria-label="Loading order"><div className="h-8 w-48 animate-pulse rounded bg-muted" /><div className="mt-8 h-80 animate-pulse rounded-lg bg-muted" /></div>;
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const { order, isLoading, isError, error, refetch } = useOrder(orderId);
  const cancelMutation = useCancelOrder();
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    document.title = order ? `${order.orderNumber} — ShopSphere` : 'Order details — ShopSphere';
    return () => { document.title = 'ShopSphere'; };
  }, [order]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !order) return <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8"><ErrorDisplay message={error instanceof Error ? error.message : 'We could not load this order.'} onRetry={() => refetch()} /></div>;

  const canCancel = order.status === 'placed' || order.status === 'paid';
  const currentLifecycleIndex = lifecycle.indexOf(order.status);

  async function confirmCancellation(reason: string, idempotencyKey: string) {
    if (!orderId) return;
    await cancelMutation.mutateAsync({ orderId, reason, idempotencyKey });
    setCancelOpen(false);
    toast.success('Order cancelled and stock released');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <Link to="/orders" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to orders</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Order details</p><h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">{order.orderNumber}</h1><p className="mt-2 text-sm text-muted-foreground">Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="tracking-title">
        <div className="flex items-center gap-3"><Package className="h-5 w-5 text-accent" aria-hidden="true" /><h2 id="tracking-title" className="font-heading text-xl font-semibold text-foreground">Order tracking</h2></div>
        {order.status === 'cancelled' ? <div className="mt-6 flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><p>This order was cancelled. Reserved stock has been released back to inventory.</p></div> : <ol className="mt-6 grid gap-4 sm:grid-cols-5">{lifecycle.map((status, index) => { const completed = index <= currentLifecycleIndex; return <li key={status} className="flex items-center gap-3 sm:block"><div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${completed ? 'border-accent bg-accent text-on-accent' : 'border-border text-muted-foreground'}`} aria-label={`${lifecycleLabels[status]}${completed ? ' complete' : ''}`}>{index + 1}</div><p className={`text-sm sm:mt-2 ${completed ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{lifecycleLabels[status]}</p></li>; })}</ol>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm"><span className="text-muted-foreground">Payment status</span><span className="font-medium capitalize text-foreground">Payment {order.paymentStatus}</span></div>
        {order.paymentStatus === 'paid' && <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" /> Simulated payment remains recorded as paid. Refund processing is not included in this phase.</p>}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="items-title"><h2 id="items-title" className="font-heading text-xl font-semibold text-foreground">Items</h2><ul className="mt-5 divide-y divide-border">{order.items.map((item) => <li key={`${item.product}-${item.name}`} className="flex gap-4 py-4 first:pt-0 last:pb-0"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">{item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />}</div><div className="min-w-0 flex-1"><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">Quantity {item.quantity}</p></div><p className="shrink-0 font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p></li>)}</ul></section>

        <aside className="space-y-6"><section className="rounded-lg border border-border bg-card p-5 shadow-sm" aria-labelledby="summary-title"><h2 id="summary-title" className="font-heading text-xl font-semibold text-foreground">Order summary</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium text-foreground">{formatPrice(order.subtotal)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Shipping</dt><dd className="font-medium text-foreground">{formatPrice(order.shippingCost)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tax</dt><dd className="font-medium text-foreground">{formatPrice(order.tax)}</dd></div></dl><Separator className="my-5" /><div className="flex justify-between gap-4"><span className="font-medium text-foreground">Total</span><span className="text-xl font-semibold text-foreground">{formatPrice(order.total)}</span></div></section>
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm" aria-labelledby="delivery-title"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" aria-hidden="true" /><h2 id="delivery-title" className="font-heading text-xl font-semibold text-foreground">Delivery address</h2></div><address className="mt-4 not-italic text-sm leading-relaxed text-muted-foreground"><strong className="font-medium text-foreground">{order.shippingAddress.fullName}</strong><br />{order.shippingAddress.street}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />{order.shippingAddress.country}<br />{order.shippingAddress.phone}</address></section>
          {canCancel && <Button type="button" variant="outline" onClick={() => setCancelOpen(true)} className="min-h-11 w-full border-destructive/40 text-destructive hover:bg-destructive/10">Cancel order</Button>}
        </aside>
      </div>

      <CancelOrderDialog open={cancelOpen} onOpenChange={setCancelOpen} onConfirm={confirmCancellation} isPending={cancelMutation.isPending} />
    </div>
  );
}
