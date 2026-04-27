'use client';

import {
  SiGithub, SiGitlab, SiJira, SiSlack, SiLinear, SiNotion,
  SiBitbucket, SiTypescript, SiPython, SiGo, SiRust,
  SiReact, SiNextdotjs, SiVercel, SiSentry, SiDiscord,
} from 'react-icons/si';

const ROW_1 = [
  { Icon: SiGithub,    label: 'GitHub',      color: '#e8e8e8' },
  { Icon: SiGitlab,    label: 'GitLab',      color: '#fc6d26' },
  { Icon: SiBitbucket, label: 'Bitbucket',   color: '#2684ff' },
  { Icon: SiSlack,     label: 'Slack',       color: '#e01e5a' },
  { Icon: SiDiscord,   label: 'Discord',     color: '#5865f2' },
  { Icon: SiLinear,    label: 'Linear',      color: '#5e6ad2' },
  { Icon: SiJira,      label: 'Jira',        color: '#2684ff' },
  { Icon: SiNotion,    label: 'Notion',      color: '#e8e8e8' },
];

const ROW_2 = [
  { Icon: SiVercel,     label: 'Vercel',     color: '#e8e8e8' },
  { Icon: SiSentry,     label: 'Sentry',     color: '#362d59' },
  { Icon: SiTypescript, label: 'TypeScript', color: '#3178c6' },
  { Icon: SiPython,     label: 'Python',     color: '#3776ab' },
  { Icon: SiGo,         label: 'Go',         color: '#00add8' },
  { Icon: SiRust,       label: 'Rust',       color: '#ce422b' },
  { Icon: SiReact,      label: 'React',      color: '#61dafb' },
  { Icon: SiNextdotjs,  label: 'Next.js',    color: '#e8e8e8' },
];

function Pill({ Icon, label, color }: { Icon: React.ElementType; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-none border-2 border-black/10 bg-white px-5 py-3 text-[14px] font-bold text-black select-none whitespace-nowrap hover:border-[#f97316] hover:translate-y-[-2px] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[6px_6px_0px_0px_rgba(249,115,22,0.1)]">
      <Icon size={18} style={{ color }} />
      <span className="uppercase tracking-tight">{label}</span>
    </div>
  );
}

function MarqueeRow({ items, reverse = false }: { items: typeof ROW_1; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items]; // Triple for smoother loop
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex gap-4 py-3"
        style={{
          animation: `marquee${reverse ? '-reverse' : ''} 40s linear infinite`,
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <Pill key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section className="py-24 overflow-hidden bg-[#fcfcfc]">
      <div className="flex flex-col items-center mb-16 px-10">
        <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          Works with what you already use
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-black uppercase tracking-tighter text-center max-w-2xl leading-none">
          No migration. No new tools. <br /> <span className="text-[#f97316]">Just plug in and go.</span>
        </h2>
      </div>
      
      <div className="space-y-4">
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>
    </section>
  );
}
