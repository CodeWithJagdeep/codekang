'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GitPullRequest,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  GitBranch,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings2,
} from 'lucide-react';

export default function FullReviewPage({
  params,
}: {
  params: { repoId: string; prId: string };
}) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );
  const [inputText, setInputText] = useState('');

  const toggleSession = (id: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const workSessions = [
    {
      id: 's1',
      duration: '4m 13s',
      added: 25,
      removed: 131,
      steps: [
        'Cloning repository CodeWithJagdeep/codekang-platform...',
        'Analyzing bot-strategy.test.ts for memory leak patterns...',
        'Identified unbounded Promise loop at line 47',
        'Refactoring loop to use controlled iteration with cleanup',
        'Adding afterEach teardown blocks to all test suites',
        'Running test suite to verify fixes...',
      ],
    },
    {
      id: 's2',
      duration: '5m 33s',
      added: 4,
      removed: 8,
      steps: [
        'Scanning strategy-mapper.ts for input validation gaps...',
        'Adding sanitizeInput() validation layer to parseMarkdown()',
        'Creating ValidationError class for structured error handling',
        'Migrating strategy lookup from Object to Map for O(1) access',
        'Running full integration test suite...',
        'All 47 tests passing. No regressions detected.',
      ],
    },
  ];

  const prCards = [
    {
      status: 'open' as const,
      repo: 'CodeWithJagdeep/codekang-platform',
      number: Number(params.prId),
      title: 'Update autonomous code review mappings',
      branch: 'kangbot/fix-review-mappings',
      targetBranch: 'main',
      files: 6,
      added: 21,
      removed: 123,
    },
    {
      status: 'open' as const,
      repo: 'CodeWithJagdeep/codekang-platform',
      number: Number(params.prId) + 1,
      title: 'Add input validation to strategy mapper',
      branch: 'kangbot/add-validation',
      targetBranch: 'main',
      files: 2,
      added: 4,
      removed: 8,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#121214]">
      {/* ── Top Bar / Breadcrumb ── */}
      <div className="px-6 py-3 border-b border-[#2a2a2a] bg-[#1c1c1c] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px]">
          <Link
            href={`/dashboard/repositories/${params.repoId}`}
            className="flex items-center gap-1 text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="font-medium">{params.repoId}</span>
          </Link>
          <ChevronRight size={12} className="text-[#444]" />
          <span className="font-semibold text-[#e8e8e8]">
            Update autonomous code review mappings
          </span>
        </div>
        <span className="text-[12px] text-[#6d6d6d] font-medium">
          PR #{params.prId}
        </span>
      </div>

      {/* ── Main Chat/Conversation Area ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[720px] mx-auto py-8 px-4">
          {/* User Prompt */}
          <div className="flex items-start gap-3 mb-6">
            <div className="flex-1 bg-[#1c1c1c] rounded-2xl px-5 py-4 border border-[#2a2a2a]">
              <p className="text-[14px] text-[#e8e8e8] leading-relaxed">
                Review PR #{params.prId}: Fix memory leak in bot-strategy tests,
                add input validation to strategy-mapper, then run full test
                suite
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center shrink-0 text-white text-[12px] font-bold shadow-md">
              J
            </div>
          </div>

          {/* KangBot Response */}
          <div className="flex flex-col gap-5 ml-0">
            {/* Bot message */}
            <div className="text-[14px] text-[#a1a1aa] leading-relaxed">
              I&apos;ll review PR #{params.prId} — fix the memory leak in
              bot-strategy tests, add input validation to strategy-mapper, and
              run the full test suite. Starting now.
            </div>

            {/* Work Session 1 */}
            <button
              onClick={() => toggleSession('s1')}
              className="flex items-center gap-2 text-[13px] text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors py-1 w-fit"
            >
              {expandedSessions.has('s1') ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <Clock size={13} />
              <span>Worked for {workSessions[0].duration}</span>
              <span className="text-green-400 font-mono text-[12px] font-medium ml-1">
                +{workSessions[0].added}
              </span>
              <span className="text-red-400 font-mono text-[12px] font-medium">
                -{workSessions[0].removed}
              </span>
            </button>

            {expandedSessions.has('s1') && (
              <div className="ml-5 border-l-2 border-[#2a2a2a] pl-4 flex flex-col gap-2">
                {workSessions[0].steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[13px] text-[#a1a1aa]"
                  >
                    <CheckCircle2
                      size={13}
                      className="text-green-400 mt-0.5 shrink-0"
                    />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* PR Card 1 */}
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#393939] transition-all">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      <GitPullRequest size={11} /> Open
                    </span>
                    <span className="text-[12px] text-[#6d6d6d]">
                      {prCards[0].repo} #{prCards[0].number}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-md hover:bg-white/5 text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors">
                      <GitPullRequest size={14} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-white/5 text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold text-[#e8e8e8] mb-2">
                  {prCards[0].title}
                </h3>
                <div className="flex items-center gap-2 text-[12px] text-[#6d6d6d]">
                  <div className="flex items-center gap-1">
                    <GitBranch size={12} />
                    <span className="font-mono text-[11px] text-[#a1a1aa]">
                      {prCards[0].branch}
                    </span>
                  </div>
                  <span className="text-[#444]">→</span>
                  <span className="font-mono text-[11px] text-[#a1a1aa]">
                    {prCards[0].targetBranch}
                  </span>
                  <span className="text-[#444]">·</span>
                  <span>{prCards[0].files} files</span>
                  <span className="text-green-400 font-mono font-medium">
                    +{prCards[0].added}
                  </span>
                  <span className="text-red-400 font-mono font-medium">
                    -{prCards[0].removed}
                  </span>
                </div>
              </div>
            </div>

            {/* PR Card 2 */}
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#393939] transition-all">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      <GitPullRequest size={11} /> Open
                    </span>
                    <span className="text-[12px] text-[#6d6d6d]">
                      {prCards[1].repo} #{prCards[1].number}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-md hover:bg-white/5 text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors">
                      <GitPullRequest size={14} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-white/5 text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold text-[#e8e8e8] mb-2">
                  {prCards[1].title}
                </h3>
                <div className="flex items-center gap-2 text-[12px] text-[#6d6d6d]">
                  <div className="flex items-center gap-1">
                    <GitBranch size={12} />
                    <span className="font-mono text-[11px] text-[#a1a1aa]">
                      {prCards[1].branch}
                    </span>
                  </div>
                  <span className="text-[#444]">→</span>
                  <span className="font-mono text-[11px] text-[#a1a1aa]">
                    {prCards[1].targetBranch}
                  </span>
                  <span className="text-[#444]">·</span>
                  <span>{prCards[1].files} files</span>
                  <span className="text-green-400 font-mono font-medium">
                    +{prCards[1].added}
                  </span>
                  <span className="text-red-400 font-mono font-medium">
                    -{prCards[1].removed}
                  </span>
                </div>
              </div>
            </div>

            {/* Work Session 2 */}
            <button
              onClick={() => toggleSession('s2')}
              className="flex items-center gap-2 text-[13px] text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors py-1 w-fit"
            >
              {expandedSessions.has('s2') ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <Clock size={13} />
              <span>Worked for {workSessions[1].duration}</span>
            </button>

            {expandedSessions.has('s2') && (
              <div className="ml-5 border-l-2 border-[#2a2a2a] pl-4 flex flex-col gap-2">
                {workSessions[1].steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[13px] text-[#a1a1aa]"
                  >
                    <CheckCircle2
                      size={13}
                      className="text-green-400 mt-0.5 shrink-0"
                    />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Completion Summary */}
            <div className="text-[14px] text-[#a1a1aa] leading-relaxed mt-1">
              Done! Memory leak in{' '}
              <code className="bg-white/5 px-1.5 py-0.5 rounded text-[13px] text-[#e8e8e8]">
                bot-strategy.test.ts
              </code>{' '}
              has been fixed and input validation added to{' '}
              <code className="bg-white/5 px-1.5 py-0.5 rounded text-[13px] text-[#e8e8e8]">
                strategy-mapper.ts
              </code>
              . All 47 tests passing across both changes. Full report attached.
            </div>

            {/* Attached Report */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg hover:bg-white/5 cursor-pointer transition-colors w-fit">
              <FileText size={16} className="text-[#6d6d6d]" />
              <span className="text-[13px] font-medium text-[#e8e8e8]">
                review_report.md
              </span>
            </div>

            {/* Review Findings Summary */}
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-4">
              <div className="text-[12px] font-bold text-[#6d6d6d] uppercase tracking-wider mb-3">
                Review Findings
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-red-500/10">
                    <AlertCircle size={12} className="text-red-400" />
                  </div>
                  <span className="text-[13px] text-[#a1a1aa]">
                    <span className="font-semibold text-red-400">
                      1 Critical
                    </span>{' '}
                    — Memory leak fixed in test loop
                  </span>
                  <CheckCircle2 size={13} className="text-green-400 ml-auto" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-[#f97316]/10">
                    <AlertCircle size={12} className="text-[#f97316]" />
                  </div>
                  <span className="text-[13px] text-[#a1a1aa]">
                    <span className="font-semibold text-[#f97316]">
                      1 Warning
                    </span>{' '}
                    — Input validation added
                  </span>
                  <CheckCircle2 size={13} className="text-green-400 ml-auto" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-500/10">
                    <AlertCircle size={12} className="text-blue-400" />
                  </div>
                  <span className="text-[13px] text-[#a1a1aa]">
                    <span className="font-semibold text-blue-400">
                      1 Suggestion
                    </span>{' '}
                    — Migrated Object → Map
                  </span>
                  <CheckCircle2 size={13} className="text-green-400 ml-auto" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-green-500/10">
                    <CheckCircle2 size={12} className="text-green-400" />
                  </div>
                  <span className="text-[13px] text-[#a1a1aa]">
                    <span className="font-semibold text-green-400">
                      2 Approved
                    </span>{' '}
                    — Clean code patterns confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-[13px] text-[#6d6d6d] mt-2">
              <Settings2 size={14} className="text-[#f97316]" />
              <span className="font-medium">
                KangBot is ready for instructions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chat Input ── */}
      <div className="border-t border-[#2a2a2a] bg-[#1c1c1c] px-6 py-4">
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-end gap-3 bg-[#121214] border border-[#2a2a2a] rounded-2xl px-4 py-3 focus-within:border-[#f97316]/50 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask KangBot to build features, fix bugs, or work on your code"
              className="flex-1 bg-transparent text-[14px] text-[#e8e8e8] placeholder-[#6d6d6d] resize-none focus:outline-none min-h-[24px] max-h-[120px] leading-relaxed"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
            />
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors">
                <Plus size={18} />
              </button>
              <button
                className={`p-2 rounded-xl transition-all ${
                  inputText.trim()
                    ? 'bg-[#f97316] text-white shadow-sm hover:bg-[#ea580c]'
                    : 'bg-[#2a2a2a] text-[#6d6d6d] cursor-not-allowed'
                }`}
                disabled={!inputText.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
