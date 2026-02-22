const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect Middleware ───────────────────────────────────────────────────────
// Verifies the Bearer JWT from the Authorization header.
// Attaches req.user (safe profile) if valid; returns 401/403 otherwise.

const protect = async (req, res, next) => {
  try {
    // 1 ── Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2 ── Verify signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please sign in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please sign in again.',
      });
    }

    // 3 ── Load user from DB (ensures user still exists and is verified)
    const user = await User.findById(decoded.userId).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your account.',
      });
    }

    // 4 ── Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

module.exports = { protect };
