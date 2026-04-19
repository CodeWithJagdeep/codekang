'use client';

import {
  KeyRound, Plus, Copy, Eye, EyeOff, Trash2, Loader2,
  Check, AlertTriangle, X, ShieldCheck, Clock,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

// ── Types ──

type Scope = 'read:reviews' | 'write:reviews' | 'read:repos' | 'write:repos' | 'read:agents' | 'run:agents' | 'webhooks';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: Scope[];
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  revoked: boolean;
}

// ── Data ──

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'k1',
    name: 'CI/CD Pipeline',
    prefix: 'ck_live_xK9p',
    scopes: ['read:reviews', 'write:reviews', 'read:repos'],
    createdAt: 'Apr 1, 2025',
    lastUsed: '2 hours ago',
    expiresAt: null,
    revoked: false,
  },
  {
    id: 'k2',
    name: 'VS Code Extension',
    prefix: 'ck_live_mN2q',
    scopes: ['read:reviews', 'read:repos'],
    createdAt: 'Mar 15, 2025',
    lastUsed: 'Yesterday',
    expiresAt: 'Sep 15, 2025',
    revoked: false,
  },
];

const ALL_SCOPES: { id: Scope; label: string; desc: string }[] = [
  { id: 'read:reviews',  label: 'Read reviews',   desc: 'Read PR reviews and comments' },
  { id: 'write:reviews', label: 'Write reviews',  desc: 'Post review comments and statuses' },
  { id: 'read:repos',    label: 'Read repos',     desc: 'List connected repositories' },
  { id: 'write:repos',   label: 'Write repos',    desc: 'Connect or disconnect repositories' },
  { id: 'read:agents',   label: 'Read agents',    desc: 'View agent status and history' },
  { id: 'run:agents',    label: 'Run agents',     desc: 'Trigger agent runs programmatically' },
  { id: 'webhooks',      label: 'Webhooks',       desc: 'Manage incoming webhook endpoints' },
];

function randomKey(prefix: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return prefix + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Create Modal ──

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (key: ApiKey, full: string) => void;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg      = L ? '#ffffff' : '#18181b';
  const cardBorder  = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111'    : '#f8f8f8';
  const textMuted   = L ? '#5f6368' : '#909090';
  const textDim     = L ? '#9aa0a6' : '#555';
  const inputBg     = L ? '#f4f5f7' : '#111113';
  const inputBorder = L ? '#d8dadd' : '#2e2e2e';

  const [name, setName]             = useState('');
  const [scopes, setScopes]         = useState<Set<Scope>>(new Set(['read:reviews', 'read:repos']));
  const [expiry, setExpiry]         = useState<'never' | '30d' | '90d' | '1y'>('never');
  const [creating, setCreating]     = useState(false);

  const toggleScope = (s: Scope) => setScopes(prev => {
    const n = new Set(prev); if (n.has(s)) n.delete(s); else n.add(s); return n;
  });

  const handleCreate = () => {
    if (!name.trim() || scopes.size === 0) return;
    setCreating(true);
    setTimeout(() => {
      const prefix = 'ck_live_' + name.replace(/\s/g, '').slice(0, 4);
      const full = randomKey(prefix);
      const expiryMap = { never: null, '30d': '30 days', '90d': '90 days', '1y': '1 year' };
      onCreate(
        {
          id: `k${Date.now()}`,
          name: name.trim(),
          prefix: prefix + '…',
          scopes: [...scopes],
          createdAt: 'Just now',
          lastUsed: null,
          expiresAt: expiryMap[expiry],
          revoked: false,
        },
        full
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-[520px] rounded-2xl border shadow-2xl animate-in zoom-in-95 fade-in duration-200" style={{ background: cardBg, borderColor: cardBorder }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: cardBorder }}>
          <div>
            <h3 className="text-[16px] font-bold" style={{ color: textPrimary }}>Create API key</h3>
            <p className="text-[12.5px] mt-0.5" style={{ color: textMuted }}>Keys are shown once. Store them securely.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: textDim }}><X size={17} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: textMuted }}>Key name</label>
            <input
              type="text"
              placeholder="e.g. CI/CD Pipeline"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none border"
              style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
            />
          </div>

          {/* Scopes */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: textMuted }}>Permissions</label>
            <div className="space-y-1.5">
              {ALL_SCOPES.map(s => (
                <label key={s.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all" style={{ borderColor: scopes.has(s.id) ? 'rgba(225,29,72,0.3)' : inputBorder, background: scopes.has(s.id) ? 'rgba(225,29,72,0.04)' : 'transparent' }}>
                  <div
                    className="w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all"
                    style={{ background: scopes.has(s.id) ? '#e11d48' : 'transparent', borderColor: scopes.has(s.id) ? '#e11d48' : inputBorder }}
                    onClick={() => toggleScope(s.id)}
                  >
                    {scopes.has(s.id) && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className="flex-1" onClick={() => toggleScope(s.id)}>
                    <p className="text-[13px] font-medium" style={{ color: textPrimary }}>{s.label}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: textMuted }}>{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: textMuted }}>Expiration</label>
            <div className="grid grid-cols-4 gap-2">
              {(['never', '30d', '90d', '1y'] as const).map(e => (
                <button
                  key={e}
                  onClick={() => setExpiry(e)}
                  className="py-2 rounded-xl border text-[13px] font-medium transition-all"
                  style={{
                    borderColor: expiry === e ? 'rgba(225,29,72,0.35)' : inputBorder,
                    background: expiry === e ? 'rgba(225,29,72,0.06)' : 'transparent',
                    color: expiry === e ? '#e11d48' : textMuted,
                  }}
                >
                  {e === 'never' ? 'No expiry' : e === '30d' ? '30 days' : e === '90d' ? '90 days' : '1 year'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-[13px] font-medium" style={{ borderColor: cardBorder, color: textMuted }}>Cancel</button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || scopes.size === 0}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#e11d48' }}
            >
              {creating ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : 'Create key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reveal Modal ──

function RevealModal({ fullKey, onClose }: { fullKey: string; onClose: () => void }) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg     = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111'   : '#f8f8f8';
  const textMuted  = L ? '#5f6368' : '#909090';
  const inputBg    = L ? '#f4f5f7' : '#111113';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-[480px] rounded-2xl border shadow-2xl animate-in zoom-in-95 fade-in duration-200 p-6 space-y-5" style={{ background: cardBg, borderColor: cardBorder }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold" style={{ color: textPrimary }}>API key created</h3>
            <p className="text-[12.5px] mt-0.5" style={{ color: textMuted }}>Copy it now — it won't be shown again.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ background: inputBg, borderColor: cardBorder }}>
          <code className="flex-1 text-[12px] font-mono break-all" style={{ color: textPrimary }}>{fullKey}</code>
          <button onClick={handleCopy} className="p-2 rounded-lg shrink-0 transition-colors" style={{ color: copied ? '#10b981' : textMuted }}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={13} className="shrink-0 text-amber-400" />
          <p className="text-[12.5px] text-amber-400">Store this key securely. If lost, you'll need to create a new one.</p>
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ background: '#e11d48' }}>
          Done
        </button>
      </div>
    </div>
  );
}

// ── Page ──

export default function ApiKeysPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111'    : '#f8f8f8';
  const textMuted   = L ? '#5f6368' : '#909090';
  const textDim     = L ? '#9aa0a6' : '#555';
  const cardBg      = L ? '#ffffff' : '#18181b';
  const cardBorder  = L ? '#e2e4e7' : '#27272a';
  const inputBg     = L ? '#f4f5f7' : '#111113';

  const [keys, setKeys]             = useState(INITIAL_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [revealKey, setRevealKey]   = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [showFull, setShowFull]     = useState<Set<string>>(new Set());

  const handleCreate = (key: ApiKey, full: string) => {
    setKeys(prev => [key, ...prev]);
    setShowCreate(false);
    setRevealKey(full);
  };

  const handleRevoke = (id: string) => {
    setRevokingId(id);
    setTimeout(() => {
      setKeys(prev => prev.filter(k => k.id !== id));
      setRevokingId(null);
    }, 900);
  };

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: textPrimary }}>API Keys</h1>
          <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>Programmatic access to CodeKang's API for CI/CD, extensions, and automation.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
          style={{ background: '#e11d48' }}
        >
          <Plus size={15} /> New key
        </button>
      </div>

      {/* Keys list */}
      <section className="rounded-2xl border overflow-hidden" style={{ background: cardBg, borderColor: cardBorder }}>
        {keys.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: inputBg }}>
              <KeyRound size={20} style={{ color: textDim }} />
            </div>
            <p className="text-[14px] font-medium" style={{ color: textMuted }}>No API keys yet</p>
            <p className="text-[13px]" style={{ color: textDim }}>Create a key to integrate CodeKang with external tools.</p>
          </div>
        )}

        {keys.map((key, i) => {
          const isShown = showFull.has(key.id);
          return (
            <div
              key={key.id}
              className={`p-5 transition-all ${i < keys.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: cardBorder, opacity: revokingId === key.id ? 0.4 : 1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: inputBg, border: `1px solid ${cardBorder}` }}>
                    <KeyRound size={15} style={{ color: textDim }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold" style={{ color: textPrimary }}>{key.name}</p>
                      {key.expiresAt && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium" style={{ color: textDim, borderColor: cardBorder }}>
                          <Clock size={10} /> Expires {key.expiresAt}
                        </span>
                      )}
                    </div>

                    {/* Key prefix / full */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-[12px] font-mono" style={{ color: textMuted }}>
                        {isShown ? key.prefix.replace('…', '••••••••••••••') : key.prefix + '••••••••••••••••••••'}
                      </code>
                      <button onClick={() => setShowFull(p => { const n = new Set(p); if (n.has(key.id)) n.delete(key.id); else n.add(key.id); return n; })} className="p-0.5" style={{ color: textDim }}>
                        {isShown ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>

                    {/* Scopes */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {key.scopes.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full border text-[11px] font-medium" style={{ color: textMuted, borderColor: cardBorder, background: inputBg }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    disabled={revokingId === key.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all disabled:opacity-50"
                    style={{ borderColor: cardBorder, color: textMuted }}
                  >
                    {revokingId === key.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Revoke
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: cardBorder }}>
                <span className="text-[12px]" style={{ color: textDim }}>Created {key.createdAt}</span>
                <span className="text-[12px]" style={{ color: textDim }}>
                  {key.lastUsed ? `Last used ${key.lastUsed}` : 'Never used'}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Docs tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.15)' }}>
        <ShieldCheck size={14} className="shrink-0 mt-0.5 text-blue-400" />
        <p className="text-[13px] text-blue-400">
          Pass your key in the <code className="font-mono text-[12px]">Authorization: Bearer &lt;key&gt;</code> header. See the <span className="underline cursor-pointer">API reference</span> for endpoints and rate limits.
        </p>
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {revealKey  && <RevealModal fullKey={revealKey} onClose={() => setRevealKey(null)} />}
    </div>
  );
}
