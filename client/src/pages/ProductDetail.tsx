import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { ProductImages } from '@/components/product/ProductImages';
import { ProductInfo } from '@/components/product/ProductInfo';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-md sm:h-20 sm:w-20" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-baseline gap-3">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-px w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, error, refetch } = useProduct(slug ?? '');

  const product = data?.data;

  // Set page title when product loads
  useEffect(() => {
    if (product) {
      document.title = `${product.name} — ShopSphere`;
    } else {
      document.title = 'Product — ShopSphere';
    }
    return () => { document.title = 'ShopSphere'; };
  }, [product]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    const is404 =
      error && 'response' in (error as Record<string, unknown>) &&
      (error as Record<string, unknown> & { response: { status: number } }).response?.status === 404;

    if (is404) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-7xl font-heading font-semibold text-muted-foreground/30 sm:text-9xl">
            404
          </p>
          <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Product Not Found
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The product you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-secondary"
          >
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <ErrorDisplay
          message="Failed to load product. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : '';
  const categorySlug =
    typeof product.category === 'object' && product.category !== null
      ? product.category.slug
      : '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link
              to="/"
              className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link
              to="/products"
              className="transition-colors duration-200 hover:text-foreground"
            >
              Products
            </Link>
          </li>
          {categoryName && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link
                  to={`/products?category=${categorySlug}`}
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  {categoryName}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <span className="font-medium text-foreground">{product.name}</span>
          </li>
        </ol>
      </nav>

      {/* Product layout */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductImages images={product.images} productName={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Related products */}
      {categorySlug && (
        <>
          <Separator className="my-16" />
          <RelatedProducts
            categorySlug={categorySlug}
            currentProductId={product._id}
          />
        </>
      )}
    </div>
  );
}

