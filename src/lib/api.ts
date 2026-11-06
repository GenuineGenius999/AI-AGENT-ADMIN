import { supabase } from './supabase';

/** Backend base URL — required when frontend is hosted separately. */
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'https://chat-backend-service.vercel.app'
).replace(/\/$/, '');

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  personality: string;
  life_story: string;
  system_prompt: string;
  integration_secret: string;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiKey = {
  id: string;
  label: string;
  key_prefix: string;
  key_preview: string;
  is_active: boolean;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_requests: number;
  last_used_at: string | null;
  created_at: string;
};

export type UsageSeries = {
  api_key_id: string;
  label: string;
  key_prefix: string;
  is_active: boolean;
  current_total_tokens: number;
  current_total_requests: number;
  points: Array<{
    recorded_at: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    total_requests: number;
  }>;
};

export const api = {
  getProfile: () => request<{ profile: Profile }>('/api/profile/me'),
  updateProfile: (payload: {
    first_name: string;
    last_name: string;
    birthday: string;
    personality: string;
    life_story: string;
    system_prompt: string;
  }) =>
    request<{ profile: Profile }>('/api/profile/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  rotateSecret: () =>
    request<{ integration_secret: string }>('/api/profile/me/rotate-secret', {
      method: 'POST',
    }),
  listKeys: () => request<{ keys: ApiKey[] }>('/api/keys'),
  addKey: (label: string, api_key: string) =>
    request<{ key: ApiKey }>('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ label, api_key }),
    }),
  updateKey: (id: string, payload: { label?: string; is_active?: boolean }) =>
    request<{ key: ApiKey }>(`/api/keys/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteKey: (id: string) =>
    request<{ ok: boolean }>(`/api/keys/${id}`, { method: 'DELETE' }),
  usageSeries: () => request<{ series: UsageSeries[] }>('/api/keys/usage/series'),
  snapshotNow: () =>
    request<{ ok: boolean; snapshots_created: number }>(
      '/api/keys/usage/snapshot-now',
      { method: 'POST' }
    ),
  chat: (message: string) =>
    request<{
      reply: string;
      model: string;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    }>('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
