import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { addItem, getCart, removeItem, toCartView, updateItem } from './cart.service.js';

function userIdFrom(request: Request): string {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  return request.user._id;
}

export const getCustomerCart = asyncHandler(async (request: Request, response: Response) => {
  const cart = await getCart(userIdFrom(request));
  sendResponse(response, 200, 'Cart retrieved successfully', toCartView(cart));
});

export const addCartItem = asyncHandler(async (request: Request, response: Response) => {
  const cart = await addItem(userIdFrom(request), request.body.productId, request.body.quantity);
  sendResponse(response, 201, 'Item added to cart', toCartView(cart));
});

export const updateCartItem = asyncHandler(async (request: Request, response: Response) => {
  const itemId = request.params.itemId;
  if (typeof itemId !== 'string') throw new ApiError(400, 'Invalid cart item identifier');
  const cart = await updateItem(userIdFrom(request), itemId, request.body.quantity);
  sendResponse(response, 200, 'Cart updated successfully', toCartView(cart));
});

export const removeCartItem = asyncHandler(async (request: Request, response: Response) => {
  const itemId = request.params.itemId;
  if (typeof itemId !== 'string') throw new ApiError(400, 'Invalid cart item identifier');
  const cart = await removeItem(userIdFrom(request), itemId);
  sendResponse(response, 200, 'Item removed from cart', toCartView(cart));
});
