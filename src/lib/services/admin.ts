import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { ApiError } from "@/lib/auth/guard";
import { audit } from "@/lib/audit";

export async function getOrCreateCourse() {
  const [c] = await db.select().from(schema.courses).limit(1);
  if (c) return c;
  const id = newId();
  const [row] = await db.insert(schema.courses).values({
    id, slug: "decisao-de-credito", name: "Laboratório de Decisão de Crédito", shortName: "Decisão de Crédito",
    professorName: "Prof. Genaro Dueire Lins", institution: "FGV · Mestrado Profissional",
  }).returning();
  return row;
}

export async function createEdition(year: number, label: string, actorId: string) {
  const course = await getOrCreateCourse();
  if (!Number.isInteger(year) || year < 2020 || year > 2100) throw new ApiError(400, "Ano letivo inválido");
  const id = newId();
  const [row] = await db.insert(schema.editions).values({ id, courseId: course.id, year, label: label || String(year), status: "draft" })
    .onConflictDoNothing().returning();
  if (!row) throw new ApiError(409, "Já existe uma edição com este rótulo");
  await audit({ actorUserId: actorId, action: "edition.create", entity: "edition", entityId: id, details: { year, label } });
  return row;
}

export async function createClass(editionId: string, code: string, name: string, actorId: string) {
  const [ed] = await db.select().from(schema.editions).where(eq(schema.editions.id, editionId));
  if (!ed) throw new ApiError(404, "Edição não encontrada");
  if (!/^[A-Za-z0-9\-_.]{2,30}$/.test(code)) throw new ApiError(400, "Código da turma inválido (use letras, números e hífen)");
  const id = newId();
  const [row] = await db.insert(schema.classes).values({ id, editionId, code, name: name || `Turma ${ed.label}` }).onConflictDoNothing().returning();
  if (!row) throw new ApiError(409, "Já existe uma turma com este código nesta edição");
  await audit({ actorUserId: actorId, action: "class.create", entity: "class", entityId: id, classId: id, details: { code, name } });
  return row;
}

/**
 * Duplica uma edição: copia SOMENTE conteúdo e configurações selecionadas
 * (unidades, capítulos, páginas publicadas, questões, rubricas, materiais e catálogo de bases).
 * Não copia turmas, matrículas, grupos, respostas, frequência, submissões ou notas.
 * Datas não existem no nível de edição; prazos ficam nas turmas e exigem revisão.
 */
export async function duplicateEdition(sourceId: string, year: number, label: string, actorId: string, opts = { content: true, rubrics: true, materials: true, datasets: true }) {
  const [src] = await db.select().from(schema.editions).where(eq(schema.editions.id, sourceId));
  if (!src) throw new ApiError(404, "Edição de origem não encontrada");
  const target = await createEdition(year, label, actorId);
  await db.update(schema.editions).set({ contentVersionNote: `Duplicada de ${src.label} em ${new Date().toISOString()}` }).where(eq(schema.editions.id, target.id));
  const pageMap = new Map<string, string>();
  const qvMap = new Map<string, string>();
  const rubricVersionMap = new Map<string, string>();
  await db.transaction(async (tx) => {
    if (opts.content) {
      const units = await tx.select().from(schema.units).where(eq(schema.units.editionId, sourceId)).orderBy(asc(schema.units.position));
      for (const u of units) {
        const uid = newId();
        await tx.insert(schema.units).values({ ...u, id: uid, editionId: target.id, createdAt: undefined });
        const chapters = await tx.select().from(schema.chapters).where(eq(schema.chapters.unitId, u.id)).orderBy(asc(schema.chapters.position));
        for (const c of chapters) {
          const cid = newId();
          await tx.insert(schema.chapters).values({ ...c, id: cid, unitId: uid, createdAt: undefined });
          const pgs = await tx.select().from(schema.pages).where(eq(schema.pages.chapterId, c.id)).orderBy(asc(schema.pages.position));
          for (const p of pgs) {
            const pid = newId();
            pageMap.set(p.id, pid);
            await tx.insert(schema.pages).values({ ...p, id: pid, chapterId: cid, publishedVersionId: null, createdAt: undefined, updatedAt: undefined });
            if (p.publishedVersionId) {
              const [pv] = await tx.select().from(schema.pageVersions).where(eq(schema.pageVersions.id, p.publishedVersionId));
              if (pv) {
                const vid = newId();
                await tx.insert(schema.pageVersions).values({ ...pv, id: vid, pageId: pid, versionNo: 1, changeNote: `Copiada da edição ${src.label} (v${pv.versionNo})`, createdBy: actorId, createdAt: undefined, publishedAt: new Date() });
                await tx.update(schema.pages).set({ publishedVersionId: vid }).where(eq(schema.pages.id, pid));
              }
            }
          }
        }
      }
      const qs = await tx.select().from(schema.questions).where(eq(schema.questions.editionId, sourceId));
      for (const q of qs) {
        const qid = newId();
        await tx.insert(schema.questions).values({ ...q, id: qid, editionId: target.id, pageId: q.pageId ? pageMap.get(q.pageId) ?? null : null, currentVersionId: null, createdAt: undefined });
        if (q.currentVersionId) {
          const [qv] = await tx.select().from(schema.questionVersions).where(eq(schema.questionVersions.id, q.currentVersionId));
          if (qv) {
            const vid = newId(); qvMap.set(qv.id, vid);
            await tx.insert(schema.questionVersions).values({ ...qv, id: vid, questionId: qid, versionNo: 1, createdAt: undefined });
            await tx.update(schema.questions).set({ currentVersionId: vid }).where(eq(schema.questions.id, qid));
          }
        }
      }
    }
    if (opts.rubrics) {
      const rs = await tx.select().from(schema.rubrics).where(eq(schema.rubrics.editionId, sourceId));
      for (const r of rs) {
        const rid = newId();
        await tx.insert(schema.rubrics).values({ ...r, id: rid, editionId: target.id, currentVersionId: null, createdAt: undefined });
        if (r.currentVersionId) {
          const [rv] = await tx.select().from(schema.rubricVersions).where(eq(schema.rubricVersions.id, r.currentVersionId));
          if (rv) {
            const vid = newId(); rubricVersionMap.set(rv.id, vid);
            await tx.insert(schema.rubricVersions).values({ ...rv, id: vid, rubricId: rid, versionNo: 1, createdAt: undefined });
            await tx.update(schema.rubrics).set({ currentVersionId: vid }).where(eq(schema.rubrics.id, rid));
          }
        }
      }
    }
    if (opts.materials) {
      const ms = await tx.select().from(schema.materials).where(eq(schema.materials.editionId, sourceId));
      for (const m of ms) await tx.insert(schema.materials).values({ ...m, id: newId(), editionId: target.id, unitId: null, createdAt: undefined });
    }
    if (opts.datasets) {
      const ds = await tx.select().from(schema.datasets).where(eq(schema.datasets.editionId, sourceId));
      for (const d of ds) await tx.insert(schema.datasets).values({ ...d, id: newId(), editionId: target.id, createdAt: undefined });
    }
  });
  await audit({ actorUserId: actorId, action: "edition.duplicate", entity: "edition", entityId: target.id, details: { from: sourceId, opts, pages: pageMap.size } });
  return { edition: target, copied: { pages: pageMap.size, questions: qvMap.size, rubrics: rubricVersionMap.size } };
}

/** Duplica uma turma: copia encontros (sem datas), trabalhos e etapas (rascunho, sem prazo). Nunca copia pessoas ou registros. */
export async function duplicateClass(sourceId: string, targetEditionId: string, code: string, name: string, actorId: string) {
  const target = await createClass(targetEditionId, code, name, actorId);
  await db.transaction(async (tx) => {
    const meetings = await tx.select().from(schema.meetings).where(eq(schema.meetings.classId, sourceId)).orderBy(asc(schema.meetings.number));
    for (const m of meetings) {
      await tx.insert(schema.meetings).values({ ...m, id: newId(), classId: target.id, unitId: null, scheduledAt: null, endsAt: null, status: "planned", replacementOfId: null, createdAt: undefined });
    }
    const asg = await tx.select().from(schema.assignments).where(eq(schema.assignments.classId, sourceId)).orderBy(asc(schema.assignments.position));
    for (const a of asg) {
      const aid = newId();
      await tx.insert(schema.assignments).values({ ...a, id: aid, classId: target.id, unitId: null, dueAt: null, status: "draft", rubricVersionId: null, createdAt: undefined, updatedAt: undefined });
      const steps = await tx.select().from(schema.assignmentSteps).where(eq(schema.assignmentSteps.assignmentId, a.id));
      for (const s of steps) await tx.insert(schema.assignmentSteps).values({ ...s, id: newId(), assignmentId: aid, dueAt: null });
    }
  });
  await audit({ actorUserId: actorId, action: "class.duplicate", entity: "class", entityId: target.id, classId: target.id, details: { from: sourceId } });
  return target;
}

export async function archiveClass(classId: string, policy: "read_only" | "closed", actorId: string) {
  await db.update(schema.classes).set({ status: "archived", archivePolicy: policy, archivedAt: new Date() }).where(eq(schema.classes.id, classId));
  await audit({ actorUserId: actorId, action: "class.archive", entity: "class", entityId: classId, classId, details: { policy } });
}

export async function setEditionStatus(editionId: string, status: "draft" | "active" | "archived", actorId: string) {
  await db.update(schema.editions).set({ status, archivedAt: status === "archived" ? new Date() : null }).where(eq(schema.editions.id, editionId));
  await audit({ actorUserId: actorId, action: `edition.${status}`, entity: "edition", entityId: editionId });
}

export async function listEditionsWithClasses() {
  const eds = await db.select().from(schema.editions).orderBy(asc(schema.editions.year));
  const cls = eds.length ? await db.select().from(schema.classes).where(inArray(schema.classes.editionId, eds.map((e) => e.id))).orderBy(asc(schema.classes.code)) : [];
  return eds.map((e) => ({ ...e, classes: cls.filter((c) => c.editionId === e.id) }));
}

export async function updateClassConfig(classId: string, patch: Record<string, unknown>, actorId: string) {
  const [c] = await db.select().from(schema.classes).where(eq(schema.classes.id, classId));
  if (!c) throw new ApiError(404, "Turma não encontrada");
  const config = { ...(c.config as Record<string, unknown>), ...patch };
  await db.update(schema.classes).set({ config }).where(eq(schema.classes.id, classId));
  await audit({ actorUserId: actorId, action: "class.config", entity: "class", entityId: classId, classId, details: patch });
  return config;
}

export async function ensureStaffUser(email: string, name: string) {
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (u) { if (!u.isStaff) await db.update(schema.users).set({ isStaff: true }).where(eq(schema.users.id, u.id)); return u; }
  const id = newId();
  const [row] = await db.insert(schema.users).values({ id, email, name, isStaff: true, mustChangePassword: true, emailVerifiedAt: new Date() }).returning();
  return row;
}

export const _internal = { and };
