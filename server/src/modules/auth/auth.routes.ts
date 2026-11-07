import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { protect } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.validators.js';

const router = Router();

// Public
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

export default router;

