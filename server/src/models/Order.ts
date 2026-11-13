import mongoose, { type Document, Schema } from 'mongoose';

export const ORDER_STATUSES = ['placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'] as const;
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ── Sub-document: Order Item ─────────────────────────────────────────────────

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

// ── Interface ────────────────────────────────────────────────────────────────

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  statusHistory: IOrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { type: String, required: true, enum: ORDER_STATUSES },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, trim: true, maxlength: 500 },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true, validate: [(v: IOrderItem[]) => v.length > 0, 'Order must have at least one item'] },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, default: 0, min: 0 },
    tax: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'placed',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
    },
    statusHistory: { type: [orderStatusHistorySchema], required: true },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────────────────────────

orderSchema.index({ user: 1, createdAt: -1 });
// ── Export ────────────────────────────────────────────────────────────────────

export const Order = mongoose.model<IOrder>('Order', orderSchema);
