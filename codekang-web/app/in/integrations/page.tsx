'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RiArrowRightLine,
  RiGithubFill,
  RiSlackFill,
  RiDiscordFill,
  RiGitlabFill
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';

const INTEGRATIONS = [
  {
    name: 'GitHub',
    type: 'Version Control',
    desc: 'Merge with absolute confidence. Regressions and security gaps are caught before the PR is even opened.',
    icon: RiGithubFill,
    color: '#000000',
    status: 'Live'
  },
  {
    name: 'GitLab',
    type: 'Version Control',
    desc: 'Accelerate your deployment pipeline. Let the agent handle MR reviews so your team can focus on building.',
    icon: RiGitlabFill,
    color: '#fc6d26',
    status: 'Live'
  },
  {
    name: 'Slack',
    type: 'Communication',
    desc: 'Never miss a critical update. Instantly align your team when a high-risk security flaw is auto-patched.',
    icon: RiSlackFill,
    color: '#e01e5a',
    status: 'Live'
  },
  {
    name: 'Discord',
    type: 'Communication',
    desc: 'Keep the momentum going. Celebrate team wins and daily performance boosts directly in your channels.',
    icon: RiDiscordFill,
    color: '#5865F2',
    status: 'Live'
  },
  {
    name: 'Jira',
    type: 'Issue Tracking',
    desc: 'Eliminate manual status updates. Tickets move to "Resolved" the moment the agent pushes the fix.',
    icon: () => <span className="font-black text-2xl" style={{ color: '#0052CC' }}>J</span>,
    color: '#0052CC',
    status: 'Beta'
  },
  {
    name: 'Linear',
    type: 'Issue Tracking',
    desc: 'Maintain perfect project velocity. Two-way sync ensures your roadmap always reflects reality without manual data entry.',
    icon: () => <span className="font-black text-2xl" style={{ color: '#5E6AD2' }}>L</span>,
    color: '#5E6AD2',
    status: 'Live'
  }
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full">
        {/* ── Hero ── */}
        <section className="pt-32 pb-24 px-10 text-center relative border-b-2 border-black/10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Frictionless Workflow
            </span>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Amplify your <br />
              <span className="text-[#f97316]">existing stack</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto mb-14 leading-tight uppercase tracking-tighter">
              Don't change how you work. Just watch your current tools become exponentially more powerful overnight.
            </p>
          </motion.div>
        </section>

        {/* ── Integrations Grid ── */}
        <section className="py-32 px-10 md:px-14 border-b-2 border-black/10 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            {INTEGRATIONS.map((integration, i) => {
              const Icon = integration.icon;
              return (
                <div key={i} className="flex flex-col md:flex-row items-start md:items-center gap-8 p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] hover:border-[#f97316] transition-all group bg-[#fcfcfc]">
                  <div className="w-20 h-20 shrink-0 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
                    {/* @ts-ignore - dynamic icon typing */}
                    <Icon size={40} style={{ color: integration.color }} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight">{integration.name}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-black ${integration.status === 'Live' ? 'bg-[#22c55e] text-white' : 'bg-[#eab308] text-black'}`}>
                        {integration.status}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                      {integration.type}
                    </span>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      {integration.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Why Connect Section ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-[#f97316]/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4 block">The compounding effect</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Why connect your tools?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                   <RiArrowRightLine size={120} />
                </div>
                <h4 className="text-2xl font-black uppercase mb-4 relative z-10">Eliminate Context Switching</h4>
                <p className="text-gray-500 font-medium leading-relaxed relative z-10">
                  Every time a developer switches from their IDE to Jira to Slack, momentum dies. By connecting your stack, CodeKang handles the context synchronization automatically. You write code; we update the tickets and alert the team.
                </p>
              </div>
              <div className="p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                   <RiArrowRightLine size={120} />
                </div>
                <h4 className="text-2xl font-black uppercase mb-4 relative z-10">Accelerate the Review Loop</h4>
                <p className="text-gray-500 font-medium leading-relaxed relative z-10">
                  Waiting hours for a human review kills velocity. Connecting your VCS ensures that within seconds of a PR opening, a comprehensive, context-aware analysis is deposited right where the developer is already looking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Secure Connection ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-black text-white">
           <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">Granular Access Control</h2>
              <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto mb-12">
                You dictate exactly what CodeKang can see and touch. Issue tracking tokens are scoped strictly to comment and status updates. Repository access uses precise OAuth scopes, ensuring your source code remains safe and your secrets remain yours.
              </p>
              <div className="inline-flex items-center gap-6 justify-center">
                 <div className="w-16 h-16 border-2 border-[#f97316] flex items-center justify-center text-[#f97316] bg-[#f97316]/10 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]">
                    <span className="font-black">OAUTH</span>
                 </div>
                 <div className="w-16 h-16 border-2 border-[#f97316] flex items-center justify-center text-[#f97316] bg-[#f97316]/10 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]">
                    <span className="font-black">SAML</span>
                 </div>
                 <div className="w-16 h-16 border-2 border-[#f97316] flex items-center justify-center text-[#f97316] bg-[#f97316]/10 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]">
                    <span className="font-black">2FA</span>
                 </div>
              </div>
           </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-32 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-10">
            Don't see your <span className="text-[#f97316]">tool?</span>
          </h2>
          <Link
            href="/in/contact"
            className="inline-flex items-center gap-3 border-2 border-black bg-white text-black px-16 py-8 text-[20px] font-black transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            REQUEST AN INTEGRATION <RiArrowRightLine size={28} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
