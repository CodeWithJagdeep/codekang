'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GitPullRequest,
  AlertCircle,
  Clock,
  Settings,
  Search,
  CheckCircle2,
  Clock3,
  ChevronDown,
} from 'lucide-react';

export default function RepositoryDetailsPage({
  params,
}: {
  params: { repoId: string };
}) {
  const [activeTab, setActiveTab] = useState<
    'prs' | 'issues' | 'activity' | 'settings'
  >('prs');
  const [expandedPR, setExpandedPR] = useState<string | null>(null);

  const togglePR = (id: string) =>
    setExpandedPR((prev) => (prev === id ? null : id));

  const tabs = [
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, count: 3 },
    { id: 'issues', label: 'Issues', icon: AlertCircle, count: 5 },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-hidden"
      style={{ background: '#1c1c1c' }}
    >
      {/* ── Header ── */}
      <div className="px-8 pt-6 pb-0 border-b border-[#2a2a2a] bg-[#121214]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Back to Repositories
        </Link>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
            <span className="text-[#a1a1aa] font-medium">CodeWithJagdeep</span>
            <span className="text-[#6d6d6d] font-light">/</span>
            <span className="text-[#e8e8e8]">{params.repoId}</span>
          </h1>
          <button className="px-4 py-1.5 rounded-md text-[13px] font-bold transition-colors bg-white/10 hover:bg-white/20 text-[#e8e8e8] border border-[#2a2a2e]">
            Review Configuration
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as 'prs' | 'issues' | 'activity' | 'settings',
                  )
                }
                className="flex items-center gap-2 pb-3 border-b-2 transition-colors"
                style={{
                  borderColor: isActive ? '#f97316' : 'transparent',
                  color: isActive ? '#e8e8e8' : '#a1a1aa',
                }}
              >
                <tab.icon
                  size={16}
                  className={isActive ? 'text-[#f97316]' : 'opacity-70'}
                />
                <span className="text-[14px] font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="flex items-center justify-center px-1.5 min-w-[20px] h-5 rounded-full text-[11px] font-bold bg-white/10 text-[#e8e8e8]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#121214]">
        {activeTab === 'prs' && (
          <div className="flex flex-col gap-4">
            {/* Search & Filters */}
            <div className="flex items-center justify-between mb-2">
              <div className="relative w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d6d6d]"
                />
                <input
                  type="text"
                  placeholder="Search pull requests..."
                  className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-md pl-9 pr-4 py-2 text-[13px] text-[#e8e8e8] placeholder-[#6d6d6d] focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#e8e8e8] bg-[#1c1c1c] border border-[#2a2a2a] rounded-md transition-colors hover:bg-white/5">
                  Status: All
                </button>
                <button className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#f97316] hover:bg-[#ea580c] rounded-md transition-colors">
                  Sync PRs
                </button>
              </div>
            </div>

            {/* ── PR Card 1: Open + KangBot Reviewing ── */}
            <div className="flex flex-col border border-white/5 rounded-xl bg-[#1c1c1c] overflow-hidden hover:border-[#393939] transition-all duration-200">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                      <GitPullRequest size={18} className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#e8e8e8] hover:text-[#f97316] cursor-pointer transition-colors leading-snug">
                        Update autonomous code review mappings
                      </h3>
                      <div className="text-[12px] text-[#6d6d6d] mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-green-400 font-semibold">
                          #142
                        </span>
                        <span>·</span>
                        <span>
                          opened 2 days ago by{' '}
                          <span className="text-[#a1a1aa] font-medium">
                            jsingh20
                          </span>
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                          feature/bot-mappings
                        </span>
                        <span>→</span>
                        <span className="font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                          main
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
                    Open
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-400 font-mono text-[11px]">
                      +187
                    </span>
                    <span className="text-red-400 font-mono text-[11px]">
                      -42
                    </span>
                  </div>
                  <span className="w-px h-3 bg-[#333]" />
                  <span className="text-[#6d6d6d]">6 files changed</span>
                  <span className="w-px h-3 bg-[#333]" />
                  <span className="text-[#6d6d6d]">4 commits</span>
                  <span className="w-px h-3 bg-[#333]" />
                  <span className="text-[#6d6d6d]">2 reviewers</span>
                </div>
              </div>

              {/* KangBot Review Section – Collapsible */}
              <div className="border-t border-white/5 bg-[#161618]">
                <button
                  onClick={() => togglePR('142')}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#f97316] flex items-center justify-center">
                      <span className="text-[10px] font-black text-white">
                        K
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-[#e8e8e8]">
                      KangBot
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/20 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />{' '}
                      Reviewing
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-[10px] font-bold text-red-400">
                        1 Critical
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f97316]/10 text-[10px] font-bold text-[#f97316]">
                        2 Suggestions
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6d6d6d]">
                      2 min ago
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-[#6d6d6d] transition-transform duration-200 ${expandedPR === '142' ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {expandedPR === '142' && (
                  <div className="px-5 py-4 border-t border-white/5">
                    <p className="text-[13px] text-[#a1a1aa] leading-relaxed mb-4">
                      This PR refactors the{' '}
                      <code className="text-[#e8e8e8] bg-white/5 px-1 py-0.5 rounded text-[12px]">
                        BotStrategy
                      </code>{' '}
                      mapping configuration to support secondary markdown
                      instruction parsing. The changes are well-structured but
                      introduce a potential performance concern.
                    </p>

                    <div className="flex flex-col gap-2.5 mb-4">
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                        <div className="w-5 h-5 rounded flex items-center justify-center bg-red-500/20 shrink-0 mt-0.5">
                          <AlertCircle size={12} className="text-red-400" />
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-red-400 mb-0.5">
                            Critical: Memory leak in test loop
                          </div>
                          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                            <code className="text-[#e8e8e8] bg-white/5 px-1 rounded text-[10px]">
                              bot-strategy.test.ts:47
                            </code>{' '}
                            — Unbounded loop creating new{' '}
                            <code className="text-[#e8e8e8] bg-white/5 px-1 rounded text-[10px]">
                              Promise
                            </code>{' '}
                            instances without cleanup.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#f97316]/5 border border-[#f97316]/15">
                        <div className="w-5 h-5 rounded flex items-center justify-center bg-[#f97316]/20 shrink-0 mt-0.5">
                          <AlertCircle size={12} className="text-[#f97316]" />
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-[#f97316] mb-0.5">
                            Suggestion: Add input validation
                          </div>
                          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                            <code className="text-[#e8e8e8] bg-white/5 px-1 rounded text-[10px]">
                              strategy-mapper.ts:112
                            </code>{' '}
                            —{' '}
                            <code className="text-[#e8e8e8] bg-white/5 px-1 rounded text-[10px]">
                              parseMarkdown()
                            </code>{' '}
                            accepts raw input without sanitization.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/repositories/${params.repoId}/review/142`}
                        className="text-[12px] font-semibold text-white bg-[#f97316] hover:bg-[#ea580c] px-4 py-2 rounded-md transition-colors"
                      >
                        View Full Review
                      </Link>
                      <button className="text-[12px] font-semibold text-[#a1a1aa] hover:text-[#e8e8e8] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md border border-white/5 transition-colors">
                        Re-Analyze
                      </button>
                      <button className="text-[12px] font-semibold text-[#a1a1aa] hover:text-[#e8e8e8] bg-transparent hover:bg-white/5 px-4 py-2 rounded-md transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── PR Card 2: Merged + KangBot Approved ── */}
            <div className="flex flex-col border border-white/5 rounded-xl bg-[#1c1c1c] overflow-hidden hover:border-[#393939] transition-all duration-200">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <GitPullRequest size={18} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#a1a1aa] cursor-pointer transition-colors leading-snug">
                        Fix sidebar UI alignment constraints
                      </h3>
                      <div className="text-[12px] text-[#6d6d6d] mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-purple-400 font-semibold">
                          #141
                        </span>
                        <span>·</span>
                        <span>
                          merged 4 days ago by{' '}
                          <span className="text-[#a1a1aa] font-medium">
                            jsingh20
                          </span>
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                          hotfix/sidebar-ui
                        </span>
                        <span>→</span>
                        <span className="font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                          main
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    <CheckCircle2 size={12} /> Merged
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-400 font-mono text-[11px]">
                      +24
                    </span>
                    <span className="text-red-400 font-mono text-[11px]">
                      -8
                    </span>
                  </div>
                  <span className="w-px h-3 bg-[#333]" />
                  <span className="text-[#6d6d6d]">2 files changed</span>
                  <span className="w-px h-3 bg-[#333]" />
                  <span className="text-[#6d6d6d]">1 commit</span>
                </div>
              </div>

              {/* KangBot Approved – Collapsible */}
              <div className="border-t border-white/5 bg-[#161618]">
                <button
                  onClick={() => togglePR('141')}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#f97316] flex items-center justify-center">
                      <span className="text-[10px] font-black text-white">
                        K
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-[#e8e8e8]">
                      KangBot
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                      <CheckCircle2 size={10} /> Approved
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 text-[10px] font-bold text-green-400">
                      0 Issues
                    </span>
                    <span className="text-[11px] text-[#6d6d6d]">
                      4 days ago
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-[#6d6d6d] transition-transform duration-200 ${expandedPR === '141' ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                {expandedPR === '141' && (
                  <div className="px-5 pb-3.5 border-t border-white/5 pt-3">
                    <p className="text-[13px] text-[#a1a1aa] mb-2">
                      AI review completed with 0 errors and 0 critical security
                      issues. Design structural review approved.
                    </p>
                    <Link
                      href={`/dashboard/repositories/${params.repoId}/review/141`}
                      className="text-[12px] font-semibold text-[#f97316] hover:underline"
                    >
                      View Full Review →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ── PR Card 3: Draft + KangBot Waiting ── */}
            <div className="flex flex-col border border-white/5 rounded-xl bg-[#1c1c1c] overflow-hidden hover:border-[#393939] transition-all duration-200 opacity-80">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <GitPullRequest size={18} className="text-[#6d6d6d]" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#a1a1aa] cursor-pointer transition-colors leading-snug">
                        [WIP] Implement webhook retry mechanism
                      </h3>
                      <div className="text-[12px] text-[#6d6d6d] mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#6d6d6d] font-semibold">
                          #140
                        </span>
                        <span>·</span>
                        <span>
                          draft · opened 5 days ago by{' '}
                          <span className="text-[#a1a1aa] font-medium">
                            jsingh20
                          </span>
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[#6d6d6d] bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                          feature/webhook-retry
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/5 text-[#6d6d6d] border border-white/10 shrink-0">
                    Draft
                  </span>
                </div>
              </div>

              {/* KangBot Waiting – Collapsible */}
              <div className="border-t border-white/5 bg-[#161618]">
                <button
                  onClick={() => togglePR('140')}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
                      <span className="text-[10px] font-black text-[#6d6d6d]">
                        K
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-[#6d6d6d]">
                      KangBot
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/5 text-[#6d6d6d] border border-white/10">
                      <Clock3 size={10} /> Waiting for Ready
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-[#6d6d6d] transition-transform duration-200 ${expandedPR === '140' ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedPR === '140' && (
                  <div className="px-5 pb-3.5 border-t border-white/5 pt-3 text-[13px] text-[#6d6d6d]">
                    KangBot will automatically begin reviewing once this PR is
                    marked as ready for review.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'prs' && (
          <div className="flex flex-col items-center justify-center h-64 text-center mt-12 border border-dashed border-[#2a2a2a] rounded-xl bg-[#1c1c1c]/50">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#6d6d6d] mb-4">
              {activeTab === 'issues' ? (
                <AlertCircle size={24} />
              ) : activeTab === 'activity' ? (
                <Clock size={24} />
              ) : (
                <Settings size={24} />
              )}
            </div>
            <h3 className="text-[16px] font-bold text-[#e8e8e8] mb-1 capitalize">
              {activeTab} Integration Pending
            </h3>
            <p className="text-[13px] text-[#a1a1aa] max-w-[300px]">
              This component is waiting to be bound to the CodeKang Gateway API.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
