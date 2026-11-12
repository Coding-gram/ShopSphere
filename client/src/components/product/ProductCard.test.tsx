import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

const mockProduct: Product = {
  _id: '1',
  name: 'Merino Wool Overcoat',
  slug: 'merino-wool-overcoat',
  description: 'A timeless merino wool overcoat.',
  price: 12999,
  compareAtPrice: 16999,
  category: { _id: 'cat1', name: 'Clothing', slug: 'clothing', isActive: true },
  images: ['https://example.com/image.jpg'],
  variants: [],
  stock: 25,
  sku: 'SS-CLO-001',
  tags: ['overcoat', 'wool'],
  isActive: true,
  isFeatured: true,
  avgRating: 4.7,
  reviewCount: 23,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> });
}

describe('ProductCard', () => {
  it('renders product name, price, and category', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Merino Wool Overcoat')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('₹12,999')).toBeInTheDocument();
  });

  it('renders compare-at price with discount badge when product has a sale', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    expect(screen.getByText('₹16,999')).toBeInTheDocument();
    expect(screen.getByText('-24%')).toBeInTheDocument();
  });

  it('renders rating when avgRating > 0', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('(23)')).toBeInTheDocument();
  });

  it('renders product image when images array is non-empty', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    const img = screen.getByAltText('Merino Wool Overcoat');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders initials placeholder when product has no images', () => {
    const noImageProduct = { ...mockProduct, images: [] };
    renderWithRouter(<ProductCard product={noImageProduct} />);

    // Should render initials (MW for "Merino Wool")
    expect(screen.getByText('MW')).toBeInTheDocument();
    expect(screen.queryByAltText('Merino Wool Overcoat')).not.toBeInTheDocument();
  });

  it('falls back to initials when the product image fails to load', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    fireEvent.error(screen.getByAltText('Merino Wool Overcoat'));

    expect(screen.getByText('MW')).toBeInTheDocument();
    expect(screen.queryByAltText('Merino Wool Overcoat')).not.toBeInTheDocument();
  });

  it('shows Low Stock badge when stock <= 5', () => {
    const lowStockProduct = { ...mockProduct, stock: 3 };
    renderWithRouter(<ProductCard product={lowStockProduct} />);

    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('shows Sold Out badge when stock is 0', () => {
    const soldOutProduct = { ...mockProduct, stock: 0 };
    renderWithRouter(<ProductCard product={soldOutProduct} />);

    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('links to the product detail page', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/merino-wool-overcoat');
  });

  it('does not render discount badge when no compareAtPrice', () => {
    const noDiscountProduct = { ...mockProduct, compareAtPrice: undefined };
    renderWithRouter(<ProductCard product={noDiscountProduct} />);

    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });
});

