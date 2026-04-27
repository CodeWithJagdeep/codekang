import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans',
  description: 'Flexible plans for teams of all sizes. From individual developers to global enterprises, CodeKang scales with your engineering needs.',
  openGraph: {
    title: 'CodeKang Pricing — Invest in Velocity',
    description: 'Autonomous engineering that pays for itself. Explore our Developer, Pro, and Enterprise plans.',
    url: 'https://codekang.com/in/pricing',
    type: 'website',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
