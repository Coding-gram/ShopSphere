import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';
import { ProductFilters, ActiveFilterBadges, SORT_OPTIONS } from '@/components/product/ProductFilters';
import { Pagination } from '@/components/product/Pagination';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { ProductFilters as ProductFiltersType } from '@/services/products';

const DEFAULT_SORT = 'createdAt:desc';
const PAGE_SIZE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Read URL state ────────────────────────────────────────────────────────

  const searchQuery = searchParams.get('search') ?? '';
  const selectedCategory = searchParams.get('category') ?? '';
  const selectedSort = searchParams.get('sort') ?? DEFAULT_SORT;
  const currentPage = Number(searchParams.get('page')) || 1;

  // Local search input state (debounced before URL sync)
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 400);

  // ── URL update helpers ────────────────────────────────────────────────────

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
        }
        // Reset to page 1 when filters change (but not when page itself changes)
        if (!('page' in updates)) {
          next.delete('page');
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  // Sync debounced search to URL via effect (not during render)
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      const next = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      next.delete('page');
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Parse sort into field + order ─────────────────────────────────────────

  const [sortField, sortOrder] = selectedSort.split(':') as [string, 'asc' | 'desc'];

  // ── Build API filters ─────────────────────────────────────────────────────

  const filters: ProductFiltersType = {
    page: currentPage,
    limit: PAGE_SIZE,
    sort: sortField,
    order: sortOrder,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategory && { category: selectedCategory }),
  };

  // ── Fetch data ────────────────────────────────────────────────────────────

  const {
    data: productsResponse,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
    refetch: refetchProducts,
  } = useProducts(filters);

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
  } = useCategories();

  const products = productsResponse?.data ?? [];
  const pagination = productsResponse?.pagination ?? null;
  const categories = categoriesResponse?.data ?? [];

  // ── Filter change handlers ────────────────────────────────────────────────

  const handleCategoryChange = useCallback(
    (slug: string) => {
      updateParams({ category: slug || undefined });
      setMobileFiltersOpen(false);
    },
    [updateParams]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateParams({ sort: value === DEFAULT_SORT ? undefined : value });
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page > 1 ? String(page) : undefined });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateParams]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
    setMobileFiltersOpen(false);
  }, [setSearchParams]);

  const handleRemoveSearch = useCallback(() => {
    setSearchInput('');
    updateParams({ search: undefined });
  }, [updateParams]);

  const handleRemoveCategory = useCallback(() => {
    updateParams({ category: undefined });
  }, [updateParams]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const hasActiveFilters = !!selectedCategory || !!searchQuery;
  const activeFilterCount = [selectedCategory, searchQuery].filter(Boolean).length;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === selectedSort)?.label ?? 'Newest';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Collection
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name ?? 'Products'
            : 'All Products'}
        </h1>
      </div>

      {/* Search + mobile filter toggle */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            aria-label="Search products"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateParams({ search: undefined });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Mobile filter trigger */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="relative inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted lg:hidden"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="h-5 w-5 justify-center rounded-full p-0 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-heading text-xl">Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ProductFilters
                categories={categories}
                categoriesLoading={categoriesLoading}
                selectedCategory={selectedCategory}
                selectedSort={selectedSort}
                onCategoryChange={handleCategoryChange}
                onSortChange={handleSortChange}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content: sidebar + grid */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Product filters">
          <div className="sticky top-28">
            <ProductFilters
              categories={categories}
              categoriesLoading={categoriesLoading}
              selectedCategory={selectedCategory}
              selectedSort={selectedSort}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </aside>

        {/* Product grid area */}
        <div className="min-w-0 flex-1">
          {/* Results info + active filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {pagination && !productsLoading && (
                <p className="text-sm text-muted-foreground">
                  {pagination.total === 0
                    ? 'No products found'
                    : pagination.total === 1
                      ? '1 product'
                      : `${pagination.total} products`}
                  {selectedCategory || searchQuery ? ' matching your filters' : ''}
                </p>
              )}
            </div>

            {/* Desktop sort (visible when sidebar is hidden on smaller screens, or as supplementary) */}
            <p className="text-xs text-muted-foreground lg:hidden">
              Sorted by: <span className="font-medium text-foreground">{sortLabel}</span>
            </p>
          </div>

          {/* Active filter badges */}
          <ActiveFilterBadges
            selectedCategory={selectedCategory}
            categories={categories}
            searchQuery={searchQuery}
            onRemoveCategory={handleRemoveCategory}
            onRemoveSearch={handleRemoveSearch}
          />
          {hasActiveFilters && <div className="mb-4" />}

          {/* Loading */}
          {productsLoading && <ProductGridSkeleton count={PAGE_SIZE} />}

          {/* Error */}
          {productsError && (
            <ErrorDisplay
              message={
                productsErrorObj instanceof Error
                  ? productsErrorObj.message
                  : 'Failed to load products.'
              }
              onRetry={() => refetchProducts()}
            />
          )}

          {/* Empty */}
          {!productsLoading && !productsError && products.length === 0 && (
            <EmptyState
              title="No products found"
              description={
                hasActiveFilters
                  ? 'Try adjusting your filters or search terms.'
                  : 'Products will appear here once they are added.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
              onAction={hasActiveFilters ? handleClearFilters : undefined}
            />
          )}

          {/* Product grid */}
          {!productsLoading && !productsError && products.length > 0 && (
            <>
              <ProductGrid products={products} />

              {/* Pagination */}
              {pagination && (
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  className="mt-10"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
