import { Router } from 'express';
import { protect, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { getDashboard } from './dashboard.controller.js';
import { dashboardQuerySchema } from './dashboard.validators.js';

const router = Router();

router.get('/', protect, requireAdmin, validate(dashboardQuerySchema), getDashboard);

export default router;
