'use client';

import { useState } from 'react';
import { X, Loader2, Building2 } from 'lucide-react';
import { createOrganization, type IOrganization } from '@/lib/auth';

export default function CreateOrgModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (org: IOrganization) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!slugTouched) setSlug(toSlug(val));
  }

  function handleSlugChange(val: string) {
    setSlugTouched(true);
    setSlug(toSlug(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const org = await createOrganization({ name: name.trim(), slug, description: description.trim() || undefined });
      onCreated(org);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  }

  const slugValid = /^[a-z0-9-]+$/.test(slug) && slug.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[440px] rounded-2xl shadow-2xl"
        style={{ background: '#18181b', border: '1px solid #27272a' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid #27272a' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.1)' }}
            >
              <Building2 size={16} style={{ color: '#f8423b' }} />
            </div>
            <h2 className="text-[15px] font-semibold" style={{ color: '#e8e8e8' }}>
              Create Organization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#71717a' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-[13px]" style={{ color: '#71717a' }}>
            Organizations let you group repositories from any GitHub account into a shared workspace.
          </p>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium" style={{ color: '#a1a1aa' }}>
              Organization name
            </label>
            <input
              type="text"
              placeholder="e.g. Addensure"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={50}
              className="w-full px-3 py-2 rounded-lg border text-[14px] outline-none transition-colors"
              style={{
                background: '#121214',
                borderColor: '#27272a',
                color: '#e8e8e8',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#f8423b')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#27272a')}
              autoFocus
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium" style={{ color: '#a1a1aa' }}>
              URL slug
            </label>
            <div
              className="flex items-center rounded-lg border overflow-hidden"
              style={{ background: '#121214', borderColor: '#27272a' }}
            >
              <span
                className="px-3 py-2 text-[13px] shrink-0 border-r"
                style={{ color: '#52525b', borderColor: '#27272a' }}
              >
                codekang.com/
              </span>
              <input
                type="text"
                placeholder="my-org"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                maxLength={50}
                className="flex-1 px-3 py-2 bg-transparent text-[14px] outline-none"
                style={{ color: '#e8e8e8' }}
              />
            </div>
            {slug && !slugValid && (
              <p className="text-[11px]" style={{ color: '#f87171' }}>
                Only lowercase letters, numbers, and hyphens
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium" style={{ color: '#a1a1aa' }}>
              Description{' '}
              <span style={{ color: '#52525b' }}>(optional)</span>
            </label>
            <textarea
              placeholder="What is this organization for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border text-[14px] outline-none transition-colors resize-none"
              style={{
                background: '#121214',
                borderColor: '#27272a',
                color: '#e8e8e8',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#f8423b')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#27272a')}
            />
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-[13px]"
              style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#f87171' }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-white/5 disabled:opacity-50"
              style={{ borderColor: '#27272a', color: '#a1a1aa' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !slugValid}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#f8423b', color: '#fff' }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
