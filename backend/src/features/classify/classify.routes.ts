import { Router } from 'express';
import { classify } from './classify.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Protected route - requires authentication
router.post('/classify', protect, classify);

export default router;
