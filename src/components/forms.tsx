"use client";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { api, ClientApiError } from "@/lib/client/api";

export function Field({ label, hint, error, children, id }: { label: string; hint?: string; error?: string; children: (id: string, describedBy: string | undefined) => ReactNode; id?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  const described = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label className="label" htmlFor={fid}>{label}</label>
      {children(fid, described)}
      {hint && <p id={hintId} className="hint mt-1">{hint}</p>}
      {error && <p id={errId} className="error-text mt-1" role="alert">{error}</p>}
    </div>
  );
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="callout callout-alert" role="alert"><p className="text-[14px] font-semibold text-alert">{message}</p></div>;
}

export function SuccessBox({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="callout callout-ok" role="status"><p className="text-[14px] font-semibold text-ok">{message}</p></div>;
}

/** Formulário JSON genérico: envia para a API, mostra erro e chama onDone. */
export function JsonForm({ action, method = "POST", transform, onDone, children, submitLabel, busyLabel = "Enviando…", className = "" }: {
  action: string; method?: string; transform?: (fd: FormData) => unknown; onDone: (data: unknown) => void; children: ReactNode;
  submitLabel: string; busyLabel?: string; className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const body = transform ? transform(fd) : Object.fromEntries(fd.entries());
      const data = await api(action, { method, body });
      onDone(data);
    } catch (err) {
      setError(err instanceof ClientApiError ? (err.issues?.length ? err.issues.map((i) => i.message).join(" ") : err.message) : "Falha de rede. Tente novamente.");
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={onSubmit} className={`form-grid ${className}`} noValidate>
      <ErrorBox message={error} />
      {children}
      <button className="btn" type="submit" disabled={busy} aria-busy={busy}>{busy ? busyLabel : submitLabel}</button>
    </form>
  );
}
