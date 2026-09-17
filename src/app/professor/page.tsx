import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { listEditionsWithClasses } from "@/lib/services/admin";
import { PageHeader, Stat, StatusBadge } from "@/components/ui";
import { fmtDT } from "@/lib/time";

export const metadata: Metadata = { title: "Painel do professor" };

export default async function ProfessorHome() {
  const editions = await listEditionsWithClasses();
  const classes = editions.flatMap((e) => e.classes.map((c) => ({ ...c, edition: e })));
  const ids = classes.map((c) => c.id);
  const enr = ids.length ? await db.select({ classId: schema.enrollments.classId, status: schema.enrollments.status, n: sql<number>`count(*)` }).from(schema.enrollments).where(inArray(schema.enrollments.classId, ids)).groupBy(schema.enrollments.classId, schema.enrollments.status) : [];
  const openSessions = ids.length ? await db.select({ s: schema.liveSessions, m: schema.meetings }).from(schema.liveSessions).innerJoin(schema.meetings, eq(schema.meetings.id, schema.liveSessions.meetingId)).where(and(inArray(schema.liveSessions.classId, ids), eq(schema.liveSessions.status, "open"))) : [];
  const toGrade = ids.length ? await db.select({ classId: schema.submissions.classId, n: sql<number>`count(*)` }).from(schema.submissions).where(and(inArray(schema.submissions.classId, ids), eq(schema.submissions.isCurrent, true), inArray(schema.submissions.status, ["enviado", "atrasado", "reenviado"]))).groupBy(schema.submissions.classId) : [];
  const failedMail = await db.select({ n: sql<number>`count(*)` }).from(schema.emailMessages).where(eq(schema.emailMessages.status, "failed"));
  const queuedMail = await db.select({ n: sql<number>`count(*)` }).from(schema.emailMessages).where(eq(schema.emailMessages.status, "queued"));
  const gmail = await db.select().from(schema.gmailConnections).where(isNull(schema.gmailConnections.revokedAt)).limit(1);
  const count = (cid: string, st: string) => Number(enr.find((e) => e.classId === cid && e.status === st)?.n ?? 0);
  const finals = ids.length ? await db.select({ a: schema.assignments, policy: schema.blindTests.releasePolicy }).from(schema.assignments).leftJoin(schema.blindTests, eq(schema.blindTests.assignmentId, schema.assignments.id)).where(and(inArray(schema.assignments.classId, ids), eq(schema.assignments.slug, "trabalho-final"))) : [];
  const datasetsReady = await db.select({ editionId: schema.datasets.editionId, n: sql<number>`count(*) filter (where ${schema.datasets.status} = 'disponivel')`, total: sql<number>`count(*)` }).from(schema.datasets).groupBy(schema.datasets.editionId);
  return (
    <div>
      <PageHeader eyebrow="Prof. Genaro Dueire Lins" title="Painel do professor" lead="O que precisa de atenção agora, por turma. Cada número leva à tela onde a ação acontece." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat label="Sessões ao vivo abertas" value={openSessions.length} hint={openSessions.map((s) => s.m.title).join("; ") || "nenhuma"} tone={openSessions.length ? "ok" : undefined} />
        <Stat label="E-mails na fila" value={Number(queuedMail[0]?.n ?? 0)} hint={gmail.length ? `Remetente: ${gmail[0].emailAddress}` : "Gmail não conectado"} tone={!gmail.length && Number(queuedMail[0]?.n ?? 0) ? "warn" : undefined} />
        <Stat label="E-mails com falha" value={Number(failedMail[0]?.n ?? 0)} hint={<Link href="/professor/configuracoes">ver fila</Link>} tone={Number(failedMail[0]?.n ?? 0) ? "alert" : undefined} />
        <Stat label="Turmas" value={classes.length} hint={`${editions.length} edição(ões)`} />
      </div>
      <section className="card mb-6" aria-labelledby="atalhos">
        <h2 id="atalhos" className="text-lg mb-2">Atalhos do professor</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-[14px]">
          <Link href="/professor/turmas" className="panel-soft no-underline hover:underline">Turmas: alunos, convites, grupos, encontros, trabalhos e notas</Link>
          <Link href="/professor/conteudo" className="panel-soft no-underline hover:underline">Conteúdo: páginas, versões e notas privadas do guia docente</Link>
          <Link href="/professor/bases" className="panel-soft no-underline hover:underline">Bases e gabaritos: catálogo, OOT, rótulos, gabaritos e registro do pacote</Link>
          <Link href="/professor/configuracoes" className="panel-soft no-underline hover:underline">Configurações: Gmail, fila de e-mails, edições</Link>
        </div>
      </section>
      <div className="flex flex-col gap-4">
        {editions.map((e) => (
          <section key={e.id} className="card" aria-labelledby={`ed-${e.id}`}>
            <div className="flex flex-wrap items-center gap-3 mb-3"><h2 id={`ed-${e.id}`}>Edição {e.label}</h2><StatusBadge status={e.status} /><span className="hint">ano letivo {e.year}</span></div>
            {e.classes.length === 0 && <p className="hint">Nenhuma turma. Crie em <Link href="/professor/turmas">Turmas</Link>.</p>}
            <div className="grid gap-3 md:grid-cols-2">
              {e.classes.map((c) => {
                const grading = Number(toGrade.find((t) => t.classId === c.id)?.n ?? 0);
                const open = openSessions.filter((s) => s.s.classId === c.id);
                return (
                  <article key={c.id} className="panel-soft">
                    <div className="flex items-center justify-between gap-2"><h3 className="text-[17px]"><Link href={`/professor/turmas/${c.id}`}>{c.name}</Link> <span className="hint font-sans font-normal">{c.code}</span></h3><StatusBadge status={c.status} /></div>
                    <ul className="mt-2 text-[14px] list-none p-0 m-0 grid gap-1">
                      <li><Link href={`/professor/turmas/${c.id}/alunos`}>{count(c.id, "ativo")} ativos · {count(c.id, "convidado")} convidados · {count(c.id, "autorizado")} aguardando convite</Link></li>
                      <li>{open.length ? open.map((s) => <Link key={s.s.id} href={`/professor/aovivo/${s.s.id}`}>Sessão aberta: {s.m.title} (aberta em {fmtDT(s.s.openedAt)})</Link>) : <Link href={`/professor/turmas/${c.id}/encontros`}>Nenhuma sessão aberta · encontros</Link>}</li>
                      <li><Link href={`/professor/turmas/${c.id}/trabalhos`}>{grading} entrega(s) aguardando correção</Link></li>
                      {(() => { const f = finals.find((x) => x.a.classId === c.id); const ds = datasetsReady.find((d) => d.editionId === e.id); return <li><Link href={f ? `/professor/turmas/${c.id}/trabalhos/${f.a.id}` : `/professor/turmas/${c.id}/trabalhos`}>Trabalho final: {f ? (f.a.status === "published" ? "publicado" : f.a.status === "closed" ? "encerrado" : "rascunho (invisível aos alunos)") : "não criado"} · OOT {f?.policy === "livre" ? "liberado a todos" : "após congelamento"} · bases disponíveis {Number(ds?.n ?? 0)}/{Number(ds?.total ?? 0)}</Link></li>; })()}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
