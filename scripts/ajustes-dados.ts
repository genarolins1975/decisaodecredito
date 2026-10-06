/**
 * Ajustes pontuais de dados, aplicados uma única vez no build (scripts/vercel-build.sh), sob a mesma trava
 * de ambiente do bootstrap e da importação de conteúdo. Cada ajuste deixa um registro no audit_log; a
 * presença desse registro impede nova execução, de modo que uma matrícula criada depois do ajuste fica
 * como foi cadastrada.
 *
 * monitores_para_aluno (06/10/2026): o curso não tem monitores. Matrícula com papel monitor em turma não
 * arquivada não vê o formulário do manifesto nem recebe o OOT do grupo; passa a aluno. Turmas arquivadas
 * ficam como estão, para preservar o histórico.
 *
 * Uso manual: npm run dados:ajustes
 */
import "dotenv/config";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db, pool, schema } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";

const MONITORES = "ajuste.monitores_para_aluno";

async function monitoresParaAluno() {
  const [feito] = await db.select({ id: schema.auditLog.id }).from(schema.auditLog).where(eq(schema.auditLog.action, MONITORES)).limit(1);
  if (feito) { console.log(`ajustes: ${MONITORES} já aplicado`); return; }
  await db.transaction(async (tx) => {
    const alvo = await tx.select({ id: schema.enrollments.id, classId: schema.enrollments.classId, email: schema.enrollments.email, name: schema.enrollments.name })
      .from(schema.enrollments).innerJoin(schema.classes, eq(schema.classes.id, schema.enrollments.classId))
      .where(and(eq(schema.enrollments.role, "monitor"), ne(schema.classes.status, "archived")));
    if (alvo.length) await tx.update(schema.enrollments).set({ role: "aluno", updatedAt: sql`now()` }).where(inArray(schema.enrollments.id, alvo.map((e) => e.id)));
    await tx.insert(schema.auditLog).values({ id: newId(), action: MONITORES, entity: "enrollment", details: { total: alvo.length, matriculas: alvo } });
    console.log(`ajustes: ${MONITORES}: ${alvo.length} matrícula(s) de monitor passaram a aluno${alvo.length ? ` (${alvo.map((e) => e.email).join(", ")})` : ""}`);
  });
}

async function main() {
  await monitoresParaAluno();
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
