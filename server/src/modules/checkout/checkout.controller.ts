import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { placeOrder } from './checkout.service.js';

export const checkout = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  const order = await placeOrder(request.user._id, request.body.addressId);
  sendResponse(response, 201, 'Order placed successfully', order);
});
