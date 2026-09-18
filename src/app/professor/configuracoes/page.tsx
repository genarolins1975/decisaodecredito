import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { requireStaff } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { activeConnection, oauthConfigured } from "@/lib/email/gmail";
import { provider } from "@/lib/email/queue";
import { PageHeader } from "@/components/ui";
import { GmailPanel } from "@/components/professor/gmail-panel";

export const metadata: Metadata = { title: "E-mail" };

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ gmail?: string; m?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const c = await activeConnection();
  const p = provider();
  const ready = await p.ready();
  const queue = await db.select({ id: schema.emailMessages.id, kind: schema.emailMessages.kind, toEmail: schema.emailMessages.toEmail, subject: schema.emailMessages.subject, status: schema.emailMessages.status, attempts: schema.emailMessages.attempts, lastError: schema.emailMessages.lastError, acceptedAt: schema.emailMessages.acceptedAt, createdAt: schema.emailMessages.createdAt })
    .from(schema.emailMessages).orderBy(desc(schema.emailMessages.createdAt)).limit(100);
  return (
    <div>
      <PageHeader eyebrow="Envio de convites e avisos" title="E-mail" lead="A conta do Gmail que envia os convites e a fila de mensagens. Nenhuma senha do Gmail é pedida ou guardada; apenas uma autorização de envio, cifrada e revogável." />
      <GmailPanel status={{ provider: p.name, oauthConfigured: oauthConfigured(), ready, connection: c ? { email: c.emailAddress, connectedAt: c.connectedAt.toISOString(), lastError: c.lastError, scopes: c.scopes } : null }} flash={sp.gmail ? { kind: sp.gmail, message: sp.m ?? null } : null} queue={JSON.parse(JSON.stringify(queue))} />
    </div>
  );
}
