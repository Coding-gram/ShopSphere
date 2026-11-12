import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');

export const MAX_CART_ITEM_QUANTITY = 10;

export const addToCartSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(MAX_CART_ITEM_QUANTITY, 'Maximum 10 per item'),
  }).strict(),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: objectId,
  }),
  body: z.object({
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(MAX_CART_ITEM_QUANTITY, 'Maximum 10 per item'),
  }).strict(),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    itemId: objectId,
  }),
});
