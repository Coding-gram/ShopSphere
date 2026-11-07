import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductInfo } from './ProductInfo';
import type { Product } from '@/types';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
  },
}));

const mockProduct: Product = {
  _id: '1',
  name: 'Merino Wool Overcoat',
  slug: 'merino-wool-overcoat',
  description: 'A premium merino wool overcoat for the modern gentleman.',
  price: 12999,
  compareAtPrice: 18999,
  category: { _id: 'c1', name: 'Clothing', slug: 'clothing', isActive: true },
  images: ['https://example.com/img.jpg'],
  variants: [{ name: 'Size', value: 'M', stock: 10 }],
  stock: 15,
  sku: 'MWO-001',
  tags: ['premium', 'winter'],
  isActive: true,
  isFeatured: true,
  avgRating: 0,
  reviewCount: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('ProductInfo', () => {
  it('renders product name, price, and description', () => {
    renderWithRouter(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('Merino Wool Overcoat')).toBeInTheDocument();
    expect(screen.getByText('₹12,999')).toBeInTheDocument();
    expect(screen.getByText(/premium merino wool/i)).toBeInTheDocument();
  });

  it('shows discount badge when compareAtPrice exists', () => {
    renderWithRouter(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('₹18,999')).toBeInTheDocument();
    expect(screen.getByText(/-32% OFF/)).toBeInTheDocument();
  });

  it('shows in-stock status', () => {
    renderWithRouter(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('shows low-stock warning when stock <= 5', () => {
    renderWithRouter(<ProductInfo product={{ ...mockProduct, stock: 3 }} />);
    expect(screen.getByText('Only 3 left in stock')).toBeInTheDocument();
  });

  it('shows out-of-stock status and disables add to cart', () => {
    renderWithRouter(<ProductInfo product={{ ...mockProduct, stock: 0 }} />);
    // "Out of Stock" appears in both the status text and the button
    const matches = screen.getAllByText('Out of Stock');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const addButton = screen.getByRole('button', { name: /out of stock/i });
    expect(addButton).toBeDisabled();
  });

  it('renders quantity selector with valid limits', () => {
    renderWithRouter(<ProductInfo product={{ ...mockProduct, stock: 3 }} />);
    const decreaseBtn = screen.getByLabelText('Decrease quantity');
    const increaseBtn = screen.getByLabelText('Increase quantity');

    expect(decreaseBtn).toBeDisabled(); // quantity starts at 1
    // Increase to max
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    expect(increaseBtn).toBeDisabled(); // maxed at stock = 3
  });

  it('renders category link', () => {
    renderWithRouter(<ProductInfo product={mockProduct} />);
    const link = screen.getByText('Clothing');
    expect(link.closest('a')).toHaveAttribute('href', '/products?category=clothing');
  });

  it('renders variants as badges', () => {
    renderWithRouter(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('Size: M')).toBeInTheDocument();
  });

  it('renders tags as badges', () => {
    renderWithRouter(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('premium')).toBeInTheDocument();
    expect(screen.getByText('winter')).toBeInTheDocument();
  });

  it('renders SKU', () => {
    renderWithRouter(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('SKU: MWO-001')).toBeInTheDocument();
  });

  it('shows toast on add to cart click', async () => {
    const { toast } = await import('sonner');
    renderWithRouter(<ProductInfo product={mockProduct} />);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(toast.info).toHaveBeenCalledWith('Cart coming soon', expect.any(Object));
  });

  it('shows toast on wishlist click', async () => {
    const { toast } = await import('sonner');
    renderWithRouter(<ProductInfo product={mockProduct} />);
    fireEvent.click(screen.getByRole('button', { name: /wishlist/i }));
    expect(toast.info).toHaveBeenCalledWith('Wishlist coming soon', expect.any(Object));
  });
});

