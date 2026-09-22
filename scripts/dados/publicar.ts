/**
 * Publica o pacote de bases do trabalho final. Duas etapas, separáveis para que nenhum segredo do banco precise
 * existir onde o pacote foi gerado:
 *
 *   --modo upload     envia os arquivos do diretório ao bucket privado sob bases/v<versao>/ (usa só STORAGE_* e S3_*),
 *                     conferindo o sha256 de cada arquivo contra o manifesto e enviando o próprio manifesto por último;
 *   --modo registrar  lê o manifesto no bucket e registra arquivos, catálogo, materiais e teste cego (usa DATABASE_URL);
 *                     é o mesmo que o botão "Registrar pacote" em Materiais, para o professor;
 *   --modo tudo       as duas etapas (padrão).
 *
 * Uso: npx tsx --tsconfig scripts/tsconfig.json scripts/dados/publicar.ts <diretorio> [--modo upload|registrar|tudo] [--edicao 2026] [--somente 01,02]
 * O upload vai direto ao bucket, sem passar pela Vercel (limite de 4,5 MB por requisição). Nunca grava segredos.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool, schema } from "../../src/lib/db/client";
import { storage } from "../../src/lib/storage";
import { prefixo, registrarPacote, type Manifesto } from "../../src/lib/services/datasets-publish";

const MIME: Record<string, string> = { zip: "application/zip", csv: "text/csv", md: "text/plain", ipynb: "application/json", json: "application/json", pdf: "application/pdf" };
function arg(name: string, fallback?: string) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function sha256File(p: string) { return createHash("sha256").update(fs.readFileSync(p)).digest("hex"); }

async function upload(dir: string, m: Manifesto) {
  const pre = prefixo(m.versao); const s = storage();
  const arquivos = [...m.comum.map((c) => c.arquivo), ...m.bases.flatMap((b) => [b.aluno_zip, b.dicionario, b.oot, b.rotulos, b.professor_zip])];
  console.log(`upload de ${arquivos.length} arquivos para ${s.name}:${pre}`);
  for (const a of arquivos) {
    const full = path.join(dir, a.arquivo);
    if (!fs.existsSync(full)) throw new Error(`arquivo ausente: ${a.arquivo}`);
    const sha = sha256File(full);
    if (sha !== a.sha256) throw new Error(`sha256 divergente para ${a.arquivo}`);
    const key = pre + a.arquivo; const head = await s.head(key);
    if (head && head.size === a.bytes) { console.log(`  = ${a.arquivo} já está no bucket`); continue; }
    const buf = fs.readFileSync(full); await s.put(key, buf, MIME[a.arquivo.split(".").pop()!.toLowerCase()] ?? "application/octet-stream");
    console.log(`  + ${a.arquivo} (${(buf.length / 1048576).toFixed(1)} MB)`);
  }
  await s.put(pre + "manifesto.json", fs.readFileSync(path.join(dir, "manifesto.json")), "application/json");
  console.log("  + manifesto.json");
}

async function main() {
  const dir = process.argv[2];
  if (!dir || !fs.existsSync(path.join(dir, "manifesto.json"))) { console.error("uso: publicar.ts <diretorio com manifesto.json> [--modo upload|registrar|tudo] [--edicao 2026] [--somente 01,02]"); process.exit(1); }
  const m: Manifesto = JSON.parse(fs.readFileSync(path.join(dir, "manifesto.json"), "utf8"));
  const modo = arg("--modo", "tudo")!; const label = arg("--edicao", "2026")!; const somente = arg("--somente")?.split(",");
  if (modo === "upload" || modo === "tudo") await upload(dir, m);
  if (modo === "registrar" || modo === "tudo") {
    const [edition] = await db.select().from(schema.editions).where(eq(schema.editions.label, label));
    if (!edition) throw new Error(`edição ${label} não encontrada`);
    const email = process.env.SEED_PROFESSOR_EMAIL ?? "genaro.lins@gmail.com";
    const [prof] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    const [owner] = prof ? [prof] : await db.select().from(schema.users).where(eq(schema.users.isStaff, true));
    if (!owner) throw new Error("nenhum usuário do professor para ser dono dos arquivos");
    const r = await registrarPacote(edition.id, m.versao, owner.id, { somente });
    console.log(JSON.stringify(r, null, 1));
    await pool.end();
  } else { await pool.end(); }
  console.log("concluído");
}
main().catch((e) => { console.error(e); process.exit(1); });
