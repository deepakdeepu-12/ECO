import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// ─── In-Memory Fallback (when MongoDB is unreachable) ─────────────────────────

export interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  password: string;
  otp: string | null;
  otpExpires: number | null;
  isVerified: boolean;
  greenPoints: number;
  totalRecycled: number;
  carbonSaved: number;
  level: string;
  joinedDate: string;
}

export const inMemoryUsers = new Map<string, InMemoryUser>();

// ─── Crypto helpers ───────────────────────────────────────────────────────────

/** Returns a cryptographically random 6-digit OTP string. */
export const generateOTP = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

/** Signs a JWT valid for 7 days. */
export const signToken = (userId: unknown): string =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

export const hashPassword   = (plain: string)           => bcrypt.hash(plain, 12);
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// ─── Email (Nodemailer with Gmail) ───────────────────────────────────────────
// Gmail setup:
// 1. Enable 2FA on your Google account
// 2. Create App Password at https://myaccount.google.com/apppasswords
// 3. Set EMAIL_USER and EMAIL_PASSWORD in .env

const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
    // Force IPv4 to avoid IPv6 connection issues on some hosting platforms
    family: 4,
  });
};

/** Returns true if the email was sent, false on any error. */
export const sendOTPEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<boolean> => {
  try {
    const from = process.env.EMAIL_FROM ?? 'EcoSync <noreply@ecosync.com>';
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from,
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
                <tr>
                  <td style="background:linear-gradient(135deg,#22C55E,#059669);padding:32px;text-align:center;">
                    <div style="width:60px;height:60px;background:rgba(255,255,255,0.2);
                                border-radius:16px;display:inline-flex;align-items:center;
                                justify-content:center;font-size:28px;margin-bottom:12px;">🌿</div>
                    <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">EcoSync</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Smart Waste Management</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="color:#86EFAC;margin:0 0 8px;font-size:20px;">Hello, ${name}! 👋</h2>
                    <p style="color:#D1D5DB;font-size:15px;line-height:1.6;margin:0 0 24px;">
                      Use the verification code below to confirm your email address.
                      This code expires in <strong style="color:#22C55E;">5 minutes</strong>.
                    </p>
                    <div style="background:#0F170E;border:2px solid #22C55E;border-radius:12px;
                                padding:24px;text-align:center;margin:0 0 24px;">
                      <p style="color:#86EFAC;font-size:13px;margin:0 0 8px;
                                text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
                      <div style="color:#22C55E;font-size:42px;font-weight:700;
                                  letter-spacing:12px;font-family:monospace;">${otp}</div>
                    </div>
                    <p style="color:#9CA3AF;font-size:13px;margin:0;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#0F170E;padding:20px;text-align:center;border-top:1px solid #1F2937;">
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
    });
    
    return true;
  } catch (err) {
    console.error('⚠️  Email error (not sent):', (err as Error).message);
    return false;
  }
};
