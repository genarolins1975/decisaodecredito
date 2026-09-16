import Link from "next/link";
import { and, eq, inArray, sql, isNotNull } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { requireClassAccess } from "@/lib/auth/guard";
import { listMeetings } from "@/lib/services/meetings";
import { Stat } from "@/components/ui";
import { fmtDT } from "@/lib/time";

export default async function TurmaVisaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireClassAccess(id, ["professor"]);
  const enr = await db.select({ status: schema.enrollments.status, n: sql<number>`count(*)` }).from(schema.enrollments).where(eq(schema.enrollments.classId, id)).groupBy(schema.enrollments.status);
  const c = (s: string) => Number(enr.find((e) => e.status === s)?.n ?? 0);
  const meetings = await listMeetings(id);
  const next = meetings.find((m) => m.status === "planned" && m.scheduledAt && m.scheduledAt > new Date()) ?? meetings.find((m) => m.status === "planned");
  const grading = await db.select({ n: sql<number>`count(*)` }).from(schema.submissions).where(and(eq(schema.submissions.classId, id), eq(schema.submissions.isCurrent, true), inArray(schema.submissions.status, ["enviado", "atrasado", "reenviado"])));
  const reviews = await db.select({ n: sql<number>`count(*)` }).from(schema.attendanceRecords).innerJoin(schema.meetings, eq(schema.meetings.id, schema.attendanceRecords.meetingId)).where(and(eq(schema.meetings.classId, id), isNotNull(schema.attendanceRecords.reviewRequested)));
  const rule = (access.cls.config as { attendance?: { minimumPct?: number | null } }).attendance;
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Aguardando convite" value={c("autorizado")} hint={<Link href={`/professor/turmas/${id}/alunos`}>enviar convites</Link>} tone={c("autorizado") ? "warn" : undefined} />
        <Stat label="Convidados sem ativar" value={c("convidado")} hint="ainda não definiram senha" tone={c("convidado") ? "warn" : undefined} />
        <Stat label="Ativos" value={c("ativo")} hint={`${c("suspenso")} suspensos · ${c("encerrado")} encerrados`} tone="ok" />
        <Stat label="Entregas a corrigir" value={Number(grading[0]?.n ?? 0)} hint={<Link href={`/professor/turmas/${id}/trabalhos`}>trabalhos</Link>} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <section className="card">
          <h2 className="text-base mb-2">Próximo encontro</h2>
          {next ? <p><b>{next.title}</b><br /><span className="hint">{fmtDT(next.scheduledAt) || "sem data definida"} {next.location ? `· ${next.location}` : ""}</span></p> : <p className="hint">Nenhum encontro planejado. <Link href={`/professor/turmas/${id}/encontros`}>Criar encontros</Link>.</p>}
        </section>
        <section className="card">
          <h2 className="text-base mb-2">Frequência</h2>
          <p className="text-[14px]">{rule?.minimumPct != null ? `Regra definida: mínimo ${rule.minimumPct}%.` : "Regra não definida: ninguém é reprovado por frequência até você configurar."} {Number(reviews[0]?.n ?? 0) > 0 && <b className="text-alert">{Number(reviews[0]?.n)} pedido(s) de revisão pendente(s).</b>}</p>
          <p className="hint mt-1"><Link href={`/professor/turmas/${id}/frequencia`}>Mapa de frequência</Link> · <Link href={`/professor/turmas/${id}/configuracoes`}>configurar regra</Link></p>
        </section>
      </div>
    </div>
  );
}
