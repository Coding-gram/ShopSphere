import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { UserRole } from '../types/index.js';

interface JwtPayload {
  _id: string;
  role: UserRole;
  email: string;
}

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.token as string | undefined;

    if (!token) {
      throw new ApiError(401, 'Not authenticated. Please log in.');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      _id: decoded._id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  },
);

export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated. Please log in.');
    }

    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Access denied. Admin privileges required.');
    }

    next();
  },
);

/** Re-checks persisted admin state before a sensitive administrative mutation. */
export const requireActiveAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated. Please log in.');
    }

    const activeAdmin = await User.exists({ _id: req.user._id, role: 'admin', isActive: true });
    if (!activeAdmin) {
      throw new ApiError(403, 'An active admin account is required.');
    }

    next();
  },
);
