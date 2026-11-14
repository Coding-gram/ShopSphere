import { Product } from '../../models/Product.js';
import { Category } from '../../models/Category.js';
import { Order } from '../../models/Order.js';
import { Cart } from '../../models/Cart.js';
import { Address } from '../../models/Address.js';
import { PaymentAttempt } from '../../models/PaymentAttempt.js';
import { OrderAuditEvent } from '../../models/OrderAuditEvent.js';
import { InventoryAdjustment } from '../../models/InventoryAdjustment.js';

export interface DataResetResult {
  deleted: Record<string, number>;
}

/** Removes all data except User documents. */
export async function resetNonCustomerData(): Promise<DataResetResult> {
  const [
    orders,
    carts,
    addresses,
    paymentAttempts,
    auditEvents,
    inventoryAdj,
    products,
    categories,
  ] = await Promise.all([
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Address.deleteMany({}),
    PaymentAttempt.deleteMany({}),
    OrderAuditEvent.deleteMany({}),
    InventoryAdjustment.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
  ]);

  return {
    deleted: {
      orders: orders.deletedCount,
      carts: carts.deletedCount,
      addresses: addresses.deletedCount,
      paymentAttempts: paymentAttempts.deletedCount,
      auditEvents: auditEvents.deletedCount,
      inventoryAdjustments: inventoryAdj.deletedCount,
      products: products.deletedCount,
      categories: categories.deletedCount,
    },
  };
}
