"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { ErrorBox, SuccessBox } from "@/components/forms";

type Cfg = { attendance?: { minimumPct?: number | null; lateCountsAs?: string; justifiedCountsAs?: string; lateToleranceMin?: number }; videoUrl?: string | null };

export function ClassConfigPanel({ classId, config, cls }: { classId: string; config: Cfg; cls: { code: string; name: string; status: string; archivePolicy: string } }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const a = config.attendance ?? {};
  const [min, setMin] = useState(a.minimumPct != null ? String(a.minimumPct) : "");
  const [late, setLate] = useState(a.lateCountsAs ?? "ausente");
  const [just, setJust] = useState(a.justifiedCountsAs ?? "ausente");
  const save = async () => {
    setErr(null); setOk(null);
    try { await api(`/api/professor/turmas/${classId}/config`, { method: "PATCH", body: { attendance: { minimumPct: min === "" ? null : Number(min), lateCountsAs: late, justifiedCountsAs: just } } }); setOk("Regra de frequência salva."); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); }
  };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ErrorBox message={err} /><SuccessBox message={ok} />
      <section className="card">
        <h2 className="text-base mb-1">Regra de presença</h2>
        <p className="hint mb-3">A plataforma não impõe percentual institucional. Sem regra definida, o mapa mostra “regra não definida” e não reprova ninguém.</p>
        <div className="form-grid">
          <label className="text-[13px]">Frequência mínima (%), em branco quando não houver regra<input className="input" inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} placeholder="ex.: 75" /></label>
          <label className="text-[13px]">Atraso conta como<select className="select" value={late} onChange={(e) => setLate(e.target.value)}><option value="presente">presença</option><option value="meia">meia presença</option><option value="ausente">ausência</option></select></label>
          <label className="text-[13px]">Justificado conta como<select className="select" value={just} onChange={(e) => setJust(e.target.value)}><option value="presente">presença</option><option value="ausente">ausência</option><option value="excluido">excluído do denominador</option></select></label>
          <button className="btn btn-sm self-start" onClick={save}>Salvar</button>
        </div>
      </section>
      <section className="card">
        <h2 className="text-base mb-1">Turma</h2>
        <dl className="kv"><dt>Código</dt><dd>{cls.code}</dd><dt>Nome</dt><dd>{cls.name}</dd><dt>Situação</dt><dd>{cls.status}{cls.status === "archived" ? ` (${cls.archivePolicy === "closed" ? "fechada" : "somente leitura"})` : ""}</dd></dl>
        <p className="hint mt-3">Arquivar mantém todo o histórico e bloqueia novas interações dos alunos conforme a política; não concede acesso a antigos alunos automaticamente. A ação está em Turmas.</p>
      </section>
    </div>
  );
}
