import { Address, type IAddress } from '../../models/Address.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AddressInput } from './addresses.validators.js';

export function toAddressView(address: IAddress) {
  return {
    _id: address._id.toString(),
    fullName: address.fullName,
    phone: address.phone,
    street: address.street,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

export async function getAddresses(userId: string) {
  const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, updatedAt: -1 });
  return addresses.map(toAddressView);
}

export async function createAddress(userId: string, input: AddressInput) {
  const hasExistingAddress = await Address.exists({ user: userId });
  const isDefault = input.isDefault ?? !hasExistingAddress;

  if (isDefault) {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  const address = await Address.create({ ...input, user: userId, isDefault });
  return toAddressView(address);
}

export async function updateAddress(userId: string, addressId: string, input: AddressInput) {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new ApiError(404, 'Address not found');

  if (input.isDefault) {
    await Address.updateMany(
      { user: userId, _id: { $ne: address._id } },
      { $set: { isDefault: false } },
    );
  }

  Object.assign(address, {
    ...input,
    // A default address remains the default until another address replaces it.
    isDefault: input.isDefault === false && address.isDefault ? true : (input.isDefault ?? address.isDefault),
  });
  await address.save();

  return toAddressView(address);
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await Address.findOneAndDelete({ _id: addressId, user: userId });
  if (!address) throw new ApiError(404, 'Address not found');

  if (address.isDefault) {
    const replacement = await Address.findOne({ user: userId }).sort({ updatedAt: -1 });
    if (replacement) {
      replacement.isDefault = true;
      await replacement.save();
    }
  }

  return toAddressView(address);
}
