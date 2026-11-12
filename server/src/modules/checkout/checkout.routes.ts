import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { checkout } from './checkout.controller.js';
import { checkoutSchema } from './checkout.validators.js';

const router = Router();

router.post('/', protect, validate(checkoutSchema), checkout);

export default router;
