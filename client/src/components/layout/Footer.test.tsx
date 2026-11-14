import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('sends collection links to catalog filters instead of missing category routes', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'New Arrivals' })).toHaveAttribute('href', '/products?sort=createdAt:desc');
    expect(screen.getByRole('link', { name: 'Featured' })).toHaveAttribute('href', '/products?featured=true');
    expect(screen.getByRole('link', { name: 'Sale' })).toHaveAttribute('href', '/products?sale=true');
  });
});
