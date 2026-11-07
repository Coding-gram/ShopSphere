import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './Home';
import type { Product, Category, ApiResponse } from '@/types';

// ── Mock the hooks ────────────────────────────────────────────────────────────

const mockUseFeaturedProducts = vi.fn();
const mockUseCategories = vi.fn();

vi.mock('@/hooks/useProducts', () => ({
  useFeaturedProducts: (...args: unknown[]) => mockUseFeaturedProducts(...args),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: (...args: unknown[]) => mockUseCategories(...args),
}));

// ── Test data ─────────────────────────────────────────────────────────────────

const mockProducts: Product[] = [
  {
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
    isFeatured: true,
    avgRating: 4.5,
    reviewCount: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const mockCategories: Category[] = [
  {
    _id: 'cat1',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Premium apparel',
    isActive: true,
  },
];

const mockFeaturedResponse: ApiResponse<Product[]> = {
  success: true,
  statusCode: 200,
  message: 'OK',
  data: mockProducts,
};

const mockCategoriesResponse: ApiResponse<Category[]> = {
  success: true,
  statusCode: 200,
  message: 'OK',
  data: mockCategories,
};

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section with CTAs', () => {
    mockUseFeaturedProducts.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    mockUseCategories.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    renderHome();

    expect(screen.getByText('Discover Curated Elegance')).toBeInTheDocument();
    expect(screen.getByText('Shop Collection')).toBeInTheDocument();
  });

  it('renders trust features section', () => {
    mockUseFeaturedProducts.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    mockUseCategories.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    renderHome();

    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
    expect(screen.getByText('Secure Payments')).toBeInTheDocument();
    expect(screen.getByText('Easy Returns')).toBeInTheDocument();
    expect(screen.getByText('Expert Support')).toBeInTheDocument();
  });

  it('shows loading skeletons when data is loading', () => {
    mockUseFeaturedProducts.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    mockUseCategories.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    renderHome();

    expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading categories')).toBeInTheDocument();
  });

  it('renders featured products when data loads', () => {
    mockUseFeaturedProducts.mockReturnValue({
      data: mockFeaturedResponse,
      isLoading: false,
      isError: false,
    });
    mockUseCategories.mockReturnValue({
      data: mockCategoriesResponse,
      isLoading: false,
      isError: false,
    });

    renderHome();

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹4,999')).toBeInTheDocument();
  });

  it('renders categories when data loads', () => {
    mockUseFeaturedProducts.mockReturnValue({
      data: mockFeaturedResponse,
      isLoading: false,
      isError: false,
    });
    mockUseCategories.mockReturnValue({
      data: mockCategoriesResponse,
      isLoading: false,
      isError: false,
    });

    renderHome();

    expect(screen.getByText('Shop Categories')).toBeInTheDocument();
    // CategoryCard renders the name
    expect(screen.getAllByText('Clothing').length).toBeGreaterThanOrEqual(1);
  });

  it('shows error state with retry when products fail to load', () => {
    mockUseFeaturedProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: vi.fn(),
    });
    mockUseCategories.mockReturnValue({
      data: mockCategoriesResponse,
      isLoading: false,
      isError: false,
    });

    renderHome();

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows error state when categories fail to load', () => {
    mockUseFeaturedProducts.mockReturnValue({
      data: mockFeaturedResponse,
      isLoading: false,
      isError: false,
    });
    mockUseCategories.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Category fetch failed'),
      refetch: vi.fn(),
    });

    renderHome();

    expect(screen.getByText('Category fetch failed')).toBeInTheDocument();
  });

  it('shows empty state when no featured products exist', () => {
    const emptyResponse: ApiResponse<Product[]> = {
      ...mockFeaturedResponse,
      data: [],
    };
    mockUseFeaturedProducts.mockReturnValue({
      data: emptyResponse,
      isLoading: false,
      isError: false,
    });
    mockUseCategories.mockReturnValue({
      data: mockCategoriesResponse,
      isLoading: false,
      isError: false,
    });

    renderHome();

    expect(screen.getByText('No featured products')).toBeInTheDocument();
  });

  it('renders editorial promo section', () => {
    mockUseFeaturedProducts.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    mockUseCategories.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    renderHome();

    expect(screen.getByText('Elevate Your Everyday')).toBeInTheDocument();
    expect(screen.getByText('Explore the Collection')).toBeInTheDocument();
  });
});

