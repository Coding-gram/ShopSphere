import { useEffect } from 'react';
import { ArrowUpRight, IndianRupee, PackageCheck, ShoppingBag, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPrice } from '@/lib/utils';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

function DashboardSkeleton() {
  return <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-lg bg-muted" />)}</div><div className="h-72 animate-pulse rounded-lg bg-muted" /><div className="h-72 animate-pulse rounded-lg bg-muted" /></div>;
}

export default function AdminDashboard() {
  const { dashboard, isLoading, isError, error, refetch } = useAdminDashboard();
  useEffect(() => { document.title = 'Admin Dashboard — ShopSphere'; return () => { document.title = 'ShopSphere'; }; }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'We could not load the dashboard.'} onRetry={() => refetch()} />;
  if (!dashboard) return <ErrorDisplay onRetry={() => refetch()} />;

  const cards = [
    { label: 'Revenue', value: formatPrice(dashboard.metrics.revenue), icon: IndianRupee, detail: 'Paid, non-cancelled orders' },
    { label: 'Paid orders', value: String(dashboard.metrics.paidOrders), icon: WalletCards, detail: 'Revenue-contributing orders' },
    { label: 'All orders', value: String(dashboard.metrics.totalOrders), icon: ShoppingBag, detail: 'Across all current statuses' },
    { label: 'Average order', value: formatPrice(dashboard.metrics.averageOrderValue), icon: PackageCheck, detail: 'Based on paid orders' },
  ];
  const statusCounts = [
    ['placed', dashboard.statusCounts.placed ?? 0],
    ['paid', dashboard.statusCounts.paid ?? 0],
    ['packed', dashboard.statusCounts.packed ?? 0],
    ['shipped', dashboard.statusCounts.shipped ?? 0],
    ['delivered', dashboard.statusCounts.delivered ?? 0],
    ['cancelled', dashboard.statusCounts.cancelled ?? 0],
  ] as const;

  return <div className="mx-auto max-w-7xl space-y-8">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Operations overview</p><h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Live sales and fulfilment signals from persisted orders.</p></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sales metrics">{cards.map(({ label, value, icon: Icon, detail }) => <article key={label} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"><div className="h-1 bg-accent" /><div className="p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{label}</p><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10"><Icon className="h-4.5 w-4.5 text-accent" aria-hidden="true" /></div></div><p className="mt-4 font-heading text-3xl font-semibold tracking-tight text-foreground">{value}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></div></article>)}</section>
    <section className="rounded-lg border border-border bg-card shadow-sm" aria-labelledby="order-status-title"><div className="border-b border-border p-5 sm:p-6"><h2 id="order-status-title" className="font-heading text-xl font-semibold text-foreground">Order status</h2><p className="mt-1 text-sm text-muted-foreground">Current count by lifecycle state in the selected reporting period.</p></div><dl className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">{statusCounts.map(([status, count]) => <div key={status} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-4 py-3.5 transition-colors hover:bg-muted/50"><dt><OrderStatusBadge status={status} /></dt><dd className="font-heading text-xl font-semibold text-foreground">{count}</dd></div>)}</dl></section>
    <section className="rounded-lg border border-border bg-card shadow-sm" aria-labelledby="recent-orders-title"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 sm:p-6"><div><h2 id="recent-orders-title" className="font-heading text-xl font-semibold text-foreground">Recent orders</h2><p className="mt-1 text-sm text-muted-foreground">Newest customer purchases and their current status.</p></div><Link to="/admin/orders" className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Manage orders <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      {dashboard.recentOrders.length === 0 ? <div className="p-5 sm:p-6"><EmptyState icon={ShoppingBag} title="No orders yet" description="Sales metrics will appear after customers place orders." /></div> : <div className="overflow-x-auto"><table className="w-full table-fixed text-left text-sm"><caption className="sr-only">Recent orders</caption><thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3.5 font-medium">Order</th><th className="px-5 py-3.5 font-medium">Customer</th><th className="px-5 py-3.5 font-medium">Status</th><th className="px-5 py-3.5 text-right font-medium">Total</th><th className="px-5 py-3.5"><span className="sr-only">View</span></th></tr></thead><tbody className="divide-y divide-border/70">{dashboard.recentOrders.map((order) => <tr key={order._id} className="transition-colors hover:bg-muted/30"><td className="break-all px-5 py-4 font-medium text-foreground">{order.orderNumber}</td><td className="break-words px-5 py-4 text-muted-foreground">{order.customer?.name ?? 'Deleted customer'}</td><td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td><td className="px-5 py-4 text-right font-medium text-foreground">{formatPrice(order.total)}</td><td className="px-5 py-4 text-right"><Link to={`/admin/orders/${order._id}`} aria-label={`View order ${order.orderNumber}`} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">View</Link></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
