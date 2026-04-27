import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CodeKang — Building the Future of Autonomous Engineering',
  description: 'AI-powered code review, advanced automated issue fixing, and smart mentoring platform for developers.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
