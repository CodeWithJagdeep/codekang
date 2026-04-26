'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  Zap,
  CreditCard,
  Lock,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import Footer from '@/component/Footer';
import MarketingHeader from '@/component/MarketingHeader';

const FAQ_CATEGORIES = [
  { id: 'general', label: 'General', icon: HelpCircle },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'technical', label: 'Technical', icon: Zap },
  { id: 'security', label: 'Security', icon: Lock },
];

const FAQS = [
  {
    category: 'general',
    question: 'What is CodeKang?',
    answer: 'CodeKang is an AI-powered code review platform that helps developers and teams ship better code faster. It automatically analyzes pull requests, detects bugs, security vulnerabilities, and suggests improvements just like a human senior developer would.',
  },
  {
    category: 'general',
    question: 'Which platforms do you support?',
    answer: 'We currently support GitHub, GitLab, and Bitbucket. You can connect your repositories from any of these platforms and start getting reviews immediately.',
  },
  {
    category: 'billing',
    question: 'How do credits work?',
    answer: 'Credits are the currency of CodeKang. Each AI review consumes a set amount of credits depending on the number of files and lines changed. Free plans get 50 credits/month, while Pro plans get 500 credits/month.',
  },
  {
    category: 'billing',
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes! You can change your plan at any time from the Billing settings in your dashboard. If you upgrade, the changes take effect immediately. If you downgrade, it will take effect at the end of your current billing cycle.',
  },
  {
    category: 'technical',
    question: 'How accurate is the AI review?',
    answer: 'Our AI is trained on millions of high-quality codebases and follows industry-standard best practices. While it is highly accurate at catching bugs and style issues, we always recommend human oversight for complex architectural decisions.',
  },
  {
    category: 'technical',
    question: 'Can I customize the review rules?',
    answer: 'Yes, Pro and Enterprise users can define custom linting rules and architectural guidelines that the AI should follow during its analysis.',
  },
  {
    category: 'security',
    question: 'Is my code safe with CodeKang?',
    answer: 'Security is our top priority. We do not store your code on our servers after the review is complete. All analysis happens in isolated, ephemeral environments, and we use enterprise-grade encryption for all data.',
  },
  {
    category: 'security',
    question: 'Do you offer on-premise deployment?',
    answer: 'Yes, for Enterprise customers with strict compliance requirements, we offer a self-hosted version of CodeKang that can run within your own infrastructure.',
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f8423b]/30">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="pt-20 pb-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-[#a1a1aa] bg-clip-text text-transparent">
          Common Questions
        </h1>
        <p className="text-[16px] text-[#a1a1aa] max-w-[600px] mx-auto mb-10">
          Everything you need to know about CodeKang. Can&apos;t find what you&apos;re looking for? Reach out to our support team.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-0 bg-[#f8423b]/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative flex items-center bg-[#111113] border border-white/10 rounded-2xl px-5 py-4 focus-within:border-[#f8423b]/50 transition-all shadow-xl">
            <Search size={20} className="text-[#52525b] group-focus-within:text-[#f8423b] transition-colors" />
            <input
              type="text"
              placeholder="Search for answers..."
              className="bg-transparent border-none outline-none flex-1 ml-4 text-[15px] text-white placeholder:text-[#52525b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-3 mb-16">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2.5 rounded-xl text-[14px] font-medium border transition-all ${
            activeCategory === 'all'
              ? 'bg-[#f8423b]/10 border-[#f8423b] text-[#f8423b]'
              : 'bg-white/5 border-white/5 text-[#a1a1aa] hover:border-white/10 hover:text-white'
          }`}
        >
          All Questions
        </button>
        {FAQ_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[14px] font-medium border transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#f8423b]/10 border-[#f8423b] text-[#f8423b]'
                  : 'bg-white/5 border-white/5 text-[#a1a1aa] hover:border-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </section>

      {/* ── FAQ List ── */}
      <section className="max-w-3xl mx-auto px-6 pb-24 min-h-[400px]">
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/5 overflow-hidden transition-all bg-[#0d0d0e]"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/2 transition-colors"
                >
                  <span className="font-semibold text-[15px] pr-8">{faq.question}</span>
                  <div className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-[#52525b]" />
                  </div>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-[14px] text-[#a1a1aa] leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-[#52525b]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No results found</h3>
            <p className="text-[#52525b]">Try adjusting your search terms or filters.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-20 p-10 rounded-3xl bg-gradient-to-br from-[#18181b] to-transparent border border-white/5 text-center">
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-[#a1a1aa] mb-8 max-w-[480px] mx-auto text-[14px]">
            Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team.
          </p>
          <Link
            href="/in/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-[14px] hover:bg-[#e8e8e8] transition-all"
          >
            <MessageCircle size={18} />
            Contact Support
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
