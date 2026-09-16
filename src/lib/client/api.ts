"use client";

export class ClientApiError extends Error {
  constructor(public status: number, message: string, public code?: string | null, public issues?: { path: string; message: string }[]) { super(message); }
}

/** Chamada JSON com cabeçalho anti-CSRF e tratamento uniforme de erro. */
export async function api<T = unknown>(url: string, opts: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? (opts.body === undefined ? "GET" : "POST"),
    headers: { "x-requested-with": "fetch", ...(opts.body !== undefined ? { "content-type": "application/json" } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin", signal: opts.signal,
  });
  const text = await res.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) {
    const d = (data ?? {}) as { error?: string; code?: string; issues?: { path: string; message: string }[] };
    throw new ClientApiError(res.status, d.error ?? `Erro ${res.status}`, d.code, d.issues);
  }
  return data as T;
}

export async function upload<T = unknown>(url: string, form: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", body: form, headers: { "x-requested-with": "fetch" }, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ClientApiError(res.status, data.error ?? `Erro ${res.status}`, data.code);
  return data as T;
}

/** Identificador de requisição para reenvios idempotentes. */
export function requestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
