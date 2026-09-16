import Link from "next/link";
import { and, eq, inArray, sql } from "drizzle-orm";
import { requireClassAccess } from "@/lib/auth/guard";
import { listAssignments } from "@/lib/services/assignments";
import { db, schema } from "@/lib/db/client";
import { StatusBadge } from "@/components/ui";
import { fmtDT } from "@/lib/time";
import { NewAssignmentForm } from "@/components/professor/assignment-forms";

export default async function TrabalhosProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireClassAccess(id, ["professor"]);
  const list = await listAssignments(id, true);
  const ids = list.map((a) => a.id);
  const counts = ids.length ? await db.select({ aid: schema.submissions.assignmentId, status: schema.submissions.status, n: sql<number>`count(*)` }).from(schema.submissions).where(and(inArray(schema.submissions.assignmentId, ids), eq(schema.submissions.isCurrent, true))).groupBy(schema.submissions.assignmentId, schema.submissions.status) : [];
  const units = await db.select({ id: schema.units.id, number: schema.units.number, title: schema.units.title, kind: schema.units.kind }).from(schema.units).where(eq(schema.units.editionId, access.edition.id));
  return (
    <div className="flex flex-col gap-4">
      <div className="table-wrap card p-0">
        <table className="table">
          <thead><tr><th>Trabalho</th><th>Modo</th><th>Prazo</th><th>Situação</th><th>Entregas vigentes</th><th><span className="sr-only">Ações</span></th></tr></thead>
          <tbody>
            {list.map((a) => {
              const c = counts.filter((x) => x.aid === a.id);
              const n = (s: string[]) => c.filter((x) => s.includes(x.status)).reduce((t, x) => t + Number(x.n), 0);
              return (
                <tr key={a.id}>
                  <td><b>{a.title}</b><div className="hint font-mono">{a.slug}{a.blindTestEnabled ? " · teste cego" : ""}</div></td>
                  <td>{a.mode}</td>
                  <td>{fmtDT(a.dueAt) || <span className="hint">a definir</span>}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-[13px]">{n(["enviado", "atrasado", "reenviado"])} a corrigir · {n(["corrigido"])} corrigidas · {n(["publicado"])} publicadas · {n(["devolvido"])} devolvidas</td>
                  <td><Link href={`/professor/turmas/${id}/trabalhos/${a.id}`} className="btn btn-sm btn-secondary">Abrir</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <NewAssignmentForm classId={id} units={units} />
    </div>
  );
}
