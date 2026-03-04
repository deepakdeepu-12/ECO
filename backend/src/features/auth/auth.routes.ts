import { Router } from 'express';
import passport from 'passport';
import { protect } from '../../middleware/auth.middleware';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  getProfile,
  updateProfile,
  googleCallback,
} from './auth.controller';

const router = Router();

router.post('/register',    register);
router.post('/verify-otp',  verifyOTP);
router.post('/resend-otp',  resendOTP);
router.post('/login',       login);
router.get('/profile',      protect, getProfile);
router.put('/profile',      protect, updateProfile);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/signin?error=auth_failed' }),
  googleCallback
);

export default router;
