/* Hífen e travessão como pontuação de prosa nas cascas React.
   O baralho da Aula 2 já é conferido por aula_credito_html/lint-tracos.mjs; este script cobre o
   resto do que o usuário lê: src/app, src/components e os textos de src/lib.

   A regra distingue dois usos do mesmo caractere:
   - pontuação de prosa, que é o que a norma editorial proíbe: "Frequência mínima — vazio = sem regra";
   - marca de ausência de valor numa célula ou opção, que é convenção tipográfica e continua valendo:
     <td>—</td>, {valor ?? "—"}, <option value="">—</option>.
   Por isso um travessão só passa quando é o conteúdo inteiro de uma string ou de um nó de texto. */
import fs from "node:fs";
import path from "node:path";

const RAIZES = ["src/app", "src/components", "src/lib"];
const EXTS = new Set([".ts", ".tsx"]);
const TRACOS = /[—–]/;

function arquivos(dir) {
  const saida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) saida.push(...arquivos(p));
    else if (EXTS.has(path.extname(e.name))) saida.push(p);
  }
  return saida;
}

/** Tira comentários de linha e de bloco, preservando as colunas para o relato ficar fiel. */
function semComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

/** Travessão sozinho como valor: "—", '—', `—`, >—<, {"—"} e a entidade &mdash;. */
const PERMITIDOS = [/(["'`])\s*[—–]\s*\1/g, />\s*[—–]\s*</g, /&mdash;|&ndash;/g];

/** Achados de uma árvore. Exportado para que o teste de contrato cobre a mesma regra do script. */
export function tracosNasCascas(raizes = RAIZES) {
  const achados = [];
  for (const raiz of raizes) {
    for (const arquivo of arquivos(raiz)) {
      const bruto = fs.readFileSync(arquivo, "utf8");
      let corpo = semComentarios(bruto);
      for (const re of PERMITIDOS) corpo = corpo.replace(re, (m) => m.replace(/[—–]/g, " "));
      corpo.split("\n").forEach((linha, i) => {
        if (TRACOS.test(linha)) achados.push({ arquivo, linha: i + 1, texto: bruto.split("\n")[i].trim().slice(0, 140) });
      });
    }
  }
  return achados;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const achados = tracosNasCascas();
  for (const a of achados) console.log(`${a.arquivo}:${a.linha}  ${a.texto}`);
  console.log(`${achados.length} ocorrência${achados.length === 1 ? "" : "s"} de travessão como pontuação de prosa nas cascas`);
  process.exit(achados.length ? 1 : 0);
}
