import { Metadata } from 'next';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Settings | CodeKang',
  description:
    'Manage your profile, CodeKang preferences, AI tools, and integrations.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
