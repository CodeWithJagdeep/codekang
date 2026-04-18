'use client';

import { useState } from 'react';
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
  Check,
  X,
  Copy,
  MessageCircle,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';

interface ReviewComment {
  id: string;
  file: string;
  line: number;
  severity: 'critical' | 'warning' | 'suggestion' | 'info';
  title: string;
  body: string;
  suggestion?: string;
}

const INITIAL_COMMENTS: ReviewComment[] = [
  {
    id: 'c1',
    file: 'bot-strategy.test.ts',
    line: 47,
    severity: 'critical',
    title: 'Memory leak in test loop',
    body: 'Unbounded loop detected creating new `Promise` instances without cleanup. Each iteration allocates ~2.4KB that is never freed. Over 1000 iterations this will consume ~2.4MB of heap memory. Recommend adding `afterEach` teardown with `jest.clearAllTimers()` and explicit promise resolution.',
    suggestion: `afterEach(() => {\n  jest.clearAllTimers();\n  jest.restoreAllMocks();\n});`,
  },
  {
    id: 'c2',
    file: 'strategy-mapper.ts',
    line: 112,
    severity: 'warning',
    title: 'Missing input validation',
    body: 'The `parseMarkdown()` function accepts raw input without sanitization. This could allow injection of malicious markdown directives that bypass the instruction parser. Consider adding a validation layer.',
    suggestion: `function parseMarkdown(input: string): ParsedResult {\n  const sanitized = sanitizeInput(input);\n  if (!isValidMarkdown(sanitized)) {\n    throw new ValidationError('Invalid markdown input');\n  }\n  return parse(sanitized);\n}`,
  },
  {
    id: 'c3',
    file: 'strategy-mapper.ts',
    line: 89,
    severity: 'suggestion',
    title: 'Consider using Map instead of Object',
    body: 'The strategy lookup table uses a plain object which has O(n) worst-case lookup time. A `Map` would provide guaranteed O(1) lookups and better memory characteristics for large strategy sets.',
    suggestion: `const strategyMap = new Map<string, Strategy>();\nstrategies.forEach(s => strategyMap.set(s.id, s));`,
  },
  {
    id: 'c4',
    file: 'config/bot-config.ts',
    line: 23,
    severity: 'info',
    title: 'Good use of environment variable fallbacks',
    body: 'The configuration correctly uses `process.env.BOT_STRATEGY_TIMEOUT ?? 30000` with a sensible default. This follows the principle of safe defaults and will prevent runtime crashes in development environments.',
  },
  {
    id: 'c5',
    file: 'index.ts',
    line: 5,
    severity: 'info',
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
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleResolve = (id: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applySuggestion = (id: string) => {
    setAppliedIds((prev) => new Set(prev).add(id));
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const submitReply = (id: string) => {
    if (!replyText.trim()) return;
    setReplies((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), replyText.trim()],
    }));
    setReplyText('');
    setReplyingTo(null);
  };

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

  const unresolvedComments = INITIAL_COMMENTS.filter(
    (c) => !resolvedIds.has(c.id),
  );
  const resolvedComments = INITIAL_COMMENTS.filter((c) =>
    resolvedIds.has(c.id),
  );
  const criticalCount = unresolvedComments.filter(
    (c) => c.severity === 'critical',
  ).length;
  const warningCount = unresolvedComments.filter(
    (c) => c.severity === 'warning',
  ).length;
  const suggestionCount = unresolvedComments.filter(
    (c) => c.severity === 'suggestion',
  ).length;
  const approvedCount = INITIAL_COMMENTS.filter(
    (c) => c.severity === 'info',
  ).length;

  const renderComment = (comment: ReviewComment) => {
    const config = severityConfig[comment.severity];
    const Icon = config.icon;
    const isResolved = resolvedIds.has(comment.id);
    const isApplied = appliedIds.has(comment.id);
    const commentReplies = replies[comment.id] || [];

    return (
      <div
        key={comment.id}
        className={`rounded-xl border overflow-hidden transition-all duration-200 ${isResolved ? 'border-white/5 opacity-60' : config.border} bg-[#1c1c1c]`}
      >
        {/* Comment Header */}
        <div
          className={`px-4 py-3 flex items-center justify-between ${isResolved ? 'bg-white/5' : config.bg}`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center ${isResolved ? 'bg-white/10' : config.bg}`}
            >
              {isResolved ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Icon size={12} className={config.text} />
              )}
            </div>
            <span
              className={`text-[12px] font-bold ${isResolved ? 'text-green-400' : config.text}`}
            >
              {isResolved ? 'Resolved' : config.label}
            </span>
            <span
              className={`text-[12px] font-bold ${isResolved ? 'text-[#6d6d6d] line-through' : 'text-[#e8e8e8]'}`}
            >
              {comment.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#6d6d6d] bg-white/5 px-2 py-0.5 rounded">
              {comment.file}:{comment.line}
            </span>
            <button
              onClick={() => toggleResolve(comment.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                isResolved
                  ? 'bg-white/5 text-[#a1a1aa] hover:bg-white/10'
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
              }`}
            >
              {isResolved ? (
                <>
                  <RotateCcw size={10} /> Unresolve
                </>
              ) : (
                <>
                  <Check size={10} /> Resolve
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comment Body */}
        <div className="px-4 py-3">
          <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
            {comment.body}
          </p>

          {/* Suggested Fix with Apply button */}
          {comment.suggestion && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[11px] font-bold text-[#6d6d6d] uppercase tracking-wider">
                  Suggested Fix
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyCode(comment.suggestion!, comment.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-[#a1a1aa] hover:text-[#e8e8e8] bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copiedId === comment.id ? (
                      <>
                        <Check size={10} className="text-green-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> Copy
                      </>
                    )}
                  </button>
                  {!isApplied ? (
                    <button
                      onClick={() => applySuggestion(comment.id)}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#f97316] hover:bg-[#ea580c] transition-colors"
                    >
                      <Check size={10} /> Apply Suggestion
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 size={10} /> Applied
                    </span>
                  )}
                </div>
              </div>
              <pre
                className={`text-[12px] bg-[#121214] border border-white/5 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed ${isApplied ? 'text-green-400/50 line-through' : 'text-green-400'}`}
              >
                {comment.suggestion}
              </pre>
            </div>
          )}

          {/* User Replies */}
          {commentReplies.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {commentReplies.map((reply, ri) => (
                <div
                  key={ri}
                  className="flex gap-2.5 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-blue-400">
                    J
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6d6d6d] mb-0.5">
                      <span className="text-[#a1a1aa] font-medium">
                        jsingh20
                      </span>{' '}
                      · just now
                    </div>
                    <p className="text-[13px] text-[#e8e8e8] leading-relaxed">
                      {reply}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/5">
            <button
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-[#a1a1aa] hover:text-[#e8e8e8] bg-white/5 hover:bg-white/10 transition-colors"
            >
              <MessageCircle size={11} /> Reply
            </button>
            {comment.severity !== 'info' && (
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-[#a1a1aa] hover:text-[#e8e8e8] bg-white/5 hover:bg-white/10 transition-colors">
                <ThumbsUp size={11} /> Helpful
              </button>
            )}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-[#a1a1aa] hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-colors">
              <X size={11} /> Dismiss
            </button>
          </div>

          {/* Reply Box */}
          {replyingTo === comment.id && (
            <div className="mt-3 rounded-lg border border-white/10 bg-[#121214] overflow-hidden">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply to KangBot..."
                className="w-full bg-transparent px-4 py-3 text-[13px] text-[#e8e8e8] placeholder-[#6d6d6d] resize-none focus:outline-none min-h-[80px]"
                autoFocus
              />
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#161618]">
                <span className="text-[11px] text-[#6d6d6d]">
                  Markdown supported
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-3 py-1.5 text-[11px] font-bold text-[#a1a1aa] hover:text-[#e8e8e8] rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#f97316] hover:bg-[#ea580c] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          <span className="w-px h-4 bg-[#333]" />
          <span className="text-[11px] text-[#6d6d6d]">
            {resolvedIds.size}/{INITIAL_COMMENTS.length} resolved
          </span>
          {/* Progress */}
          <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-300"
              style={{
                width: `${(resolvedIds.size / INITIAL_COMMENTS.length) * 100}%`,
              }}
            />
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

            {/* Active Review Comments */}
            <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-4 flex items-center gap-2">
              <MessageSquare size={14} />
              Review Comments ({unresolvedComments.length} open)
            </h2>
            <div className="flex flex-col gap-3 mb-8">
              {unresolvedComments.map(renderComment)}
            </div>

            {/* Resolved Comments */}
            {resolvedComments.length > 0 && (
              <>
                <h2 className="text-[14px] font-bold text-[#6d6d6d] mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Resolved ({resolvedComments.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {resolvedComments.map(renderComment)}
                </div>
              </>
            )}
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

            {/* Quick Actions */}
            <div className="mt-5 pt-4 border-t border-white/5 flex flex-col gap-2">
              <button
                onClick={() =>
                  INITIAL_COMMENTS.forEach((c) =>
                    setResolvedIds((prev) => new Set(prev).add(c.id)),
                  )
                }
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-bold text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-colors"
              >
                <Check size={12} /> Resolve All
              </button>
              <button
                onClick={() => setResolvedIds(new Set())}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-bold text-[#a1a1aa] bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RotateCcw size={12} /> Unresolve All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
