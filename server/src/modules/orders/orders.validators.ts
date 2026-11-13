import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid order identifier');
const idempotencyKey = z
  .string()
  .trim()
  .min(1, 'Idempotency-Key is required')
  .max(128, 'Idempotency-Key must be at most 128 characters')
  .regex(/^[A-Za-z0-9_-]+$/, 'Idempotency-Key contains invalid characters');

export const listCustomerOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
  }),
});

export const customerOrderParamsSchema = z.object({
  params: z.object({ orderId: objectId }),
});

export const cancelCustomerOrderSchema = z.object({
  params: z.object({ orderId: objectId }),
  body: z.object({ reason: z.string().trim().min(3).max(300) }).strict(),
  headers: z.object({ 'idempotency-key': idempotencyKey }),
});
