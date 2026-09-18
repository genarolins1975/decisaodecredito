"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { StatusBadge, Callout } from "@/components/ui";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { fmtDT } from "@/lib/time";

type Row = { id: string; name: string; email: string; role: string; status: string; userId: string | null; activatedAt: string | null; statusReason: string | null;
  invite: { createdAt: string; expiresAt: string; usedAt: string | null; supersededAt: string | null; expired: boolean } | null;
  lastEmail: { status: string; attempts: number; lastError: string | null; acceptedAt: string | null; createdAt: string; kind: string } | null };
type Preview = { rows: { line: number; name: string; email: string; role: string; status: string; message?: string }[]; errors: string[] };

const CSV_MODEL = "nome;email;papel\nMaria da Silva;maria.silva@exemplo.com;aluno\nJoão Souza;joao.souza@exemplo.com;aluno\n";

export function EnrollmentsPanel({ classId, rows, sender }: { classId: string; rows: Row[]; sender: { ok: boolean; sender?: string; reason?: string } }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<string>) => { setErr(null); setOk(null); setBusy(true); try { setOk(await fn()); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha de rede"); } finally { setBusy(false); } };
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const invitable = rows.filter((r) => ["autorizado", "convidado"].includes(r.status));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 flex flex-col gap-3">
        <ErrorBox message={err} /><SuccessBox message={ok} />
        {!sender.ok && <Callout tone="warn" title="Gmail não conectado">{sender.reason}. Os convites ficam na fila e só saem depois que você conectar o Gmail em E-mail.</Callout>}
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-sm btn-secondary" onClick={() => setSel(new Set(invitable.map((r) => r.id)))}>Selecionar quem ainda não ativou ({invitable.length})</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setSel(new Set())}>Limpar seleção</button>
          <div className="flex-1" />
          <button className="btn btn-sm" disabled={!sel.size || busy} onClick={() => { if (!confirm(`Emitir convite para ${sel.size} pessoa(s)? Reenvio invalida a credencial anterior; contas já ativas recebem apenas aviso.`)) return; run(async () => { const r = await api<{ results: { outcome: string }[]; note: string; processed: { sent: number; failed: number } | null }>(`/api/professor/turmas/${classId}/convites`, { body: { enrollmentIds: [...sel] } }); setSel(new Set()); return `${r.results.length} convite(s) processado(s). ${r.processed ? `Aceitos pelo Gmail: ${r.processed.sent}; falhas: ${r.processed.failed}. ` : ""}${r.note}`; }); }}>Enviar convites ({sel.size})</button>
        </div>
        <div className="table-wrap card p-0">
          <table className="table">
            <thead><tr><th><span className="sr-only">Selecionar</span></th><th>Nome</th><th>E-mail</th><th>Papel</th><th>Matrícula</th><th>Convite</th><th>Último envio</th><th>Ações</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" className="w-4 h-4 accent-ink" checked={sel.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Selecionar ${r.name}`} disabled={!["autorizado", "convidado"].includes(r.status)} /></td>
                  <td className="font-semibold">{r.name}</td>
                  <td className="font-mono text-[13px]">{r.email}</td>
                  <td>{r.role}</td>
                  <td><StatusBadge status={r.status} />{r.activatedAt && <div className="hint">ativada {fmtDT(r.activatedAt)}</div>}{r.statusReason && <div className="hint">{r.statusReason}</div>}</td>
                  <td className="text-[13px]">{r.invite ? (r.invite.usedAt ? <span className="text-ok">usado {fmtDT(r.invite.usedAt)}</span> : r.invite.supersededAt ? "substituído" : r.invite.expired ? <span className="text-alert">expirado {fmtDT(r.invite.expiresAt)}</span> : `válido até ${fmtDT(r.invite.expiresAt)}`) : <span className="hint">nenhum</span>}</td>
                  <td className="text-[13px]">{r.lastEmail ? <><StatusBadge status={r.lastEmail.status} /><div className="hint">{fmtDT(r.lastEmail.createdAt)} · {r.lastEmail.attempts} tent.</div>{r.lastEmail.lastError && <div className="text-alert text-[12px]">{r.lastEmail.lastError}</div>}{r.lastEmail.acceptedAt && <div className="hint">aceito pelo Gmail (não comprova entrega)</div>}</> : <span className="hint">nenhum</span>}</td>
                  <td className="whitespace-nowrap">
                    {r.status === "ativo" && <button className="btn btn-sm btn-ghost" onClick={() => { const reason = prompt("Motivo da suspensão (bloqueia o acesso imediatamente):"); if (reason) run(async () => { await api(`/api/professor/turmas/${classId}/matriculas/${r.id}`, { method: "PATCH", body: { status: "suspenso", reason } }); return "Matrícula suspensa."; }); }}>Suspender</button>}
                    {r.status === "suspenso" && <button className="btn btn-sm btn-ghost" onClick={() => { const reason = prompt("Motivo da reativação:"); if (reason) run(async () => { await api(`/api/professor/turmas/${classId}/matriculas/${r.id}`, { method: "PATCH", body: { status: "ativo", reason } }); return "Matrícula reativada."; }); }}>Reativar</button>}
                    {r.status !== "encerrado" && <button className="btn btn-sm btn-ghost text-alert" onClick={() => { const reason = prompt("Motivo do encerramento (o histórico é preservado):"); if (reason) run(async () => { await api(`/api/professor/turmas/${classId}/matriculas/${r.id}`, { method: "PATCH", body: { status: "encerrado", reason } }); return "Matrícula encerrada."; }); }}>Encerrar</button>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="hint text-center py-6">Nenhum aluno cadastrado. Adicione manualmente ou importe um CSV.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="hint">Situações: sem convite (na lista) → convidado (recebeu o e-mail) → com acesso (definiu a senha). Suspender ou encerrar bloqueia o acesso na hora, sem afetar outras turmas da mesma pessoa. Senhas nunca são visíveis.</p>
      </div>
      <aside className="flex flex-col gap-4">
        <section className="card">
          <h2 className="text-base mb-2">Adicionar um aluno</h2>
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; run(async () => { const r = await api<{ created: string[]; skipped: string[] }>(`/api/professor/turmas/${classId}/matriculas`, { body: { people: [{ name: String(fd.get("name")), email: String(fd.get("email")), role: String(fd.get("role")) }] } }); form.reset(); return r.created.length ? "Aluno adicionado. Selecione e envie o convite quando quiser." : "E-mail já consta na turma."; }); }}>
            <label className="text-[13px]">Nome<input name="name" className="input" required /></label>
            <label className="text-[13px]">E-mail<input name="email" type="email" className="input" required /></label>
            <label className="text-[13px]">Papel<select name="role" className="select"><option value="aluno">aluno</option><option value="monitor">monitor</option></select></label>
            <button className="btn btn-sm" type="submit" disabled={busy}>Adicionar</button>
          </form>
        </section>
        <section className="card">
          <h2 className="text-base mb-1">Importar uma lista (CSV)</h2>
          <p className="hint mb-2">Colunas: nome, email e papel (opcional), com ou sem linha de cabeçalho. Separador vírgula, ponto e vírgula ou tabulação. Nome vazio é aceito: o convite sai com saudação neutra. Ano e turma vêm do contexto desta tela. <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_MODEL)}`} download="modelo-alunos.csv">Baixar modelo</a>.</p>
          <input type="file" accept=".csv,text/csv" className="text-[13px]" aria-label="Arquivo CSV" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setCsv(await f.text()); }} />
          <textarea className="textarea mt-2 font-mono text-[12px] min-h-[100px]" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={"nome;email\nMaria;maria@exemplo.com"} aria-label="Conteúdo CSV" />
          <div className="flex gap-2 mt-2">
            <button className="btn btn-sm btn-secondary" disabled={!csv.trim() || busy} onClick={() => run(async () => { setPreview(await api<Preview>(`/api/professor/turmas/${classId}/importar/previa`, { body: { csv } })); return "Confira a lista abaixo e clique em Importar."; })}>Conferir</button>
            <button className="btn btn-sm" disabled={!preview || !preview.rows.some((r) => r.status === "ok") || busy} onClick={() => run(async () => { const r = await api<{ created: string[]; note: string }>(`/api/professor/turmas/${classId}/importar/confirmar`, { body: { csv } }); setPreview(null); setCsv(""); return `${r.created.length} aluno(s) adicionado(s). ${r.note}`; })}>Importar</button>
          </div>
          {preview && (
            <div className="mt-3 table-wrap">
              <table className="table text-[12.5px]"><thead><tr><th>Linha</th><th>Nome</th><th>E-mail</th><th>Resultado</th></tr></thead>
                <tbody>{preview.rows.map((r) => <tr key={r.line}><td>{r.line}</td><td>{r.name}</td><td className="font-mono">{r.email}</td><td>{r.status === "ok" ? <span className="text-ok font-semibold">ok</span> : <span className="text-alert">{r.status.replace(/_/g, " ")}{r.message ? `: ${r.message}` : ""}</span>}</td></tr>)}</tbody></table>
              {preview.errors.length > 0 && <p className="text-alert text-[12.5px] mt-1">{preview.errors.join("; ")}</p>}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
