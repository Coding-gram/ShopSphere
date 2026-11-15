import mongoose, { type ClientSession, type QueryFilter } from 'mongoose';
import { Order, type IOrder, type OrderStatus, type PaymentStatus } from '../../models/Order.js';
import { OrderAuditEvent } from '../../models/OrderAuditEvent.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { toAdminOrderView, type AdminOrderCustomer } from './adminOrderView.js';
import { assertOrderTransition } from './orderStateMachine.js';

export interface AdminOrderQuery {
  page?: string | number;
  limit?: string | number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type AdminLifecycleStatus = 'packed' | 'shipped' | 'delivered';

function startOfDay(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function endOfDay(value: string): Date {
  return new Date(`${value}T23:59:59.999Z`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function customerMapForOrders(orders: IOrder[]): Promise<Map<string, AdminOrderCustomer>> {
  const userIds = [...new Set(orders.map((order) => order.user.toString()))];
  if (userIds.length === 0) return new Map();

  const customers = await User.find({ _id: { $in: userIds } }).select('_id name email').lean();
  return new Map(customers.map((customer) => [customer._id.toString(), {
    _id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
  }]));
}

async function serializeAdminOrders(orders: IOrder[]) {
  const customers = await customerMapForOrders(orders);
  return orders.map((order) => toAdminOrderView(order, customers.get(order.user.toString()) ?? null));
}

export async function listAdminOrders(query: AdminOrderQuery) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  const filter: QueryFilter<IOrder> = {};

  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {
      ...(query.dateFrom ? { $gte: startOfDay(query.dateFrom) } : {}),
      ...(query.dateTo ? { $lte: endOfDay(query.dateTo) } : {}),
    };
  }

  if (query.search) {
    const searchExpression = new RegExp(escapeRegExp(query.search), 'i');
    const matchingCustomers = await User.find({
      $or: [{ name: searchExpression }, { email: searchExpression }],
    }).select('_id').lean();
    filter.$or = [
      { orderNumber: searchExpression },
      ...(matchingCustomers.length > 0 ? [{ user: { $in: matchingCustomers.map((customer) => customer._id) } }] : []),
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    items: await serializeAdminOrders(orders),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function getAdminOrder(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  const [view] = await serializeAdminOrders([order]);
  return view;
}

async function executeTransition(
  adminId: string,
  orderId: string,
  nextStatus: AdminLifecycleStatus,
  note?: string,
  session?: ClientSession,
): Promise<IOrder | undefined> {
  const activeAdmin = await User.exists({ _id: adminId, role: 'admin', isActive: true }).session(session ?? null);
  if (!activeAdmin) throw new ApiError(403, 'An active admin account is required.');

  const order = await Order.findById(orderId).session(session ?? null);
  if (!order) throw new ApiError(404, 'Order not found');
  assertOrderTransition(order.status, nextStatus);

  const auditNote = note ?? `Order marked ${nextStatus} by an administrator`;
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    {
      $set: { status: nextStatus },
      $push: { statusHistory: { status: nextStatus, timestamp: new Date(), note: auditNote } },
    },
    { returnDocument: 'after', ...(session ? { session } : {}) },
  );
  if (!updatedOrder) return undefined;

  await OrderAuditEvent.create([{
    order: updatedOrder._id,
    actorType: 'admin',
    actorId: adminId,
    eventType: 'order_status_changed',
    fromStatus: order.status,
    toStatus: nextStatus,
    note: auditNote,
  }], session ? { session } : {});

  return updatedOrder;
}

function isTransactionUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return ('code' in error && (error as Error & { code?: number }).code === 20)
    || error.message.includes('Transaction numbers are only allowed');
}

export async function transitionAdminOrder(
  adminId: string,
  orderId: string,
  nextStatus: AdminLifecycleStatus,
  note?: string,
) {
  const session = await mongoose.startSession();

  try {
    let transitionedOrder: IOrder | undefined;

    try {
      await session.withTransaction(async () => {
        transitionedOrder = await executeTransition(adminId, orderId, nextStatus, note, session);
      });
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) throw error;
      transitionedOrder = await executeTransition(adminId, orderId, nextStatus, note);
    }

    if (!transitionedOrder) throw new ApiError(409, 'Order status changed concurrently. Refresh and try again.');
    const [view] = await serializeAdminOrders([transitionedOrder]);
    return view;
  } finally {
    await session.endSession();
  }
}
