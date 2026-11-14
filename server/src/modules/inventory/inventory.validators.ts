import { z } from 'zod';
const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product identifier');
export const inventoryAdjustmentSchema = z.object({ params: z.object({ productId: id }), body: z.object({ delta: z.number().int().min(-100000).max(100000).refine((value) => value !== 0, 'Adjustment must not be zero'), reason: z.string().trim().min(3).max(300) }).strict() });
