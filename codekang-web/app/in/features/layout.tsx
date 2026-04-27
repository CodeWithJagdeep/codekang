import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Features',
  description: 'Explore the powerful autonomous engineering capabilities of CodeKang. From AI code review to self-healing codebases.',
  openGraph: {
    title: 'CodeKang Features — Built for Speed',
    description: 'The future of autonomous engineering. Explore our AI agent capabilities and developer toolchain.',
    url: 'https://codekang.com/in/features',
    type: 'website',
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
