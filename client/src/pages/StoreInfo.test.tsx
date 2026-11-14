import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import StoreInfo from './StoreInfo';

describe('StoreInfo', () => {
  it('renders factual shipping guidance with a route back to the customer order history', () => {
    render(<MemoryRouter><StoreInfo page="shipping" /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1, name: 'Shipping & Returns' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View my orders' })).toHaveAttribute('href', '/orders');
  });

  it('renders the simulated-payment disclosure in the terms page', () => {
    render(<MemoryRouter><StoreInfo page="terms" /></MemoryRouter>);

    expect(screen.getByText(/does not make a real payment charge/i)).toBeInTheDocument();
  });
});
