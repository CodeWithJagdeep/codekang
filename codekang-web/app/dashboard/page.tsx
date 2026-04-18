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
  const [activeNav, setActiveNav] = useState('review'); // Default to 'review' to match image 625 active state

  function handleSelectRepo(id: string) {
    setSelectedRepo(id);
    setSelectedPR(null);
  }

  function handleNavChange(id: string) {
    setActiveNav(id);
    // If we are in 'review' or 'sessions', we might want to show the repositories list in the center
    // as requested by the user previously.
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
      style={{ background: '#121214' }}
    >
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        // Compatibility
        selectedRepo={selectedRepo}
        onSelectRepo={handleSelectRepo}
        repos={repos}
        onAddRepo={handleAddRepo}
      />
      <CenterPanel
        activeNav={activeNav === 'review' ? 'repos' : activeNav} // Map 'review' to 'repos' view for now
        repos={repos}
        onAddRepo={handleAddRepo}
        onSelectRepo={handleSelectRepo}
        selectedRepo={selectedRepo}
        onSelectPR={setSelectedPR}
        selectedPR={selectedPR}
      />
      {selectedRepo && <RightPanel selectedPR={selectedPR} />}
    </main>
  );
}
