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
} from 'lucide-react';

export default function RepositoryDetailsPage({
  params,
}: {
  params: { repoId: string };
}) {
  const [activeTab, setActiveTab] = useState<
    'prs' | 'issues' | 'activity' | 'settings'
  >('prs');

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
          <h1 className="text-2xl font-bold text-[#e8e8e8]">{params.repoId}</h1>
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
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#fff] bg-[#f97316] hover:bg-[#ea580c] rounded-md transition-colors">
                  Sync PRs
                </button>
              </div>
            </div>

            {/* Simulated PR Card 1 */}
            <div className="flex flex-col border border-white/5 rounded-lg bg-[#1c1c1c] overflow-hidden group hover:border-[#333] transition-colors">
              <div className="flex items-start justify-between p-4 border-b border-white/5">
                <div className="flex gap-3">
                  <GitPullRequest size={18} className="text-[#00cc66] mt-0.5" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#e8e8e8] hover:text-[#f97316] cursor-pointer inline-flex">
                      Update autonomous code review mappings
                    </h3>
                    <div className="text-[13px] text-[#a1a1aa] mt-1 flex items-center gap-2">
                      <span className="text-[#00cc66]">#142</span> opened 2 days
                      ago by{' '}
                      <span className="font-medium text-[#e8e8e8]">
                        jsingh20
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#444]" />
                      <span className="font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[11px]">
                        feature/bot-mappings
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Clock3 size={12} /> Pending Review
                  </span>
                </div>
              </div>
              <div className="p-4 bg-[#121214]/50 border-t border-white/5">
                <h4 className="text-[12px] font-bold text-[#6d6d6d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="text-[#f97316] text-[16px] leading-none">
                    ✨
                  </span>{' '}
                  AI Summary
                </h4>
                <p className="text-[13.5px] text-[#a1a1aa] leading-relaxed">
                  This pull request introduces critical updates to the
                  `BotStrategy` mapping configuration, extending its ability to
                  interpret secondary markdown instructions efficiently. <br />
                  <br />
                  <span className="text-[#e8e8e8]">Risk Analysis:</span> Minimal
                  changes detected in the core module bindings. Potential
                  performance regression in `.test.ts` loop block, recommending
                  specific linting constraints to address memory leakage.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="text-[12px] font-semibold text-[#f97316] bg-white/5 hover:bg-white/10 px-3 py-1.5 border border-white/5 rounded transition-colors">
                    View Full Review
                  </button>
                  <button className="text-[12px] font-semibold text-[#a1a1aa] bg-transparent hover:bg-white/5 px-3 py-1.5 border border-transparent hover:border-white/5 rounded transition-colors">
                    Re-Analyze Code
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated PR Card 2 */}
            <div className="flex flex-col border border-white/5 rounded-lg bg-[#1c1c1c] overflow-hidden group hover:border-[#333] transition-colors">
              <div className="flex items-start justify-between p-4 border-b border-white/5">
                <div className="flex gap-3">
                  <GitPullRequest size={18} className="text-[#a1a1aa] mt-0.5" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#e8e8e8] hover:text-[#f97316] cursor-pointer inline-flex line-through opacity-80">
                      Fix sidebar UI alignment constraints
                    </h3>
                    <div className="text-[13px] text-[#a1a1aa] mt-1 flex items-center gap-2">
                      <span className="text-[#a1a1aa]">#141</span> merged 4 days
                      ago by{' '}
                      <span className="font-medium text-[#e8e8e8]">
                        jsingh20
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#444]" />
                      <span className="font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[11px]">
                        hotfix/sidebar-ui
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <CheckCircle2 size={12} /> Merged & Approved
                  </span>
                </div>
              </div>
              <div className="p-4 bg-[#121214]/50 border-t border-white/5">
                <p className="text-[13px] text-[#a1a1aa] italic">
                  AI review completed with 0 errors and 0 critical security
                  issues. Design structural review approved.
                </p>
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
