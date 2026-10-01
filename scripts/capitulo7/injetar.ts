/**
 * Camada capitulo7ReconstruidoV18 do material de origem, gerada a partir de duas fontes versionadas:
 *   src/lib/capitulo7/roteiro.ts       ordem, título, nível e minutos de cada página (os quadros leem o mesmo arquivo)
 *   content/capitulo7/paginas.json     objetivo, apoio, conexão, divisão do tempo, guia do professor, resumo estático
 *                                      das páginas novas e ajustes nas questões originais
 * O script reescreve, em content/original/apresentacao-curso-pd.html, o trecho entre os marcadores da camada e a
 * chamada em inicia(). É idempotente: rodar de novo sem mudança nas fontes não altera o arquivo.
 *
 * Uso: npx tsx scripts/capitulo7/injetar.ts && node scripts/content/extract.mjs && npm run content:import
 */
import fs from "node:fs";
import path from "node:path";
import { ROTEIRO } from "../../src/lib/capitulo7/roteiro";

const RAIZ = path.resolve(__dirname, "../..");
const HTML = path.join(RAIZ, "content/original/apresentacao-curso-pd.html");
const PAG = JSON.parse(fs.readFileSync(path.join(RAIZ, "content/capitulo7/paginas.json"), "utf8")) as {
  paginas: Record<string, { aprendizado: string; apoio: string; conexao: string; t: Record<string, number>; resumo?: string; guia?: Record<string, unknown> }>;
  questoes?: Record<string, Record<string, unknown>>;
};
const INI = "/* ==== capitulo7ReconstruidoV18: início (gerado por scripts/capitulo7/injetar.ts; não editar à mão) ==== */";
const FIM = "/* ==== capitulo7ReconstruidoV18: fim ==== */";

const dados = ROTEIRO.map((s) => {
  const p = PAG.paginas[s.slug];
  if (!p) throw new Error(`content/capitulo7/paginas.json sem a página ${s.slug}`);
  const min = Object.values(p.t).reduce((a, b) => a + b, 0);
  if (min !== s.min) throw new Error(`${s.slug}: a divisão do tempo soma ${min} min, o roteiro diz ${s.min}`);
  return { id: s.slug, n: s.n, titulo: s.titulo, nivel: s.nivel === "essencial" ? "essencial" : "complementar", t: p.t, min, aprendizado: p.aprendizado, apoio: p.apoio, conexao: p.conexao, resumo: p.resumo ?? null, guia: p.guia ?? null };
});

const camada = `${INI}
/* Revisão 18: capítulo 7 reconstruído (outubro de 2026). Trinta e oito páginas, uma por quadro nativo
   (src/components/capitulo7): as vinte antigas mantêm o identificador e mudam de lugar pela ordem n; as dezoito novas
   entram aqui por P(). O conteúdo herdado das antigas continua no arquivo para a extração das questões originais. */
const C7V18=${JSON.stringify(dados)};
function capitulo7ReconstruidoV18(){
 for(const d of C7V18){
  let p=pagPorId(d.id);
  if(!p){p=P({id:d.id,cap:7,n:d.n,nivel:d.nivel,t:d.t,origem:'rec',titulo:d.titulo,
    visual:()=>\`<div class="painel"><p>\${esc(d.resumo||d.aprendizado)}</p><p class="nota">Quadro interativo do capítulo 7 na plataforma.</p></div>\`});}
  Object.assign(p,{n:d.n,titulo:d.titulo,nivel:d.nivel,t:d.t,min:d.min,aprendizado:d.aprendizado,apoio:d.apoio,conexao:d.conexao});
  if(d.guia)p.guia=Object.assign({},d.guia);
 }
${Object.entries(PAG.questoes ?? {}).map(([nome, o]) => ` Object.assign(${nome},${JSON.stringify(o)});`).join("\n")}
}
${FIM}`;

let html = fs.readFileSync(HTML, "utf8");
const antes = html;
const i = html.indexOf(INI), j = html.indexOf(FIM);
if (i >= 0 && j > i) html = html.slice(0, i) + camada + html.slice(j + FIM.length);
else html = html.replace("\nfunction inicia(){", `\n${camada}\n\nfunction inicia(){`);
if (!html.includes("  capitulo7ReconstruidoV18();")) html = html.replace("  capitulo6NoPalcoV17();\n", "  capitulo6NoPalcoV17();\n  capitulo7ReconstruidoV18();\n");
if (html !== antes) { fs.writeFileSync(HTML, html); console.log(`camada V18 gravada: ${dados.length} páginas do capítulo 7`); }
else console.log("camada V18 sem mudança");
