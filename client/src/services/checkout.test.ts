import { describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@/lib/api', () => ({ default: { post } }));

import { checkoutService } from './checkout';

describe('checkoutService', () => {
  it('sends the client-generated idempotency key with the checkout request', () => {
    checkoutService.placeOrder({
      addressId: '507f1f77bcf86cd799439011',
      idempotencyKey: 'checkout-key-1',
    });

    expect(post).toHaveBeenCalledWith(
      '/checkout',
      { addressId: '507f1f77bcf86cd799439011' },
      { headers: { 'Idempotency-Key': 'checkout-key-1' } },
    );
  });
});
