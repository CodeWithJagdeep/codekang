import {
  RiAddLine,
  RiAlertLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBankCardLine,
  RiBarChartBoxLine,
  RiCheckboxCircleFill,
  RiFileTextLine,
  RiFlashlightLine,
  RiGitRepositoryLine,
  RiGitPullRequestLine,
  RiLogoutBoxRLine,
  RiNotification3Line,
  RiRefreshLine,
  RiSearchLine,
  RiSettings3Line,
  RiStackLine,
  RiSubtractLine,
} from 'react-icons/ri';

const OPEN_PRS = [
  { title: 'feat: autonomous issue routing', repo: 'codekang-gateway', number: 357 },
  { title: 'fix: auth session hydration', repo: 'codekang-web', number: 356 },
  { title: 'refactor: repo sync pipeline', repo: 'codekang-repos', number: 354 },
] as const;

const REPOS = [
  { name: 'codekang-web', prs: 12, issues: 4 },
  { name: 'codekang-gateway', prs: 8, issues: 2 },
  { name: 'codekang-repos', prs: 5, issues: 1 },
  { name: 'codekang-ai-agent', prs: 3, issues: 0 },
] as const;

const FILES_CHANGED = [
  { name: 'app/dashboard/page.tsx', added: 21, removed: 8 },
  { name: 'lib/auth.ts', added: 14, removed: 3 },
  { name: 'component/dashboard/sidebar.tsx', added: 9, removed: 2 },
] as const;

export default function LandingShowcase() {
  return (
    <div className="mx-auto mt-16 max-w-7xl rounded-[30px] border border-white/5 bg-[#1c1c1c] p-2 shadow-[0_45px_120px_-55px_rgba(0,0,0,0.65)] sm:p-3">
      <div className="overflow-hidden rounded-[24px] border border-white/5 bg-[#1c1c1c]">
        <div className="grid min-h-[720px] lg:grid-cols-[240px_minmax(0,1fr)_360px]">
          <aside className="hidden border-r border-white/5 bg-[#1c1c1c] lg:flex lg:flex-col">
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-3">
              <div className="flex items-center gap-2 overflow-hidden rounded-md px-1.5 py-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2a2a2e] text-[11px] font-bold text-[#6d6d6d]">
                  K
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[14px] font-medium text-[#e8e8e8]">
                    CodeKang
                  </span>
                  <RiArrowDownSLine className="text-[#888888]" />
                </div>
              </div>
            </div>

            <nav className="space-y-0.5 px-2 pb-1 pt-2">
              <SidebarItem label="Repositories" active icon={<RiGitRepositoryLine size={18} />} />
              <SidebarItem label="Reviews" icon={<RiGitPullRequestLine size={18} />} />
              <SidebarItem label="Integrations" icon={<RiStackLine size={18} />} />
              <SidebarItem label="Reports" icon={<RiBarChartBoxLine size={18} />} />
            </nav>

            <div className="flex-1 overflow-hidden px-4 pt-4">
              <div className="mb-3 text-[13px] font-medium text-[#6d6d6d]">
                Open Pull Requests
              </div>
              <div className="space-y-1">
                {OPEN_PRS.map((pr) => (
                  <div
                    key={`${pr.repo}-${pr.number}`}
                    className="flex items-start gap-2.5 rounded-md p-2 transition-colors hover:bg-white/5"
                  >
                    <RiGitPullRequestLine
                      size={14}
                      className="mt-0.5 shrink-0 text-[#00cc66]"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-[#e8e8e8]">
                        {pr.title}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-[#888888]">
                        {pr.repo} · #{pr.number}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-0.5 border-t border-white/5 p-2">
              <button className="flex w-full items-center gap-2 rounded-lg bg-[#f8423b] px-3 py-1.5 text-left text-[12px] font-bold text-white transition-opacity hover:opacity-90">
                <RiFlashlightLine size={13} />
                Upgrade to Pro
              </button>
              <button className="flex w-full items-center justify-between rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-3 py-1.5 text-[12px] font-semibold text-[#f87171]">
                <span className="flex items-center gap-1.5">
                  <RiBankCardLine size={12} />
                  8 credits left
                </span>
                <span>Add Credits</span>
              </button>
              <SidebarItem label="Notifications" icon={<RiNotification3Line size={18} />} />
              <SidebarItem label="Settings" icon={<RiSettings3Line size={18} />} />
              <SidebarItem label="Logout" danger icon={<RiLogoutBoxRLine size={18} />} />
            </div>
          </aside>

          <section className="flex min-w-0 flex-col bg-[#1c1c1c]">
            <div className="border-b border-white/5 px-4 pb-2 pt-4 md:px-8 md:pt-6">
              <div className="text-[12px] font-medium text-[#888888]">Repositories</div>
            </div>

            <div className="flex flex-col gap-4 px-4 pb-4 pt-3 md:px-8 md:pb-6 md:pt-2">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-[28px] font-bold text-[#e8e8e8]">Repositories</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ProviderChip label="@jagdeep" />
                    <ProviderChip label="@codekang-team" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-[13px] font-semibold text-[#e8e8e8] transition-colors hover:bg-white/5">
                    <RiRefreshLine size={16} />
                    <span className="hidden sm:inline">Sync Repositories</span>
                  </button>
                  <button className="flex items-center gap-2 rounded-lg bg-[#f8423b] px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90">
                    <RiAddLine size={18} />
                    Add Repositories
                  </button>
                </div>
              </div>

              <div className="flex max-w-[400px] items-center gap-3 rounded-md border border-white/10 bg-[#121214] px-3 py-2">
                <RiSearchLine size={16} className="text-[#71717a]" />
                <input
                  type="text"
                  value="codekang"
                  readOnly
                  className="w-full bg-transparent text-[13px] text-[#e8e8e8] outline-none"
                />
              </div>
            </div>

            <div className="flex-1 px-4 md:px-8">
              <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-4 py-3 text-[13px] font-semibold text-[#e8e8e8]">
                        Repository
                      </th>
                      <th className="px-4 py-3 text-right text-[13px] font-semibold text-[#e8e8e8]">
                        Pull Requests
                      </th>
                      <th className="px-4 py-3 text-right text-[13px] font-semibold text-[#e8e8e8]">
                        Issues
                      </th>
                      <th className="hidden px-4 py-3 text-center text-[13px] font-semibold text-[#e8e8e8] md:table-cell">
                        Kang AI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {REPOS.map((repo) => (
                      <tr
                        key={repo.name}
                        className="cursor-pointer transition-colors hover:bg-white/2"
                      >
                        <td className="px-4 py-4">
                          <span className="text-[16px] font-medium text-[#e8e8e8]">
                            {repo.name}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-[13px] text-[#a1a1aa]">
                          {repo.prs > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                              <RiGitPullRequestLine size={14} /> {repo.prs}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-[13px] text-[#a1a1aa]">
                          {repo.issues > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8423b]/10 px-2 py-0.5 text-[#f8423b]">
                              <RiAlertLine size={14} /> {repo.issues}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="hidden px-4 py-4 text-center md:table-cell">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(249,115,22,0.2)] bg-[rgba(249,115,22,0.08)] px-2.5 py-1 text-[11px] font-medium text-[#f8423b]">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f8423b] opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f8423b]" />
                            </span>
                            Monitoring
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-4 text-[12px] text-[#888888] md:justify-end md:gap-8 md:px-8">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <div className="flex items-center gap-1.5 rounded border border-white/10 bg-[#18181b] px-2 py-1">
                  <span>10</span>
                  <RiArrowDownSLine size={14} />
                </div>
              </div>
              <div>Page 1 of 1</div>
              <div className="flex items-center gap-1 opacity-40">
                <button className="rounded p-1">
                  <RiArrowLeftSLine size={16} />
                </button>
                <button className="rounded p-1">
                  <RiArrowRightSLine size={16} />
                </button>
              </div>
            </div>
          </section>

          <aside className="hidden border-l border-white/5 bg-[#121214] xl:flex xl:flex-col">
            <div className="flex h-[56px] items-center gap-2 border-b border-white/5 px-4">
              <RiFlashlightLine size={13} className="text-[#e11d48]" />
              <span className="flex-1 text-[13px] font-semibold text-white">
                KangBot Review
              </span>
              <span className="text-[11.5px] text-[#6d6d6d]">View PR</span>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="border-b border-white/5 px-4 py-4">
                <div className="flex items-start gap-2">
                  <RiGitPullRequestLine size={14} className="mt-0.5 shrink-0 text-white" />
                  <div>
                    <p className="text-[13px] font-medium leading-snug text-white">
                      feat: Implement AI-powered code review feedback
                    </p>
                    <p className="mt-1 font-mono text-[11.5px] text-[#6d6d6d]">
                      feat/ai-review → main · by Alex R.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/5 px-4 py-4">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#6d6d6d]">
                  Risk Assessment
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/10 px-3 py-2 text-[#22c55e]">
                  <RiCheckboxCircleFill size={14} />
                  <span className="text-[12.5px] font-semibold">Low Risk</span>
                </div>
              </div>

              <div className="border-b border-white/5 px-4 py-4">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#6d6d6d]">
                  Summary
                </div>
                <p className="text-[12.5px] leading-relaxed text-[#888888]">
                  This PR adds AI-powered review feedback using the Claude API.
                  The implementation looks clean and follows existing patterns.
                  No security concerns detected.
                </p>
              </div>

              <div className="border-b border-white/5 px-4 py-4">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#6d6d6d]">
                  Inline Comments (2)
                </div>
                <div className="space-y-3">
                  <CommentCard
                    severity="info"
                    path="src/services/review-service.ts:47"
                    message="Consider adding a retry mechanism for Claude API failures."
                  />
                  <CommentCard
                    severity="info"
                    path="src/config/ai/anthropic.ts:23"
                    message="API key is loaded from env — looks good."
                  />
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#6d6d6d]">
                  <span>Files Changed (3)</span>
                  <RiArrowDownSLine size={12} />
                </div>
                <div className="space-y-1.5">
                  {FILES_CHANGED.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-white/5"
                    >
                      <RiFileTextLine size={11} className="shrink-0 text-[#6d6d6d]" />
                      <span className="flex-1 truncate font-mono text-[11.5px] text-[#888888]">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-[#e8e8e8]">
                        +{file.added}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-[#ef4444]">
                        -{file.removed}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/5 p-3">
              <button className="flex-1 rounded-lg bg-[#e11d48] py-2 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90">
                Approve PR
              </button>
              <button className="flex-1 rounded-lg border border-white/10 py-2 text-[12.5px] font-semibold text-[#888888] transition-colors hover:bg-white/5">
                Request Fix
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  active = false,
  danger = false,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-all ${
        active ? 'bg-white/5' : 'bg-transparent'
      }`}
      style={{ color: danger ? '#f87171' : active ? '#e8e8e8' : '#888888' }}
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      <span className={active ? 'font-medium' : 'font-normal'}>{label}</span>
    </div>
  );
}

function ProviderChip({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#09090b] px-2.5 py-1">
      <span className="text-[12px] font-medium text-[#888888]">{label}</span>
      <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
    </div>
  );
}

function CommentCard({
  severity,
  path,
  message,
}: {
  severity: 'info' | 'warning' | 'error';
  path: string;
  message: string;
}) {
  const color =
    severity === 'error'
      ? '#ef4444'
      : severity === 'warning'
        ? '#f59e0b'
        : '#60a5fa';

  return (
    <div
      className="rounded-r-lg px-3 py-2.5"
      style={{ background: '#111111', borderLeft: `2px solid ${color}` }}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <RiSubtractLine size={11} style={{ color }} />
        <span className="font-mono text-[10.5px] text-[#6d6d6d]">{path}</span>
      </div>
      <p className="text-[12px] text-[#888888]">{message}</p>
    </div>
  );
}
