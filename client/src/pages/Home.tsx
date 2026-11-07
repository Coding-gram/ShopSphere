import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const features = [
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

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function Home() {
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
              to="/category/new-arrivals"
              className="inline-flex items-center gap-2 rounded-md border border-on-primary/20 px-7 py-3 text-sm font-semibold text-on-primary transition-colors duration-200 hover:border-on-primary/40 hover:bg-on-primary/5"
            >
              New Arrivals
            </Link>
          </motion.div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Features bar ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:py-12 lg:grid-cols-4 lg:gap-8 lg:px-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <feature.icon
                className="mb-3 h-6 w-6 text-accent"
                strokeWidth={1.5}
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

      {/* ── Featured Products placeholder ────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24">
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
              className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-accent sm:flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Product grid skeleton — replaced with real data in Phase 3 */}
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="group"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </motion.div>
            ))}
          </motion.div>

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

      {/* ── New Arrivals placeholder ─────────────────────────────────── */}
      <section className="bg-card py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Just In
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              New Arrivals
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              The latest additions to our collection, fresh from the atelier.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted/60" />
                  <div className="h-3 w-1/3 rounded bg-muted/60" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-semibold text-on-primary sm:text-4xl md:text-5xl">
            Elevate Your Everyday
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-on-primary/70 sm:text-base">
            Join ShopSphere and be the first to know about new collections,
            exclusive offers, and styling inspiration.
          </p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-8 py-3.5 text-sm font-semibold text-on-accent transition-all duration-200 hover:bg-accent/90"
            >
              Explore Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

