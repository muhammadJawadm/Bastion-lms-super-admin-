import { clearSession, getToken } from "./session";

// No "/api" prefix — the backend mounts routes at the root (see backend src/app.js).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://16.192.77.140.nip.io").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  auth?: boolean;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(API_BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

// The backend answers an expired/invalid JWT with 403 "Token is not valid"
// (not 401), so that message is the only way to tell it apart from a real
// role-based 403 "Forbidden".
function isDeadToken(status: number, message: string) {
  return status === 401 || (status === 403 && message === "Token is not valid");
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, `Can't reach the API at ${API_BASE_URL}. Is the backend running?`);
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const raw = json && typeof json === "object" && "message" in json ? (json as { message: unknown }).message : null;
    const message = typeof raw === "string" && raw ? raw : `Request failed (${res.status})`;
    if (auth && isDeadToken(res.status, message)) {
      clearSession();
      if (window.location.pathname !== "/login") window.location.assign("/login?expired=1");
    }
    throw new ApiError(res.status, message);
  }

  return json as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>(path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
