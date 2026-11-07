import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).optional(),
    image: z.string().url('Please enter a valid URL').optional(),
    parent: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(500).optional(),
    image: z.string().url().nullable().optional(),
    parent: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

