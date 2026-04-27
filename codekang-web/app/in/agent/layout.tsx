import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meet the Agent — Your New Autonomous Partner',
  description: 'Deep dive into how the CodeKang AI agent thinks, reviews, and fixes code. The engine of autonomous engineering.',
  openGraph: {
    title: 'CodeKang Agent — Beyond Copilot',
    description: 'Meet the first AI agent that actually ships the fix.',
    url: 'https://codekang.com/in/agent',
    type: 'website',
  },
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
