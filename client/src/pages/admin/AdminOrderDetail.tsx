import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { AdminOrderTransitionDialog } from '@/components/admin/AdminOrderTransitionDialog';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAdminOrder, useAdminOrderTransition } from '@/hooks/useAdminOrders';
import { formatPrice } from '@/lib/utils';
import type { AdminLifecycleStatus } from '@/types';

const nextStatuses: Record<string, AdminLifecycleStatus | undefined> = { paid: 'packed', packed: 'shipped', shipped: 'delivered' };
const actionLabels: Record<AdminLifecycleStatus, string> = { packed: 'Mark as packed', shipped: 'Mark as shipped', delivered: 'Mark as delivered' };

function DetailSkeleton() {
  return <div className="space-y-6" aria-busy="true" aria-label="Loading order"><div className="h-8 w-52 animate-pulse rounded bg-muted" /><div className="h-96 animate-pulse rounded-lg bg-muted" /></div>;
}

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const { order, isLoading, isError, error, refetch } = useAdminOrder(orderId);
  const transitionMutation = useAdminOrderTransition();
  const [pendingStatus, setPendingStatus] = useState<AdminLifecycleStatus | null>(null);

  useEffect(() => {
    document.title = order ? `${order.orderNumber} — Admin — ShopSphere` : 'Admin order — ShopSphere';
    return () => { document.title = 'ShopSphere'; };
  }, [order]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !order) return <ErrorDisplay message={error instanceof Error ? error.message : 'We could not load this order.'} onRetry={() => refetch()} />;

  const nextStatus = nextStatuses[order.status];
  async function confirmTransition(note?: string) {
    if (!orderId || !pendingStatus) return;
    await transitionMutation.mutateAsync({ orderId, status: pendingStatus, note });
    toast.success(`Order marked ${pendingStatus}`);
    setPendingStatus(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/admin/orders" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to orders</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Order record</p><h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">{order.orderNumber}</h1><p className="mt-2 text-sm text-muted-foreground">Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div><OrderStatusBadge status={order.status} /></div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="admin-items-title"><div className="flex items-center gap-2"><Package className="h-5 w-5 text-accent" aria-hidden="true" /><h2 id="admin-items-title" className="font-heading text-xl font-semibold text-foreground">Items</h2></div><ul className="mt-4 divide-y divide-border">{order.items.map((item) => <li key={`${item.product}-${item.name}`} className="flex justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="font-medium text-foreground">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">Quantity {item.quantity} · {formatPrice(item.price)} each</p></div><p className="shrink-0 font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p></li>)}</ul></section>
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="history-title"><h2 id="history-title" className="font-heading text-xl font-semibold text-foreground">Status history</h2><ol className="mt-5 space-y-4 border-l border-border pl-5">{order.statusHistory.map((entry, index) => <li key={`${entry.status}-${entry.timestamp}-${index}`}><div className="-ml-[1.7rem] mt-1 h-3 w-3 rounded-full border-2 border-card bg-accent" aria-hidden="true" /><p className="-mt-4 font-medium capitalize text-foreground">{entry.status}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString('en-IN')}</p>{entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}</li>)}</ol></section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm" aria-labelledby="customer-title"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-accent" aria-hidden="true" /><h2 id="customer-title" className="font-heading text-xl font-semibold text-foreground">Customer</h2></div><div className="mt-4 text-sm"><p className="font-medium text-foreground">{order.customer?.name ?? 'Customer unavailable'}</p><p className="mt-1 text-muted-foreground">{order.customer?.email ?? 'No customer email available'}</p></div></section>
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm" aria-labelledby="payment-title"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" /><h2 id="payment-title" className="font-heading text-xl font-semibold text-foreground">Payment</h2></div><p className="mt-4 font-medium capitalize text-foreground">Payment {order.paymentStatus}</p><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Shipping</dt><dd>{formatPrice(order.shippingCost)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tax</dt><dd>{formatPrice(order.tax)}</dd></div></dl><Separator className="my-5" /><div className="flex justify-between gap-4 font-semibold text-foreground"><span>Total</span><span>{formatPrice(order.total)}</span></div></section>
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm" aria-labelledby="address-title"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" aria-hidden="true" /><h2 id="address-title" className="font-heading text-xl font-semibold text-foreground">Delivery address</h2></div><address className="mt-4 not-italic text-sm leading-relaxed text-muted-foreground"><strong className="font-medium text-foreground">{order.shippingAddress.fullName}</strong><br />{order.shippingAddress.street}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />{order.shippingAddress.country}<br />{order.shippingAddress.phone}</address></section>
          {nextStatus && <Button type="button" className="min-h-11 w-full" onClick={() => setPendingStatus(nextStatus)} disabled={transitionMutation.isPending}>{actionLabels[nextStatus]}</Button>}
        </aside>
      </div>
      <AdminOrderTransitionDialog open={Boolean(pendingStatus)} status={pendingStatus} isPending={transitionMutation.isPending} onOpenChange={(open) => { if (!open) setPendingStatus(null); }} onConfirm={confirmTransition} />
    </div>
  );
}
