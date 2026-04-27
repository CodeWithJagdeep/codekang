'use client';

import { motion } from 'framer-motion';
import { 
  RiBarChartGroupedLine, 
  RiTimerFlashLine, 
  RiTeamLine, 
  RiArrowRightLine,
  RiDashboard3Line,
  RiFocus3Line,
  RiLineChartLine,
  RiPulseLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── Hero ── */}
        <section className="pt-32 pb-24 px-10 text-center relative border-b-2 border-black/10">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Data-Driven Engineering
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Measure what <br />
              <span className="text-[#f97316]">matters</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-tighter">
              Stop guessing your ship dates. Kang analyzes your git metadata to surface the bottlenecks that are slowing your team down.
            </p>
          </motion.div>
        </section>

        {/* ── The Value (How it helps) ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                icon: RiTimerFlashLine,
                title: "Cycle Time Analysis",
                desc: "Track how long it takes from the first commit to the final merge across your entire team.",
                help: "Identifies process delays before they become project delays."
              },
              {
                icon: RiFocus3Line,
                title: "PR Health Metrics",
                desc: "Surface PRs that have been sitting for 48+ hours or have 10+ comments with no resolution.",
                help: "Unblocks your developers instantly."
              },
              {
                icon: RiBarChartGroupedLine,
                title: "Velocity Forecasts",
                desc: "Use historical data to predict when features will actually ship with 90% accuracy.",
                help: "Removes the 'When will it be done?' stress from stakeholders."
              }
            ].map((item, i) => (
              <div key={i} className="p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all">
                <item.icon size={40} className="text-[#f97316] mb-8" />
                <h3 className="text-2xl font-black uppercase mb-4">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-tight mb-8 uppercase tracking-tight">{item.desc}</p>
                <div className="p-4 bg-[#f97316]/5 border-l-4 border-[#f97316]">
                  <p className="text-[12px] font-black uppercase text-[#f97316]">{item.help}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Impact Section ── */}
        <section className="py-32 px-10 border-b-2 border-black/10">
           <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">Total <br /> <span className="text-[#f97316]">visibility</span></h2>
                 <p className="text-xl text-gray-500 font-medium uppercase tracking-tight leading-tight mb-12">
                    Kang doesn't just show you charts. It tells you *why* your velocity is dropping and which repos need your attention.
                 </p>
                 <div className="space-y-4">
                    {['Identify high-churn files', 'Monitor team burn-out signals', 'Optimize code review distribution'].map((point, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <RiPulseLine className="text-[#f97316]" />
                          <span className="font-black uppercase text-[13px]">{point}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="border-2 border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                 {/* Decorative Chart-like lines */}
                 <div className="h-64 flex items-end gap-2">
                    {[40, 70, 45, 90, 60, 80, 100].map((h, i) => (
                       <motion.div 
                          key={i} 
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="flex-1 bg-black border-2 border-black" 
                       />
                    ))}
                 </div>
                 <div className="mt-8 pt-8 border-t-2 border-black flex justify-between items-center">
                    <span className="text-[14px] font-black uppercase">Team Velocity</span>
                    <span className="text-[14px] font-black text-[#22c55e] uppercase">+24% THIS MONTH</span>
                 </div>
              </div>
           </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-40 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-12">
            Optimize your <br /> <span className="text-[#f97316]">workflow</span> <br /> today
          </h2>
          <Link
            href="/in/login"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            SEE TEAM INSIGHTS <RiArrowRightLine size={32} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
