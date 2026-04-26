'use client';

import {
  SiGithub, SiGitlab, SiJira, SiSlack, SiLinear, SiNotion,
  SiFigma, SiBitbucket, SiTypescript, SiPython, SiGo, SiRust,
  SiReact, SiNextdotjs, SiVuedotjs, SiKotlin,
} from 'react-icons/si';

const ROW_1 = [
  { Icon: SiGithub,    label: 'GitHub',      color: '#e8e8e8' },
  { Icon: SiGitlab,    label: 'GitLab',      color: '#fc6d26' },
  { Icon: SiJira,      label: 'Jira',        color: '#2684ff' },
  { Icon: SiSlack,     label: 'Slack',       color: '#e01e5a' },
  { Icon: SiLinear,    label: 'Linear',      color: '#5e6ad2' },
  { Icon: SiNotion,    label: 'Notion',      color: '#e8e8e8' },
  { Icon: SiFigma,     label: 'Figma',       color: '#f24e1e' },
  { Icon: SiBitbucket, label: 'Bitbucket',   color: '#2684ff' },
];

const ROW_2 = [
  { Icon: SiTypescript, label: 'TypeScript', color: '#3178c6' },
  { Icon: SiPython,     label: 'Python',     color: '#3776ab' },
  { Icon: SiGo,         label: 'Go',         color: '#00add8' },
  { Icon: SiRust,       label: 'Rust',       color: '#ce422b' },
  { Icon: SiReact,      label: 'React',      color: '#61dafb' },
  { Icon: SiNextdotjs,  label: 'Next.js',    color: '#e8e8e8' },
  { Icon: SiVuedotjs,   label: 'Vue',        color: '#42b883' },
  { Icon: SiKotlin,     label: 'Kotlin',     color: '#7f52ff' },
];

function Pill({ Icon, label, color }: { Icon: React.ElementType; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[13px] font-medium text-[#888888] select-none whitespace-nowrap hover:border-white/15 transition-colors duration-300">
      <Icon size={15} style={{ color }} />
      {label}
    </div>
  );
}

function MarqueeRow({ items, reverse = false }: { items: typeof ROW_1; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <div
        className="flex gap-3 py-1.5"
        style={{
          animation: `marquee${reverse ? '-reverse' : ''} 28s linear infinite`,
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
    <section className="py-16 overflow-hidden">
      <p className="text-center text-[12px] font-semibold uppercase tracking-[0.15em] text-[#444] mb-8">
        Works with your existing stack
      </p>
      <div className="space-y-3">
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>
    </section>
  );
}
