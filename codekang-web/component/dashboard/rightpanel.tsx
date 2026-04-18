'use client';

import {
  XCircle,
  CheckCircle2,
  GitPullRequest,
  ChevronDown,
  AlertTriangle,
  Info,
  FileText,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

const REVIEW_DATA: Record<
  number,
  {
    title: string;
    branch: string;
    author: string;
    summary: string;
    risk: 'low' | 'high' | 'medium';
    comments: {
      file: string;
      line: number;
      severity: 'error' | 'warning' | 'info';
      message: string;
    }[];
    filesChanged: { name: string; added: number; removed: number }[];
  }
> = {
  142: {
    title: 'feat: Implement AI-powered code review feedback',
    branch: 'feat/ai-review',
    author: 'Alex R.',
    summary:
      'This PR adds AI-powered review feedback using the Claude API. The implementation looks clean and follows existing patterns. No security concerns detected.',
    risk: 'low',
    comments: [
      {
        file: 'src/services/review-service.ts',
        line: 47,
        severity: 'info',
        message: 'Consider adding a retry mechanism for Claude API failures.',
      },
      {
        file: 'src/config/ai/anthropic.ts',
        line: 23,
        severity: 'info',
        message: 'API key is loaded from env — looks good.',
      },
    ],
    filesChanged: [
      { name: 'src/services/review-service.ts', added: 84, removed: 12 },
      { name: 'src/config/ai/anthropic.ts', added: 18, removed: 4 },
      { name: 'src/routes/webhook.ts', added: 26, removed: 6 },
    ],
  },
  141: {
    title: 'fix: Resolve critical security vulnerability in auth',
    branch: 'hotfix/auth-vulnerability',
    author: 'Sarah K.',
    summary:
      'Critical security issues detected. CSRF tokens are not validated on 2 endpoints, and JWT expiry is not being enforced server-side.',
    risk: 'high',
    comments: [
      {
        file: 'apps/auth/src/modules/auth.controller.ts',
        line: 89,
        severity: 'error',
        message:
          'CSRF token not validated on this POST endpoint. This is a critical vulnerability.',
      },
      {
        file: 'apps/auth/src/modules/auth.service.ts',
        line: 134,
        severity: 'error',
        message:
          'JWT expiry check is missing. Tokens may stay valid indefinitely.',
      },
      {
        file: 'apps/auth/src/strategies/github.strategy.ts',
        line: 22,
        severity: 'warning',
        message:
          'State parameter should be validated to prevent OAuth CSRF attacks.',
      },
    ],
    filesChanged: [
      {
        name: 'apps/auth/src/modules/auth.controller.ts',
        added: 12,
        removed: 3,
      },
      { name: 'apps/auth/src/modules/auth.service.ts', added: 8, removed: 2 },
      {
        name: 'apps/auth/src/strategies/github.strategy.ts',
        added: 5,
        removed: 1,
      },
    ],
  },
  140: {
    title: 'docs: Update API documentation for new endpoints',
    branch: 'docs/api-updates',
    author: 'John L.',
    summary: 'KangBot is currently reviewing this PR...',
    risk: 'low',
    comments: [],
    filesChanged: [
      { name: 'README.md', added: 120, removed: 30 },
      { name: 'docs/api.md', added: 200, removed: 10 },
    ],
  },
  139: {
    title: 'refactor: Move auth middleware to shared library',
    branch: 'refactor/auth-middleware',
    author: 'Priya S.',
    summary:
      'Clean refactor with no regressions. Auth middleware is correctly abstracted and all existing tests should pass.',
    risk: 'low',
    comments: [
      {
        file: 'libs/common/src/guards/jwt-auth.guard.ts',
        line: 14,
        severity: 'info',
        message: 'Good pattern — guard is now reusable across all services.',
      },
    ],
    filesChanged: [
      {
        name: 'libs/common/src/guards/jwt-auth.guard.ts',
        added: 45,
        removed: 0,
      },
      { name: 'apps/gateway/src/app.module.ts', added: 3, removed: 8 },
    ],
  },
};

const RISK_CONFIG = {
  low: {
    label: 'Low Risk',
    color: 'text-accent-green',
    bg: 'bg-accent-green/10 border-accent-green/20',
    icon: CheckCircle2,
  },
  medium: {
    label: 'Medium Risk',
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/10 border-accent-orange/20',
    icon: AlertTriangle,
  },
  high: {
    label: 'High Risk',
    color: 'text-accent-red',
    bg: 'bg-accent-red/10 border-accent-red/20',
    icon: XCircle,
  },
};

const SEVERITY_CONFIG = {
  error: {
    icon: XCircle,
    color: 'text-accent-red',
    bg: 'border-l-2 border-accent-red',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-accent-orange',
    bg: 'border-l-2 border-accent-orange',
  },
  info: {
    icon: Info,
    color: 'text-accent-blue',
    bg: 'border-l-2 border-accent-blue',
  },
};

export default function RightPanel({
  selectedPR,
}: {
  selectedPR: number | null;
}) {
  if (!selectedPR) {
    return (
      <aside
        className="w-[380px] shrink-0 flex flex-col h-screen border-l border-border"
        style={{ background: 'var(--bg-subtle)' }}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-12 h-12 rounded-xl bg-brand-dim flex items-center justify-center mb-4">
            <Zap size={20} className="text-brand" strokeWidth={2} />
          </div>
          <h3 className="text-[14px] font-semibold text-ink mb-2">
            KangBot Review Panel
          </h3>
          <p className="text-[12.5px] text-ink-muted leading-relaxed">
            Select a Pull Request or Issue from the list to see KangBot's AI
            analysis, inline comments, and risk assessment.
          </p>
        </div>
      </aside>
    );
  }

  const data = REVIEW_DATA[selectedPR];
  if (!data) return null;

  const risk = RISK_CONFIG[data.risk];
  const RiskIcon = risk.icon;

  return (
    <aside
      className="w-[380px] shrink-0 flex flex-col h-screen border-l border-border"
      style={{ background: 'var(--bg-subtle)' }}
    >
      {/* Header */}
      <div className="h-[56px] border-b border-border flex items-center px-4 gap-2">
        <Zap size={13} className="text-brand shrink-0" strokeWidth={2.5} />
        <span className="text-[13px] font-semibold text-ink flex-1">
          KangBot Review
        </span>
        <a
          href="#"
          className="flex items-center gap-1 text-[11.5px] text-ink-soft hover:text-ink"
        >
          <ArrowUpRight size={12} strokeWidth={1.8} />
          View PR
        </a>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* PR Info */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-start gap-2">
            <GitPullRequest
              size={14}
              className="text-accent-green shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div>
              <p className="text-[13px] font-medium text-ink leading-snug">
                {data.title}
              </p>
              <p className="text-[11.5px] text-ink-soft mt-1 font-mono">
                {data.branch} → main · by {data.author}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="px-4 py-4 border-b border-border">
          <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-3">
            Risk Assessment
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${risk.bg}`}
          >
            <RiskIcon size={14} strokeWidth={2} className={risk.color} />
            <span className={`text-[12.5px] font-semibold ${risk.color}`}>
              {risk.label}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="px-4 py-4 border-b border-border">
          <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-3">
            Summary
          </div>
          <p className="text-[12.5px] text-ink-muted leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Inline Comments */}
        {data.comments.length > 0 && (
          <div className="px-4 py-4 border-b border-border">
            <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-3">
              Inline Comments ({data.comments.length})
            </div>
            <div className="space-y-3">
              {data.comments.map((comment, i) => {
                const cfg = SEVERITY_CONFIG[comment.severity];
                const Icon = cfg.icon;
                return (
                  <div
                    key={i}
                    className={`bg-bg-muted rounded-r-lg pl-3 pr-3 py-2.5 ${cfg.bg}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={11} strokeWidth={2} className={cfg.color} />
                      <span className="text-[10.5px] font-mono text-ink-soft">
                        {comment.file}:{comment.line}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-muted">
                      {comment.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Files Changed */}
        <div className="px-4 py-4">
          <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Files Changed ({data.filesChanged.length})</span>
            <ChevronDown size={12} strokeWidth={2} />
          </div>
          <div className="space-y-1.5">
            {data.filesChanged.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-bg-muted transition-colors"
              >
                <FileText
                  size={11}
                  className="text-ink-soft shrink-0"
                  strokeWidth={1.8}
                />
                <span className="text-[11.5px] font-mono text-ink-muted truncate flex-1">
                  {f.name}
                </span>
                <span className="text-[11px] text-accent-green font-medium shrink-0">
                  +{f.added}
                </span>
                <span className="text-[11px] text-accent-red font-medium shrink-0">
                  -{f.removed}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border p-3 flex gap-2">
        <button className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold bg-brand text-bg hover:bg-brand/90 transition-colors">
          Approve PR
        </button>
        <button className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold border border-border text-ink-muted hover:text-ink hover:bg-bg-muted transition-colors">
          Request Fix
        </button>
      </div>
    </aside>
  );
}
