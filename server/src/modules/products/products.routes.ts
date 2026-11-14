import { Router } from 'express';
import * as productsController from './products.controller.js';
import { validate } from '../../middleware/validate.js';
import { protect, requireActiveAdmin, requireAdmin } from '../../middleware/auth.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from './products.validators.js';

const router = Router();

// Public
router.get('/', validate(productQuerySchema), productsController.getProducts);
router.get('/featured', productsController.getFeatured);
router.get('/:slug', productsController.getProduct);

// Admin
router.post('/', protect, requireAdmin, requireActiveAdmin, validate(createProductSchema), productsController.createProduct);
router.put('/:id', protect, requireAdmin, requireActiveAdmin, validate(updateProductSchema), productsController.updateProduct);
router.delete('/:id', protect, requireAdmin, requireActiveAdmin, productsController.deleteProduct);

export default router;

