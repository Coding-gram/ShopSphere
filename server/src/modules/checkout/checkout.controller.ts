import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { placeOrder } from './checkout.service.js';

export const checkout = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  const idempotencyKey = request.headers['idempotency-key'];
  const addressId = request.body.addressId;
  if (typeof idempotencyKey !== 'string') throw new ApiError(400, 'Idempotency-Key is required');
  if (typeof addressId !== 'string') throw new ApiError(400, 'Invalid address identifier');

  const result = await placeOrder(request.user._id, addressId, idempotencyKey.trim());
  sendResponse(response, result.replayed ? 200 : 201, result.replayed ? 'Existing order returned' : 'Order placed successfully', result.order);
});
