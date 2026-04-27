import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description: 'Everything you need to know about CodeKang, autonomous engineering, and how to get started.',
  openGraph: {
    title: 'CodeKang FAQ — Get Your Answers',
    description: 'Frequently asked questions about the future of software development.',
    url: 'https://codekang.com/in/faq',
    type: 'website',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
