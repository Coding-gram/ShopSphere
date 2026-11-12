import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem, isAdding } = useCart();

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : '';
  const categorySlug =
    typeof product.category === 'object' && product.category !== null
      ? product.category.slug
      : '';

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  async function handleAddToCart() {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      await addItem({ productId: product._id, quantity });
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add this item to your cart');
    }
  }

  return (
    <div className="space-y-6">
      {/* Category */}
      {categoryName && (
        <Link
          to={`/products?category=${categorySlug}`}
          className="inline-block text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors duration-200 hover:text-accent"
        >
          {categoryName}
        </Link>
      )}

      {/* Title */}
      <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-foreground">
          {formatPrice(product.price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
            <Badge variant="destructive" className="text-xs">
              -{discountPercent}% OFF
            </Badge>
          </>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {inStock ? (
          lowStock ? (
            <>
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              <span className="text-sm font-medium text-warning">
                Only {product.stock} left in stock
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
              <span className="text-sm font-medium text-success">In Stock</span>
            </>
          )
        ) : (
          <>
            <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
          </>
        )}
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Description
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      </div>

      {/* Variants display (read-only, informational) */}
      {product.variants.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Available Options
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <Badge
                key={`${variant.name}-${variant.value}`}
                variant="secondary"
                className="text-xs"
              >
                {variant.name}: {variant.value}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Quantity + Actions */}
      <div className="space-y-4">
        {inStock && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Quantity</span>
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className={cn(
                  'flex h-10 w-10 items-center justify-center transition-colors duration-150',
                  quantity <= 1
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'text-foreground hover:bg-muted cursor-pointer'
                )}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span
                className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium text-foreground"
                aria-live="polite"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.min(product.stock, 10), q + 1))}
                disabled={quantity >= Math.min(product.stock, 10)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center transition-colors duration-150',
                  quantity >= Math.min(product.stock, 10)
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'text-foreground hover:bg-muted cursor-pointer'
                )}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className="flex-1 gap-2 bg-accent text-on-accent hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            {inStock ? (isAdding ? 'Adding…' : 'Add to Cart') : 'Out of Stock'}
          </Button>
        </div>
      </div>

      {/* SKU */}
      <p className="text-xs text-muted-foreground">
        SKU: {product.sku}
      </p>
    </div>
  );
}

