import type { paths } from './schema';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ── Schema-derived helpers ────────────────────────────────────────────────────

/** Body type for a 200 JSON response */
type OkBody<P extends keyof paths, M extends keyof paths[P]> =
  paths[P][M] extends { responses: { 200: { content: { 'application/json': infer B } } } }
    ? B
    : paths[P][M] extends { responses: { 201: { content: { 'application/json': infer B } } } }
      ? B
      : never;

/** Request body type for a JSON endpoint */
type ReqBody<P extends keyof paths, M extends keyof paths[P]> =
  paths[P][M] extends { requestBody?: { content: { 'application/json': infer B } } } ? B : never;

// ── Domain types derived from the schema ──────────────────────────────────────

// The generated schema marks nullable fields as `unknown` — narrow them here.
type RawGame = OkBody<'/games', 'get'> extends (infer G)[] ? G : never;

export type Game = Omit<RawGame, 'condition' | 'notes' | 'publisher' | 'region'> & {
  condition: string | null;
  notes: string | null;
  publisher: string | null;
  region: string | null;
};

// Required fields come from the schema; optional extras (publisher, region, …) are not
// in the generated POST schema because the spec example omits them.
type SchemaGameInput = NonNullable<ReqBody<'/games', 'post'>>['game'];
export type GameInput = SchemaGameInput & {
  publisher?: string;
  region?: string;
  condition?: string;
  notes?: string;
};

// ── Error handling ────────────────────────────────────────────────────────────

export type ApiError = {
  status: number;
  data: unknown;
};

export function extractErrorMessage(err: unknown): string {
  const data = (err as ApiError)?.data as Record<string, unknown> | undefined;
  if (!data) return 'An error occurred';
  const fe = data['field-error'];
  if (Array.isArray(fe)) {
    return (fe[1] as string | undefined) ?? (data['error'] as string | undefined) ?? 'An error occurred';
  }
  const errors = data['errors'];
  if (errors && typeof errors === 'object') {
    return Object.values(errors as Record<string, string[]>).flat().join(', ');
  }
  return (data['error'] as string | undefined) ?? 'An error occurred';
}

// ── HTTP client ───────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; headers: Headers }> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (response.status === 204) {
    return { data: null as T, headers: response.headers };
  }

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data } satisfies ApiError;
  }

  return { data, headers: response.headers };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(
  email: ReqBody<'/login', 'post'>['email'],
  password: ReqBody<'/login', 'post'>['password'],
) {
  const result = await request<OkBody<'/login', 'post'>>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const authHeader = result.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  return { success: result.data.success, token: token ?? null };
}

export async function logout() {
  return request<OkBody<'/logout', 'post'>>('/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function createAccount(
  email: ReqBody<'/create-account', 'post'>['email'],
  password: ReqBody<'/create-account', 'post'>['password'],
  passwordConfirm: ReqBody<'/create-account', 'post'>['password-confirm'],
) {
  return request<OkBody<'/create-account', 'post'>>('/create-account', {
    method: 'POST',
    body: JSON.stringify({ email, password, 'password-confirm': passwordConfirm }),
  });
}

export async function resetPasswordRequest(
  email: ReqBody<'/reset-password-request', 'post'>['email'],
) {
  return request<OkBody<'/reset-password-request', 'post'>>('/reset-password-request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  key: ReqBody<'/reset-password', 'post'>['key'],
  password: ReqBody<'/reset-password', 'post'>['password'],
  passwordConfirm: ReqBody<'/reset-password', 'post'>['password-confirm'],
) {
  return request<OkBody<'/reset-password', 'post'>>('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ key, password, 'password-confirm': passwordConfirm }),
  });
}

// ── Games ─────────────────────────────────────────────────────────────────────

export async function listGames(): Promise<Game[]> {
  const result = await request<Game[]>('/games');
  return result.data;
}

export async function getGame(id: number): Promise<Game> {
  const result = await request<Game>(`/games/${id}`);
  return result.data;
}

export async function createGame(game: GameInput): Promise<Game> {
  const result = await request<Game>('/games', {
    method: 'POST',
    body: JSON.stringify({ game }),
  });
  return result.data;
}

export async function updateGame(id: number, game: Partial<GameInput>): Promise<Game> {
  const result = await request<Game>(`/games/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ game }),
  });
  return result.data;
}

export async function deleteGame(id: number): Promise<void> {
  await request<null>(`/games/${id}`, { method: 'DELETE' });
}
