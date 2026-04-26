'use client';

import {
  UserPlus, Shield, MoreVertical, Mail, Search, ChevronDown,
  X, Trash2, Edit2, Check, Loader2, ShieldCheck, ShieldAlert,
  User, Send, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import {
  fetchOrganizations,
  fetchOrgMembers,
  inviteOrgMember,
  removeOrgMember,
  updateOrgMemberRole,
  type IOrganizationMember,
} from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

type Role = 'Owner' | 'Admin' | 'Member' | 'AI Agent';
type Status = 'Active' | 'Pending';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  avatar: string;
}

function mapBackendMember(m: IOrganizationMember): Member {
  let role: Role = 'Member';
  if (m.role === 'owner') role = 'Owner';
  if (m.role === 'admin') role = 'Admin';

  const email = m.email ?? `user-${m.userId.substring(0, 5)}@codekang.com`;
  const name = m.displayName ?? (m.email ? m.email.split('@')[0] : `User ${m.userId.substring(0, 5)}`);
  const avatar = name.charAt(0).toUpperCase();

  return {
    id: m.id,
    name,
    email,
    role,
    status: m.status === 'pending' ? 'Pending' : 'Active',
    avatar,
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    Owner: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    Admin: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    Member: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
    'AI Agent': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };
  const Icon =
    role === 'Owner' ? ShieldAlert
    : role === 'Admin' ? ShieldCheck
    : role === 'AI Agent' ? Shield
    : User;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${styles[role]}`}>
      <Icon size={12} />
      {role}
    </div>
  );
}

function Toast({ message, type, onDismiss }: { message: string; type: 'error' | 'success'; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-[13.5px] font-semibold animate-in slide-in-from-bottom-2 duration-300 ${type === 'error' ? 'bg-red-950 border border-red-500/30 text-red-300' : 'bg-emerald-950 border border-emerald-500/30 text-emerald-300'}`}>
      {type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted   = L ? '#5f6368' : '#a1a1aa';
  const cardBg      = L ? '#ffffff' : '#18181b';
  const cardBorder  = L ? '#e2e4e7' : '#27272a';

  const [orgId, setOrgId]       = useState<string | null>(null);
  const [members, setMembers]   = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole]   = useState<'Admin' | 'Member'>('Member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast]       = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'success') => setToast({ message, type });

  const loadMembers = async (oid: string) => {
    const raw = await fetchOrgMembers(oid);
    setMembers(raw.map(mapBackendMember));
  };

  useEffect(() => {
    fetchOrganizations()
      .then((orgs) => {
        if (orgs.length > 0) {
          const id = orgs[0].id;
          setOrgId(id);
          return loadMembers(id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMembers = useMemo(() =>
    members.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  [members, searchQuery]);

  // ── Invite ────────────────────────────────────────────────────────────────

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !orgId) return;
    setIsSubmitting(true);
    try {
      const created = await inviteOrgMember(orgId, newEmail, newRole === 'Admin' ? 'admin' : 'member');
      setMembers([mapBackendMember(created), ...members]);
      setNewEmail('');
      setIsInviteOpen(false);
      showToast(`Invitation sent to ${newEmail}`);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to send invite', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Remove ────────────────────────────────────────────────────────────────

  const handleRemove = async (member: Member) => {
    if (!orgId) return;
    if (!confirm(`Remove ${member.name} from this workspace?`)) return;
    try {
      await removeOrgMember(orgId, member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      showToast(`${member.name} has been removed`);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to remove member', 'error');
    }
  };

  // ── Update Role ───────────────────────────────────────────────────────────

  const handleUpdateRole = async (memberId: string, displayRole: Role) => {
    if (!orgId || displayRole === 'Owner' || displayRole === 'AI Agent') return;
    const role = displayRole === 'Admin' ? 'admin' : 'member';
    try {
      const updated = await updateOrgMemberRole(orgId, memberId, role);
      setMembers((prev) => prev.map((m) => m.id === memberId ? mapBackendMember(updated) : m));
      setEditingId(null);
      showToast('Role updated successfully');
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to update role', 'error');
      setEditingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: textPrimary }}>
            Workspace Members
          </h1>
          <p className="text-[14px] mt-1" style={{ color: textMuted }}>
            Manage your team, roles, and AI agent permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => orgId && loadMembers(orgId)}
            className="p-2.5 rounded-md border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setIsInviteOpen(true)}
            disabled={!orgId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed text-[13.5px] font-bold text-white transition-all shadow-lg shadow-indigo-500/10"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Members',   value: members.length,                                    color: 'text-blue-400' },
          { label: 'Active Now',      value: members.filter((m) => m.status === 'Active').length, color: 'text-emerald-400' },
          { label: 'Pending Invites', value: members.filter((m) => m.status === 'Pending').length, color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-md border bg-[#18181b] shadow-sm" style={{ borderColor: cardBorder }}>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111113] border border-[#27272a] rounded-md py-3 pl-11 pr-4 text-[13.5px] text-[#f8f8f8] outline-none focus:border-[#6366f1] transition-all"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 rounded-md bg-[#111113] border border-[#27272a] text-[13.5px] text-[#909090] hover:border-[#6366f1] transition-all">
          Sort by: Recent <ChevronDown size={14} />
        </button>
      </div>

      {/* Members Table */}
      <div className="rounded-md border shadow-2xl overflow-hidden" style={{ background: cardBg, borderColor: cardBorder }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-white/2" style={{ borderColor: cardBorder }}>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40">Member</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Loader2 size={24} className="animate-spin text-zinc-600 mx-auto mb-3" />
                    <p className="text-[13px] text-zinc-500">Loading members...</p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 && searchQuery === '' ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-600">
                      <UserPlus size={20} />
                    </div>
                    <p className="text-[14px] font-semibold text-zinc-300 mb-1">No members yet</p>
                    <p className="text-[13px] text-zinc-500 mb-4">Invite your first teammate to get started.</p>
                    <button
                      onClick={() => setIsInviteOpen(true)}
                      className="px-5 py-2 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-[13px] font-bold text-white transition-all"
                    >
                      Invite Member
                    </button>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-600">
                      <Search size={20} />
                    </div>
                    <p className="text-[14px] font-medium text-zinc-400">No members found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="group hover:bg-white/1 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-[13px] font-bold text-white shadow-inner">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold" style={{ color: textPrimary }}>{member.name}</p>
                          <p className="text-[12px]" style={{ color: textMuted }}>{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === member.id && member.role !== 'Owner' ? (
                        <select
                          autoFocus
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value as Role)}
                          onBlur={() => setEditingId(null)}
                          className="bg-[#111113] border border-white/20 rounded-lg px-2 py-1 text-[12px] outline-none text-white font-bold"
                        >
                          <option>Admin</option>
                          <option>Member</option>
                        </select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${member.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                        {member.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {member.role !== 'Owner' && (
                          <>
                            <button
                              onClick={() => setEditingId(member.id)}
                              className="p-2 rounded-lg hover:bg-white/5 text-[#71717a] hover:text-white transition-all"
                              title="Edit role"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleRemove(member)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-[#71717a] hover:text-red-400 transition-all"
                              title="Remove member"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                      <button className="md:hidden p-2 text-[#71717a]">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsInviteOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#18181b] border border-[#27272a] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
                <p className="text-[13px] text-zinc-400 mt-1">Send an invitation to join your CodeKang workspace.</p>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input
                    autoFocus
                    type="email"
                    placeholder="teammate@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#111113] border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-[14px] text-white outline-none focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pl-1">
                  Select Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['Member', 'Admin'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewRole(role)}
                      className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${newRole === role ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-transparent border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <span className={`text-[13.5px] font-bold ${newRole === role ? 'text-white' : 'text-zinc-200'}`}>
                        {role}
                      </span>
                      <span className={`text-[11px] mt-1 ${newRole === role ? 'text-blue-100' : 'text-zinc-500'}`}>
                        {role === 'Admin' ? 'Full workspace access & control' : 'Standard project-level permissions'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border border-zinc-800 text-[14px] font-bold text-zinc-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl bg-white text-black text-[14px] font-bold hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <><Send size={16} className="rotate-45" /> Send Invitation</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
