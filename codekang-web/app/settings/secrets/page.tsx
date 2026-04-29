'use client';

import {
  Eye,
  EyeOff,
  Plus,
  MoreHorizontal,
  Trash2,
  Lock,
  ExternalLink,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useState } from 'react';

type Secret = {
  id: string;
  name: string;
  value: string;
  updatedAt: string;
};

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([
    {
      id: '1',
      name: 'GITHUB_ACCESS_TOKEN',
      value: 'ghp_39281039821039821039821039',
      updatedAt: '2 days ago',
    },
    {
      id: '2',
      name: 'SENTRY_AUTH_TOKEN',
      value: 'sntry_910283910283910283910283',
      updatedAt: '5 days ago',
    },
    {
      id: '3',
      name: 'AWS_ACCESS_KEY_ID',
      value: 'AKIA0392810392810392',
      updatedAt: '12 days ago',
    },
  ]);

  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSecret, setNewSecret] = useState({ name: '', value: '' });

  const toggleVisibility = (id: string) => {
    const next = new Set(visibleIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleIds(next);
  };

  const deleteSecret = (id: string) => {
    setSecrets(secrets.filter((s) => s.id !== id));
  };

  const addSecret = () => {
    if (!newSecret.name || !newSecret.value) return;
    const item: Secret = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSecret.name.toUpperCase(),
      value: newSecret.value,
      updatedAt: 'Just now',
    };
    setSecrets([item, ...secrets]);
    setNewSecret({ name: '', value: '' });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8e8]">Secrets</h1>
          <p className="text-[14px] text-[#71717a] mt-1">
            Manage environment variables and sensitive credentials for your
            agents.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] transition-colors text-[13px] font-semibold text-white flex items-center gap-2 shadow-lg shadow-blue-500/10"
        >
          <Plus size={14} />
          Add secret
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <ShieldAlert size={16} className="text-amber-500 shrink-0" />
        <p className="text-[12px] text-amber-500/80">
          Secrets are encrypted at rest and never returned in plain text once
          saved.
        </p>
      </div>

      {/* ── Secrets List ── */}
      <section>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden">
          {secrets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#27272a] flex items-center justify-center mx-auto mb-4">
                <Lock size={20} className="text-[#52525b]" />
              </div>
              <p className="text-[13px] text-[#71717a]">
                No secrets added yet.
              </p>
            </div>
          ) : (
            secrets.map((secret, i) => (
              <div
                key={secret.id}
                className={`p-5 flex items-center justify-between group hover:bg-white/1 transition-colors ${
                  i !== secrets.length - 1 ? 'border-b border-[#2a2a2a]' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#71717a]">
                    <Lock size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] text-[#e8e8e8] font-mono font-medium truncate">
                        {secret.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#52525b]">
                      <span className="font-mono">
                        {visibleIds.has(secret.id)
                          ? secret.value
                          : '••••••••••••••••••••'}
                      </span>
                      <span>·</span>
                      <span>Updated {secret.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleVisibility(secret.id)}
                    className="p-2 rounded-lg hover:bg-[#27272a] text-[#71717a] hover:text-[#e8e8e8] transition-all"
                  >
                    {visibleIds.has(secret.id) ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSecret(secret.id)}
                    className="p-2 rounded-lg hover:bg-[#27272a] text-[#71717a] hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button className="hidden sm:block p-2 rounded-lg hover:bg-[#27272a] text-[#71717a] hover:text-[#e8e8e8] transition-all">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Add Secret Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-[#e8e8e8]">
                Add Secret
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#71717a] hover:text-[#e8e8e8]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#71717a]">
                  Name
                </label>
                <input
                  autoFocus
                  placeholder="e.g. GITHUB_TOKEN"
                  className="w-full bg-[#18181b] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#3b82f6] transition-colors"
                  value={newSecret.name}
                  onChange={(e) =>
                    setNewSecret({ ...newSecret, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#71717a]">
                  Value
                </label>
                <textarea
                  placeholder="Paste your secret here"
                  className="w-full bg-[#18181b] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#3b82f6] transition-colors h-24 resize-none"
                  value={newSecret.value}
                  onChange={(e) =>
                    setNewSecret({ ...newSecret, value: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#2a2a2a] bg-transparent hover:bg-[#27272a] text-[13px] font-medium text-[#e8e8e8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSecret}
                disabled={!newSecret.name || !newSecret.value}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-bold text-white transition-colors"
              >
                Add Secret
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="pt-6 border-t border-[#2a2a2a]/40">
        <a
          href="/settings/support"
          className="text-[12px] text-[#71717a] hover:text-[#f4f4f5] transition-colors flex items-center gap-1.5"
        >
          Learn how to use secrets in your CodeKang playbooks
          <ExternalLink size={12} />
        </a>
      </footer>
    </div>
  );
}
