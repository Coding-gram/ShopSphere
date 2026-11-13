import type { IOrder } from '../../models/Order.js';

export function toOrderView(order: IOrder) {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    items: order.items.map((item) => ({
      product: item.product.toString(),
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: order.shippingAddress,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
