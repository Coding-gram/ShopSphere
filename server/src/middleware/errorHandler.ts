import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log in development
  if (env.NODE_ENV === 'development') {
    console.error('🔥 Error:', err);
  }

  // ── Known operational error ───────────────────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // ── JSON parse / syntax error (malformed request body) ────────────────
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Invalid JSON in request body',
    });
    return;
  }

  // ── Mongoose Validation Error ─────────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.entries(err.errors).map(([field, e]) => ({
      field,
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // ── Mongoose CastError (bad ObjectId) ─────────────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: `Invalid ${err.path}: ${String(err.value)}`,
    });
    return;
  }

  // ── Duplicate key (code 11000) ────────────────────────────────────────
  const mongoErr = err as MongoServerError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0] ?? 'field';
    res.status(409).json({
      success: false,
      statusCode: 409,
      message: `Duplicate value for "${field}". This ${field} already exists.`,
    });
    return;
  }

  // ── JWT Errors ────────────────────────────────────────────────────────
  if (err instanceof jwt.TokenExpiredError) {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Token has expired. Please log in again.',
    });
    return;
  }

  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid token. Please log in again.',
    });
    return;
  }

  // ── Fallback ──────────────────────────────────────────────────────────
  const statusCode = 500;
  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
