const mongoose = require('mongoose');

// ─── User Schema ──────────────────────────────────────────────────────────────
// Central user document used for both auth and app state.
// isVerified / otp / otpExpires handle the email-OTP flow.
// greenPoints, totalRecycled, carbonSaved mirror the EcoSync gamification layer.

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    // ── Auth ──────────────────────────────────────────────
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // ── Email Verification ────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,         // 6-digit code stored as string to keep leading zeros
      default: null,
    },
    otpExpires: {
      type: Date,           // expiry timestamp checked on verify
      default: null,
    },

    // ── EcoSync Gamification ──────────────────────────────
    greenPoints: {
      type: Number,
      default: 0,
    },
    totalRecycled: {
      type: Number,
      default: 0,
    },
    carbonSaved: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      default: 'Eco Beginner',
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ─── Instance Method: safe public profile (no password / OTP fields) ──────────
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    isVerified: this.isVerified,
    greenPoints: this.greenPoints,
    totalRecycled: this.totalRecycled,
    carbonSaved: this.carbonSaved,
    level: this.level,
    avatar: this.avatar,
    joinedDate: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
