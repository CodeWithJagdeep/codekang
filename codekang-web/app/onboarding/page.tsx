'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  getAccessToken,
  getGithubAuthUrl,
  linkWithGitLab,
  linkWithBitbucket,
  type User,
} from '@/lib/auth';
import { Check, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { RiMagicFill } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Favi from '@/public/logo/favi.png';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState<'profile' | 'vcs'>('profile');
  const [profileData, setProfileData] = useState({ name: '', organizationName: '' });
  const [loading, setLoading] = useState<'profile' | 'github' | 'gitlab' | 'bitbucket' | 'skip' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/in/login');
      return;
    }
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setUser(u);
        setProfileData({
          name: u.name || '',
          organizationName: u.organizationName || '',
        });

        if (u.onboardingCompleted) {
          router.replace('/dashboard');
          return;
        }

        if (u.name && u.organizationName) {
          setStep('vcs');
        }
      } catch {}
    }
  }, [router]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading('profile');
    setError(null);
    try {
      const { updateProfile } = await import('@/lib/auth');
      const updatedUser = await updateProfile(profileData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setStep('vcs');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(null);
    }
  }

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
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center font-[family-name:var(--font-space-grotesk)] text-black relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="w-full max-w-[540px] px-6 py-12 mx-auto relative z-10">
        <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Image src={Favi} alt="CodeKang" width={48} height={48} className="object-contain" />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <StepDot index={1} label="Identity" active={step === 'profile'} completed={step === 'vcs'} />
            <div className="h-[2px] w-12 bg-black/10" />
            <StepDot index={2} label="Connect" active={step === 'vcs'} completed={false} />
            <div className="h-[2px] w-12 bg-black/10" />
            <StepDot index={3} label="Source" active={false} completed={false} />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-50 border-2 border-black text-[13px] font-bold text-red-600 flex items-start gap-3 overflow-hidden"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 'profile' ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">Initialize Profile</h1>
                <p className="text-[15px] text-gray-500 font-medium">
                  Define your engineering identity to continue.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-white border-2 border-black px-5 py-4 text-[15px] font-bold outline-none focus:bg-gray-50 transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-gray-400">Organization</label>
                  <input
                    type="text"
                    required
                    value={profileData.organizationName}
                    onChange={(e) => setProfileData({ ...profileData, organizationName: e.target.value })}
                    placeholder="e.g. CodeKang HQ"
                    className="w-full bg-white border-2 border-black px-5 py-4 text-[15px] font-bold outline-none focus:bg-gray-50 transition-all placeholder:text-gray-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading === 'profile'}
                  className="w-full py-5 bg-black text-white font-black uppercase tracking-widest text-[14px] shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading === 'profile' ? <Loader2 size={20} className="animate-spin" /> : (
                    <>
                      Save Profile
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">Connect Source</h1>
                <p className="text-[15px] text-gray-500 font-medium">
                  Bridge your VCS accounts to start auditing.
                </p>
              </div>

              <div className="space-y-4">
                <ProviderCard
                  icon={<GitHubIcon size={24} />}
                  name="GitHub"
                  description="Primary VCS integration"
                  connected={hasGitHub}
                  username={user?.githubUsername}
                  loading={loading === 'github'}
                  disabled={loading !== null}
                  onConnect={handleLinkGitHub}
                />

                <ProviderCard
                  icon={<GitLabIcon size={24} />}
                  name="GitLab"
                  description="Enterprise workflows"
                  connected={hasGitLab}
                  username={user?.gitlabUsername}
                  loading={loading === 'gitlab'}
                  disabled={loading !== null}
                  onConnect={handleLinkGitLab}
                />

                <div className="mt-8 p-6 border-2 border-black bg-black text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <RiMagicFill size={60} />
                  </div>
                  <h3 className="text-[16px] font-black uppercase tracking-tight mb-2">Automated Fixes</h3>
                  <p className="text-[13px] text-gray-400 mb-6 leading-relaxed font-medium">
                    Install the GitHub App to allow Kang to analyze PRs and open ready-to-merge logic fixes.
                  </p>
                  <a
                    href="https://github.com/apps/codekang/installations/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white text-[13px] font-black uppercase tracking-widest hover:bg-[#ea580c] transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                  >
                    <GitHubIcon size={16} />
                    Grant Permissions
                  </a>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!anyConnected || loading !== null}
                className="w-full py-5 font-black uppercase tracking-widest text-[14px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                style={{
                  background: anyConnected ? 'black' : '#e5e7eb',
                  color: anyConnected ? 'white' : '#9ca3af',
                  boxShadow: anyConnected ? '4px_4px_0px_0px_rgba(34,197,94,1)' : 'none'
                }}
              >
                Continue to Repo Scan
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={handleSkip}
              disabled={loading !== null}
              className="text-[13px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors disabled:opacity-50"
            >
              {loading === 'skip' ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Enter Dashboard →'}
            </button>

            <p className="text-center text-[11px] font-bold uppercase tracking-tight text-gray-300">
              Commitment to Security · <a href="#" className="underline">Terms</a> · <a href="#" className="underline">Privacy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDot({ index, label, active, completed }: { index: number; label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-8 h-8 border-2 border-black flex items-center justify-center text-[12px] font-black transition-all ${
          active ? 'bg-[#f97316] text-white' : completed ? 'bg-black text-white' : 'bg-white text-gray-300'
        }`}
        style={{ boxShadow: active || completed ? '2px_2px_0px_0px_rgba(0,0,0,1)' : 'none' }}
      >
        {completed ? <Check size={16} strokeWidth={4} /> : index}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-black' : 'text-gray-300'}`}>
        {label}
      </span>
    </div>
  );
}

function ProviderCard({
  icon,
  name,
  description,
  connected,
  username,
  loading,
  disabled,
  onConnect,
}: {
  icon: React.ReactNode;
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
      className={`flex items-center p-5 border-2 border-black transition-all ${
        connected ? 'bg-green-50/50' : 'bg-white'
      }`}
      style={{ boxShadow: connected ? 'none' : '4px_4px_0px_0px_rgba(0,0,0,0.05)' }}
    >
      <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0 ml-4">
        <p className="text-[15px] font-black uppercase tracking-tight">{name}</p>
        <p className="text-[12px] font-medium text-gray-400">
          {connected && username ? `@${username}` : description}
        </p>
      </div>

      {connected ? (
        <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-black text-white">
          <Check size={12} strokeWidth={4} />
          <span className="text-[10px] font-black uppercase">Active</span>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={disabled}
          className="ml-4 px-4 py-2 border-2 border-black text-[12px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Link'}
        </button>
      )}
    </div>
  );
}

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GitLabIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" />
    </svg>
  );
}

function BitbucketIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.865 1.022.865h15.427a.768.768 0 0 0 .76-.647l3.27-20.025a.768.768 0 0 0-.768-.895zM14.52 15.53H9.522L8.17 8.466h7.561z" />
    </svg>
  );
}
