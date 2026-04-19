'use client';

import {
  Trash2,
  Save,
  Clock,
  Archive,
  AlertTriangle,
  Check,
  RefreshCcw,
} from 'lucide-react';
import { useState } from 'react';

export default function GeneralSettings() {
  const [siteName, setSiteName] = useState('CodeKang Internal');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[#f8f8f8]">General</h1>
        <p className="text-[14px] text-[#909090] mt-1">
          Configure your organization&apos;s primary settings and visibility.
        </p>
      </div>

      {/* ── Organization Profile ── */}
      <section>
        <h2 className="text-[14px] font-bold text-[#f8f8f8] mb-4">
          Organization Display
        </h2>
        <div className="rounded-md border border-[#27272a] bg-[#18181b] overflow-hidden shadow-lg shadow-black/20">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#a1a1aa]">
                Display Name
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="flex-1 bg-black/20 border border-[#27272a] rounded-md py-2.5 px-4 text-[13px] text-[#f8f8f8] outline-none focus:border-[#6366f1] transition-all"
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 transition-colors text-[13px] font-semibold text-white flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <RefreshCcw size={14} className="animate-spin" />
                  ) : showSuccess ? (
                    <Check size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {isSaving
                    ? 'Saving...'
                    : showSuccess
                      ? 'Saved!'
                      : 'Save changes'}
                </button>
              </div>
              <p className="text-[11px] text-[#52525b]">
                This name will be shown in the sidebar and navigation header.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Preferences ── */}
      <section>
        <h2 className="text-[14px] font-bold text-[#f8f8f8] mb-4">
          Preferences
        </h2>
        <div className="rounded-md border border-[#27272a] bg-[#18181b] overflow-hidden shadow-lg shadow-black/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-[#2a2a2a] gap-4">
            <div>
              <p className="text-[13px] text-[#e8e8e8] font-medium">
                Default Timezone
              </p>
              <p className="text-[11.5px] text-[#6d6d6d] mt-0.5">
                Used for session logs and scheduled maintenance.
              </p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a2a2a] bg-black/20 text-[13px] text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors w-fit">
              <Clock size={14} />
              (GMT+05:30) Mumbai
            </button>
          </div>
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-[13px] text-[#e8e8e8] font-medium">
                Internal Visibility
              </p>
              <p className="text-[11.5px] text-[#6d6d6d] mt-0.5">
                Allow all team members to see agent activity in this org.
              </p>
            </div>
            <div
              onClick={() => setIsVisible(!isVisible)}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isVisible ? 'bg-[#3b82f6]' : 'bg-[#27272a]'}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all ${isVisible ? 'right-0.5' : 'left-0.5'}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="pt-8">
        <h2 className="text-[14px] font-bold text-red-500 mb-4 flex items-center gap-2">
          <AlertTriangle size={15} />
          Danger Zone
        </h2>
        <div className="rounded-xl border border-red-500/20 bg-red-500/2 overflow-hidden shadow-lg shadow-red-900/5">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[13px] text-[#f4f4f5] font-semibold">
                Archive Organization
              </p>
              <p className="text-[11.5px] text-[#71717a] mt-0.5">
                Temporarily disable all agents and pause billing.
              </p>
            </div>
            <button className="px-6 py-2 rounded-md border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all text-[13px] font-semibold flex items-center justify-center gap-2">
              Archive
            </button>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-t border-red-500/10 gap-4">
            <div>
              <p className="text-[13px] text-[#f4f4f5] font-semibold">
                Delete Organization
              </p>
              <p className="text-[11.5px] text-[#71717a] mt-0.5">
                Permanently remove all organization data, agents, and
                integrations. This cannot be undone.
              </p>
            </div>
            <button className="px-6 py-2 rounded-md bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-[13px] font-bold flex items-center justify-center gap-2">
              Delete organization
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
