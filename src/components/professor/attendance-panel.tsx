"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { fmtD } from "@/lib/time";

type Map = { meetings: { id: string; number: number; title: string; scheduledAt: string | null; status: string; countsForAttendance: boolean }[]; countedMeetings: number;
  rows: { enrollmentId: string; userId: string | null; name: string; email: string; enrollmentStatus: string; cells: { meetingId: string; status: string; source: string | null; reviewRequested: string | null }[]; pct: number | null; denominator: number; ruleDefined: boolean; belowMinimum: boolean | null }[];
  rule: { minimumPct?: number | null; lateCountsAs?: string; justifiedCountsAs?: string } | null };

const COLORS: Record<string, string> = { presente: "bg-ok-soft text-ok", atrasado: "bg-warn-soft text-warn", ausente: "bg-alert-soft text-alert", justificado: "bg-[#EFF3FA] text-ink", pendente: "bg-gold-soft text-warn", cancelado: "bg-rule text-muted" };

export function AttendancePanel({ classId, map }: { classId: string; map: Map }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const decide = async (meetingId: string, userId: string, name: string, current: string) => {
    const status = prompt(`${name}: novo estado (presente, ausente, atrasado, justificado, pendente). Atual: ${current || "sem registro"}`);
    if (!status || !["presente", "ausente", "atrasado", "justificado", "pendente"].includes(status)) return;
    const reason = prompt("Motivo da correção (obrigatório, fica na trilha de auditoria):");
    if (!reason) return;
    setErr(null); setOk(null);
    try { await api(`/api/professor/turmas/${classId}/encontros/${meetingId}/frequencia`, { body: { userId, status, reason } }); setOk("Frequência atualizada."); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); }
  };
  return (
    <div className="flex flex-col gap-3">
      <ErrorBox message={err} /><SuccessBox message={ok} />
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[14px]">{map.rule?.minimumPct != null ? <>Regra: mínimo <b>{map.rule.minimumPct}%</b>; atraso conta como <b>{map.rule.lateCountsAs ?? "ausente"}</b>; justificado como <b>{map.rule.justifiedCountsAs ?? "ausente"}</b>. Aulas canceladas e as que não contam ficam fora da conta; só aulas marcadas como realizadas entram.</> : <><b>Regra não definida.</b> Nenhum percentual é calculado nem ninguém é reprovado até você configurar em <Link href={`/professor/turmas/${classId}/configuracoes`}>Configurações</Link>.</>}</p>
        <div className="flex-1" />
        <a className="btn btn-sm btn-secondary" href={`/api/professor/turmas/${classId}/frequencia?formato=csv`}>Exportar CSV</a>
      </div>
      <div className="table-wrap card p-0">
        <table className="table">
          <thead><tr><th>Aluno</th>{map.meetings.map((m) => <th key={m.id} title={m.title}>E{m.number}<br /><span className="font-normal normal-case">{fmtD(m.scheduledAt) || "s/ data"}</span>{m.status === "cancelled" && <><br /><span className="font-normal normal-case text-alert">cancelado</span></>}{!m.countsForAttendance && <><br /><span className="font-normal normal-case">não conta</span></>}</th>)}<th>%</th></tr></thead>
          <tbody>
            {map.rows.map((r) => (
              <tr key={r.enrollmentId}>
                <td><b>{r.name}</b>{r.enrollmentStatus !== "ativo" && <span className="badge badge-muted ml-1">{r.enrollmentStatus}</span>}<div className="hint font-mono">{r.email}</div></td>
                {r.cells.map((c) => (
                  <td key={c.meetingId}>
                    <button type="button" disabled={!r.userId || c.status === "cancelado"} onClick={() => r.userId && decide(c.meetingId, r.userId, r.name, c.status)} className={`min-h-[36px] min-w-[44px] rounded px-2 text-[12.5px] font-semibold ${COLORS[c.status] ?? "bg-paper text-muted"}`} title={c.source ? `origem: ${c.source}` : "sem registro"} aria-label={`${r.name}, encontro: ${c.status || "sem registro"}. Clique para corrigir.`}>
                      {c.status || "—"}{c.reviewRequested && <span title={`Pedido de revisão: ${c.reviewRequested}`} className="ml-1 text-alert" aria-label="pedido de revisão">!</span>}
                    </button>
                  </td>
                ))}
                <td className="font-mono">{r.ruleDefined ? (r.pct == null ? "—" : `${r.pct}%`) : <span className="hint">regra não definida</span>}{r.belowMinimum && <span className="badge badge-alert ml-1">abaixo</span>}</td>
              </tr>
            ))}
            {map.rows.length === 0 && <tr><td colSpan={map.meetings.length + 2} className="hint text-center py-6">Sem alunos.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="hint">Legenda: presente, atrasado, ausente, justificado, pendente (validação docente), cancelado. Clique numa célula para corrigir com motivo; a evidência de check-in (código, horário do servidor) é mantida separadamente da decisão. Um “!” indica pedido de revisão do aluno.</p>
    </div>
  );
}
