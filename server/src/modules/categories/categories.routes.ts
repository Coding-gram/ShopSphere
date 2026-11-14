import { Router } from 'express';
import * as categoriesController from './categories.controller.js';
import { validate } from '../../middleware/validate.js';
import { protect, requireActiveAdmin, requireAdmin } from '../../middleware/auth.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from './categories.validators.js';

const router = Router();

// Public
router.get('/', categoriesController.getCategories);
router.get('/:slug', categoriesController.getCategory);

// Admin
router.post('/', protect, requireAdmin, requireActiveAdmin, validate(createCategorySchema), categoriesController.createCategory);
router.put('/:id', protect, requireAdmin, requireActiveAdmin, validate(updateCategorySchema), categoriesController.updateCategory);
router.delete('/:id', protect, requireAdmin, requireActiveAdmin, categoriesController.deleteCategory);

export default router;

