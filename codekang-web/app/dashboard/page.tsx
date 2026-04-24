'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CenterPanel from '@/component/dashboard/centerPanel';
import AddRepoDialog from '@/component/dashboard/AddRepoDialog';
import {
  fetchConnectedRepos,
  disconnectRepo,
  type IRepository,
  type User,
} from '@/lib/auth';
import type { Repo } from '@/component/dashboard/sidebar';

function toDisplayRepo(r: IRepository): Repo {
  return {
    id: r.id,
    name: r.name,
    org: r.owner,
    prs: 0,
    issues: 0,
    status: 'idle',
    branch: r.defaultBranch,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [connected, setConnected] = useState<IRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }

    fetchConnectedRepos()
      .then(setConnected)
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
  }

  async function handleRemoveRepo(id: string) {
    await disconnectRepo(id);
    setConnected((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="flex h-full w-full">
      <CenterPanel
        activeNav="repos"
        repos={connected.map(toDisplayRepo)}
        user={user}
        loading={loading}
        onAddRepo={() => setDialogOpen(true)}
        onSelectRepo={handleSelectRepo}
        onRemoveRepo={handleRemoveRepo}
        onLinkAccount={() => router.push('/onboarding')}
      />

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
