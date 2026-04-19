'use client';

import {
  UserPlus,
  Shield,
  MoreVertical,
  Mail,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';
import { useState } from 'react';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'AI Agent';
  status: 'Active' | 'Pending';
  avatar: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Jagdeep Singh',
      email: 'jagdeepsnh57@gmail.com',
      role: 'Owner',
      status: 'Active',
      avatar: 'JS',
    },
    {
      id: '2',
      name: 'KangBot',
      email: 'ai@codekang.com',
      role: 'AI Agent',
      status: 'Active',
      avatar: 'KB',
    },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inviteMember = () => {
    if (!inviteEmail) return;
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'Member',
      status: 'Pending',
      avatar: inviteEmail[0].toUpperCase(),
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8e8]">Members</h1>
          <p className="text-[14px] text-[#71717a] mt-1">
            Manage who has access to your CodeKang organization.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] transition-colors text-[13px] font-semibold text-white flex items-center justify-center gap-2"
        >
          <UserPlus size={14} />
          Invite member
        </button>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]"
            size={14}
          />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 pl-9 pr-3 text-[13px] text-[#e8e8e8] outline-none focus:border-[#3f3f46] transition-all"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] text-[13px] text-[#71717a] hover:text-[#e8e8e8] transition-all">
          Role: Any
          <ChevronDown size={14} />
        </button>
      </div>

      {/* ── Members List ── */}
      <section>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden">
          {/* Header (Desktop only) */}
          <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-[#2a2a2a] bg-white/2">
            <div className="col-span-6 text-[11px] font-bold text-[#52525b] uppercase tracking-widest">
              User
            </div>
            <div className="col-span-3 text-[11px] font-bold text-[#52525b] uppercase tracking-widest">
              Role
            </div>
            <div className="col-span-2 text-[11px] font-bold text-[#52525b] uppercase tracking-widest">
              Status
            </div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-[#2a2a2a]">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 hover:bg-white/1 transition-colors"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  {/* User Column */}
                  <div className="col-span-6 w-full flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2a2a2a] to-[#1a1a1c] border border-[#3f3f46] flex items-center justify-center text-[11px] font-bold text-white/50 shrink-0">
                      {member.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#e8e8e8] truncate">
                        {member.name}
                      </p>
                      <p className="text-[11.5px] text-[#6d6d6d] truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Role & Status (Mobile row) */}
                  <div className="w-full md:hidden flex items-center justify-between text-[12px] pt-2 border-t border-white/5">
                    <div
                      className={`flex items-center gap-1.5 ${member.role === 'Owner' ? 'text-purple-400' : 'text-[#a1a1aa]'}`}
                    >
                      <Shield size={12} />
                      {member.role}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${member.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      {member.status}
                    </div>
                  </div>

                  {/* Desktop Role & Status */}
                  <div className="hidden md:block md:col-span-3">
                    <div
                      className={`flex items-center gap-1.5 text-[12px] ${member.role === 'Owner' ? 'text-purple-400' : 'text-[#a1a1aa]'}`}
                    >
                      <Shield
                        size={12}
                        className={
                          member.role === 'Owner'
                            ? 'text-purple-400'
                            : 'text-[#71717a]'
                        }
                      />
                      {member.role}
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-2">
                    <span
                      className={`text-[12px] flex items-center gap-1.5 ${member.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      {member.status}
                    </span>
                  </div>
                  <div className="hidden md:flex md:col-span-1 justify-end">
                    <button className="p-1 text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Invite Member Modal ── */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsInviteModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-[#e8e8e8]">
                Invite Team Member
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#71717a] hover:text-[#e8e8e8]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#71717a]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52525b]"
                    size={14}
                  />
                  <input
                    autoFocus
                    placeholder="teammate@example.com"
                    className="w-full bg-[#18181b] border border-[#2a2a2a] rounded-xl px-4 pl-10 py-2.5 text-[13px] outline-none focus:border-[#3b82f6] transition-colors"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#71717a]">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-left transition-all">
                    <p className="text-[12px] font-bold text-[#e8e8e8]">
                      Member
                    </p>
                    <p className="text-[10px] text-[#71717a]">
                      Can read and review
                    </p>
                  </button>
                  <button className="p-3 rounded-xl border border-[#2a2a2a] bg-[#18181b] text-left opacity-50">
                    <p className="text-[12px] font-medium text-[#e8e8e8]">
                      Admin
                    </p>
                    <p className="text-[10px] text-[#71717a]">
                      Full workspace control
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#2a2a2a] bg-transparent hover:bg-[#27272a] text-[13px] font-medium text-[#e8e8e8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={inviteMember}
                disabled={!inviteEmail}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-bold text-white transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State Indicator ── */}
      <section className="pt-6">
        <div className="rounded-xl border border-dashed border-[#2a2a2a] p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4 text-[#52525b]">
            <Mail size={20} />
          </div>
          <h3 className="text-[15px] font-semibold text-[#f4f4f5] mb-2">
            Collaboration is better
          </h3>
          <p className="text-[13px] text-[#71717a] max-w-sm">
            Invite your teammates to start building better together with
            AI-powered reviews.
          </p>
        </div>
      </section>
    </div>
  );
}
