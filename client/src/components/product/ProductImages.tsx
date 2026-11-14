import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImagesProps {
  images: string[];
  productName: string;
}

/**
 * Deterministic gradient for products without images.
 * Matches the palette from ProductCard.
 */
const GRADIENT_PAIRS = [
  ['#292524', '#44403C'],
  ['#1C1917', '#57534E'],
  ['#292524', '#78716C'],
  ['#1C1917', '#A16207'],
  ['#44403C', '#78716C'],
  ['#292524', '#A16207'],
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

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  const currentImageValid = hasImages && !imageError.has(selectedIndex);

  function handleImageError(index: number) {
    setImageError((prev) => new Set(prev).add(index));
  }

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setSelectedIndex(clamped);
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {currentImageValid ? (
          <img
            src={images[selectedIndex]}
            alt={`${productName} — image ${selectedIndex + 1} of ${images.length}`}
            className="h-full w-full object-cover transition-opacity duration-300"
            referrerPolicy="no-referrer"
            onError={() => handleImageError(selectedIndex)}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3"
            style={hasImages ? undefined : { background: getProductGradient(productName) }}
            aria-hidden="true"
          >
            {hasImages ? (
              <>
                <ImageOff className="h-10 w-10 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">Image unavailable</span>
              </>
            ) : (
              <span className="select-none font-heading text-6xl font-semibold tracking-wide text-white/80 sm:text-7xl">
                {getProductInitials(productName)}
              </span>
            )}
          </div>
        )}

        {/* Navigation arrows for multiple images */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(selectedIndex - 1)}
              disabled={selectedIndex === 0}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(selectedIndex + 1)}
              disabled={selectedIndex === images.length - 1}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {hasMultiple && (
          <div className="absolute bottom-3 right-3 rounded-full bg-primary/70 px-3 py-1 text-xs font-medium text-on-primary backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === selectedIndex}
              aria-label={`View image ${idx + 1}`}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 cursor-pointer sm:h-20 sm:w-20',
                idx === selectedIndex
                  ? 'border-accent ring-1 ring-accent/30'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              {imageError.has(idx) ? (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageOff className="h-4 w-4 text-muted-foreground/50" />
                </div>
              ) : (
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => handleImageError(idx)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

