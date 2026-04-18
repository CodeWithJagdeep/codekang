'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Repo } from '@/component/dashboard/sidebar';
import CenterPanel from '@/component/dashboard/centerPanel';

const INITIAL_REPOS: Repo[] = [
  {
    id: 'codekang-platform',
    name: 'codekang-platform',
    org: 'CodeWithJagdeep',
    prs: 3,
    issues: 8,
    status: 'active',
    branch: 'main',
  },
  {
    id: 'codekang-web',
    name: 'codekang-web',
    org: 'CodeWithJagdeep',
    prs: 1,
    issues: 2,
    status: 'active',
    branch: 'main',
  },
  {
    id: 'automous-ai',
    name: 'automous-ai',
    org: 'CodeWithJagdeep',
    prs: 5,
    issues: 4,
    status: 'busy',
    branch: 'main',
  },
  {
    id: 'mentorsland_core',
    name: 'mentorsland_core',
    org: 'CodeWithJagdeep',
    prs: 2,
    issues: 5,
    status: 'idle',
    branch: 'main',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>(INITIAL_REPOS);

  function handleSelectRepo(id: string) {
    router.push(`/dashboard/repositories/${id}`);
  }

  function handleAddRepo() {
    const name = prompt('Enter GitHub repo name (e.g. my-new-repo):');
    if (!name) return;
    const newRepo: Repo = {
      id: name,
      name,
      org: 'CodeWithJagdeep',
      prs: 0,
      issues: 0,
      status: 'idle',
      branch: 'main',
    };
    setRepos((prev) => [...prev, newRepo]);
  }

  return (
    <div className="flex h-full w-full">
      <CenterPanel
        activeNav="repos"
        repos={repos}
        onAddRepo={handleAddRepo}
        onSelectRepo={handleSelectRepo}
      />
    </div>
  );
}
