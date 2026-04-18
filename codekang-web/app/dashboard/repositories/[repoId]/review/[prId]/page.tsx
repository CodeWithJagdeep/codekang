'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  GitPullRequest,
  AlertCircle,
  CheckCircle2,
  FileText,
  MessageSquare,
  Shield,
  Eye,
  Code2,
} from 'lucide-react';

const REVIEW_COMMENTS = [
  {
    file: 'bot-strategy.test.ts',
    line: 47,
    severity: 'critical' as const,
    title: 'Memory leak in test loop',
    body: 'Unbounded loop detected creating new `Promise` instances without cleanup. Each iteration allocates ~2.4KB that is never freed. Over 1000 iterations this will consume ~2.4MB of heap memory. Recommend adding `afterEach` teardown with `jest.clearAllTimers()` and explicit promise resolution.',
    suggestion: `afterEach(() => {\n  jest.clearAllTimers();\n  jest.restoreAllMocks();\n});`,
  },
  {
    file: 'strategy-mapper.ts',
    line: 112,
    severity: 'warning' as const,
    title: 'Missing input validation',
    body: 'The `parseMarkdown()` function accepts raw input without sanitization. This could allow injection of malicious markdown directives that bypass the instruction parser. Consider adding a validation layer.',
    suggestion: `function parseMarkdown(input: string): ParsedResult {\n  const sanitized = sanitizeInput(input);\n  if (!isValidMarkdown(sanitized)) {\n    throw new ValidationError('Invalid markdown input');\n  }\n  return parse(sanitized);\n}`,
  },
  {
    file: 'strategy-mapper.ts',
    line: 89,
    severity: 'suggestion' as const,
    title: 'Consider using Map instead of Object',
    body: 'The strategy lookup table uses a plain object which has O(n) worst-case lookup time. A `Map` would provide guaranteed O(1) lookups and better memory characteristics for large strategy sets.',
    suggestion: `const strategyMap = new Map<string, Strategy>();\nstrategies.forEach(s => strategyMap.set(s.id, s));`,
  },
  {
    file: 'config/bot-config.ts',
    line: 23,
    severity: 'info' as const,
    title: 'Good use of environment variable fallbacks',
    body: 'The configuration correctly uses `process.env.BOT_STRATEGY_TIMEOUT ?? 30000` with a sensible default. This follows the principle of safe defaults and will prevent runtime crashes in development environments.',
  },
  {
    file: 'index.ts',
    line: 5,
    severity: 'info' as const,
    title: 'Clean module exports',
    body: 'The barrel export pattern is well-structured. All public APIs are explicitly exported which helps with tree-shaking and prevents accidental exposure of internal modules.',
  },
];

const FILES_CHANGED = [
  {
    name: 'bot-strategy.test.ts',
    added: 87,
    removed: 12,
    status: 'modified' as const,
  },
  {
    name: 'strategy-mapper.ts',
    added: 45,
    removed: 8,
    status: 'modified' as const,
  },
  {
    name: 'config/bot-config.ts',
    added: 23,
    removed: 0,
    status: 'added' as const,
  },
  { name: 'index.ts', added: 12, removed: 4, status: 'modified' as const },
  {
    name: 'types/strategy.d.ts',
    added: 15,
    removed: 14,
    status: 'modified' as const,
  },
  {
    name: 'utils/deprecated-mapper.ts',
    added: 0,
    removed: 4,
    status: 'deleted' as const,
  },
];

export default function FullReviewPage({
  params,
}: {
  params: { repoId: string; prId: string };
}) {
  const severityConfig = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      icon: AlertCircle,
      label: 'Critical',
    },
    warning: {
      bg: 'bg-[#f97316]/10',
      border: 'border-[#f97316]/20',
      text: 'text-[#f97316]',
      icon: AlertCircle,
      label: 'Warning',
    },
    suggestion: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      icon: MessageSquare,
      label: 'Suggestion',
    },
    info: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      icon: CheckCircle2,
      label: 'Approved',
    },
  };

  const criticalCount = REVIEW_COMMENTS.filter(
    (c) => c.severity === 'critical',
  ).length;
  const warningCount = REVIEW_COMMENTS.filter(
    (c) => c.severity === 'warning',
  ).length;
  const suggestionCount = REVIEW_COMMENTS.filter(
    (c) => c.severity === 'suggestion',
  ).length;
  const approvedCount = REVIEW_COMMENTS.filter(
    (c) => c.severity === 'info',
  ).length;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#121214]">
      {/* ── Header ── */}
      <div className="px-8 pt-6 pb-5 border-b border-[#2a2a2a] bg-[#121214]">
        <Link
          href={`/dashboard/repositories/${params.repoId}`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Back to Pull Requests
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <GitPullRequest size={20} className="text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#e8e8e8] leading-tight">
                  Update autonomous code review mappings
                </h1>
                <div className="text-[12px] text-[#6d6d6d] mt-1 flex items-center gap-1.5">
                  <span className="text-green-400 font-semibold">
                    #{params.prId}
                  </span>
                  <span>·</span>
                  <span className="text-[#a1a1aa] font-medium">
                    CodeWithJagdeep
                  </span>
                  <span className="text-[#6d6d6d] font-light">/</span>
                  <span className="text-[#a1a1aa]">{params.repoId}</span>
                  <span>·</span>
                  <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-[#a1a1aa]">
                    feature/bot-mappings → main
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-[12px] font-bold text-[#a1a1aa] bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors">
              Re-Analyze
            </button>
            <button className="px-4 py-2 text-[12px] font-bold text-white bg-[#f97316] hover:bg-[#ea580c] rounded-md transition-colors">
              Approve PR
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#f97316] flex items-center justify-center">
              <span className="text-[10px] font-black text-white">K</span>
            </div>
            <span className="text-[13px] font-bold text-[#e8e8e8]">
              KangBot Review
            </span>
          </div>
          <span className="w-px h-4 bg-[#333]" />
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-red-400">
                <AlertCircle size={11} /> {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f97316]/10 border border-[#f97316]/20 text-[11px] font-bold text-[#f97316]">
                <AlertCircle size={11} /> {warningCount} Warning
              </span>
            )}
            {suggestionCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400">
                <MessageSquare size={11} /> {suggestionCount} Suggestion
              </span>
            )}
            {approvedCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[11px] font-bold text-green-400">
                <CheckCircle2 size={11} /> {approvedCount} Approved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex">
          {/* Main Review Content */}
          <div className="flex-1 p-8">
            {/* AI Overview */}
            <div className="mb-8 p-5 rounded-xl bg-[#1c1c1c] border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={14} className="text-[#f97316]" />
                <h2 className="text-[14px] font-bold text-[#e8e8e8]">
                  AI Overview
                </h2>
              </div>
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed mb-3">
                This pull request refactors the{' '}
                <code className="text-[#e8e8e8] bg-white/5 px-1 py-0.5 rounded text-[12px]">
                  BotStrategy
                </code>{' '}
                mapping configuration to support secondary markdown instruction
                parsing. The changes span 6 files with a net addition of 182
                lines. The overall code quality is good with one critical issue
                that should be addressed before merging.
              </p>
              <div className="flex items-center gap-4 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-[#f97316]" />
                  <span className="text-[#a1a1aa]">
                    Security Risk:{' '}
                    <span className="text-[#f97316] font-bold">Medium</span>
                  </span>
                </div>
                <span className="w-px h-3 bg-[#333]" />
                <div className="flex items-center gap-1.5">
                  <Code2 size={12} className="text-[#a1a1aa]" />
                  <span className="text-[#a1a1aa]">
                    Complexity:{' '}
                    <span className="text-blue-400 font-bold">Low</span>
                  </span>
                </div>
                <span className="w-px h-3 bg-[#333]" />
                <div className="flex items-center gap-1.5">
                  <FileText size={12} className="text-[#a1a1aa]" />
                  <span className="text-[#a1a1aa]">
                    Test Coverage:{' '}
                    <span className="text-green-400 font-bold">87%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Review Comments */}
            <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-4 flex items-center gap-2">
              <MessageSquare size={14} />
              Review Comments ({REVIEW_COMMENTS.length})
            </h2>
            <div className="flex flex-col gap-3">
              {REVIEW_COMMENTS.map((comment, i) => {
                const config = severityConfig[comment.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={i}
                    className={`rounded-xl border overflow-hidden ${config.border} bg-[#1c1c1c]`}
                  >
                    {/* Comment Header */}
                    <div
                      className={`px-4 py-3 flex items-center justify-between ${config.bg}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center ${config.bg}`}
                        >
                          <Icon size={12} className={config.text} />
                        </div>
                        <span
                          className={`text-[12px] font-bold ${config.text}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[12px] font-bold text-[#e8e8e8]">
                          {comment.title}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#6d6d6d] bg-white/5 px-2 py-0.5 rounded">
                        {comment.file}:{comment.line}
                      </span>
                    </div>
                    {/* Comment Body */}
                    <div className="px-4 py-3">
                      <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
                        {comment.body}
                      </p>
                      {comment.suggestion && (
                        <div className="mt-3">
                          <div className="text-[11px] font-bold text-[#6d6d6d] uppercase tracking-wider mb-1.5">
                            Suggested Fix
                          </div>
                          <pre className="text-[12px] text-green-400 bg-[#121214] border border-white/5 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed">
                            {comment.suggestion}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Files Changed Sidebar */}
          <div className="w-72 border-l border-[#2a2a2a] p-6 shrink-0 bg-[#161618]">
            <h3 className="text-[13px] font-bold text-[#e8e8e8] mb-4 flex items-center gap-2">
              <FileText size={14} />
              Files Changed ({FILES_CHANGED.length})
            </h3>
            <div className="flex flex-col gap-1.5">
              {FILES_CHANGED.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        file.status === 'added'
                          ? 'bg-green-400'
                          : file.status === 'deleted'
                            ? 'bg-red-400'
                            : 'bg-[#f97316]'
                      }`}
                    />
                    <span className="text-[12px] text-[#a1a1aa] group-hover:text-[#e8e8e8] truncate transition-colors font-mono">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono shrink-0 ml-2">
                    {file.added > 0 && (
                      <span className="text-green-400">+{file.added}</span>
                    )}
                    {file.removed > 0 && (
                      <span className="text-red-400">-{file.removed}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Diff Bar */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="text-[11px] text-[#6d6d6d] mb-2">
                Total changes
              </div>
              <div className="flex items-center gap-2 text-[12px] font-mono mb-2">
                <span className="text-green-400 font-bold">+182</span>
                <span className="text-red-400 font-bold">-42</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#121214] flex overflow-hidden">
                <div
                  className="bg-green-400 transition-all"
                  style={{ width: '81%' }}
                />
                <div
                  className="bg-red-400 transition-all"
                  style={{ width: '19%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
