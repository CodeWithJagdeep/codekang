'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { connectIntegration } from '@/lib/integrations';
import { getAccessToken } from '@/lib/auth';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function GitHubAppCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');

    if (!installationId) {
      router.replace('/dashboard/integrations');
      return;
    }

    if (!getAccessToken()) {
      router.replace('/in/login');
      return;
    }

    async function save() {
      try {
        await connectIntegration('github', {
          installation_id: installationId!,
          setup_action: setupAction ?? 'install',
        });
        setStatus('success');
        setTimeout(() => {
          router.replace('/dashboard/integrations?connected=github');
        }, 1200);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save installation';
        setErrorMsg(msg);
        setStatus('error');
        setTimeout(() => {
          router.replace('/dashboard/integrations?error=github_failed');
        }, 2500);
      }
    }

    void save();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
      <div className="max-w-[400px] w-full p-8 text-center">
        {status === 'error' ? (
          <div className="animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Installation Failed</h1>
            <p className="text-sm text-[#a1a1aa] mb-4">{errorMsg}</p>
            <p className="text-xs text-[#52525b]">Redirecting you back…</p>
          </div>
        ) : status === 'success' ? (
          <div className="animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">GitHub App Installed!</h1>
            <p className="text-sm text-[#a1a1aa]">Taking you to integrations…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="animate-spin text-white opacity-50 mb-6" />
            <h1 className="text-xl font-semibold mb-2">Saving Installation…</h1>
            <p className="text-sm text-[#a1a1aa]">One moment</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GitHubAppCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
          <Loader2 size={48} className="animate-spin text-white opacity-50" />
        </div>
      }
    >
      <GitHubAppCallbackHandler />
    </Suspense>
  );
}
