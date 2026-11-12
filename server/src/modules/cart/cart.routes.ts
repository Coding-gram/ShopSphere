import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { addCartItem, getCustomerCart, removeCartItem, updateCartItem } from './cart.controller.js';
import { addToCartSchema, removeCartItemSchema, updateCartItemSchema } from './cart.validators.js';

const router = Router();

router.use(protect);
router.get('/', getCustomerCart);
router.post('/items', validate(addToCartSchema), addCartItem);
router.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', validate(removeCartItemSchema), removeCartItem);

export default router;
