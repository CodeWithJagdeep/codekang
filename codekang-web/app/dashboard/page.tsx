'use client';

import { useState } from 'react';
import { type Repo } from '@/component/dashboard/sidebar';
import CenterPanel from '@/component/dashboard/centerPanel';
import RightPanel from '@/component/dashboard/rightpanel';

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
  const [repos, setRepos] = useState<Repo[]>(INITIAL_REPOS);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedPR, setSelectedPR] = useState<number | null>(null);

  function handleSelectRepo(id: string) {
    setSelectedRepo(id);
    setSelectedPR(null);
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
        selectedRepo={selectedRepo}
        onSelectPR={setSelectedPR}
        selectedPR={selectedPR}
      />
      {selectedRepo && <RightPanel selectedPR={selectedPR} />}
    </div>
  );
}
