import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid order identifier');
const idempotencyKey = z
  .string()
  .trim()
  .min(1, 'Idempotency-Key is required')
  .max(128, 'Idempotency-Key must be at most 128 characters')
  .regex(/^[A-Za-z0-9_-]+$/, 'Idempotency-Key contains invalid characters');

export const createPaymentSchema = z.object({
  params: z.object({ orderId: objectId }),
  body: z.object({ outcome: z.enum(['success', 'failure']) }).strict(),
  headers: z.object({ 'idempotency-key': idempotencyKey }),
});
