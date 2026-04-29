'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Favi from '@/public/logo/favi.png';

export default function GitHubAppSetupPage() {
  const [manifest, setManifest] = useState('');

  useEffect(() => {
    const origin = window.location.origin;
    const gatewayBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1').replace('/api/v1', '');

    const m = {
      name: 'CodeKang',
      description: 'Autonomous AI agent that reviews PRs and fixes GitHub issues',
      url: origin,
      hook_attributes: {
        url: `${gatewayBase}/webhook/github`,
        active: true,
      },
      redirect_url: `${origin}/api/github-app/callback`,
      public: true,
      default_permissions: {
        contents: 'write',
        issues: 'write',
        pull_requests: 'write',
        checks: 'read',
        metadata: 'read',
      },
      default_events: [
        'issues',
        'issue_comment',
        'pull_request',
        'pull_request_review',
        'push',
        'installation',
        'installation_repositories',
      ],
    };

    setManifest(JSON.stringify(m));
  }, []);

  if (!manifest) return null;

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-[480px] w-full text-center">
        <div className="flex justify-center mb-6">
          <Image src={Favi} alt="CodeKang" width={52} height={52} />
        </div>

        <h1 className="text-[22px] font-semibold text-white mb-2">Set up GitHub App</h1>
        <p className="text-[14px] text-[#71717a] mb-8 leading-relaxed">
          CodeKang needs a GitHub App to receive webhooks and perform code reviews.
          Click the button to create one on your GitHub account — it takes about 10 seconds.
        </p>

        <form action="https://github.com/settings/apps/new" method="post">
          <input type="hidden" name="manifest" value={manifest} />
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white text-[#111] font-semibold text-[15px] hover:bg-[#e4e4e7] transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Create GitHub App
          </button>
        </form>

        <p className="mt-4 text-[12px] text-[#52525b]">
          You&apos;ll be redirected to GitHub. After clicking &quot;Create GitHub App&quot;, you&apos;ll be brought back here automatically.
        </p>
      </div>
    </div>
  );
}
