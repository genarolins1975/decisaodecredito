import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { ApiError, requireActiveUser, requireClassAccess } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { getFile } from "@/lib/services/files";
import { storage } from "@/lib/storage";
import { audit } from "@/lib/audit";

/**
 * Download autorizado. Regras: dono; professor/monitor da turma; membro do grupo da submissão;
 * destinatário da devolutiva; matriculado (bases e materiais); OOT conforme política; rótulos: nunca para alunos.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireActiveUser();
    const f = await getFile(id);
    let allowed = f.ownerUserId === user.id && f.purpose !== "labels";
    if (f.purpose === "labels") allowed = user.isStaff;
    // arquivos de edição (bases, dicionários, OOT por base, materiais) não têm turma: qualquer turma acessível da edição serve
    if (!allowed && !f.classId && ["dataset", "material", "oot"].includes(f.purpose)) {
      const { listAccessibleClasses } = await import("@/lib/auth/guard");
      for (const c of await listAccessibleClasses(user)) {
        let access; try { access = await requireClassAccess(c.cls.id); } catch { access = null; }
        if (!access) continue;
        if (f.purpose !== "oot") { allowed = true; break; }
        const { canDownloadOotFile } = await import("@/lib/services/blind"); if (await canDownloadOotFile(access, f.id)) { allowed = true; break; }
      }
    }
    if (!allowed && f.classId) {
      let access;
      try { access = await requireClassAccess(f.classId); } catch { access = null; }
      if (access) {
        if (access.role !== "aluno") allowed = true;
        else if (f.purpose === "material" || f.purpose === "dataset") allowed = true;
        else if (f.purpose === "submission") {
          const [sub] = await db.select({ s: schema.submissions }).from(schema.submissionFiles).innerJoin(schema.submissions, eq(schema.submissions.id, schema.submissionFiles.submissionId)).where(eq(schema.submissionFiles.fileId, f.id));
          const members = ((sub?.s.membersSnapshot as { userId: string }[]) ?? []).map((m) => m.userId);
          if (sub && (members.includes(user.id) || sub.s.submitterUserId === user.id)) allowed = true;
          if (sub?.s.groupId && !allowed) { const [gm] = await db.select().from(schema.groupMembers).where(and(eq(schema.groupMembers.groupId, sub.s.groupId), eq(schema.groupMembers.userId, user.id))); if (gm && !gm.leftAt) allowed = true; }
        } else if (f.purpose === "feedback") {
          const [g] = await db.select().from(schema.grades).where(and(eq(schema.grades.feedbackFileId, f.id), eq(schema.grades.userId, user.id)));
          if (g && g.publishedAt) allowed = true;
        } else if (f.purpose === "oot") {
          const { canDownloadOotFile } = await import("@/lib/services/blind"); allowed = await canDownloadOotFile(access, f.id);
        }
      }
    }
    if (!allowed) throw new ApiError(403, "Sem permissão para este arquivo");
    await audit({ actorUserId: user.id, action: "file.download", entity: "file", entityId: f.id, classId: f.classId });
    const signed = await storage().signedUrl(f.storageKey, f.originalName, 300);
    if (signed) return NextResponse.redirect(signed);
    const buf = await storage().get(f.storageKey);
    return new NextResponse(new Uint8Array(buf), { headers: { "content-type": f.mime, "content-disposition": `attachment; filename="${encodeURIComponent(f.originalName)}"`, "content-length": String(buf.length), "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
