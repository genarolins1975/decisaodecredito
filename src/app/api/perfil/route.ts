import { z } from "zod";
import { eq } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { requireUser, ApiError } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { audit } from "@/lib/audit";

export const GET = handle(async () => {
  const u = await requireUser();
  const [p] = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, u.id));
  return json({ user: { name: u.name, email: u.email }, profile: { phone: p?.phone ?? null, linkedinUrl: p?.linkedinUrl ?? null, onboardingCompletedAt: p?.onboardingCompletedAt ?? null } });
});

const phoneRe = /^\+?[\d\s().-]{8,20}$/;

/** Campos opcionais: validados só quando preenchidos; vazio remove o valor. */
export const PATCH = handle(async (req) => {
  const u = await requireUser();
  if (u.mustChangePassword) throw new ApiError(403, "Defina sua senha antes", "must_change_password");
  const b = await parseBody(req, z.object({ phone: z.string().max(30).optional(), linkedinUrl: z.string().max(200).optional(), completeOnboarding: z.boolean().optional() }));
  const patch: Partial<typeof schema.profiles.$inferInsert> = { updatedAt: new Date() };
  if (b.phone !== undefined) {
    const v = b.phone.trim();
    if (v && !phoneRe.test(v)) throw new ApiError(400, "Telefone inválido. Use apenas dígitos, espaços, parênteses e hífen.", "invalid_phone");
    patch.phone = v || null;
  }
  if (b.linkedinUrl !== undefined) {
    const v = b.linkedinUrl.trim();
    if (v) {
      let ok = false;
      try { const url = new URL(v); ok = url.protocol === "https:" && /(^|\.)linkedin\.com$/.test(url.hostname); } catch { ok = false; }
      if (!ok) throw new ApiError(400, "Informe uma URL https do linkedin.com.", "invalid_linkedin");
    }
    patch.linkedinUrl = v || null;
  }
  if (b.completeOnboarding) patch.onboardingCompletedAt = new Date();
  await db.insert(schema.profiles).values({ userId: u.id, ...patch }).onConflictDoUpdate({ target: schema.profiles.userId, set: patch });
  await audit({ actorUserId: u.id, action: "profile.update", entity: "user", entityId: u.id, details: { fields: Object.keys(patch) } });
  return json({ ok: true });
});
