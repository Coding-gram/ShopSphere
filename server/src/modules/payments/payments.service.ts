import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import { Order, type IOrder } from '../../models/Order.js';
import { OrderAuditEvent } from '../../models/OrderAuditEvent.js';
import { PaymentAttempt, type IPaymentAttempt } from '../../models/PaymentAttempt.js';
import { ApiError } from '../../utils/ApiError.js';
import { assertOrderTransition } from '../orders/orderStateMachine.js';
import { simulatedPaymentGateway, type SimulatedPaymentOutcome } from './simulatedPaymentGateway.js';

function paymentFingerprint(outcome: SimulatedPaymentOutcome): string {
  return createHash('sha256').update(JSON.stringify({ outcome })).digest('hex');
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

function toPaymentResult(order: IOrder, attempt: IPaymentAttempt, replayed: boolean) {
  return {
    replayed,
    order: {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: attempt.resultingOrderStatus,
      paymentStatus: attempt.resultingPaymentStatus,
    },
    paymentAttempt: {
      _id: attempt._id.toString(),
      status: attempt.status,
      amount: attempt.amount,
      currency: attempt.currency,
      ...(attempt.failureCode ? { failureCode: attempt.failureCode } : {}),
      createdAt: attempt.createdAt,
    },
  };
}

async function findOrderForCustomer(userId: string, orderId: string): Promise<IOrder> {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

async function findPaymentReplay(
  order: IOrder,
  idempotencyKey: string,
  requestFingerprint: string,
) {
  const attempt = await PaymentAttempt.findOne({ order: order._id, idempotencyKey });
  if (!attempt) return undefined;

  if (attempt.requestFingerprint !== requestFingerprint) {
    throw new ApiError(409, 'Idempotency-Key has already been used with a different payment request');
  }

  return toPaymentResult(order, attempt, true);
}

export async function processPayment(
  userId: string,
  orderId: string,
  idempotencyKey: string,
  outcome: SimulatedPaymentOutcome,
) {
  const requestFingerprint = paymentFingerprint(outcome);
  const existingOrder = await findOrderForCustomer(userId, orderId);
  const existingResult = await findPaymentReplay(existingOrder, idempotencyKey, requestFingerprint);
  if (existingResult) return existingResult;

  const session = await mongoose.startSession();

  try {
    let result: ReturnType<typeof toPaymentResult> | undefined;

    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId, user: userId }).session(session);
      if (!order) throw new ApiError(404, 'Order not found');

      const replayedResult = await findPaymentReplay(order, idempotencyKey, requestFingerprint);
      if (replayedResult) {
        result = replayedResult;
        return;
      }

      if (order.status !== 'placed') {
        throw new ApiError(409, 'Order is not eligible for payment');
      }

      const gatewayResult = await simulatedPaymentGateway.charge({
        amount: order.total,
        currency: 'INR',
        outcome,
      });
      const succeeded = gatewayResult.status === 'succeeded';
      const resultingOrderStatus = succeeded ? 'paid' : 'placed';
      const resultingPaymentStatus = succeeded ? 'paid' : 'failed';
      const [attempt] = await PaymentAttempt.create([{
        order: order._id,
        idempotencyKey,
        requestFingerprint,
        amount: order.total,
        currency: 'INR',
        provider: 'simulated',
        status: gatewayResult.status,
        ...(gatewayResult.status === 'failed' ? { failureCode: gatewayResult.failureCode } : {}),
        resultingOrderStatus,
        resultingPaymentStatus,
      }], { session });

      await OrderAuditEvent.create([{
        order: order._id,
        actorType: 'customer',
        actorId: userId,
        eventType: 'payment_attempted',
        fromStatus: order.status,
        toStatus: order.status,
        note: 'Simulated payment attempt recorded.',
      }], { session });

      if (succeeded) assertOrderTransition(order.status, 'paid');
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: order._id, user: userId, status: 'placed' },
        {
          $set: { status: resultingOrderStatus, paymentStatus: resultingPaymentStatus },
          $push: {
            statusHistory: {
              status: resultingOrderStatus,
              timestamp: new Date(),
              note: succeeded ? 'Payment succeeded.' : 'Payment failed.',
            },
          },
        },
        { returnDocument: 'after', session },
      );
      if (!updatedOrder) throw new ApiError(409, 'Order is no longer eligible for payment');

      await OrderAuditEvent.create([{
        order: order._id,
        actorType: 'customer',
        actorId: userId,
        eventType: succeeded ? 'payment_succeeded' : 'payment_failed',
        fromStatus: 'placed',
        toStatus: resultingOrderStatus,
        note: succeeded ? 'Simulated payment succeeded.' : 'Simulated payment was declined.',
      }], { session });

      result = toPaymentResult(updatedOrder, attempt, false);
    });

    if (!result) throw new ApiError(500, 'Payment could not be processed');
    return result;
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;

    const order = await findOrderForCustomer(userId, orderId);
    const replayedResult = await findPaymentReplay(order, idempotencyKey, requestFingerprint);
    if (!replayedResult) throw error;
    return replayedResult;
  } finally {
    await session.endSession();
  }
}
