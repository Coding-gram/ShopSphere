import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

// ── Route imports ────────────────────────────────────────────────────────────
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/products.routes.js';
import adminProductRoutes from './modules/products/adminProducts.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import addressRoutes from './modules/addresses/addresses.routes.js';
import checkoutRoutes from './modules/checkout/checkout.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import adminOrderRoutes from './modules/orders/adminOrders.routes.js';
import adminDashboardRoutes from './modules/admin/dashboard.routes.js';

const app = express();

// ── Security & parsing ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/orders', paymentRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);
app.use('/api/v1/admin/dashboard', adminDashboardRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);

// ── 404 handler for unknown routes ──────────────────────────────────────────
app.all('/{*path}', (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
