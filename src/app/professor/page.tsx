import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { listEditionsWithClasses } from "@/lib/services/admin";
import { PageHeader, Stat, StatusBadge, ButtonLink } from "@/components/ui";
import { StartClassButton } from "@/components/professor/start-class-button";
import { fmtDT, fmtL, relative } from "@/lib/time";

export const metadata: Metadata = { title: "Início" };

/** Início do professor: a próxima aula de cada turma com um botão para começar, depois o que pede atenção. */
export default async function ProfessorHome() {
  const editions = await listEditionsWithClasses();
  const classes = editions.flatMap((e) => e.classes.map((c) => ({ ...c, edition: e })));
  const ids = classes.map((c) => c.id);
  const now = new Date();
  const enr = ids.length ? await db.select({ classId: schema.enrollments.classId, status: schema.enrollments.status, n: sql<number>`count(*)` }).from(schema.enrollments).where(inArray(schema.enrollments.classId, ids)).groupBy(schema.enrollments.classId, schema.enrollments.status) : [];
  const openSessions = ids.length ? await db.select({ s: schema.liveSessions, m: schema.meetings }).from(schema.liveSessions).innerJoin(schema.meetings, eq(schema.meetings.id, schema.liveSessions.meetingId)).where(and(inArray(schema.liveSessions.classId, ids), eq(schema.liveSessions.status, "open"))) : [];
  const planned = ids.length ? await db.select().from(schema.meetings).where(and(inArray(schema.meetings.classId, ids), eq(schema.meetings.status, "planned"))).orderBy(asc(schema.meetings.scheduledAt), asc(schema.meetings.number)) : [];
  const toGrade = ids.length ? await db.select({ classId: schema.submissions.classId, n: sql<number>`count(*)` }).from(schema.submissions).where(and(inArray(schema.submissions.classId, ids), eq(schema.submissions.isCurrent, true), inArray(schema.submissions.status, ["enviado", "atrasado", "reenviado"]))).groupBy(schema.submissions.classId) : [];
  const failedMail = await db.select({ n: sql<number>`count(*)` }).from(schema.emailMessages).where(eq(schema.emailMessages.status, "failed"));
  const queuedMail = await db.select({ n: sql<number>`count(*)` }).from(schema.emailMessages).where(eq(schema.emailMessages.status, "queued"));
  const gmail = await db.select().from(schema.gmailConnections).where(isNull(schema.gmailConnections.revokedAt)).limit(1);
  const count = (cid: string, st: string) => Number(enr.find((e) => e.classId === cid && e.status === st)?.n ?? 0);
  const finals = ids.length ? await db.select({ a: schema.assignments, policy: schema.blindTests.releasePolicy }).from(schema.assignments).leftJoin(schema.blindTests, eq(schema.blindTests.assignmentId, schema.assignments.id)).where(and(inArray(schema.assignments.classId, ids), eq(schema.assignments.slug, "trabalho-final"))) : [];
  const datasetsReady = await db.select({ editionId: schema.datasets.editionId, n: sql<number>`count(*) filter (where ${schema.datasets.status} = 'disponivel')`, total: sql<number>`count(*)` }).from(schema.datasets).groupBy(schema.datasets.editionId);
  // próxima aula por turma: a planejada mais próxima (até 4 h depois do início ainda conta como "hoje"), senão a primeira sem data
  const nextOf = (cid: string) => { const ms = planned.filter((m) => m.classId === cid); return ms.find((m) => m.scheduledAt && m.scheduledAt >= new Date(now.getTime() - 4 * 3600e3)) ?? ms.find((m) => !m.scheduledAt) ?? ms[0] ?? null; };
  const activeClasses = classes.filter((c) => c.status === "active");
  const failed = Number(failedMail[0]?.n ?? 0); const queued = Number(queuedMail[0]?.n ?? 0);

  return (
    <div>
      <PageHeader eyebrow="Prof. Genaro Dueire Lins" title="Início" lead="A próxima aula de cada turma e o que pede atenção agora." />

      <section aria-labelledby="hoje" className="mb-6">
        <h2 id="hoje" className="sr-only">Próxima aula</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {activeClasses.map((c) => {
            const open = openSessions.filter((s) => s.s.classId === c.id);
            const next = nextOf(c.id);
            return (
              <article key={c.id} className="card border-l-[4px] border-l-gold flex flex-col gap-2">
                <p className="eyebrow">{c.name} · {c.code}</p>
                {open.length > 0 ? (
                  <>
                    <h3 className="text-[20px]">Aula ao vivo em andamento: {open[0].m.title}</h3>
                    <p className="hint">aberta {fmtDT(open[0].s.openedAt)}</p>
                    <div className="flex flex-wrap gap-2 mt-1"><ButtonLink href={`/professor/aovivo/${open[0].s.id}`}>Entrar na aula</ButtonLink></div>
                  </>
                ) : next ? (
                  <>
                    <h3 className="text-[20px]">Próxima aula: {next.title}</h3>
                    <p className="text-[15px]">{next.scheduledAt ? <><b>{fmtL(next.scheduledAt)}</b> <span className="hint">({relative(next.scheduledAt)})</span></> : <span className="hint">sem data definida</span>}{next.location ? ` · ${next.location}` : ""}</p>
                    <div className="flex flex-wrap gap-2 mt-1 items-center">
                      <StartClassButton classId={c.id} meetingId={next.id}>Iniciar aula</StartClassButton>
                      <ButtonLink href={`/professor/turmas/${c.id}/encontros`} variant="ghost">Datas das aulas</ButtonLink>
                    </div>
                    <p className="hint">Iniciar abre a aula ao vivo para os alunos e leva você ao painel da aula, com projeção e chamada.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-[20px]">Nenhuma aula marcada</h3>
                    <div className="flex flex-wrap gap-2 mt-1"><ButtonLink href={`/professor/turmas/${c.id}/encontros`} variant="secondary">Criar as aulas da turma</ButtonLink></div>
                  </>
                )}
              </article>
            );
          })}
          {activeClasses.length === 0 && <p className="hint">Nenhuma turma ativa. <Link href="/professor/turmas">Criar turma</Link>.</p>}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat label="Aulas ao vivo abertas" value={openSessions.length} hint={openSessions.map((s) => s.m.title).join("; ") || "nenhuma"} tone={openSessions.length ? "ok" : undefined} />
        <Stat label="E-mails na fila" value={queued} hint={gmail.length ? `Remetente: ${gmail[0].emailAddress}` : "Gmail não conectado"} tone={!gmail.length && queued ? "warn" : undefined} />
        <Stat label="E-mails com falha" value={failed} hint={<Link href="/professor/configuracoes">ver fila</Link>} tone={failed ? "alert" : undefined} />
        <Stat label="Turmas" value={classes.length} hint={`${editions.length} ano(s) letivo(s)`} />
      </div>

      <div className="flex flex-col gap-4">
        {editions.map((e) => (
          <section key={e.id} className="card" aria-labelledby={`ed-${e.id}`}>
            <div className="flex flex-wrap items-center gap-3 mb-3"><h2 id={`ed-${e.id}`}>Ano {e.label}</h2><StatusBadge status={e.status} /></div>
            {e.classes.length === 0 && <p className="hint">Nenhuma turma. Crie em <Link href="/professor/turmas">Turmas</Link>.</p>}
            <div className="grid gap-3 md:grid-cols-2">
              {e.classes.map((c) => {
                const grading = Number(toGrade.find((t) => t.classId === c.id)?.n ?? 0);
                const f = finals.find((x) => x.a.classId === c.id); const ds = datasetsReady.find((d) => d.editionId === e.id);
                return (
                  <article key={c.id} className="panel-soft">
                    <div className="flex items-center justify-between gap-2"><h3 className="text-[17px]"><Link href={`/professor/turmas/${c.id}`}>{c.name}</Link> <span className="hint font-sans font-normal">{c.code}</span></h3><StatusBadge status={c.status} /></div>
                    <ul className="mt-2 text-[14px] list-none p-0 m-0 grid gap-1">
                      <li><Link href={`/professor/turmas/${c.id}/alunos`}>{count(c.id, "ativo")} com acesso · {count(c.id, "convidado")} convidados sem ativar · {count(c.id, "autorizado")} sem convite</Link></li>
                      <li><Link href={`/professor/turmas/${c.id}/trabalhos`}>{grading} entrega(s) para corrigir</Link></li>
                      <li><Link href={f ? `/professor/turmas/${c.id}/trabalhos/${f.a.id}` : `/professor/turmas/${c.id}/trabalhos`}>Trabalho final: {f ? (f.a.status === "published" ? "publicado" : f.a.status === "closed" ? "encerrado" : "rascunho, invisível aos alunos") : "não criado"} · OOT {f?.policy === "livre" ? "liberado a todos" : "após congelamento"} · bases prontas {Number(ds?.n ?? 0)}/{Number(ds?.total ?? 0)}</Link></li>
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
