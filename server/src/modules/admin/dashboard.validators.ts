import { z } from 'zod';

const dateOnly = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }, 'Date must be a valid calendar date');

export const dashboardQuerySchema = z.object({
  query: z.object({
    dateFrom: dateOnly.optional(),
    dateTo: dateOnly.optional(),
  }).strict().superRefine((value, context) => {
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      context.addIssue({ code: 'custom', path: ['dateTo'], message: 'dateTo must be on or after dateFrom' });
    }
  }),
});
