import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }, // back.out(1.4) approximation
  },
};

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <motion.div
      variants={stagger}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-60px' }}
      className={cn(
        'grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4',
        className
      )}
    >
      {products.map((product) => (
        <motion.div key={product._id} variants={fadeUp}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

