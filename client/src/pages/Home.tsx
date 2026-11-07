import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';
import { CategoryCard } from '@/components/product/CategoryCard';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

// ── Animation variants (MASTER.md: 300-450ms, back.out easing) ────────────────

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

// ── Trust features (static content) ───────────────────────────────────────────

const trustFeatures = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Complimentary shipping on orders above ₹2,999',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Your transactions are protected end-to-end',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns and exchanges',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Dedicated team available around the clock',
  },
];

// ── Homepage ──────────────────────────────────────────────────────────────────

export default function Home() {
  const {
    data: featuredResponse,
    isLoading: featuredLoading,
    isError: featuredError,
    error: featuredErrorObj,
    refetch: refetchFeatured,
  } = useFeaturedProducts(8);

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorObj,
    refetch: refetchCategories,
  } = useCategories();

  const featuredProducts = featuredResponse?.data ?? [];
  const categories = categoriesResponse?.data ?? [];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:min-h-[75vh] lg:px-8">
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Autumn / Winter Collection
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl font-heading text-5xl font-semibold leading-[1.1] tracking-tight text-on-primary sm:text-6xl md:text-7xl"
          >
            Discover Curated Elegance
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-on-primary/70 sm:text-lg"
          >
            Thoughtfully selected pieces that blend timeless craftsmanship with
            modern sensibility.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-md bg-accent px-7 py-3 text-sm font-semibold text-on-accent transition-all duration-200 hover:bg-accent/90"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/products?sort=createdAt&order=desc"
              className="inline-flex items-center gap-2 rounded-md border border-on-primary/20 px-7 py-3 text-sm font-semibold text-on-primary transition-colors duration-200 hover:border-on-primary/40 hover:bg-on-primary/5"
            >
              New Arrivals
            </Link>
          </motion.div>
        </div>

        {/* Decorative gradient transition */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Trust / Features bar ───────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:py-12 lg:grid-cols-4 lg:gap-8 lg:px-8"
        >
          {trustFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <feature.icon
                className="mb-3 h-6 w-6 text-accent"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Featured Categories ───────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Browse By
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Shop Categories
            </h2>
          </div>

          {categoriesLoading && <CategoriesSkeleton />}

          {categoriesError && (
            <ErrorDisplay
              message={
                categoriesErrorObj instanceof Error
                  ? categoriesErrorObj.message
                  : 'Failed to load categories.'
              }
              onRetry={() => refetchCategories()}
            />
          )}

          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <EmptyState
              title="No categories yet"
              description="Categories will appear here once they are added."
            />
          )}

          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3"
            >
              {categories.map((category) => (
                <motion.div
                  key={category._id}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────── */}
      <section className="bg-card py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Curated For You
              </p>
              <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                Featured Products
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-accent sm:flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredLoading && <ProductGridSkeleton count={4} />}

          {featuredError && (
            <ErrorDisplay
              message={
                featuredErrorObj instanceof Error
                  ? featuredErrorObj.message
                  : 'Failed to load featured products.'
              }
              onRetry={() => refetchFeatured()}
            />
          )}

          {!featuredLoading && !featuredError && featuredProducts.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No featured products"
              description="Featured products will appear here soon."
            />
          )}

          {!featuredLoading && !featuredError && featuredProducts.length > 0 && (
            <ProductGrid products={featuredProducts} />
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Editorial Promo ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent"
            >
              The ShopSphere Promise
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-3xl font-semibold text-on-primary sm:text-4xl md:text-5xl"
            >
              Elevate Your Everyday
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-on-primary/70 sm:text-base"
            >
              Every piece in our collection is chosen for its quality,
              craftsmanship, and enduring style. We believe the things you
              surround yourself with should bring quiet joy — every day.
            </motion.p>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10"
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-md bg-accent px-8 py-3.5 text-sm font-semibold text-on-accent transition-all duration-200 hover:bg-accent/90"
              >
                Explore the Collection
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative side elements */}
        <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-1/3 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      </section>
    </>
  );
}

// ── Category loading skeleton ─────────────────────────────────────────────────

function CategoriesSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label="Loading categories"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          className={`aspect-[4/3] w-full rounded-lg sm:aspect-[3/2] ${
            i >= 4 ? 'hidden lg:block' : ''
          }`}
        />
      ))}
    </div>
  );
}
