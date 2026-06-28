// Typed client for the Django REST backend.
// All requests send credentials (httpOnly cookies) automatically.

const BASE = process.env.NEXT_PUBLIC_DJANGO_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null
        ? ((body as Record<string, unknown>).detail as string | undefined) ??
          Object.values(body as Record<string, unknown>)
            .flat()
            .join(' ')
        : 'Request failed';
    throw new ApiError(res.status, body, message);
  }

  return body as T;
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  account_type: 'solo' | 'creator' | 'agency' | 'business';
  interests: string[];
  email_verified: boolean;
  created_at: string;
}

export interface YouTubeChannelRecord {
  id: string;
  channel_id: string;
  channel_name: string;
  thumbnail_url: string;
  subscriber_count: number;
  status: 'ACTIVE' | 'RECONNECT_REQUIRED' | 'INACTIVE';
  connected_at: string;
  last_synced_at: string | null;
}

export interface PlatformConnectionRecord {
  id: string;
  platform: 'spotify';
  display_name: string;
  avatar_url: string;
  status: 'ACTIVE' | 'INACTIVE';
  connected_at: string;
}

export interface ExperimentRecord {
  id: string;
  template: string | null;
  title: string;
  hypothesis: string;
  variable: string;
  success_metric: string;
  creator_name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DRAFT';
  signal: 'up' | 'down' | 'neutral';
  current_lift: string;
  days_running: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  result: ExperimentResultRecord | null;
}

export interface ExperimentResultRecord {
  winner: 'variant' | 'control' | 'inconclusive';
  baseline: number;
  result_value: number;
  lift: string;
  significance: number;
  metric_unit: string;
  what_happened: string;
  why_it_may_have: string;
  what_we_learned: string;
  what_to_test_next: string;
  completed_date: string;
}

export interface ExperimentWrite {
  title: string;
  hypothesis?: string;
  variable?: string;
  success_metric?: string;
  creator_name?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'DRAFT';
  signal?: 'up' | 'down' | 'neutral';
  current_lift?: string;
  days_running?: number;
  started_at?: string | null;
  completed_at?: string | null;
  template?: string | null;
}

// ─── API ───────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    signup: (data: {
      email: string;
      name: string;
      password: string;
      account_type: string;
      interests: string[];
    }) =>
      req<User>('/api/auth/signup/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (email: string, password: string) =>
      req<User>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    logout: () =>
      req<{ detail: string }>('/api/auth/logout/', { method: 'POST' }),

    me: () => req<User>('/api/auth/me/'),

    updateProfile: (data: Partial<Pick<User, 'name' | 'account_type' | 'interests'>>) =>
      req<User>('/api/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  connections: {
    youtube: {
      list: () => req<YouTubeChannelRecord[]>('/api/connections/youtube/'),

      register: (data: {
        channel_id: string;
        channel_name: string;
        thumbnail_url?: string;
        subscriber_count?: number;
      }) =>
        req<YouTubeChannelRecord>('/api/connections/youtube/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      remove: (id: string) =>
        req<void>(`/api/connections/youtube/${id}/`, { method: 'DELETE' }),
    },

    platforms: {
      list: () => req<PlatformConnectionRecord[]>('/api/connections/platforms/'),
      remove: (id: string) =>
        req<void>(`/api/connections/platforms/${id}/`, { method: 'DELETE' }),
    },
  },

  experiments: {
    list: (status?: string) =>
      req<ExperimentRecord[]>(
        `/api/experiments/${status ? `?status=${status}` : ''}`,
      ),

    create: (data: ExperimentWrite) =>
      req<ExperimentRecord>('/api/experiments/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<ExperimentWrite>) =>
      req<ExperimentRecord>(`/api/experiments/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      req<void>(`/api/experiments/${id}/`, { method: 'DELETE' }),
  },
};
