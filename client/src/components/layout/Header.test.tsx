import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, logout: vi.fn() }),
}));

vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({ cart: undefined }),
}));

describe('Header catalog navigation', () => {
  it('keeps Shop and New Arrivals on distinct catalog views', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Shop' })).toHaveAttribute(
      'href',
      '/products?sort=name:asc'
    );
    expect(screen.getByRole('link', { name: 'New Arrivals' })).toHaveAttribute(
      'href',
      '/products?newArrivals=true&sort=createdAt:desc'
    );
  });
});
