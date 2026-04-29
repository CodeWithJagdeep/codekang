'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RiArrowRightLine,
  RiArrowLeftLine,
  RiBookOpenLine,
  RiCheckboxCircleLine,
  RiInformationLine,
  RiFlagLine,
  RiRefund2Line,
  RiGitRepositoryLine,
  RiGitlabFill,
} from 'react-icons/ri';
import {
  SiGithub,
  SiSlack,
  SiDiscord,
  SiLinear,
  SiJira,
} from 'react-icons/si';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';

const DOCS_SECTIONS = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: RiFlagLine,
    color: '#f97316',
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Welcome to the Future of DevOps</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg mb-6">
            CodeKang bridges the gap between raw AI capability and production-grade software engineering. By integrating an autonomous agent directly into your version control workflow, you ensure that code is constantly audited, tested, and refined before a human ever reviews it.
          </p>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            This guide walks you through initializing your workspace, provisioning your first autonomous developer seat, and deploying automated guardrails.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Core Installation Flow</h3>
          <ol className="space-y-8 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black bg-[#f97316] text-white font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">1</span>
              <div>
                <span className="font-black text-black block uppercase text-sm mb-1">Account Creation</span>
                <span className="leading-relaxed">Establish your primary administrative identity via the <Link href="/in/signup" className="font-black text-[#f97316] hover:underline">Registration Portal</Link>. Multi-factor authentication is highly recommended for workspace owners.</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black bg-[#f97316] text-white font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">2</span>
              <div>
                <span className="font-black text-black block uppercase text-sm mb-1">Workspace Onboarding</span>
                <span className="leading-relaxed">Complete the sequential onboarding flow. During this phase, the central gateway establishes necessary telemetry parameters and maps your user profile to external OAuth providers.</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black bg-[#f97316] text-white font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">3</span>
              <div>
                <span className="font-black text-black block uppercase text-sm mb-1">App Permission Scoping</span>
                <span className="leading-relaxed">Install the native CodeKang GitHub application onto your target organizations. Ensure you grant read/write access to repository metadata and code contents so the AI can effectively open pull requests.</span>
              </div>
            </li>
          </ol>
        </div>

        <div className="p-8 border-2 border-black bg-[#f97316]/5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <h4 className="text-xl font-black uppercase mb-3">💡 Important Operational Note</h4>
          <p className="text-gray-700 font-medium text-base leading-relaxed">
            CodeKang runs code execution logic inside highly isolated sandbox environments. However, standard internal network policies might require whitelisting the gateway IP ranges if your deployment leverages local firewall rules.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: SiGithub,
    color: '#000000',
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Deep-Level Version Control</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            The GitHub integration goes far beyond simple status checks. CodeKang actively listens for webhook events, allowing the model to synthesize intent from PR descriptions and execute complex refactoring autonomously.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Integration Architecture</h3>
          <ol className="space-y-6 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">1</span>
              <span className="mt-0.5">Navigate to integration settings and authenticate via secure OAuth2 handshakes.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">2</span>
              <span className="mt-0.5">Delegate specific repository boundaries. We advise starting with staging branches.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">3</span>
              <span className="mt-0.5">Configure automated commit signatures for transparent tracking.</span>
            </li>
          </ol>
        </div>

        <div className="p-6 border-2 border-black bg-black text-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
          <h5 className="text-lg font-black uppercase mb-2 text-[#f97316]">Required OAuth Scopes:</h5>
          <ul className="list-disc list-inside font-medium text-gray-300 space-y-2">
            <li><code className="text-white font-bold bg-white/10 px-1.5 py-0.5">repo</code> (Full access to private repositories)</li>
            <li><code className="text-white font-bold bg-white/10 px-1.5 py-0.5">workflow</code> (Required to execute GitHub Actions)</li>
            <li><code className="text-white font-bold bg-white/10 px-1.5 py-0.5">admin:repo_hook</code> (Manage automated webhooks)</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: RiGitlabFill,
    color: '#fc6d26',
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Enterprise CI/CD Sync</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            Bring autonomous reviews to GitLab Merge Requests. CodeKang monitors pipelines and audits changes synchronously.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Setup Flow</h3>
          <ol className="space-y-4 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">1</span>
              <span className="mt-0.5">Navigate to profile preferences and click Connect on the GitLab node.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">2</span>
              <span className="mt-0.5">Confirm application scopes and bind targeted projects.</span>
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: SiSlack,
    color: '#e01e5a',
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Unified Communications</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            Keep your development squad perfectly aligned. Our bidirectional Slack integration posts updates regarding autonomous execution phases, deployment approvals, and regression warnings directly into designated Slack channels.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Step-by-Step Setup</h3>
          <ol className="space-y-4 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">1</span>
              <span className="mt-0.5">Add the CodeKang App to your Slack Workspace using official manifests.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">2</span>
              <span className="mt-0.5">Invite the <code className="text-black font-bold bg-gray-100 px-1.5 py-0.5">@CodeKang</code> bot into private channels manually if needed.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">3</span>
              <span className="mt-0.5">Customize alert levels (e.g., strictly error tracing vs. complete step logs).</span>
            </li>
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
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Dev Community Bridging</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            Perfect for open-source collectives and distributed teams. Discord webhooks pump real-time execution streams, so everyone knows exactly what the agent is thinking at any given time.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Installation Guide</h3>
          <ol className="space-y-4 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">1</span>
              <span className="mt-0.5">Enable Developer Mode in your Discord advanced preferences.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">2</span>
              <span className="mt-0.5">Copy targeted Channel IDs from right-click context options.</span>
            </li>
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
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Automated Ticket Lifecycles</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            Sync bug detection with engineering roadmaps. Whenever CodeKang's internal scanner uncovers a performance bottleneck, it will seamlessly create a structured Linear issue and assign priorities.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Setup Instructions</h3>
          <ol className="space-y-4 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">1</span>
              <span className="mt-0.5">Locate your Team Identifier strings within workspace settings.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">2</span>
              <span className="mt-0.5">Feed the credentials securely into the centralized integrations dashboard.</span>
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'jira',
    name: 'Jira',
    icon: SiJira,
    color: '#0052CC',
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Agile Task Management</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            Auto-resolve tickets and capture technical debt items flawlessly. CodeKang tracks issue keys across commits.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Provisioning Credentials</h3>
          <ol className="space-y-4 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">1</span>
              <span className="mt-0.5">Extract API security tokens via Atlassian account settings.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">2</span>
              <span className="mt-0.5">Register authorization metadata into the cloud gateway.</span>
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'repos',
    name: 'Repositories',
    icon: RiGitRepositoryLine,
    color: '#5865F2',
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Advanced Workspace Scoping</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            Maintain rigid oversight of proprietary logic. You decide where the machine operates. Repository access controls allow granular toggling of pre-commit hooks, vector indexing paths, and continuous testing execution rules.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Management Workflow</h3>
          <ol className="space-y-4 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">1</span>
              <span className="mt-0.5">Visit your main dashboard panel and select active tracking targets.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 border-2 border-black bg-[#f97316] text-white font-black shrink-0">2</span>
              <span className="mt-0.5">Review execution logs mapped directly to specific directory changes.</span>
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: RiRefund2Line,
    color: '#22c55e',
    bgColor: '#ffffff',
    content: (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Enterprise Resource Planning</h3>
          <p className="text-gray-600 font-medium leading-relaxed text-lg">
            CodeKang provisions backend context windows dynamically. Managing your cost limits guarantees zero downtime for continuous integration loops.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Subscription Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-medium">
            <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <span className="font-black text-xl uppercase block mb-2">Starter</span>
              <p className="text-gray-500 text-sm mb-4">Perfect for solo maintainers.</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 5 Action Pipelines</li>
                <li>• 50k Token Context</li>
                <li>• Standard SLA</li>
              </ul>
            </div>
            <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] bg-black text-white">
              <span className="font-black text-xl uppercase block mb-2 text-[#f97316]">Professional</span>
              <p className="text-gray-400 text-sm mb-4">Ideal for growing tech squads.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Unlimited Pipelines</li>
                <li>• 200k Token Context</li>
                <li>• Dedicated Priority queues</li>
              </ul>
            </div>
            <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <span className="font-black text-xl uppercase block mb-2">Enterprise</span>
              <p className="text-gray-500 text-sm mb-4">Customized governance models.</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• On-Prem Sandbox</li>
                <li>• Unlimited seats</li>
                <li>• Dedicated account manager</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Usage Monitoring</h3>
          <ol className="space-y-8 text-gray-600 font-medium text-lg">
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black bg-[#f97316] text-white font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">1</span>
              <div>
                <span className="font-black text-black block uppercase text-sm mb-1">Overage Controls</span>
                <span className="leading-relaxed">Establish automated spend ceilings to pause computation gracefully upon hitting target benchmarks.</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black bg-[#f97316] text-white font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">2</span>
              <div>
                <span className="font-black text-black block uppercase text-sm mb-1">Seat Provisioning</span>
                <span className="leading-relaxed">Onboard engineers without sharing global access keys. Assign RBAC roles via operational permissions.</span>
              </div>
            </li>
          </ol>
        </div>
      </div>
    ),
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(true);

  const currentSection = DOCS_SECTIONS.find((s) => s.id === activeSection)!;
  const Icon = currentSection.icon;

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full pt-16 pb-48 px-10">
        <div className="max-w-[1600px] mx-auto w-full">

          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 border-2 border-black bg-[#f97316] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
              <RiBookOpenLine size={32} />
            </div>
            <div>
              <span className="text-[#f97316] text-[12px] font-black uppercase tracking-[0.3em]">Knowledge Base</span>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                Documentation
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Sidebar */}
            <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
              {/* Getting Started */}
              {(() => {
                const section = DOCS_SECTIONS.find(s => s.id === 'getting-started')!;
                const SecIcon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-4 px-6 py-4 border-2 font-black uppercase tracking-wider transition-all shrink-0 lg:shrink ${isActive
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
                        : 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  >
                    <div className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0" style={{ backgroundColor: section.bgColor }}>
                      <SecIcon size={16} style={{ color: section.color }} />
                    </div>
                    {section.name}
                  </button>
                );
              })()}

              {/* Integrations Dropdown Toggle */}
              <button
                onClick={() => setIsIntegrationsOpen(!isIntegrationsOpen)}
                className={`flex items-center justify-between px-6 py-4 border-2 font-black uppercase tracking-wider transition-all shrink-0 lg:shrink bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-2 border-black bg-black text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <RiBookOpenLine size={16} />
                  </div>
                  Integrations
                </div>
                <span className={`transition-transform duration-200 ${isIntegrationsOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Integration Items */}
              {isIntegrationsOpen && (
                <div className="flex flex-row lg:flex-col gap-2 pl-0 lg:pl-6 mt-1">
                  {['github', 'gitlab', 'slack', 'discord', 'jira', 'linear'].map(id => {
                    const section = DOCS_SECTIONS.find(s => s.id === id)!;
                    const SecIcon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-4 px-6 py-3 border-2 font-black uppercase tracking-wider transition-all shrink-0 lg:shrink ${isActive
                            ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
                            : 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                      >
                        <div className="w-6 h-6 border-2 border-black flex items-center justify-center shrink-0" style={{ backgroundColor: section.bgColor }}>
                          <SecIcon size={14} style={{ color: section.color }} />
                        </div>
                        <span className="text-sm">{section.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Repositories */}
              {(() => {
                const section = DOCS_SECTIONS.find(s => s.id === 'repos')!;
                const SecIcon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-4 px-6 py-4 border-2 font-black uppercase tracking-wider transition-all shrink-0 lg:shrink ${isActive
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
                        : 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  >
                    <div className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0" style={{ backgroundColor: section.bgColor }}>
                      <SecIcon size={16} style={{ color: section.color }} />
                    </div>
                    {section.name}
                  </button>
                );
              })()}

              {/* Billing */}
              {(() => {
                const section = DOCS_SECTIONS.find(s => s.id === 'billing')!;
                const SecIcon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-4 px-6 py-4 border-2 font-black uppercase tracking-wider transition-all shrink-0 lg:shrink ${isActive
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
                        : 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  >
                    <div className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0" style={{ backgroundColor: section.bgColor }}>
                      <SecIcon size={16} style={{ color: section.color }} />
                    </div>
                    {section.name}
                  </button>
                );
              })()}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 border-2 border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative min-h-[900px]">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-black">
                <Icon size={120} />
              </div>

              <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-black/10">
                <div
                  className="w-12 h-12 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: currentSection.bgColor }}
                >
                  <Icon size={24} style={{ color: currentSection.color }} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{currentSection.name}</h2>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                    Integration Guide
                  </span>
                </div>
              </div>

              {currentSection.content}

              <div className="mt-12 pt-6 border-t-2 border-black/10 flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <RiInformationLine size={18} className="text-[#f97316]" />
                <span>Questions? Email <a href="mailto:support@codekang.com" className="text-[#f97316] hover:underline">support@codekang.com</a></span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
