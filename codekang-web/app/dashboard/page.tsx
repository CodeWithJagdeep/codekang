'use client';

import { useState } from 'react';
import Sidebar from '@/component/dashboard/sidebar';
import CenterPanel from '@/component/dashboard/centerPanel';
import RightPanel from '@/component/dashboard/rightpanel';

export default function DashboardPage() {
  const [selectedRepo, setSelectedRepo] = useState('codekang-platform');
  const [selectedPR, setSelectedPR] = useState<number | null>(null);

  return (
    <main
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <Sidebar selectedRepo={selectedRepo} onSelectRepo={setSelectedRepo} />
      <CenterPanel
        repoId={selectedRepo}
        onSelectPR={setSelectedPR}
        selectedPR={selectedPR}
      />
      <RightPanel selectedPR={selectedPR} />
    </main>
  );
}
