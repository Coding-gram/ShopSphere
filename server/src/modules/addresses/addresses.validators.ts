import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid address identifier');

export const addressInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number'),
  street: z.string().trim().min(5, 'Street address must be at least 5 characters').max(300),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100),
  state: z.string().trim().min(2, 'State must be at least 2 characters').max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().trim().min(2, 'Country is required').max(100),
  isDefault: z.boolean().optional(),
}).strict();

export type AddressInput = z.infer<typeof addressInputSchema>;

export const createAddressSchema = z.object({ body: addressInputSchema });

export const updateAddressSchema = z.object({
  params: z.object({ addressId: objectId }),
  body: addressInputSchema,
});

export const addressParamsSchema = z.object({
  params: z.object({ addressId: objectId }),
});
