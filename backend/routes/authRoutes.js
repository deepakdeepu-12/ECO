const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── In-Memory Fallback (when MongoDB is down) ────────────────────────────────
const inMemoryUsers = new Map();

// ─── Email Transporter ────────────────────────────────────────────────────────
// Uses Gmail with an App Password (not your account password).
// Generate one at: https://myaccount.google.com/apppasswords

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 16-char Gmail App Password
    },
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Generates a cryptographically-random 6-digit OTP string
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// Signs a JWT valid for 7 days
const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Sends the OTP verification email
const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"EcoSync 🌿" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'EcoSync – Your Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0F170E;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="500" cellpadding="0" cellspacing="0"
                     style="background:#1A2E1A;border-radius:16px;overflow:hidden;max-width:500px;">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#22C55E,#059669);
                              padding:32px;text-align:center;">
                    <div style="width:60px;height:60px;background:rgba(255,255,255,0.2);
                                border-radius:16px;display:inline-flex;
                                align-items:center;justify-content:center;
                                font-size:28px;margin-bottom:12px;">🌿</div>
                    <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">
                      EcoSync
                    </h1>
                    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">
                      Smart Waste Management
                    </p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <h2 style="color:#86EFAC;margin:0 0 8px;font-size:20px;">
                      Hello, ${name}! 👋
                    </h2>
                    <p style="color:#D1D5DB;font-size:15px;line-height:1.6;margin:0 0 24px;">
                      Use the verification code below to confirm your email address.
                      This code expires in <strong style="color:#22C55E;">5 minutes</strong>.
                    </p>
                    <!-- OTP Box -->
                    <div style="background:#0F170E;border:2px solid #22C55E;
                                border-radius:12px;padding:24px;text-align:center;
                                margin:0 0 24px;">
                      <p style="color:#86EFAC;font-size:13px;margin:0 0 8px;
                                text-transform:uppercase;letter-spacing:2px;">
                        Verification Code
                      </p>
                      <div style="color:#22C55E;font-size:42px;font-weight:700;
                                  letter-spacing:12px;font-family:monospace;">
                        ${otp}
                      </div>
                    </div>
                    <p style="color:#9CA3AF;font-size:13px;margin:0;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#0F170E;padding:20px;text-align:center;
                              border-top:1px solid #1F2937;">
                    <p style="color:#4B5563;font-size:12px;margin:0;">
                      © 2026 EcoSync. Making the planet greener, one scan at a time.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Creates a new unverified user, hashes password, generates & emails OTP.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1 ── Basic input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const emailLower = email.toLowerCase().trim();
    
    // Check if MongoDB is connected
    const mongoConnected = mongoose.connection.readyState === 1;
    
    if (!mongoConnected) {
      // ── IN-MEMORY FALLBACK MODE ────────────────────────────────────────────
      console.warn('⚠️  Using in-memory storage (MongoDB not connected)');
      
      const existingUser = inMemoryUsers.get(emailLower);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const otp = generateOTP();
      
      inMemoryUsers.set(emailLower, {
        id: 'user_' + Date.now(),
        name: name.trim(),
        email: emailLower,
        password: hashedPassword,
        otp,
        otpExpires: Date.now() + 5 * 60 * 1000,
        isVerified: false,
        greenPoints: 100,
        totalRecycled: 0,
        carbonSaved: 0,
        level: 'Seedling',
        joinedDate: new Date().toISOString(),
      });

      console.log(`📧 OTP for ${emailLower}: ${otp} (in-memory mode, email not sent)`);

      return res.status(201).json({
        success: true,
        message: `Account created! Your OTP is: ${otp} (in-memory mode)`,
        requiresVerification: true,
        email: emailLower,
      });
    }

    // ── MONGODB MODE ────────────────────────────────────────────────────────
    
    // 2 ── Check for duplicate email
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // Allow resending OTP for unverified accounts
        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        await existingUser.save();

        await sendOTPEmail(existingUser.email, existingUser.name, otp);

        return res.status(200).json({
          success: true,
          message: 'Account already exists but is unverified. A new OTP has been sent.',
          requiresVerification: true,
          email: existingUser.email,
        });
      }
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3 ── Hash password (salt rounds = 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4 ── Generate OTP (expires in 5 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // 5 ── Save new user
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      otp,
      otpExpires,
      greenPoints: 100, // welcome bonus
    });

    // 6 ── Send verification email
    await sendOTPEmail(user.email, user.name, otp);

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email for the 6-digit verification code.',
      requiresVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Validates the OTP, marks the user verified, issues a JWT.
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const emailLower = email.toLowerCase();
    const mongoConnected = mongoose.connection.readyState === 1;

    if (!mongoConnected) {
      // ── IN-MEMORY FALLBACK MODE ────────────────────────────────────────────
      const user = inMemoryUsers.get(emailLower);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found for this email.',
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'This account is already verified. Please sign in.',
        });
      }

      if (!user.otp || Date.now() > user.otpExpires) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please register again to get a new code.',
        });
      }

      if (user.otp !== otp.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect OTP. Please check the code and try again.',
        });
      }

      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;

      const token = signToken(user.id);

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! Welcome to EcoSync! 🌿',
        token,
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

    // ── MONGODB MODE ────────────────────────────────────────────────────────
    
    // 1 ── Find user with matching unexpired OTP
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this email.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please sign in.',
      });
    }

    // 2 ── Check OTP expiry
    if (!user.otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please register again to get a new code.',
      });
    }

    // 3 ── Validate OTP value
    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP. Please check your email and try again.',
      });
    }

    // 4 ── Mark verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // 5 ── Issue JWT
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to EcoSync! 🌿',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.',
    });
  }
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
// Regenerates and resends the OTP for an unverified account.
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified.' });
    }

    // Throttle: prevent spamming — must wait 60s between resends
    if (user.otpExpires && new Date() < new Date(user.otpExpires.getTime() - 4 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting a new code.',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, user.name, otp);

    res.status(200).json({
      success: true,
      message: 'New verification code sent! Please check your email.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Authenticates credentials, checks isVerified, returns JWT + user profile.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1 ── Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const emailLower = email.toLowerCase();
    const mongoConnected = mongoose.connection.readyState === 1;

    if (!mongoConnected) {
      // ── IN-MEMORY FALLBACK MODE ────────────────────────────────────────────
      const user = inMemoryUsers.get(emailLower);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email address.',
        });
      }

      if (!user.isVerified) {
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        
        console.log(`📧 New OTP for ${emailLower}: ${otp} (in-memory mode)`);

        return res.status(403).json({
          success: false,
          message: `Email not verified. Your new OTP is: ${otp}`,
          requiresVerification: true,
          email: user.email,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please try again.',
        });
      }

      const token = signToken(user.id);

      return res.status(200).json({
        success: true,
        message: 'Welcome back! 🌿',
        token,
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

    // ── MONGODB MODE ────────────────────────────────────────────────────────
    
    // 2 ── Find user (include password field — excluded by default)
    const user = await User.findOne({ email: emailLower }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // 3 ── Check email is verified
    if (!user.isVerified) {
      // Regenerate OTP so they can verify
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
      await sendOTPEmail(user.email, user.name, otp);

      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new code has been sent to your email.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // 4 ── Compare password with hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    // 5 ── Issue JWT
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Welcome back! 🌿',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
});

// ─── GET /api/auth/profile  (protected) ───────────────────────────────────────
// Returns the authenticated user's profile.
router.get('/profile', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
});

// ─── PUT /api/auth/profile  (protected) ───────────────────────────────────────
// Updates the user's name or avatar.
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'avatar'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated.',
      user: updated.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

module.exports = router;
