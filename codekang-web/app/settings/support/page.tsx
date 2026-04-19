'use client';

import {
  LifeBuoy,
  MessageSquare,
  BookOpen,
  Mail,
  ChevronRight,
  X,
  Send,
  Check,
  Star,
  Clock,
  AlertCircle,
  Trash2,
  ChevronLeft,
} from 'lucide-react';
import { SiGithub, SiX } from 'react-icons/si';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import Link from 'next/link';

// ── Types ──

type TicketStatus = 'open' | 'pending' | 'resolved';

interface Message {
  id: string;
  author: 'user' | 'agent';
  content: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  rating?: number;
  feedback?: string;
}

// ── Mock Data ──

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-1001',
    subject: 'Issue with GitHub Action trigger',
    category: 'Integrations',
    status: 'pending',
    priority: 'high',
    createdAt: '2 hours ago',
    updatedAt: '30 mins ago',
    messages: [
      {
        id: 'm1',
        author: 'user',
        content:
          'My PRs are not triggering the scan automatically since yesterday.',
        timestamp: '2 hours ago',
      },
      {
        id: 'm2',
        author: 'agent',
        content:
          'Hi Jagdeep! I checked your logs. It seems the webhook secret was rotated. Could you please verify the token in your GitHub settings?',
        timestamp: '30 mins ago',
      },
    ],
  },
  {
    id: 'T-982',
    subject: 'Billing question regarding Professional plan',
    category: 'Billing',
    status: 'resolved',
    priority: 'medium',
    createdAt: '3 days ago',
    updatedAt: '2 days ago',
    messages: [
      {
        id: 'm3',
        author: 'user',
        content: 'I was double charged for this month. Can you check?',
        timestamp: '3 days ago',
      },
      {
        id: 'm4',
        author: 'agent',
        content:
          'Apologies for the inconvenience. I have issued a refund for the duplicate charge. It should reflect in 3-5 days.',
        timestamp: '2 days ago',
      },
    ],
    rating: 5,
    feedback: 'Very fast response, thank you!',
  },
];

// ── Page ──

export default function SupportPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#a1a1aa';
  const textDim = L ? '#9aa0a6' : '#6d6d6d';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const inputBg = L ? '#f4f5f7' : '#111113';

  const [view, setView] = useState<'landing' | 'list' | 'details' | 'create'>(
    'landing',
  );
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTicket = tickets.find((t) => t.id === activeId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeTicket?.messages]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const subject = (form.elements.namedItem('subject') as HTMLInputElement)
      .value;
    const category = (form.elements.namedItem('category') as HTMLSelectElement)
      .value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement)
      .value;

    setTimeout(() => {
      const newTicket: Ticket = {
        id: `T-${Math.floor(1000 + Math.random() * 9000).toString()}`,
        subject,
        category,
        status: 'open',
        priority: 'medium',
        createdAt: 'Just now',
        updatedAt: 'Just now',
        messages: [
          {
            id: Date.now().toString(),
            author: 'user',
            content: message,
            timestamp: 'Just now',
          },
        ],
      };
      setTickets([newTicket, ...tickets]);
      setIsSubmitting(false);
      setActiveId(newTicket.id);
      setView('details');
    }, 1000);
  };

  const handleSendReply = () => {
    if (!reply.trim() || !activeId) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      author: 'user',
      content: reply,
      timestamp: 'Just now',
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, newMsg], updatedAt: 'Just now' }
          : t,
      ),
    );
    setReply('');
  };

  const handleResolve = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'resolved' as TicketStatus } : t,
      ),
    );
  };

  const handleFeedback = (id: string, rating: number, feedback: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, rating, feedback } : t)),
    );
  };

  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-[13px] font-medium mb-6 hover:translate-x-[-4px] transition-transform"
          style={{ color: textMuted }}
        >
          <ChevronLeft size={16} /> Back to Support
        </button>
        <div
          className="rounded-3xl border p-8 space-y-6 shadow-2xl"
          style={{ background: cardBg, borderColor: cardBorder }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: textPrimary }}>
              Create Support Ticket
            </h2>
            <p className="text-[14px] mt-1" style={{ color: textMuted }}>
              Please provide as much detail as possible so we can help you
              faster.
            </p>
          </div>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  className="text-[12px] font-bold uppercase tracking-wider pl-1"
                  style={{ color: textDim }}
                >
                  Category
                </label>
                <select
                  name="category"
                  className="w-full bg-[#111113] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[13.5px] outline-none focus:border-blue-500 transition-all text-[#e8e8e8]"
                >
                  <option>Integrations</option>
                  <option>Billing</option>
                  <option>Technical Issue</option>
                  <option>Account</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  className="text-[12px] font-bold uppercase tracking-wider pl-1"
                  style={{ color: textDim }}
                >
                  Priority
                </label>
                <select
                  name="priority"
                  className="w-full bg-[#111113] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[13.5px] outline-none focus:border-blue-500 transition-all text-[#e8e8e8]"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-[12px] font-bold uppercase tracking-wider pl-1"
                style={{ color: textDim }}
              >
                Subject
              </label>
              <input
                name="subject"
                placeholder="What can we help you with?"
                className="w-full bg-[#111113] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[13.5px] outline-none focus:border-blue-500 transition-all text-[#e8e8e8]"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[12px] font-bold uppercase tracking-wider pl-1"
                style={{ color: textDim }}
              >
                Detailed Message
              </label>
              <textarea
                name="message"
                placeholder="Describe your issue..."
                className="w-full bg-[#111113] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[13.5px] outline-none focus:border-blue-500 transition-all text-[#e8e8e8] h-40 resize-none"
                required
              />
            </div>
            <button
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all text-[14px] font-bold text-white shadow-lg shadow-blue-500/10 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Clock className="animate-spin" size={16} /> Submitting...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Ticket
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'details' && activeTicket) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-[13px] font-medium hover:translate-x-[-4px] transition-transform"
            style={{ color: textMuted }}
          >
            <ChevronLeft size={16} /> Back to Tickets
          </button>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                activeTicket.status === 'open'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : activeTicket.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}
            >
              {activeTicket.status}
            </span>
            {activeTicket.status !== 'resolved' && (
              <button
                onClick={() => handleResolve(activeTicket.id)}
                className="text-[12px] font-bold text-emerald-400 hover:underline"
              >
                Mark as Resolved
              </button>
            )}
          </div>
        </div>

        <div
          className="flex-1 rounded-3xl border flex flex-col overflow-hidden shadow-2xl"
          style={{ background: cardBg, borderColor: cardBorder }}
        >
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: cardBorder }}
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                className="text-[17px] font-bold truncate"
                style={{ color: textPrimary }}
              >
                {activeTicket.subject}
              </h2>
              <span className="text-[12px] shrink-0" style={{ color: textDim }}>
                ID: {activeTicket.id}
              </span>
            </div>
            <p className="text-[13px] mt-1" style={{ color: textMuted }}>
              Category:{' '}
              <span className="font-semibold">{activeTicket.category}</span> ·
              Started {activeTicket.createdAt}
            </p>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar backdrop-blur-3xl"
            style={{ background: 'rgba(0,0,0,0.01)' }}
          >
            {activeTicket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.author === 'user'
                      ? 'bg-[#2563eb] text-white rounded-tr-none'
                      : 'bg-[#111113] border border-[#2a2a2a] text-[#e8e8e8] rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                      {msg.author === 'user' ? 'You' : 'Support Specialist'}
                    </span>
                    <span className="text-[10px] opacity-60">
                      · {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {activeTicket.status === 'resolved' && (
              <div className="py-8 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3 text-blue-400">
                  <Check size={24} />
                </div>
                <h3
                  className="text-[15px] font-bold"
                  style={{ color: textPrimary }}
                >
                  Ticket Resolved
                </h3>
                <p
                  className="text-[12.5px] mt-1 mb-5"
                  style={{ color: textMuted }}
                >
                  This conversation has been closed. How did we do?
                </p>

                {activeTicket.rating ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          fill={s <= activeTicket.rating! ? '#60a5fa' : 'none'}
                          className={
                            s <= activeTicket.rating!
                              ? 'text-blue-400'
                              : 'text-[#333]'
                          }
                        />
                      ))}
                    </div>
                    {activeTicket.feedback && (
                      <p
                        className="text-[13px] italic"
                        style={{ color: textMuted }}
                      >
                        &quot;{activeTicket.feedback}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="max-w-xs mx-auto space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleFeedback(activeTicket.id, s, '')}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={24}
                            className="text-[#333] hover:text-blue-400"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTicket.status !== 'resolved' && (
            <div
              className="p-4 border-t"
              style={{ borderColor: cardBorder, background: inputBg }}
            >
              <div className="relative">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full bg-[#18181b] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-[13.5px] outline-none focus:border-blue-500/50 transition-all overflow-hidden resize-none min-h-[100px] text-[#e8e8e8]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[11px] mt-2 ml-1" style={{ color: textDim }}>
                Press Enter to send reply
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: textPrimary }}
          >
            Support
          </h1>
          <p className="text-[14px] mt-1" style={{ color: textMuted }}>
            Manage your tickets and browse resources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="px-5 py-2.5 rounded-md border text-[13px] font-bold transition-all hover:bg-white/5"
            style={{ borderColor: cardBorder, color: textPrimary }}
          >
            View My Tickets
          </button>
          <button
            onClick={() => setView('create')}
            className="px-5 py-2.5 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-[13px] font-bold text-white transition-all shadow-lg shadow-indigo-500/10"
          >
            Create Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setView('create')}
          className="group flex items-start gap-4 p-6 rounded-md border bg-linear-to-br from-[#18181b] to-[#18181b] hover:to-indigo-500/5 transition-all text-left"
          style={{ borderColor: cardBorder }}
        >
          <div className="w-12 h-12 rounded-md bg-[#6366f1]/10 flex items-center justify-center shrink-0 text-[#6366f1] group-hover:scale-110 transition-transform">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3
              className="text-[15px] font-bold"
              style={{ color: textPrimary }}
            >
              Start Live Chat
            </h3>
            <p className="text-[12.5px] mt-1" style={{ color: textMuted }}>
              Average response:{' '}
              <span className="text-emerald-400 font-semibold">
                Under 5 mins
              </span>
            </p>
          </div>
        </button>
        <button
          className="group flex items-start gap-4 p-6 rounded-md border bg-[#18181b] hover:bg-[#252529] transition-all text-left"
          style={{ borderColor: cardBorder }}
        >
          <div className="w-12 h-12 rounded-md bg-[#6366f1]/10 flex items-center justify-center shrink-0 text-[#6366f1] group-hover:scale-110 transition-transform">
            <Mail size={22} />
          </div>
          <div>
            <h3
              className="text-[15px] font-bold"
              style={{ color: textPrimary }}
            >
              Enterprise Support
            </h3>
            <p className="text-[12.5px] mt-1" style={{ color: textMuted }}>
              Dedicated account manager for your team.
            </p>
          </div>
        </button>
      </div>

      {view === 'list' && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-400">
          <div className="flex items-center justify-between px-1">
            <h2
              className="text-[14.5px] font-bold"
              style={{ color: textPrimary }}
            >
              Your Support Tickets
            </h2>
            <Link
              href="#"
              className="text-[12px] text-indigo-400 hover:underline"
            >
              View All History
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setActiveId(t.id);
                  setView('details');
                }}
                className="group flex items-center justify-between p-5 rounded-md border bg-[#18181b] hover:bg-[#252529] cursor-pointer transition-all active:scale-[0.99]"
                style={{ borderColor: cardBorder }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-1.5 h-10 rounded-full ${t.status === 'open' ? 'bg-emerald-500' : t.status === 'pending' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[14px] font-bold group-hover:text-blue-400 transition-colors"
                        style={{ color: textPrimary }}
                      >
                        {t.subject}
                      </span>
                      <span
                        className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-lg border"
                        style={{
                          borderColor:
                            t.priority === 'high' ? '#ef444433' : cardBorder,
                          color: t.priority === 'high' ? '#ef4444' : textDim,
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-[12px]" style={{ color: textMuted }}>
                      {t.id} · {t.category} · Updated {t.updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">
                      {t.status}
                    </span>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: textPrimary }}
                    >
                      {t.messages.length} messages
                    </span>
                  </div>
                  <ChevronRight size={18} style={{ color: textDim }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            label: 'Cloud Status',
            icon: AlertCircle,
            desc: 'Check current platform health.',
            col: 'text-rose-400',
          },
          {
            label: 'Documentation',
            icon: BookOpen,
            desc: 'Complete API and UI guides.',
            col: 'text-blue-400',
          },
          {
            label: 'Developer Hub',
            icon: LifeBuoy,
            desc: 'Connect with our community.',
            col: 'text-amber-400',
          },
        ].map((res) => (
          <div
            key={res.label}
            className="p-6 rounded-2xl border bg-[#1c1c1c] hover:bg-[#252529] transition-all group"
            style={{ borderColor: cardBorder }}
          >
            <res.icon
              size={20}
              className={`${res.col} mb-3 group-hover:scale-110 transition-transform`}
            />
            <h4
              className="text-[14px] font-bold mb-1"
              style={{ color: textPrimary }}
            >
              {res.label}
            </h4>
            <p className="text-[12px] opacity-60 leading-relaxed truncate">
              {res.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
