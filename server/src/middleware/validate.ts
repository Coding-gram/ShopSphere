import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        next(new ApiError(400, 'Validation failed', fieldErrors));
        return;
      }
      next(error);
    }
  };
