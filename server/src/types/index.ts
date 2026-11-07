import type { Types } from 'mongoose';

// ── User ────────────────────────────────────────────────────────────────────

export enum UserRole {
  Customer = 'customer',
  Admin = 'admin',
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ── Express Augmentation ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: UserRole;
        email: string;
      };
    }
  }
}
