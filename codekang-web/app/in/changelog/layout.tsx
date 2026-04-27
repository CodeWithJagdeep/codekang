import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — What is New at CodeKang',
  description: 'Keep up with the latest features, improvements, and fixes we are shipping to the CodeKang platform.',
  openGraph: {
    title: 'CodeKang Changelog — Shipping Daily',
    description: 'Track the evolution of autonomous engineering.',
    url: 'https://codekang.com/in/changelog',
    type: 'website',
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
