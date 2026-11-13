import type { IOrder } from '../../models/Order.js';
import { toOrderView } from './orderView.js';

export interface AdminOrderCustomer {
  _id: string;
  name: string;
  email: string;
}

export function toAdminOrderView(order: IOrder, customer: AdminOrderCustomer | null) {
  return {
    ...toOrderView(order),
    customer,
  };
}
