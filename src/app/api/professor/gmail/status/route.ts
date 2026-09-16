import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { activeConnection, oauthConfigured } from "@/lib/email/gmail";
import { provider } from "@/lib/email/queue";

export const GET = handle(async () => {
  await requireStaff();
  const c = await activeConnection();
  const p = provider();
  return json({ provider: p.name, oauthConfigured: oauthConfigured(), ready: await p.ready(),
    connection: c ? { email: c.emailAddress, connectedAt: c.connectedAt, lastError: c.lastError, lastErrorAt: c.lastErrorAt, scopes: c.scopes } : null });
});
