'use client';

import {
  Pencil,
  Camera,
  Check,
  X,
  Monitor,
  Moon,
  Sun,
  GitBranch,
  Bell,
  Bot,
  GitFork,
  Shield,
  Trash2,
  ChevronDown,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  GitMerge,
  MessageSquare,
  Bug,
  Layout,
  Settings,
  AtSign,
  User,
  Mail,
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
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
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
  className = '',
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div>
        <h2 className="text-[17px] font-bold text-[#f4f4f5] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-[14px] text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="rounded-2xl border border-[#27272a] bg-[#1c1c1c] overflow-hidden shadow-sm">
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
      className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4 ${!last ? 'border-b border-[#27272a]' : ''}`}
    >
      {children}
    </div>
  );
}

function RowLabel({
  label,
  sub,
  icon: Icon,
}: {
  label: string;
  sub?: string;
  icon?: any;
}) {
  return (
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
          <Icon size={18} />
        </div>
      )}
      <div>
        <p className="text-[14.5px] font-semibold text-[#f4f4f5]">{label}</p>
        {sub && <p className="text-[13px] text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Page ──

export default function SettingsProfilePage() {
  const { theme, setTheme, resolved } = useTheme();
  const L = resolved === 'light';

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

  // KangBot preferences
  const [kangbot, setKangbot] = useState({
    autoReview: true,
    autoPatch: false,
    explainFindings: true,
    blockMergeOnCritical: true,
    reviewDrafts: false,
  });

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

  const toggleKangbot = (key: keyof typeof kangbot) =>
    setKangbot((p) => {
      const n = { ...p, [key]: !p[key] };
      showToast('KangBot preference saved');
      return n;
    });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* ── Page Title ── */}
      <div>
        <h1 className="text-[28px] font-bold text-[#f4f4f5] tracking-tight">
          Personal Profile
        </h1>
        <p className="text-[14px] text-zinc-500 mt-1">
          Manage your identity, AI preferences, and developer experience.
        </p>
      </div>

      {/* ── Profile Header Card (The "User Info Panel") ── */}
      <div className="relative group overflow-hidden rounded-[24px] border border-zinc-800 bg-[#1c1c1c] shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 via-purple-600/5 to-transparent opacity-50" />

        <div className="relative px-8 py-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Section */}
          <div className="relative shrink-0">
            <div
              className="w-32 h-32 rounded-[28px] p-1 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl cursor-pointer hover:scale-105 transition-transform"
              onClick={() => fileRef.current?.click()}
            >
              <div className="w-full h-full rounded-[24px] bg-[#111113] overflow-hidden border-2 border-black flex items-center justify-center relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[32px] font-black text-white/80">
                    JS
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
                <h2 className="text-[28px] font-bold text-white tracking-tight">
                  {name}
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                  <CheckCircle2 size={12} /> Verified
                </div>
              </div>
              <div className="flex items-center gap-1 text-[15px] text-zinc-500 font-medium justify-center md:justify-start">
                <AtSign size={15} />
                <span>{username}</span>
              </div>
            </div>

            <p className="text-[15px] text-white/70 max-w-xl leading-relaxed italic">
              &quot;{bio || 'No bio yet — click edit to add one.'}&quot;
            </p>

            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => setEditingBio(true)}
                className="px-5 py-2 rounded-xl bg-white text-black text-[13px] font-bold hover:bg-zinc-200 transition-all active:scale-95"
              >
                Edit Profile
              </button>
              <button
                className="px-5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-[13px] font-bold hover:bg-zinc-700 transition-all active:scale-95 border border-zinc-700"
                onClick={() =>
                  navigator.clipboard.writeText('google-auth::2125')
                }
              >
                Copy ID
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── User Information Fields ── */}
      <Section title="Identity Details" description="Your core account data.">
        <Row>
          <RowLabel
            label="Display Name"
            sub="How you appear across CodeKang."
            icon={User}
          />
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                className="w-full sm:w-[220px] bg-[#111113] border border-blue-500/50 rounded-xl px-4 py-2.5 text-[14px] text-white outline-none ring-4 ring-blue-500/5"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
              <button
                onClick={saveName}
                className="p-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempName(name);
                setEditingName(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-800/20 text-[14px] text-white font-medium flex items-center gap-3 transition-all min-w-[140px]"
            >
              <span className="flex-1 text-left">{name}</span>
              <Pencil size={14} className="text-zinc-500" />
            </button>
          )}
        </Row>
        <Row>
          <RowLabel
            label="Email Address"
            sub="Synced with Google."
            icon={Mail}
          />
          <span className="text-[14px] text-zinc-400 font-mono bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-800/50">
            jagdeepsnh57@gmail.com
          </span>
        </Row>
        <Row last>
          <RowLabel
            label="Bio / Headline"
            sub="Max 160 characters."
            icon={MessageSquare}
          />
          {editingBio ? (
            <div className="w-full sm:w-[280px] space-y-2">
              <textarea
                autoFocus
                className="w-full bg-[#111113] border border-blue-500/50 rounded-xl px-4 py-3 text-[14px] text-white outline-none resize-none"
                rows={3}
                maxLength={160}
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingBio(false)}
                  className="px-4 py-1.5 rounded-lg text-zinc-500 text-[13px] font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBio}
                  className="px-4 py-1.5 rounded-lg bg-white text-black text-[13px] font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempBio(bio);
                setEditingBio(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-800/20 text-[14px] text-white font-medium flex items-center gap-3 transition-all sm:max-w-[300px]"
            >
              <span className="flex-1 text-left truncate">
                {bio || 'Write a bio...'}
              </span>
              <Pencil size={14} className="text-zinc-500" />
            </button>
          )}
        </Row>
      </Section>

      {/* ── KangBot AI Section (Vibrant Enhancements) ── */}
      <Section
        title="KangBot AI Agent"
        description="Configure how the autonomous reviewer behaves."
      >
        <div className="divide-y divide-zinc-800">
          {(
            [
              {
                key: 'autoReview',
                icon: Bot,
                label: 'Autonomous Reviewing',
                sub: 'Trigger AI reviews on every PR opening / update.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                key: 'autoPatch',
                icon: Sparkles,
                label: 'Self-Healing (Auto-Patch)',
                sub: 'Automatically generate fix PRs for critical vulnerabilities.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                key: 'explainFindings',
                icon: MessageSquare,
                label: 'Natural Language Logic',
                sub: 'Explain technical findings using simplified conversational English.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
              {
                key: 'blockMergeOnCritical',
                icon: Shield,
                label: 'Security Guardrail',
                sub: 'Block merges if KangBot detects unresolved critical issues.',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
              },
            ] as const
          ).map((item, i, arr) => (
            <div
              key={item.key}
              className="px-6 py-6 flex items-center justify-between gap-4 group hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} border border-white/5 flex items-center justify-center ${item.color} shrink-0 shadow-inner group-hover:scale-110 transition-transform`}
                >
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white tracking-tight">
                    {item.label}
                  </p>
                  <p className="text-[13px] text-zinc-500 mt-1 max-w-md">
                    {item.sub}
                  </p>
                </div>
              </div>
              <Toggle
                enabled={kangbot[item.key as keyof typeof kangbot]}
                onChange={() => toggleKangbot(item.key as any)}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <div className="pt-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-[18px] font-bold text-red-400">Danger Zone</h3>
            <p className="text-[13.5px] text-red-400/60 mt-1">
              Permanently delete your account and all associated AI logs.
            </p>
          </div>
          <button
            className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-black hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
            onClick={() =>
              showToast('Check your email to confirm deletion', 'error')
            }
          >
            DELETE ACCOUNT
          </button>
        </div>
      </div>

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
