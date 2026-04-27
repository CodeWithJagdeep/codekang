import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — Access Your CodeKang Dashboard',
  description: 'Sign in to CodeKang to manage your repositories, view autonomous reviews, and track team velocity.',
  openGraph: {
    title: 'Login to CodeKang',
    description: 'Access your autonomous engineering dashboard.',
    url: 'https://codekang.com/in/login',
    type: 'website',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
