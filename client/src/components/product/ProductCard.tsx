import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * Generates a deterministic gradient for products without images.
 * Uses the product name to pick from a curated set of warm,
 * editorial-quality color pairs from the ShopSphere palette.
 */
const GRADIENT_PAIRS = [
  ['#292524', '#44403C'], // stone dark
  ['#1C1917', '#57534E'], // warm charcoal
  ['#292524', '#78716C'], // warm stone
  ['#1C1917', '#A16207'], // primary → accent
  ['#44403C', '#78716C'], // muted warm
  ['#292524', '#A16207'], // dark → gold
] as const;

function getProductGradient(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  return `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`;
}

function getProductInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 2 || name.split(' ').length <= 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = product.images[0];
  const hasImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : '';

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn('group block cursor-pointer', className)}
      aria-label={`View ${product.name} — ${formatPrice(product.price)}`}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setFailedImageUrl(imageUrl)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: getProductGradient(product.name) }}
            aria-hidden="true"
          >
            <span className="select-none font-heading text-4xl font-semibold tracking-wide text-white/80 sm:text-5xl">
              {getProductInitials(product.name)}
            </span>
          </div>
        )}


        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge variant="destructive" className="text-[10px]">
              -{discountPercent}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              Low Stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="text-[10px]">
              Sold Out
            </Badge>
          )}
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3 space-y-1">
        {categoryName && (
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {categoryName}
          </p>
        )}
        <h3 className="font-heading text-base font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-accent sm:text-lg">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
            <span className="text-xs font-medium text-foreground">
              {product.avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
