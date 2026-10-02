// Portão de qualidade de um capítulo de quadros. Uso: node .claude/skills/quadro-capitulo/scripts/avaliar.mjs N
// Junta as medidas automáticas (auditoria do palco em duas resoluções, varredura, axe, funcional, testes da biblioteca)
// com as notas do revisor independente (docs/capituloN/avaliacao.json), escreve docs/capituloN/AVALIACAO.md e sai com
// código 1 se qualquer item de qualquer slide ou do storytelling ficar abaixo de 9 ou sem evidência.
// Caminhos alternativos: --a1920 --a1400 --varredura --axe --funcional (padrões abaixo).
import fs from "node:fs";
import { execSync } from "node:child_process";

const N = process.argv[2] ?? "7";
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const P = {
  a1920: arg("a1920", `tmp/ux/auditoria-c${N}-1920.json`),
  a1400: arg("a1400", `tmp/ux/auditoria-c${N}-1400.json`),
  varredura: arg("varredura", "tmp/shots/final/relatorio.json"),
  axe: arg("axe", `tmp/axe${N}.json`),
  funcional: arg("funcional", `tmp/funcional-c${N}.txt`),
  avaliacao: `docs/capitulo${N}/avaliacao.json`,
  saida: `docs/capitulo${N}/AVALIACAO.md`,
};
const MIN = 9;
const ler = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const roteiro = fs.readFileSync(`src/lib/capitulo${N}/roteiro.ts`, "utf8");
const SLIDES = [...roteiro.matchAll(/slug: "(c\d+p\d+)", n: (\d+),[^\n]*?titulo: "([^"]+)"/g)].map((m) => ({ slug: m[1], n: +m[2], titulo: m[3] })).sort((a, b) => a.n - b.n);
if (!SLIDES.length) { console.error(`Roteiro sem slides: src/lib/capitulo${N}/roteiro.ts`); process.exit(2); }

const a1920 = ler(P.a1920), a1400 = ler(P.a1400), varr = ler(P.varredura), axe = ler(P.axe), av = ler(P.avaliacao);
const func = fs.existsSync(P.funcional) ? fs.readFileSync(P.funcional, "utf8") : null;
const falhasFunc = func ? func.split("\n").filter((l) => l.startsWith("FALHA")) : null;
const excecoes = av?.excecoesVarredura ?? [];
const excecao = (slug, cen) => excecoes.find((e) => e.slug === slug && (e.cenario === cen || e.cenario === "*"));

let testes = { ok: false, msg: "" };
try {
  const alvo = fs.readdirSync("tests").filter((f) => f.startsWith(`capitulo${N}-`)).map((f) => `tests/${f}`);
  execSync(`npx vitest run ${alvo.join(" ")}`, { stdio: "pipe" });
  testes = { ok: true, msg: `${alvo.length} arquivos de teste da biblioteca passando` };
} catch (e) { testes = { ok: false, msg: String(e.stdout ?? e.message).split("\n").filter((l) => /FAIL|✗|×/.test(l)).slice(0, 5).join("; ") || "falha nos testes" }; }

const item = (nota, evidencia, corrigir = "") => ({ nota: Math.round(nota * 10) / 10, evidencia, corrigir });
const humano = (x) => (!x || typeof x.nota !== "number" || !String(x.evidencia ?? "").trim()) ? item(0, "sem nota ou sem evidência do revisor", "rodar o revisor") : item(x.nota, x.evidencia, x.corrigir ?? "");

const resultado = SLIDES.map((s) => {
  const r1 = a1920?.[s.slug], r2 = a1400?.[s.slug];
  // Layout: menor média das duas resoluções; teto 8 com achado da varredura não excetuado.
  let layout = (r1 && r2) ? item(Math.min(r1.media, r2.media), `auditoria ${r1.media.toFixed(2)} em 1920 × 1080 e ${r2.media.toFixed(2)} em 1400 × 900`) : item(0, "slide ausente da auditoria", "rodar a auditoria nas duas resoluções");
  const achados = (varr ?? []).filter((v) => v.slug === s.slug).flatMap((v) => {
    const cen = `${v.wh}:${v.modo}`, l = [];
    if (v.cortes?.length) l.push(`${cen} corte em ${v.cortes.length} elemento(s)`);
    if (v.fora?.length) l.push(`${cen} ${v.fora.length} elemento(s) fora do quadro`);
    if (v.rolaX) l.push(`${cen} rolagem horizontal`);
    if (v.erros?.length) l.push(`${cen} ${v.erros.length} erro(s) de console`);
    return excecao(s.slug, cen) ? [] : l;
  });
  if (!varr) layout = item(Math.min(layout.nota, 8), `${layout.evidencia}; varredura ausente`, "rodar a varredura");
  else if (achados.length) layout = item(Math.min(layout.nota, 8), `${layout.evidencia}; varredura: ${achados.join("; ")}`, "corrigir os achados da varredura");
  else layout.evidencia += "; varredura limpa nos cenários medidos";

  const legs = [r1, r2].filter(Boolean).flatMap((r) => r.telas.map((t) => ({ n: t.notas.legibilidade, f: t.fonteMin, el: t.fonteMinEl })));
  const pior = legs.sort((a, b) => a.n - b.n)[0];
  const legib = pior ? item(pior.n, `menor fonte ${pior.f}% da altura (${pior.el})`, pior.n < MIN ? `aumentar ${pior.el}` : "") : item(0, "sem medida de legibilidade", "rodar a auditoria");

  let acess;
  if (!axe || !(s.slug in axe)) acess = item(0, "slide ausente do relatório do axe", "rodar acessibilidade.mjs");
  else {
    const v = axe[s.slug], grave = v.some((x) => ["serious", "critical"].includes(x.impact));
    acess = item(v.length === 0 ? 10 : grave ? 6 : 8, v.length ? `axe: ${v.map((x) => `${x.id} (${x.impact})`).join(", ")}` : "axe sem violações");
    if (!falhasFunc) acess = item(Math.min(acess.nota, 8), `${acess.evidencia}; verificação funcional ausente`, "rodar funcional.mjs e gravar a saída");
    else if (falhasFunc.length) acess = item(Math.min(acess.nota, 8), `${acess.evidencia}; funcional: ${falhasFunc.length} falha(s)`, "corrigir as falhas de teclado e foco");
    else acess.evidencia += "; teclado, foco e movimento reduzido conferidos";
  }

  const h = av?.slides?.[s.slug] ?? {};
  let rigor = humano(h.rigor);
  if (!testes.ok) rigor = item(Math.min(rigor.nota, 8), `${rigor.evidencia}; testes da biblioteca falhando`, "corrigir a biblioteca");
  return { ...s, itens: { layout, legibilidade: legib, beleza: humano(h.beleza), didatica: humano(h.didatica), interacao: humano(h.interacao), rigor, acessibilidade: acess } };
});

// Storytelling, com o estado da arte recalculado pela lista de cobertura.
const lista = av?.estadoDaArte ?? [];
const ess = lista.filter((t) => t.classe === "essencial"), fro = lista.filter((t) => t.classe === "fronteira");
const coberto = (t) => Array.isArray(t.slides) && t.slides.length > 0;
const essFalta = ess.filter((t) => !coberto(t)), froOk = fro.filter(coberto).length;
const notaEA = !lista.length ? 0 : essFalta.length ? 8 : froOk === fro.length ? 10 : froOk >= fro.length / 2 ? 9 : 8;
const evEA = lista.length ? `essenciais ${ess.length - essFalta.length}/${ess.length}${essFalta.length ? ` (faltam ${essFalta.map((t) => t.id).join(", ")})` : ""}; fronteira ${froOk}/${fro.length}` : "checklist ausente";
const ST = ["coerencia", "arco", "exemplo", "progressao", "estadoDaArte", "fechamento"];
const NOMES = { coerencia: "Coerência", arco: "Arco narrativo", exemplo: "Exemplo prático", progressao: "Progressão", estadoDaArte: "Estado da arte", fechamento: "Fechamento e transferência" };
const story = Object.fromEntries(ST.map((k) => {
  let x = humano(av?.storytelling?.[k]);
  if (k === "estadoDaArte") x = item(Math.min(x.nota, notaEA), `${evEA}. Revisor: ${x.evidencia}`, x.corrigir);
  return [k, x];
}));

// Relatório.
const ITENS = ["layout", "legibilidade", "beleza", "didatica", "interacao", "rigor", "acessibilidade"];
const CAB = ["Layout", "Legib.", "Beleza", "Didática", "Interação", "Rigor", "Acess."];
const f = (x) => (x.nota < MIN ? `**${x.nota.toFixed(1).replace(".", ",")}**` : x.nota.toFixed(1).replace(".", ","));
const reprov = [];
for (const s of resultado) for (const k of ITENS) if (s.itens[k].nota < MIN) reprov.push(`Slide ${s.n} (${s.slug}), ${k}: ${s.itens[k].nota}. ${s.itens[k].evidencia}${s.itens[k].corrigir ? `. Corrigir: ${s.itens[k].corrigir}` : ""}`);
for (const k of ST) if (story[k].nota < MIN) reprov.push(`Storytelling, ${NOMES[k]}: ${story[k].nota}. ${story[k].evidencia}${story[k].corrigir ? `. Corrigir: ${story[k].corrigir}` : ""}`);
const todas = resultado.flatMap((s) => ITENS.map((k) => s.itens[k].nota));
const media = todas.reduce((a, b) => a + b, 0) / todas.length;
const L = [];
L.push(`# Avaliação do capítulo ${N}`, "");
L.push(`Gerado por \`.claude/skills/quadro-capitulo/scripts/avaliar.mjs\` em ${new Date().toISOString().slice(0, 10)}. Mínimo ${MIN} em cada item. Notas humanas: ${av ? `${av.revisor ?? "revisor"}, ${av.data ?? "sem data"}` : "ausentes"}.`, "");
L.push(`**Resultado: ${reprov.length ? `REPROVADO, ${reprov.length} item(ns) abaixo de ${MIN}` : "APROVADO"}.** Média dos ${todas.length} itens de slide: ${media.toFixed(2).replace(".", ",")}; menor: ${Math.min(...todas).toFixed(1).replace(".", ",")}. Testes da biblioteca: ${testes.ok ? "passando" : "FALHANDO"} (${testes.msg}).`, "");
if (reprov.length) { L.push("## Itens abaixo do mínimo", ""); reprov.forEach((r) => L.push(`- ${r}`)); L.push(""); }
L.push("## Storytelling do capítulo", "", "| Item | Nota | Evidência |", "|---|---|---|");
for (const k of ST) L.push(`| ${NOMES[k]} | ${f(story[k])} | ${story[k].evidencia.replace(/\|/g, "/")} |`);
L.push("", "## Estado da arte", "", "| id | Tema | Classe | Onde | Referência |", "|---|---|---|---|---|");
for (const t of lista) L.push(`| ${t.id} | ${t.tema} | ${t.classe} | ${coberto(t) ? t.slides.join(", ") : "**não coberto**"} | ${t.fonte ?? ""} |`);
L.push("", "## Slide a slide", "", `| Slide | ${CAB.join(" | ")} |`, `|---|${CAB.map(() => "---").join("|")}|`);
for (const s of resultado) L.push(`| ${s.n} ${s.slug} | ${ITENS.map((k) => f(s.itens[k])).join(" | ")} |`);
L.push("", "## Evidências por slide", "");
for (const s of resultado) {
  L.push(`### ${s.n}. ${s.titulo} (${s.slug})`, "");
  for (const [i, k] of ITENS.entries()) L.push(`- **${CAB[i]} ${f(s.itens[k])}:** ${s.itens[k].evidencia}${s.itens[k].corrigir && s.itens[k].nota < MIN ? ` Corrigir: ${s.itens[k].corrigir}` : ""}`);
  L.push("");
}
if (excecoes.length) { L.push("## Exceções declaradas da varredura", ""); excecoes.forEach((e) => L.push(`- ${e.slug}, ${e.cenario}: ${e.motivo}`)); L.push(""); }
L.push("## Fontes das medidas", "");
for (const [k, p] of Object.entries(P)) if (k !== "saida") L.push(`- ${k}: \`${p}\`${fs.existsSync(p) ? "" : " (ausente)"}`);
fs.mkdirSync(`docs/capitulo${N}`, { recursive: true });
fs.writeFileSync(P.saida, L.join("\n") + "\n");
console.log(`${reprov.length ? "REPROVADO" : "APROVADO"}: ${reprov.length} item(ns) abaixo de ${MIN}. Relatório em ${P.saida}`);
reprov.slice(0, 40).forEach((r) => console.log(" ", r));
process.exit(reprov.length ? 1 : 0);
