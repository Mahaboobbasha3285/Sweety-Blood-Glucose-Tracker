import { Router } from 'express';
import { reports } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(reports));
export default router;
