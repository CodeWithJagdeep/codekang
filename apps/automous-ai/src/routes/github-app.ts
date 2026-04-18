import { Router, type Request, type Response } from 'express';
import { Octokit } from '@octokit/rest';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = Router();

// ─── GET /github/setup ────────────────────────────────────────────────────────
// Redirects to GitHub to register the App via the manifest flow.
// Visit this URL once to create your GitHub App automatically.

router.get('/setup', (_req: Request, res: Response): void => {
  const manifest = {
    name: 'CodeKang',
    description: 'Autonomous AI agent that reviews PRs and fixes GitHub issues',
    url: `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}`,
    hook_attributes: {
      url: `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/webhook/github`,
      active: true,
    },
    redirect_url: `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/github/callback`,
    public: false,
    default_permissions: {
      contents: 'write',
      issues: 'write',
      pull_requests: 'write',
      checks: 'read',
      metadata: 'read',
    },
    default_events: ['issues', 'issue_comment', 'pull_request', 'push'],
  };

  const manifestJson = JSON.stringify(manifest);
  const state = Math.random().toString(36).slice(2);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Install CodeKang GitHub App</title></head>
    <body>
      <h1>Install CodeKang as a GitHub App</h1>
      <p>Click the button below to register CodeKang as a GitHub App in your account or organization.</p>
      <form action="https://github.com/settings/apps/new?state=${state}" method="post">
        <input type="hidden" name="manifest" value='${manifestJson.replace(/'/g, '&#39;')}'>
        <button type="submit" style="padding:10px 20px;font-size:16px;cursor:pointer">
          Create GitHub App
        </button>
      </form>
      <hr>
      <p><strong>Already have an App ID and private key?</strong></p>
      <p>Set these in your <code>.env.development</code>:</p>
      <pre>
GITHUB_APP_ID=&lt;your app id&gt;
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem
GITHUB_WEBHOOK_SECRET=&lt;webhook secret from app settings&gt;
      </pre>
    </body>
    </html>
  `);
});

// ─── GET /github/callback ─────────────────────────────────────────────────────
// GitHub redirects here after manifest flow with a one-time `code`.
// Exchanges the code for App credentials and saves them to disk.

router.get('/callback', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query as { code?: string };

  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

  try {
    const octokit = new Octokit();

    // Exchange code for App credentials
    const { data } = await (octokit as any).request(
      'POST /app-manifests/{code}/conversions',
      { code },
    );

    const appId = String(data.id);
    const privateKey: string = data.pem;
    const webhookSecret: string = data.webhook_secret;

    // Save private key to disk
    const keyPath = path.resolve(process.cwd(), 'github-app-private-key.pem');
    fs.writeFileSync(keyPath, privateKey, { mode: 0o600 });

    logger.info('GitHub App registered', { appId, keyPath });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>CodeKang App Installed</title></head>
      <body>
        <h1>GitHub App Created Successfully!</h1>
        <p>Update your <code>.env.development</code> with these values:</p>
        <pre>
GITHUB_APP_ID=${appId}
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem
GITHUB_WEBHOOK_SECRET=${webhookSecret}
        </pre>
        <p>Private key saved to: <code>${keyPath}</code></p>
        <p>
          Now <a href="https://github.com/apps/${data.slug}/installations/new" target="_blank">
            install the app on your repositories
          </a>
        </p>
      </body>
      </html>
    `);
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.error('GitHub App manifest conversion failed', { error: e.message });
    res.status(500).send(`Failed to create GitHub App: ${e.message}`);
  }
});

export default router;
