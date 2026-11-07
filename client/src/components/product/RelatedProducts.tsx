import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from './ProductGrid';
import { ProductGridSkeleton } from './ProductSkeleton';
import type { Product } from '@/types';

interface RelatedProductsProps {
  categorySlug: string;
  currentProductId: string;
}

export function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const { data, isLoading } = useProducts({
    category: categorySlug,
    limit: 5,
  });

  const related = (data?.data ?? []).filter((p: Product) => p._id !== currentProductId).slice(0, 4);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          You May Also Like
        </h2>
        <ProductGridSkeleton count={4} />
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        You May Also Like
      </h2>
      <ProductGrid products={related} />
    </section>
  );
}

