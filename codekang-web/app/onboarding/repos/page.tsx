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
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center font-sans tracking-tight text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[600px] px-4 py-8 mx-auto z-10 flex flex-col">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src={Favi} alt="CodeKang" width={40} height={40} className="object-contain" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <StepDot index={1} label="Connect accounts" active={false} done />
          <div className="h-px w-8 bg-[#f97316]/40" />
          <StepDot index={2} label="Select repos" active />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push('/onboarding')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#71717a' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Select repositories</h1>
            <p className="text-[13px]" style={{ color: '#71717a' }}>
              Choose which repos to connect. You can change this later.
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
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400 flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Provider tabs */}
        {connectedProviders.length > 1 && (
          <div className="flex gap-1 mt-5 p-1 rounded-xl" style={{ background: '#18181b' }}>
            {connectedProviders.map((p) => (
              <button
                key={p}
                onClick={() => setActiveTab(p)}
                className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all capitalize"
                style={{
                  background: activeTab === p ? '#27272a' : 'transparent',
                  color: activeTab === p ? '#e8e8e8' : '#71717a',
                }}
              >
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
        )}

        {/* Repo list */}
        <div className="mt-4 flex-1">
          {activeTab === 'github' && (
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
          )}
          {activeTab === 'gitlab' && <ComingSoonTab provider="GitLab" />}
          {activeTab === 'bitbucket' && <ComingSoonTab provider="Bitbucket" />}
        </div>

        {/* Footer actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-[14px] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#f97316', color: '#fff' }}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : totalSelected > 0 ? (
              <>
                Connect {totalSelected} {totalSelected === 1 ? 'repo' : 'repos'} & continue
                <ChevronRight size={16} />
              </>
            ) : (
              <>
                Continue to dashboard
                <ChevronRight size={16} />
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={submitting}
            className="w-full py-2 text-[13px] transition-colors disabled:opacity-50"
            style={{ color: '#52525b' }}
          >
            Skip for now
          </button>
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

function StepDot({
  index,
  label,
  active,
  done = false,
}: {
  index: number;
  label: string;
  active: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
        style={{
          background: active ? '#f97316' : done ? '#166534' : '#27272a',
          color: active || done ? '#fff' : '#52525b',
        }}
      >
        {done ? <Check size={12} strokeWidth={3} /> : index}
      </div>
      <span className="text-[12px] font-medium" style={{ color: active ? '#e8e8e8' : '#52525b' }}>
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
    <div
      className="mt-5 p-4 rounded-xl border"
      style={{ background: '#18181b', borderColor: '#27272a' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium capitalize" style={{ color: '#71717a' }}>
          {plan} plan
        </span>
        <span className="text-[12px] font-semibold" style={{ color: atLimit ? '#ef4444' : '#e8e8e8' }}>
          {unlimited ? `${used} repos connected` : `${used} / ${limit} repos`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#27272a' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: atLimit ? '#ef4444' : '#f97316' }}
          />
        </div>
      )}
      {atLimit && (
        <p className="text-[11px] mt-2" style={{ color: '#ef4444' }}>
          Plan limit reached. Upgrade to add more repositories.
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
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl animate-pulse"
            style={{ background: '#18181b' }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle size={32} style={{ color: '#71717a' }} />
        <p className="text-[13px]" style={{ color: '#a1a1aa' }}>{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors hover:bg-white/5"
          style={{ borderColor: '#27272a', color: '#e8e8e8' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (repos.length === 0 && connectedRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-[14px] font-medium" style={{ color: '#a1a1aa' }}>No repositories found</p>
        <p className="text-[13px]" style={{ color: '#52525b' }}>
          Make sure your GitHub account has repositories.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: '#27272a' }}
    >
      {/* Already connected */}
      {connectedRepos.map((repo) => (
        <div
          key={repo.id}
          className="flex items-center px-4 py-3 border-b"
          style={{ borderColor: '#27272a', background: '#0d1f0f' }}
        >
          <div
            className="w-5 h-5 rounded flex items-center justify-center shrink-0 mr-3"
            style={{ background: '#166534' }}
          >
            <Check size={12} strokeWidth={3} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: '#e8e8e8' }}>
              {repo.fullName}
            </p>
          </div>
          <span className="text-[11px] font-semibold ml-3 shrink-0 text-emerald-500">
            Connected
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
            className="flex items-center px-4 py-3 transition-colors"
            style={{
              borderBottom: idx < repos.length - 1 ? '1px solid #1f1f23' : 'none',
              background: isSelected ? '#1a1208' : 'transparent',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.4 : 1,
            }}
          >
            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded border flex items-center justify-center shrink-0 mr-3 transition-all"
              style={{
                borderColor: isSelected ? '#f97316' : '#3f3f46',
                background: isSelected ? '#f97316' : 'transparent',
              }}
            >
              {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium truncate" style={{ color: '#e8e8e8' }}>
                  {repo.full_name}
                </p>
                {repo.private && (
                  <Lock size={11} style={{ color: '#71717a' }} className="shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {repo.language && (
                  <span className="text-[11px]" style={{ color: '#71717a' }}>
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px]" style={{ color: '#71717a' }}>
                  <Star size={10} />
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
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: '#18181b' }}
      >
        <Lock size={20} style={{ color: '#52525b' }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: '#a1a1aa' }}>
        {provider} coming soon
      </p>
      <p className="text-[13px]" style={{ color: '#52525b' }}>
        Repo browsing for {provider} is on the roadmap.
      </p>
    </div>
  );
}
