'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  getAccessToken,
  getGithubAuthUrl,
  linkWithGitLab,
  linkWithBitbucket,
  type User,
} from '@/lib/auth';
import Image from 'next/image';
import Favi from '@/public/logo/favi.png';
import { Check, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<'github' | 'gitlab' | 'bitbucket' | 'skip' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/in/login');
      return;
    }
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, [router]);

  const hasGitHub = !!user?.githubUsername;
  const hasGitLab = !!user?.gitlabUsername;
  const hasBitbucket = !!user?.bitbucketUsername;
  const anyConnected = hasGitHub || hasGitLab || hasBitbucket;

  function handleLinkGitHub() {
    window.location.href = getGithubAuthUrl('link', '/onboarding');
  }

  async function handleLinkGitLab() {
    setLoading('gitlab');
    setError(null);
    try {
      const updatedUser = await linkWithGitLab();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to link GitLab');
    } finally {
      setLoading(null);
    }
  }

  async function handleLinkBitbucket() {
    setLoading('bitbucket');
    setError(null);
    try {
      const updatedUser = await linkWithBitbucket();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to link Bitbucket');
    } finally {
      setLoading(null);
    }
  }

  function handleContinue() {
    router.push('/onboarding/repos');
  }

  async function handleSkip() {
    setLoading('skip');
    const { completeOnboarding } = await import('@/lib/auth');
    await completeOnboarding().catch(() => {});
    router.replace('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-sans tracking-tight relative overflow-hidden text-white">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[480px] px-4 py-8 mx-auto z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src={Favi} alt="CodeKang" width={40} height={40} className="object-contain" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <StepDot index={1} label="Connect accounts" active />
          <div className="h-px w-8 bg-[#27272a]" />
          <StepDot index={2} label="Select repos" active={false} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400 flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Connect your code</h1>
          <p className="text-[14px] text-[#a1a1aa]">
            Link your source control accounts to get started. You can connect more later.
          </p>
        </div>

        {/* Provider cards */}
        <div className="space-y-3 mb-6">
          <ProviderCard
            icon={<GitHubIcon size={20} />}
            iconStyle={{ background: '#27272a' }}
            name="GitHub"
            description="Connect your GitHub repositories"
            connected={hasGitHub}
            username={user?.githubUsername}
            loading={loading === 'github'}
            disabled={loading !== null}
            onConnect={handleLinkGitHub}
          />

          <ProviderCard
            icon={<GitLabIcon size={20} />}
            iconStyle={{ background: 'rgba(252, 109, 38, 0.12)' }}
            name="GitLab"
            description="Connect your GitLab projects"
            connected={hasGitLab}
            username={user?.gitlabUsername}
            loading={loading === 'gitlab'}
            disabled={loading !== null}
            onConnect={handleLinkGitLab}
          />

          <ProviderCard
            icon={<BitbucketIcon size={20} />}
            iconStyle={{ background: 'rgba(0, 82, 204, 0.12)' }}
            name="Bitbucket"
            description="Connect your Bitbucket repositories"
            connected={hasBitbucket}
            username={user?.bitbucketUsername}
            loading={loading === 'bitbucket'}
            disabled={loading !== null}
            onConnect={handleLinkBitbucket}
          />
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!anyConnected || loading !== null}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-[14px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: anyConnected ? '#f8423b' : '#27272a', color: '#fff' }}
        >
          Continue
          <ChevronRight size={16} />
        </button>

        {!anyConnected && (
          <p className="text-center text-[12px] mt-2" style={{ color: '#52525b' }}>
            Connect at least one account to continue
          </p>
        )}

        {/* Skip */}
        <button
          onClick={handleSkip}
          disabled={loading !== null}
          className="w-full py-3 mt-1 text-[13px] text-[#52525b] hover:text-[#71717a] transition-colors disabled:opacity-50"
        >
          {loading === 'skip' ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Skip for now'}
        </button>

        <p className="text-center text-[12px] mt-2" style={{ color: '#3f3f46' }}>
          By continuing you agree to our{' '}
          <a href="#" className="underline hover:text-white transition-colors">Terms</a>{' '}
          &{' '}
          <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepDot({ index, label, active }: { index: number; label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
        style={{
          background: active ? '#f8423b' : '#27272a',
          color: active ? '#fff' : '#52525b',
        }}
      >
        {index}
      </div>
      <span className="text-[12px] font-medium" style={{ color: active ? '#e8e8e8' : '#52525b' }}>
        {label}
      </span>
    </div>
  );
}

function ProviderCard({
  icon,
  iconStyle,
  name,
  description,
  connected,
  username,
  loading,
  disabled,
  onConnect,
}: {
  icon: React.ReactNode;
  iconStyle: React.CSSProperties;
  name: string;
  description: string;
  connected: boolean;
  username?: string;
  loading: boolean;
  disabled: boolean;
  onConnect: () => void;
}) {
  return (
    <div
      className="flex items-center p-4 rounded-xl border"
      style={{
        background: connected ? '#0d1f0f' : '#18181b',
        borderColor: connected ? '#166534' : '#27272a',
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={iconStyle}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0 ml-3">
        <p className="text-[14px] font-medium text-white">{name}</p>
        <p className="text-[12px] truncate" style={{ color: '#71717a' }}>
          {connected && username ? `@${username}` : description}
        </p>
      </div>

      {connected ? (
        <div className="flex items-center gap-1.5 ml-3 shrink-0 px-2.5 py-1 rounded-full" style={{ background: '#14532d' }}>
          <Check size={11} className="text-emerald-400" strokeWidth={3} />
          <span className="text-[11px] font-semibold text-emerald-400">Connected</span>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={disabled}
          className="ml-3 shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: '#3f3f46', color: '#e8e8e8' }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : 'Connect'}
        </button>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GitLabIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FC6D26">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" />
    </svg>
  );
}

function BitbucketIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0052CC">
      <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.865 1.022.865h15.427a.768.768 0 0 0 .76-.647l3.27-20.025a.768.768 0 0 0-.768-.895zM14.52 15.53H9.522L8.17 8.466h7.561z" />
    </svg>
  );
}
