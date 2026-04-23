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

export function getGithubAuthUrl(
  mode: 'login' | 'link' = 'login',
  returnTo = '/dashboard',
): string {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/github`;
  const scope = mode === 'login' ? 'read:user user:email' : 'repo read:user';
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

// ─── Token refresh ────────────────────────────────────────────────────────────

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };
    if (data.accessToken && data.refreshToken) {
      saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }
  } catch {}
  return null;
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
    if (!newToken) {
      await signOut();
      throw new Error('Session expired');
    }
    res = await fetch(url, {
      ...opts,
      headers: { ...opts?.headers, Authorization: `Bearer ${newToken}` },
    });
  }

  return res;
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
