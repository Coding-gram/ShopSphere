import { Order, ORDER_STATUSES, type IOrder } from '../../models/Order.js';
import { User } from '../../models/User.js';

export interface DashboardQuery {
  dateFrom?: string;
  dateTo?: string;
}

function dateFilter(query: DashboardQuery) {
  if (!query.dateFrom && !query.dateTo) return {};
  return {
    createdAt: {
      ...(query.dateFrom ? { $gte: new Date(`${query.dateFrom}T00:00:00.000Z`) } : {}),
      ...(query.dateTo ? { $lte: new Date(`${query.dateTo}T23:59:59.999Z`) } : {}),
    },
  };
}

async function customerMap(orders: IOrder[]) {
  const ids = [...new Set(orders.map((order) => order.user.toString()))];
  const customers = await User.find({ _id: { $in: ids } }).select('_id name email').lean();
  return new Map(customers.map((customer) => [customer._id.toString(), {
    _id: customer._id.toString(), name: customer.name, email: customer.email,
  }]));
}

export async function getDashboardSummary(query: DashboardQuery) {
  const filter = dateFilter(query);
  const earnedFilter = { ...filter, paymentStatus: 'paid', status: { $ne: 'cancelled' } };
  const [totalOrders, earned, groupedStatuses, recentOrders] = await Promise.all([
    Order.countDocuments(filter),
    Order.aggregate<{ revenue: number; paidOrders: number }>([
      { $match: earnedFilter },
      { $group: { _id: null, revenue: { $sum: '$total' }, paidOrders: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: string; count: number }>([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.find(filter).sort({ createdAt: -1, _id: -1 }).limit(5),
  ]);

  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<string, number>;
  groupedStatuses.forEach(({ _id, count }) => { statusCounts[_id] = count; });
  const revenue = earned[0]?.revenue ?? 0;
  const paidOrders = earned[0]?.paidOrders ?? 0;
  const customers = await customerMap(recentOrders);

  return {
    metrics: {
      totalOrders,
      paidOrders,
      revenue,
      averageOrderValue: paidOrders === 0 ? 0 : Math.round((revenue / paidOrders) * 100) / 100,
    },
    statusCounts,
    recentOrders: recentOrders.map((order) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customer: customers.get(order.user.toString()) ?? null,
    })),
  };
}
