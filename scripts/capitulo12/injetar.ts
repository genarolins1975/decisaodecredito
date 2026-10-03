/**
 * Camada capitulo12V20 do material de origem: o capítulo 12 (Classificação e ensembles) e a Aula 6, que o contém.
 * Gerada a partir de duas fontes versionadas:
 *   src/lib/capitulo12/roteiro.ts       ordem, título, nível e minutos de cada página (os quadros leem o mesmo arquivo)
 *   content/capitulo12/paginas.json     textos do capítulo e da aula; paginas-b1.json a paginas-b4.json: objetivo, apoio, conexão,
 *                                      divisão do tempo e guia do professor de cada página, um arquivo por bloco
 * O script reescreve, em content/original/apresentacao-curso-pd.html, o trecho entre os marcadores da camada e a
 * chamada em inicia(). É idempotente.
 *
 * Uso: npx tsx scripts/capitulo12/injetar.ts && node scripts/content/extract.mjs && npm run content:import
 */
import fs from "node:fs";
import path from "node:path";
import { ROTEIRO } from "../../src/lib/capitulo12/roteiro";

const RAIZ = path.resolve(__dirname, "../..");
const HTML = path.join(RAIZ, "content/original/apresentacao-curso-pd.html");
/* paginas.json traz os textos do capítulo e da aula; paginas-b1.json a paginas-b4.json, as páginas de cada bloco */
const DIR = path.join(RAIZ, "content/capitulo12");
const PAG = JSON.parse(fs.readFileSync(path.join(DIR, "paginas.json"), "utf8")) as {
  capitulo: Record<string, string>; aula: { titulo: string; entrega: string };
  paginas: Record<string, { aprendizado: string; apoio: string; conexao: string; t: Record<string, number>; resumo?: string; guia?: Record<string, unknown> }>;
};
PAG.paginas = Object.assign({}, PAG.paginas, ...fs.readdirSync(DIR).filter((f) => /^paginas-b\d\.json$/.test(f)).sort().map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")).paginas));
const INI = "/* ==== capitulo12V20: início (gerado por scripts/capitulo12/injetar.ts; não editar à mão) ==== */";
const FIM = "/* ==== capitulo12V20: fim ==== */";

const dados = ROTEIRO.map((s) => {
  const p = PAG.paginas[s.slug];
  if (!p) throw new Error(`content/capitulo12/paginas.json sem a página ${s.slug}`);
  const min = Object.values(p.t).reduce((a, b) => a + b, 0);
  if (min !== s.min) throw new Error(`${s.slug}: a divisão do tempo soma ${min} min, o roteiro diz ${s.min}`);
  return { id: s.slug, n: s.n, titulo: s.titulo, nivel: s.nivel === "essencial" ? "essencial" : "complementar", t: p.t, aprendizado: p.aprendizado, apoio: p.apoio, conexao: p.conexao, resumo: p.resumo ?? null, guia: p.guia ?? null };
});
const cap = { n: 12, id: "c12", nome: "Classificação e ensembles", ...PAG.capitulo };

const camada = `${INI}
/* Revisão 20: capítulo 12, Classificação e ensembles (outubro de 2026), numa Aula 6 própria. Cinquenta e uma páginas,
   uma por quadro nativo (src/components/capitulo12), todas novas; nenhum capítulo anterior muda de número. */
const C12V20=${JSON.stringify(dados)};
function capitulo12V20(){
 if(!CAPITULOS.some((c)=>c.n===12))CAPITULOS.push(${JSON.stringify(cap)});
 if(!AULAS.some((a)=>a.n===6))AULAS.push(${JSON.stringify({ n: 6, tipo: "aula", caps: [12], titulo: PAG.aula.titulo, entrega: PAG.aula.entrega })});
 TEMAS_CAP[12]=['#3D5A8A','#EFF3FA'];
 if(!ORDEM_CAP.includes(12))ORDEM_CAP.push(12);
 for(const d of C12V20){
  let p=pagPorId(d.id);
  if(!p){p=P({id:d.id,cap:12,n:d.n,nivel:d.nivel,t:d.t,origem:'rec',titulo:d.titulo,
    visual:()=>\`<div class="painel"><p>\${esc(d.resumo||d.aprendizado)}</p><p class="nota">Quadro interativo do capítulo 12 na plataforma.</p></div>\`});}
  Object.assign(p,{n:d.n,titulo:d.titulo,nivel:d.nivel,t:d.t,aprendizado:d.aprendizado,apoio:d.apoio,conexao:d.conexao});
  p.min=Object.values(d.t).reduce((a,b)=>a+b,0);
  if(d.guia)p.guia=Object.assign({},d.guia);
 }
}
${FIM}`;

let html = fs.readFileSync(HTML, "utf8");
const antes = html;
const i = html.indexOf(INI), j = html.indexOf(FIM);
if (i >= 0 && j > i) html = html.slice(0, i) + camada + html.slice(j + FIM.length);
else html = html.replace("\nfunction inicia(){", `\n${camada}\n\nfunction inicia(){`);
if (!html.includes("  capitulo12V20();")) html = html.replace("  capitulo6ReconstruidoV19();\n", "  capitulo6ReconstruidoV19();\n  capitulo12V20();\n");
if (html !== antes) { fs.writeFileSync(HTML, html); console.log(`camada V20 gravada: ${dados.length} páginas do capítulo 12`); }
else console.log("camada V20 sem mudança");
