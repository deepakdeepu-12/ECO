import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  getProfile,
  updateProfile,
} from './auth.controller';

const router = Router();

router.post('/register',    register);
router.post('/verify-otp',  verifyOTP);
router.post('/resend-otp',  resendOTP);
router.post('/login',       login);
router.get('/profile',      protect, getProfile);
router.put('/profile',      protect, updateProfile);

export default router;
