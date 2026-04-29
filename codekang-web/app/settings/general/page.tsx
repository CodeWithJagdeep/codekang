'use client';

import {
  Save,
  Clock,
  Check,
  RefreshCcw,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import {
  fetchOrganizations,
  updateOrganization,
  type IOrganization,
} from '@/lib/auth';

const TIMEZONES = [
  { label: '(GMT-08:00) Los Angeles', value: 'America/Los_Angeles' },
  { label: '(GMT-05:00) New York', value: 'America/New_York' },
  { label: '(GMT+00:00) London', value: 'Europe/London' },
  { label: '(GMT+01:00) Berlin', value: 'Europe/Berlin' },
  { label: '(GMT+05:30) Mumbai', value: 'Asia/Kolkata' },
  { label: '(GMT+08:00) Singapore', value: 'Asia/Singapore' },
  { label: '(GMT+09:00) Tokyo', value: 'Asia/Tokyo' },
];

export default function GeneralSettings() {
  const [org, setOrg] = useState<IOrganization | null>(null);
  const [loading, setLoading] = useState(true);

  // Display name
  const [displayName, setDisplayName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  // Timezone
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [isSavingTz, setIsSavingTz] = useState(false);

  // Visibility
  const [isVisible, setIsVisible] = useState(true);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

  const nameSuccessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchOrganizations()
      .then((orgs) => {
        const personal = orgs.find((o) => o.isPersonal) ?? orgs[0] ?? null;
        if (personal) {
          setOrg(personal);
          setDisplayName(personal.name);
          setTimezone(personal.timezone ?? 'Asia/Kolkata');
          setIsVisible(personal.internalVisibility ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => {
      if (nameSuccessTimer.current) clearTimeout(nameSuccessTimer.current);
    };
  }, []);

  const handleSaveName = async () => {
    if (!org || !displayName.trim()) return;
    setIsSavingName(true);
    setNameError('');
    try {
      const updated = await updateOrganization(org.id, { name: displayName.trim() });
      setOrg(updated);
      setNameSuccess(true);
      nameSuccessTimer.current = setTimeout(() => setNameSuccess(false), 2000);
    } catch (e) {
      setNameError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleTimezoneChange = async (tz: string) => {
    if (!org) return;
    setTimezone(tz);
    setIsSavingTz(true);
    try {
      const updated = await updateOrganization(org.id, { timezone: tz });
      setOrg(updated);
    } catch {
      setTimezone(org.timezone ?? 'Asia/Kolkata');
    } finally {
      setIsSavingTz(false);
    }
  };

  const handleVisibilityToggle = async () => {
    if (!org || isSavingVisibility) return;
    const next = !isVisible;
    setIsVisible(next);
    setIsSavingVisibility(true);
    try {
      const updated = await updateOrganization(org.id, { internalVisibility: next });
      setOrg(updated);
    } catch {
      setIsVisible(!next);
    } finally {
      setIsSavingVisibility(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#27272a] border-t-[#6366f1] rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-[13px] text-[#71717a] py-12 text-center">
        No organization found.
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
          <div className="p-6 space-y-3">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#a1a1aa]">
                Display Name
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 bg-black/20 border border-[#27272a] rounded-md py-2.5 px-4 text-[13px] text-[#f8f8f8] outline-none focus:border-[#6366f1] transition-all"
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName || !displayName.trim()}
                  className="px-6 py-2.5 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 transition-colors text-[13px] font-semibold text-white flex items-center justify-center gap-2"
                >
                  {isSavingName ? (
                    <RefreshCcw size={14} className="animate-spin" />
                  ) : nameSuccess ? (
                    <Check size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {isSavingName ? 'Saving...' : nameSuccess ? 'Saved!' : 'Save changes'}
                </button>
              </div>
              {nameError && (
                <p className="text-[11px] text-red-400">{nameError}</p>
              )}
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
            <div className="flex items-center gap-2">
              {isSavingTz && (
                <RefreshCcw size={12} className="animate-spin text-[#6366f1]" />
              )}
              <select
                value={timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                disabled={isSavingTz}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a2a2a] bg-[#18181b] text-[13px] text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors focus:outline-none focus:border-[#6366f1] disabled:opacity-50 cursor-pointer"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <Clock size={14} className="text-[#52525b]" />
            </div>
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
              onClick={handleVisibilityToggle}
              className={`w-10 h-5 rounded-full relative transition-colors ${isSavingVisibility ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isVisible ? 'bg-[#3b82f6]' : 'bg-[#27272a]'}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all ${isVisible ? 'right-0.5' : 'left-0.5'}`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
