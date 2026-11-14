import { Link } from 'react-router-dom';
import { ArrowUpRight, Package } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

export function OrderCard({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const remainingItems = order.items.length - 1;

  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Order</p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-foreground">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 flex items-center gap-4 border-y border-border py-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {firstItem?.image ? (
            <img src={firstItem.image} alt={firstItem.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{firstItem?.name ?? 'Order items'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {firstItem ? `${firstItem.quantity} ${firstItem.quantity === 1 ? 'item' : 'items'}` : 'No items'}
            {remainingItems > 0 ? ` · +${remainingItems} more` : ''}
          </p>
        </div>
        <p className="shrink-0 font-semibold text-foreground">{formatPrice(order.total)}</p>
      </div>

      <div className="mt-5 flex justify-end">
        <Link
          to={`/orders/${order._id}`}
          aria-label={`View order ${order.orderNumber}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          View order <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
