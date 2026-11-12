import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CartItem } from './CartItem';
import type { CartItem as CartItemType } from '@/types';

const item: CartItemType = {
  _id: 'cart-item-1',
  product: {
    _id: 'product-1',
    name: 'Cashmere Scarf',
    slug: 'cashmere-scarf',
    price: 2200,
    stock: 3,
    images: ['https://example.com/scarf.jpg'],
    isActive: true,
  },
  quantity: 1,
  price: 2200,
  lineTotal: 2200,
};

describe('CartItem', () => {
  it('requests a valid quantity change and removal', () => {
    const onQuantityChange = vi.fn();
    const onRemove = vi.fn();

    render(<BrowserRouter><CartItem item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} /></BrowserRouter>);

    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(onQuantityChange).toHaveBeenCalledWith('cart-item-1', 2);

    fireEvent.click(screen.getByRole('button', { name: /remove cashmere scarf/i }));
    expect(onRemove).toHaveBeenCalledWith('cart-item-1');
  });

  it('keeps unavailable items removable without exposing quantity controls', () => {
    render(
      <CartItem
        item={{ ...item, product: null }}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText(/no longer available/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /increase quantity/i })).not.toBeInTheDocument();
  });
});
