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
  Paperclip,
  Settings2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface WorkSession {
  id: string;
  duration: string;
  added: number;
  removed: number;
  expanded: boolean;
  steps: string[];
}

interface PRCard {
  status: 'open' | 'merged' | 'draft';
  repo: string;
  number: number;
  title: string;
  branch: string;
  targetBranch: string;
  files: number;
  added: number;
  removed: number;
}

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

  const workSessions: WorkSession[] = [
    {
      id: 's1',
      duration: '4m 13s',
      added: 25,
      removed: 131,
      expanded: false,
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
      expanded: false,
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

  const prCards: PRCard[] = [
    {
      status: 'open',
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
      status: 'open',
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8f8f8]">
      {/* ── Top Bar / Breadcrumb ── */}
      <div className="px-6 py-3 border-b border-[#e5e5e5] bg-white flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px]">
          <Link
            href={`/dashboard/repositories/${params.repoId}`}
            className="flex items-center gap-1 text-[#666] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="font-medium">{params.repoId}</span>
          </Link>
          <ChevronRight size={12} className="text-[#ccc]" />
          <span className="font-semibold text-[#111]">
            Update autonomous code review mappings
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#999] font-medium">
            PR #{params.prId}
          </span>
        </div>
      </div>

      {/* ── Main Chat/Conversation Area ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[720px] mx-auto py-8 px-4">
          {/* User Prompt */}
          <div className="flex items-start gap-3 mb-6">
            <div className="flex-1 bg-white rounded-2xl px-5 py-4 border border-[#e8e8e8] shadow-sm">
              <p className="text-[14px] text-[#333] leading-relaxed">
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
            <div className="text-[14px] text-[#333] leading-relaxed">
              I&apos;ll review PR #{params.prId} — fix the memory leak in
              bot-strategy tests, add input validation to strategy-mapper, and
              run the full test suite. Starting now.
            </div>

            {/* Work Session 1 */}
            <button
              onClick={() => toggleSession('s1')}
              className="flex items-center gap-2 text-[13px] text-[#888] hover:text-[#555] transition-colors py-1 w-fit"
            >
              {expandedSessions.has('s1') ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <Clock size={13} />
              <span>Worked for {workSessions[0].duration}</span>
              <span className="text-green-600 font-mono text-[12px] font-medium ml-1">
                +{workSessions[0].added}
              </span>
              <span className="text-red-500 font-mono text-[12px] font-medium">
                -{workSessions[0].removed}
              </span>
            </button>

            {expandedSessions.has('s1') && (
              <div className="ml-5 border-l-2 border-[#e5e5e5] pl-4 flex flex-col gap-2">
                {workSessions[0].steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[13px] text-[#666]"
                  >
                    <CheckCircle2
                      size={13}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* PR Card 1 */}
            <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-50 text-green-600 border border-green-200">
                      <GitPullRequest size={11} /> Open
                    </span>
                    <span className="text-[12px] text-[#999]">
                      {prCards[0].repo} #{prCards[0].number}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-md hover:bg-[#f5f5f5] text-[#999] hover:text-[#555] transition-colors">
                      <GitPullRequest size={14} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-[#f5f5f5] text-[#999] hover:text-[#555] transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold text-[#111] mb-2">
                  {prCards[0].title}
                </h3>
                <div className="flex items-center gap-2 text-[12px] text-[#888]">
                  <div className="flex items-center gap-1">
                    <GitBranch size={12} />
                    <span className="font-mono text-[11px]">
                      {prCards[0].branch}
                    </span>
                  </div>
                  <span className="text-[#ccc]">→</span>
                  <span className="font-mono text-[11px]">
                    {prCards[0].targetBranch}
                  </span>
                  <span className="text-[#ccc]">·</span>
                  <span>{prCards[0].files} files</span>
                  <span className="text-green-600 font-mono font-medium">
                    +{prCards[0].added}
                  </span>
                  <span className="text-red-500 font-mono font-medium">
                    -{prCards[0].removed}
                  </span>
                </div>
              </div>
            </div>

            {/* PR Card 2 */}
            <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-50 text-green-600 border border-green-200">
                      <GitPullRequest size={11} /> Open
                    </span>
                    <span className="text-[12px] text-[#999]">
                      {prCards[1].repo} #{prCards[1].number}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-md hover:bg-[#f5f5f5] text-[#999] hover:text-[#555] transition-colors">
                      <GitPullRequest size={14} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-[#f5f5f5] text-[#999] hover:text-[#555] transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold text-[#111] mb-2">
                  {prCards[1].title}
                </h3>
                <div className="flex items-center gap-2 text-[12px] text-[#888]">
                  <div className="flex items-center gap-1">
                    <GitBranch size={12} />
                    <span className="font-mono text-[11px]">
                      {prCards[1].branch}
                    </span>
                  </div>
                  <span className="text-[#ccc]">→</span>
                  <span className="font-mono text-[11px]">
                    {prCards[1].targetBranch}
                  </span>
                  <span className="text-[#ccc]">·</span>
                  <span>{prCards[1].files} files</span>
                  <span className="text-green-600 font-mono font-medium">
                    +{prCards[1].added}
                  </span>
                  <span className="text-red-500 font-mono font-medium">
                    -{prCards[1].removed}
                  </span>
                </div>
              </div>
            </div>

            {/* Work Session 2 */}
            <button
              onClick={() => toggleSession('s2')}
              className="flex items-center gap-2 text-[13px] text-[#888] hover:text-[#555] transition-colors py-1 w-fit"
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
              <div className="ml-5 border-l-2 border-[#e5e5e5] pl-4 flex flex-col gap-2">
                {workSessions[1].steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[13px] text-[#666]"
                  >
                    <CheckCircle2
                      size={13}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Completion Summary */}
            <div className="text-[14px] text-[#333] leading-relaxed mt-1">
              Done! Memory leak in{' '}
              <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-[#111]">
                bot-strategy.test.ts
              </code>{' '}
              has been fixed and input validation added to{' '}
              <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-[#111]">
                strategy-mapper.ts
              </code>
              . All 47 tests passing across both changes. Full report attached.
            </div>

            {/* Attached Report */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#e5e5e5] rounded-lg hover:bg-[#fafafa] cursor-pointer transition-colors w-fit shadow-sm">
              <FileText size={16} className="text-[#888]" />
              <span className="text-[13px] font-medium text-[#333]">
                review_report.md
              </span>
            </div>

            {/* Review Findings Summary */}
            <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-sm">
              <div className="text-[12px] font-bold text-[#999] uppercase tracking-wider mb-3">
                Review Findings
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-red-50">
                    <AlertCircle size={12} className="text-red-500" />
                  </div>
                  <span className="text-[13px] text-[#333]">
                    <span className="font-semibold text-red-600">
                      1 Critical
                    </span>{' '}
                    — Memory leak fixed in test loop
                  </span>
                  <CheckCircle2 size={13} className="text-green-500 ml-auto" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-orange-50">
                    <AlertCircle size={12} className="text-orange-500" />
                  </div>
                  <span className="text-[13px] text-[#333]">
                    <span className="font-semibold text-orange-600">
                      1 Warning
                    </span>{' '}
                    — Input validation added
                  </span>
                  <CheckCircle2 size={13} className="text-green-500 ml-auto" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-50">
                    <AlertCircle size={12} className="text-blue-500" />
                  </div>
                  <span className="text-[13px] text-[#333]">
                    <span className="font-semibold text-blue-600">
                      1 Suggestion
                    </span>{' '}
                    — Migrated Object → Map
                  </span>
                  <CheckCircle2 size={13} className="text-green-500 ml-auto" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-green-50">
                    <CheckCircle2 size={12} className="text-green-500" />
                  </div>
                  <span className="text-[13px] text-[#333]">
                    <span className="font-semibold text-green-600">
                      2 Approved
                    </span>{' '}
                    — Clean code patterns confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-[13px] text-[#888] mt-2">
              <Settings2 size={14} className="text-[#f97316]" />
              <span className="font-medium">
                KangBot is ready for instructions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chat Input ── */}
      <div className="border-t border-[#e5e5e5] bg-white px-6 py-4">
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-end gap-3 bg-[#f8f8f8] border border-[#e0e0e0] rounded-2xl px-4 py-3 focus-within:border-[#f97316] focus-within:shadow-sm transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask KangBot to build features, fix bugs, or work on your code"
              className="flex-1 bg-transparent text-[14px] text-[#333] placeholder-[#aaa] resize-none focus:outline-none min-h-[24px] max-h-[120px] leading-relaxed"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
            />
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1.5 rounded-lg hover:bg-white text-[#bbb] hover:text-[#888] transition-colors">
                <Plus size={18} />
              </button>
              <button
                className={`p-2 rounded-xl transition-all ${
                  inputText.trim()
                    ? 'bg-[#f97316] text-white shadow-sm hover:bg-[#ea580c]'
                    : 'bg-[#e8e8e8] text-[#bbb] cursor-not-allowed'
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
