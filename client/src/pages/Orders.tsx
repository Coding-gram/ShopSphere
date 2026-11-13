import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { Pagination } from '@/components/product/Pagination';
import { useOrders } from '@/hooks/useOrders';

function OrdersSkeleton() {
  return <div className="space-y-5" aria-busy="true" aria-label="Loading orders">{[0, 1].map((item) => <div key={item} className="h-56 animate-pulse rounded-lg bg-muted" />)}</div>;
}

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { orders, pagination, isLoading, isError, error, refetch } = useOrders(page);

  useEffect(() => {
    document.title = 'My Orders — ShopSphere';
    return () => { document.title = 'ShopSphere'; };
  }, []);

  function changePage(nextPage: number) {
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {}, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your account</p>
        <h1 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">My Orders</h1>
        <p className="text-sm text-muted-foreground">Review your purchases, delivery progress, and order details.</p>
      </div>

      <div className="mt-8">
        {isLoading && <OrdersSkeleton />}
        {isError && <ErrorDisplay message={error instanceof Error ? error.message : 'We could not load your orders.'} onRetry={() => refetch()} />}
        {!isLoading && !isError && orders.length === 0 && <EmptyState icon={ClipboardList} title="No orders yet" description="Your completed purchases will appear here." actionLabel="Browse products" onAction={() => navigate('/products')} />}
        {!isLoading && !isError && orders.length > 0 && (
          <>
            <div className="space-y-5" role="list" aria-label="Order history">
              {orders.map((order) => <div key={order._id} role="listitem"><OrderCard order={order} /></div>)}
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={changePage} className="mt-10" />}
          </>
        )}
      </div>
    </div>
  );
}
