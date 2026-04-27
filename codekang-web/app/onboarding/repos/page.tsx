'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  getAccessToken,
  fetchRepos,
  fetchConnectedRepos,
  connectRepo,
  completeOnboarding,
  type User,
  type IGitHubRepo,
  type IRepository,
} from '@/lib/auth';
import Image from 'next/image';
import Favi from '@/public/logo/favi.png';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Star,
  Lock,
  Check,
  ChevronRight,
} from 'lucide-react';
import { RiMagicFill } from 'react-icons/ri';

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 20,
  pro: 100,
  team: -1,
  enterprise: -1,
};

type Provider = 'github' | 'gitlab' | 'bitbucket';

export default function OnboardingReposPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Provider>('github');

  const [githubRepos, setGithubRepos] = useState<IGitHubRepo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<IRepository[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [loadingRepos, setLoadingRepos] = useState(true);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/in/login');
      return;
    }
    const raw = localStorage.getItem('user');
    if (!raw) {
      router.replace('/onboarding');
      return;
    }
    try {
      const parsed: User = JSON.parse(raw);
      setUser(parsed);
      const hasAny = parsed.githubUsername || parsed.gitlabUsername || parsed.bitbucketUsername;
      if (!hasAny) {
        router.replace('/onboarding');
        return;
      }
      if (parsed.githubUsername) setActiveTab('github');
      else if (parsed.gitlabUsername) setActiveTab('gitlab');
      else setActiveTab('bitbucket');
    } catch {
      router.replace('/onboarding');
    }
  }, [router]);

  const loadRepos = useCallback(async () => {
    if (!user) return;
    setLoadingRepos(true);
    setRepoError(null);
    try {
      const [allRepos, connected] = await Promise.all([
        user.githubUsername ? fetchRepos() : Promise.resolve([]),
        fetchConnectedRepos(),
      ]);
      setGithubRepos(allRepos);
      setConnectedRepos(connected);
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoadingRepos(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadRepos();
  }, [user, loadRepos]);

  const limit = PLAN_LIMITS[user?.plan ?? 'free'] ?? 5;
  const unlimited = limit === -1;
  const alreadyConnectedIds = new Set(connectedRepos.map((r) => r.githubId));
  const availableGithubRepos = githubRepos.filter((r) => !alreadyConnectedIds.has(r.id));
  const totalSelected = selected.size;
  const totalConnected = connectedRepos.length;
  const usedSlots = totalConnected + totalSelected;
  const remaining = unlimited ? Infinity : Math.max(0, limit - totalConnected - totalSelected);
  const atLimit = !unlimited && usedSlots >= limit;

  function toggleRepo(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (atLimit) return prev;
        next.add(id);
      }
      return next;
    });
  }

  async function handleFinish() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const toConnect = githubRepos.filter((r) => selected.has(r.id));
      for (const repo of toConnect) {
        await connectRepo(repo.owner.login, repo.name);
      }
      await completeOnboarding().catch(() => {});
      router.replace('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to connect repositories');
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    setSubmitting(true);
    await completeOnboarding().catch(() => {});
    router.replace('/dashboard');
  }

  const connectedProviders: Provider[] = [];
  if (user?.githubUsername) connectedProviders.push('github');
  if (user?.gitlabUsername) connectedProviders.push('gitlab');
  if (user?.bitbucketUsername) connectedProviders.push('bitbucket');

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center font-[family-name:var(--font-space-grotesk)] text-black relative overflow-hidden">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fff;
          border-left: 2px solid #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="w-full max-w-[640px] px-6 py-12 mx-auto relative z-10 flex flex-col">
        <div className="bg-white border-2 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Image src={Favi} alt="CodeKang" width={48} height={48} className="object-contain" />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <StepDot index={1} label="Identity" active={false} completed />
            <div className="h-[2px] w-12 bg-black" />
            <StepDot index={2} label="Connect" active={false} completed />
            <div className="h-[2px] w-12 bg-black" />
            <StepDot index={3} label="Source" active completed={false} />
          </div>

          {/* Header */}
          <div className="flex items-center gap-5 mb-8">
            <button
              onClick={() => router.push('/onboarding')}
              className="p-3 border-2 border-black hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} className="text-black" />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Target Repositories</h1>
              <p className="text-[15px] font-medium text-gray-500">
                Identify the codebases for Kang to protect.
              </p>
            </div>
          </div>

          {/* Plan limit bar */}
          {user && (
            <PlanBar
              plan={user.plan}
              used={usedSlots}
              limit={limit}
              unlimited={unlimited}
            />
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mt-8 p-4 bg-red-50 border-2 border-black text-[13px] font-bold text-red-600 flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Provider tabs */}
          {connectedProviders.length > 1 && (
            <div className="flex gap-2 mt-8 p-2 border-2 border-black bg-gray-50">
              {connectedProviders.map((p) => (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  className={`flex-1 py-3 text-[12px] font-black uppercase tracking-widest transition-all ${
                    activeTab === p ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {PROVIDER_LABELS[p]}
                </button>
              ))}
            </div>
          )}

            {/* Repo list */}
            <div className="mt-6 flex-1">
              {activeTab === 'github' && (
                <>
                  <GitHubRepoList
                    repos={availableGithubRepos}
                    connectedRepos={connectedRepos}
                    selected={selected}
                    atLimit={atLimit}
                    loading={loadingRepos}
                    error={repoError}
                    onToggle={toggleRepo}
                    onRetry={loadRepos}
                  />

                  {/* GitHub App Installation Prompt */}
                  <div className="mt-8 p-6 border-2 border-black bg-black text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <RiMagicFill size={60} />
                    </div>
                    <h3 className="text-[16px] font-black uppercase tracking-tight mb-2">MANDATORY: Analysis Permissions</h3>
                    <p className="text-[13px] text-gray-400 mb-6 leading-relaxed font-medium">
                      CodeKang cannot operate without the GitHub App. You must install it on your selected repositories to proceed to the dashboard.
                    </p>
                    <a
                      href="https://github.com/apps/codekang/installations/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white text-[13px] font-black uppercase tracking-widest hover:bg-[#ea580c] transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    >
                      <GitHubIcon size={16} />
                      Install Required App
                    </a>
                  </div>
                </>
              )}
              {activeTab === 'gitlab' && <ComingSoonTab provider="GitLab" />}
              {activeTab === 'bitbucket' && <ComingSoonTab provider="Bitbucket" />}
            </div>

          {/* Footer actions */}
          <div className="mt-10">
            <button
              onClick={handleFinish}
              disabled={submitting || (activeTab === 'github' && totalSelected === 0)}
              className="w-full py-5 bg-black text-white font-black uppercase tracking-widest text-[14px] shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {totalSelected > 0 ? `Connect & Activate ${totalSelected} Repos` : 'Select Repos to Continue'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<Provider, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
};

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

function PlanBar({
  plan,
  used,
  limit,
  unlimited,
}: {
  plan: string;
  used: number;
  limit: number;
  unlimited: boolean;
}) {
  const pct = unlimited ? 0 : Math.min(100, (used / limit) * 100);
  const atLimit = !unlimited && used >= limit;

  return (
    <div className="mt-8 p-6 border-2 border-black bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">
          {plan} Subscription
        </span>
        <span className={`text-[13px] font-black ${atLimit ? 'text-red-600' : 'text-black'}`}>
          {unlimited ? `${used} Connected` : `${used} / ${limit} Slots Used`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-3 border-2 border-black bg-white overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${pct}%`, background: atLimit ? '#ef4444' : '#f97316' }}
          />
        </div>
      )}
      {atLimit && (
        <p className="text-[11px] font-bold uppercase mt-3 text-red-600">
          Quota Exceeded. Please upgrade for more slots.
        </p>
      )}
    </div>
  );
}

function GitHubRepoList({
  repos,
  connectedRepos,
  selected,
  atLimit,
  loading,
  error,
  onToggle,
  onRetry,
}: {
  repos: IGitHubRepo[];
  connectedRepos: IRepository[];
  selected: Set<number>;
  atLimit: boolean;
  loading: boolean;
  error: string | null;
  onToggle: (id: number) => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-16 border-2 border-black bg-gray-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5">
        <AlertCircle size={40} className="text-gray-300" />
        <p className="text-[14px] font-bold text-gray-500">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 border-2 border-black text-[12px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (repos.length === 0 && connectedRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-gray-200">
        <p className="text-[15px] font-black uppercase tracking-tighter text-gray-400">Empty Environment</p>
        <p className="text-[13px] font-medium text-gray-400">
          We couldn't find any repositories in your GitHub account.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white overflow-y-auto max-h-[420px] custom-scrollbar">
      {/* Already connected */}
      {connectedRepos.map((repo) => (
        <div
          key={repo.id}
          className="flex items-center px-5 py-4 border-b-2 border-black bg-green-50/30"
        >
          <div className="w-6 h-6 border-2 border-black bg-black flex items-center justify-center shrink-0 mr-4">
            <Check size={14} strokeWidth={4} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold truncate">
              {repo.fullName}
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-green-600">
            Active
          </span>
        </div>
      ))}

      {/* Selectable repos */}
      {repos.map((repo, idx) => {
        const isSelected = selected.has(repo.id);
        const isDisabled = atLimit && !isSelected;

        return (
          <div
            key={repo.id}
            onClick={() => !isDisabled && onToggle(repo.id)}
            className={`flex items-center px-5 py-4 transition-all ${
              idx < repos.length - 1 ? 'border-b-2 border-black/5' : ''
            } ${isSelected ? 'bg-orange-50/50' : 'hover:bg-gray-50'} ${
              isDisabled ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer'
            }`}
          >
            {/* Checkbox */}
            <div
              className={`w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 mr-4 transition-all ${
                isSelected ? 'bg-[#f97316]' : 'bg-white'
              }`}
            >
              {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-[14px] font-bold truncate ${isSelected ? 'text-black' : 'text-gray-900'}`}>
                  {repo.full_name}
                </p>
                {repo.private && (
                  <Lock size={12} className="text-gray-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-1">
                {repo.language && (
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                  <Star size={11} />
                  {repo.stargazers_count}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComingSoonTab({ provider }: { provider: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-black bg-gray-50">
      <div className="w-16 h-16 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Lock size={24} className="text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-[16px] font-black uppercase tracking-tight">{provider} Integration Locked</p>
        <p className="text-[13px] font-medium text-gray-400 mt-1">
          Coming soon to the CodeKang platform.
        </p>
      </div>
    </div>
  );
}
