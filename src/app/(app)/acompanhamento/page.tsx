import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { requireContext } from "@/lib/context";
import { db, schema } from "@/lib/db/client";
import { attendanceMap, type AttendanceRule } from "@/lib/services/attendance";
import { flatPages } from "@/lib/services/content";
import { PageHeader, StatusBadge, Stat } from "@/components/ui";
import { fmtD, fmtDT } from "@/lib/time";
import { ReviewRequest } from "@/components/review-request";

export const metadata: Metadata = { title: "Meu acompanhamento" };

export default async function AcompanhamentoPage() {
  const ctx = await requireContext();
  const uid = ctx.user.id; const cid = ctx.current.classId;
  const rule = (ctx.current.cls.config as { attendance?: AttendanceRule }).attendance;
  const map = await attendanceMap(cid, rule);
  const mine = map.rows.find((r) => r.userId === uid);
  const pages = await flatPages(ctx.current.edition.id);
  const responses = await db.select({ qv: schema.studyResponses.questionVersionId, ok: schema.studyResponses.isCorrect, at: schema.studyResponses.serverTime }).from(schema.studyResponses).where(and(eq(schema.studyResponses.userId, uid), eq(schema.studyResponses.classId, cid))).orderBy(desc(schema.studyResponses.serverTime));
  const answered = new Set(responses.map((r) => r.qv));
  const qids = [...answered];
  const qpages = qids.length ? await db.select({ vid: schema.questionVersions.id, pageId: schema.questions.pageId, kind: schema.questions.kind }).from(schema.questionVersions).innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId)).where(inArray(schema.questionVersions.id, qids)) : [];
  const pagesTouched = new Set(qpages.map((q) => q.pageId).filter(Boolean));
  const totalQ = await db.select({ id: schema.questions.id, kind: schema.questions.kind }).from(schema.questions).where(eq(schema.questions.editionId, ctx.current.edition.id));
  const graded = qpages.filter((q) => q.kind === "single");
  const correctFirst = graded.filter((q) => { const rs = responses.filter((r) => r.qv === q.vid); return rs[rs.length - 1]?.ok === true; }).length;
  const grades = await db.select({ g: schema.grades, a: schema.assignments }).from(schema.grades).innerJoin(schema.assignments, eq(schema.assignments.id, schema.grades.assignmentId)).where(and(eq(schema.grades.userId, uid), eq(schema.grades.classId, cid))).orderBy(asc(schema.assignments.position));
  const lastPage = pages.find((p) => pagesTouched.has(p.id));
  return (
    <div>
      <PageHeader eyebrow={ctx.current.cls.name} title="Meu acompanhamento" lead="Presença, atividades respondidas e resultados publicados. Atividades formativas não viram nota; servem para você e para o professor localizarem dificuldades." />
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <Stat label="Frequência" value={mine?.ruleDefined ? (mine.pct == null ? "—" : `${mine.pct}%`) : "regra não definida"} hint={mine?.ruleDefined ? `mínimo ${rule?.minimumPct}% · ${mine.denominator} encontro(s) realizados no denominador` : "o professor ainda não configurou a regra; nada é calculado"} tone={mine?.belowMinimum ? "alert" : undefined} />
        <Stat label="Páginas com atividade respondida" value={`${pagesTouched.size} / ${pages.length}`} hint={lastPage ? <Link href={`/aulas/${lastPage.slug}`}>retomar em {lastPage.slug}</Link> : "comece pelas aulas"} />
        <Stat label="Questões com gabarito acertadas" value={`${correctFirst} / ${graded.length}`} hint={`${totalQ.filter((q) => q.kind === "single").length} questões com gabarito no curso`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card" aria-labelledby="freq">
          <h2 id="freq" className="text-lg mb-2">Presença por encontro</h2>
          <table className="table text-[14px]"><thead><tr><th>Encontro</th><th>Data</th><th>Situação</th><th></th></tr></thead>
            <tbody>{map.meetings.map((m, i) => { const c = mine?.cells[i]; return <tr key={m.id}><td>{m.title}</td><td>{fmtD(m.scheduledAt) || "—"}</td><td>{m.status === "cancelled" ? <span className="badge badge-muted">cancelado</span> : c?.status ? <StatusBadge status={c.status === "atrasado" ? "atrasado_freq" : c.status} /> : <span className="hint">sem registro</span>}{c?.reviewRequested && <span className="hint block">revisão solicitada</span>}</td><td>{m.status !== "cancelled" && <ReviewRequest classId={cid} meetingId={m.id} />}</td></tr>; })}</tbody></table>
          <p className="hint mt-2">Presença é registrada por check-in com código em sala e validada pelo professor. Se discordar de um registro, solicite revisão com uma justificativa.</p>
        </section>
        <section className="card" aria-labelledby="res">
          <h2 id="res" className="text-lg mb-2">Resultados de trabalhos</h2>
          {grades.length === 0 && <p className="hint">Nenhuma nota publicada.</p>}
          <ul className="list-none p-0 m-0 grid gap-2">{grades.map(({ g, a }) => <li key={g.id} className="flex items-center gap-2 flex-wrap border-b border-rule pb-2"><Link href={`/trabalhos/${a.id}`} className="font-semibold">{a.title}</Link>{g.publishedAt ? <><StatusBadge status={g.status} />{g.status === "corrigido" && <b>{Number(g.total)}</b>}<span className="hint">publicada {fmtDT(g.publishedAt)}</span></> : <span className="hint">correção não publicada</span>}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
