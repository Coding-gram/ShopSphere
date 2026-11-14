import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import * as productService from './products.service.js';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listProducts(req.query);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Products retrieved',
    data: result.items,
    pagination: result.pagination,
  });
});

export const getAdminProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listAdminProducts(req.query);
  res.status(200).json({ success: true, statusCode: 200, message: 'Admin products retrieved', data: result.items, pagination: result.pagination });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug as string);
  sendResponse(res, 200, 'Product retrieved', product);
});

export const getFeatured = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const products = await productService.getFeaturedProducts(limit);
  sendResponse(res, 200, 'Featured products retrieved', products);
});

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    sendResponse(res, 201, 'Product created successfully', product);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    sendResponse(res, 200, 'Product updated successfully', product);
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id as string);
    sendResponse(res, 200, 'Product deleted successfully', null);
  },
);
