import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';
import type { Category } from '@/types';

// ── Sort options matching backend sort fields ─────────────────────────────────

export interface SortOption {
  label: string;
  value: string; // "field:order" format
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Oldest', value: 'createdAt:asc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Name: A-Z', value: 'name:asc' },
  { label: 'Name: Z-A', value: 'name:desc' },
  { label: 'Rating', value: 'avgRating:desc' },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProductFiltersProps {
  categories: Category[];
  categoriesLoading: boolean;
  selectedCategory: string;
  selectedSort: string;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (slug: string) => void;
  onSortChange: (value: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

// ── Filter sidebar (used in desktop layout and Sheet content) ─────────────────

export function ProductFilters({
  categories,
  categoriesLoading,
  selectedCategory,
  selectedSort,
  minPrice,
  maxPrice,
  onCategoryChange,
  onSortChange,
  onPriceChange,
  onClearFilters,
  hasActiveFilters,
  className,
}: ProductFiltersProps) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  // Sync local state when props change (e.g. clear filters)
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  function handlePriceBlur() {
    onPriceChange(localMin, localMax);
  }

  function handlePriceKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      onPriceChange(localMin, localMax);
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Clear all
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Sort By
        </label>
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Category
        </label>

        {categoriesLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        )}

        {!categoriesLoading && (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onCategoryChange('')}
              className={cn(
                'cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200',
                !selectedCategory
                  ? 'bg-primary text-on-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => onCategoryChange(cat.slug)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200',
                  selectedCategory === cat.slug
                    ? 'bg-primary text-on-primary'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Price range */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Price Range
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={handlePriceKeyDown}
              className="pl-7 text-sm"
              aria-label="Minimum price"
            />
          </div>
          <span className="text-xs text-muted-foreground">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={handlePriceKeyDown}
              className="pl-7 text-sm"
              aria-label="Maximum price"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Active filter badges (shown above product grid) ───────────────────────────

interface ActiveFilterBadgesProps {
  selectedCategory: string;
  categories: Category[];
  searchQuery: string;
  minPrice: string;
  maxPrice: string;
  onRemoveCategory: () => void;
  onRemoveSearch: () => void;
  onRemovePrice: () => void;
}

export function ActiveFilterBadges({
  selectedCategory,
  categories,
  searchQuery,
  minPrice,
  maxPrice,
  onRemoveCategory,
  onRemoveSearch,
  onRemovePrice,
}: ActiveFilterBadgesProps) {
  const categoryName = categories.find((c) => c.slug === selectedCategory)?.name;
  const hasPriceFilter = minPrice || maxPrice;

  if (!categoryName && !searchQuery && !hasPriceFilter) return null;

  const priceLabel = hasPriceFilter
    ? minPrice && maxPrice
      ? `${formatPrice(Number(minPrice))} – ${formatPrice(Number(maxPrice))}`
      : minPrice
        ? `From ${formatPrice(Number(minPrice))}`
        : `Up to ${formatPrice(Number(maxPrice))}`
    : '';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Active filters:</span>
      {categoryName && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {categoryName}
          <button
            type="button"
            onClick={onRemoveCategory}
            className="ml-0.5 cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-muted-foreground/20"
            aria-label={`Remove ${categoryName} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {searchQuery && (
        <Badge variant="secondary" className="gap-1 pr-1">
          &quot;{searchQuery}&quot;
          <button
            type="button"
            onClick={onRemoveSearch}
            className="ml-0.5 cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-muted-foreground/20"
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {hasPriceFilter && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {priceLabel}
          <button
            type="button"
            onClick={onRemovePrice}
            className="ml-0.5 cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-muted-foreground/20"
            aria-label="Remove price filter"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
