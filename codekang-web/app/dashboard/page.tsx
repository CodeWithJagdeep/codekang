'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CenterPanel from '@/component/dashboard/centerPanel';
import AddRepoDialog from '@/component/dashboard/AddRepoDialog';
import {
  fetchConnectedRepos,
  fetchRepoPullRequests,
  fetchRepoIssues,
  disconnectRepo,
  type IRepository,
  type User,
} from '@/lib/auth';
import { useOrg } from '@/lib/org-context';
import type { Repo } from '@/component/dashboard/sidebar';

function toDisplayRepo(r: IRepository, counts: { prs: number; issues: number }): Repo {
  return {
    id: r.id,
    name: r.name,
    org: r.owner,
    prs: counts.prs,
    issues: counts.issues,
    status: 'idle',
    branch: r.defaultBranch,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { selectedOrgId, orgRepos, orgReposLoading } = useOrg();

  const [user, setUser] = useState<User | null>(null);
  const [connected, setConnected] = useState<IRepository[]>([]);
  // counts keyed by repo id
  const [counts, setCounts] = useState<Record<string, { prs: number; issues: number }>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }

    fetchConnectedRepos()
      .then(async (repos) => {
        setConnected(repos);
        const pairs = await Promise.all(
          repos.map(async (r) => {
            const [prs, issues] = await Promise.all([
              fetchRepoPullRequests(r.owner, r.name, 'open'),
              fetchRepoIssues(r.owner, r.name, 'open'),
            ]);
            return [r.id, { prs: prs.length, issues: issues.length }] as const;
          }),
        );
        setCounts(Object.fromEntries(pairs));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSelectRepo(id: string) {
    router.push(`/dashboard/repositories/${id}`);
  }

  function handleReposAdded(newRepos: IRepository[]) {
    setConnected((prev) => {
      const existing = new Set(prev.map((r) => r.id));
      return [...prev, ...newRepos.filter((r) => !existing.has(r.id))];
    });
    setDialogOpen(false);

    newRepos.forEach(async (r) => {
      const [prs, issues] = await Promise.all([
        fetchRepoPullRequests(r.owner, r.name, 'open'),
        fetchRepoIssues(r.owner, r.name, 'open'),
      ]);
      setCounts((prev) => ({ ...prev, [r.id]: { prs: prs.length, issues: issues.length } }));
    });
  }

  async function handleRemoveRepo(id: string) {
    await disconnectRepo(id);
    setConnected((prev) => prev.filter((r) => r.id !== id));
    setCounts((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  // All connected repos as display rows
  const allDisplayRepos = useMemo(
    () => connected.map((r) => toDisplayRepo(r, counts[r.id] ?? { prs: 0, issues: 0 })),
    [connected, counts],
  );

  // Org-filtered repos: when an org is selected, show only that org's repos
  const visibleRepos = useMemo(() => {
    if (!selectedOrgId) return allDisplayRepos;
    return orgRepos.map((r) => toDisplayRepo(r, counts[r.id] ?? { prs: 0, issues: 0 }));
  }, [selectedOrgId, allDisplayRepos, orgRepos, counts]);

  const isLoading = loading || (!!selectedOrgId && orgReposLoading);

  // Check if any repo is NOT installed
  const needsInstallation = connected.length > 0 && connected.every(r => !r.isInstalled);

  return (
    <div className="flex h-full w-full relative">
      <CenterPanel
        activeNav="repos"
        repos={visibleRepos}
        user={user}
        loading={isLoading}
        onAddRepo={() => setDialogOpen(true)}
        onSelectRepo={handleSelectRepo}
        onRemoveRepo={handleRemoveRepo}
        onLinkAccount={() => router.push('/onboarding')}
      />

      {needsInstallation && (
        <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-[500px] w-full bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl font-black italic">!</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Activation Required</h2>
            <p className="text-[15px] font-medium text-gray-500 mb-8 leading-relaxed">
              We've connected your repositories, but CodeKang cannot perform audits until the GitHub App is installed. This is a mandatory security step.
            </p>
            <div className="flex flex-col gap-4">
              <a
                href="https://github.com/apps/codekang/installations/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#f97316] text-white font-black uppercase tracking-widest text-[14px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(2,2,2,1)] transition-all"
              >
                Install GitHub App Now
              </a>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-black bg-white text-black font-black uppercase tracking-widest text-[12px] hover:bg-gray-50 transition-all"
              >
                Check Activation Status
              </button>
            </div>

            {/* Troubleshooting Guide */}
            <div className="mt-10 pt-8 border-t-2 border-dashed border-gray-200 text-left">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-black mb-4">Troubleshooting:</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-[12px] font-medium text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[8px] mt-0.5 shrink-0">1</span>
                  <span>Ensure you've selected <strong>"All repositories"</strong> or specific target repos during installation.</span>
                </li>
                <li className="flex items-start gap-3 text-[12px] font-medium text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[8px] mt-0.5 shrink-0">2</span>
                  <span>If repos are in an <strong>Organization</strong>, verify installation on the correct Org account.</span>
                </li>
                <li className="flex items-start gap-3 text-[12px] font-medium text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[8px] mt-0.5 shrink-0">3</span>
                  <span>Wait 5-10 seconds for GitHub's secure webhook to propagate to our servers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {dialogOpen && (
        <AddRepoDialog
          user={user}
          connectedRepos={connected}
          onClose={() => setDialogOpen(false)}
          onAdded={handleReposAdded}
        />
      )}
    </div>
  );
}
