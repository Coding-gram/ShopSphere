import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../models/Order.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid order identifier');
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }, 'Date must be a valid calendar date');

export const listAdminOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    dateFrom: dateOnly.optional(),
    dateTo: dateOnly.optional(),
    search: z.string().trim().min(1).max(100).optional(),
  }).strict().superRefine((query, context) => {
    if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
      context.addIssue({ code: 'custom', path: ['dateTo'], message: 'dateTo must be on or after dateFrom' });
    }
  }),
});

export const adminOrderParamsSchema = z.object({
  params: z.object({ orderId: objectId }),
});

export const transitionAdminOrderSchema = z.object({
  params: z.object({ orderId: objectId }),
  body: z.object({
    status: z.enum(['packed', 'shipped', 'delivered']),
    note: z.string().trim().min(1).max(300).optional(),
  }).strict(),
});
