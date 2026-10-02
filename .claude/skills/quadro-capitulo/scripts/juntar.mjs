// Junta revisões parciais (revisores em paralelo) em docs/capituloN/avaliacao.json.
// Uso: node .claude/skills/quadro-capitulo/scripts/juntar.mjs N tmp/revisao/parte-1.json tmp/revisao/parte-2.json ... tmp/revisao/story.json
// Slides de arquivos posteriores substituem os anteriores (revisão parcial depois de uma correção). As exceções da
// varredura já declaradas em avaliacao.json são mantidas.
import fs from "node:fs";
const [, , N, ...arqs] = process.argv;
if (!N || !arqs.length) { console.error("uso: juntar.mjs N arquivo.json [...]"); process.exit(2); }
const destino = `docs/capitulo${N}/avaliacao.json`;
const atual = fs.existsSync(destino) ? JSON.parse(fs.readFileSync(destino, "utf8")) : {};
const saida = { capitulo: +N, data: new Date().toISOString().slice(0, 10), revisor: "subagentes em contexto limpo", slides: { ...(atual.slides ?? {}) }, storytelling: atual.storytelling ?? {}, estadoDaArte: atual.estadoDaArte ?? [], excecoesVarredura: atual.excecoesVarredura ?? [] };
for (const a of arqs) {
  const j = JSON.parse(fs.readFileSync(a, "utf8"));
  Object.assign(saida.slides, j.slides ?? {});
  if (j.storytelling) saida.storytelling = { ...saida.storytelling, ...j.storytelling };
  if (j.estadoDaArte) saida.estadoDaArte = j.estadoDaArte;
  if (j.leitura) saida.leitura = j.leitura;
}
fs.mkdirSync(`docs/capitulo${N}`, { recursive: true });
fs.writeFileSync(destino, JSON.stringify(saida, null, 1) + "\n");
console.log(`${destino}: ${Object.keys(saida.slides).length} slides, ${Object.keys(saida.storytelling).length} itens de storytelling, ${saida.estadoDaArte.length} temas`);
