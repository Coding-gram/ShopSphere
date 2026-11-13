import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types';

const statusLabels: Record<OrderStatus, string> = {
  placed: 'Placed',
  paid: 'Paid',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant = status === 'delivered' ? 'success' : status === 'cancelled' ? 'destructive' : status === 'placed' ? 'secondary' : 'default';
  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}
