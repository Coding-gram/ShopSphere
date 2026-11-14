import { Link } from 'react-router-dom';
import { Minus, PackageX, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  isUpdating?: boolean;
  isRemoving?: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({
  item,
  isUpdating = false,
  isRemoving = false,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const product = item.product;
  const isAvailable = Boolean(product?.isActive && product.stock > 0);
  const maxQuantity = product ? Math.min(product.stock, 10) : 0;
  const productName = product?.name ?? 'Unavailable product';

  return (
    <li className="grid gap-4 py-5 sm:grid-cols-[6rem_1fr_auto] sm:items-center sm:gap-5">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-border bg-muted sm:h-24 sm:w-24">
        {product?.images[0] ? (
          <img src={product.images[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <PackageX className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 space-y-2">
        {product ? (
          <Link
            to={`/products/${product.slug}`}
            className="font-heading text-xl font-semibold text-foreground transition-colors duration-200 hover:text-accent"
          >
            {product.name}
          </Link>
        ) : (
          <p className="font-heading text-xl font-semibold text-foreground">{productName}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {isAvailable ? formatPrice(item.price) : 'This product is no longer available.'}
        </p>

        {isAvailable ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quantity</span>
            <div className="flex items-center rounded-md border border-border bg-background">
              <button
                type="button"
                aria-label={`Decrease quantity for ${productName}`}
                disabled={isUpdating || item.quantity <= 1}
                onClick={() => onQuantityChange(item._id, item.quantity - 1)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center transition-colors duration-150',
                  item.quantity <= 1 || isUpdating
                    ? 'cursor-not-allowed text-muted-foreground/50'
                    : 'cursor-pointer text-foreground hover:bg-muted',
                )}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex h-9 w-9 items-center justify-center border-x border-border text-sm font-medium" aria-live="polite">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity for ${productName}`}
                disabled={isUpdating || item.quantity >= maxQuantity}
                onClick={() => onQuantityChange(item._id, item.quantity + 1)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center transition-colors duration-150',
                  item.quantity >= maxQuantity || isUpdating
                    ? 'cursor-not-allowed text-muted-foreground/50'
                    : 'cursor-pointer text-foreground hover:bg-muted',
                )}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {product && product.stock < item.quantity && (
              <span className="text-xs font-medium text-destructive">Only {product.stock} available</span>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <p className="text-base font-semibold text-foreground">{formatPrice(item.lineTotal)}</p>
        <button
          type="button"
          aria-label={`Remove ${productName} from cart`}
          disabled={isRemoving}
          onClick={() => onRemove(item._id)}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Remove
        </button>
      </div>
    </li>
  );
}
