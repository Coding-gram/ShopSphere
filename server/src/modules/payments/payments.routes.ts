import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { transactionLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { createPayment } from './payments.controller.js';
import { createPaymentSchema } from './payments.validators.js';

const router = Router();

router.post('/:orderId/payments', protect, transactionLimiter, validate(createPaymentSchema), createPayment);

export default router;
