import { Router } from 'express';
import { protect, requireActiveAdmin, requireAdmin } from '../../middleware/auth.js';
import { transactionLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  getAdminOrderRecord,
  listAdminOrderRecords,
  transitionAdminOrderRecord,
} from './adminOrders.controller.js';
import {
  adminOrderParamsSchema,
  listAdminOrdersSchema,
  transitionAdminOrderSchema,
} from './adminOrders.validators.js';

const router = Router();

router.get('/', protect, requireAdmin, validate(listAdminOrdersSchema), listAdminOrderRecords);
router.get('/:orderId', protect, requireAdmin, validate(adminOrderParamsSchema), getAdminOrderRecord);
router.patch(
  '/:orderId/status',
  protect,
  requireAdmin,
  requireActiveAdmin,
  transactionLimiter,
  validate(transitionAdminOrderSchema),
  transitionAdminOrderRecord,
);

export default router;
