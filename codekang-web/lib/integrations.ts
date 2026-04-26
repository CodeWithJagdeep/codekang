import { fetchWithAuth, API_URL } from './auth';

export interface UserIntegration {
  id: string;
  provider: string;
  status: 'connected' | 'disabled';
  config: Record<string, string>;
  connectedAt: string;
  updatedAt: string;
}

export async function fetchIntegrations(): Promise<UserIntegration[]> {
  const res = await fetchWithAuth(`${API_URL}/integrations`);
  if (!res.ok) throw new Error('Failed to load integrations');
  return res.json() as Promise<UserIntegration[]>;
}

export async function connectIntegration(
  provider: string,
  config: Record<string, string>,
): Promise<UserIntegration> {
  const res = await fetchWithAuth(`${API_URL}/integrations/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? 'Failed to connect integration');
  }
  return res.json() as Promise<UserIntegration>;
}

export async function disconnectIntegration(provider: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/integrations/${provider}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to disconnect integration');
}

export async function updateIntegrationStatus(
  provider: string,
  status: 'connected' | 'disabled',
): Promise<UserIntegration> {
  const res = await fetchWithAuth(`${API_URL}/integrations/${provider}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update integration status');
  return res.json() as Promise<UserIntegration>;
}

export async function updateIntegrationConfig(
  provider: string,
  config: Record<string, string>,
): Promise<UserIntegration> {
  const res = await fetchWithAuth(`${API_URL}/integrations/${provider}/config`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config }),
  });
  if (!res.ok) throw new Error('Failed to update integration config');
  return res.json() as Promise<UserIntegration>;
}
