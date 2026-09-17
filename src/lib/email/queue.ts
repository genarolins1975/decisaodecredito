import "server-only";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { gmailProvider } from "./gmail";
import { outboxProvider } from "./outbox";
import { EmailProviderError, type EmailProvider } from "./provider";

export function provider(): EmailProvider {
  const p = process.env.EMAIL_PROVIDER ?? "outbox";
  if (p === "gmail") return gmailProvider;
  if (p !== "outbox" && process.env.NODE_ENV === "production") throw new Error(`EMAIL_PROVIDER inválido: ${p}`);
  return outboxProvider;
}

export type QueueInput = {
  kind: string; toEmail: string; toName?: string; toUserId?: string | null; enrollmentId?: string | null; inviteId?: string | null;
  classId?: string | null; subject: string; text: string; html?: string; dedupeKey?: string; createdBy?: string | null;
};

/** Enfileira. dedupeKey evita mensagens repetidas para o mesmo evento. */
export async function enqueueEmail(input: QueueInput) {
  const id = newId();
  const [row] = await db.insert(schema.emailMessages).values({
    id, kind: input.kind, toEmail: input.toEmail, toUserId: input.toUserId ?? null, enrollmentId: input.enrollmentId ?? null,
    inviteId: input.inviteId ?? null, classId: input.classId ?? null, subject: input.subject, bodyText: input.text, bodyHtml: input.html ?? null,
    dedupeKey: input.dedupeKey ?? null, createdBy: input.createdBy ?? null,
  }).onConflictDoNothing({ target: schema.emailMessages.dedupeKey }).returning({ id: schema.emailMessages.id });
  return row?.id ?? null;
}

const BACKOFF_MIN = [1, 5, 15, 60, 240];
/** Minutos em "sending" após os quais a mensagem é considerada interrompida. */
const STUCK_MIN = 10;
/** Orçamento de tempo por execução (as rotas declaram maxDuration = 60 s; o lote para antes disso). */
const BUDGET_MS = 40_000;

/** Processa a fila: tentativas limitadas, backoff exponencial, sem duplicação (linha bloqueada). */
export async function processEmailQueue(limit = 20): Promise<{ sent: number; failed: number; skipped: number }> {
  const p = provider();
  const ready = await p.ready();
  const out = { sent: 0, failed: 0, skipped: 0 };
  const started = Date.now();
  const now = new Date();
  // Recuperação: uma execução interrompida (limite de tempo da função, reinício) deixa a mensagem em "sending" sem desfecho.
  // Após STUCK_MIN minutos ela volta para a fila; a tentativa já contada preserva o limite de reenvios.
  await db.update(schema.emailMessages).set({ status: "queued", lastError: "Envio interrompido antes da confirmação; recolocado na fila", nextAttemptAt: now })
    .where(and(eq(schema.emailMessages.status, "sending"), lte(schema.emailMessages.nextAttemptAt, new Date(now.getTime() - STUCK_MIN * 60e3))));
  if (!ready.ok) return out;
  const due = await db.select({ id: schema.emailMessages.id }).from(schema.emailMessages)
    .where(and(eq(schema.emailMessages.status, "queued"), lte(schema.emailMessages.nextAttemptAt, now)))
    .orderBy(asc(schema.emailMessages.nextAttemptAt)).limit(limit);
  for (const { id } of due) {
    // reserva atômica: só um processo por mensagem
    if (Date.now() - started > BUDGET_MS) break; // deixa o restante para a próxima execução em vez de morrer no meio de um envio
    const claimed = await db.update(schema.emailMessages).set({ status: "sending", attempts: sql`${schema.emailMessages.attempts} + 1`, nextAttemptAt: new Date() })
      .where(and(eq(schema.emailMessages.id, id), eq(schema.emailMessages.status, "queued"))).returning();
    const m = claimed[0];
    if (!m) { out.skipped++; continue; }
    try {
      const r = await p.send({ to: m.toEmail, subject: m.subject, text: m.bodyText, html: m.bodyHtml ?? undefined });
      await db.update(schema.emailMessages).set({ status: "accepted", acceptedAt: new Date(), providerMessageId: r.providerMessageId, lastError: null })
        .where(eq(schema.emailMessages.id, id));
      if (m.enrollmentId && (m.kind === "invite" || m.kind === "invite_existing")) {
        await db.update(schema.enrollments).set({ status: "convidado", updatedAt: new Date() })
          .where(and(eq(schema.enrollments.id, m.enrollmentId), eq(schema.enrollments.status, "autorizado")));
      }
      out.sent++;
    } catch (e) {
      const err = e instanceof EmailProviderError ? e : new EmailProviderError(String(e), true);
      const exhausted = !err.retryable || m.attempts >= m.maxAttempts;
      const delayMin = BACKOFF_MIN[Math.min(m.attempts - 1, BACKOFF_MIN.length - 1)];
      await db.update(schema.emailMessages).set({
        status: exhausted ? "failed" : "queued", lastError: err.message.slice(0, 500),
        nextAttemptAt: new Date(Date.now() + delayMin * 60e3),
      }).where(eq(schema.emailMessages.id, id));
      out.failed++;
      if (err.code === "reconnect" || err.code === "not_connected") break; // sem remetente: parar o lote
    }
  }
  return out;
}
