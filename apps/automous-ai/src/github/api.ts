import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import fs from 'fs';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type {
  GitHubPullRequest,
  GitHubIssue,
  GitHubCheckRun,
} from '../types/github';
import { GitHubAPIError } from '../utils/errors';

// ─── GitHub App Auth ──────────────────────────────────────────────────────────

function isGitHubAppConfigured(): boolean {
  return (
    !!env.GITHUB_APP_ID &&
    env.GITHUB_APP_ID !== '123456' &&
    !!env.GITHUB_APP_PRIVATE_KEY_PATH &&
    fs.existsSync(env.GITHUB_APP_PRIVATE_KEY_PATH)
  );
}

function getOctokit(token?: string): Octokit {
  return new Octokit({ auth: token ?? env.GITHUB_TOKEN });
}

function getAppOctokit(installationId: number): Octokit {
  const privateKey = fs.readFileSync(env.GITHUB_APP_PRIVATE_KEY_PATH, 'utf8');
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey,
      installationId,
    },
  });
}

// ─── Issues ───────────────────────────────────────────────────────────────────

export async function getIssue(
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<GitHubIssue> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });
    return data as unknown as GitHubIssue;
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(
      `Failed to get issue #${issueNumber}: ${e.message}`,
      e.status,
    );
  }
}

export async function createIssueComment(
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
  installationId?: number,
): Promise<void> {
  if (env.GITHUB_TOKEN.includes('xxxx') && !isGitHubAppConfigured()) {
    logger.info('🧪 [TEST MODE] Bypassed GitHub Issue Comment', {
      issueNumber,
      bodyPreview: body.slice(0, 100),
    });
    return;
  }

  try {
    const octokit =
      installationId && isGitHubAppConfigured()
        ? getAppOctokit(installationId)
        : getOctokit();
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(
      `Failed to create comment: ${e.message}`,
      e.status,
    );
  }
}

export async function labelIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  labels: string[],
  installationId?: number,
): Promise<void> {
  if (env.GITHUB_TOKEN.includes('xxxx') && !isGitHubAppConfigured()) {
    logger.info('🧪 [TEST MODE] Bypassed GitHub Labeling', {
      issueNumber,
      labels,
    });
    return;
  }

  try {
    const octokit =
      installationId && isGitHubAppConfigured()
        ? getAppOctokit(installationId)
        : getOctokit();
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.warn('Failed to label issue', { error: e.message });
  }
}

// ─── Pull Requests ────────────────────────────────────────────────────────────

export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string,
  installationId?: number,
): Promise<GitHubPullRequest> {
  if (env.GITHUB_TOKEN.includes('xxxx') && !isGitHubAppConfigured()) {
    logger.info('🧪 [TEST MODE] Bypassed GitHub Pull Request Creation', {
      title,
      head,
      base,
    });
    return {
      number: 999,
      html_url: 'https://github.com/mock/pr/999',
    } as GitHubPullRequest;
  }

  try {
    const octokit =
      installationId && isGitHubAppConfigured()
        ? getAppOctokit(installationId)
        : getOctokit();
    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });
    return data as unknown as GitHubPullRequest;
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(`Failed to create PR: ${e.message}`, e.status);
  }
}

export async function mergePullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  mergeMethod: 'merge' | 'squash' | 'rebase' = 'squash',
  installationId?: number,
): Promise<void> {
  if (env.GITHUB_TOKEN.includes('xxxx') && !isGitHubAppConfigured()) {
    logger.info('🧪 [TEST MODE] Bypassed PR merge', { prNumber });
    return;
  }
  try {
    const octokit =
      installationId && isGitHubAppConfigured()
        ? getAppOctokit(installationId)
        : getOctokit();
    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: prNumber,
      merge_method: mergeMethod,
    });
    logger.info('PR merged', { owner, repo, prNumber, mergeMethod });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(
      `Failed to merge PR #${prNumber}: ${e.message}`,
      e.status,
    );
  }
}

export async function getPRCheckRuns(
  owner: string,
  repo: string,
  headSha: string,
): Promise<GitHubCheckRun[]> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.checks.listForRef({
      owner,
      repo,
      ref: headSha,
    });
    return data.check_runs as unknown as GitHubCheckRun[];
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(
      `Failed to get checks for ${headSha}: ${e.message}`,
      e.status,
    );
  }
}

export async function getPRHeadSha(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<string> {
  const octokit = getOctokit();
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  return data.head.sha;
}

// ─── Issue listing ────────────────────────────────────────────────────────────

export async function listOpenIssues(
  owner: string,
  repo: string,
  maxPages = 5,
): Promise<GitHubIssue[]> {
  const octokit = getOctokit();
  const all: GitHubIssue[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100,
      page,
    });
    // Filter out pull requests (GitHub returns PRs in issues API)
    const issues = (data as unknown as GitHubIssue[]).filter(
      (i: any) => !i.pull_request,
    );
    all.push(...issues);
    if (issues.length < 100) break; // last page
  }

  logger.info('Listed open issues', { owner, repo, count: all.length });
  return all;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getInstallationToken(
  installationId: number,
): Promise<string> {
  if (!installationId || !isGitHubAppConfigured()) {
    return env.GITHUB_TOKEN;
  }
  try {
    const privateKey = fs.readFileSync(env.GITHUB_APP_PRIVATE_KEY_PATH, 'utf8');
    const auth = createAppAuth({
      appId: env.GITHUB_APP_ID,
      privateKey,
      installationId,
    });
    const { token } = await auth({ type: 'installation' });
    return token;
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.warn(
      'GitHub App token generation failed, falling back to GITHUB_TOKEN',
      { error: e.message },
    );
    return env.GITHUB_TOKEN;
  }
}

// ─── PR Reviews (inline comments) ────────────────────────────────────────────

export interface PRReviewComment {
  path: string;
  line: number;
  body: string;
  side?: 'LEFT' | 'RIGHT';
}

export async function createPRReview(
  owner: string,
  repo: string,
  prNumber: number,
  commitId: string,
  body: string,
  comments: PRReviewComment[],
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT',
  installationId?: number,
): Promise<void> {
  if (env.GITHUB_TOKEN.includes('xxxx') && !isGitHubAppConfigured()) {
    logger.info('🧪 [TEST MODE] Bypassed PR Review', {
      prNumber,
      event,
      commentCount: comments.length,
    });
    return;
  }

  try {
    const octokit =
      installationId && isGitHubAppConfigured()
        ? getAppOctokit(installationId)
        : getOctokit();

    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: commitId,
      body,
      event,
      comments: comments.map((c) => ({
        path: c.path,
        line: c.line,
        body: c.body,
        side: c.side ?? 'RIGHT',
      })),
    });

    logger.info('PR review posted', {
      owner,
      repo,
      prNumber,
      event,
      inlineComments: comments.length,
    });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(
      `Failed to create PR review: ${e.message}`,
      e.status,
    );
  }
}

export async function getPRFiles(
  owner: string,
  repo: string,
  prNumber: number,
  installationId?: number,
): Promise<
  {
    filename: string;
    status: string;
    patch?: string;
    additions: number;
    deletions: number;
  }[]
> {
  try {
    const octokit =
      installationId && isGitHubAppConfigured()
        ? getAppOctokit(installationId)
        : getOctokit();

    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });
    return data.map((f) => ({
      filename: f.filename,
      status: f.status,
      patch: f.patch,
      additions: f.additions,
      deletions: f.deletions,
    }));
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(`Failed to list PR files: ${e.message}`, e.status);
  }
}

export async function getPR(
  owner: string,
  repo: string,
  prNumber: number,
  installationId?: number,
): Promise<GitHubPullRequest> {
  try {
    const octokit =
      installationId && isGitHubAppConfigured()
        ? getAppOctokit(installationId)
        : getOctokit();

    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    return data as unknown as GitHubPullRequest;
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    throw new GitHubAPIError(
      `Failed to get PR #${prNumber}: ${e.message}`,
      e.status,
    );
  }
}
