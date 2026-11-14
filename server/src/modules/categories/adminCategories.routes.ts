import { Router } from 'express';
import { protect, requireActiveAdmin, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './categories.controller.js';
import { createCategorySchema, updateCategorySchema } from './categories.validators.js';

const router = Router();
router.get('/', protect, requireAdmin, controller.getAdminCategories);
router.post('/', protect, requireAdmin, requireActiveAdmin, validate(createCategorySchema), controller.createCategory);
router.put('/:id', protect, requireAdmin, requireActiveAdmin, validate(updateCategorySchema), controller.updateCategory);
router.delete('/:id', protect, requireAdmin, requireActiveAdmin, controller.deleteCategory);
export default router;
