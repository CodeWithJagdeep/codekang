'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Flag,
  GitBranch,
  CreditCard,
} from 'lucide-react';
import {
  SiGithub,
  SiSlack,
  SiDiscord,
  SiLinear,
} from 'react-icons/si';

const DOCS_SECTIONS = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Flag,
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-2">Overview</h3>
          <p className="text-[14px] text-[#71717a] leading-relaxed">
            Get your AI development workflow running in under 5 minutes.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-3">Steps</h3>
          <ol className="space-y-3 text-[14px] text-[#71717a] list-decimal list-inside">
            <li className="leading-relaxed">Complete the onboarding flow.</li>
            <li className="leading-relaxed">Authorize core repository services.</li>
            <li className="leading-relaxed">Install the CodeKang GitHub App.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: SiGithub,
    color: '#ffffff',
    bgColor: '#24292e',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-2">Overview</h3>
          <p className="text-[14px] text-[#71717a] leading-relaxed">
            Connect CodeKang to your GitHub repositories to automatically analyze code, generate pull requests, and fix bugs.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-3">Setup Guide</h3>
          <ol className="space-y-3 text-[14px] text-[#71717a] list-decimal list-inside">
            <li className="leading-relaxed">Click <span className="text-[#f4f4f5] font-medium">Connect</span> on the GitHub card in the Integrations dashboard.</li>
            <li className="leading-relaxed">You will be redirected to GitHub to authorize the CodeKang app.</li>
            <li className="leading-relaxed">Select the repositories you want CodeKang to access (all or specific ones).</li>
            <li className="leading-relaxed">Click <span className="text-[#f4f4f5] font-medium">Install & Authorize</span>.</li>
          </ol>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
            Once connected, CodeKang will automatically detect new pull requests and run checks.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: SiSlack,
    color: '#e01e5a',
    bgColor: '#4a154b',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-2">Overview</h3>
          <p className="text-[14px] text-[#71717a] leading-relaxed">
            Receive real-time notifications in your Slack channels when CodeKang agent completes tasks or requires attention.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-3">Setup Guide</h3>
          <ol className="space-y-3 text-[14px] text-[#71717a] list-decimal list-inside">
            <li className="leading-relaxed">Click <span className="text-[#f4f4f5] font-medium">Connect</span> on the Slack card.</li>
            <li className="leading-relaxed">Authorize CodeKang to access your Slack workspace.</li>
            <li className="leading-relaxed">Enter the target channel (e.g., <span className="text-[#f4f4f5] font-medium">#dev-alerts</span>) in the configuration modal.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: SiDiscord,
    color: '#5865F2',
    bgColor: '#2c2f33',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-2">Overview</h3>
          <p className="text-[14px] text-[#71717a] leading-relaxed">
            Integrate CodeKang with your Discord server to keep your development team aligned.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-3">Setup Guide</h3>
          <ol className="space-y-3 text-[14px] text-[#71717a] list-decimal list-inside">
            <li className="leading-relaxed">Enable <span className="text-[#f4f4f5] font-medium">Developer Mode</span> in your Discord settings.</li>
            <li className="leading-relaxed">Right-click your desired channel and select <span className="text-[#f4f4f5] font-medium">Copy Channel ID</span>.</li>
            <li className="leading-relaxed">Paste the ID into the CodeKang Discord integration settings.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: SiLinear,
    color: '#5e6ad2',
    bgColor: '#141416',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-2">Overview</h3>
          <p className="text-[14px] text-[#71717a] leading-relaxed">
            Automatically create and track issues in Linear when CodeKang detects bugs.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-3">Setup Guide</h3>
          <ol className="space-y-3 text-[14px] text-[#71717a] list-decimal list-inside">
            <li className="leading-relaxed">Navigate to Linear → Settings → Teams.</li>
            <li className="leading-relaxed">Copy the <span className="text-[#f4f4f5] font-medium">Team ID</span>.</li>
            <li className="leading-relaxed">Enter the Team ID in the CodeKang Linear integration settings.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'repos',
    name: 'Repositories',
    icon: GitBranch,
    color: '#5865F2',
    bgColor: 'rgba(88, 101, 242, 0.1)',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-2">Boundary Control</h3>
          <p className="text-[14px] text-[#71717a] leading-relaxed">
            Dictate exactly where the AI agent operates.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-3">Management Steps</h3>
          <ol className="space-y-3 text-[14px] text-[#71717a] list-decimal list-inside">
            <li className="leading-relaxed">Visit the Repositories tab in your Dashboard.</li>
            <li className="leading-relaxed">Toggle monitoring status for individual projects.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: CreditCard,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-2">Plans & Scaling</h3>
          <p className="text-[14px] text-[#71717a] leading-relaxed">
            Manage your context window quotas and team seats.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-3">Subscription Control</h3>
          <ol className="space-y-3 text-[14px] text-[#71717a] list-decimal list-inside">
            <li className="leading-relaxed">Navigate to Settings → Billing.</li>
            <li className="leading-relaxed">Select Starter, Pro, or Enterprise.</li>
          </ol>
        </div>
      </div>
    ),
  },
];

export default function IntegrationsDocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('getting-started');

  const currentSection = DOCS_SECTIONS.find((s) => s.id === activeSection)!;
  const Icon = currentSection.icon;

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-[#f4f4f5] px-6 md:px-8 pt-8 pb-12">
      <button
        onClick={() => router.push('/dashboard/integrations')}
        className="flex items-center gap-2 text-[13px] text-[#71717a] hover:text-[#f4f4f5] transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        Back to Integrations
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <BookOpen size={18} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[#f4f4f5]">Documentation</h1>
          <p className="text-[13px] text-[#71717a] mt-0.5">Step-by-step guides for CodeKang integrations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-[#1f1f22] pt-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {DOCS_SECTIONS.map((section) => {
            const SecIcon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13.5px] font-medium transition-all ${isActive
                    ? 'bg-[#1f1f22] text-[#f4f4f5]'
                    : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/[0.02]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: section.bgColor }}
                  >
                    <SecIcon size={12} style={{ color: section.color === '#ffffff' && isActive ? '#1c1c1c' : section.color }} />
                  </div>
                  {section.name}
                </div>
                <ChevronRight size={14} className={`transition-transform ${isActive ? 'rotate-90 text-[#f4f4f5]' : 'text-[#3f3f46]'}`} />
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="md:col-span-3 bg-[#161618] border border-[#1f1f22] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#1f1f22]">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: currentSection.bgColor }}
            >
              <Icon size={24} style={{ color: currentSection.color === '#ffffff' ? '#1c1c1c' : currentSection.color }} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#f4f4f5]">{currentSection.name} Integration</h2>
              <p className="text-[12px] text-[#52525b] mt-0.5">Configuration & Setup</p>
            </div>
          </div>

          {currentSection.content}

          <div className="mt-8 pt-6 border-t border-[#1f1f22] flex items-center gap-2 text-[12px] text-[#52525b]">
            <HelpCircle size={14} />
            <span>Need help? Contact <a href="mailto:support@codekang.com" className="text-indigo-400 hover:underline">support@codekang.com</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}
