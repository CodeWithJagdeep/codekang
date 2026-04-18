'use client';

import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  GitPullRequest,
  Copy,
  ArrowUpRight,
  FileText,
  Plus,
  Mic,
} from 'lucide-react';

function DisclosureRow({
  icon: Icon,
  label,
  right,
}: {
  icon?: unknown;
  label: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-muted py-1.5 cursor-pointer hover:text-ink transition-colors">
      <ChevronRight size={13} strokeWidth={2} className="text-ink-soft" />
      {Icon && <Icon size={13} strokeWidth={1.8} />}
      <span>{label}</span>
      {right && <span className="ml-1">{right}</span>}
    </div>
  );
}

function PRCard({
  repo,
  number,
  title,
  branch,
  files,
  added,
  removed,
}: {
  repo: string;
  number: number;
  title: string;
  branch: string;
  files: number;
  added: number;
  removed: number;
}) {
  return (
    <div className="border border-border rounded-xl p-3.5 bg-white hover:border-ink-soft/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent-green bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100">
            <GitPullRequest size={11} strokeWidth={2.2} />
            Open
          </span>
          <span className="text-[13px] text-ink-muted">
            {repo} <span className="text-ink-soft">#{number}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-black/5 text-ink-soft">
            <GitPullRequest size={13} strokeWidth={1.8} />
          </button>
          <button className="p-1 rounded hover:bg-black/5 text-ink-soft">
            <ArrowUpRight size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="mt-2.5 text-[14px] font-medium text-ink">{title}</div>

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-ink-muted font-mono">
          <span className="bg-bg-muted px-1.5 py-0.5 rounded border border-border-subtle">
            {branch}
          </span>
          <button className="p-0.5 rounded hover:bg-black/5">
            <Copy size={11} strokeWidth={1.8} />
          </button>
          <span className="text-ink-soft">→</span>
          <span className="bg-bg-muted px-1.5 py-0.5 rounded border border-border-subtle">
            main
          </span>
          <button className="p-0.5 rounded hover:bg-black/5">
            <Copy size={11} strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-ink-muted">
          <span>{files} files</span>
          <span className="text-accent-green font-medium">+{added}</span>
          <span className="text-accent-red font-medium">-{removed}</span>
        </div>
      </div>
    </div>
  );
}

export default function CenterPanel() {
  return (
    <section className="flex-1 min-w-0 bg-white flex flex-col h-screen border-r border-border">
      {/* Top bar */}
      <div className="h-[52px] border-b border-border-subtle flex items-center px-5 gap-3">
        <button className="flex items-center gap-1 text-[13px] font-medium text-ink hover:bg-black/5 rounded-md px-1.5 py-1">
          Website
          <ChevronDown size={13} className="text-ink-soft" strokeWidth={2} />
        </button>
        <span className="text-ink-soft">/</span>
        <span className="text-[13px] text-ink-muted">
          Migrate gradient text
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-6 py-6">
          {/* User message */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 border border-border rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink bg-white">
              Migrate all gradient text to #317CFF in both repos, then test
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-300 to-orange-300 shrink-0 ring-1 ring-black/5" />
          </div>

          {/* Playbook disclosure */}
          <DisclosureRow icon={BookOpen} label="Used playbook: Test" />

          {/* Devin message */}
          <p className="text-[13.5px] text-ink mt-2 leading-relaxed">
            I'll migrate all gradient text to #317CFF in both cognition-website
            and devin-website repos, then test the changes. Starting now.
          </p>

          <DisclosureRow
            label={
              <>
                Worked for 4m 13s{' '}
                <span className="text-accent-green font-medium ml-1">+25</span>{' '}
                <span className="text-accent-red font-medium">-131</span>
              </>
            }
          />

          {/* PR cards */}
          <div className="mt-3 space-y-3">
            <PRCard
              repo="cognition/cognition-website"
              number={167}
              title="Migrate all gradient text to #317CFF"
              branch="devin/USA-938-1765942251"
              files={6}
              added={21}
              removed={123}
            />
            <PRCard
              repo="cognition/devin-website"
              number={357}
              title="Migrate all gradient text to #317CFF"
              branch="devin/USA-938-1765942252"
              files={2}
              added={4}
              removed={8}
            />
          </div>

          <div className="mt-4">
            <DisclosureRow label="Worked for 5m 33s" />
          </div>

          <p className="text-[13.5px] text-ink mt-2 leading-relaxed">
            Done! All gradient text migrated to #317CFF and tested across both
            repos. Full report attached.
          </p>

          {/* Attached file chip */}
          <button className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted border border-border rounded-md px-2 py-1 hover:bg-black/[0.03] transition-colors">
            <FileText size={12} strokeWidth={1.8} />
            test_gradient_migration.md
          </button>

          {/* Ready state */}
          <div className="mt-6 flex items-center gap-2 text-[13px] text-ink-muted">
            <span
              className="cognition-logo"
              style={{ width: 12, height: 12 }}
            />
            <span>Devin is ready for instructions</span>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border-subtle p-4">
        <div className="max-w-[680px] mx-auto">
          <div className="border border-border rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-ink-soft/50 transition-colors">
            <textarea
              placeholder="Ask Devin to build features, fix bugs, or work on your code"
              rows={2}
              className="w-full resize-none bg-transparent px-3.5 py-3 text-[13.5px] text-ink placeholder:text-ink-soft focus:outline-none"
            />
            <div className="flex items-center justify-between px-2.5 py-2 border-t border-border-subtle">
              <button className="p-1.5 rounded-md hover:bg-black/5 text-ink-muted transition-colors">
                <Plus size={15} strokeWidth={1.8} />
              </button>
              <button className="p-1.5 rounded-md hover:bg-black/5 text-ink-muted transition-colors">
                <Mic size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
