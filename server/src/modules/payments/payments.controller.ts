import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { processPayment } from './payments.service.js';

export const createPayment = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  const idempotencyKey = request.headers['idempotency-key'];
  const orderId = request.params.orderId;
  const outcome = request.body.outcome;
  if (typeof idempotencyKey !== 'string') throw new ApiError(400, 'Idempotency-Key is required');
  if (typeof orderId !== 'string') throw new ApiError(400, 'Invalid order identifier');
  if (outcome !== 'success' && outcome !== 'failure') throw new ApiError(400, 'Invalid simulated payment outcome');

  const result = await processPayment(
    request.user._id,
    orderId,
    idempotencyKey.trim(),
    outcome,
  );
  sendResponse(response, 200, result.replayed ? 'Existing payment result returned' : 'Payment processed', result);
});
