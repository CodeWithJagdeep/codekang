'use client';

import {
  GitPullRequest,
  MoreHorizontal,
  PanelRight,
  Code2,
  Copy,
  Download,
} from 'lucide-react';

function BeforeAfter({ section }: { section: 'Homepage' | 'Footer' }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-ink mb-3">{section}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11.5px] text-ink-muted mb-1.5">
            Before on Production
          </div>
          <div className="aspect-[5/4] border border-border rounded-lg flex items-center justify-center bg-white">
            <span
              className="text-[34px] font-bold leading-[1.05] text-center"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #317CFF 0%, #8a5cf6 60%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Secure,
              <br />
              Private
            </span>
          </div>
          <div className="text-[11.5px] text-ink-muted mt-1.5">
            Gradient on text
          </div>
        </div>

        <div>
          <div className="text-[11.5px] text-ink-muted mb-1.5">
            After on Localhost
          </div>
          <div className="aspect-[5/4] border border-border rounded-lg flex items-center justify-center bg-white">
            <span
              className="text-[34px] font-bold leading-[1.05] text-center"
              style={{ color: '#317CFF' }}
            >
              Secure,
              <br />
              Private
            </span>
          </div>
          <div className="text-[11.5px] text-ink-muted mt-1.5">
            Uniform solid blue
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RightPanel() {
  return (
    <aside className="w-[520px] shrink-0 bg-bg-subtle flex flex-col h-screen">
      {/* Top bar */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-border-subtle">
        <button className="inline-flex items-center gap-1 text-[12px] font-medium text-ink bg-white border border-border rounded-full px-2.5 py-1 hover:bg-bg-muted transition-colors">
          <GitPullRequest
            size={11}
            strokeWidth={2.2}
            className="text-accent-green"
          />
          <span>#357</span>
          <span className="text-ink-soft">+ 1</span>
        </button>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-md hover:bg-black/5 text-ink-muted">
            <MoreHorizontal size={15} strokeWidth={1.8} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-black/5 text-ink-muted">
            <PanelRight size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Document container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white border border-border rounded-xl">
          {/* Doc header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
            <span className="text-[12.5px] font-mono text-ink-muted">
              test_gradient_migration.md
            </span>
            <div className="flex items-center gap-0.5">
              <button className="p-1.5 rounded hover:bg-black/5 text-ink-soft">
                <Code2 size={13} strokeWidth={1.8} />
              </button>
              <button className="p-1.5 rounded hover:bg-black/5 text-ink-soft">
                <Copy size={13} strokeWidth={1.8} />
              </button>
              <button className="p-1.5 rounded hover:bg-black/5 text-ink-soft">
                <Download size={13} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Doc body */}
          <div className="p-5 pb-6">
            <h2 className="text-[19px] font-bold text-ink">
              Test Report: Migrate Gradient Text
            </h2>

            <p className="text-[13px] text-ink mt-3">
              PRs:{' '}
              <a href="#" className="text-accent-blue hover:underline">
                devin-website #357
              </a>{' '}
              <span className="text-ink-soft">|</span>{' '}
              <a href="#" className="text-accent-blue hover:underline">
                cognition-website #167
              </a>
            </p>

            <p className="text-[13px] text-ink mt-3 leading-relaxed">
              All gradient text{' '}
              <code className="font-mono text-[12px] bg-bg-muted px-1 py-0.5 rounded border border-border-subtle">
                background: linear-gradient( ... )
              </code>{' '}
              replaced with solid{' '}
              <code className="font-mono text-[12px] bg-bg-muted px-1 py-0.5 rounded border border-border-subtle">
                color: #317CFF
              </code>{' '}
              across both repos. Tested by comparing production sites (gradient)
              vs localhost dev servers (solid blue).
            </p>

            <div className="mt-5 space-y-5">
              <BeforeAfter section="Homepage" />
              <BeforeAfter section="Footer" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
