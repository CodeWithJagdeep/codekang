'use client';

import { useState } from 'react';
import Sidebar, { type Repo } from '@/component/dashboard/sidebar';
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
];

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repo[]>(INITIAL_REPOS);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [activeNav, setActiveNav] = useState('overview');

  function handleSelectRepo(id: string) {
    setSelectedRepo(id);
    setSelectedPR(null);
    // Switch away from overview when a repo is clicked
    if (activeNav === 'overview') setActiveNav('repos');
  }

  function handleNavChange(id: string) {
    setActiveNav(id);
    // Go back to overview when explicitly clicking Overview
    if (id === 'overview') setSelectedRepo(null);
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
    <main
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <Sidebar
        selectedRepo={selectedRepo}
        onSelectRepo={handleSelectRepo}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        repos={repos}
        onAddRepo={handleAddRepo}
      />
      <CenterPanel
        activeNav={activeNav}
        selectedRepo={selectedRepo}
        onSelectRepo={handleSelectRepo}
        onSelectPR={setSelectedPR}
        selectedPR={selectedPR}
        repos={repos}
        onAddRepo={handleAddRepo}
      />
      <RightPanel selectedPR={selectedPR} />
    </main>
  );
}
