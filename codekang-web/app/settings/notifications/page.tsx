'use client';

import {
  Bell,
  GitPullRequest,
  Bot,
  FolderGit2,
  Mail,
  Hash,
  Check,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

// ── Toggle ──

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ${checked ? 'bg-emerald-500' : 'bg-[#3f3f46]'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ── Row ──

function NRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';

  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <div className="flex-1">
        <p className="text-[13.5px] font-medium" style={{ color: textPrimary }}>
          {label}
        </p>
        {desc && (
          <p className="text-[12.5px] mt-0.5" style={{ color: textMuted }}>
            {desc}
          </p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Section ──

function NSection({
  title,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  icon: LucideIcon;
  color: string;
  children: React.ReactNode;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#f8f8f8';

  return (
    <section
      className="rounded-md border overflow-hidden"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <div
        className="px-6 py-4 border-b flex items-center gap-3"
        style={{ borderColor: cardBorder }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <h2
          className="text-[14px] font-semibold"
          style={{ color: textPrimary }}
        >
          {title}
        </h2>
      </div>
      <div className="px-6 divide-y divide-white/10">{children}</div>
    </section>
  );
}

// ── Page ──

export default function NotificationsPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const inputBg = L ? '#f4f5f7' : '#111113';
  const inputBorder = L ? '#d8dadd' : '#2e2e2e';

  // PR review notifications
  const [prNew, setPrNew] = useState(true);
  const [prComment, setPrComment] = useState(true);
  const [prApproved, setPrApproved] = useState(true);
  const [prMerged, setPrMerged] = useState(false);
  const [prChanges, setPrChanges] = useState(true);

  // Agent notifications
  const [agentDone, setAgentDone] = useState(true);
  const [agentError, setAgentError] = useState(true);
  const [agentPatch, setAgentPatch] = useState(true);
  const [agentScan, setAgentScan] = useState(false);

  // Repo notifications
  const [repoNew, setRepoNew] = useState(false);
  const [repoPush, setRepoPush] = useState(false);
  const [repoCritical, setRepoCritical] = useState(true);

  // Delivery
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'instant' | 'hourly' | 'daily'>(
    'instant',
  );
  const [webhookUrl, setWebhookUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1
          className="text-[24px] font-bold tracking-tight"
          style={{ color: textPrimary }}
        >
          Notifications
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>
          Choose what you&apos;re notified about and how.
        </p>
      </div>

      {/* PR review */}
      <NSection
        title="Pull Request Reviews"
        icon={GitPullRequest}
        color="#3b82f6"
      >
        <NRow
          label="New review assigned to me"
          desc="When KangBot or a teammate assigns a PR for you to review."
          checked={prNew}
          onChange={setPrNew}
        />
        <NRow
          label="Review comments"
          desc="When someone comments on a PR you're involved in."
          checked={prComment}
          onChange={setPrComment}
        />
        <NRow
          label="PR approved"
          desc="When your PR receives an approval."
          checked={prApproved}
          onChange={setPrApproved}
        />
        <NRow
          label="Changes requested"
          desc="When a reviewer requests changes on your PR."
          checked={prChanges}
          onChange={setPrChanges}
        />
        <NRow
          label="PR merged or closed"
          desc="Status updates when a PR is merged or closed."
          checked={prMerged}
          onChange={setPrMerged}
        />
      </NSection>

      {/* Agents */}
      <NSection title="AI Agents" icon={Bot} color="#8b5cf6">
        <NRow
          label="Agent run completed"
          desc="When an agent finishes reviewing or patching."
          checked={agentDone}
          onChange={setAgentDone}
        />
        <NRow
          label="Agent errors"
          desc="When an agent encounters an error or gets blocked."
          checked={agentError}
          onChange={setAgentError}
        />
        <NRow
          label="Auto-patch PR opened"
          desc="When the Patch Agent opens a fix PR for a critical bug."
          checked={agentPatch}
          onChange={setAgentPatch}
        />
        <NRow
          label="Nightly security scan results"
          desc="Summary of the Security Agent's nightly scan."
          checked={agentScan}
          onChange={setAgentScan}
        />
      </NSection>

      {/* Repos */}
      <NSection title="Repositories" icon={FolderGit2} color="#10b981">
        <NRow
          label="New repository connected"
          desc="When a new repo is added to your workspace."
          checked={repoNew}
          onChange={setRepoNew}
        />
        <NRow
          label="Push activity on watched branches"
          desc="Commit push notifications for main/master."
          checked={repoPush}
          onChange={setRepoPush}
        />
        <NRow
          label="Critical issues detected"
          desc="Immediate alert when a critical security issue is found."
          checked={repoCritical}
          onChange={setRepoCritical}
        />
      </NSection>

      {/* Delivery */}
      <section
        className="rounded-md border overflow-hidden"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{ borderColor: cardBorder }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(225,29,72,0.1)',
              border: '1px solid rgba(225,29,72,0.2)',
            }}
          >
            <Bell size={14} style={{ color: '#e11d48' }} />
          </div>
          <h2
            className="text-[14px] font-semibold"
            style={{ color: textPrimary }}
          >
            Delivery channels
          </h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Email */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                style={{
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                }}
              >
                <Mail size={14} style={{ color: textMuted }} />
              </div>
              <div>
                <p
                  className="text-[13.5px] font-medium"
                  style={{ color: textPrimary }}
                >
                  Email notifications
                </p>
                <p
                  className="text-[12.5px] mt-0.5"
                  style={{ color: textMuted }}
                >
                  jagdeepsnh57@gmail.com
                </p>
              </div>
            </div>
            <Toggle checked={emailEnabled} onChange={setEmailEnabled} />
          </div>

          {emailEnabled && (
            <div>
              <p
                className="text-[12px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: textMuted }}
              >
                Frequency
              </p>
              <div className="flex gap-2">
                {(['instant', 'hourly', 'daily'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className="flex-1 py-2 rounded-xl border text-[13px] font-medium capitalize transition-all"
                    style={{
                      borderColor: frequency === f ? '#e11d48' : cardBorder,
                      background:
                        frequency === f
                          ? 'rgba(225,29,72,0.06)'
                          : 'transparent',
                      color: frequency === f ? '#e11d48' : textMuted,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-px" style={{ background: cardBorder }} />

          {/* Slack */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                style={{
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                }}
              >
                <Hash size={14} style={{ color: '#4a154b' }} />
              </div>
              <div>
                <p
                  className="text-[13.5px] font-medium"
                  style={{ color: textPrimary }}
                >
                  Slack notifications
                </p>
                <p
                  className="text-[12.5px] mt-0.5"
                  style={{ color: textMuted }}
                >
                  Send alerts to a Slack channel via webhook.
                </p>
              </div>
            </div>
            <Toggle checked={slackEnabled} onChange={setSlackEnabled} />
          </div>

          {slackEnabled && (
            <div>
              <label
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: textMuted }}
              >
                Slack Webhook URL
              </label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/…"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full rounded-md px-4 py-2.5 text-[13px] outline-none transition-all border"
                style={{
                  background: inputBg,
                  borderColor: inputBorder,
                  color: textPrimary,
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md text-[13px] font-bold text-white transition-all disabled:opacity-70 shadow-sm"
          style={{ background: saved ? '#10b981' : '#6366f1' }}
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <Check size={14} /> Saved!
            </>
          ) : (
            'Save preferences'
          )}
        </button>
      </div>
    </div>
  );
}
