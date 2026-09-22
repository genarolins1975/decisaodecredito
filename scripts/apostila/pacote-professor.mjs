/**
 * Monta o pacote privado dos guias do professor. O guia do professor traz gabaritos e o repositório é público, então ele
 * não vai para content/materiais: sai pelo mesmo canal dos gabaritos do trabalho final, o bucket privado.
 * Copia build/capitulo-NN-professor.pdf para <saida>/ e escreve <saida>/manifesto.json no formato do registro de materiais
 * (`bases: []`, só materiais comuns, status "professor": só a equipe vê e baixa).
 * Depois: enviar a pasta ao bucket sob bases/v<versao>/ (`scripts/dados/publicar.ts <saida> --modo upload`, ou o painel do
 * R2) e, na plataforma, Bases e gabaritos → "Registrar pacote" com a mesma versão. Registrar de novo atualiza no lugar.
 * Uso: node scripts/apostila/pacote-professor.mjs <versao> <saida> [capítulos, padrão 4,5,6]   (APOSTILA_DIR como no gerar.mjs)
 */
import fs from "node:fs"; import path from "node:path"; import { createHash } from "node:crypto"; import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUILD = path.join(path.resolve(process.env.APOSTILA_DIR ?? path.join(REPO, "tmp/apostila")), "build");
const [versao, saida, capsArg = "4,5,6"] = process.argv.slice(2);
if (!versao || !saida || !/^[\w.-]{1,20}$/.test(versao)) { console.error("uso: pacote-professor.mjs <versao, até 20 caracteres [A-Za-z0-9_.-]> <saida> [capítulos]"); process.exit(1); }
const DESCRICAO = "Como conduzir cada página, na ordem da aula. Abre com Em sala: as essenciais, os tempos, a pergunta para a turma e a ponte para a próxima. Depois, página a página, o roteiro de fala, a resposta esperada, os erros previsíveis com a intervenção e as questões com gabarito e diagnóstico. Contém gabaritos: não distribuir aos alunos.";
fs.mkdirSync(saida, { recursive: true });
const comum = capsArg.split(",").map(Number).map((n) => {
  const nome = `capitulo-${String(n).padStart(2, "0")}-professor.pdf`; const origem = path.join(BUILD, nome);
  if (!fs.existsSync(origem)) throw new Error(`guia ausente: ${origem} (rode gerar.mjs professor ${n} --pdf)`);
  const buf = fs.readFileSync(origem); fs.writeFileSync(path.join(saida, nome), buf);
  return { arquivo: { arquivo: nome, sha256: createHash("sha256").update(buf).digest("hex"), bytes: buf.length }, titulo: `Capítulo ${n}: guia do professor (PDF)`, descricao: DESCRICAO, kind: "arquivo", status: "professor" };
});
fs.writeFileSync(path.join(saida, "manifesto.json"), JSON.stringify({ versao, gerado_em: new Date().toISOString().slice(0, 10), comum, bases: [] }, null, 1) + "\n");
console.log(`pacote ${versao} em ${saida}: ${comum.map((c) => `${c.arquivo.arquivo} (${(c.arquivo.bytes / 1e6).toFixed(1)} MB)`).join(", ")} e manifesto.json`);
console.log(`próximo passo: enviar a pasta para bases/v${versao}/ no bucket e registrar a versão "${versao}" em Bases e gabaritos.`);
