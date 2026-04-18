'use client';

import { Pencil, ChevronDown } from 'lucide-react';

export default function SettingsProfilePage() {
  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-8">Profile</h1>

      {/* ── User Information ── */}
      <section>
        <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-3">
          User information
        </h2>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden">
          {/* Profile Picture */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
            <span className="text-[13px] text-[#e8e8e8] font-medium">
              Profile picture
            </span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2a2e] flex items-center justify-center border border-[#333]">
              <span className="text-xs text-white/50">JS</span>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
            <span className="text-[13px] text-[#e8e8e8] font-medium">
              Email
            </span>
            <span className="text-[13px] text-[#a1a1aa]">
              jagdeepsnh57@gmail.com
            </span>
          </div>

          {/* User ID */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
            <div>
              <div className="text-[13px] text-[#e8e8e8] font-medium mb-0.5">
                User ID
              </div>
              <div className="text-[11.5px] text-[#6d6d6d]">
                Your unique user identifier for API usage
              </div>
            </div>
            <span className="text-[13px] text-[#a1a1aa] bg-black/20 px-2 py-0.5 rounded border border-[#2a2a2a]">
              google-oauth2|116577196312470502125
            </span>
          </div>

          {/* Preferred Name */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-[13px] text-[#e8e8e8] font-medium mb-0.5">
                Preferred name
              </div>
              <div className="text-[11.5px] text-[#6d6d6d]">
                Preferred name for your profile
              </div>
            </div>
            <button className="flex items-center justify-between w-[160px] bg-white/4 border border-[#2a2a2a] hover:bg-white/8 transition-colors rounded-md px-3 py-1.5">
              <span className="text-[13px] text-[#e8e8e8]">Jagdeep singh</span>
              <Pencil size={12} className="text-[#a1a1aa]" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Appearance ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-0.5">
            Appearance
          </h2>
          <p className="text-[12px] text-[#6d6d6d]">
            Customize how CodeKang looks on your device.
          </p>
        </div>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-[13px] text-[#e8e8e8] font-medium mb-0.5">
                Theme
              </div>
              <div className="text-[11.5px] text-[#6d6d6d]">
                Select your preferred color theme
              </div>
            </div>
            <button className="flex items-center justify-between w-[120px] bg-white/4 border border-[#2a2a2a] hover:bg-white/8 transition-colors rounded-md px-3 py-1.5">
              <span className="text-[13px] text-[#e8e8e8]">System</span>
              <ChevronDown
                size={14}
                className="text-[#a1a1aa]"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ── Git ── */}
      <section>
        <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-3">Git</h2>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-[13px] text-[#e8e8e8] font-medium mb-0.5">
                Commit authoring
              </div>
              <div className="text-[11.5px] text-[#6d6d6d]">
                Set the author and committer for KangBot&apos;s git commits.
              </div>
            </div>
            <button className="flex items-center justify-between w-[220px] bg-white/4 border border-[#2a2a2a] hover:bg-white/8 transition-colors rounded-md px-3 py-1.5">
              <span className="text-[13px] text-[#e8e8e8]">
                Co-authored (KangBot + User)
              </span>
              <ChevronDown
                size={14}
                className="text-[#a1a1aa]"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
