import "server-only";
import { cookies, headers } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { randomToken, sha256 } from "@/lib/crypto";
import { newId } from "@/lib/ids";

export const SESSION_COOKIE = "sessao";
const ABSOLUTE_DAYS = 30;
const IDLE_HOURS = 24 * 7;

export type CurrentUser = {
  id: string; email: string; name: string; isStaff: boolean; mustChangePassword: boolean;
  sessionId: string;
};

export async function clientMeta() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "";
  return { ipHash: ip ? sha256(ip).slice(0, 32) : null, userAgent: (h.get("user-agent") || "").slice(0, 300) };
}

export async function createSession(userId: string) {
  const token = randomToken(32);
  const id = sha256(token);
  const meta = await clientMeta();
  const expiresAt = new Date(Date.now() + ABSOLUTE_DAYS * 86400e3);
  await db.insert(schema.sessions).values({ id, userId, expiresAt, ipHash: meta.ipHash, userAgent: meta.userAgent });
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt,
  });
  return id;
}

export async function destroySession() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.update(schema.sessions).set({ revokedAt: new Date(), revokedReason: "logout" })
      .where(eq(schema.sessions.id, sha256(token)));
  }
  c.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function revokeAllSessions(userId: string, reason: string, exceptSessionId?: string) {
  const rows = await db.select({ id: schema.sessions.id }).from(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), isNull(schema.sessions.revokedAt)));
  for (const r of rows) {
    if (exceptSessionId && r.id === exceptSessionId) continue;
    await db.update(schema.sessions).set({ revokedAt: new Date(), revokedReason: reason }).where(eq(schema.sessions.id, r.id));
  }
}

/** Usuário da sessão atual, validado no banco (expiração absoluta, ociosidade, revogação, conta desativada). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = sha256(token);
  const now = new Date();
  const [row] = await db.select({
    sid: schema.sessions.id, lastSeenAt: schema.sessions.lastSeenAt,
    uid: schema.users.id, email: schema.users.email, name: schema.users.name,
    isStaff: schema.users.isStaff, mustChangePassword: schema.users.mustChangePassword, disabledAt: schema.users.disabledAt,
  }).from(schema.sessions).innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, id), isNull(schema.sessions.revokedAt), gt(schema.sessions.expiresAt, now)))
    .limit(1);
  if (!row || row.disabledAt) return null;
  if (now.getTime() - row.lastSeenAt.getTime() > IDLE_HOURS * 3600e3) {
    await db.update(schema.sessions).set({ revokedAt: now, revokedReason: "idle" }).where(eq(schema.sessions.id, id));
    return null;
  }
  if (now.getTime() - row.lastSeenAt.getTime() > 60e3) {
    await db.update(schema.sessions).set({ lastSeenAt: now }).where(eq(schema.sessions.id, id));
  }
  return { id: row.uid, email: row.email, name: row.name, isStaff: row.isStaff, mustChangePassword: row.mustChangePassword, sessionId: row.sid };
}
