import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPrice } from '@/lib/utils';
import type { AdminOrder } from '@/types';

export function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">Orders matching the selected filters</caption>
        <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th scope="col" className="px-5 py-4">Order</th>
            <th scope="col" className="px-5 py-4">Customer</th>
            <th scope="col" className="px-5 py-4">Payment</th>
            <th scope="col" className="px-5 py-4">Status</th>
            <th scope="col" className="px-5 py-4 text-right">Total</th>
            <th scope="col" className="px-5 py-4">Placed</th>
            <th scope="col" className="px-5 py-4"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order._id} className="transition-colors hover:bg-muted/30">
              <td className="px-5 py-4 font-medium text-foreground">{order.orderNumber}</td>
              <td className="px-5 py-4"><p className="font-medium text-foreground">{order.customer?.name ?? 'Customer unavailable'}</p><p className="mt-1 text-xs text-muted-foreground">{order.customer?.email ?? '—'}</p></td>
              <td className="px-5 py-4 capitalize text-foreground">{order.paymentStatus}</td>
              <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
              <td className="px-5 py-4 text-right font-medium text-foreground">{formatPrice(order.total)}</td>
              <td className="px-5 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              <td className="px-5 py-4 text-right"><Link to={`/admin/orders/${order._id}`} aria-label={`View order ${order.orderNumber}`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">View <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
