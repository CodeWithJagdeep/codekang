import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CodeKang for Enterprise — Scale Autonomous Engineering',
  description: 'Enterprise-grade security, scalability, and control. Deploy CodeKang on-premise or in your private VPC.',
  openGraph: {
    title: 'CodeKang Enterprise — The Autonomous SOC',
    description: 'Advanced autonomous engineering for global organizations. Security, compliance, and scale.',
    url: 'https://codekang.com/in/enterprise',
    type: 'website',
  },
};

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
