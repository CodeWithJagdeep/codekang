'use client';

import {
  Smartphone,
  Key,
  Monitor,
  Globe,
  LogOut,
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

// ── Types ──

interface Session {
  id: string;
  device: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

// ── Data ──

const SESSIONS: Session[] = [
  {
    id: 's1',
    device: 'Chrome on Linux',
    os: 'Linux',
    location: 'Bangalore, IN',
    ip: '103.21.45.67',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: 's2',
    device: 'Safari on iPhone',
    os: 'iOS',
    location: 'Bangalore, IN',
    ip: '103.21.45.68',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 's3',
    device: 'Chrome on Windows',
    os: 'Win',
    location: 'Mumbai, IN',
    ip: '49.205.18.211',
    lastActive: '3 days ago',
    isCurrent: false,
  },
  {
    id: 's4',
    device: 'VS Code Extension',
    os: 'Linux',
    location: 'Bangalore, IN',
    ip: '103.21.45.69',
    lastActive: '5 days ago',
    isCurrent: false,
  },
];

// ── Section wrapper ──

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';

  return (
    <section
      className="rounded-md border overflow-hidden"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <div className="px-6 py-5 border-b" style={{ borderColor: cardBorder }}>
        <h2
          className="text-[14px] font-semibold"
          style={{ color: textPrimary }}
        >
          {title}
        </h2>
        {desc && (
          <p className="text-[13px] mt-0.5" style={{ color: textMuted }}>
            {desc}
          </p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ── Toggle row ──

function ToggleRow({
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
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium" style={{ color: textPrimary }}>
          {label}
        </p>
        {desc && (
          <p className="text-[12.5px] mt-0.5" style={{ color: textMuted }}>
            {desc}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ${checked ? 'bg-emerald-500' : 'bg-[#3f3f46]'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

// ── Page ──

export default function SecurityPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';
  const textDim = L ? '#9aa0a6' : '#555';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const inputBg = L ? '#f4f5f7' : '#111113';
  const inputBorder = L ? '#d8dadd' : '#2e2e2e';

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeAll, setRevokeAll] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPw, setSavingPw] = useState(false);
  const [savedPw, setSavedPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleRevokeSession = (id: string) => {
    setRevokingId(id);
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setRevokingId(null);
    }, 900);
  };

  const handleRevokeAll = () => {
    setRevokeAll(true);
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setRevokeAll(false);
    }, 1200);
  };

  const handlePwSave = () => {
    if (!pwForm.current) {
      setPwError('Current password is required.');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwError('');
    setSavingPw(true);
    setTimeout(() => {
      setSavingPw(false);
      setSavedPw(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setSavedPw(false), 2500);
    }, 1400);
  };

  const inputCls =
    'w-full rounded-md px-4 py-2.5 text-[13px] outline-none transition-all border';

  const pwStrength = (() => {
    const p = pwForm.next;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', color: '#ef4444', w: '25%' };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/\d/.test(p))
      return { label: 'Fair', color: '#f59e0b', w: '55%' };
    return { label: 'Strong', color: '#10b981', w: '100%' };
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div>
        <h1
          className="text-[24px] font-bold tracking-tight"
          style={{ color: textPrimary }}
        >
          Security
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>
          Protect your account with two-factor authentication and manage active
          sessions.
        </p>
      </div>

      {/* Two-factor auth */}
      <Section
        title="Two-factor authentication"
        desc="Add an extra layer of security to your account."
      >
        <div className="space-y-5">
          <ToggleRow
            label="Enable 2FA via Authenticator App"
            desc="Use Google Authenticator, Authy, or any TOTP app."
            checked={twoFAEnabled}
            onChange={(v) => {
              setTwoFAEnabled(v);
              if (v) setShowQR(true);
              else setShowQR(false);
            }}
          />

          {twoFAEnabled && showQR && (
            <div
              className="rounded-md border p-5 space-y-4"
              style={{ background: inputBg, borderColor: inputBorder }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-[100px] h-[100px] rounded-xl flex items-center justify-center shrink-0 border"
                  style={{ background: '#fff', borderColor: cardBorder }}
                >
                  {/* Mock QR */}
                  <svg width="80" height="80" viewBox="0 0 10 10">
                    {[0, 1, 3, 4, 6, 7, 9].map((x) =>
                      [0, 1, 3, 4, 6, 7, 9].map((y) =>
                        Math.abs(x - 5) + Math.abs(y - 5) !== 0 &&
                        (x + y) % 2 === 0 ? (
                          <rect
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            width="1"
                            height="1"
                            fill="#111"
                          />
                        ) : null,
                      ),
                    )}
                    <rect
                      x="0"
                      y="0"
                      width="3"
                      height="3"
                      fill="none"
                      stroke="#111"
                      strokeWidth="0.3"
                    />
                    <rect
                      x="7"
                      y="0"
                      width="3"
                      height="3"
                      fill="none"
                      stroke="#111"
                      strokeWidth="0.3"
                    />
                    <rect
                      x="0"
                      y="7"
                      width="3"
                      height="3"
                      fill="none"
                      stroke="#111"
                      strokeWidth="0.3"
                    />
                    <rect x="1" y="1" width="1" height="1" fill="#111" />
                    <rect x="8" y="1" width="1" height="1" fill="#111" />
                    <rect x="1" y="8" width="1" height="1" fill="#111" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p
                    className="text-[13.5px] font-semibold mb-1"
                    style={{ color: textPrimary }}
                  >
                    Scan with your authenticator app
                  </p>
                  <p
                    className="text-[12.5px] mb-3"
                    style={{ color: textMuted }}
                  >
                    Or enter this key manually:
                  </p>
                  <code
                    className="text-[12px] font-mono px-3 py-1.5 rounded-lg border select-all"
                    style={{
                      background: cardBg,
                      borderColor: cardBorder,
                      color: textPrimary,
                      letterSpacing: '0.1em',
                    }}
                  >
                    JBSW Y3DP EHPK 3PXP
                  </code>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowQR(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-bold text-white transition-all shadow-sm"
                  style={{ background: '#6366f1' }}
                >
                  <Check size={14} /> I&apos;ve set it up
                </button>
                <button
                  onClick={() => {
                    setTwoFAEnabled(false);
                    setShowQR(false);
                  }}
                  className="px-4 py-2 rounded-md border text-[13px] font-medium transition-all"
                  style={{ borderColor: cardBorder, color: textMuted }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="h-px" style={{ background: cardBorder }} />
          <ToggleRow
            label="Login alerts via email"
            desc="Get notified when a new device signs into your account."
            checked={loginAlerts}
            onChange={setLoginAlerts}
          />
        </div>
      </Section>

      {/* Change password */}
      <Section
        title="Change password"
        desc="Use a strong, unique password for your CodeKang account."
      >
        <div className="space-y-4">
          {(['current', 'next', 'confirm'] as const).map((key) => {
            const labels = {
              current: 'Current password',
              next: 'New password',
              confirm: 'Confirm new password',
            };
            return (
              <div key={key}>
                <label
                  className="block text-[12px] font-medium mb-1.5"
                  style={{ color: textMuted }}
                >
                  {labels[key]}
                </label>
                <div className="relative">
                  <input
                    type={showPw[key] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={(e) => {
                      setPwForm((p) => ({ ...p, [key]: e.target.value }));
                      setPwError('');
                    }}
                    placeholder="••••••••"
                    className={inputCls}
                    style={{
                      background: inputBg,
                      borderColor: inputBorder,
                      color: textPrimary,
                      paddingRight: '2.75rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: textDim }}
                  >
                    {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {key === 'next' && pwStrength && (
                  <div className="mt-2 space-y-1">
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: inputBorder }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: pwStrength.w,
                          background: pwStrength.color,
                        }}
                      />
                    </div>
                    <p
                      className="text-[11.5px] font-medium"
                      style={{ color: pwStrength.color }}
                    >
                      {pwStrength.label}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {pwError && (
            <div
              className="flex items-center gap-2 p-3 rounded-md border"
              style={{
                background: 'rgba(239,68,68,0.06)',
                borderColor: 'rgba(239,68,68,0.2)',
              }}
            >
              <AlertTriangle size={13} className="text-red-400 shrink-0" />
              <p className="text-[12.5px] text-red-400">{pwError}</p>
            </div>
          )}

          <button
            onClick={handlePwSave}
            disabled={savingPw || savedPw}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-[13px] font-bold text-white transition-all disabled:opacity-70 shadow-sm"
            style={{ background: savedPw ? '#10b981' : '#6366f1' }}
          >
            {savingPw ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Updating…
              </>
            ) : savedPw ? (
              <>
                <Check size={14} /> Updated!
              </>
            ) : (
              'Update password'
            )}
          </button>
        </div>
      </Section>

      {/* Active sessions */}
      <Section
        title="Active sessions"
        desc="Devices currently signed in to your account."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 p-4 rounded-md border transition-all"
                style={{
                  background: inputBg,
                  borderColor: inputBorder,
                  opacity: revokingId === s.id ? 0.4 : 1,
                }}
              >
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 font-bold border text-[11px]"
                  style={{
                    background: cardBg,
                    borderColor: cardBorder,
                    color: textDim,
                  }}
                >
                  {s.os === 'iOS' ? 'iOS' : s.os === 'Win' ? 'WIN' : 'LIN'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-[13.5px] font-semibold truncate"
                      style={{ color: textPrimary }}
                    >
                      {s.device}
                    </p>
                    {s.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        This device
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span
                      className="flex items-center gap-1 text-[12px]"
                      style={{ color: textDim }}
                    >
                      <Globe size={11} /> {s.location}
                    </span>
                    <span className="text-[12px]" style={{ color: textDim }}>
                      · {s.ip}
                    </span>
                    <span className="text-[12px]" style={{ color: textDim }}>
                      · {s.lastActive}
                    </span>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    disabled={revokingId === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12px] font-medium transition-all disabled:opacity-50"
                    style={{ borderColor: cardBorder, color: textMuted }}
                  >
                    {revokingId === s.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <LogOut size={12} />
                    )}
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>

          {sessions.filter((s) => !s.isCurrent).length > 0 && (
            <button
              onClick={handleRevokeAll}
              disabled={revokeAll}
              className="flex items-center gap-2 text-[13px] font-medium transition-colors disabled:opacity-50"
              style={{ color: '#e11d48' }}
            >
              {revokeAll ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <LogOut size={13} />
              )}
              Revoke all other sessions
            </button>
          )}
        </div>
      </Section>
    </div>
  );
}
