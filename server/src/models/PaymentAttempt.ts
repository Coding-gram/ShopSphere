import mongoose, { type Document, Schema } from 'mongoose';

export const PAYMENT_ATTEMPT_STATUSES = ['pending', 'succeeded', 'failed'] as const;
export const PAYMENT_PROVIDERS = ['simulated'] as const;

export type PaymentAttemptStatus = (typeof PAYMENT_ATTEMPT_STATUSES)[number];
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export interface IPaymentAttempt extends Document {
  order: mongoose.Types.ObjectId;
  idempotencyKey: string;
  amount: number;
  currency: 'INR';
  provider: PaymentProvider;
  status: PaymentAttemptStatus;
  failureCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, immutable: true },
    idempotencyKey: { type: String, required: true, trim: true, minlength: 1, maxlength: 128, immutable: true },
    amount: { type: Number, required: true, min: 0, immutable: true },
    currency: { type: String, required: true, enum: ['INR'], default: 'INR', immutable: true },
    provider: { type: String, required: true, enum: PAYMENT_PROVIDERS, default: 'simulated', immutable: true },
    status: { type: String, required: true, enum: PAYMENT_ATTEMPT_STATUSES, default: 'pending' },
    failureCode: { type: String, trim: true, maxlength: 100 },
  },
  { timestamps: true },
);

paymentAttemptSchema.index({ order: 1, idempotencyKey: 1 }, { unique: true });
paymentAttemptSchema.index({ order: 1, createdAt: -1 });

export const PaymentAttempt = mongoose.model<IPaymentAttempt>('PaymentAttempt', paymentAttemptSchema);
