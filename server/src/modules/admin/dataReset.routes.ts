import { Router } from 'express';
import { protect, requireActiveAdmin } from '../../middleware/auth.js';
import { resetData } from './dataReset.controller.js';

const router = Router();

router.delete('/reset', protect, requireActiveAdmin, resetData);

export default router;
