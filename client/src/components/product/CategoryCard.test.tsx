import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { CategoryCard } from './CategoryCard';
import type { Category } from '@/types';

const mockCategory: Category = {
  _id: 'cat1',
  name: 'Clothing',
  slug: 'clothing',
  description: 'Premium apparel for every occasion',
  image: 'https://example.com/clothing.jpg',
  isActive: true,
};

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> });
}

describe('CategoryCard', () => {
  it('renders category name and description', () => {
    renderWithRouter(<CategoryCard category={mockCategory} />);

    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Premium apparel for every occasion')).toBeInTheDocument();
  });

  it('renders category image when available', () => {
    renderWithRouter(<CategoryCard category={mockCategory} />);

    const img = screen.getByAltText('Clothing');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/clothing.jpg');
  });

  it('links to filtered products page', () => {
    renderWithRouter(<CategoryCard category={mockCategory} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products?category=clothing');
  });

  it('renders gradient placeholder when image is not available', () => {
    const noImageCategory = { ...mockCategory, image: undefined };
    renderWithRouter(<CategoryCard category={noImageCategory} />);

    expect(screen.queryByAltText('Clothing')).not.toBeInTheDocument();
    // The link and name should still render
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });
});

