import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/ApiResponse.js';
import { createAddress, deleteAddress, getAddresses, updateAddress } from './addresses.service.js';

function userIdFrom(request: Request): string {
  if (!request.user) throw new ApiError(401, 'Not authenticated. Please log in.');
  return request.user._id;
}

function addressIdFrom(request: Request): string {
  const addressId = request.params.addressId;
  if (typeof addressId !== 'string') throw new ApiError(400, 'Invalid address identifier');
  return addressId;
}

export const listAddresses = asyncHandler(async (request: Request, response: Response) => {
  const addresses = await getAddresses(userIdFrom(request));
  sendResponse(response, 200, 'Addresses retrieved successfully', addresses);
});

export const addAddress = asyncHandler(async (request: Request, response: Response) => {
  const address = await createAddress(userIdFrom(request), request.body);
  sendResponse(response, 201, 'Address added successfully', address);
});

export const editAddress = asyncHandler(async (request: Request, response: Response) => {
  const address = await updateAddress(userIdFrom(request), addressIdFrom(request), request.body);
  sendResponse(response, 200, 'Address updated successfully', address);
});

export const removeAddress = asyncHandler(async (request: Request, response: Response) => {
  const address = await deleteAddress(userIdFrom(request), addressIdFrom(request));
  sendResponse(response, 200, 'Address deleted successfully', address);
});
