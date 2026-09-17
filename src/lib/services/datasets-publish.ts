import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { ApiError } from "@/lib/auth/guard";
import { storage } from "@/lib/storage";
import { audit } from "@/lib/audit";

/**
 * Registro do pacote de bases do trabalho final a partir do bucket privado.
 * O pacote (bases, dicionários, OOT, rótulos, gabaritos, materiais comuns) é enviado ao bucket fora da aplicação
 * (scripts/dados/publicar.ts --modo upload), sob o prefixo bases/v<versao>/, com manifesto.json. Esta função lê o
 * manifesto, confere que cada objeto existe com o tamanho declarado, registra os arquivos em `files` (chave estável,
 * sha256 do manifesto) e atualiza catálogo, materiais e teste cego. Idempotente: rodar de novo atualiza no lugar.
 * Rótulos e gabaritos recebem finalidade "labels": só o professor baixa.
 */
export type Arquivo = { arquivo: string; sha256: string; bytes: number };
export type Manifesto = {
  versao: string; gerado_em: string;
  comum: { arquivo: Arquivo; titulo: string; descricao: string; kind: string; status: "published" | "professor" }[];
  bases: { codigo: string; nome: string; produto: string; populacao: string; enfase: string; versao: string; notas?: string; oot_ids: number; aluno_zip: Arquivo; dicionario: Arquivo; oot: Arquivo; rotulos: Arquivo; professor_zip: Arquivo }[];
};
const MIME: Record<string, string> = { zip: "application/zip", csv: "text/csv", md: "text/plain", ipynb: "application/json", json: "application/json" };
export const prefixo = (versao: string) => `bases/v${versao.replace(/[^\w.-]/g, "")}/`;

export async function lerManifesto(versao: string): Promise<Manifesto> {
  const key = prefixo(versao) + "manifesto.json";
  if (!(await storage().exists(key))) throw new ApiError(404, `manifesto não encontrado no armazenamento: ${key}`);
  const m = JSON.parse((await storage().get(key)).toString("utf8")) as Manifesto;
  if (!Array.isArray(m.bases) || !Array.isArray(m.comum)) throw new ApiError(400, "manifesto inválido");
  return m;
}

async function registrarArquivo(versao: string, a: Arquivo, purpose: string, ownerUserId: string) {
  const key = prefixo(versao) + a.arquivo;
  const head = await storage().head(key);
  if (!head) throw new ApiError(400, `objeto ausente no armazenamento: ${key}`);
  if (head.size !== a.bytes) throw new ApiError(400, `tamanho divergente para ${key}: manifesto ${a.bytes}, armazenamento ${head.size}`);
  const [ex] = await db.select().from(schema.files).where(eq(schema.files.storageKey, key));
  const ext = a.arquivo.split(".").pop()!.toLowerCase();
  if (ex) {
    if (ex.sha256 !== a.sha256 || ex.purpose !== purpose || ex.status !== "complete") await db.update(schema.files).set({ sha256: a.sha256, size: head.size, purpose, status: "complete", completedAt: new Date(), mime: MIME[ext] ?? "application/octet-stream", originalName: a.arquivo }).where(eq(schema.files.id, ex.id));
    return { id: ex.id, novo: false };
  }
  const id = newId();
  await db.insert(schema.files).values({ id, storageKey: key, originalName: a.arquivo, mime: MIME[ext] ?? "application/octet-stream", size: head.size, sha256: a.sha256, ownerUserId, classId: null, purpose, status: "complete", completedAt: new Date() });
  return { id, novo: true };
}

export async function registrarPacote(editionId: string, versao: string, actorUserId: string, opts: { somente?: string[] } = {}) {
  const [edition] = await db.select().from(schema.editions).where(eq(schema.editions.id, editionId));
  if (!edition) throw new ApiError(404, "Edição não encontrada");
  const m = await lerManifesto(versao);
  const resumo = { versao: m.versao, gerado_em: m.gerado_em, arquivos_novos: 0, arquivos_existentes: 0, bases: [] as string[], materiais: [] as string[], turmas: [] as string[] };
  const conta = (r: { id: string; novo: boolean }) => { if (r.novo) resumo.arquivos_novos++; else resumo.arquivos_existentes++; return r.id; };

  const mats = await db.select().from(schema.materials).where(eq(schema.materials.editionId, editionId));
  let pos = Math.max(-1, ...mats.map((x) => x.position)) + 1;
  for (const c of m.comum) {
    const fileId = conta(await registrarArquivo(versao, c.arquivo, c.status === "professor" ? "labels" : "material", actorUserId));
    const ex = mats.find((x) => x.title === c.titulo);
    if (ex) await db.update(schema.materials).set({ fileId, description: c.descricao, kind: c.kind, status: c.status }).where(eq(schema.materials.id, ex.id));
    else await db.insert(schema.materials).values({ id: newId(), editionId, title: c.titulo, kind: c.kind, description: c.descricao, fileId, status: c.status, position: pos++ });
    resumo.materiais.push(c.titulo);
  }
  for (const b of m.bases) {
    if (opts.somente && !opts.somente.includes(b.codigo.slice(0, 2)) && !opts.somente.includes(b.codigo)) continue;
    const fileId = conta(await registrarArquivo(versao, b.aluno_zip, "dataset", actorUserId));
    const dictionaryFileId = conta(await registrarArquivo(versao, b.dicionario, "dataset", actorUserId));
    const ootFileId = conta(await registrarArquivo(versao, b.oot, "oot", actorUserId));
    const labelsFileId = conta(await registrarArquivo(versao, b.rotulos, "labels", actorUserId));
    const teacherFileId = conta(await registrarArquivo(versao, b.professor_zip, "labels", actorUserId));
    const valores = { name: b.nome, product: b.produto, population: b.populacao, emphasis: b.enfase, version: b.versao, status: "disponivel", fileId, dictionaryFileId, ootFileId, labelsFileId, teacherFileId,
      notes: b.notas ?? `Registrada em ${new Date().toISOString().slice(0, 10)} a partir do manifesto v${m.versao} (gerado em ${m.gerado_em}). OOT com ${b.oot_ids} IDs.` };
    const [ex] = await db.select().from(schema.datasets).where(and(eq(schema.datasets.editionId, editionId), eq(schema.datasets.code, b.codigo)));
    if (ex) await db.update(schema.datasets).set(valores).where(eq(schema.datasets.id, ex.id));
    else await db.insert(schema.datasets).values({ id: newId(), editionId, code: b.codigo, ...valores });
    resumo.bases.push(b.codigo);
  }
  const expectedIds = m.bases[0]?.oot_ids ?? null;
  for (const cls of await db.select().from(schema.classes).where(eq(schema.classes.editionId, editionId))) {
    const [a] = await db.select().from(schema.assignments).where(and(eq(schema.assignments.classId, cls.id), eq(schema.assignments.slug, "trabalho-final")));
    if (!a) continue;
    const [cfg] = await db.select().from(schema.blindTests).where(eq(schema.blindTests.assignmentId, a.id));
    if (!cfg) await db.insert(schema.blindTests).values({ id: newId(), assignmentId: a.id, releasePolicy: "apos_congelamento", maxSubmissions: 1, feedbackLevel: "recibo", expectedIds });
    else await db.update(schema.blindTests).set({ expectedIds }).where(eq(schema.blindTests.id, cfg.id));
    await db.update(schema.assignments).set({ blindTestEnabled: true }).where(eq(schema.assignments.id, a.id));
    resumo.turmas.push(cls.code);
  }
  await audit({ actorUserId, action: "datasets.register", entity: "edition", entityId: editionId, details: resumo });
  return resumo;
}
