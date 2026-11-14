import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { getDashboardSummary, type DashboardQuery } from './dashboard.service.js';

export const getDashboard = asyncHandler(async (request: Request, response: Response) => {
  const summary = await getDashboardSummary(request.query as DashboardQuery);
  sendResponse(response, 200, 'Admin dashboard retrieved', summary);
});
