import { Router } from 'express';
import { getReadings, postReading, putReading, removeReading } from '../controllers/readingController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(getReadings));
router.post('/', asyncHandler(postReading));
router.put('/:id', asyncHandler(putReading));
router.delete('/:id', asyncHandler(removeReading));
export default router;
