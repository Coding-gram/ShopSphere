import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body, res);
  sendResponse(res, 201, 'Account created successfully', user);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.loginUser(req.body, res);
  sendResponse(res, 200, 'Logged in successfully', user);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  authService.logoutUser(res);
  sendResponse(res, 200, 'Logged out successfully', null);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!._id);
  sendResponse(res, 200, 'User profile retrieved', user);
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await authService.updateUserProfile(req.user!._id, req.body);
    sendResponse(res, 200, 'Profile updated successfully', user);
  },
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.changeUserPassword(
      req.user!._id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    sendResponse(res, 200, 'Password changed successfully', null);
  },
);

