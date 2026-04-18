'use client';

import { useState } from 'react';
import {
  Search,
  RefreshCcw,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  MoreVertical,
  ChevronDown,
} from 'lucide-react';
import type { Repo } from './sidebar';

export default function CenterPanel({
  activeNav,
  repos,
  onAddRepo,
  onSelectRepo,
}: {
  activeNav: string;
  repos: Repo[];
  onAddRepo: () => void;
  onSelectRepo: (id: string) => void;
  // Keep props for compatibility
  selectedRepo?: string | null;
  onSelectPR?: (id: number) => void;
  selectedPR?: number | null;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;
  const currentPage = 1;

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (activeNav === 'repos') {
    return (
      <section
        className="flex-1 flex flex-col h-screen overflow-hidden"
        style={{ background: '#1c1c1c' }}
      >
        {/* ── Header / Breadcrumb ── */}
        <div className="px-8 pt-6 pb-2">
          <div
            className="flex items-center gap-2 text-[12px] font-medium"
            style={{ color: '#a1a1aa' }}
          >
            <span>Repositories</span>
          </div>
        </div>

        {/* ── Title & Actions ── */}
        <div className="px-8 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: '#e8e8e8' }}>
              Repositories
            </h1>
            <p className="text-[13px] mt-1" style={{ color: '#a1a1aa' }}>
              List of repositories accessible to CodeKang.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors hover:bg-white/5"
              style={{ borderColor: '#27272a', color: '#e8e8e8' }}
            >
              <RefreshCcw size={16} strokeWidth={2} />
              Sync Repositories
            </button>
            <button
              onClick={onAddRepo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-90"
              style={{ background: '#f97316', color: '#fff' }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Add Repositories
            </button>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="px-8 pb-4">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-md border max-w-[400px]"
            style={{ background: '#121214', borderColor: '#27272a' }}
          >
            <Search size={16} style={{ color: '#71717a' }} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search repositories"
              className="bg-transparent outline-none flex-1 text-[13px]"
              style={{ color: '#e8e8e8' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── Repository Table ── */}
        <div className="flex-1 px-8 overflow-y-auto custom-scrollbar">
          <div
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: '#1f1f23' }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: '#1c1c1f' }}>
                  <th
                    className="px-4 py-3 text-[12px] font-semibold flex items-center gap-2"
                    style={{ color: '#e8e8e8' }}
                  >
                    Repository
                    <ArrowUpDown size={14} className="opacity-40" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#1f1f23' }}>
                {filteredRepos.length > 0 ? (
                  filteredRepos.map((repo) => (
                    <tr
                      key={repo.id}
                      className="group cursor-pointer hover:bg-white/2"
                      onClick={() => onSelectRepo(repo.id)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: '#e8e8e8' }}
                          >
                            {repo.name}
                          </span>
                          <MoreVertical
                            size={16}
                            className="opacity-0 group-hover:opacity-40 transition-opacity"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center"
                      style={{ color: '#71717a' }}
                    >
                      No repositories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        <div
          className="px-8 py-4 flex items-center justify-end gap-8 text-[12px]"
          style={{ color: '#a1a1aa' }}
        >
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded border"
              style={{ borderColor: '#27272a', background: '#18181b' }}
            >
              <span>{rowsPerPage}</span>
              <ChevronDown size={14} />
            </div>
          </div>
          <div>Page {currentPage} of 1</div>
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Fallback for other nav items (keep simple for now)
  return (
    <section
      className="flex-1 flex flex-col items-center justify-center h-screen"
      style={{ background: '#121214' }}
    >
      <div className="text-center px-6">
        <h2 className="text-[20px] font-bold mb-2" style={{ color: '#e8e8e8' }}>
          {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
        </h2>
        <p className="text-[14px]" style={{ color: '#a1a1aa' }}>
          This section is currently under development.
        </p>
      </div>
    </section>
  );
}
