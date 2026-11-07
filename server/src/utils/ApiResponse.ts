import type { Response } from 'express';

export class ApiResponse<T> {
  readonly success: true = true;
  readonly statusCode: number;
  readonly message: string;
  readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
): void {
  res.status(statusCode).json(new ApiResponse(statusCode, message, data));
}
