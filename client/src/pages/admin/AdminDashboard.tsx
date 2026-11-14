import { useEffect, useState } from 'react';
import { ArrowUpRight, IndianRupee, Loader2, PackageCheck, ShoppingBag, Trash2, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { adminDashboardService } from '@/services/adminDashboard';

function DashboardSkeleton() {
  return <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-lg bg-muted" />)}</div><div className="h-64 animate-pulse rounded-lg bg-muted" /></div>;
}

const CONFIRM_PHRASE = 'CLEAR ALL';

export default function AdminDashboard() {
  const { dashboard, isLoading, isError, error, refetch } = useAdminDashboard();
  const queryClient = useQueryClient();

  const [resetOpen, setResetOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const resetMutation = useMutation({
    mutationFn: () => adminDashboardService.resetData(),
    onSuccess: (res) => {
      const deleted = res.data?.deleted;
      const total = deleted ? Object.values(deleted).reduce((s, n) => s + n, 0) : 0;
      toast.success(`Cleared ${total} records across all collections`);
      setResetOpen(false);
      setConfirmInput('');
      queryClient.invalidateQueries();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to clear data');
    },
  });

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

  const canConfirm = confirmInput.trim() === CONFIRM_PHRASE;

  return <div className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Operations overview</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Live sales and fulfilment signals from persisted orders.</p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => { setResetOpen(true); setConfirmInput(''); }}
        className="mt-2 gap-2"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Clear all data
      </Button>
    </div>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sales metrics">{cards.map(({ label, value, icon: Icon, detail }) => <article key={label} className="rounded-lg border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{label}</p><Icon className="h-5 w-5 text-accent" aria-hidden="true" /></div><p className="mt-4 font-heading text-3xl font-semibold text-foreground">{value}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></article>)}</section>
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="order-status-title"><div><h2 id="order-status-title" className="font-heading text-xl font-semibold text-foreground">Order status</h2><p className="mt-1 text-sm text-muted-foreground">Current count by lifecycle state in the selected reporting period.</p></div><dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{statusCounts.map(([status, count]) => <div key={status} className="flex items-center justify-between rounded-md border border-border/70 bg-muted/30 px-4 py-3"><dt><OrderStatusBadge status={status} /></dt><dd className="font-heading text-xl font-semibold text-foreground">{count}</dd></div>)}</dl></section>
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="recent-orders-title"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="recent-orders-title" className="font-heading text-xl font-semibold text-foreground">Recent orders</h2><p className="mt-1 text-sm text-muted-foreground">Newest customer purchases and their current status.</p></div><Link to="/admin/orders" className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-accent hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Manage orders <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      {dashboard.recentOrders.length === 0 ? <EmptyState icon={ShoppingBag} title="No orders yet" description="Sales metrics will appear after customers place orders." /> : <div className="mt-5 overflow-x-auto"><table className="w-full table-fixed text-left text-sm"><caption className="sr-only">Recent orders</caption><thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-3 font-medium">Order</th><th className="px-3 py-3 font-medium">Customer</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 text-right font-medium">Total</th><th className="px-3 py-3"><span className="sr-only">View</span></th></tr></thead><tbody>{dashboard.recentOrders.map((order) => <tr key={order._id} className="border-b border-border/70 last:border-0"><td className="break-all px-3 py-4 font-medium text-foreground">{order.orderNumber}</td><td className="break-words px-3 py-4 text-muted-foreground">{order.customer?.name ?? 'Deleted customer'}</td><td className="px-3 py-4"><OrderStatusBadge status={order.status} /></td><td className="px-3 py-4 text-right font-medium text-foreground">{formatPrice(order.total)}</td><td className="px-3 py-4 text-right"><Link to={`/admin/orders/${order._id}`} aria-label={`View order ${order.orderNumber}`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 py-2 font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">View</Link></td></tr>)}</tbody></table></div>}
    </section>

    {/* ── Clear all data confirmation dialog ── */}
    <Dialog open={resetOpen} onOpenChange={(open) => { if (!resetMutation.isPending) { setResetOpen(open); setConfirmInput(''); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Clear all data</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>all products, categories, orders, carts, addresses, payments, and audit events</strong>. Customer accounts will not be affected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground">
            Type <span className="font-semibold text-foreground">{CONFIRM_PHRASE}</span> to confirm:
          </p>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Type ${CONFIRM_PHRASE} to confirm`}
          />
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => { setResetOpen(false); setConfirmInput(''); }}
            disabled={resetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canConfirm || resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
          >
            {resetMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {resetMutation.isPending ? 'Clearing…' : 'Clear all data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
