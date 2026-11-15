import { createHash } from 'node:crypto';
import mongoose, { type ClientSession } from 'mongoose';
import { Order, type IOrder } from '../../models/Order.js';
import { OrderAuditEvent } from '../../models/OrderAuditEvent.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import { assertOrderTransition } from './orderStateMachine.js';
import { toOrderView } from './orderView.js';

function isTransactionUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return ('code' in error && (error as Error & { code?: number }).code === 20)
    || error.message.includes('Transaction numbers are only allowed');
}

interface CustomerOrderQuery {
  page?: string | number;
  limit?: string | number;
}

export async function listCustomerOrders(userId: string, query: CustomerOrderQuery) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const filter = { user: userId };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    items: orders.map(toOrderView),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function getCustomerOrder(userId: string, orderId: string): Promise<IOrder> {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

function cancellationFingerprint(orderId: string, reason: string): string {
  return createHash('sha256').update(JSON.stringify({ orderId, reason })).digest('hex');
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

async function findCancellationReplay(
  userId: string,
  idempotencyKey: string,
  requestFingerprint: string,
  session?: mongoose.ClientSession,
) {
  const query = Order.findOne({ user: userId, cancellationIdempotencyKey: idempotencyKey });
  if (session) query.session(session);
  const order = await query;
  if (!order) return undefined;

  if (order.cancellationRequestFingerprint !== requestFingerprint) {
    throw new ApiError(409, 'Idempotency-Key has already been used with a different cancellation request');
  }

  return { replayed: true, order: toOrderView(order) };
}

export async function cancelCustomerOrder(
  userId: string,
  orderId: string,
  idempotencyKey: string,
  reason: string,
) {
  const requestFingerprint = cancellationFingerprint(orderId, reason);
  const replayedResult = await findCancellationReplay(userId, idempotencyKey, requestFingerprint);
  if (replayedResult) return replayedResult;

  const session = await mongoose.startSession();

  try {
    let result: { replayed: boolean; order: ReturnType<typeof toOrderView> } | undefined;

    async function executeCancellation(s?: ClientSession) {
      const order = await Order.findOne({ _id: orderId, user: userId }).session(s ?? null);
      if (!order) throw new ApiError(404, 'Order not found');

      const inTransactionReplay = await findCancellationReplay(userId, idempotencyKey, requestFingerprint, s);
      if (inTransactionReplay) { result = inTransactionReplay; return; }

      if (order.status !== 'placed' && order.status !== 'paid') {
        throw new ApiError(409, 'Order is not eligible for cancellation');
      }
      assertOrderTransition(order.status, 'cancelled');

      const cancelledOrder = await Order.findOneAndUpdate(
        { _id: order._id, user: userId, status: order.status },
        {
          $set: {
            status: 'cancelled',
            cancellationIdempotencyKey: idempotencyKey,
            cancellationRequestFingerprint: requestFingerprint,
          },
          $push: { statusHistory: { status: 'cancelled', timestamp: new Date(), note: `Cancelled: ${reason}` } },
        },
        { returnDocument: 'after', ...(s ? { session: s } : {}) },
      );

      if (!cancelledOrder) return;

      for (const item of cancelledOrder.items) {
        const restoredProduct = await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          s ? { session: s } : {},
        );
        if (restoredProduct.matchedCount !== 1) {
          throw new ApiError(409, 'An ordered product can no longer be restored');
        }
      }

      await OrderAuditEvent.create([{
        order: cancelledOrder._id,
        actorType: 'customer',
        actorId: userId,
        eventType: 'order_cancelled',
        fromStatus: order.status,
        toStatus: 'cancelled',
        note: `Cancelled: ${reason}`,
      }], s ? { session: s } : {});

      result = { replayed: false, order: toOrderView(cancelledOrder) };
    }

    try {
      await session.withTransaction(() => executeCancellation(session));
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) throw error;
      await executeCancellation();
    }

    if (result) return result;

    const completedCancellation = await findCancellationReplay(userId, idempotencyKey, requestFingerprint);
    if (completedCancellation) return completedCancellation;
    throw new ApiError(409, 'Order is no longer eligible for cancellation');
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;

    const completedCancellation = await findCancellationReplay(userId, idempotencyKey, requestFingerprint);
    if (!completedCancellation) throw error;
    return completedCancellation;
  } finally {
    await session.endSession();
  }
}
