"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";

export function PublishButton({ classId, aid, status }: { classId: string; aid: string; status: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const next = status === "published" ? "draft" : "published";
  return (
    <>
      {err && <span className="error-text">{err}</span>}
      <button type="button" className={`btn btn-sm ${status === "published" ? "btn-secondary" : ""}`} onClick={async () => {
        if (next === "published" && !confirm("Publicar este trabalho para os alunos? Revise prazo, formatos e rubrica antes.")) return;
        try { await api(`/api/professor/turmas/${classId}/trabalhos/${aid}`, { method: "PATCH", body: { status: next } }); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); }
      }}>{status === "published" ? "Despublicar (voltar a rascunho)" : "Publicar"}</button>
    </>
  );
}
