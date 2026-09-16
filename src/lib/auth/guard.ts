import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser, type CurrentUser } from "./session";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

export type ClassRole = "aluno" | "monitor" | "professor";

export type ClassAccess = {
  user: CurrentUser;
  classId: string;
  role: ClassRole;            // papel efetivo na turma (staff global = professor)
  enrollmentId: string | null;
  cls: typeof schema.classes.$inferSelect;
  edition: typeof schema.editions.$inferSelect;
  archived: boolean;
};

export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) throw new ApiError(401, "Autenticação necessária", "unauthenticated");
  return u;
}

/** Bloqueia toda ação protegida enquanto a credencial temporária não foi trocada. */
export async function requireActiveUser(): Promise<CurrentUser> {
  const u = await requireUser();
  if (u.mustChangePassword) throw new ApiError(403, "Defina sua senha pessoal antes de continuar", "must_change_password");
  return u;
}

export async function requireStaff(): Promise<CurrentUser> {
  const u = await requireActiveUser();
  if (!u.isStaff) throw new ApiError(403, "Acesso restrito ao professor", "forbidden");
  return u;
}

/**
 * Autorização por turma, verificada no servidor a cada requisição:
 * matrícula ativa vinculada ao usuário, ou staff global.
 * Matrícula suspensa/encerrada bloqueia imediatamente, inclusive em sessões existentes.
 */
export async function requireClassAccess(classId: string, roles: ClassRole[] = ["aluno", "monitor", "professor"]): Promise<ClassAccess> {
  const user = await requireActiveUser();
  const [row] = await db.select({ cls: schema.classes, edition: schema.editions }).from(schema.classes)
    .innerJoin(schema.editions, eq(schema.editions.id, schema.classes.editionId))
    .where(eq(schema.classes.id, classId)).limit(1);
  if (!row) throw new ApiError(404, "Turma não encontrada", "not_found");
  const archived = row.cls.status === "archived";
  if (user.isStaff) {
    if (!roles.includes("professor")) throw new ApiError(403, "Ação reservada a alunos", "forbidden");
    return { user, classId, role: "professor", enrollmentId: null, cls: row.cls, edition: row.edition, archived };
  }
  const [enr] = await db.select().from(schema.enrollments).where(and(
    eq(schema.enrollments.classId, classId), eq(schema.enrollments.userId, user.id), eq(schema.enrollments.status, "ativo"),
  )).limit(1);
  if (!enr) throw new ApiError(403, "Você não tem matrícula ativa nesta turma", "no_enrollment");
  const role = enr.role as ClassRole;
  if (!roles.includes(role)) throw new ApiError(403, "Seu papel na turma não permite esta ação", "forbidden");
  return { user, classId, role, enrollmentId: enr.id, cls: row.cls, edition: row.edition, archived };
}

/** Turmas em que o usuário tem matrícula ativa (ou todas, para staff). */
export async function listAccessibleClasses(user: CurrentUser) {
  if (user.isStaff) {
    return db.select({ cls: schema.classes, edition: schema.editions, role: schema.classes.id }).from(schema.classes)
      .innerJoin(schema.editions, eq(schema.editions.id, schema.classes.editionId))
      .then((rows) => rows.map((r) => ({ cls: r.cls, edition: r.edition, role: "professor" as ClassRole })));
  }
  const rows = await db.select({ cls: schema.classes, edition: schema.editions, role: schema.enrollments.role }).from(schema.enrollments)
    .innerJoin(schema.classes, eq(schema.classes.id, schema.enrollments.classId))
    .innerJoin(schema.editions, eq(schema.editions.id, schema.classes.editionId))
    .where(and(eq(schema.enrollments.userId, user.id), inArray(schema.enrollments.status, ["ativo"])));
  return rows.map((r) => ({ cls: r.cls, edition: r.edition, role: r.role as ClassRole }));
}

export function isTeacher(a: ClassAccess) { return a.role === "professor"; }
export function isStaffRole(a: ClassAccess) { return a.role === "professor" || a.role === "monitor"; }
export function assertWritable(a: ClassAccess) {
  if (a.archived && a.role === "aluno") throw new ApiError(403, "Turma arquivada: novas interações estão bloqueadas", "archived");
}
