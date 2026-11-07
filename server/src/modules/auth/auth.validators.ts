import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().optional(),
    avatar: z.string().url('Please enter a valid URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128),
  }),
});
