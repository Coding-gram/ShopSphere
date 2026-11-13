import mongoose, { type Document, Schema } from 'mongoose';
import { ORDER_STATUSES, type OrderStatus } from './Order.js';

export const ORDER_AUDIT_EVENT_TYPES = [
  'order_placed',
  'order_status_changed',
  'payment_attempted',
  'payment_succeeded',
  'payment_failed',
  'order_cancelled',
  'legacy_status_migrated',
] as const;
export const ORDER_AUDIT_ACTOR_TYPES = ['customer', 'admin', 'system'] as const;

export type OrderAuditEventType = (typeof ORDER_AUDIT_EVENT_TYPES)[number];
export type OrderAuditActorType = (typeof ORDER_AUDIT_ACTOR_TYPES)[number];

export interface IOrderAuditEvent extends Document {
  order: mongoose.Types.ObjectId;
  actorType: OrderAuditActorType;
  actorId?: mongoose.Types.ObjectId;
  eventType: OrderAuditEventType;
  fromStatus?: OrderStatus;
  toStatus?: OrderStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderAuditEventSchema = new Schema<IOrderAuditEvent>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, immutable: true },
    actorType: { type: String, required: true, enum: ORDER_AUDIT_ACTOR_TYPES, immutable: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', immutable: true },
    eventType: { type: String, required: true, enum: ORDER_AUDIT_EVENT_TYPES, immutable: true },
    fromStatus: { type: String, enum: ORDER_STATUSES, immutable: true },
    toStatus: { type: String, enum: ORDER_STATUSES, immutable: true },
    note: { type: String, trim: true, maxlength: 500, immutable: true },
  },
  { timestamps: true },
);

orderAuditEventSchema.pre('validate', function () {
  const hasActor = Boolean(this.actorId);
  if (this.actorType === 'system' && hasActor) {
    this.invalidate('actorId', 'System audit events cannot have an actor identifier');
  }
  if (this.actorType !== 'system' && !hasActor) {
    this.invalidate('actorId', 'Customer and admin audit events require an actor identifier');
  }
});

function rejectAuditEventMutation(): never {
  throw new Error('Order audit events are immutable');
}

orderAuditEventSchema.pre('save', function () {
  if (!this.isNew) rejectAuditEventMutation();
});
orderAuditEventSchema.pre('updateOne', rejectAuditEventMutation);
orderAuditEventSchema.pre('updateMany', rejectAuditEventMutation);
orderAuditEventSchema.pre('findOneAndUpdate', rejectAuditEventMutation);
orderAuditEventSchema.pre('replaceOne', rejectAuditEventMutation);
orderAuditEventSchema.pre('findOneAndReplace', rejectAuditEventMutation);
orderAuditEventSchema.pre('deleteOne', rejectAuditEventMutation);
orderAuditEventSchema.pre('deleteMany', rejectAuditEventMutation);
orderAuditEventSchema.pre('findOneAndDelete', rejectAuditEventMutation);

orderAuditEventSchema.index({ order: 1, createdAt: -1 });
orderAuditEventSchema.index({ eventType: 1, createdAt: -1 });

export const OrderAuditEvent = mongoose.model<IOrderAuditEvent>('OrderAuditEvent', orderAuditEventSchema);
