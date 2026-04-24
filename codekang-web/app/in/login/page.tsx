'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import {
  signInWithGoogle,
  getGithubAuthUrl,
  saveTokens,
  sendOtp,
  verifyOtp,
} from '@/lib/auth';
import Image from 'next/image';
import Favi from '@/public/logo/favi.png';
import { ArrowRight, ChevronLeft } from 'lucide-react';

type Provider = 'google' | 'github' | 'email';
type Step = 'login' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [visibleIndices, setVisibleIndices] = useState<{
    [key: number]: boolean;
  }>({});
  const timeoutsRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const [loading, setLoading] = useState<Provider | 'verify' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── OAuth Login Logic ─────────────────────────────────────────
  async function handleOAuthLogin(provider: 'google' | 'github') {
    if (provider === 'github') {
      const url = getGithubAuthUrl('login');
      console.log('DEBUG: Redirecting to GitHub', { url });
      window.location.href = url;
      return;
    }

    setLoading(provider);
    setError(null);
    try {
      const result = await signInWithGoogle();

      saveTokens(result.accessToken, result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      if (result.isNewUser || !result.user.onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      if (msg.includes('popup-closed') || msg.includes('cancelled')) {
        setLoading(null);
        return;
      }
      setError(msg);
      setLoading(null);
    }
  }

  // ─── Email Link Logic ─────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setLoading('email');

    try {
      await sendOtp(email);
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(null);
    }
  };

  // ─── Privacy Helpers ──────────────────────────────────────────
  const maskEmail = (str: string) => {
    const [local, domain] = str.split('@');
    if (!local || !domain) return str;
    if (local.length <= 3) return `***@${domain}`;
    return `${local.slice(0, 3)}***@${domain}`;
  };

  // ─── OTP Logic ────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '') {
      // Show digit
      setVisibleIndices((prev) => ({ ...prev, [index]: true }));

      // Clear existing timeout
      if (timeoutsRef.current[index]) {
        clearTimeout(timeoutsRef.current[index]);
      }

      // Hide after 1 second
      timeoutsRef.current[index] = setTimeout(() => {
        setVisibleIndices((prev) => ({ ...prev, [index]: false }));
      }, 200);

      // Auto focus next
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError(null);
    setLoading('verify');

    try {
      const result = await verifyOtp(email, code);
      saveTokens(result.accessToken, result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      if (result.isNewUser || !result.user.onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center font-sans tracking-tight relative overflow-hidden">

      <div className="w-full max-w-[400px] p-8 mx-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="mb-6">
            <Image src={Favi} alt="CodeKang" width={176} height={176} className="object-contain" />
          </div>

          {step === 'login' ? (
            <>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Welcome back
              </h1>
              <p className="text-[14px] text-[#a1a1aa]">
                Sign in to your CodeKang account.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Check your email
              </h1>
              <p className="text-[14px] text-[#a1a1aa] px-4">
                We&apos;ve sent a 6-digit verification code to <br />
                <span className="text-white font-medium">
                  {maskEmail(email)}
                </span>
              </p>
            </>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-[13px] text-red-400 text-center animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {/* Main Card */}
        <div className="rounded-2xl">
          {/* Step 1: Login Options */}
          {step === 'login' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading !== null}
                  className="flex items-center justify-center gap-2 py-2.5 bg-black text-white border border-[#27272a] hover:border-[#3f3f46] rounded-lg text-[15px] font-medium transition-all disabled:opacity-50"
                >
                  {loading === 'github' ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  Continue with GitHub
                </button>
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading !== null}
                  className="flex items-center justify-center gap-2 py-2.5 bg-black text-white border border-[#27272a] hover:border-[#3f3f46] rounded-lg text-[15px] font-medium transition-all disabled:opacity-50"
                >
                  {loading === 'google' ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24">
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
                  )}
                  Continue with Google
                </button>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#27272a]"></div>
                </div>
                <div className="relative flex justify-center text-[12px] mx-5 uppercase tracking-wider">
                  <span className="px-2 text-[#e4e4e7]">Or with Email</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#1c1c1c] border border-white/40 rounded-lg px-4 py-2.5 text-[14px] text-white placeholder:text-[#52525b] outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading !== null || !email}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#f8423d] text-white rounded-lg text-[15px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-indigo-500/20"
                >
                  {loading === 'email' ? (
                    <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue with Email
                      <ArrowRight
                        size={16}
                        className="text-black/50 group-hover:text-black transition-colors"
                      />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between gap-2.5">
                {otp.map((digit, i) => (
                  <div key={i} className="relative">
                    <input
                      type="text"
                      maxLength={1}
                      value={otp[i] !== '' && !visibleIndices[i] ? '*' : otp[i]}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        const char = val.slice(-1);
                        handleOtpChange(i, char);
                      }}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 bg-[#1c1c1c] border border-[#27272a] rounded-lg text-center text-lg font-medium text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading === 'verify' || otp.join('').length < 6}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg text-[14px] font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {loading === 'verify' ? (
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={() => setStep('login')}
                  className="flex items-center gap-1.5 text-[12px] text-[#a1a1aa] hover:text-white transition-colors"
                >
                  <ChevronLeft size={14} /> Back to login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#71717a] mt-8">
          By continuing, you agree to CodeKang&apos;s{' '}
          <a href="#" className="underline hover:text-white transition-colors">
            Terms of Service
          </a>{' '}
          &{' '}
          <a href="#" className="underline hover:text-white transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
