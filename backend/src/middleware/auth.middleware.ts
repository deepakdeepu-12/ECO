import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../features/auth/auth.model';

// ─── Type Augmentation ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
    }
  }
}

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

// ─── Protect Middleware ───────────────────────────────────────────────────────
// Verifies Bearer JWT, attaches req.user, or returns 401/403.

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    let decoded: DecodedToken;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch (err) {
      const jwtErr = err as Error;
      if (jwtErr.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
        return;
      }
      res.status(401).json({ success: false, message: 'Invalid token. Please sign in again.' });
      return;
    }

    const user = await User.findById(decoded.userId).select('-password -otp -otpExpires');
    if (!user) {
      res.status(401).json({ success: false, message: 'User no longer exists.' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ success: false, message: 'Email not verified. Please verify your account.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};
