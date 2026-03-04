import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { signIn, verifyOTP, resendOTP } from '../lib/auth';

// ─── OTP Input ────────────────────────────────────────────────────────────────
interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; onChange(next.join(''));
      } else if (index > 0) {
        const next = [...digits]; next[index - 1] = ''; onChange(next.join(''));
        inputs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          title={`OTP digit ${i + 1}`}
          placeholder="·"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all
            bg-white/10 text-white outline-none
            ${digit ? 'border-green-400 bg-green-400/10' : 'border-white/20'}
            focus:border-green-400 focus:bg-green-400/10
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

interface SignInProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  onBack: () => void;
}

export function SignIn({ onSuccess, onSwitchToSignUp, onBack }: SignInProps) {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP screen state
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Shared
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Client-side validation
    if (!email?.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await signIn(email, password);

      if (response?.success) {
        setSuccess(response.message || 'Sign in successful!');
        setTimeout(() => onSuccess(), 1000);
      } else {
        // Check if the account requires verification
        if (response?.requiresVerification) {
          setPendingEmail(response.email || email.toLowerCase().trim());
          setStep('otp');
          setResendCooldown(60);
          setError('');
        } else {
          setError(response?.message || 'Sign in failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('SignIn error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const cleanOtp = otp?.replace(/\D/g, '') || '';
    if (cleanOtp.length !== 6) { 
      setError('Please enter the complete 6-digit code.'); 
      return; 
    }
    
    setIsLoading(true);
    try {
      const res = await verifyOTP(pendingEmail, cleanOtp);
      if (res?.success) {
        setSuccess('Email verified! Welcome to EcoSync 🌿');
        setTimeout(() => onSuccess(), 1200);
      } else {
        setError(res?.message || 'Verification failed. Please check the code.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await resendOTP(pendingEmail);
      if (res?.success) {
        setSuccess('New code sent! Check your email.');
        setResendCooldown(60);
        setOtp('');
      } else {
        setError(res?.message || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend code. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 auth-bg-pattern" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={step === 'otp' ? () => { setStep('login'); setError(''); } : onBack}
          className="absolute -top-12 left-0 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          {step === 'otp' ? 'Back to Login' : 'Back to Home'}
        </button>

        <AnimatePresence mode="sync">
          {/* ── STEP 1: Login Form ── */}
          {step === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                  <p className="text-white/60">Sign in to continue to EcoSync</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-200 text-sm">{success}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Signing in...</> : <>Sign In<ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/50">OR</span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google`;
                  }}
                  className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center mt-6 text-white/60">
                  Don't have an account?{' '}
                  <button onClick={onSwitchToSignUp} className="text-green-400 font-semibold hover:text-green-300 transition-colors">Sign Up</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
                  <p className="text-white/60 text-sm">We sent a 6-digit code to</p>
                  <p className="text-green-400 font-semibold mt-1 break-all">{pendingEmail}</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-green-200 text-sm">{success}</span>
                  </motion.div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <label className="block text-white/70 text-sm mb-4 text-center">Enter verification code</label>
                    <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />
                  </div>
                  <button type="submit" disabled={isLoading || otp.replace(/\D/g, '').length !== 6} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Verifying...</> : <><ShieldCheck className="w-5 h-5" />Verify &amp; Continue</>}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <p className="text-white/50 text-sm mb-2">Didn't receive the code?</p>
                  <button onClick={handleResend} disabled={resendCooldown > 0 || isLoading} className="flex items-center gap-2 mx-auto text-sm text-green-400 hover:text-green-300 disabled:text-white/30 disabled:cursor-not-allowed transition-colors">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
                <p className="text-center mt-4 text-white/30 text-xs">Code expires in 5 minutes</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}