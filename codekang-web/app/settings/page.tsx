'use client';

import {
  Pencil,
  Camera,
  Check,
  X,
  Monitor,
  Moon,
  Sun,
  Trash2,
  ChevronDown,
  Copy,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import Image from 'next/image';

// ── Toast ──

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-[14px] font-medium animate-in slide-in-from-bottom-2 fade-in duration-300 ${
        type === 'success'
          ? 'bg-[#18181b] border-emerald-500/30 text-emerald-400'
          : 'bg-[#18181b] border-red-500/30 text-red-400'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 size={16} />
      ) : (
        <AlertTriangle size={16} />
      )}
      {message}
    </div>
  );
}

// ── Toggle ──

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled ? 'bg-emerald-500' : 'bg-[#3f3f46]'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ── Section wrapper ──

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[15px] font-semibold text-[#f4f4f5]">{title}</h2>
        {description && (
          <p className="text-[13px] text-[#71717a] mt-0.5">{description}</p>
        )}
      </div>
      <div className="rounded-[14px] border border-[#27272a] bg-[#18181b] overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function Row({
  children,
  last = false,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4 ${!last ? 'border-b border-[#27272a]' : ''}`}
    >
      {children}
    </div>
  );
}

function RowLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div>
      <p className="text-[14px] font-medium text-[#f4f4f5]">{label}</p>
      {sub && <p className="text-[13px] text-[#71717a] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Page ──

export default function SettingsProfilePage() {
  const { theme, setTheme } = useTheme();

  // Toast
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') =>
    setToast({ msg, type });

  // Profile
  const [name, setName] = useState('Jagdeep Singh');
  const [tempName, setTempName] = useState(name);
  const [editingName, setEditingName] = useState(false);

  const [username, setUsername] = useState('jagdeep');
  const [tempUsername, setTempUsername] = useState(username);
  const [editingUsername, setEditingUsername] = useState(false);

  const [bio, setBio] = useState(
    'Building CodeKang — AI-powered code review platform.',
  );
  const [tempBio, setTempBio] = useState(bio);
  const [editingBio, setEditingBio] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Commit authoring
  const [authoring, setAuthoring] = useState('Co-authored (KangBot + User)');
  const [authoringOpen, setAuthoringOpen] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    prReview: true,
    bugDetected: true,
    fixSuggested: true,
    agentComplete: true,
    weeklyReport: false,
    securityAlert: true,
  });

  // KangBot preferences
  const [kangbot, setKangbot] = useState({
    autoReview: true,
    autoPatch: false,
    explainFindings: true,
    blockMergeOnCritical: true,
    reviewDrafts: false,
  });

  // Copied user ID
  const [copied, setCopied] = useState(false);
  const copyId = () => {
    navigator.clipboard.writeText('google-auth::uid::kang-2125');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    showToast('Profile picture updated');
  };

  const saveName = () => {
    if (!tempName.trim()) return;
    setName(tempName.trim());
    setEditingName(false);
    showToast('Display name saved');
  };

  const saveUsername = () => {
    if (!tempUsername.trim()) return;
    setUsername(tempUsername.trim());
    setEditingUsername(false);
    showToast('Username updated');
  };

  const saveBio = () => {
    setBio(tempBio);
    setEditingBio(false);
    showToast('Bio saved');
  };

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((p) => {
      const n = { ...p, [key]: !p[key] };
      showToast(`Notification preference saved`);
      return n;
    });

  const toggleKangbot = (key: keyof typeof kangbot) =>
    setKangbot((p) => {
      const n = { ...p, [key]: !p[key] };
      showToast(`KangBot preference saved`);
      return n;
    });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div>
        <h1 className="text-[26px] font-semibold text-[#f4f4f5] tracking-tight">
          Profile
        </h1>
        <p className="text-[14px] text-[#71717a] mt-1">
          Manage your CodeKang account, AI preferences, and notification
          settings.
        </p>
      </div>

      {/* ── User Information ── */}
      <Section
        title="User information"
        description="Your identity on the CodeKang platform."
      >
        {/* Avatar */}
        <Row>
          <RowLabel
            label="Profile picture"
            sub="Shown in reviews, comments, and the dashboard header."
          />
          <div
            className="relative group cursor-pointer w-fit"
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border border-[#3f3f46] group-hover:border-[#3b82f6] transition-all bg-linear-to-br from-[#3b82f6]/30 to-[#8b5cf6]/30 flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-[18px] font-bold text-white/60">JS</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={16} className="text-white" />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </Row>

        {/* Display name */}
        <Row>
          <RowLabel
            label="Display name"
            sub="Used in reviews and team mentions."
          />
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                className="w-[180px] bg-[#121214] border border-[#3b82f6] rounded-lg px-3 py-2 text-[14px] text-[#f4f4f5] outline-none"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
              />
              <button
                onClick={saveName}
                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="p-2 rounded-lg bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempName(name);
                setEditingName(true);
              }}
              className="flex items-center gap-3 bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] transition-all rounded-xl px-4 py-2.5 group w-full sm:w-[200px]"
            >
              <span className="text-[14px] text-[#f4f4f5] font-medium flex-1 text-left">
                {name}
              </span>
              <Pencil
                size={13}
                className="text-[#52525b] group-hover:text-[#a1a1aa] shrink-0"
              />
            </button>
          )}
        </Row>

        {/* Username */}
        <Row>
          <RowLabel label="Username" sub="Your unique @handle on CodeKang." />
          {editingUsername ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#121214] border border-[#3b82f6] rounded-lg overflow-hidden">
                <span className="pl-3 text-[14px] text-[#52525b]">@</span>
                <input
                  autoFocus
                  className="w-[140px] bg-transparent px-2 py-2 text-[14px] text-[#f4f4f5] outline-none"
                  value={tempUsername}
                  onChange={(e) =>
                    setTempUsername(
                      e.target.value.toLowerCase().replace(/\s/g, ''),
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveUsername();
                    if (e.key === 'Escape') setEditingUsername(false);
                  }}
                />
              </div>
              <button
                onClick={saveUsername}
                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => setEditingUsername(false)}
                className="p-2 rounded-lg bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempUsername(username);
                setEditingUsername(true);
              }}
              className="flex items-center gap-3 bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] transition-all rounded-xl px-4 py-2.5 group w-full sm:w-[200px]"
            >
              <span className="text-[14px] text-[#71717a]">@</span>
              <span className="text-[14px] text-[#f4f4f5] font-medium flex-1 text-left">
                {username}
              </span>
              <Pencil
                size={13}
                className="text-[#52525b] group-hover:text-[#a1a1aa] shrink-0"
              />
            </button>
          )}
        </Row>

        {/* Email */}
        <Row>
          <RowLabel
            label="Email address"
            sub="Tied to your Google account. Cannot be changed."
          />
          <span className="text-[14px] text-[#71717a] bg-[#121214] px-4 py-2.5 rounded-xl border border-[#27272a] font-mono">
            jagdeepsnh57@gmail.com
          </span>
        </Row>

        {/* Bio */}
        <Row>
          <RowLabel
            label="Bio"
            sub="A short description shown on your profile."
          />
          {editingBio ? (
            <div className="flex flex-col gap-2 w-full sm:w-[280px]">
              <textarea
                autoFocus
                rows={3}
                className="w-full bg-[#121214] border border-[#3b82f6] rounded-xl px-3 py-2.5 text-[14px] text-[#f4f4f5] outline-none resize-none"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                maxLength={160}
              />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#52525b]">
                  {tempBio.length}/160
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBio(false)}
                    className="px-3 py-1.5 rounded-lg text-[13px] text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBio}
                    className="px-3 py-1.5 rounded-lg bg-[#f4f4f5] text-[#1c1c1c] text-[13px] font-semibold hover:bg-white transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempBio(bio);
                setEditingBio(true);
              }}
              className="flex items-start gap-3 bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] transition-all rounded-xl px-4 py-3 group w-full sm:w-[280px] text-left"
            >
              <span className="text-[14px] text-[#a1a1aa] flex-1 leading-relaxed">
                {bio || 'Add a bio…'}
              </span>
              <Pencil
                size={13}
                className="text-[#52525b] group-hover:text-[#a1a1aa] shrink-0 mt-0.5"
              />
            </button>
          )}
        </Row>

        {/* User ID */}
        <Row last>
          <RowLabel
            label="User ID"
            sub="Your platform identifier for API access."
          />
          <div className="flex items-center gap-2">
            <code className="text-[13px] text-[#52525b] font-mono bg-[#121214] px-3 py-2 rounded-xl border border-[#27272a]">
              google-auth::uid::kang-2125
            </code>
            <button
              onClick={copyId}
              className="p-2 rounded-lg border border-[#27272a] text-[#52525b] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-all"
            >
              {copied ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </Row>
      </Section>

      {/* ── Appearance ── */}
      <Section
        title="Appearance"
        description="Customize how CodeKang looks on your device."
      >
        <Row last>
          <RowLabel
            label="Theme"
            sub="Applies immediately across the entire platform."
          />
          <div className="flex items-center p-1 bg-[#121214] border border-[#27272a] rounded-xl">
            {(
              [
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  showToast(`Theme set to ${t.label}`);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  theme === t.value
                    ? 'bg-[#27272a] text-[#f4f4f5] shadow-sm'
                    : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* ── KangBot AI ── */}
      <Section
        title="KangBot AI"
        description="Control how the AI agent behaves across your repositories."
      >
        {(
          [
            {
              key: 'autoReview',
              label: 'Auto-review PRs',
              sub: 'KangBot reviews every opened pull request automatically.',
            },
            {
              key: 'autoPatch',
              label: 'Auto-patch critical bugs',
              sub: 'Automatically open fix PRs for critical findings.',
            },
            {
              key: 'explainFindings',
              label: 'Explain findings in plain English',
              sub: 'Each finding includes a human-readable explanation and code example.',
            },
            {
              key: 'blockMergeOnCritical',
              label: 'Block merge on critical findings',
              sub: 'Prevent merging PRs that have unresolved critical issues.',
            },
            {
              key: 'reviewDrafts',
              label: 'Review draft PRs',
              sub: 'Include draft pull requests in AI review queue.',
            },
          ] as const
        ).map((item, i, arr) => (
          <Row key={item.key} last={i === arr.length - 1}>
            <RowLabel label={item.label} sub={item.sub} />
            <Toggle
              enabled={kangbot[item.key]}
              onChange={() => toggleKangbot(item.key)}
            />
          </Row>
        ))}
      </Section>

      {/* ── Notifications ── */}
      <Section
        title="Notifications"
        description="Choose what emails and in-app alerts you receive."
      >
        {(
          [
            {
              key: 'prReview',
              label: 'PR review completed',
              sub: 'When KangBot finishes reviewing a pull request.',
            },
            {
              key: 'bugDetected',
              label: 'Bug detected',
              sub: 'When a new bug or vulnerability is found.',
            },
            {
              key: 'fixSuggested',
              label: 'Fix suggestion ready',
              sub: 'When an automated patch PR is opened.',
            },
            {
              key: 'agentComplete',
              label: 'Agent task completed',
              sub: 'When a scheduled or manual agent run finishes.',
            },
            {
              key: 'securityAlert',
              label: 'Security alerts',
              sub: 'Critical security vulnerabilities that need attention.',
            },
            {
              key: 'weeklyReport',
              label: 'Weekly digest',
              sub: 'A summary of AI activity and repository health every Monday.',
            },
          ] as const
        ).map((item, i, arr) => (
          <Row key={item.key} last={i === arr.length - 1}>
            <RowLabel label={item.label} sub={item.sub} />
            <Toggle
              enabled={notifs[item.key]}
              onChange={() => toggleNotif(item.key)}
            />
          </Row>
        ))}
      </Section>

      {/* ── Git ── */}
      <Section
        title="Git configuration"
        description="Configure how KangBot authors commits and pull requests."
      >
        <Row last>
          <RowLabel
            label="Commit authoring"
            sub="Attribution for AI-generated commits and fix PRs."
          />
          <div className="relative">
            <button
              onClick={() => setAuthoringOpen((v) => !v)}
              className="flex items-center gap-3 bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] transition-all rounded-xl px-4 py-2.5 w-full sm:w-[240px]"
            >
              <span className="text-[14px] text-[#f4f4f5] flex-1 text-left">
                {authoring}
              </span>
              <ChevronDown size={14} className="text-[#52525b] shrink-0" />
            </button>
            {authoringOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setAuthoringOpen(false)}
                />
                <div className="absolute right-0 top-12 w-[260px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {[
                    'Co-authored (KangBot + User)',
                    'KangBot only',
                    'User only',
                    'Custom author…',
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAuthoring(opt);
                        setAuthoringOpen(false);
                        showToast('Git authoring preference saved');
                      }}
                      className={`w-full text-left px-4 py-3 text-[14px] transition-colors flex items-center justify-between ${
                        authoring === opt
                          ? 'text-[#f4f4f5] bg-white/5'
                          : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/3'
                      }`}
                    >
                      {opt}
                      {authoring === opt && (
                        <Check size={14} className="text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </Row>
      </Section>

      {/* ── Connected accounts ── */}
      <Section
        title="Connected accounts"
        description="External services linked to your CodeKang account."
      >
        <Row>
          <RowLabel
            label="GitHub"
            sub="Required for repository access and PR reviews."
          />
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-[13px] text-emerald-400">
              <CheckCircle2 size={14} />
              Connected as @jagdeep
            </span>
            <button className="px-3 py-1.5 rounded-lg text-[13px] text-[#71717a] border border-[#27272a] hover:text-red-400 hover:border-red-500/30 transition-all">
              Disconnect
            </button>
          </div>
        </Row>
        <Row>
          <RowLabel
            label="Bitbucket"
            sub="Connect to enable Bitbucket repository reviews."
          />
          <button
            onClick={() => showToast('Bitbucket OAuth coming soon', 'error')}
            className="px-4 py-2 rounded-xl bg-[#27272a] text-[14px] font-medium text-[#a1a1aa] hover:bg-[#3f3f46] transition-all"
          >
            Connect
          </button>
        </Row>
        <Row last>
          <RowLabel
            label="GitLab"
            sub="Connect to enable GitLab repository reviews."
          />
          <button
            onClick={() => showToast('GitLab OAuth coming soon', 'error')}
            className="px-4 py-2 rounded-xl bg-[#27272a] text-[14px] font-medium text-[#a1a1aa] hover:bg-[#3f3f46] transition-all"
          >
            Connect
          </button>
        </Row>
      </Section>

      {/* ── Danger zone ── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-[15px] font-semibold text-red-400">
            Danger zone
          </h2>
          <p className="text-[13px] text-[#71717a] mt-0.5">
            Irreversible actions. Proceed with caution.
          </p>
        </div>
        <div className="rounded-[14px] border border-red-500/20 bg-red-500/3 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4 border-b border-red-500/10">
            <div>
              <p className="text-[14px] font-medium text-[#f4f4f5]">
                Delete all AI data
              </p>
              <p className="text-[13px] text-[#71717a] mt-0.5">
                Permanently removes all KangBot findings, logs, and fix history.
              </p>
            </div>
            <button
              onClick={() =>
                showToast(
                  'Please confirm from the email we just sent you',
                  'error',
                )
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/25 text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all shrink-0"
            >
              <Trash2 size={14} />
              Delete AI data
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4">
            <div>
              <p className="text-[14px] font-medium text-[#f4f4f5]">
                Delete account
              </p>
              <p className="text-[13px] text-[#71717a] mt-0.5">
                Permanently delete your account and all associated data. This
                cannot be undone.
              </p>
            </div>
            <button
              onClick={() =>
                showToast(
                  'Confirmation email sent to jagdeepsnh57@gmail.com',
                  'error',
                )
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-[13px] font-semibold text-red-400 hover:bg-red-500/20 transition-all shrink-0"
            >
              <Trash2 size={14} />
              Delete account
            </button>
          </div>
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
