import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Stories — Shipping Fast with CodeKang',
  description: 'See how engineering teams around the world use CodeKang to automate their code reviews and accelerate delivery.',
  openGraph: {
    title: 'CodeKang Customers — Engineering Success Stories',
    description: 'Real stories from real teams building the future with autonomous engineering.',
    url: 'https://codekang.com/in/customers',
    type: 'website',
  },
};

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
