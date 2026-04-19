import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onboarding | CodeKang',
  description:
    'Complete your registration and select your subscription plan to get started with CodeKang.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
