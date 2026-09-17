/**
 * Seed de desenvolvimento/homologação: cria o curso, a edição 2026, a turma 2026-A,
 * o usuário do professor e contas de teste isoladas. Não envia e-mails.
 * Uso: npm run db:seed  (idempotente)
 */
import "dotenv/config";
import { eq, and } from "drizzle-orm";
import { db, pool, schema } from "../src/lib/db/client";
import { hashPassword } from "../src/lib/auth/password";
import { newId } from "../src/lib/ids";
import { getOrCreateCourse } from "../src/lib/services/admin";

const PROFESSOR_EMAIL = process.env.SEED_PROFESSOR_EMAIL ?? "genaro.lins@gmail.com";
const DEV = process.env.NODE_ENV !== "production";

async function upsertUser(email: string, name: string, password: string | null, isStaff = false, forceChange = false) {
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (u) return u;
  const id = newId();
  const [row] = await db.insert(schema.users).values({
    id, email, name, isStaff, passwordHash: password ? await hashPassword(password) : null, mustChangePassword: !password || forceChange, emailVerifiedAt: new Date(),
  }).returning();
  return row;
}

async function main() {
  const course = await getOrCreateCourse();
  let [ed] = await db.select().from(schema.editions).where(and(eq(schema.editions.courseId, course.id), eq(schema.editions.label, "2026")));
  if (!ed) [ed] = await db.insert(schema.editions).values({ id: newId(), courseId: course.id, year: 2026, label: "2026", status: "active" }).returning();
  let [cls] = await db.select().from(schema.classes).where(and(eq(schema.classes.editionId, ed.id), eq(schema.classes.code, "2026-A")));
  if (!cls) [cls] = await db.insert(schema.classes).values({ id: newId(), editionId: ed.id, code: "2026-A", name: "Turma 2026" }).returning();

  // Professor: em produção, SEED_PROFESSOR_PASSWORD é temporária e a troca é exigida no primeiro acesso
  const profPw = process.env.SEED_PROFESSOR_PASSWORD ?? (DEV ? "professor-dev-2026" : null);
  if (!profPw) throw new Error("Defina SEED_PROFESSOR_PASSWORD (senha temporária do professor) fora do ambiente de desenvolvimento");
  const prof = await upsertUser(PROFESSOR_EMAIL, "Genaro Dueire Lins", profPw, true, !DEV);

  if (DEV && process.env.SEED_TEST_ACCOUNTS !== "0") {
    // contas de teste isoladas (domínio reservado example.test, nunca entregável)
    const monitor = await upsertUser("monitor@example.test", "Monitor Teste", "monitor-dev-2026");
    const alunoA = await upsertUser("aluno.a@example.test", "Aluno A Teste", "aluno-a-dev-2026");
    const alunoB = await upsertUser("aluno.b@example.test", "Aluno B Teste", "aluno-b-dev-2026");
    await upsertUser("sem.matricula@example.test", "Sem Matrícula Teste", "sem-matricula-2026");
    const outra = await upsertUser("aluno.outra@example.test", "Aluno Outra Turma", "aluno-outra-2026");
    let [clsB] = await db.select().from(schema.classes).where(and(eq(schema.classes.editionId, ed.id), eq(schema.classes.code, "2026-B")));
    if (!clsB) [clsB] = await db.insert(schema.classes).values({ id: newId(), editionId: ed.id, code: "2026-B", name: "Turma 2026 B (teste)" }).returning();
    const enroll = async (c: typeof cls, u: typeof prof, role: string) => {
      await db.insert(schema.enrollments).values({ id: newId(), classId: c.id, userId: u.id, email: u.email, name: u.name, role, status: "ativo", activatedAt: new Date(), createdBy: prof.id })
        .onConflictDoNothing();
    };
    await enroll(cls, monitor, "monitor"); await enroll(cls, alunoA, "aluno"); await enroll(cls, alunoB, "aluno"); await enroll(clsB, outra, "aluno");
    // aluno apenas autorizado (para testar convite/ativação)
    await db.insert(schema.enrollments).values({ id: newId(), classId: cls.id, email: "aluno.novo@example.test", name: "Aluno Novo Teste", role: "aluno", status: "autorizado", createdBy: prof.id }).onConflictDoNothing();
  }
  console.log(`seed ok: edição ${ed.label}, turma ${cls.code}, professor ${prof.email}`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
