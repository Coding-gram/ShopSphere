import { useEffect } from 'react';
import { ClipboardList, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AdminOrdersTable } from '@/components/admin/AdminOrdersTable';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { Pagination } from '@/components/product/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import type { AdminOrderFilters, OrderStatus, PaymentStatus } from '@/types';

const statuses: OrderStatus[] = ['placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

function AdminOrdersSkeleton() {
  return <div className="space-y-3" aria-busy="true" aria-label="Loading orders">{[0, 1, 2].map((index) => <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>;
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const filters: AdminOrderFilters = {
    page,
    limit: 20,
    ...(searchParams.get('status') ? { status: searchParams.get('status') as OrderStatus } : {}),
    ...(searchParams.get('paymentStatus') ? { paymentStatus: searchParams.get('paymentStatus') as PaymentStatus } : {}),
    ...(searchParams.get('dateFrom') ? { dateFrom: searchParams.get('dateFrom') as string } : {}),
    ...(searchParams.get('dateTo') ? { dateTo: searchParams.get('dateTo') as string } : {}),
    ...(searchParams.get('search') ? { search: searchParams.get('search') as string } : {}),
  };
  const { orders, pagination, isLoading, isError, error, refetch } = useAdminOrders(filters);

  useEffect(() => {
    document.title = 'Order Management — ShopSphere';
    return () => { document.title = 'ShopSphere'; };
  }, []);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next, { replace: true });
  }

  function changePage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) next.set('page', String(nextPage)); else next.delete('page');
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Operations</p><h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">Order management</h1><p className="mt-2 text-sm text-muted-foreground">Review payments, delivery progress, and fulfilment status.</p></div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><ClipboardList className="h-4 w-4" aria-hidden="true" />{pagination ? `${pagination.total} orders` : 'Orders'}</div>
      </div>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm" aria-labelledby="order-filter-title">
        <div className="mb-4 flex items-center justify-between gap-4"><h2 id="order-filter-title" className="font-heading text-lg font-semibold text-foreground">Filters</h2><Button type="button" variant="ghost" size="sm" onClick={clearFilters}><RotateCcw className="h-4 w-4" aria-hidden="true" />Clear</Button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input aria-label="Search orders or customers" value={filters.search ?? ''} onChange={(event) => setFilter('search', event.target.value)} placeholder="Order or customer" />
          <select aria-label="Filter by status" value={filters.status ?? ''} onChange={(event) => setFilter('status', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          <select aria-label="Filter by payment status" value={filters.paymentStatus ?? ''} onChange={(event) => setFilter('paymentStatus', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">All payments</option>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          <Input aria-label="Orders from date" type="date" value={filters.dateFrom ?? ''} onChange={(event) => setFilter('dateFrom', event.target.value)} />
          <Input aria-label="Orders through date" type="date" value={filters.dateTo ?? ''} onChange={(event) => setFilter('dateTo', event.target.value)} />
        </div>
      </section>

      {isLoading && <AdminOrdersSkeleton />}
      {isError && <ErrorDisplay message={error instanceof Error ? error.message : 'We could not load admin orders.'} onRetry={() => refetch()} />}
      {!isLoading && !isError && orders.length === 0 && <EmptyState icon={ClipboardList} title="No orders found" description="Try changing or clearing the selected filters." />}
      {!isLoading && !isError && orders.length > 0 && <><AdminOrdersTable orders={orders} />{pagination && <Pagination pagination={pagination} onPageChange={changePage} className="pt-2" />}</>}
    </div>
  );
}
