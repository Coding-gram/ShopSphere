import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { transactionLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { cancelOrder, getOrder, listOrders } from './orders.controller.js';
import { cancelCustomerOrderSchema, customerOrderParamsSchema, listCustomerOrdersSchema } from './orders.validators.js';

const router = Router();

router.get('/', protect, validate(listCustomerOrdersSchema), listOrders);
router.post('/:orderId/cancel', protect, transactionLimiter, validate(cancelCustomerOrderSchema), cancelOrder);
router.get('/:orderId', protect, validate(customerOrderParamsSchema), getOrder);

export default router;
