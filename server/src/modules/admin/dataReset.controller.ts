import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { resetNonCustomerData } from './dataReset.service.js';

export const resetData = asyncHandler(async (_req: Request, res: Response) => {
  const result = await resetNonCustomerData();
  sendResponse(res, 200, 'All non-customer data has been cleared', result);
});
