import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface GitHubAppData {
  id: number;
  slug: string;
  pem: string;
  webhook_secret: string;
  html_url: string;
}

function updateEnvVar(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  return regex.test(content) ? content.replace(regex, line) : `${content}\n${line}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/github/setup', req.url));
  }

  // Exchange the one-time code for GitHub App credentials
  const ghRes = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!ghRes.ok) {
    const text = await ghRes.text();
    return NextResponse.json(
      { error: 'GitHub code exchange failed', details: text },
      { status: 502 },
    );
  }

  const data = (await ghRes.json()) as GitHubAppData;
  const { id: appId, slug, pem: privateKey, webhook_secret: webhookSecret } = data;

  const cwd = process.cwd(); // .../codekang-web

  // 1. Save private key for the autonomous-ai service
  const keyDest = path.resolve(cwd, '../apps/automous-ai/github-app-private-key.pem');
  try {
    fs.writeFileSync(keyDest, privateKey, { mode: 0o600 });
  } catch { /* non-fatal */ }

  // 2. Update the root monorepo .env
  const rootEnvPath = path.resolve(cwd, '../.env');
  try {
    const current = fs.readFileSync(rootEnvPath, 'utf-8');
    let updated = updateEnvVar(current, 'GITHUB_APP_ID', String(appId));
    updated = updateEnvVar(updated, 'GITHUB_WEBHOOK_SECRET', webhookSecret);
    updated = updateEnvVar(updated, 'GITHUB_APP_PRIVATE_KEY_PATH', './github-app-private-key.pem');
    updated = updateEnvVar(updated, 'NEXT_PUBLIC_GITHUB_APP_NAME', slug);
    fs.writeFileSync(rootEnvPath, updated);
  } catch { /* non-fatal */ }

  // 3. Update the frontend .env so NEXT_PUBLIC_GITHUB_APP_NAME is set on next restart
  const frontendEnvPath = path.resolve(cwd, '.env');
  try {
    const current = fs.readFileSync(frontendEnvPath, 'utf-8');
    const updated = updateEnvVar(current, 'NEXT_PUBLIC_GITHUB_APP_NAME', slug);
    fs.writeFileSync(frontendEnvPath, updated);
  } catch { /* non-fatal */ }

  // 4. Redirect to the "app created" page with slug in the URL so the client
  //    can save it to localStorage immediately (no restart needed).
  const params = new URLSearchParams({
    github_app_slug: slug,
    app_id: String(appId),
    webhook_secret: webhookSecret,
  });

  return NextResponse.redirect(
    new URL(`/auth/callback/github-app-created?${params.toString()}`, req.url),
  );
}
