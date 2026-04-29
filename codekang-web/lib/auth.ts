import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { firebaseAuth } from './firebase';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'local';
  plan: string;
  onboardingCompleted: boolean;
  githubUsername?: string;
  gitlabUsername?: string;
  bitbucketUsername?: string;
}

export interface IGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  owner: { login: string };
  html_url: string;
  updated_at: string;
}

export interface IGitHubPR {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  head: { ref: string; sha: string };
  base: { ref: string };
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  html_url: string;
  draft: boolean;
}

export interface IGitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: { name: string; color: string }[];
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface IRepository {
  id: string;
  userId: string;
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
  defaultBranch: string;
  language?: string;
  stargazersCount: number;
  isInstalled: boolean;
  webhookId?: number;
  installationId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser: boolean;
  user: User;
}

// ─── Social sign-in ───────────────────────────────────────────────────────────

async function exchangeSocialToken(
  provider: 'google' | 'github',
  token: string,
): Promise<SocialLoginResult> {
  const res = await fetch(`${API_URL}/auth/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, token }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Authentication failed',
    );
  }

  return res.json() as Promise<SocialLoginResult>;
}

export async function signInWithGoogle(): Promise<SocialLoginResult> {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.idToken) throw new Error('No Google ID token returned');

  return exchangeSocialToken('google', credential.idToken);
}

export async function signInWithGitHub(): Promise<SocialLoginResult> {
  const provider = new GithubAuthProvider();
  provider.addScope('read:user');
  provider.addScope('user:email');

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = GithubAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken)
    throw new Error('No GitHub access token returned');

  return exchangeSocialToken('github', credential.accessToken);
}

// ─── Direct GitHub OAuth (No Firebase) ────────────────────────────────────────

export function getGitHubAppInstallUrl(): string | null {
  // Prefer env var (baked in at build time), fall back to slug saved in localStorage
  // after the setup flow (works without restarting Next.js).
  const appName =
    process.env.NEXT_PUBLIC_GITHUB_APP_NAME ||
    (typeof window !== 'undefined' ? localStorage.getItem('github_app_slug') : null);
  if (!appName) return null;
  const callbackUri = `${window.location.origin}/auth/callback/github-app`;
  return `https://github.com/apps/${appName}/installations/new?redirect_uri=${encodeURIComponent(callbackUri)}`;
}

export function getGitHubAppSetupUrl(): string {
  return '/github/setup';
}

export function getGithubAuthUrl(
  mode: 'login' | 'signup' | 'link' = 'login',
  returnTo = '/dashboard',
): string {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/github`;
  const scope = mode === 'link' ? 'repo read:user' : 'read:user user:email';
  const state = encodeURIComponent(JSON.stringify({ mode, returnTo }));

  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=${encodeURIComponent(scope)}&state=${state}`;
}

export async function exchangeGithubCode(code: string): Promise<string> {
  const redirectUri = `${window.location.origin}/auth/callback/github`;
  const res = await fetch(`${API_URL}/auth/github/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to exchange GitHub code',
    );
  }

  const { accessToken } = (await res.json()) as { accessToken: string };
  return accessToken;
}

export async function signInWithGitHubDirect(code: string): Promise<SocialLoginResult> {
  const accessToken = await exchangeGithubCode(code);
  return exchangeSocialToken('github', accessToken);
}

export async function linkWithGitHubDirect(code: string): Promise<User> {
  const githubAccessToken = await exchangeGithubCode(code);
  return linkVcs('github', githubAccessToken);
}

// ─── Email OTP sign-in ────────────────────────────────────────────────────────

export async function sendOtp(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to send OTP',
    );
  }
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<SocialLoginResult> {
  const res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Invalid OTP code',
    );
  }
  return res.json() as Promise<SocialLoginResult>;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function selectPlan(plan: string): Promise<User> {
  const res = await fetchWithAuth(`${API_URL}/auth/plan`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error('Failed to update plan');
  return res.json() as Promise<User>;
}

export async function linkVcs(
  provider: 'github' | 'gitlab' | 'bitbucket',
  token: string,
): Promise<User> {
  const res = await fetchWithAuth(`${API_URL}/auth/vcs/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to link VCS',
    );
  }
  return res.json() as Promise<User>;
}

export async function linkWithGitHub(): Promise<User> {
  const provider = new GithubAuthProvider();
  provider.addScope('repo');
  provider.addScope('read:user');

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = GithubAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (!token) throw new Error('No GitHub access token returned');
  return linkVcs('github', token);
}

export async function linkWithGitLab(): Promise<User> {
  const provider = new OAuthProvider('gitlab.com');
  provider.addScope('read_user');
  provider.addScope('api');

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = OAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (!token) throw new Error('No GitLab access token returned');
  return linkVcs('gitlab', token);
}

export async function linkWithBitbucket(): Promise<User> {
  const provider = new OAuthProvider('bitbucket.org');
  provider.addScope('account');
  provider.addScope('repository');

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = OAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (!token) throw new Error('No Bitbucket access token returned');
  return linkVcs('bitbucket', token);
}

export async function completeOnboarding(): Promise<void> {
  if (!getAccessToken()) return;
  await fetchWithAuth(`${API_URL}/auth/onboarding/complete`, {
    method: 'POST',
  });
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetchWithAuth(`${API_URL}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json() as Promise<User>;
}

export async function updateProfile(data: {
  name?: string;
  organizationName?: string;
}): Promise<User> {
  const res = await fetchWithAuth(`${API_URL}/auth/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json() as Promise<User>;
}

export async function fetchRepos(): Promise<IGitHubRepo[]> {
  const res = await fetchWithAuth(`${API_URL}/repos`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to fetch repositories',
    );
  }
  return res.json() as Promise<IGitHubRepo[]>;
}

export async function fetchConnectedRepos(): Promise<IRepository[]> {
  const res = await fetchWithAuth(`${API_URL}/repos/connected`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to fetch connected repositories',
    );
  }
  return res.json() as Promise<IRepository[]>;
}

export async function fetchConnectedRepo(repoId: string): Promise<IRepository> {
  const res = await fetchWithAuth(`${API_URL}/repos/${repoId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Repository not found',
    );
  }
  return res.json() as Promise<IRepository>;
}

export async function connectRepo(
  owner: string,
  repoName: string,
): Promise<IRepository> {
  const res = await fetchWithAuth(`${API_URL}/repos/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, repoName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to connect repository',
    );
  }
  return res.json() as Promise<IRepository>;
}

export async function disconnectRepo(repoId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/repos/${repoId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to disconnect repository',
    );
  }
}

// ─── Razorpay payments ────────────────────────────────────────────────────────

export interface IRazorpaySubscriptionResult {
  subscriptionId: string;
  razorpayKeyId: string;
  shortUrl: string;
}

export async function createRazorpaySubscription(
  planTier: 'starter' | 'team',
  billingPeriod: 'monthly' | 'annual' = 'monthly',
): Promise<IRazorpaySubscriptionResult> {
  const res = await fetchWithAuth(`${API_URL}/plans/subscription/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planTier, billingPeriod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to create subscription',
    );
  }
  return res.json() as Promise<IRazorpaySubscriptionResult>;
}

export async function cancelRazorpaySubscription(): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/plans/subscription/cancel`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to cancel subscription',
    );
  }
}

export interface ISubscription {
  creditsUsed: number;
  creditsReset: string | null;
  isActive: boolean;
  plan: {
    tier: string;
    name: string;
    tagline: string;
    creditsPerMonth: number | 'unlimited';
    autonomousFixEnabled: boolean;
    prReviewEnabled: boolean;
  };
}

export async function fetchSubscription(): Promise<ISubscription> {
  const res = await fetchWithAuth(`${API_URL}/plans/subscription`);
  if (!res.ok) throw new Error('Failed to fetch subscription');
  return res.json() as Promise<ISubscription>;
}

// ─── Organizations ────────────────────────────────────────────────────────────

export interface IOrganization {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description?: string;
  isPersonal: boolean;
  isArchived: boolean;
  timezone: string | null;
  internalVisibility: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function ensureDefaultOrg(): Promise<IOrganization> {
  const res = await fetchWithAuth(`${API_URL}/organizations/ensure-default`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to ensure default organization');
  return res.json() as Promise<IOrganization>;
}

export async function fetchOrganizations(): Promise<IOrganization[]> {
  const res = await fetchWithAuth(`${API_URL}/organizations`);
  if (!res.ok) return [];
  return res.json() as Promise<IOrganization[]>;
}

export async function createOrganization(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<IOrganization> {
  const res = await fetchWithAuth(`${API_URL}/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create organization');
  }
  return res.json() as Promise<IOrganization>;
}

export async function updateOrganization(
  orgId: string,
  updates: { name?: string; description?: string; timezone?: string; internalVisibility?: boolean },
): Promise<IOrganization> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to update organization');
  }
  return res.json() as Promise<IOrganization>;
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/organizations/${orgId}`, { method: 'DELETE' });
}

export async function archiveOrganization(orgId: string): Promise<IOrganization> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}/archive`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to archive organization');
  }
  return res.json() as Promise<IOrganization>;
}

export async function fetchOrgRepos(orgId: string): Promise<IRepository[]> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}/repos`);
  if (!res.ok) return [];
  return res.json() as Promise<IRepository[]>;
}

export async function addRepoToOrg(orgId: string, repoId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}/repos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to add repository');
  }
}

export async function removeRepoFromOrg(orgId: string, repoId: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/organizations/${orgId}/repos/${repoId}`, { method: 'DELETE' });
}

// ─── Repository Settings ──────────────────────────────────────────────────────

export interface IRepoSettings {
  triggers: {
    onPROpen: boolean;
    onPush: boolean;
    onDraft: boolean;
  };
  issueTypes: {
    bugs: boolean;
    security: boolean;
    performance: boolean;
    style: boolean;
    documentation: boolean;
  };
  reviewDepth: 'quick' | 'standard' | 'thorough';
  watchedBranches: string[];
  autoComment: boolean;
  notifyOnComplete: boolean;
}

export const DEFAULT_REPO_SETTINGS: IRepoSettings = {
  triggers: { onPROpen: true, onPush: false, onDraft: false },
  issueTypes: { bugs: true, security: true, performance: true, style: false, documentation: false },
  reviewDepth: 'standard',
  watchedBranches: [],
  autoComment: true,
  notifyOnComplete: false,
};

export async function fetchRepoSettings(repoId: string): Promise<IRepoSettings> {
  const res = await fetchWithAuth(`${API_URL}/repos/${repoId}/settings`);
  if (!res.ok) return { ...DEFAULT_REPO_SETTINGS };
  const raw = await res.json() as Partial<IRepoSettings>;
  return {
    triggers: { ...DEFAULT_REPO_SETTINGS.triggers, ...raw.triggers },
    issueTypes: { ...DEFAULT_REPO_SETTINGS.issueTypes, ...raw.issueTypes },
    reviewDepth: raw.reviewDepth ?? DEFAULT_REPO_SETTINGS.reviewDepth,
    watchedBranches: raw.watchedBranches ?? DEFAULT_REPO_SETTINGS.watchedBranches,
    autoComment: raw.autoComment ?? DEFAULT_REPO_SETTINGS.autoComment,
    notifyOnComplete: raw.notifyOnComplete ?? DEFAULT_REPO_SETTINGS.notifyOnComplete,
  };
}

export async function updateRepoSettings(repoId: string, settings: IRepoSettings): Promise<IRepoSettings> {
  const res = await fetchWithAuth(`${API_URL}/repos/${repoId}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to save settings');
  }
  return res.json() as Promise<IRepoSettings>;
}

export async function syncRepo(repoId: string): Promise<IRepository> {
  const res = await fetchWithAuth(`${API_URL}/repos/${repoId}/sync`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to sync repository');
  }
  return res.json() as Promise<IRepository>;
}

export async function fetchRepoPR(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<IGitHubPR> {
  const res = await fetchWithAuth(`${API_URL}/repos/${owner}/${repo}/pulls/${prNumber}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to fetch pull request');
  }
  return res.json() as Promise<IGitHubPR>;
}

export async function fetchRepoIssueById(
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<IGitHubIssue> {
  const res = await fetchWithAuth(`${API_URL}/repos/${owner}/${repo}/issues/${issueNumber}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to fetch issue');
  }
  return res.json() as Promise<IGitHubIssue>;
}

export async function fetchRepoPullRequests(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
): Promise<IGitHubPR[]> {
  const res = await fetchWithAuth(
    `${API_URL}/repos/${owner}/${repo}/pulls?state=${state}`,
  );
  if (!res.ok) return [];
  return res.json() as Promise<IGitHubPR[]>;
}

export async function fetchRepoIssues(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
): Promise<IGitHubIssue[]> {
  const res = await fetchWithAuth(
    `${API_URL}/repos/${owner}/${repo}/issues?state=${state}`,
  );
  if (!res.ok) return [];
  return res.json() as Promise<IGitHubIssue[]>;
}

// ─── PR Reviews ──────────────────────────────────────────────────────────────

export interface IPRReviewComment {
  path: string;
  line: number;
  body: string;
}

export interface IPRReview {
  id: number;
  owner: string;
  repo: string;
  pr_number: number;
  pr_title: string | null;
  head_sha: string | null;
  head_branch: string | null;
  summary: string;
  verdict: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  comments: IPRReviewComment[];
  fix_status: 'none' | 'pending' | 'running' | 'done' | 'failed';
  fix_pr_url: string | null;
  fix_branch: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchPRReview(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<IPRReview | null> {
  const res = await fetchWithAuth(`${API_URL}/review/${owner}/${repo}/${prNumber}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<IPRReview>;
}

export async function triggerPRFix(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<{ status: string; message?: string; prUrl?: string }> {
  const res = await fetchWithAuth(
    `${API_URL}/review/${owner}/${repo}/${prNumber}/fix`,
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to trigger fix');
  }
  return res.json() as Promise<{ status: string; message?: string; prUrl?: string }>;
}

// ─── Reports / Analytics ─────────────────────────────────────────────────────

export interface IReportStats {
  totals: {
    reviews: number;
    bugs: number;
    fixed: number;
    approved: number;
    requestChanges: number;
    commented: number;
  };
  prev: {
    reviews: number;
    bugs: number;
    fixed: number;
  };
  daily: Array<{ date: string; reviews: number; bugs: number }>;
  byRepo: Array<{ owner: string; repo: string; reviews: number; bugs: number; fixed: number }>;
  recent: Array<{
    owner: string;
    repo: string;
    pr_number: number;
    pr_title: string | null;
    verdict: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
    fix_status: 'none' | 'pending' | 'running' | 'done' | 'failed';
    fix_pr_url: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

export async function fetchReportStats(days: 7 | 30 | 90 | 0 = 30): Promise<IReportStats> {
  const res = await fetchWithAuth(`${API_URL}/review/stats?days=${days}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string; error?: string }).message ??
      (err as { message?: string; error?: string }).error ??
      `Failed to fetch report stats (${res.status})`,
    );
  }
  return res.json() as Promise<IReportStats>;
}

// ─── Token refresh ────────────────────────────────────────────────────────────

// Singleton promise — if multiple 401s fire in parallel, only one refresh
// request is made. All callers await the same promise and get the same token.
let _refreshPromise: Promise<string | 'INVALID' | 'SERVER_ERROR' | null> | null = null;

export async function refreshAccessToken(): Promise<string | 'INVALID' | 'SERVER_ERROR' | null> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      // 401/403 = token genuinely rejected → force sign-out
      // Any other non-ok (5xx, network hiccup during restart) → don't sign out
      if (res.status === 401 || res.status === 403) return 'INVALID' as const;
      if (!res.ok) return 'SERVER_ERROR' as const;

      const data = (await res.json()) as {
        accessToken?: string;
        refreshToken?: string;
      };
      if (data.accessToken && data.refreshToken) {
        saveTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
    } catch {
      // Network error (server restarting) — don't sign out
      return 'SERVER_ERROR' as const;
    }
    return null;
  })();

  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

export async function fetchWithAuth(
  url: string,
  opts?: RequestInit,
): Promise<Response> {
  const token = getAccessToken();
  if (!token) throw new Error('No access token');

  let res = await fetch(url, {
    ...opts,
    headers: { ...opts?.headers, Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken === 'INVALID' || newToken === null) {
      await signOut();
      throw new Error('Session expired');
    }
    if (newToken === 'SERVER_ERROR') {
      throw new Error('Server unavailable, please try again');
    }
    res = await fetch(url, {
      ...opts,
      headers: { ...opts?.headers, Authorization: `Bearer ${newToken}` },
    });
  }

  return res;
}

export async function archiveAccount(): Promise<void> {
  await fetchWithAuth(`${API_URL}/auth/account/archive`, { method: 'POST' });
}

export async function deleteAccount(): Promise<void> {
  await fetchWithAuth(`${API_URL}/auth/account`, { method: 'DELETE' });
}

export async function signOut() {
  const token = getAccessToken();
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  await firebaseSignOut(firebaseAuth).catch(() => {});
  clearTokens();
  window.location.href = '/in/login';
}

// ─── Real-Time Data Fetchers ──────────────────────────────────────────────────

export interface IOrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  email: string | null;
  displayName: string | null;
  status: 'active' | 'pending';
  invitedBy: string | null;
  createdAt: string;
}

export async function fetchOrgMembers(orgId: string): Promise<IOrganizationMember[]> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}/members`);
  if (!res.ok) return [];
  return res.json() as Promise<IOrganizationMember[]>;
}

export async function inviteOrgMember(
  orgId: string,
  email: string,
  role: 'admin' | 'member',
  displayName?: string,
): Promise<IOrganizationMember> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role, displayName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to invite member');
  }
  return res.json() as Promise<IOrganizationMember>;
}

export async function removeOrgMember(orgId: string, memberId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}/members/${memberId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to remove member');
  }
}

export async function updateOrgMemberRole(
  orgId: string,
  memberId: string,
  role: 'admin' | 'member',
): Promise<IOrganizationMember> {
  const res = await fetchWithAuth(`${API_URL}/organizations/${orgId}/members/${memberId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to update member role');
  }
  return res.json() as Promise<IOrganizationMember>;
}

export interface INotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<INotification[]> {
  const res = await fetchWithAuth(`${API_URL}/notifications`);
  if (!res.ok) return [];
  return res.json() as Promise<INotification[]>;
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
}

export interface ISupportTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    author: 'user' | 'agent';
    content: string;
    createdAt: string;
  }>;
}

export async function fetchSupportTickets(): Promise<ISupportTicket[]> {
  const res = await fetchWithAuth(`${API_URL}/support`);
  if (!res.ok) return [];
  return res.json() as Promise<ISupportTicket[]>;
}

export async function replyToTicket(ticketId: string, content: string): Promise<ISupportTicket> {
  const res = await fetchWithAuth(`${API_URL}/support/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to send reply');
  }
  return res.json() as Promise<ISupportTicket>;
}

export async function resolveTicket(ticketId: string): Promise<ISupportTicket> {
  const res = await fetchWithAuth(`${API_URL}/support/${ticketId}/resolve`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to resolve ticket');
  }
  return res.json() as Promise<ISupportTicket>;
}

export async function createSupportTicket(data: {
  subject: string;
  category: string;
  priority: string;
  message: string;
}): Promise<ISupportTicket> {
  const res = await fetchWithAuth(`${API_URL}/support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create ticket');
  }
  return res.json() as Promise<ISupportTicket>;
}

export interface IAuditLog {
  id: string;
  action: string;
  resource: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export async function fetchAuditLogs(): Promise<IAuditLog[]> {
  const res = await fetchWithAuth(`${API_URL}/audit`);
  if (!res.ok) return [];
  return res.json() as Promise<IAuditLog[]>;
}

export interface ISession {
  id: string;
  device: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
}

export async function fetchSessions(): Promise<ISession[]> {
  const res = await fetchWithAuth(`${API_URL}/auth/sessions`);
  if (!res.ok) return [];
  return res.json() as Promise<ISession[]>;
}

export async function revokeSession(sessionId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/auth/sessions/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to revoke session');
  }
}

// ─── Plans / Billing ─────────────────────────────────────────────────────────

export interface IPlanCatalogItem {
  tier: string;
  name: string;
  tagline: string;
  billingModel: string;
  pricing: {
    monthly: number | 'custom';
    annual: number | 'custom';
  };
  trialDays: number;
  features: {
    repos: { privateRepos: number | 'unlimited'; publicRepos: 'unlimited' };
    reviews: { prReviews: boolean; prSummarization: boolean; inlineComments: boolean; linterSast: boolean; reviewsPerHour: number | 'unlimited' };
    ai: { creditsPerMonth: number | 'unlimited'; autonomousFix: boolean; unitTestGeneration: boolean; mergeConflictResolution: boolean; issuePlanner: boolean; docstringGeneration: boolean; autofixSuggestions: boolean };
    integrations: { jiraLinear: boolean; linkedRepoAnalyses: number | 'unlimited'; mcpConnections: number | 'unlimited'; customPreMergeChecks: number | 'unlimited'; apiAccess: boolean };
    team: { rbac: boolean; analytics: boolean; customReports: boolean; auditLogging: boolean; sso: boolean; selfHosting: boolean; multiOrg: boolean; sla: boolean; dedicatedCsm: boolean };
  };
}

export async function fetchPlans(): Promise<IPlanCatalogItem[]> {
  const res = await fetchWithAuth(`${API_URL}/plans`);
  if (!res.ok) return [];
  return res.json() as Promise<IPlanCatalogItem[]>;
}
