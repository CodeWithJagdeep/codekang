'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithGitHubDirect,
  linkWithGitHubDirect,
  saveTokens,
} from '@/lib/auth';
import { Loader2, AlertCircle } from 'lucide-react';

export default function GitHubCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');

    if (!code) {
      setError('No code provided from GitHub');
      return;
    }

    let mode: 'login' | 'link' = 'login';
    let returnTo = '/dashboard';
    if (stateStr) {
      try {
        const state = JSON.parse(decodeURIComponent(stateStr));
        mode = state.mode ?? 'login';
        returnTo = state.returnTo ?? '/dashboard';
      } catch {
        // ignore malformed state
      }
    }

    async function handleCallback() {
      try {
        if (mode === 'login') {
          const result = await signInWithGitHubDirect(code!);
          saveTokens(result.accessToken, result.refreshToken);
          localStorage.setItem('user', JSON.stringify(result.user));

          if (result.isNewUser || !result.user.onboardingCompleted) {
            router.replace('/onboarding');
          } else {
            router.replace('/dashboard');
          }
        } else {
          // Link mode — user is already authenticated, just linking the VCS account
          const updatedUser = await linkWithGitHubDirect(code!);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          router.replace(returnTo);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
      <div className="max-w-[400px] w-full p-8 text-center">
        {error ? (
          <div className="animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Authentication Failed</h1>
            <p className="text-sm text-[#a1a1aa] mb-8">{error}</p>
            <button
              onClick={() => router.replace('/in/login')}
              className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-[#e4e4e7] transition-all"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="animate-spin text-white opacity-50 mb-6" />
            <h1 className="text-xl font-semibold mb-2">Connecting GitHub...</h1>
            <p className="text-sm text-[#a1a1aa]">Almost there, hang tight</p>
          </div>
        )}
      </div>
    </div>
  );
}
