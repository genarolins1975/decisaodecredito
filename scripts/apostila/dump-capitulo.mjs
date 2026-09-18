/** Imprime o conteúdo de um capítulo em texto, para escrever as explicações dos slides. Uso: node scripts/apostila/dump-capitulo.mjs 4 */
import fs from "node:fs";
const ex = JSON.parse(fs.readFileSync("content/generated/extract.json", "utf8"));
const n = Number(process.argv[2]); const strip = (h) => String(h ?? "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const registro = fs.readFileSync("src/components/visuais/registro.tsx", "utf8");
const c = ex.meta.capitulos.find((x) => x.n === n);
console.log(`# Capítulo ${n} · ${c.nome}\npergunta: ${c.pergunta}\naprende: ${c.aprende}\nmotiva: ${c.motiva}\natividade: ${c.atividade}\nusa: ${c.usa}\nprereq: ${c.prereq}`);
for (const p of ex.pages.filter((p) => p.cap === n)) {
  const m = registro.match(new RegExp(`\\b${p.id}: \\{ Componente: (\\w+)`)); const comp = m ? m[1] : null;
  console.log(`\n## ${p.id} · ${p.titulo} · ${p.nivel} · ${p.min} min · origem ${p.origem}${comp ? ` · peça nativa: ${comp}` : ""}`);
  console.log(`objetivo: ${p.aprendizado}\napoio: ${p.apoio}\nconexao: ${p.conexao}`);
  const g = p.guia ?? {}; for (const k of Object.keys(g)) console.log(`guia.${k}: ${typeof g[k] === "string" ? g[k] : JSON.stringify(g[k])}`);
  console.log(`texto da página: ${(p.text || strip(p.html)).replace(/\n+/g, " | ").slice(0, 1600)}`);
  for (const q of p.questoes ?? []) console.log(`questao ${q.rot ?? ""}: ${q.pergunta} | alternativas: ${(q.alt ?? []).join(" / ")} | correta: ${q.certa} | por quê: ${q.porqueCerta ?? ""}`);
  for (const v of p.prever ?? []) console.log(`prever: ${v.pergunta} | opções: ${(v.opcoes ?? []).join(" / ")} | revelação: ${strip(v.revealHtml).slice(0, 700)}`);
}
