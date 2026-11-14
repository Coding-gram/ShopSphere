export type UserRole = 'customer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: Category;
  images: string[];
  variants: ProductVariant[];
  stock: number;
  sku: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  value: string;
  sku?: string;
  price?: number;
  stock: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive: boolean;
}

export interface CartProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

export interface CartItem {
  _id: string;
  product: CartProduct | null;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AddressInput = Omit<Address, '_id' | 'createdAt' | 'updatedAt'>;

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  variant?: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'placed' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Omit<Address, '_id' | 'isDefault' | 'createdAt' | 'updatedAt'>;
  subtotal: number;
  shippingCost: number;
  discount?: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderCustomer {
  _id: string;
  name: string;
  email: string;
}

export interface AdminOrder extends Order {
  customer: AdminOrderCustomer | null;
}

export type AdminLifecycleStatus = 'packed' | 'shipped' | 'delivered';

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AdminDashboardOrder {
  _id: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  customer: AdminOrderCustomer | null;
}

export interface AdminDashboard {
  metrics: { totalOrders: number; paidOrders: number; revenue: number; averageOrderValue: number };
  statusCounts: Partial<Record<OrderStatus, number>>;
  recentOrders: AdminDashboardOrder[];
}

export interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orderSummary: { totalOrders: number; paidOrderTotal: number };
}

export interface AdminCustomerFilters { page?: number; limit?: number; search?: string; isActive?: boolean; }

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  product: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  pagination: Pagination;
}
