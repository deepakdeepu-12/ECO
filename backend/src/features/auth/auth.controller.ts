import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from './auth.model';
import {
  inMemoryUsers,
  generateOTP,
  signToken,
  sendOTPEmail,
  hashPassword,
  comparePassword,
} from './auth.service';

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body as {
      name: string; email: string; password: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const emailLower = email.toLowerCase().trim();
    const mongoConnected = mongoose.connection.readyState === 1;

    if (!mongoConnected) {
      console.warn('⚠️  Using in-memory storage (MongoDB not connected)');
      if (inMemoryUsers.has(emailLower)) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      const otp = generateOTP();
      const userId = `user_${Date.now()}`;
      const newUser = {
        id: userId,
        name: name.trim(),
        email: emailLower,
        password: await hashPassword(password),
        otp,
        otpExpires: Date.now() + 5 * 60 * 1000,
        isVerified: true, // Auto-verify for direct login
        greenPoints: 100,
        totalRecycled: 0,
        carbonSaved: 0,
        level: 'Seedling',
        joinedDate: new Date().toISOString(),
      };
      inMemoryUsers.set(emailLower, newUser);
      console.log(`✅ Account created for ${emailLower} (auto-verified)`);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully! You can now sign in.',
        requiresVerification: false,
        email: emailLower,
        token: signToken(userId),
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          isVerified: newUser.isVerified,
          greenPoints: newUser.greenPoints,
          totalRecycled: newUser.totalRecycled,
          carbonSaved: newUser.carbonSaved,
          level: newUser.level,
          joinedDate: newUser.joinedDate,
        },
      });
    }

    // ── MongoDB Mode ────────────────────────────────────────────────────────
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // Auto-verify existing unverified accounts for direct login
        existingUser.isVerified = true;
        existingUser.otp = null;
        existingUser.otpExpires = null;
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: 'Account already exists. You can now sign in directly.',
          requiresVerification: false,
          email: existingUser.email,
          token: signToken(existingUser._id),
          user: existingUser.toSafeObject(),
        });
      }
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    const otp = generateOTP();
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password: await hashPassword(password),
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      greenPoints: 100,
      isVerified: true, // Auto-verify for direct login
    });
    // Optional: still send OTP email for reference
    void sendOTPEmail(user.email, user.name, otp);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now sign in.',
      requiresVerification: false,
      email: user.email,
      token: signToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { code?: string };
    console.error('Register error:', error);
    if (err.code === '11000') {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────

export const verifyOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, otp } = req.body as { email: string; otp: string };

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const emailLower = email.toLowerCase();
    const mongoConnected = mongoose.connection.readyState === 1;

    if (!mongoConnected) {
      const user = inMemoryUsers.get(emailLower);
      if (!user) return res.status(404).json({ success: false, message: 'No account found for this email.' });
      if (user.isVerified) return res.status(400).json({ success: false, message: 'This account is already verified. Please sign in.' });
      if (!user.otp || !user.otpExpires || Date.now() > user.otpExpires) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please register again to get a new code.' });
      }
      if (user.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Incorrect OTP. Please check the code and try again.' });
      }
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! Welcome to EcoSync! 🌿',
        token: signToken(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          greenPoints: user.greenPoints,
          totalRecycled: user.totalRecycled,
          carbonSaved: user.carbonSaved,
          level: user.level,
          joinedDate: user.joinedDate,
        },
      });
    }

    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(404).json({ success: false, message: 'No account found for this email.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'This account is already verified. Please sign in.' });
    if (!user.otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please register again to get a new code.' });
    }
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please check your email and try again.' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to EcoSync! 🌿',
      token: signToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────

export const resendOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body as { email: string };
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'No account found for this email.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account is already verified.' });

    // Throttle: prevent spamming — must wait 60 s between resends
    if (user.otpExpires && new Date() < new Date(user.otpExpires.getTime() - 4 * 60 * 1000)) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new code.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    void sendOTPEmail(user.email, user.name, otp);

    return res.status(200).json({ success: true, message: 'New verification code sent! Please check your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailLower = email.toLowerCase();
    const mongoConnected = mongoose.connection.readyState === 1;

    if (!mongoConnected) {
      const user = inMemoryUsers.get(emailLower);
      if (!user) return res.status(401).json({ success: false, message: 'No account found with this email address.' });

      // Email verification check disabled for direct login
      // if (!user.isVerified) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Please verify your email before signing in. Check your inbox for the verification code.',
      //   });
      // }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });

      return res.status(200).json({
        success: true,
        message: 'Welcome back! 🌿',
        token: signToken(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          greenPoints: user.greenPoints,
          totalRecycled: user.totalRecycled,
          carbonSaved: user.carbonSaved,
          level: user.level,
          joinedDate: user.joinedDate,
        },
      });
    }

    const user = await User.findOne({ email: emailLower }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'No account found with this email address.' });

    // Email verification check disabled for direct login
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email before signing in. Check your inbox for the verification code or sign up again.',
    //   });
    // }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });

    return res.status(200).json({
      success: true,
      message: 'Welcome back! 🌿',
      token: signToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── GET /api/auth/profile  (protected) ───────────────────────────────────────

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      user: req.user?.toSafeObject ? req.user.toSafeObject() : req.user,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

// ─── PUT /api/auth/profile  (protected) ───────────────────────────────────────

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const allowed: Array<'name' | 'avatar'> = ['name', 'avatar'];
    const updates: Partial<Record<'name' | 'avatar', unknown>> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.status(200).json({
      success: true,
      message: 'Profile updated.',
      user: updated.toSafeObject(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};
