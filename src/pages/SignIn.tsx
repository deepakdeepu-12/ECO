import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

interface SignInProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  onBack: () => void;
}

export function SignIn({ onSuccess, onSwitchToSignUp, onBack }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP verification step (when user tries to login but isn't verified yet)
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await signIn(email, password);

      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => onSuccess(), 1000);
      } else if (response.requiresVerification) {
        // Redirect to OTP screen â€” backend already resent the OTP
        setPendingEmail(response.email || email.toLowerCase());
        setStep('otp');
        setResendCooldown(60);
        setError('');
      } else {
        setError(response.message);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.replace(/\D/g, '').length !== 6) { setError('Please enter the complete 6-digit code.'); return; }
    setIsLoading(true);
    try {
      const res = await verifyOTP(pendingEmail, otp.trim());
      if (res.success) {
        setSuccess('Email verified! Signing you in... ðŸŒ¿');
        setTimeout(() => onSuccess(), 1200);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      const res = await resendOTP(pendingEmail);
      if (res.success) { setSuccess('New code sent!'); setResendCooldown(60); setOtp(''); }
      else { setError(res.message); }
    } catch {
      setError('Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const bgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: bgPattern }} />
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
          {step === 'otp' ? 'Back to Sign In' : 'Back to Home'}
        </button>

        {step === 'login' && (
          /* â”€â”€ LOGIN FORM â”€â”€ */
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

            <p className="text-center mt-6 text-white/60">
              Don't have an account?{' '}
              <button onClick={onSwitchToSignUp} className="text-green-400 font-semibold hover:text-green-300 transition-colors">Sign Up</button>
            </p>
          </div>
        )}

        {step === 'otp' && (
          /* â”€â”€ OTP SCREEN â”€â”€ */
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
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
                  {/* Simple 6-digit input â€” full OTPInput component lives in SignUp */}
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading}
                    className="w-full bg-white/10 border-2 border-white/20 rounded-xl py-4 px-4 text-white text-center text-2xl font-bold tracking-[0.5em] placeholder-white/20 focus:outline-none focus:border-green-400 transition-all"
                  />
                </div>
                <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Verifying...</> : <><ShieldCheck className="w-5 h-5" />Verify &amp; Sign In</>}
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-white/50 text-sm mb-2">Didn't receive the code?</p>
                <button onClick={handleResend} disabled={resendCooldown > 0 || isLoading} className="flex items-center gap-2 mx-auto text-sm text-green-400 hover:text-green-300 disabled:text-white/30 disabled:cursor-not-allowed transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
              <p className="text-center mt-4 text-white/30 text-xs">Code expires in 5 minutes</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

