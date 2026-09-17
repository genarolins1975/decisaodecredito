"use client";
import { useCallback, useEffect, useState } from "react";
import { api, upload, ClientApiError } from "@/lib/client/api";
import { StatusBadge, Callout } from "@/components/ui";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { fmtDT } from "@/lib/time";

type Step = { id: string; number: number; title: string; description: string | null; pageSlug: string | null; expectedOutputs: string[]; requiresDelivery: boolean; dueAt: string | null };
type Sub = { id: string; versionNo: number; status: string; submittedAt: string | null; late: boolean; receiptHash: string | null; membersSnapshot: { name: string }[]; links: string[]; note: string | null; returnedReason: string | null; effectiveDueAt: string | null; files: { id: string; name: string; size: number; sha256: string | null; status: string }[] };
type Data = {
  assignment: { id: string; title: string; description: string; objectives: string | null; prerequisites: string | null; materials: string | null; deliverables: string[]; allowedFormats: string[]; maxFileMb: number; mode: string; dueAt: string | null; latePolicy: { acceptLate: boolean; penaltyPerDayPct: number; startedBeforeDeadlineCounts: boolean; graceMinutes?: number; hardDeadlineAt?: string | null }; steps: Step[]; status: string; blindTestEnabled: boolean };
  rubric: { criteria: { key: string; name: string; question?: string; weight?: number; levels: { score: number; label: string; description: string }[] }[]; cutoffRule?: string | null; maxScore?: number; levelsLegend?: string; individualQuestion?: string } | null;
  group: { id: string; name: string; members: { userId: string; name: string }[] } | null; submissions: Sub[];
  grade: { status: string; total: string | null; scores: Record<string, number>; comments: string | null; feedbackFileId: string | null; individualDefense: { score: number; notes: string } | null; publishedAt: string; rubricVersionNo: number | null; calc: { total: number; max: number; detail: { key: string; name: string; score: number | null; weight: number; weighted: number | null }[]; cutoffFailed: boolean; rounding: string } | null } | null;
  due: { dueAt: string | null; extension: { reason: string } | null }; progress: { stepId: string; status: string; note: string | null }[];
  blind: { configured: boolean; datasetCode?: string | null; maxSubmissions: number; feedbackLevel: string; freezes: { id: string; modelVersion: string; manifestSha256: string; frozenAt: string; artifactHashes: { name: string; sha256: string }[] }[]; oot: { ok: boolean; reason?: string }; submissions: { id: string; submissionNo: number; validation: { valid: boolean; missing: number; duplicates: number; extra: number; rowsRead: number; expected: number }; submittedAt: string }[] } | null;
};

export function AssignmentStudent({ assignmentId, classId, isStudent }: { assignmentId: string; classId: string; isStudent: boolean }) {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api<Data>(`/api/trabalhos/${assignmentId}?classId=${classId}`).then(setD).catch((e) => setErr(e instanceof ClientApiError ? e.message : "Falha ao carregar")), [assignmentId, classId]);
  useEffect(() => { load(); }, [load]);
  const run = async (fn: () => Promise<string | void>) => { setErr(null); setOk(null); setBusy(true); try { const m = await fn(); if (m) setOk(m); await load(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha de rede"); } finally { setBusy(false); } };
  if (!d) return <p className="hint">{err ?? "Carregando…"}</p>;
  const a = d.assignment;
  const draft = d.submissions.find((s) => s.status === "rascunho");
  const current = d.submissions.find((s) => s.status !== "rascunho");
  const canEdit = isStudent && a.status === "published";

  async function uploadFile(file: File, purpose: string) {
    const fd = new FormData(); fd.set("classId", classId); fd.set("purpose", purpose); fd.set("assignmentId", assignmentId); fd.set("file", file);
    const r = await upload<{ file: { id: string; sha256: string; name: string } }>("/api/arquivos", fd);
    return r.file;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 flex flex-col gap-5">
        <header>
          <p className="eyebrow">{a.mode === "grupo" ? "Trabalho em grupo" : "Trabalho individual"}{d.group ? ` · ${d.group.name}` : ""}</p>
          <h1 className="mt-1">{a.title}</h1>
          <p className="mt-2 text-[15px]">{d.due.dueAt ? <>Prazo: <b>{fmtDT(d.due.dueAt)}</b> (horário de Brasília){d.due.extension && <span className="badge badge-gold ml-2">prazo individual: {d.due.extension.reason}</span>}</> : <span className="hint">Prazo a definir pelo professor.</span>}
            {a.latePolicy.acceptLate ? <span className="hint"> · Atraso aceito{a.latePolicy.penaltyPerDayPct ? ` com desconto de ${a.latePolicy.penaltyPerDayPct}% por dia` : ""}.</span> : <span className="hint"> · Não aceita atraso.</span>}
            {a.latePolicy.startedBeforeDeadlineCounts && <span className="hint"> Upload iniciado antes do prazo e concluído em até {a.latePolicy.graceMinutes ?? 15} min depois não conta como atraso.</span>}</p>
        </header>
        <ErrorBox message={err} /><SuccessBox message={ok} />
        <section className="card conteudo">
          <h2 className="text-lg mb-2">Enunciado</h2>
          <p className="whitespace-pre-line text-[15px]">{a.description}</p>
          {a.objectives && <><h3 className="mt-4 text-base">Objetivos</h3><p className="text-[14.5px]">{a.objectives}</p></>}
          {a.prerequisites && <><h3 className="mt-4 text-base">Pré-requisitos</h3><p className="text-[14.5px]">{a.prerequisites}</p></>}
          {a.materials && <><h3 className="mt-4 text-base">Materiais</h3><p className="text-[14.5px] whitespace-pre-line">{a.materials}</p></>}
          <h3 className="mt-4 text-base">Entregáveis</h3>
          <ul className="list-disc pl-5 text-[14.5px]">{a.deliverables.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="hint mt-2">Formatos aceitos: {a.allowedFormats.map((f) => (f === "link" ? "link" : "." + f)).join(", ")} · tamanho máximo por arquivo: {a.maxFileMb} MB. Notebooks e código não são executados no servidor.</p>
        </section>

        {a.steps.length > 0 && (
          <section className="card" aria-labelledby="missoes">
            <h2 id="missoes" className="text-lg mb-1">Missões</h2>
            <p className="hint mb-3">Marque o andamento para acompanhar o percurso do {d.group ? "grupo" : "trabalho"}. Nem toda missão tem entrega ou nota separada; o professor pode validar cada uma.</p>
            <ol className="list-none p-0 m-0 grid gap-2">
              {a.steps.map((s) => {
                const p = d.progress.find((x) => x.stepId === s.id);
                const st = p?.status ?? "pendente";
                return (
                  <li key={s.id} className="border border-rule rounded p-3 bg-paper">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-7 h-7 rounded-full grid place-items-center bg-ink text-white font-mono text-[12px] font-bold">{s.number}</span>
                      <b className="text-ink">{s.title}</b>
                      <StatusBadge status={st === "pendente" ? "pendente_step" : st} />
                      {s.dueAt && <span className="hint">até {fmtDT(s.dueAt)}</span>}
                      {s.pageSlug && <a className="hint" href={`/aulas/${s.pageSlug}`}>página {s.pageSlug}</a>}
                      <div className="flex-1" />
                      {canEdit && st !== "validada" && <select className="select max-w-[190px] min-h-[36px]" value={st} aria-label={`Andamento da missão ${s.number}`} onChange={(e) => run(async () => { await api(`/api/trabalhos/${assignmentId}/etapas/${s.id}`, { body: { classId, status: e.target.value } }); })}><option value="pendente">pendente</option><option value="em_andamento">em andamento</option><option value="concluida">concluída</option></select>}
                    </div>
                    {s.description && <p className="text-[14px] mt-1">{s.description}</p>}
                    {s.expectedOutputs.length > 0 && <p className="hint mt-1"><b>Saída esperada:</b> {s.expectedOutputs.join(" · ")}</p>}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {d.rubric && (
          <section className="card" aria-labelledby="rubrica">
            <h2 id="rubrica" className="text-lg mb-1">Rubrica{d.grade?.rubricVersionNo ? ` (versão ${d.grade.rubricVersionNo})` : ""}</h2>
            {d.rubric.cutoffRule && <Callout tone="warn" title="Regra de corte">{d.rubric.cutoffRule}</Callout>}
            <div className="table-wrap mt-2"><table className="table text-[13px]"><thead><tr><th>Dimensão</th>{d.rubric.criteria[0]?.levels.map((l) => <th key={l.score}>{l.label}</th>)}</tr></thead>
              <tbody>{d.rubric.criteria.map((c) => <tr key={c.key}><td><b>{c.name}</b>{c.question && <div className="hint">{c.question}</div>}</td>{c.levels.map((l) => <td key={l.score}>{l.description}</td>)}</tr>)}</tbody></table></div>
            {d.rubric.individualQuestion && <p className="mt-2 text-[14px]"><b>Pergunta individual:</b> {d.rubric.individualQuestion}</p>}
          </section>
        )}

        {d.grade && (
          <section className="card border-ok" aria-labelledby="nota">
            <h2 id="nota" className="text-lg mb-1">Resultado publicado em {fmtDT(d.grade.publishedAt)}</h2>
            <p><StatusBadge status={d.grade.status} /></p>
            {d.grade.status === "corrigido" && d.grade.calc && (
              <div className="mt-2 text-[14px]">
                <p className="font-serif text-2xl text-ink font-bold">{d.grade.calc.total} / {d.grade.calc.max}</p>
                <table className="table mt-2"><thead><tr><th>Dimensão</th><th>Pontos</th><th>Peso</th><th>Ponderado</th></tr></thead><tbody>{d.grade.calc.detail.map((x) => <tr key={x.key}><td>{x.name}</td><td>{x.score ?? "—"}</td><td>{x.weight}</td><td>{x.weighted ?? "—"}</td></tr>)}</tbody></table>
                <p className="hint mt-1">Cálculo: soma dos pontos ponderados; {d.grade.calc.rounding}.{d.grade.calc.cutoffFailed && <b className="text-alert"> Regra de corte acionada: zero em uma dimensão reprova o conjunto.</b>}</p>
              </div>
            )}
            {d.grade.individualDefense && <p className="mt-2 text-[14px]"><b>Defesa individual:</b> {d.grade.individualDefense.score} · {d.grade.individualDefense.notes}</p>}
            {d.grade.comments && <div className="callout mt-3 text-[14.5px] whitespace-pre-line">{d.grade.comments}</div>}
            {d.grade.feedbackFileId && <a className="btn btn-sm btn-secondary mt-3" href={`/api/arquivos/${d.grade.feedbackFileId}`}>Baixar devolutiva</a>}
          </section>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <section className="card" aria-labelledby="entrega">
          <h2 id="entrega" className="text-lg mb-1">Entrega</h2>
          {current && (
            <div className="mb-3 text-[14px]">
              <p className="flex items-center gap-2 flex-wrap"><StatusBadge status={current.status} /> versão {current.versionNo} · {fmtDT(current.submittedAt)}{current.late && <span className="badge badge-warn">atraso</span>}</p>
              {current.returnedReason && <div className="callout callout-alert mt-2"><b>Devolvido para revisão:</b> {current.returnedReason}</div>}
              <details className="mt-2"><summary className="cursor-pointer text-ink font-semibold">Recibo</summary>
                <dl className="kv mt-1 text-[12.5px]"><dt>Versão</dt><dd>{current.versionNo}</dd><dt>Horário do servidor</dt><dd>{fmtDT(current.submittedAt)}</dd><dt>Integridade</dt><dd className="font-mono break-all">{current.receiptHash}</dd><dt>Autores</dt><dd>{current.membersSnapshot.map((m) => m.name).join(", ")}</dd>
                  {current.files.map((f) => <div key={f.id} className="contents"><dt>Arquivo</dt><dd><a href={`/api/arquivos/${f.id}`}>{f.name}</a> <span className="font-mono break-all">{f.sha256?.slice(0, 16)}…</span></dd></div>)}
                  {current.links.map((l, i) => <div key={i} className="contents"><dt>Link</dt><dd><a href={l} target="_blank" rel="noreferrer">{l}</a></dd></div>)}</dl>
              </details>
            </div>
          )}
          {canEdit && !draft && <button className="btn btn-sm" disabled={busy} onClick={() => run(async () => { await api(`/api/trabalhos/${assignmentId}/rascunho`, { body: { classId } }); return current ? "Nova versão iniciada; a anterior fica no histórico." : "Rascunho criado."; })}>{current ? "Enviar nova versão" : "Iniciar entrega"}</button>}
          {canEdit && draft && (
            <div className="form-grid">
              <p className="hint">Rascunho da versão {draft.versionNo}. Nada é considerado entregue até você clicar em Enviar e receber o recibo.</p>
              <ul className="list-none p-0 m-0 grid gap-1 text-[13.5px]">{draft.files.map((f) => <li key={f.id} className="flex items-center gap-2 border border-rule rounded px-2 py-1"><span className="flex-1 truncate">{f.name} <span className="hint">({Math.round(f.size / 1024)} KB)</span></span><button className="btn btn-sm btn-ghost" onClick={() => run(async () => { await api(`/api/trabalhos/${assignmentId}/envios/${draft.id}/arquivos`, { method: "DELETE", body: { classId, fileId: f.id } }); })}>remover</button></li>)}</ul>
              <label className="text-[13px]">Adicionar arquivo<input type="file" className="block mt-1 text-[13px]" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; run(async () => { const up = await uploadFile(f, "submission"); await api(`/api/trabalhos/${assignmentId}/envios/${draft.id}/arquivos`, { body: { classId, fileId: up.id } }); return `Arquivo ${up.name} anexado (sha256 ${up.sha256.slice(0, 12)}…).`; }); e.target.value = ""; }} /></label>
              {a.allowedFormats.includes("link") && <label className="text-[13px]">Links (um por linha)<textarea className="textarea" defaultValue={draft.links.join("\n")} onBlur={(e) => run(async () => { await api(`/api/trabalhos/${assignmentId}/envios/${draft.id}`, { method: "PATCH", body: { classId, links: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) } }); })} /></label>}
              <label className="text-[13px]">Observação ao professor<textarea className="textarea" defaultValue={draft.note ?? ""} onBlur={(e) => run(async () => { await api(`/api/trabalhos/${assignmentId}/envios/${draft.id}`, { method: "PATCH", body: { classId, note: e.target.value } }); })} /></label>
              <button className="btn" disabled={busy} onClick={() => { if (confirm("Enviar esta versão? A composição do grupo e os arquivos serão congelados no recibo.")) run(async () => { const r = await api<{ receipt: { status: string; receiptHash: string; late: boolean } }>(`/api/trabalhos/${assignmentId}/envios/${draft.id}/enviar`, { body: { classId } }); return `Entrega registrada (${r.receipt.status}${r.receipt.late ? ", com atraso" : ""}). Recibo ${r.receipt.receiptHash.slice(0, 16)}…`; }); }}>Enviar</button>
            </div>
          )}
          {!isStudent && <p className="hint">Prévia como professor: sem envio.</p>}
          {d.submissions.filter((s) => s.status !== "rascunho").length > 1 && <details className="mt-3"><summary className="cursor-pointer hint">Versões anteriores</summary><ul className="hint list-disc pl-5">{d.submissions.filter((s) => s.status !== "rascunho" && s.id !== current?.id).map((s) => <li key={s.id}>v{s.versionNo} · {s.status} · {fmtDT(s.submittedAt)}</li>)}</ul></details>}
        </section>

        {a.blindTestEnabled && d.blind && (
          <section className="card" aria-labelledby="cego">
            <h2 id="cego" className="text-lg mb-1">Teste cego (OOT)</h2>
            <p className="hint mb-2">Ordem obrigatória: congelar o modelo (manifesto, versão e hashes) → receber o arquivo OOT sem desfecho → enviar previsões uma única vez ({d.blind.maxSubmissions} submissão{d.blind.maxSubmissions > 1 ? "ões" : ""}). Os rótulos ficam apenas com o professor.{d.blind.datasetCode ? ` O OOT é o da base ${d.blind.datasetCode} do seu grupo.` : ""}</p>
            {d.blind.freezes.filter((f) => !f.modelVersion.endsWith("-invalidado")).length === 0 ? (
              canEdit && <FreezeForm onSubmit={async (file, version, hashes) => run(async () => { const up = await uploadFile(file, "manifest"); await api(`/api/trabalhos/${assignmentId}/congelar`, { body: { classId, manifestFileId: up.id, modelVersion: version, artifactHashes: hashes } }); return "Modelo congelado. Agora o arquivo OOT pode ser baixado."; })} busy={busy} />
            ) : d.blind.freezes.map((f) => <p key={f.id} className={`text-[13px] ${f.modelVersion.endsWith("-invalidado") ? "hint line-through" : ""}`}><b>Congelado</b> em {fmtDT(f.frozenAt)} · versão {f.modelVersion} · manifesto <span className="font-mono">{f.manifestSha256.slice(0, 12)}…</span> · {f.artifactHashes.length} hash(es)</p>)}
            <div className="mt-2">
              {d.blind.oot.ok ? <button className="btn btn-sm btn-secondary" onClick={() => run(async () => { const r = await api<{ downloadUrl: string }>(`/api/trabalhos/${assignmentId}/oot?classId=${classId}`); location.href = r.downloadUrl; })}>Baixar OOT sem desfecho</button> : <p className="hint">OOT bloqueado: {d.blind.oot.reason}</p>}
            </div>
            {d.blind.submissions.map((s) => <p key={s.id} className="text-[13px] mt-2">Submissão {s.submissionNo} em {fmtDT(s.submittedAt)}: {s.validation.valid ? <b className="text-ok">válida</b> : <b className="text-alert">inválida</b>} ({s.validation.rowsRead} linhas; esperadas {s.validation.expected}; faltantes {s.validation.missing}; duplicadas {s.validation.duplicates}; extras {s.validation.extra})</p>)}
            {canEdit && d.blind.oot.ok && d.blind.submissions.length < d.blind.maxSubmissions && (
              <label className="text-[13px] block mt-3">Enviar previsões (CSV: proposta_id, pd_modelo, decisao_politica, versao_modelo)<input type="file" accept=".csv" className="block mt-1 text-[13px]" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (!confirm("Enviar previsões OOT? Esta ação conta no limite de submissões.")) { e.target.value = ""; return; } run(async () => { const up = await uploadFile(f, "blind_predictions"); const r = await api<{ feedback: { validation: { valid: boolean }; remaining: number; metrics?: { auc?: number } } }>(`/api/trabalhos/${assignmentId}/cego`, { body: { classId, fileId: up.id } }); return `Recebido. Validação: ${r.feedback.validation.valid ? "ok" : "com problemas"}. Restam ${r.feedback.remaining}.${r.feedback.metrics?.auc !== undefined ? ` AUC ${r.feedback.metrics.auc.toFixed(3)}.` : ""}`; }); e.target.value = ""; }} /></label>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}

function FreezeForm({ onSubmit, busy }: { onSubmit: (file: File, version: string, hashes: { name: string; sha256: string }[]) => Promise<void>; busy: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("v1");
  const [hashes, setHashes] = useState("");
  return (
    <form className="form-grid" onSubmit={(e) => { e.preventDefault(); if (!file) return; const hs = hashes.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [name, sha] = l.split(/\s+/); return { name: name ?? "", sha256: (sha ?? "").toLowerCase() }; }); onSubmit(file, version, hs); }}>
      <label className="text-[13px]">Manifesto do modelo (md, json, txt, pdf ou zip)<input type="file" className="block mt-1 text-[13px]" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
      <label className="text-[13px]">Versão do modelo<input className="input" value={version} onChange={(e) => setVersion(e.target.value)} required maxLength={60} /></label>
      <label className="text-[13px]">Hashes SHA-256 dos artefatos (um por linha: nome hash)<textarea className="textarea font-mono text-[12px]" value={hashes} onChange={(e) => setHashes(e.target.value)} placeholder={"pipeline.py 3a7f…\nmodelo.pkl 9c1e…"} /></label>
      <button className="btn btn-sm" type="submit" disabled={busy || !file}>Congelar modelo</button>
      <p className="hint">O hash documenta a integridade do que foi congelado; não prova, sozinho, que não houve acesso prévio ao OOT.</p>
    </form>
  );
}
