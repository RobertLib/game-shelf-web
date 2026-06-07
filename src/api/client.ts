import type { paths } from "./schema";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ── Schema-derived helpers ────────────────────────────────────────────────────

/** Body type for a 200 JSON response */
type OkBody<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends {
  responses: { 200: { content: { "application/json": infer B } } };
}
  ? B
  : paths[P][M] extends {
        responses: { 201: { content: { "application/json": infer B } } };
      }
    ? B
    : never;

/** Request body type for a JSON endpoint */
type ReqBody<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends {
  requestBody?: { content: { "application/json": infer B } };
}
  ? B
  : never;

// ── Error handling ────────────────────────────────────────────────────────────

export type ApiError = {
  status: number;
  data: unknown;
};

export function extractErrorMessage(err: unknown): string {
  const data = (err as ApiError)?.data as Record<string, unknown> | undefined;
  if (!data) return "An error occurred";
  const fe = data["field-error"];
  if (Array.isArray(fe)) {
    return (
      (fe[1] as string | undefined) ??
      (data["error"] as string | undefined) ??
      "An error occurred"
    );
  }
  const errors = data["errors"];
  if (errors && typeof errors === "object") {
    return Object.values(errors as Record<string, string[]>)
      .flat()
      .join(", ");
  }
  return (data["error"] as string | undefined) ?? "An error occurred";
}

// ── HTTP client ───────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; headers: Headers }> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (response.status === 204) {
    return { data: null as T, headers: response.headers };
  }

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    throw { status: response.status, data } satisfies ApiError;
  }

  return { data, headers: response.headers };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(
  email: ReqBody<"/api/v1/login", "post">["email"],
  password: ReqBody<"/api/v1/login", "post">["password"],
) {
  const result = await request<OkBody<"/api/v1/login", "post">>(
    "/api/v1/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
  const authHeader = result.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
  return { success: result.data.success, token: token ?? null };
}

export async function logout() {
  return request<OkBody<"/api/v1/logout", "post">>("/api/v1/logout", {
    method: "POST",
  });
}

export async function createAccount(
  email: ReqBody<"/api/v1/create-account", "post">["email"],
  password: ReqBody<"/api/v1/create-account", "post">["password"],
  passwordConfirm: ReqBody<
    "/api/v1/create-account",
    "post"
  >["password-confirm"],
) {
  return request<OkBody<"/api/v1/create-account", "post">>(
    "/api/v1/create-account",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        "password-confirm": passwordConfirm,
      }),
    },
  );
}

export async function resetPasswordRequest(
  email: ReqBody<"/api/v1/reset-password-request", "post">["email"],
) {
  return request<OkBody<"/api/v1/reset-password-request", "post">>(
    "/api/v1/reset-password-request",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export async function resetPassword(
  key: ReqBody<"/api/v1/reset-password", "post">["key"],
  password: ReqBody<"/api/v1/reset-password", "post">["password"],
  passwordConfirm: ReqBody<
    "/api/v1/reset-password",
    "post"
  >["password-confirm"],
) {
  return request<OkBody<"/api/v1/reset-password", "post">>(
    "/api/v1/reset-password",
    {
      method: "POST",
      body: JSON.stringify({
        key,
        password,
        "password-confirm": passwordConfirm,
      }),
    },
  );
}

export async function verifyAccount(
  key: ReqBody<"/api/v1/verify-account", "post">["key"],
) {
  return request<OkBody<"/api/v1/verify-account", "post">>(
    "/api/v1/verify-account",
    {
      method: "POST",
      body: JSON.stringify({ key }),
    },
  );
}

export async function verifyAccountResend(
  email: ReqBody<"/api/v1/verify-account-resend", "post">["email"],
) {
  return request<OkBody<"/api/v1/verify-account-resend", "post">>(
    "/api/v1/verify-account-resend",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

export type PaginationMeta =
  OkBody<"/api/v1/games", "get"> extends {
    pagination: infer P;
  }
    ? P
    : never;

// ── Users ─────────────────────────────────────────────────────────────────────

type UsersListBody = OkBody<"/api/v1/users", "get">;
export type User = UsersListBody extends { data: (infer U)[] } ? U : never;
export type UserInput = NonNullable<ReqBody<"/api/v1/users", "post">>["user"];

export type UsersListParams = NonNullable<
  paths["/api/v1/users"]["get"]["parameters"]["query"]
>;

export async function listUsers(
  params: UsersListParams = {},
): Promise<UsersListBody> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)));
  const result = await request<UsersListBody>(`/api/v1/users?${qs.toString()}`);
  return result.data;
}

export async function getUser(id: number): Promise<User> {
  const result = await request<{ data: User }>(`/api/v1/users/${id}`);
  return result.data.data;
}

export async function createUser(
  user: UserInput,
  password: string,
): Promise<User> {
  const result = await request<{ data: User }>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify({ user, password }),
  });
  return result.data.data;
}

export async function updateUser(
  id: number,
  user: Partial<UserInput>,
): Promise<User> {
  const result = await request<{ data: User }>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ user }),
  });
  return result.data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await request<null>(`/api/v1/users/${id}`, { method: "DELETE" });
}

// ── Games ─────────────────────────────────────────────────────────────────────

type GamesListBody = OkBody<"/api/v1/games", "get">;
export type Game = GamesListBody extends { data: (infer G)[] } ? G : never;
export type GameInput = NonNullable<ReqBody<"/api/v1/games", "post">>["game"];

export type GamesListParams = NonNullable<
  paths["/api/v1/games"]["get"]["parameters"]["query"]
>;

export async function listGames(
  params: GamesListParams = {},
): Promise<GamesListBody> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)));
  const result = await request<GamesListBody>(`/api/v1/games?${qs.toString()}`);
  return result.data;
}

export async function getGame(id: number): Promise<Game> {
  const result = await request<{ data: Game }>(`/api/v1/games/${id}`);
  return result.data.data;
}

export async function createGame(game: GameInput): Promise<Game> {
  const result = await request<{ data: Game }>("/api/v1/games", {
    method: "POST",
    body: JSON.stringify({ game }),
  });
  return result.data.data;
}

export async function updateGame(
  id: number,
  game: Partial<GameInput>,
): Promise<Game> {
  const result = await request<{ data: Game }>(`/api/v1/games/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ game }),
  });
  return result.data.data;
}

export async function deleteGame(id: number): Promise<void> {
  await request<null>(`/api/v1/games/${id}`, { method: "DELETE" });
}
