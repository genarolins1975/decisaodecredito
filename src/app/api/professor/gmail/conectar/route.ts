import { handle, json } from "@/lib/api";
import { ApiError, requireStaff } from "@/lib/auth/guard";
import { authorizationUrl, oauthConfigured } from "@/lib/email/gmail";
import { signExpiring } from "@/lib/crypto";

export const POST = handle(async () => {
  const u = await requireStaff();
  if (!oauthConfigured()) throw new ApiError(400, "Configure GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET no servidor antes de conectar.", "oauth_not_configured");
  const state = signExpiring(`gmail:${u.id}`, 600);
  return json({ url: authorizationUrl(state) });
});
