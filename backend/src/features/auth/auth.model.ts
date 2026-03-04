import mongoose, { Document, Model, Schema } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SafeUser {
  id: unknown;
  name: string;
  email: string;
  isVerified: boolean;
  greenPoints: number;
  totalRecycled: number;
  carbonSaved: number;
  level: string;
  avatar: string | null;
  joinedDate: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  isVerified: boolean;
  otp: string | null;
  otpExpires: Date | null;
  greenPoints: number;
  totalRecycled: number;
  carbonSaved: number;
  level: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): SafeUser;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
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
    password: {
      type: String,
      required: function(this: IUser) {
        // Password is required only if googleId is not present
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
      type: String,
      sparse: true, // Allows null values while maintaining uniqueness for non-null values
      unique: true,
    },
    isVerified:   { type: Boolean, default: false },
    otp:          { type: String,  default: null },
    otpExpires:   { type: Date,    default: null },
    greenPoints:  { type: Number,  default: 0 },
    totalRecycled:{ type: Number,  default: 0 },
    carbonSaved:  { type: Number,  default: 0 },
    level:        { type: String,  default: 'Eco Beginner' },
    avatar:       { type: String,  default: null },
  },
  { timestamps: true }
);

// ─── Instance Method ──────────────────────────────────────────────────────────

userSchema.methods.toSafeObject = function (): SafeUser {
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

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
