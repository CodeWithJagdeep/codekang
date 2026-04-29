'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function RequestIntegrationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    toolName: '',
    category: 'Source Control',
    priority: 'Medium',
    useCase: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-[#f4f4f5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 animate-bounce">
          <Sparkles size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-[22px] font-semibold text-[#f4f4f5] mb-2">Request Received!</h1>
        <p className="text-[14px] text-[#71717a] max-w-xs leading-relaxed mb-8">
          Thanks for helping us improve CodeKang. We will review your request for <span className="text-[#f4f4f5] font-semibold">{formData.toolName}</span>.
        </p>
        <button
          onClick={() => router.push('/dashboard/integrations')}
          className="px-5 py-2.5 rounded-xl bg-[#1f1f22] hover:bg-[#27272a] border border-[#27272a] text-[13px] font-medium text-[#f4f4f5] transition-all flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Back to Integrations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-[#f4f4f5] px-6 md:px-8 pt-8 pb-12 flex flex-col items-center">
      <div className="w-full max-w-[500px]">
        <button
          onClick={() => router.push('/dashboard/integrations')}
          className="flex items-center gap-2 text-[13px] text-[#71717a] hover:text-[#f4f4f5] transition-colors mb-8 group self-start"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Integrations
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Zap size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-[#f4f4f5]">Request an Integration</h1>
            <p className="text-[13px] text-[#71717a] mt-0.5">Tell us which tool your team needs next.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#161618] border border-[#1f1f22] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div>
            <label htmlFor="toolName" className="block text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Tool Name
            </label>
            <input
              type="text"
              id="toolName"
              required
              value={formData.toolName}
              onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
              placeholder="e.g. Linear, Notion, Datadog"
              className="w-full px-4 py-3 bg-[#1f1f22] border border-[#27272a] rounded-xl text-[14px] text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] transition-all"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-[#1f1f22] border border-[#27272a] rounded-xl text-[14px] text-[#f4f4f5] focus:outline-none focus:border-[#3f3f46] transition-all appearance-none"
            >
              <option value="Source Control">Source Control</option>
              <option value="Communication">Communication</option>
              <option value="Productivity">Productivity</option>
              <option value="Observation">Observation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`py-2.5 rounded-xl text-[13px] font-medium border transition-all ${formData.priority === p
                      ? 'bg-[#1f1f22] border-[#3f3f46] text-[#f4f4f5]'
                      : 'bg-transparent border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="useCase" className="block text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              How will your team use this?
            </label>
            <textarea
              id="useCase"
              rows={4}
              required
              value={formData.useCase}
              onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
              placeholder="Describe the workflow you want to automate…"
              className="w-full px-4 py-3 bg-[#1f1f22] border border-[#27272a] rounded-xl text-[14px] text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-semibold text-[14px] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting…</>
            ) : (
              <><CheckCircle2 size={16} /> Submit Request</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
