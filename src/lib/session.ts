import type { SessionUser } from "./types";

const TOKEN_KEY = "bastion_sa_token";
const USER_KEY = "bastion_sa_user";

// localStorage can throw (private mode, blocked storage) — fall back to memory
// so login still works for this page load instead of looping back to /login.
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — memory copy lasts for this page load */
  }
}

export function getToken(): string | null {
  return read(TOKEN_KEY);
}

export function getSessionUser(): SessionUser | null {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user?: SessionUser) {
  write(TOKEN_KEY, token);
  if (user) write(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  memory.clear();
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
