import { z } from 'zod';
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid customer identifier');
export const listAdminCustomersSchema = z.object({ query: z.object({ page: z.coerce.number().int().min(1).default(1).optional(), limit: z.coerce.number().int().min(1).max(50).default(20).optional(), search: z.string().trim().min(1).max(100).optional(), isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional() }).strict() });
export const adminCustomerParamsSchema = z.object({ params: z.object({ customerId: objectId }) });
export const updateCustomerStatusSchema = z.object({ params: z.object({ customerId: objectId }), body: z.object({ isActive: z.boolean() }).strict() });
