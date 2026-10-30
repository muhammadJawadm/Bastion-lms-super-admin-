import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./api";
import type { ApiResponse, Company } from "./types";

type Query = Parameters<typeof api.get>[1];

interface Settled<T> {
  key: string | null;
  data: T | null;
  error: string | null;
}

// Minimal GET hook: refetches whenever path/query change; `reload` for after a mutation.
// Pass path = null to skip the request. `loading` is derived: true until the
// response for the *current* request key has landed.
export function useApi<T>(path: string | null, query?: Query) {
  const [nonce, setNonce] = useState(0);
  const queryKey = JSON.stringify(query ?? {});
  const key = path === null ? null : `${path}?${queryKey}#${nonce}`;
  const [settled, setSettled] = useState<Settled<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    if (path === null || key === null) return;
    let cancelled = false;
    api
      .get<T>(path, JSON.parse(queryKey))
      .then((data) => { if (!cancelled) setSettled({ key, data, error: null }); })
      .catch((err) => { if (!cancelled) setSettled({ key, data: null, error: errorMessage(err) }); });
    return () => { cancelled = true; };
  }, [path, queryKey, key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const loading = key !== null && settled.key !== key;
  return {
    data: loading ? null : settled.data,
    error: loading ? null : settled.error,
    loading,
    reload,
  };
}

// Debounces a fast-changing value (search boxes) so we don't fire a request per keystroke.
export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// Company id → name lookup, used to label cross-company tables.
export function useCompanyNames() {
  const { data, loading, reload } = useApi<ApiResponse<Company[]>>("/admin/companies");
  const companies = data?.data ?? [];
  const names: Record<string, string> = {};
  companies.forEach((c) => { names[c._id] = c.name; });
  return { companies, names, loading, reload };
}
