import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations & Ecosystem',
  description: 'Connect CodeKang with GitHub, GitLab, Slack, and Jira. Amplify your existing engineering stack with autonomous AI agents.',
  openGraph: {
    title: 'CodeKang Integrations — Seamless Workflow',
    description: 'Autonomous AI agents that live inside your current tools. Connect GitHub, Slack, Linear, and more.',
    url: 'https://codekang.com/in/integrations',
    type: 'website',
  },
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
