/** Gera docs/02-inventario-e-mapa-de-cobertura.md a partir de content/generated/{inventory,extract,sweep}.json */
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "../..");
const G = path.join(ROOT, "content/generated");
const inv = JSON.parse(fs.readFileSync(path.join(G, "inventory.json"), "utf8"));
const ex = JSON.parse(fs.readFileSync(path.join(G, "extract.json"), "utf8"));
const sweep = fs.existsSync(path.join(G, "sweep.json")) ? JSON.parse(fs.readFileSync(path.join(G, "sweep.json"), "utf8")) : [];
const byPage = Object.fromEntries(ex.pages.map((p) => [p.id, p]));
const sw = (slug, mode) => sweep.find((r) => r.slug === slug && r.mode === mode);
const units = ex.meta.aulas;
const chapters = ex.meta.capitulos;
const L = [];
L.push("# Inventário do material e mapa de cobertura da migração\n");
L.push(`Fonte: \`${inv.source}\` (sha256 \`${inv.sha256}\`), extraída em ${inv.extractedAt} a partir do **estado final renderizado** (após as revisões internas v6, v10 e v13 do próprio arquivo). Destino: edição **${inv.edition}** no banco da plataforma.\n`);
L.push("## Resumo\n");
L.push("| Item | Quantidade |\n|---|---|");
L.push(`| Páginas (slides) | ${inv.pages.length} |`);
L.push(`| Capítulos | ${chapters.length} |`);
L.push(`| Unidades (4 aulas + trabalho final) | ${units.length} |`);
L.push(`| Questões com gabarito (alternativa única) | ${inv.pages.reduce((s, p) => s + p.questions.length, 0)} |`);
L.push(`| Widgets de previsão (antes de ver o resultado) | ${inv.pages.reduce((s, p) => s + p.predictions.length, 0)} |`);
L.push(`| Perguntas de checagem (do guia, uma por página) | ${inv.pages.filter((p) => p.hasGuide).length} |`);
L.push(`| Guia do professor (privado) | ${inv.pages.filter((p) => p.hasGuide).length} páginas |`);
L.push(`| Páginas com fórmulas (KaTeX + MathML) | ${inv.pages.filter((p) => p.hasFormula).length} |`);
L.push(`| Gráficos SVG | ${inv.pages.reduce((s, p) => s + p.svgs, 0)} |`);
L.push(`| Tabelas | ${inv.pages.reduce((s, p) => s + p.tables, 0)} |`);
L.push(`| Rubricas extraídas | ${inv.rubrics.length} (${inv.rubrics.map((r) => `${r.slug} de ${r.source}`).join("; ")}) |`);
L.push(`| Bases catalogadas (referenciadas, não fornecidas) | ${inv.datasets.length} |`);
L.push(`| Renderização: nativa / estática / visual legado isolado | ${inv.rendering.native} / ${inv.rendering.static} / ${inv.rendering.legacy} |\n`);
L.push("## Como cada tipo de conteúdo foi migrado\n");
L.push("- **Nativa**: abertura de capítulo (episódio) e síntese de fechamento viraram componentes React com abas acessíveis.");
L.push("- **Estática**: HTML renderizado capturado do estado final, sanitizado (DOMPurify, sem scripts), com fórmulas convertidas em KaTeX/MathML e SVGs preservados.");
L.push("- **Visual legado isolado**: páginas com simuladores (controles deslizantes, iterações, cenários) usam o motor original em iframe `sandbox` com CSP, servido só a matriculados, **sem guia nem gabaritos no código** (verificado por script). Cada uma tem versão estática alternativa. A retirada gradual está descrita em `docs/03-auditoria-tecnica-e-didatica.md`.");
L.push("- **Questões**: extraídas para a tabela de questões versionadas; gabarito, explicações e recuperação ficam apenas no servidor e só saem após a resposta ou liberação.");
L.push("- **Widgets de previsão**: viram questões do tipo `predict`; o conteúdo revelado fica como feedback servido após a resposta (e sincronizado com o visual legado quando existe).");
L.push("- **Pergunta de checagem**: a pergunta e a resposta esperada do guia viraram questão de texto curto por página (resposta esperada exibida após o envio).\n");
L.push("## Lacunas e pendências explícitas\n");
for (const g of inv.gaps) L.push(`- ${g}`);
L.push("- Interações específicas dos simuladores (ex.: descida de gradiente iterativa, escolha de política, memorando do comitê) não são persistidas como respostas do aluno; o professor pode publicar questões equivalentes (decisão de crédito, numérica, texto) na sessão ao vivo.");
L.push("- Arquivos PDF adicionais: nenhum foi anexado a esta sessão.\n");
L.push("## Mapa origem → destino por página\n");
L.push("Legenda de renderização: N = nativa, E = estática, L = visual legado isolado. Q = questões com gabarito; P = previsões; ✔ = verificada no navegador sem erro (desktop, celular e projeção).\n");
for (const u of units) {
  L.push(`### ${u.tipo === "trabalho" ? "Trabalho final" : `Aula ${u.n}`}: ${u.titulo}\n`);
  L.push(`Entrega indicada: ${u.entrega}\n`);
  for (const cn of u.caps) {
    const c = chapters.find((x) => x.n === cn);
    L.push(`**Capítulo ${c.n}: ${c.nome}**\n`);
    L.push("| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |\n|---|---|---|---|---|---|---|---|---|");
    for (const p of inv.pages.filter((x) => x.chapter === cn)) {
      const ok = ["desktop", "mobile", "projecao"].every((m) => { const r = sw(p.slug, m); return r && !r.errors?.length && !r.overflow && !r.rawTex && !(r.frames && r.legacyReady === false); });
      L.push(`| \`#/${p.slug}\` | \`/aulas/${p.slug}\` | ${p.title.replace(/\|/g, "\\|")} | ${p.level} | ${p.minutes} | ${p.rendering[0].toUpperCase()} | ${p.questions.length} | ${p.predictions.length} | ${sweep.length ? (ok ? "✔" : "ver relatório") : "—"} |`);
    }
    L.push("");
  }
}
fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/02-inventario-e-mapa-de-cobertura.md"), L.join("\n"));
console.log("docs/02-inventario-e-mapa-de-cobertura.md gerado");
