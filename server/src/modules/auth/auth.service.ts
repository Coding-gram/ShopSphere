import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Response } from 'express';
import { User, type IUser } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';

// ── Token helpers ────────────────────────────────────────────────────────────

function generateToken(user: IUser): string {
  const payload = { _id: user._id.toString(), role: user.role, email: user.email };
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

function setTokenCookie(res: Response, token: string): void {
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge,
    path: '/',
    ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function registerUser(
  data: { name: string; email: string; password: string },
  res: Response,
) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'customer',
  });

  const token = generateToken(user);
  setTokenCookie(res, token);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function loginUser(
  data: { email: string; password: string },
  res: Response,
) {
  const user = await User.findOne({ email: data.email }).select('+password');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);
  setTokenCookie(res, token);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function logoutUser(res: Response): void {
  res.cookie('token', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    expires: new Date(0),
    path: '/',
  });
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }
  return user;
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; avatar?: string },
) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (data.name !== undefined) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.avatar !== undefined) user.avatar = data.avatar;

  await user.save();
  return user;
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
}
