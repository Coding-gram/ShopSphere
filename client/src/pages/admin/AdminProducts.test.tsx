import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminProducts from './AdminProducts';

const { mockUseAdminProducts } = vi.hoisted(() => ({ mockUseAdminProducts: vi.fn() }));
vi.mock('@/hooks/useAdminProducts', () => ({ useAdminProducts: (...args: unknown[]) => mockUseAdminProducts(...args), useCreateAdminProduct: () => ({ mutateAsync: vi.fn() }), useUpdateAdminProduct: () => ({ mutateAsync: vi.fn() }), useDeleteAdminProduct: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('@/hooks/useCategories', () => ({ useCategories: () => ({ data: { data: [] } }) }));

describe('AdminProducts', () => {
  it('renders catalog loading and product actions', () => {
    mockUseAdminProducts.mockReturnValue({ products: [], isLoading: true, isError: false });
    const { rerender } = render(<MemoryRouter><AdminProducts /></MemoryRouter>);
    expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
    mockUseAdminProducts.mockReturnValue({ products: [{ _id: 'product-1', name: 'Managed Product', sku: 'SKU-1', price: 1200, stock: 3, isActive: true, category: { _id: 'cat', name: 'Catalog', slug: 'catalog', isActive: true }, description: 'A product', slug: 'managed-product', images: [], variants: [], tags: [], isFeatured: false, avgRating: 0, reviewCount: 0, createdAt: '', updatedAt: '' }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasMore: false }, isLoading: false, isError: false });
    rerender(<MemoryRouter><AdminProducts /></MemoryRouter>);
    expect(screen.getByText('Managed Product')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
  });
});
