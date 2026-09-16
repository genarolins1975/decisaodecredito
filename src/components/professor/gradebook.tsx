"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";

type Data = { assignments: { id: string; slug: string; title: string; status: string; weight: string | null }[]; rows: { name: string; email: string; enrollmentStatus: string; cells: { assignmentId: string; status: string; total: number | null; max: number | null; published: boolean; cutoffFailed?: boolean; rubricVersion?: number | null }[] }[] };

export function Gradebook({ classId }: { classId: string }) {
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => { api<Data>(`/api/professor/turmas/${classId}/notas`).then(setD); }, [classId]);
  if (!d) return <p className="hint">Carregando…</p>;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3"><p className="hint">Notas por trabalho. Vazio não é zero: “não corrigido”, “não entregue”, “dispensado” e “zero” são situações distintas. A exportação usa a mesma função de cálculo da tela.</p><div className="flex-1" /><a className="btn btn-sm btn-secondary" href={`/api/professor/turmas/${classId}/notas?formato=csv`}>Exportar CSV</a></div>
      <div className="table-wrap card p-0"><table className="table text-[13px]">
        <thead><tr><th>Aluno</th>{d.assignments.map((a) => <th key={a.id}>{a.title}<br /><span className="font-normal normal-case">{a.slug}{a.weight ? ` · peso ${a.weight}` : ""}</span></th>)}</tr></thead>
        <tbody>{d.rows.map((r) => <tr key={r.email}><td><b>{r.name}</b>{r.enrollmentStatus !== "ativo" && <span className="badge badge-muted ml-1">{r.enrollmentStatus}</span>}</td>{r.cells.map((c) => <td key={c.assignmentId}>{c.status === "corrigido" ? <><b>{c.total}</b>{c.max != null ? ` / ${c.max}` : ""}{c.cutoffFailed && <span className="text-alert"> (corte)</span>}</> : c.status === "zero" ? <b className="text-alert">0</b> : <span className="hint">{c.status.replace("_", " ")}</span>}{c.published ? <span className="text-ok" title="publicada"> ✓</span> : c.status !== "nao_corrigido" ? <span className="hint" title="não publicada"> ·</span> : null}</td>)}</tr>)}</tbody>
      </table></div>
    </div>
  );
}
