import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

/**
 * Deterministic gradient palette for categories without images.
 * Warm editorial tones from the ShopSphere design system.
 */
const CATEGORY_GRADIENTS = [
  'linear-gradient(145deg, #1C1917 0%, #44403C 60%, #78716C 100%)',
  'linear-gradient(145deg, #292524 0%, #A16207 100%)',
  'linear-gradient(145deg, #1C1917 0%, #57534E 100%)',
  'linear-gradient(145deg, #44403C 0%, #A16207 70%, #CA8A04 100%)',
  'linear-gradient(145deg, #292524 0%, #78716C 100%)',
] as const;

function getCategoryGradient(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CATEGORY_GRADIENTS[hash % CATEGORY_GRADIENTS.length];
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const hasImage = !!category.image;

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className={cn(
        'group relative block cursor-pointer overflow-hidden rounded-lg',
        className
      )}
      aria-label={`Browse ${category.name}`}
    >
      <div className="relative aspect-[4/3] sm:aspect-[3/2]">
        {hasImage ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: getCategoryGradient(category.name) }}
            aria-hidden="true"
          />
        )}

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-colors duration-300 group-hover:from-black/70" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
          <div>
            <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
              {category.name}
            </h3>
            {category.description && (
              <p className="mt-1 text-xs text-white/70 line-clamp-1 sm:text-sm">
                {category.description}
              </p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-white/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>
    </Link>
  );
}

