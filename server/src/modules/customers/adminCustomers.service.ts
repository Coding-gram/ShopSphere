import mongoose from 'mongoose';
import { Order } from '../../models/Order.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
interface CustomerQuery { page?: number; limit?: number; search?: string; isActive?: boolean; }
function escape(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
async function summaries(ids: mongoose.Types.ObjectId[]) {
  if (!ids.length) return new Map<string, { totalOrders: number; paidOrderTotal: number }>();
  const rows = await Order.aggregate<{ _id: mongoose.Types.ObjectId; totalOrders: number; paidOrderTotal: number }>([
    { $match: { user: { $in: ids } } },
    {
      $group: {
        _id: '$user',
        totalOrders: { $sum: 1 },
        paidOrderTotal: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$paymentStatus', 'paid'] }, { $ne: ['$status', 'cancelled'] }] },
              '$total',
              0,
            ],
          },
        },
      },
    },
  ]);
  return new Map(rows.map((row) => [row._id.toString(), { totalOrders: row.totalOrders, paidOrderTotal: row.paidOrderTotal }]));
}
function view(customer: { _id: mongoose.Types.ObjectId; name: string; email: string; phone?: string; avatar?: string; isActive: boolean; createdAt: Date; updatedAt: Date }, orderSummary?: { totalOrders: number; paidOrderTotal: number }) { return { _id: customer._id.toString(), name: customer.name, email: customer.email, ...(customer.phone ? { phone: customer.phone } : {}), ...(customer.avatar ? { avatar: customer.avatar } : {}), isActive: customer.isActive, createdAt: customer.createdAt, updatedAt: customer.updatedAt, orderSummary: orderSummary ?? { totalOrders: 0, paidOrderTotal: 0 } }; }
export async function listAdminCustomers(query: CustomerQuery) { const page = query.page ?? 1; const limit = query.limit ?? 20; const filter: Record<string, unknown> = { role: 'customer' }; if (query.isActive !== undefined) filter.isActive = query.isActive; if (query.search) { const expression = new RegExp(escape(query.search), 'i'); filter.$or = [{ name: expression }, { email: expression }]; } const [customers, total] = await Promise.all([User.find(filter).select('_id name email isActive createdAt updatedAt').sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(filter)]); const byCustomer = await summaries(customers.map((customer) => customer._id)); return { items: customers.map((customer) => view(customer, byCustomer.get(customer._id.toString()))), pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } }; }
export async function getAdminCustomer(customerId: string) { const customer = await User.findOne({ _id: customerId, role: 'customer' }).select('_id name email phone avatar isActive createdAt updatedAt').lean(); if (!customer) throw new ApiError(404, 'Customer not found'); const byCustomer = await summaries([customer._id]); return view(customer, byCustomer.get(customer._id.toString())); }
export async function updateCustomerStatus(adminId: string, customerId: string, isActive: boolean) { const session = await mongoose.startSession(); try { let customer; await session.withTransaction(async () => { const activeAdmin = await User.exists({ _id: adminId, role: 'admin', isActive: true }).session(session); if (!activeAdmin) throw new ApiError(403, 'An active admin account is required.'); customer = await User.findOneAndUpdate({ _id: customerId, role: 'customer' }, { $set: { isActive } }, { returnDocument: 'after', session }).select('_id name email phone avatar isActive createdAt updatedAt'); if (!customer) throw new ApiError(404, 'Customer not found'); }); if (!customer) throw new ApiError(404, 'Customer not found'); return getAdminCustomer(customerId); } finally { await session.endSession(); } }
