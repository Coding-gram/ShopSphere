import { Router } from 'express';
import * as categoriesController from './categories.controller.js';
import { validate } from '../../middleware/validate.js';
import { protect, requireAdmin } from '../../middleware/auth.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from './categories.validators.js';

const router = Router();

// Public
router.get('/', categoriesController.getCategories);
router.get('/:slug', categoriesController.getCategory);

// Admin
router.post('/', protect, requireAdmin, validate(createCategorySchema), categoriesController.createCategory);
router.put('/:id', protect, requireAdmin, validate(updateCategorySchema), categoriesController.updateCategory);
router.delete('/:id', protect, requireAdmin, categoriesController.deleteCategory);

export default router;

