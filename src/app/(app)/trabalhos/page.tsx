import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, inArray } from "drizzle-orm";
import { requireContext } from "@/lib/context";
import { listAssignments, myGroup } from "@/lib/services/assignments";
import { db, schema } from "@/lib/db/client";
import { PageHeader, Empty, StatusBadge } from "@/components/ui";
import { fmtDT, relative } from "@/lib/time";

export const metadata: Metadata = { title: "Trabalhos" };

export default async function TrabalhosPage() {
  const ctx = await requireContext();
  const list = await listAssignments(ctx.current.classId, ctx.current.role === "monitor");
  const group = await myGroup(ctx.current.classId, ctx.user.id);
  const ids = list.map((a) => a.id);
  const subs = ids.length ? await db.select().from(schema.submissions).where(and(inArray(schema.submissions.assignmentId, ids), eq(schema.submissions.isCurrent, true), group ? eq(schema.submissions.groupId, group.id) : eq(schema.submissions.submitterUserId, ctx.user.id))) : [];
  const grades = ids.length ? await db.select().from(schema.grades).where(and(inArray(schema.grades.assignmentId, ids), eq(schema.grades.userId, ctx.user.id))) : [];
  return (
    <div>
      <PageHeader eyebrow={ctx.current.cls.name} title="Trabalhos" lead={group ? `Você está no grupo "${group.name}" (${group.members.map((m) => m.name.split(" ")[0]).join(", ")}). Entregas em grupo são coletivas; a defesa é individual.` : "Entregas indicadas em cada aula e o trabalho final com doze missões."} />
      {list.length === 0 ? <Empty title="Nenhum trabalho publicado ainda" /> : (
        <ul className="grid gap-3 md:grid-cols-2 list-none p-0 m-0">
          {list.map((a) => {
            const s = subs.find((x) => x.assignmentId === a.id);
            const g = grades.find((x) => x.assignmentId === a.id && x.publishedAt);
            return (
              <li key={a.id} className="card flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap"><p className="eyebrow">{a.mode === "grupo" ? "em grupo" : "individual"}</p>{a.status !== "published" && <StatusBadge status={a.status} />}</div>
                <h2 className="text-lg"><Link href={`/trabalhos/${a.id}`} className="no-underline hover:underline">{a.title}</Link></h2>
                <p className="text-[14px]">{a.dueAt ? <>Prazo: <b>{fmtDT(a.dueAt)}</b> <span className="hint">({relative(a.dueAt)})</span></> : <span className="hint">Prazo a definir pelo professor</span>}</p>
                <p className="flex flex-wrap gap-2 items-center">{s ? <StatusBadge status={s.status} /> : <StatusBadge status="rascunho" />}{g && <span className="badge badge-ok">nota publicada</span>}</p>
                <Link href={`/trabalhos/${a.id}`} className="btn btn-sm self-start">Abrir</Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
