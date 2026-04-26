'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Check,
  Loader2,
  AlertCircle,
  Lock,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import {
  fetchRepos,
  connectRepo,
  type IGitHubRepo,
  type IRepository,
  type User,
} from '@/lib/auth';

type Provider = 'github' | 'gitlab' | 'bitbucket';

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 20,
  pro: 100,
  team: -1,
  enterprise: -1,
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  team: 'Team',
  enterprise: 'Enterprise',
};

const PROVIDER_LABELS: Record<Provider, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
};

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const GitLabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FC6D26">
    <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" />
  </svg>
);

const BitbucketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0052CC">
    <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.865 1.022.865h15.427a.768.768 0 0 0 .76-.647l3.27-20.025a.768.768 0 0 0-.768-.895zM14.52 15.53H9.522L8.17 8.466h7.561z" />
  </svg>
);

const PROVIDER_ICONS: Record<Provider, React.ReactNode> = {
  github: <GitHubIcon />,
  gitlab: <GitLabIcon />,
  bitbucket: <BitbucketIcon />,
};

interface Props {
  user: User | null;
  connectedRepos: IRepository[];
  onClose: () => void;
  onAdded: (repos: IRepository[]) => void;
}

export default function AddRepoDialog({
  user,
  connectedRepos,
  onClose,
  onAdded,
}: Props) {
  const plan = user?.plan ?? 'free';
  const planLimit = PLAN_LIMITS[plan] ?? 5;
  const connectedCount = connectedRepos.length;
  const slotsRemaining =
    planLimit === -1 ? Infinity : Math.max(0, planLimit - connectedCount);

  const connectedGithubIds = new Set(connectedRepos.map((r) => r.githubId));

  const linkedProviders: Provider[] = [];
  if (user?.githubUsername) linkedProviders.push('github');
  if (user?.gitlabUsername) linkedProviders.push('gitlab');
  if (user?.bitbucketUsername) linkedProviders.push('bitbucket');

  const defaultProvider: Provider =
    linkedProviders.length > 0 ? linkedProviders[0] : 'github';

  const [activeProvider, setActiveProvider] = useState<Provider>(defaultProvider);
  const [allRepos, setAllRepos] = useState<IGitHubRepo[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadGithubRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAllRepos([]);
    try {
      const data = await fetchRepos();
      setAllRepos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch repositories';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeProvider === 'github') loadGithubRepos();
  }, [activeProvider, loadGithubRepos]);

  // Repos not yet connected
  const availableRepos = allRepos.filter((r) => !connectedGithubIds.has(r.id));

  const filtered = availableRepos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.language ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  function toggleRepo(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= slotsRemaining) return prev; // limit reached
        next.add(id);
      }
      return next;
    });
  }

  async function handleAdd() {
    if (selected.size === 0 || connecting) return;
    setConnecting(true);
    setError(null);
    const toConnect = allRepos.filter((r) => selected.has(r.id));
    const added: IRepository[] = [];
    try {
      for (const repo of toConnect) {
        const connected = await connectRepo(repo.owner.login, repo.name);
        added.push(connected);
      }
      onAdded(added);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect repositories';
      setError(msg);
      setConnecting(false);
    }
  }

  const atLimit = slotsRemaining === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-[600px] rounded-2xl flex flex-col shadow-2xl"
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: '#27272a' }}
        >
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: '#e8e8e8' }}>
              Add Repositories
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: '#71717a' }}>
              Select repositories to connect to CodeKang.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#71717a' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Provider Tabs */}
        {linkedProviders.length > 1 && (
          <div
            className="flex gap-1 px-6 pt-4"
          >
            {linkedProviders.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelected(new Set());
                  setSearch('');
                  setActiveProvider(p);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  activeProvider === p
                    ? 'text-white'
                    : 'hover:bg-white/5'
                }`}
                style={
                  activeProvider === p
                    ? { background: '#27272a', color: '#e8e8e8' }
                    : { color: '#71717a' }
                }
              >
                {PROVIDER_ICONS[p]}
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
        )}

        {/* Plan usage bar */}
        <div
          className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-center justify-between gap-4"
          style={{ background: '#09090b', border: '1px solid #27272a' }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px]" style={{ color: '#a1a1aa' }}>
                  {PLAN_LABELS[plan]} plan
                </span>
                <span className="text-[12px] font-medium" style={{ color: '#e8e8e8' }}>
                  {connectedCount}
                  {planLimit !== -1 && ` / ${planLimit}`}{' '}
                  repos connected
                </span>
              </div>
              {planLimit !== -1 && (
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: '#27272a' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (connectedCount / planLimit) * 100)}%`,
                      background: atLimit ? '#ef4444' : '#f8423b',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {atLimit && (
            <a
              href="/settings/billing"
              className="flex items-center gap-1 text-[12px] font-medium whitespace-nowrap transition-opacity hover:opacity-80"
              style={{ color: '#f8423b' }}
            >
              Upgrade
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
            style={{ background: '#09090b', borderColor: '#27272a' }}
          >
            <Search size={15} style={{ color: '#71717a' }} />
            <input
              type="text"
              placeholder="Search repositories..."
              className="bg-transparent outline-none flex-1 text-[13px]"
              style={{ color: '#e8e8e8' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Repo list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar">
          {activeProvider !== 'github' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#27272a' }}
              >
                {PROVIDER_ICONS[activeProvider]}
              </div>
              <p className="text-[14px] font-medium" style={{ color: '#e8e8e8' }}>
                {PROVIDER_LABELS[activeProvider]} coming soon
              </p>
              <p className="text-[12px]" style={{ color: '#71717a' }}>
                Repository listing for {PROVIDER_LABELS[activeProvider]} is in
                development.
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: '#71717a' }} />
            </div>
          ) : error ? (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: '#ef444415', border: '1px solid #ef444430' }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#ef4444' }} />
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#ef4444' }}>
                  Failed to load repositories
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: '#71717a' }}>
                  {error}
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <p className="text-[14px]" style={{ color: '#71717a' }}>
                {availableRepos.length === 0
                  ? 'All your repositories are already connected.'
                  : 'No repositories match your search.'}
              </p>
            </div>
          ) : (
            filtered.map((repo) => {
              const isSelected = selected.has(repo.id);
              const canSelect = isSelected || !atLimit;
              const wouldExceed = !isSelected && selected.size >= slotsRemaining;

              return (
                <button
                  key={repo.id}
                  onClick={() => toggleRepo(repo.id)}
                  disabled={wouldExceed && !isSelected}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'border-white/20 bg-white/5'
                      : wouldExceed
                      ? 'opacity-40 cursor-not-allowed border-transparent'
                      : 'border-transparent hover:border-white/10 hover:bg-white/3'
                  }`}
                >
                  {/* Visibility badge */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      repo.private
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {repo.private ? <Lock size={14} /> : <Globe size={14} />}
                  </div>

                  {/* Repo info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[14px] font-medium truncate"
                      style={{ color: '#e8e8e8' }}
                    >
                      {repo.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px]" style={{ color: '#71717a' }}>
                        {repo.owner.login}
                      </span>
                      {repo.language && (
                        <>
                          <span style={{ color: '#3f3f46' }}>·</span>
                          <span className="text-[12px]" style={{ color: '#71717a' }}>
                            {repo.language}
                          </span>
                        </>
                      )}
                      {repo.private && (
                        <>
                          <span style={{ color: '#3f3f46' }}>·</span>
                          <span className="text-[12px]" style={{ color: '#71717a' }}>
                            Private
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-white border-white'
                        : 'border-[#3f3f46]'
                    }`}
                  >
                    {isSelected && <Check size={13} className="text-black" strokeWidth={3} />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between gap-4"
          style={{ borderColor: '#27272a' }}
        >
          {error && connecting === false ? (
            <p className="text-[12px]" style={{ color: '#ef4444' }}>
              {error}
            </p>
          ) : atLimit ? (
            <p className="text-[12px]" style={{ color: '#71717a' }}>
              Repo limit reached.{' '}
              <a href="/settings/billing" className="underline" style={{ color: '#f8423b' }}>
                Upgrade your plan
              </a>{' '}
              to add more.
            </p>
          ) : (
            <p className="text-[12px]" style={{ color: '#71717a' }}>
              {selected.size > 0
                ? `${selected.size} repo${selected.size > 1 ? 's' : ''} selected`
                : 'Select repositories to add'}
              {planLimit !== -1 && slotsRemaining < Infinity && (
                <span>
                  {' '}
                  · {slotsRemaining - selected.size} slot
                  {slotsRemaining - selected.size !== 1 ? 's' : ''} remaining
                </span>
              )}
            </p>
          )}

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: '#27272a', color: '#a1a1aa' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selected.size === 0 || connecting || atLimit}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#f8423b', color: '#fff' }}
            >
              {connecting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Add{selected.size > 0 ? ` ${selected.size}` : ''}{' '}
                  {selected.size === 1 ? 'Repository' : 'Repositories'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}
