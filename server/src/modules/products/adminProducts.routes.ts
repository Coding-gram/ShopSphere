import { Router } from 'express';
import { protect, requireActiveAdmin, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './products.controller.js';
import { adminProductQuerySchema, createProductSchema, updateProductSchema } from './products.validators.js';

const router = Router();
router.get('/', protect, requireAdmin, validate(adminProductQuerySchema), controller.getAdminProducts);
router.post('/', protect, requireAdmin, requireActiveAdmin, validate(createProductSchema), controller.createProduct);
router.put('/:id', protect, requireAdmin, requireActiveAdmin, validate(updateProductSchema), controller.updateProduct);
router.delete('/:id', protect, requireAdmin, requireActiveAdmin, controller.deleteProduct);
export default router;
