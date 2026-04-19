import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
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
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/auth/plan`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error('Failed to update plan');
  return res.json() as Promise<User>;
}

export async function linkVcs(
  provider: 'gitlab' | 'bitbucket',
  token: string,
): Promise<User> {
  const accessToken = getAccessToken();
  const res = await fetch(`${API_URL}/auth/vcs/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
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

export async function completeOnboarding(): Promise<void> {
  const token = getAccessToken();
  if (!token) return;
  await fetch(`${API_URL}/auth/onboarding/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
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
