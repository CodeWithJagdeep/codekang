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
  GitPullRequest,
  AlertCircle,
  FolderGit2,
  Link2,
} from 'lucide-react';

import type { Repo } from './sidebar';
import type { User } from '@/lib/auth';

export default function CenterPanel({
  activeNav,
  repos,
  user,
  loading = false,
  onAddRepo,
  onSelectRepo,
  onLinkAccount,
}: {
  activeNav: string;
  repos: Repo[];
  user?: User | null;
  loading?: boolean;
  onAddRepo: () => void;
  onSelectRepo: (id: string) => void;
  onLinkAccount?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;
  const currentPage = 1;

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const hasVcsLinked =
    user?.githubUsername || user?.gitlabUsername || user?.bitbucketUsername;

  if (activeNav === 'repos') {
    return (
      <section
        className="flex-1 flex flex-col h-dvh overflow-hidden"
        style={{ background: '#1c1c1c' }}
      >
        {/* ── Header / Breadcrumb ── */}
        <div className="px-4 md:px-8 pt-4 md:pt-6 pb-2">
          <div
            className="flex items-center gap-2 text-[12px] font-medium"
            style={{ color: '#a1a1aa' }}
          >
            <span>Repositories</span>
          </div>
        </div>

        {/* ── Title & Actions ── */}
        <div className="px-4 md:px-8 pb-4 md:pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1
              className="text-[24px] md:text-[28px] font-bold"
              style={{ color: '#e8e8e8' }}
            >
              Repositories
            </h1>
            {/* Connected provider chips */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {user?.githubUsername && (
                <ProviderChip
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  }
                  label={`@${user.githubUsername}`}
                />
              )}
              {user?.gitlabUsername && (
                <ProviderChip
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#FC6D26">
                      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" />
                    </svg>
                  }
                  label={`@${user.gitlabUsername}`}
                />
              )}
              {user?.bitbucketUsername && (
                <ProviderChip
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#0052CC">
                      <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.865 1.022.865h15.427a.768.768 0 0 0 .76-.647l3.27-20.025a.768.768 0 0 0-.768-.895zM14.52 15.53H9.522L8.17 8.466h7.561z" />
                    </svg>
                  }
                  label={`@${user.bitbucketUsername}`}
                />
              )}
              {!user?.githubUsername && !user?.gitlabUsername && !user?.bitbucketUsername && !loading && (
                <span className="text-[12px]" style={{ color: '#52525b' }}>
                  No accounts linked
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex-1 md:flex-none items-center justify-center flex gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors hover:bg-white/5"
              style={{ borderColor: '#27272a', color: '#e8e8e8' }}
            >
              <RefreshCcw size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Sync Repositories</span>
            </button>
            <button
              onClick={onAddRepo}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ background: '#f97316', color: '#fff' }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Add Repositories
            </button>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div className="flex-1 px-4 md:px-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg animate-pulse"
                style={{ background: '#27272a' }}
              />
            ))}
          </div>
        ) : !hasVcsLinked ? (
          /* ── No VCS linked ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#27272a' }}
            >
              <Link2 size={28} style={{ color: '#71717a' }} />
            </div>
            <div className="text-center">
              <h2
                className="text-[18px] font-semibold mb-2"
                style={{ color: '#e8e8e8' }}
              >
                No account linked
              </h2>
              <p
                className="text-[13px] max-w-[320px]"
                style={{ color: '#71717a' }}
              >
                Connect your GitHub, GitLab, or Bitbucket account to start
                monitoring repositories.
              </p>
            </div>
            <button
              onClick={onLinkAccount}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-90"
              style={{ background: '#f97316', color: '#fff' }}
            >
              Link Account
            </button>
          </div>
        ) : repos.length === 0 ? (
          /* ── Account linked but no repos connected ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#27272a' }}
            >
              <FolderGit2 size={28} style={{ color: '#71717a' }} />
            </div>
            <div className="text-center">
              <h2
                className="text-[18px] font-semibold mb-2"
                style={{ color: '#e8e8e8' }}
              >
                No repositories yet
              </h2>
              <p
                className="text-[13px] max-w-[320px]"
                style={{ color: '#71717a' }}
              >
                Add repositories to start getting AI-powered code reviews and
                insights.
              </p>
            </div>
            <button
              onClick={onAddRepo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-90"
              style={{ background: '#f97316', color: '#fff' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Repositories
            </button>
          </div>
        ) : (
          /* ── Repo table ── */
          <>
            {/* Search Bar */}
            <div className="px-4 md:px-8 pb-4">
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-md border w-full max-w-[400px]"
                style={{ background: '#121214', borderColor: '#27272a' }}
              >
                <Search size={16} style={{ color: '#71717a' }} strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search repositories"
                  className="bg-transparent outline-none flex-1 text-[13px] w-full"
                  style={{ color: '#e8e8e8' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 px-4 md:px-8 overflow-y-auto custom-scrollbar">
              <div className="border border-white/40 overflow-x-auto rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/10">
                      <th
                        className="px-4 py-3 text-[13px] font-semibold"
                        style={{ color: '#e8e8e8' }}
                      >
                        <div className="flex items-center gap-2">
                          Repository
                          <ArrowUpDown size={14} className="opacity-40" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-[13px] font-semibold text-[#e8e8e8] whitespace-nowrap text-right">
                        Pull Requests
                      </th>
                      <th className="px-4 py-3 text-[13px] font-semibold text-[#e8e8e8] whitespace-nowrap text-right">
                        Issues
                      </th>
                      <th className="px-4 py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/10">
                    {filteredRepos.length > 0 ? (
                      filteredRepos.map((repo) => (
                        <tr
                          key={repo.id}
                          className="group cursor-pointer hover:bg-white/2"
                          onClick={() => onSelectRepo(repo.id)}
                        >
                          <td className="px-4 py-4">
                            <span
                              className="text-[16px] font-medium"
                              style={{ color: '#e8e8e8' }}
                            >
                              {repo.name}
                            </span>
                          </td>
                          <td
                            className="px-4 py-4 text-right text-[13px]"
                            style={{ color: '#a1a1aa' }}
                          >
                            {repo.prs > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                                <GitPullRequest size={14} /> {repo.prs}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td
                            className="px-4 py-4 text-right text-[13px]"
                            style={{ color: '#a1a1aa' }}
                          >
                            {repo.issues > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f97316]/10 text-[#f97316]">
                                <AlertCircle size={14} /> {repo.issues}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <MoreVertical
                              size={16}
                              className="opacity-0 group-hover:opacity-40 transition-opacity ml-auto"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center"
                          style={{ color: '#71717a' }}
                        >
                          No repositories match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div
              className="px-4 md:px-8 py-4 flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-8 text-[12px]"
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
                <button className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed" disabled>
                  <ChevronsLeft size={16} />
                </button>
                <button className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed" disabled>
                  <ChevronLeft size={16} />
                </button>
                <button className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed" disabled>
                  <ChevronRight size={16} />
                </button>
                <button className="p-1 rounded opacity-40 hover:bg-white/5 disabled:cursor-not-allowed" disabled>
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    );
  }

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

function ProviderChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
      style={{ background: '#09090b', borderColor: '#27272a' }}
    >
      {icon}
      <span className="text-[12px] font-medium" style={{ color: '#a1a1aa' }}>
        {label}
      </span>
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#22c55e' }}
      />
    </div>
  );
}
