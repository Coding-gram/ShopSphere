import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import * as categoryService from './categories.service.js';

export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.listCategories();
    sendResponse(res, 200, 'Categories retrieved', categories);
  },
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug as string);
  sendResponse(res, 200, 'Category retrieved', category);
});

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    sendResponse(res, 201, 'Category created successfully', category);
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(
      req.params.id as string,
      req.body,
    );
    sendResponse(res, 200, 'Category updated successfully', category);
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    await categoryService.deleteCategory(req.params.id as string);
    sendResponse(res, 200, 'Category deleted successfully', null);
  },
);
