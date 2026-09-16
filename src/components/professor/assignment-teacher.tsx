"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, upload, ClientApiError } from "@/lib/client/api";
import { StatusBadge } from "@/components/ui";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { fmtDT } from "@/lib/time";

type Step = { id: string; number: number; title: string; description: string | null; pageSlug: string | null; expectedOutputs: string[]; requiresDelivery: boolean; dueAt: string | null };
type Sub = { id: string; versionNo: number; status: string; submittedAt: string | null; late: boolean; receiptHash: string | null; membersSnapshot: { userId: string; name: string }[]; links: string[]; note: string | null; groupId: string | null; submitter: string; isCurrent: boolean; files: { id: string; name: string; size: number; sha256: string | null }[] };
type Grade = { id: string; userId: string; name: string; status: string; total: string | null; scores: Record<string, number>; publishedAt: string | null; submissionId: string | null; comments: string | null; individualDefense: { score: number; notes: string } | null };
type Rubric = { criteria: { key: string; name: string; question?: string; weight?: number; levels: { score: number; label: string; description: string }[] }[]; cutoffRule?: string | null; individualQuestion?: string } | null;
type Blind = { cfg: { id: string; ootFileId: string | null; labelsFileId: string | null; releasePolicy: string; maxSubmissions: number; feedbackLevel: string; expectedIds: number | null } | null; submissions: { b: { id: string; submissionNo: number; validation: { valid: boolean; missing: number; duplicates: number; extra: number }; metrics: { auc?: number; ks?: number; brier?: number; logloss?: number; n?: number } | null; submittedAt: string }; user: string; group: string | null }[]; freezes: { f: { id: string; modelVersion: string; manifestSha256: string; frozenAt: string; notes: string | null; groupId: string | null; userId: string | null }; group: string | null; user: string | null }[] };

export function AssignmentTeacherPanel({ classId, assignment, rubric, submissions, grades, blind, groups, students, datasets }: {
  classId: string; assignment: { id: string; mode: string; steps: Step[]; blindTestEnabled: boolean; dueAt: string | null }; rubric: Rubric; submissions: Sub[]; grades: Grade[]; blind: Blind;
  groups: { id: string; name: string }[]; students: { userId: string; name: string }[]; datasets: { id: string; code: string; name: string; status: string }[];
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [grading, setGrading] = useState<string | null>(null);
  const run = async (fn: () => Promise<string | void>) => { setErr(null); setOk(null); try { const m = await fn(); if (m) setOk(m); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); } };
  const current = submissions.filter((s) => s.isCurrent);
  const aid = assignment.id;

  async function uploadFile(file: File, purpose: string) {
    const fd = new FormData(); fd.set("classId", classId); fd.set("purpose", purpose); fd.set("file", file);
    return (await upload<{ file: { id: string; name: string; sha256: string } }>("/api/arquivos", fd)).file;
  }

  return (
    <div className="flex flex-col gap-5">
      <ErrorBox message={err} /><SuccessBox message={ok} />

      <section className="card" aria-labelledby="envios">
        <div className="flex items-center gap-3 mb-2"><h3 id="envios" className="text-lg">Entregas vigentes ({current.length})</h3><div className="flex-1" />
          <button className="btn btn-sm" onClick={() => { if (confirm("Publicar todas as notas corrigidas deste trabalho? Os alunos passam a ver o resultado.")) run(async () => { const r = await api<{ published: number }>(`/api/professor/turmas/${classId}/trabalhos/${aid}/publicar-notas`, { body: {} }); return `${r.published} nota(s) publicada(s).`; }); }}>Publicar notas corrigidas</button></div>
        <div className="table-wrap"><table className="table text-[13px]">
          <thead><tr><th>Autores</th><th>Versão</th><th>Enviado</th><th>Situação</th><th>Arquivos</th><th>Nota</th><th>Ações</th></tr></thead>
          <tbody>
            {current.map((s) => {
              const g = grades.filter((x) => x.submissionId === s.id);
              return (
                <tr key={s.id}>
                  <td>{s.membersSnapshot.map((m) => m.name).join(", ") || s.submitter}<div className="hint">{s.groupId ? "grupo (composição congelada no envio)" : "individual"}</div></td>
                  <td>v{s.versionNo}</td><td>{fmtDT(s.submittedAt)}{s.late && <span className="badge badge-warn ml-1">atraso</span>}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.files.map((f) => <div key={f.id}><a href={`/api/arquivos/${f.id}`}>{f.name}</a> <span className="hint">{Math.round(f.size / 1024)} KB</span></div>)}{s.links.map((l, i) => <div key={i}><a href={l} target="_blank" rel="noreferrer">{l}</a></div>)}{s.note && <div className="hint">“{s.note}”</div>}</td>
                  <td>{g.length ? g.map((x) => <div key={x.id}>{x.name.split(" ")[0]}: {x.status === "corrigido" ? x.total : x.status}{x.publishedAt ? " ✓" : ""}</div>) : <span className="hint">não corrigido</span>}</td>
                  <td className="whitespace-nowrap"><button className="btn btn-sm" onClick={() => setGrading(grading === s.id ? null : s.id)}>Corrigir</button> <button className="btn btn-sm btn-ghost" onClick={() => { const reason = prompt("Motivo da devolução para revisão:"); if (reason) run(async () => { await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/envios/${s.id}/devolver`, { body: { reason } }); return "Devolvido."; }); }}>Devolver</button></td>
                </tr>
              );
            })}
            {current.length === 0 && <tr><td colSpan={7} className="hint text-center py-4">Nenhuma entrega ainda.</td></tr>}
          </tbody></table></div>
        {grading && <GradeForm classId={classId} aid={aid} sub={submissions.find((s) => s.id === grading)!} rubric={rubric} existing={grades.filter((g) => g.submissionId === grading)} onDone={() => { setGrading(null); router.refresh(); }} uploadFile={uploadFile} />}
        <details className="mt-3"><summary className="cursor-pointer hint">Histórico de versões ({submissions.length - current.length} anteriores)</summary><ul className="hint list-disc pl-5">{submissions.filter((s) => !s.isCurrent).map((s) => <li key={s.id}>v{s.versionNo} · {s.status} · {fmtDT(s.submittedAt)} · {s.membersSnapshot.map((m) => m.name).join(", ")}</li>)}</ul></details>
      </section>

      <section className="card" aria-labelledby="exc">
        <h3 id="exc" className="text-lg mb-2">Exceções de prazo</h3>
        <form className="flex flex-wrap gap-2 items-end" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; run(async () => { const t = String(fd.get("target")); await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/excecoes`, { body: { ...(t.startsWith("g:") ? { groupId: t.slice(2) } : { userId: t.slice(2) }), dueAt: String(fd.get("dueAt")), reason: String(fd.get("reason")) } }); form.reset(); return "Exceção registrada."; }); }}>
          <label className="text-[13px]">Aluno ou grupo<select name="target" className="select" required><option value="">—</option>{groups.map((g) => <option key={g.id} value={`g:${g.id}`}>grupo {g.name}</option>)}{students.map((s) => <option key={s.userId} value={`u:${s.userId}`}>{s.name}</option>)}</select></label>
          <label className="text-[13px]">Novo prazo<input name="dueAt" type="datetime-local" className="input" required /></label>
          <label className="text-[13px] flex-1 min-w-[200px]">Justificativa<input name="reason" className="input" required /></label>
          <button className="btn btn-sm" type="submit">Registrar</button>
        </form>
      </section>

      <section className="card" aria-labelledby="etapas">
        <h3 id="etapas" className="text-lg mb-2">Etapas / missões ({assignment.steps.length})</h3>
        <ol className="list-none p-0 m-0 grid gap-1 text-[13.5px]">{assignment.steps.map((s) => <li key={s.id} className="flex flex-wrap gap-2 items-center border-b border-rule py-1"><b>{s.number}.</b> {s.title}{s.pageSlug && <span className="hint">· {s.pageSlug}</span>}{s.dueAt && <span className="hint">· até {fmtDT(s.dueAt)}</span>}{s.requiresDelivery && <span className="badge badge-ink">entrega</span>}</li>)}</ol>
        <form className="flex flex-wrap gap-2 items-end mt-3" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; run(async () => { await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/etapas`, { body: { number: Number(fd.get("number")), title: String(fd.get("title")), description: String(fd.get("description") || "") || null, pageSlug: String(fd.get("pageSlug") || "") || null, dueAt: String(fd.get("dueAt") || "") || null, requiresDelivery: fd.get("req") === "on" } }); form.reset(); return "Etapa salva."; }); }}>
          <label className="text-[13px]">Nº<input name="number" type="number" min={1} className="input max-w-[80px]" required defaultValue={assignment.steps.length + 1} /></label>
          <label className="text-[13px] flex-1 min-w-[200px]">Título<input name="title" className="input" required /></label>
          <label className="text-[13px]">Página<input name="pageSlug" className="input max-w-[110px]" placeholder="c11p3" /></label>
          <label className="text-[13px]">Prazo<input name="dueAt" type="datetime-local" className="input" /></label>
          <label className="text-[13px] flex items-center gap-1"><input type="checkbox" name="req" className="w-4 h-4 accent-ink" />exige entrega</label>
          <button className="btn btn-sm" type="submit">Adicionar etapa</button>
        </form>
      </section>

      {assignment.blindTestEnabled && (
        <section className="card" aria-labelledby="cego">
          <h3 id="cego" className="text-lg mb-1">Teste cego (OOT)</h3>
          <p className="hint mb-3">Cadastre o arquivo OOT sem desfecho (liberado aos grupos após o congelamento) e o arquivo de rótulos verdadeiros (colunas proposta_id e y), que fica restrito ao professor e é usado só para calcular métricas no servidor.</p>
          <div className="grid gap-3 md:grid-cols-3 text-[13px]">
            <label>OOT sem desfecho (csv/zip) {blind.cfg?.ootFileId ? <span className="text-ok">✓ cadastrado</span> : <span className="text-warn">pendente</span>}<input type="file" className="block mt-1" onChange={(e) => { const f = e.target.files?.[0]; if (f) run(async () => { const up = await uploadFile(f, "oot"); await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/cego`, { method: "PATCH", body: { ootFileId: up.id } }); return `OOT cadastrado (${up.name}).`; }); }} /></label>
            <label>Rótulos verdadeiros (csv, só professor) {blind.cfg?.labelsFileId ? <span className="text-ok">✓ cadastrado</span> : <span className="text-warn">pendente</span>}<input type="file" className="block mt-1" onChange={(e) => { const f = e.target.files?.[0]; if (f) run(async () => { const up = await uploadFile(f, "labels"); await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/cego`, { method: "PATCH", body: { labelsFileId: up.id } }); return "Rótulos cadastrados (privados)."; }); }} /></label>
            <div className="grid gap-2">
              <label>Máximo de submissões<input type="number" min={1} max={10} className="input" defaultValue={blind.cfg?.maxSubmissions ?? 1} onBlur={(e) => run(async () => { await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/cego`, { method: "PATCH", body: { maxSubmissions: Number(e.target.value) } }); })} /></label>
              <label>Devolutiva ao grupo<select className="select" defaultValue={blind.cfg?.feedbackLevel ?? "recibo"} onChange={(e) => run(async () => { await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/cego`, { method: "PATCH", body: { feedbackLevel: e.target.value } }); })}><option value="recibo">só recibo e validação de IDs</option><option value="agregado">AUC agregada</option><option value="completo">métricas completas</option></select></label>
              <label>Liberação do OOT<select className="select" defaultValue={blind.cfg?.releasePolicy ?? "apos_congelamento"} onChange={(e) => run(async () => { await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/cego`, { method: "PATCH", body: { releasePolicy: e.target.value } }); })}><option value="apos_congelamento">após congelamento do modelo</option><option value="livre">livre (não recomendado)</option></select></label>
            </div>
          </div>
          <h4 className="text-base mt-4">Congelamentos</h4>
          <ul className="text-[13px] list-disc pl-5">{blind.freezes.map((f) => <li key={f.f.id} className={f.f.modelVersion.endsWith("-invalidado") ? "line-through hint" : ""}>{f.group ?? f.user}: {fmtDT(f.f.frozenAt)} · {f.f.modelVersion} · <span className="font-mono">{f.f.manifestSha256.slice(0, 12)}</span>{f.f.notes && <span className="hint"> · {f.f.notes}</span>}</li>)}{blind.freezes.length === 0 && <li className="hint">nenhum</li>}</ul>
          <form className="flex flex-wrap gap-2 items-end mt-2" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); run(async () => { const t = String(fd.get("target")); await api(`/api/professor/turmas/${classId}/trabalhos/${aid}/cego/excecao`, { body: { ...(t.startsWith("g:") ? { groupId: t.slice(2) } : { userId: t.slice(2) }), reason: String(fd.get("reason")) } }); return "Exceção registrada: o grupo pode congelar novamente."; }); }}>
            <label className="text-[13px]">Exceção de congelamento para<select name="target" className="select" required><option value="">—</option>{groups.map((g) => <option key={g.id} value={`g:${g.id}`}>grupo {g.name}</option>)}{students.map((s) => <option key={s.userId} value={`u:${s.userId}`}>{s.name}</option>)}</select></label>
            <label className="text-[13px] flex-1 min-w-[200px]">Motivo (registrado)<input name="reason" className="input" required /></label>
            <button className="btn btn-sm btn-secondary" type="submit">Registrar exceção</button>
          </form>
          <h4 className="text-base mt-4">Submissões no teste cego (métricas privadas)</h4>
          <div className="table-wrap"><table className="table text-[13px]"><thead><tr><th>Quem</th><th>Nº</th><th>Quando</th><th>Validação</th><th>AUC</th><th>KS</th><th>Brier</th><th>log loss</th><th>n</th></tr></thead>
            <tbody>{blind.submissions.map((s) => <tr key={s.b.id}><td>{s.group ?? s.user}</td><td>{s.b.submissionNo}</td><td>{fmtDT(s.b.submittedAt)}</td><td>{s.b.validation.valid ? <span className="text-ok">válida</span> : <span className="text-alert">inválida (faltam {s.b.validation.missing}, dup {s.b.validation.duplicates}, extra {s.b.validation.extra})</span>}</td><td>{s.b.metrics?.auc?.toFixed(4) ?? "—"}</td><td>{s.b.metrics?.ks?.toFixed(4) ?? "—"}</td><td>{s.b.metrics?.brier?.toFixed(4) ?? "—"}</td><td>{s.b.metrics?.logloss?.toFixed(4) ?? "—"}</td><td>{s.b.metrics?.n ?? "—"}</td></tr>)}{blind.submissions.length === 0 && <tr><td colSpan={9} className="hint">nenhuma</td></tr>}</tbody></table></div>
          <p className="hint mt-2">Bases cadastradas: {datasets.map((d) => `${d.code} (${d.status})`).join(", ") || "nenhuma"}.</p>
        </section>
      )}
    </div>
  );
}

function GradeForm({ classId, aid, sub, rubric, existing, onDone, uploadFile }: { classId: string; aid: string; sub: Sub; rubric: Rubric; existing: Grade[]; onDone: () => void; uploadFile: (f: File, p: string) => Promise<{ id: string; name: string }> }) {
  const [scores, setScores] = useState<Record<string, number>>(existing[0]?.scores ?? {});
  const [comments, setComments] = useState(existing[0]?.comments ?? "");
  const [status, setStatus] = useState<"corrigido" | "dispensado" | "nao_entregue" | "zero">("corrigido");
  const [feedbackFileId, setFeedbackFileId] = useState<string | null>(null);
  const [defense, setDefense] = useState<Record<string, { score: number; notes: string }>>(Object.fromEntries(existing.filter((e) => e.individualDefense).map((e) => [e.userId, e.individualDefense!])));
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const total = rubric ? rubric.criteria.reduce((t, c) => t + (scores[c.key] ?? 0) * (c.weight ?? 1), 0) : null;
  const max = rubric ? rubric.criteria.reduce((t, c) => t + Math.max(...c.levels.map((l) => l.score)) * (c.weight ?? 1), 0) : null;
  const anyZero = rubric ? rubric.criteria.some((c) => scores[c.key] === 0) : false;
  return (
    <div className="panel-soft mt-3">
      <p className="eyebrow mb-2">Correção · v{sub.versionNo} · {sub.membersSnapshot.map((m) => m.name).join(", ")}</p>
      <ErrorBox message={err} /><SuccessBox message={result} />
      {rubric ? (
        <div className="grid gap-2">
          {rubric.criteria.map((c) => (
            <fieldset key={c.key} className="border border-rule rounded p-2 bg-white">
              <legend className="text-[13px] font-semibold text-ink px-1">{c.name}{c.question ? ` — ${c.question}` : ""}</legend>
              <div className="flex flex-wrap gap-2">{c.levels.map((l) => <label key={l.score} className={`text-[12.5px] border rounded px-2 py-1 cursor-pointer max-w-[260px] ${scores[c.key] === l.score ? "border-ink bg-[#EFF3FA]" : "border-rule"}`}><input type="radio" name={`r-${c.key}`} className="mr-1 accent-ink" checked={scores[c.key] === l.score} onChange={() => setScores({ ...scores, [c.key]: l.score })} /><b>{l.label}</b> {l.description}</label>)}</div>
            </fieldset>
          ))}
          <p className="text-[14px]">Total: <b>{total} / {max}</b>{rubric.cutoffRule && anyZero && <span className="text-alert font-semibold"> · regra de corte acionada ({rubric.cutoffRule})</span>}</p>
        </div>
      ) : <p className="hint">Sem rubrica associada: registre a situação e comentários.</p>}
      {sub.groupId && (
        <div className="mt-3">
          <p className="eyebrow mb-1">Defesa individual (registrada separadamente da entrega coletiva)</p>
          {sub.membersSnapshot.map((m) => <div key={m.userId} className="flex flex-wrap gap-2 items-center mb-1 text-[13px]"><span className="w-40">{m.name}</span><input type="number" step="0.5" className="input max-w-[90px]" placeholder="pontos" value={defense[m.userId]?.score ?? ""} onChange={(e) => setDefense({ ...defense, [m.userId]: { score: Number(e.target.value), notes: defense[m.userId]?.notes ?? "" } })} /><input className="input flex-1" placeholder="observação" value={defense[m.userId]?.notes ?? ""} onChange={(e) => setDefense({ ...defense, [m.userId]: { score: defense[m.userId]?.score ?? 0, notes: e.target.value } })} /></div>)}
        </div>
      )}
      <label className="text-[13px] block mt-3">Comentários (devolutiva)<textarea className="textarea" value={comments} onChange={(e) => setComments(e.target.value)} /></label>
      <div className="flex flex-wrap gap-3 items-end mt-2">
        <label className="text-[13px]">Situação<select className="select" value={status} onChange={(e) => setStatus(e.target.value as never)}><option value="corrigido">corrigido (nota pela rubrica)</option><option value="dispensado">dispensado</option><option value="nao_entregue">não entregue</option><option value="zero">nota zero</option></select></label>
        <label className="text-[13px]">Anexo de devolutiva<input type="file" className="block" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const up = await uploadFile(f, "feedback"); setFeedbackFileId(up.id); setResult(`Anexo ${up.name} pronto.`); } catch (ex) { setErr(ex instanceof ClientApiError ? ex.message : "Falha no upload"); } } }} /></label>
        <button className="btn btn-sm" onClick={async () => { setErr(null); try { const r = await api<{ total: { total: number; max: number } | null }>(`/api/professor/turmas/${classId}/trabalhos/${aid}/envios/${sub.id}/nota`, { body: { scores, comments, status, feedbackFileId, individualDefense: defense } }); setResult(`Correção salva${r.total ? `: ${r.total.total}/${r.total.max}` : ""}. Publique quando quiser liberar aos alunos.`); onDone(); } catch (ex) { setErr(ex instanceof ClientApiError ? ex.message : "Falha"); } }}>Salvar correção</button>
      </div>
    </div>
  );
}
