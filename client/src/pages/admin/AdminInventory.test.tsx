import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminInventory from './AdminInventory';
const { mockUseAdminProducts } = vi.hoisted(() => ({ mockUseAdminProducts: vi.fn() }));
vi.mock('@/hooks/useAdminProducts', () => ({ useAdminProducts: (...args: unknown[]) => mockUseAdminProducts(...args) }));
describe('AdminInventory', () => { it('shows the stock table and no-stock empty state', () => { mockUseAdminProducts.mockReturnValue({ products: [], isLoading: false, isError: false }); const { rerender } = render(<MemoryRouter><AdminInventory /></MemoryRouter>); expect(screen.getByText('No inventory items found')).toBeInTheDocument(); mockUseAdminProducts.mockReturnValue({ products: [{ _id: 'product-1', name: 'Stock item', sku: 'STOCK-1', stock: 3, price: 100, category: { _id: 'cat', name: 'Catalog', slug: 'catalog', isActive: true }, description: '', slug: 'stock-item', images: [], variants: [], tags: [], isActive: true, isFeatured: false, avgRating: 0, reviewCount: 0, createdAt: '', updatedAt: '' }], isLoading: false, isError: false }); rerender(<MemoryRouter><AdminInventory /></MemoryRouter>); expect(screen.getByText('Stock item')).toBeInTheDocument(); expect(screen.getByRole('button', { name: /adjust stock item/i })).toBeInTheDocument(); }); });
