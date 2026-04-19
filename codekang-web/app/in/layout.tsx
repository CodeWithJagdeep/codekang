import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login & Verification',
  description: 'Login to CodeKang, the AI code review & issue fixing platform.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
