import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Products from './Products';
import type { Product, Category, ApiResponse, PaginatedResponse } from '@/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUseProducts = vi.fn();
const mockUseCategories = vi.fn();
const mockUseDebounce = vi.fn((v: string) => v); // no delay in tests

vi.mock('@/hooks/useProducts', () => ({
  useProducts: (...args: unknown[]) => mockUseProducts(...args),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: (...args: unknown[]) => mockUseCategories(...args),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (v: string) => mockUseDebounce(v),
}));

// ── Test data ─────────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  _id: '1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'A test product.',
  price: 4999,
  category: { _id: 'cat1', name: 'Clothing', slug: 'clothing', isActive: true },
  images: [],
  variants: [],
  stock: 10,
  sku: 'TP-001',
  tags: [],
  isActive: true,
  isFeatured: false,
  avgRating: 4.5,
  reviewCount: 10,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const mockProducts: Product[] = [
  makeProduct({ _id: '1', name: 'Product One', slug: 'product-one' }),
  makeProduct({ _id: '2', name: 'Product Two', slug: 'product-two', price: 6999 }),
];

const mockCategories: Category[] = [
  { _id: 'cat1', name: 'Clothing', slug: 'clothing', isActive: true },
  { _id: 'cat2', name: 'Footwear', slug: 'footwear', isActive: true },
];

const mockPaginatedResponse: PaginatedResponse<Product> = {
  success: true,
  statusCode: 200,
  message: 'OK',
  data: mockProducts,
  pagination: { page: 1, limit: 12, total: 2, totalPages: 1, hasMore: false },
};

const mockCategoriesResponse: ApiResponse<Category[]> = {
  success: true,
  statusCode: 200,
  message: 'OK',
  data: mockCategories,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderProducts(initialRoute = '/products') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Products />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function setupSuccess() {
  mockUseProducts.mockReturnValue({
    data: mockPaginatedResponse,
    isLoading: false,
    isError: false,
  });
  mockUseCategories.mockReturnValue({
    data: mockCategoriesResponse,
    isLoading: false,
  });
}

function setupLoading() {
  mockUseProducts.mockReturnValue({
    data: undefined,
    isLoading: true,
    isError: false,
  });
  mockUseCategories.mockReturnValue({
    data: undefined,
    isLoading: true,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Products page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDebounce.mockImplementation((v: string) => v);
  });

  it('renders page title and search input', () => {
    setupSuccess();
    renderProducts();

    expect(screen.getByText('All Products')).toBeInTheDocument();
    expect(screen.getByLabelText('Search products')).toBeInTheDocument();
  });

  it('shows loading skeletons while products load', () => {
    setupLoading();
    renderProducts();

    expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
  });

  it('renders product cards when data loads', () => {
    setupSuccess();
    renderProducts();

    expect(screen.getByText('Product One')).toBeInTheDocument();
    expect(screen.getByText('Product Two')).toBeInTheDocument();
  });

  it('shows product count', () => {
    setupSuccess();
    renderProducts();

    expect(screen.getByText('2 products')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    const refetchFn = vi.fn();
    mockUseProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Server error'),
      refetch: refetchFn,
    });
    mockUseCategories.mockReturnValue({
      data: mockCategoriesResponse,
      isLoading: false,
    });

    renderProducts();

    expect(screen.getByText('Server error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows empty state when no products match', () => {
    mockUseProducts.mockReturnValue({
      data: {
        ...mockPaginatedResponse,
        data: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasMore: false },
      },
      isLoading: false,
      isError: false,
    });
    mockUseCategories.mockReturnValue({
      data: mockCategoriesResponse,
      isLoading: false,
    });

    renderProducts();

    // "No products found" appears in both the count label and the EmptyState heading
    const noProductsElements = screen.getAllByText('No products found');
    expect(noProductsElements.length).toBeGreaterThanOrEqual(1);
    // The EmptyState description should be shown
    expect(screen.getByText('Products will appear here once they are added.')).toBeInTheDocument();
  });

  it('renders category filter buttons', () => {
    setupSuccess();
    renderProducts();

    // Desktop sidebar should have category buttons
    expect(screen.getAllByText('All Categories').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Clothing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Footwear').length).toBeGreaterThanOrEqual(1);
  });

  it('renders search input and allows typing', () => {
    setupSuccess();
    renderProducts();

    const searchInput = screen.getByLabelText('Search products');
    fireEvent.change(searchInput, { target: { value: 'wool' } });

    expect(searchInput).toHaveValue('wool');
  });

  it('passes filters to useProducts hook', () => {
    setupSuccess();
    renderProducts();

    // First call should include default sort
    expect(mockUseProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 12,
        sort: 'createdAt',
        order: 'desc',
      })
    );
  });

  it('shows "1 product" singular text', () => {
    mockUseProducts.mockReturnValue({
      data: {
        ...mockPaginatedResponse,
        data: [mockProducts[0]],
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1, hasMore: false },
      },
      isLoading: false,
      isError: false,
    });
    mockUseCategories.mockReturnValue({
      data: mockCategoriesResponse,
      isLoading: false,
    });

    renderProducts();

    expect(screen.getByText('1 product')).toBeInTheDocument();
  });

  it('renders Collection label above the page title', () => {
    setupSuccess();
    renderProducts();

    expect(screen.getByText('Collection')).toBeInTheDocument();
  });
});

