"use client";
import { useState } from "react";
import { api } from "@/lib/client/api";

/** Registra no catálogo o pacote de bases já enviado ao bucket (bases/v<versao>/manifesto.json). Só professor. */
export function RegistrarPacote({ editionId }: { editionId: string }) {
  const [versao, setVersao] = useState("1"); const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  return (
    <form className="panel-soft mt-4 grid gap-2" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setMsg(null);
      try {
        const r = await api<{ resumo: { arquivos_novos: number; arquivos_existentes: number; bases: string[]; materiais: string[]; turmas: string[] } }>(`/api/professor/edicoes/${editionId}/bases/registrar`, { body: { versao } });
        setMsg(`Registrado: ${r.resumo.bases.length} bases, ${r.resumo.materiais.length} materiais, ${r.resumo.arquivos_novos} arquivos novos e ${r.resumo.arquivos_existentes} já registrados; teste cego habilitado em ${r.resumo.turmas.join(", ") || "nenhuma turma"}. Recarregue a página.`);
      } catch (err) { setMsg(err instanceof Error ? err.message : "Falha ao registrar"); } finally { setBusy(false); }
    }}>
      <p className="eyebrow">Só professor · pacote de bases no bucket</p>
      <p className="hint">Depois de enviar o pacote ao bucket privado (scripts/dados/publicar.ts, modo upload), registre a versão aqui: o catálogo, os materiais comuns, os OOT e os rótulos por base e o teste cego do trabalho final são atualizados. Idempotente.</p>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-[13px]">Versão do pacote<input className="input" value={versao} onChange={(e) => setVersao(e.target.value)} required /></label>
        <button className="btn btn-sm" type="submit" disabled={busy}>{busy ? "Registrando" : "Registrar pacote"}</button>
      </div>
      {msg && <p className="text-[13px]" role="status">{msg}</p>}
    </form>
  );
}
