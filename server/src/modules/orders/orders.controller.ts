import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { toOrderView } from './orderView.js';
import { cancelCustomerOrder, getCustomerOrder, listCustomerOrders } from './orders.service.js';

export const listOrders = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');

  const result = await listCustomerOrders(request.user._id, request.query);
  response.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Orders retrieved',
    data: result.items,
    pagination: result.pagination,
  });
});

export const getOrder = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  const orderId = request.params.orderId;
  if (typeof orderId !== 'string') throw new ApiError(400, 'Invalid order identifier');

  const order = await getCustomerOrder(request.user._id, orderId);
  sendResponse(response, 200, 'Order retrieved', toOrderView(order));
});

export const cancelOrder = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  const orderId = request.params.orderId;
  const idempotencyKey = request.headers['idempotency-key'];
  const reason = request.body.reason;
  if (typeof orderId !== 'string') throw new ApiError(400, 'Invalid order identifier');
  if (typeof idempotencyKey !== 'string') throw new ApiError(400, 'Idempotency-Key is required');
  if (typeof reason !== 'string') throw new ApiError(400, 'Cancellation reason is required');

  const result = await cancelCustomerOrder(request.user._id, orderId, idempotencyKey.trim(), reason.trim());
  sendResponse(response, 200, result.replayed ? 'Existing cancellation returned' : 'Order cancelled', result);
});
