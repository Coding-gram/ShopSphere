import { describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@/lib/api', () => ({ default: { post } }));

import { paymentService } from './payments';

describe('paymentService', () => {
  it('submits the simulated outcome with a stable idempotency key', () => {
    paymentService.processPayment({
      orderId: '507f1f77bcf86cd799439011',
      outcome: 'success',
      idempotencyKey: 'payment-key-1',
    });

    expect(post).toHaveBeenCalledWith(
      '/orders/507f1f77bcf86cd799439011/payments',
      { outcome: 'success' },
      { headers: { 'Idempotency-Key': 'payment-key-1' } },
    );
  });
});
