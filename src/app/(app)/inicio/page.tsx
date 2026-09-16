import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { requireContext } from "@/lib/context";
import { db, schema } from "@/lib/db/client";
import { listAssignments, myGroup } from "@/lib/services/assignments";
import { flatPages } from "@/lib/services/content";
import { PageHeader, StatusBadge, ButtonLink } from "@/components/ui";
import { fmtL, fmtDT, relative } from "@/lib/time";

export const metadata: Metadata = { title: "Visão geral" };

export default async function InicioPage() {
  const ctx = await requireContext();
  const cid = ctx.current.classId; const uid = ctx.user.id;
  const now = new Date();
  const meetings = await db.select().from(schema.meetings).where(and(eq(schema.meetings.classId, cid), eq(schema.meetings.status, "planned"))).orderBy(asc(schema.meetings.scheduledAt));
  const next = meetings.find((m) => m.scheduledAt && m.scheduledAt >= new Date(now.getTime() - 4 * 3600e3)) ?? meetings.find((m) => !m.scheduledAt) ?? meetings[0] ?? null;
  const openSessions = await db.select({ s: schema.liveSessions, m: schema.meetings }).from(schema.liveSessions).innerJoin(schema.meetings, eq(schema.meetings.id, schema.liveSessions.meetingId)).where(and(eq(schema.liveSessions.classId, cid), eq(schema.liveSessions.status, "open")));
  const assignments = await listAssignments(cid, ctx.current.role !== "aluno");
  const group = await myGroup(cid, uid);
  const ids = assignments.map((a) => a.id);
  const subs = ids.length ? await db.select().from(schema.submissions).where(and(inArray(schema.submissions.assignmentId, ids), eq(schema.submissions.isCurrent, true), group ? eq(schema.submissions.groupId, group.id) : eq(schema.submissions.submitterUserId, uid))) : [];
  const pending = assignments.filter((a) => !subs.some((s) => s.assignmentId === a.id && ["enviado", "atrasado", "reenviado", "corrigido", "publicado"].includes(s.status))).sort((a, b) => (a.dueAt?.getTime() ?? 9e15) - (b.dueAt?.getTime() ?? 9e15));
  const notices = await db.select().from(schema.notices).where(and(eq(schema.notices.classId, cid), isNotNull(schema.notices.publishedAt))).orderBy(desc(schema.notices.publishedAt)).limit(5);
  const published = ids.length ? await db.select({ g: schema.grades, a: schema.assignments }).from(schema.grades).innerJoin(schema.assignments, eq(schema.assignments.id, schema.grades.assignmentId)).where(and(eq(schema.grades.userId, uid), eq(schema.grades.classId, cid), isNotNull(schema.grades.publishedAt), gte(schema.grades.publishedAt, new Date(now.getTime() - 30 * 86400e3)))).orderBy(desc(schema.grades.publishedAt)) : [];
  const last = await db.select({ qv: schema.studyResponses.questionVersionId }).from(schema.studyResponses).where(and(eq(schema.studyResponses.userId, uid), eq(schema.studyResponses.classId, cid))).orderBy(desc(schema.studyResponses.serverTime)).limit(1);
  let resume: { slug: string; title: string } | null = null;
  if (last[0]) {
    const [q] = await db.select({ pageId: schema.questions.pageId }).from(schema.questionVersions).innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId)).where(eq(schema.questionVersions.id, last[0].qv));
    const pages = await flatPages(ctx.current.edition.id);
    const i = pages.findIndex((p) => p.id === q?.pageId);
    const target = i >= 0 ? pages[Math.min(i + 1, pages.length - 1)] : pages[0];
    if (target) resume = { slug: target.slug, title: target.title };
  } else { const pages = await flatPages(ctx.current.edition.id); if (pages[0]) resume = { slug: pages[0].slug, title: pages[0].title }; }
  const nextUnit = next?.unitId ? (await db.select().from(schema.units).where(eq(schema.units.id, next.unitId)))[0] : null;
  const unitChapters = nextUnit ? await db.select().from(schema.chapters).where(eq(schema.chapters.unitId, nextUnit.id)).orderBy(asc(schema.chapters.position)) : [];

  return (
    <div>
      <PageHeader eyebrow={<>{ctx.current.cls.name} · edição {ctx.current.edition.label}</>} title={`Olá, ${ctx.user.name.split(" ")[0]}`} lead={openSessions.length ? undefined : "Próxima aula, o que preparar, o que está pendente e os prazos."} />
      {openSessions.map(({ s, m }) => (
        <div key={s.id} className="callout callout-ok mb-5 flex flex-wrap items-center gap-3"><p className="font-semibold text-ok text-[15px]">Sessão ao vivo aberta agora: {m.title}</p><div className="flex-1" /><ButtonLink href={`/ao-vivo/${s.id}`}>Entrar na sessão</ButtonLink></div>
      ))}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2" aria-labelledby="prox">
          <p className="eyebrow">Próxima aula</p>
          {next ? (
            <>
              <h2 id="prox" className="mt-1">{next.title}</h2>
              <p className="mt-1 text-[15px]">{next.scheduledAt ? <><b>{fmtL(next.scheduledAt)}</b> <span className="hint">({relative(next.scheduledAt)})</span></> : <span className="hint">data a confirmar pelo professor</span>}{next.location ? ` · ${next.location}` : ""}{next.videoUrl && <> · <a href={next.videoUrl} target="_blank" rel="noreferrer">videoconferência</a></>}</p>
              {nextUnit && <p className="mt-2 text-[14.5px]"><b>Capítulos:</b> {unitChapters.map((c) => `${c.number}. ${c.title}`).join(" · ")}</p>}
              <p className="mt-2 text-[14.5px]"><b>O que preparar:</b> {next.preparation ?? (unitChapters.length ? `ler as páginas essenciais dos capítulos ${unitChapters.map((c) => c.number).join(", ")} e responder às perguntas de checagem.` : "o professor ainda não indicou.")}</p>
              {nextUnit && <p className="mt-1 text-[14.5px]"><b>Entrega indicada:</b> {nextUnit.deliverable}</p>}
              <div className="mt-3 flex gap-2 flex-wrap">{unitChapters[0] && <ButtonLink href="/aulas" variant="secondary">Abrir a aula</ButtonLink>}<ButtonLink href="/ao-vivo" variant="ghost">Sessão ao vivo</ButtonLink></div>
            </>
          ) : <p className="hint mt-1">Nenhum encontro planejado. Enquanto isso, estude pelas aulas.</p>}
        </section>
        <section className="card" aria-labelledby="cont">
          <p className="eyebrow">Continuar estudando</p>
          {resume ? <><h2 id="cont" className="text-lg mt-1">{resume.title}</h2><p className="hint">página {resume.slug}</p><ButtonLink href={`/aulas/${resume.slug}`} className="mt-3">Retomar</ButtonLink></> : <p className="hint">Sem histórico ainda.</p>}
        </section>
        <section className="card lg:col-span-2" aria-labelledby="pend">
          <h2 id="pend" className="text-lg mb-2">Entregas pendentes</h2>
          {pending.length === 0 ? <p className="hint">Nada pendente.</p> : (
            <ul className="list-none p-0 m-0 grid gap-2">{pending.map((a) => { const s = subs.find((x) => x.assignmentId === a.id); return <li key={a.id} className="flex flex-wrap items-center gap-2 border-b border-rule pb-2"><Link href={`/trabalhos/${a.id}`} className="font-semibold">{a.title}</Link>{s && <StatusBadge status={s.status} />}<span className="flex-1" /><span className="text-[14px]">{a.dueAt ? <>prazo <b>{fmtDT(a.dueAt)}</b> <span className="hint">({relative(a.dueAt)})</span></> : <span className="hint">prazo a definir</span>}</span></li>; })}</ul>
          )}
        </section>
        <section className="card" aria-labelledby="dev">
          <h2 id="dev" className="text-lg mb-2">Avisos e devolutivas</h2>
          {notices.length === 0 && published.length === 0 && <p className="hint">Nenhum aviso recente.</p>}
          <ul className="list-none p-0 m-0 grid gap-2 text-[14px]">
            {notices.map((n) => <li key={n.id}><b>{n.title}</b><p className="hint">{fmtDT(n.publishedAt)}</p><p className="whitespace-pre-line">{n.body}</p></li>)}
            {published.map(({ g, a }) => <li key={g.id}><Link href={`/trabalhos/${a.id}`}>Resultado publicado: {a.title}</Link> <span className="hint">{fmtDT(g.publishedAt)}</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
