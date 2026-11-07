import { Router } from 'express';
import * as productsController from './products.controller.js';
import { validate } from '../../middleware/validate.js';
import { protect, requireAdmin } from '../../middleware/auth.js';
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
router.post('/', protect, requireAdmin, validate(createProductSchema), productsController.createProduct);
router.put('/:id', protect, requireAdmin, validate(updateProductSchema), productsController.updateProduct);
router.delete('/:id', protect, requireAdmin, productsController.deleteProduct);

export default router;

