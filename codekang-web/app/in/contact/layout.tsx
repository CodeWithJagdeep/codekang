import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Get in Touch with CodeKang',
  description: 'Questions about CodeKang? Reach out to our team for support, sales, or partnership inquiries.',
  openGraph: {
    title: 'Contact CodeKang',
    description: 'We are here to help you accelerate your engineering team.',
    url: 'https://codekang.com/in/contact',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
