import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid address identifier');
const idempotencyKey = z
  .string()
  .trim()
  .min(1, 'Idempotency-Key is required')
  .max(128, 'Idempotency-Key must be at most 128 characters')
  .regex(/^[A-Za-z0-9_-]+$/, 'Idempotency-Key contains invalid characters');

export const checkoutSchema = z.object({
  body: z.object({ addressId: objectId }).strict(),
  headers: z.object({ 'idempotency-key': idempotencyKey }),
});
