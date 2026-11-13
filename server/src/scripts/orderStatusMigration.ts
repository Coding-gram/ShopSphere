import mongoose from 'mongoose';
import { Order, ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from '../models/Order.js';

export const LEGACY_ORDER_STATUSES = ['pending', 'confirmed', 'processing'] as const;

type LegacyOrderStatus = (typeof LEGACY_ORDER_STATUSES)[number];

interface LegacyStatusHistoryEntry {
  status: string;
  timestamp?: Date;
  note?: string;
}

interface OrderMigrationSource {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  statusHistory: LegacyStatusHistoryEntry[];
  updatedAt: Date;
}

interface OrderMigrationPlan {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  sourceStatus: string;
  sourcePaymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: Date; note?: string }[];
  note: string;
}

export interface OrderStatusMigrationResult {
  scanned: number;
  migrated: number;
  skipped: number;
}

function isCanonicalOrderStatus(status: string): status is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(status);
}

function isLegacyOrderStatus(status: string): status is LegacyOrderStatus {
  return (LEGACY_ORDER_STATUSES as readonly string[]).includes(status);
}

function isKnownPaymentStatus(status: string): status is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(status);
}

function migratedStatus(
  status: LegacyOrderStatus,
  paymentStatus: string,
  usePersistedPaymentState: boolean,
): { status: OrderStatus; note: string } {
  const hasPaidPayment = paymentStatus === 'paid';

  if (status === 'pending') {
    return {
      status: usePersistedPaymentState && hasPaidPayment ? 'paid' : 'placed',
      note: usePersistedPaymentState && hasPaidPayment
        ? 'Migrated legacy status "pending" to "paid" from the persisted payment state.'
        : 'Migrated legacy status "pending" to "placed".',
    };
  }

  if (status === 'confirmed') {
    return {
      status: hasPaidPayment ? 'paid' : 'placed',
      note: hasPaidPayment
        ? 'Migrated legacy status "confirmed" to "paid" from the persisted payment state.'
        : 'Migrated legacy status "confirmed" to "placed" because the payment state was not paid.',
    };
  }

  return {
    status: hasPaidPayment ? 'packed' : 'placed',
    note: hasPaidPayment
      ? 'Migrated legacy status "processing" to "packed" from the persisted payment state.'
      : 'Migrated legacy status "processing" to "placed" because the payment state was not paid.',
  };
}

function appendNote(note: string | undefined, migrationNote: string): string {
  return [note, migrationNote].filter(Boolean).join(' ').slice(0, 500);
}

function preflight(source: OrderMigrationSource): void {
  const statuses = [source.status, ...source.statusHistory.map((entry) => entry.status)];
  const unsupportedStatuses = statuses.filter(
    (status) => !isCanonicalOrderStatus(status) && !isLegacyOrderStatus(status),
  );

  if (unsupportedStatuses.length > 0) {
    throw new Error(`Unsupported order statuses: ${[...new Set(unsupportedStatuses)].join(', ')}`);
  }
  if (!isKnownPaymentStatus(source.paymentStatus)) {
    throw new Error(`Unsupported payment status on order ${source.orderNumber}: ${source.paymentStatus}`);
  }
}

function buildOrderMigrationPlan(source: OrderMigrationSource): OrderMigrationPlan | null {
  preflight(source);
  if (!isKnownPaymentStatus(source.paymentStatus)) {
    throw new Error(`Unsupported payment status on order ${source.orderNumber}: ${source.paymentStatus}`);
  }
  const paymentStatus = source.paymentStatus;

  let changed = false;
  let currentStatus: OrderStatus;
  let currentStatusNote: string | undefined;

  if (isCanonicalOrderStatus(source.status)) {
    currentStatus = source.status;
  } else if (isLegacyOrderStatus(source.status)) {
    const migration = migratedStatus(source.status, paymentStatus, true);
    currentStatus = migration.status;
    currentStatusNote = migration.note;
    changed = true;
  } else {
    throw new Error(`Unsupported order status: ${source.status}`);
  }

  const statusHistory = source.statusHistory.map((entry) => {
    if (isCanonicalOrderStatus(entry.status)) {
      return {
        status: entry.status,
        timestamp: entry.timestamp ?? source.updatedAt,
        note: entry.note,
      };
    }

    if (!isLegacyOrderStatus(entry.status)) {
      throw new Error(`Unsupported order status: ${entry.status}`);
    }

    const migration = migratedStatus(entry.status, paymentStatus, false);
    changed = true;
    return {
      status: migration.status,
      timestamp: entry.timestamp ?? source.updatedAt,
      note: appendNote(entry.note, migration.note),
    };
  });

  if (statusHistory.length === 0) {
    changed = true;
    statusHistory.push({
      status: currentStatus,
      timestamp: source.updatedAt,
      note: currentStatusNote ?? 'Added missing status history during legacy status migration.',
    });
  }

  if (statusHistory.at(-1)?.status !== currentStatus) {
    changed = true;
    statusHistory.push({
      status: currentStatus,
      timestamp: source.updatedAt,
      note: currentStatusNote ?? 'Preserved the current order status during legacy status migration.',
    });
  }

  if (!changed) return null;

  return {
    orderId: source._id,
    orderNumber: source.orderNumber,
    sourceStatus: source.status,
    sourcePaymentStatus: paymentStatus,
    status: currentStatus,
    statusHistory,
    note: `Migrated legacy order status data for ${source.orderNumber}; payment status remained ${paymentStatus}.`,
  };
}

export async function migrateLegacyOrderStatuses(): Promise<OrderStatusMigrationResult> {
  const orders = await Order.find({}, {
    _id: 1,
    orderNumber: 1,
    status: 1,
    paymentStatus: 1,
    statusHistory: 1,
    updatedAt: 1,
  }).lean() as unknown as OrderMigrationSource[];
  const plans = orders.map(buildOrderMigrationPlan).filter((plan): plan is OrderMigrationPlan => plan !== null);

  if (plans.length > 0) {
    const updateResult = await Order.collection.bulkWrite(
      plans.map((plan) => ({
        updateOne: {
          filter: {
            _id: plan.orderId,
            status: plan.sourceStatus,
            paymentStatus: plan.sourcePaymentStatus,
          },
          update: { $set: { status: plan.status, statusHistory: plan.statusHistory } },
        },
      })),
    );

    if (updateResult.matchedCount !== plans.length) {
      throw new Error('Order data changed during migration. Review the affected orders and rerun the migration.');
    }
  }

  return {
    scanned: orders.length,
    migrated: plans.length,
    skipped: orders.length - plans.length,
  };
}
