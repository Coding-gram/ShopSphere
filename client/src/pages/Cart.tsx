import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '@/components/cart/CartItem';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-busy="true" aria-label="Loading cart">
      <div className="h-10 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5 rounded-lg border border-border bg-card p-5">
          {[0, 1].map((item) => <div key={item} className="h-28 animate-pulse rounded bg-muted" />)}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { cart, isLoading, isError, error, refetch, updateItem, removeItem, isUpdating, isRemoving } = useCart();

  useEffect(() => {
    document.title = 'Shopping Cart — ShopSphere';
    return () => { document.title = 'ShopSphere'; };
  }, []);

  async function changeQuantity(itemId: string, quantity: number) {
    try {
      await updateItem({ itemId, quantity });
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Unable to update cart');
    }
  }

  async function removeCartItem(itemId: string) {
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Unable to remove item');
    }
  }

  if (isLoading) return <CartSkeleton />;
  if (isError) return <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8"><ErrorDisplay message={error.message || 'We could not load your cart.'} onRetry={() => refetch()} /></div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h1 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">Shopping Cart</h1>
        <EmptyState title="Your cart is empty" description="Discover considered pieces for your collection." actionLabel="Continue shopping" onAction={() => navigate('/products')} className="min-h-[45vh]" />
      </div>
    );
  }

  const hasUnavailableItem = cart.items.some((item) => !item.product?.isActive || !item.product.stock || item.quantity > item.product.stock);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">Shopping Cart</h1>
          <p className="mt-2 text-sm text-muted-foreground">{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} selected</p>
        </div>
        <Link to="/products" className="text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground">Continue shopping</Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-label="Cart items" className="rounded-lg border border-border bg-card px-5 shadow-sm sm:px-6">
          <ul className="divide-y divide-border">
            {cart.items.map((item) => (
              <CartItem key={item._id} item={item} isUpdating={isUpdating} isRemoving={isRemoving} onQuantityChange={changeQuantity} onRemove={removeCartItem} />
            ))}
          </ul>
        </section>

        <aside className="overflow-hidden rounded-lg border border-border bg-card shadow-sm" aria-label="Order summary">
          <div className="h-1 bg-accent" />
          <div className="p-5 sm:p-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium text-foreground">{formatPrice(cart.subtotal)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Shipping</dt><dd className="font-medium text-foreground">Calculated at checkout</dd></div>
          </dl>
          <Separator className="my-5" />
          <div className="flex items-baseline justify-between gap-4"><span className="font-medium text-foreground">Estimated total</span><span className="text-xl font-semibold text-foreground">{formatPrice(cart.total)}</span></div>
          {hasUnavailableItem && <p className="mt-4 text-xs leading-relaxed text-destructive">Remove or update unavailable items before checking out.</p>}
          {hasUnavailableItem ? (
            <Button disabled size="lg" className="mt-6 w-full bg-accent text-on-accent hover:bg-accent/90">Checkout <ArrowRight aria-hidden="true" /></Button>
          ) : (
            <Button asChild size="lg" className="mt-6 w-full bg-accent text-on-accent hover:bg-accent/90">
              <Link to="/checkout">Checkout <ArrowRight aria-hidden="true" /></Link>
            </Button>
          )}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Prices and availability are verified securely at checkout.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
