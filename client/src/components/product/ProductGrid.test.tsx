import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProductGrid } from './ProductGrid';
import type { Product } from '@/types';

const product = (id: string): Product => ({
  _id: id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  description: 'A product used to test filter replacement rendering.',
  price: 100,
  category: { _id: 'category', name: 'Category', slug: 'category', isActive: true },
  images: [],
  variants: [],
  stock: 1,
  sku: `SKU-${id}`,
  tags: [],
  isActive: true,
  isFeatured: false,
  avgRating: 0,
  reviewCount: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

describe('ProductGrid', () => {
  it('keeps replacement products visible after a filter changes', () => {
    const { rerender } = render(
      <MemoryRouter><ProductGrid products={[product('footwear')]} /></MemoryRouter>,
    );

    rerender(<MemoryRouter><ProductGrid products={[product('beauty')]} /></MemoryRouter>);

    const replacementCard = screen.getByText('Product beauty').closest('a')?.parentElement;
    expect(replacementCard).toBeVisible();
    expect(replacementCard).not.toHaveStyle({ opacity: '0' });
  });
});
