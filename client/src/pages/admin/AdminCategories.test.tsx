import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminCategories from './AdminCategories';
const { mockUseAdminCategories } = vi.hoisted(() => ({ mockUseAdminCategories: vi.fn() }));
vi.mock('@/hooks/useAdminCategories', () => ({ useAdminCategories: () => mockUseAdminCategories(), useCreateAdminCategory: () => ({ mutateAsync: vi.fn() }), useUpdateAdminCategory: () => ({ mutateAsync: vi.fn() }), useDeleteAdminCategory: () => ({ mutateAsync: vi.fn() }) }));
describe('AdminCategories', () => { it('renders category records and its empty state', () => { mockUseAdminCategories.mockReturnValue({ categories: [], isLoading: false, isError: false }); const { rerender } = render(<AdminCategories />); expect(screen.getByText('No categories yet')).toBeInTheDocument(); mockUseAdminCategories.mockReturnValue({ categories: [{ _id: 'cat-1', name: 'Beauty', slug: 'beauty', isActive: true }], isLoading: false, isError: false }); rerender(<AdminCategories />); expect(screen.getByText('Beauty')).toBeInTheDocument(); expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument(); }); });
