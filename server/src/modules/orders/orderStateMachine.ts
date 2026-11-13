import { type OrderStatus } from '../../models/Order.js';
import { ApiError } from '../../utils/ApiError.js';

const allowedTransitions: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  placed: ['paid', 'cancelled'],
  paid: ['packed', 'cancelled'],
  packed: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrder(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function assertOrderTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): void {
  if (!canTransitionOrder(currentStatus, nextStatus)) {
    throw new ApiError(409, `Invalid order status transition: ${currentStatus} to ${nextStatus}`);
  }
}
