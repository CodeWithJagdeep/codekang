'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, Copy, Check } from 'lucide-react';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-2 p-1 rounded hover:bg-white/10 text-[#a1a1aa] hover:text-white transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

function EnvLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#27272a] last:border-0">
      <span className="text-[12px] font-mono text-[#a1a1aa] shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-[12px] font-mono text-emerald-400 truncate">{value}</span>
        <CopyButton value={`${label}=${value}`} />
      </div>
    </div>
  );
}

function GitHubAppCreatedHandler() {
  const searchParams = useSearchParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [installUrl, setInstallUrl] = useState<string>('');

  useEffect(() => {
    const s = searchParams.get('github_app_slug');
    const id = searchParams.get('app_id');
    const ws = searchParams.get('webhook_secret');
    setSlug(s);
    setAppId(id);
    setWebhookSecret(ws);
    if (s) {
      // Persist the slug so getGitHubAppInstallUrl() works without restarting Next.js
      localStorage.setItem('github_app_slug', s);
      const callbackUri = `${window.location.origin}/auth/callback/github-app`;
      setInstallUrl(
        `https://github.com/apps/${s}/installations/new?redirect_uri=${encodeURIComponent(callbackUri)}`,
      );
    }
  }, [searchParams]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="max-w-[400px] w-full p-8 text-center">
          <Loader2 size={48} className="animate-spin text-white opacity-50 mx-auto mb-6" />
          <p className="text-sm text-[#a1a1aa]">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white p-6">
      <div className="max-w-[540px] w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold">GitHub App Created!</h1>
            <p className="text-[13px] text-[#71717a]">App slug: <span className="font-mono text-emerald-400">{slug}</span></p>
          </div>
        </div>

        {/* Step 1 — Add env vars */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#52525b] mb-3">
            Step 1 — Add to <span className="font-mono normal-case">.env</span> &amp; <span className="font-mono normal-case">codekang-web/.env</span>
          </p>
          <div className="space-y-1">
            {appId && <EnvLine label="GITHUB_APP_ID" value={appId} />}
            {webhookSecret && <EnvLine label="GITHUB_WEBHOOK_SECRET" value={webhookSecret} />}
            <EnvLine label="NEXT_PUBLIC_GITHUB_APP_NAME" value={slug} />
          </div>
          <p className="text-[11px] text-[#52525b] mt-3">
            The private key was saved to <span className="font-mono">github-app-private-key.pem</span> in the autonomous-ai service directory.
            Set <span className="font-mono">GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem</span>.
          </p>
        </div>

        {/* Step 2 — Install the app */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#52525b] mb-3">
            Step 2 — Install the app on your GitHub account
          </p>
          <p className="text-[13px] text-[#71717a] mb-4">
            Click the button to install the app and grant it access to your repositories. You&apos;ll be brought back here automatically.
          </p>
          <a
            href={installUrl}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-[14px] transition-colors"
          >
            Install on GitHub
          </a>
        </div>

        <p className="text-[12px] text-[#52525b] text-center">
          After installing, restart all services so the new env vars take effect.
        </p>
      </div>
    </div>
  );
}

export default function GitHubAppCreatedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
          <Loader2 size={48} className="animate-spin text-white opacity-50" />
        </div>
      }
    >
      <GitHubAppCreatedHandler />
    </Suspense>
  );
}
