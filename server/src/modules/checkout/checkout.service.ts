import { createHash, randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { Address } from '../../models/Address.js';
import { Cart } from '../../models/Cart.js';
import { Order } from '../../models/Order.js';
import { OrderAuditEvent } from '../../models/OrderAuditEvent.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import { MAX_CART_ITEM_QUANTITY } from '../cart/cart.validators.js';
import { toOrderView } from '../orders/orderView.js';

function checkoutFingerprint(addressId: string): string {
  return createHash('sha256').update(JSON.stringify({ addressId })).digest('hex');
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

async function findCheckoutReplay(userId: string, idempotencyKey: string, requestFingerprint: string) {
  const existingOrder = await Order.findOne({ user: userId, checkoutIdempotencyKey: idempotencyKey });
  if (!existingOrder) return undefined;

  if (existingOrder.checkoutRequestFingerprint !== requestFingerprint) {
    throw new ApiError(409, 'Idempotency-Key has already been used with a different checkout request');
  }

  return toOrderView(existingOrder);
}

export async function placeOrder(userId: string, addressId: string, idempotencyKey: string) {
  const requestFingerprint = checkoutFingerprint(addressId);
  const existingOrder = await findCheckoutReplay(userId, idempotencyKey, requestFingerprint);
  if (existingOrder) return { order: existingOrder, replayed: true };

  const session = await mongoose.startSession();

  try {
    let result: ReturnType<typeof toOrderView> | undefined;
    let replayed = false;

    await session.withTransaction(async () => {
      const replayedOrder = await findCheckoutReplay(userId, idempotencyKey, requestFingerprint);
      if (replayedOrder) {
        result = replayedOrder;
        replayed = true;
        return;
      }

      const cart = await Cart.findOne({ user: userId }).session(session);
      const address = await Address.findOne({ _id: addressId, user: userId }).session(session);

      if (!address) throw new ApiError(404, 'Address not found');
      if (!cart || cart.items.length === 0) {
        const completedCheckout = await findCheckoutReplay(userId, idempotencyKey, requestFingerprint);
        if (completedCheckout) {
          result = completedCheckout;
          replayed = true;
          return;
        }

        throw new ApiError(400, 'Your cart is empty');
      }

      const orderItems = [];
      for (const cartItem of cart.items) {
        if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 || cartItem.quantity > MAX_CART_ITEM_QUANTITY) {
          throw new ApiError(400, 'Cart contains an invalid quantity');
        }

        const product = await Product.findOneAndUpdate(
          {
            _id: cartItem.product,
            isActive: true,
            stock: { $gte: cartItem.quantity },
          },
          { $inc: { stock: -cartItem.quantity } },
          { returnDocument: 'after', session },
        );

        if (!product) {
          throw new ApiError(409, 'A cart item is unavailable or no longer has enough stock. Refresh your cart and try again.');
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0] ?? '',
          quantity: cartItem.quantity,
          price: product.price,
        });
      }

      const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
      const [order] = await Order.create([{
        user: userId,
        orderNumber: `ORD-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        subtotal,
        shippingCost: 0,
        tax: 0,
        total: subtotal,
        checkoutIdempotencyKey: idempotencyKey,
        checkoutRequestFingerprint: requestFingerprint,
        status: 'placed',
        paymentStatus: 'pending',
        statusHistory: [{ status: 'placed', timestamp: new Date(), note: 'Order placed' }],
      }], { session });

      await OrderAuditEvent.create([{
        order: order._id,
        actorType: 'system',
        eventType: 'order_placed',
        toStatus: 'placed',
        note: 'Order created by checkout.',
      }], { session });

      cart.items = [];
      await cart.save({ session });
      result = toOrderView(order);
    });

    if (!result) throw new ApiError(500, 'Order could not be created');
    return { order: result, replayed };
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;

    const replayedOrder = await findCheckoutReplay(userId, idempotencyKey, requestFingerprint);
    if (!replayedOrder) throw error;
    return { order: replayedOrder, replayed: true };
  } finally {
    await session.endSession();
  }
}
