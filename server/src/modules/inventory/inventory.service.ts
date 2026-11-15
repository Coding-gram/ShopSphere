import mongoose, { type ClientSession } from 'mongoose';
import { InventoryAdjustment } from '../../models/InventoryAdjustment.js';
import { Product } from '../../models/Product.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';

function isTransactionUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return ('code' in error && (error as Error & { code?: number }).code === 20)
    || error.message.includes('Transaction numbers are only allowed');
}

async function executeAdjustment(
  actorId: string,
  productId: string,
  delta: number,
  reason: string,
  session?: ClientSession,
): Promise<number> {
  const admin = await User.exists({ _id: actorId, role: 'admin', isActive: true }).session(session ?? null);
  if (!admin) throw new ApiError(403, 'An active admin account is required.');

  const product = await Product.findById(productId).session(session ?? null);
  if (!product) throw new ApiError(404, 'Product not found');

  const next = product.stock + delta;
  if (next < 0) throw new ApiError(409, 'Adjustment would make inventory negative');

  const updated = await Product.findOneAndUpdate(
    { _id: product._id, stock: product.stock },
    { $inc: { stock: delta } },
    { returnDocument: 'after', ...(session ? { session } : {}) },
  );
  if (!updated) throw new ApiError(409, 'Inventory changed concurrently. Refresh and try again.');

  await InventoryAdjustment.create([{
    product: product._id,
    actor: actorId,
    delta,
    reason,
    previousQuantity: product.stock,
    newQuantity: updated.stock,
  }], session ? { session } : {});

  return updated.stock;
}

export async function adjustInventory(actorId: string, productId: string, delta: number, reason: string) {
  const session = await mongoose.startSession();

  try {
    let stock: number | undefined;

    try {
      await session.withTransaction(async () => {
        stock = await executeAdjustment(actorId, productId, delta, reason, session);
      });
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) throw error;
      stock = await executeAdjustment(actorId, productId, delta, reason);
    }

    if (stock === undefined) throw new ApiError(409, 'Inventory adjustment did not complete');
    return { stock };
  } finally {
    await session.endSession();
  }
}
