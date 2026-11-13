import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import {
  getAdminOrder,
  listAdminOrders,
  transitionAdminOrder,
  type AdminLifecycleStatus,
  type AdminOrderQuery,
} from './adminOrders.service.js';

export const listAdminOrderRecords = asyncHandler(async (request: Request, response: Response) => {
  const result = await listAdminOrders(request.query as AdminOrderQuery);
  response.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Admin orders retrieved',
    data: result.items,
    pagination: result.pagination,
  });
});

export const getAdminOrderRecord = asyncHandler(async (request: Request, response: Response) => {
  const orderId = request.params.orderId;
  if (typeof orderId !== 'string') throw new ApiError(400, 'Invalid order identifier');
  const order = await getAdminOrder(orderId);
  sendResponse(response, 200, 'Admin order retrieved', order);
});

export const transitionAdminOrderRecord = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  const orderId = request.params.orderId;
  if (typeof orderId !== 'string') throw new ApiError(400, 'Invalid order identifier');

  const status = request.body.status as AdminLifecycleStatus;
  const note = typeof request.body.note === 'string' ? request.body.note.trim() : undefined;
  const order = await transitionAdminOrder(request.user._id, orderId, status, note);
  sendResponse(response, 200, 'Order status updated', order);
});
