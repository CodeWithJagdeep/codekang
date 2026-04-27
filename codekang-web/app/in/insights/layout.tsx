import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Insights & Metrics',
  description: 'Deep visibility into your engineering velocity, cycle times, and PR health. Kang analyzes git metadata to surface technical bottlenecks.',
  openGraph: {
    title: 'CodeKang Insights — Measure What Matters',
    description: 'Optimize your engineering workflow with data-driven insights. Track cycle times and PR health automatically.',
    url: 'https://codekang.com/in/insights',
    type: 'website',
  },
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
