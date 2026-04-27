import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Guide — Best Practices for Autonomous Engineering',
  description: 'A comprehensive guide on how to safely implement autonomous agents in your engineering workflow with CodeKang.',
  openGraph: {
    title: 'CodeKang Security Guide',
    description: 'Best practices for safe, autonomous software development.',
    url: 'https://codekang.com/in/security-guide',
    type: 'website',
  },
};

export default function SecurityGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
