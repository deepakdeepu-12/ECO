import { useState, useRef, useEffect } from 'react';
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
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { signUp, verifyOTP, resendOTP } from '../lib/auth';

// â”€â”€â”€ OTP Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

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

interface SignUpProps {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
  onBack: () => void;
}

// â”€â”€â”€ Main SignUp Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function SignUp({ onSuccess, onSwitchToSignIn, onBack }: SignUpProps) {
  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP screen state
  const [step, setStep] = useState<'register' | 'otp'>('register');
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

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!agreedToTerms) { setError('Please agree to the Terms of Service.'); return; }

    setIsLoading(true);
    try {
      const res = await signUp(name, email, password);
      if (res.success || res.requiresVerification) {
        setPendingEmail(res.email || email.toLowerCase());
        setStep('otp');
        setResendCooldown(60);
        setError('');
      } else {
        setError(res.message);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.replace(/\D/g, '').length !== 6) { setError('Please enter the complete 6-digit code.'); return; }
    setIsLoading(true);
    try {
      const res = await verifyOTP(pendingEmail, otp.trim());
      if (res.success) {
        setSuccess('Email verified! Welcome to EcoSync ðŸŒ¿');
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

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      const res = await resendOTP(pendingEmail);
      if (res.success) {
        setSuccess('New code sent! Check your email.');
        setResendCooldown(60);
        setOtp('');
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const bgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: bgPattern }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <button
          onClick={step === 'otp' ? () => { setStep('register'); setError(''); } : onBack}
          className="absolute -top-12 left-0 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          {step === 'otp' ? 'Back to Registration' : 'Back to Home'}
        </button>

        <AnimatePresence mode="wait">
          {/* â”€â”€ STEP 1: Registration Form â”€â”€ */}
          {step === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                  <p className="text-white/60">Join EcoSync and start making a difference</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all" />
                    </div>
                  </div>
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
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-400/50" />
                    <label htmlFor="terms" className="text-white/60 text-sm">
                      I agree to the{' '}
                      <button type="button" className="text-green-400 hover:text-green-300">Terms of Service</button>
                      {' '}and{' '}
                      <button type="button" className="text-green-400 hover:text-green-300">Privacy Policy</button>
                    </label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating Account...</> : <>Create Account<ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>

                <p className="text-center mt-6 text-white/60">
                  Already have an account?{' '}
                  <button onClick={onSwitchToSignIn} className="text-green-400 font-semibold hover:text-green-300 transition-colors">Sign In</button>
                </p>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur rounded-xl border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold text-sm">ðŸŽ Welcome Bonus</p>
                    <p className="text-white/60 text-xs">Get 100 Green Points when you sign up!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* â”€â”€ STEP 2: OTP Verification â”€â”€ */}
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
