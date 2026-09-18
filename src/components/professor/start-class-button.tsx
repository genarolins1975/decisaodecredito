"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";

/** Botão de um clique: abre (ou retoma) a aula ao vivo do encontro e leva ao painel da aula. */
export function StartClassButton({ classId, meetingId, children = "Iniciar aula", size = "md", variant = "primary" }: { classId: string; meetingId: string; children?: React.ReactNode; size?: "sm" | "md"; variant?: "primary" | "secondary" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" className={`btn ${size === "sm" ? "btn-sm" : ""} ${variant === "secondary" ? "btn-secondary" : ""}`} disabled={busy} aria-busy={busy}
        onClick={async () => { setBusy(true); setErr(null); try { const r = await api<{ sessionId: string }>(`/api/professor/turmas/${classId}/encontros/${meetingId}/iniciar`, { body: {} }); router.push(`/professor/aovivo/${r.sessionId}`); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Não foi possível iniciar. Tente de novo."); setBusy(false); } }}>
        {busy ? "Abrindo…" : children}
      </button>
      {err && <span className="error-text" role="alert">{err}</span>}
    </span>
  );
}
