/**
 * Etapa C da migração: importa o estado extraído (content/generated/extract.json) para o banco:
 * unidades → capítulos → páginas versionadas (blocos públicos + guia privado), questões versionadas
 * (gabarito privado), rubricas, catálogo de bases, trabalhos/missões e materiais.
 * Também grava content/generated/inventory.json (mapa origem → destino e lacunas).
 *
 * Uso: npm run content:import -- [--edition 2026] [--republish]
 * Idempotente: páginas/questões já importadas recebem nova versão apenas com --republish.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import katex from "katex";
import { and, eq } from "drizzle-orm";
import { db, pool, schema } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";

type Extract = {
  sourceFile: string; sourceSha256: string; extractedAt: string;
  meta: { capitulos: any[]; aulas: any[]; durAula: number; intervalo: number; temas: Record<string, [string, string]>; casos: any[]; ordem: string[] };
  pages: any[]; rubrics: any; errors: string[];
};

const ROOT = path.resolve(__dirname, "..");
const GEN = path.join(ROOT, "content/generated");
const args = process.argv.slice(2);
const editionLabel = args.includes("--edition") ? args[args.indexOf("--edition") + 1] : "2026";
const republish = args.includes("--republish");

const ex: Extract = JSON.parse(fs.readFileSync(path.join(GEN, "extract.json"), "utf8"));
const purify = createDOMPurify(new JSDOM("").window as any);
const SANITIZE = {
  USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
  ADD_ATTR: ["data-latex", "data-block", "data-slug", "data-i", "data-original", "aria-label", "role", "viewBox", "aria-hidden", "scope", "colspan", "rowspan", "data-cap", "data-titulo", "data-pergunta", "data-resposta", "data-detalhe"],
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "style", "link", "meta"],
  FORBID_ATTR: ["onload", "onerror", "onclick", "href"],
};
const sanitize = (html: string) => purify.sanitize(html, SANITIZE) as unknown as string;

/* ---------- fórmulas: KaTeX no servidor, com MathML para leitores de tela ---------- */
function tex(latex: string, display: boolean) {
  try { return katex.renderToString(latex, { displayMode: display, throwOnError: false, output: "htmlAndMathml", strict: "ignore" }); }
  catch { return `<code>${latex}</code>`; }
}
function renderFormulas(doc: Document, root: Element) {
  root.querySelectorAll(".formula[data-latex]").forEach((f: Element) => {
    const l = f.getAttribute("data-latex") ?? "";
    f.innerHTML = tex(l, true);
    f.setAttribute("role", "math");
  });
  const walker = doc.createTreeWalker(root, 4 /* TEXT */);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) { const t = n as Text; if (/\\\(|\\\[/.test(t.data) && !(t.parentElement?.closest(".katex"))) nodes.push(t); }
  for (const t of nodes) {
    const html = t.data
      .replace(/\\\[([\s\S]+?)\\\]/g, (_m, l) => tex(l, true))
      .replace(/\\\(([\s\S]+?)\\\)/g, (_m, l) => tex(l, false));
    const span = doc.createElement("span");
    span.innerHTML = html;
    t.replaceWith(...Array.from(span.childNodes));
  }
}

/* ---------- blocos ---------- */
type Block =
  | { type: "html"; html: string }
  | { type: "question"; slug: string }
  | { type: "episode"; number: number; challenge: string; text: string; steps: { title: string; detail: string }[]; missions?: number }
  | { type: "checkpoint"; count: string; intro: string; items: { title: string; question: string; answer: string }[] }
  | { type: "legacy"; slug: string; controls: number; fallbackHtml: string; note: string };

function buildBlocks(p: any): { blocks: Block[]; classification: string } {
  const dom = new JSDOM(`<!doctype html><body><div id="root">${p.html}</div></body>`);
  const doc = dom.window.document;
  const root = doc.getElementById("root")!;
  const blocks: Block[] = [];

  // episódio de abertura / síntese de fechamento: nativos
  const ep = root.querySelector(".nv-episodio");
  if (ep) {
    const steps = Array.from(ep.querySelectorAll("[data-v13-episodio]")).map((b: Element) => ({ title: b.querySelector("b")?.textContent?.replace(/^\d+\.\s*/, "").trim() ?? "", detail: b.getAttribute("data-detalhe") ?? "" }));
    blocks.push({ type: "episode", number: p.cap, challenge: ep.querySelector("h3")?.textContent?.trim() ?? "", text: ep.querySelector("p")?.textContent?.trim() ?? "", steps, missions: ep.querySelector("[data-tf-missao]") ? 12 : undefined });
    ep.remove();
  }
  const ck = root.querySelector(".nv-checkpoint");
  if (ck) {
    const items = Array.from(ck.querySelectorAll("[data-v13-check]")).map((b: Element) => ({ title: b.getAttribute("data-titulo") ?? "", question: b.getAttribute("data-pergunta") ?? "", answer: b.getAttribute("data-resposta") ?? "" }));
    blocks.push({ type: "checkpoint", count: ck.querySelector(".big")?.textContent?.trim() ?? String(items.length), intro: ck.querySelector(".nv-checkpoint-side p")?.textContent?.trim() ?? "", items });
    ck.remove();
  }

  renderFormulas(doc, root);
  const remainingControls = root.querySelectorAll("input,select,button,textarea").length;
  const questionSlugs = Array.from(root.querySelectorAll("[data-block=question]")).map((e: Element) => e.getAttribute("data-slug")!);

  if (remainingControls > 0) {
    // simulador interativo: iframe isolado + fallback estático acessível
    root.querySelectorAll("[data-block=question]").forEach((e: Element) => e.remove());
    root.querySelectorAll("button").forEach((b: Element) => { const s = doc.createElement("span"); s.className = "btn-static"; s.textContent = b.textContent ?? ""; b.replaceWith(s); });
    root.querySelectorAll("input,select,textarea").forEach((e: Element) => e.remove());
    const fallback = sanitize(root.innerHTML);
    blocks.push({ type: "legacy", slug: p.id, controls: remainingControls, fallbackHtml: fallback, note: "Visual interativo renderizado pelo motor original em iframe isolado; versão estática disponível para leitura." });
    for (const s of questionSlugs) blocks.push({ type: "question", slug: s });
    return { blocks, classification: "legacy" };
  }

  // estático: segmenta o HTML nas posições das questões
  const html = root.innerHTML;
  const parts = html.split(/(<div data-block="question" data-slug="[^"]+"><\/div>)/);
  for (const part of parts) {
    const m = part.match(/^<div data-block="question" data-slug="([^"]+)"><\/div>$/);
    if (m) blocks.push({ type: "question", slug: m[1] });
    else if (part.trim()) blocks.push({ type: "html", html: sanitize(part) });
  }
  return { blocks, classification: ep || ck ? "native" : "static" };
}

/* ---------- questões ---------- */
function questionRecords(p: any) {
  const out: { slug: string; kind: string; label: string | null; prompt: string; options: unknown; answerKey: unknown; feedback: unknown }[] = [];
  for (const q of p.questoes) {
    const perAlt = (q.erros ?? []).map((e: any) => e ? ({
      confusion: e.confusao ?? null, concept: e.conceito ?? null, exampleHtml: e.exemplo ? sanitize(renderHtmlString(e.exemplo)) : null,
      yours: e.seu ?? null, adequate: e.adequado ?? null,
      followUp: e.novaQuestao ? { prompt: e.novaQuestao.pergunta, alternatives: e.novaQuestao.alt, correct: e.novaQuestao.certa, explanation: e.novaQuestao.porqueCerta ?? null } : null,
    }) : null);
    out.push({ slug: q.slug, kind: "single", label: q.rot ?? null, prompt: q.pergunta, options: { alternatives: q.alt, source: "original" },
      answerKey: { correct: q.certa, explanation: q.porqueCerta ?? null, perAlternative: perAlt }, feedback: null });
  }
  for (const pv of p.prever) {
    out.push({ slug: pv.slug, kind: "predict", label: "Antes de ver o resultado", prompt: pv.pergunta, options: { alternatives: pv.opcoes, source: "original" },
      answerKey: null, feedback: { revealHtml: pv.revealHtml ? sanitize(renderHtmlString(pv.revealHtml)) : null } });
  }
  if (p.guia?.pergunta && p.guia?.resposta) {
    out.push({ slug: `${p.id}-checagem`, kind: "short_text", label: "Pergunta de checagem", prompt: p.guia.pergunta, options: { source: "guia", maxLength: 600 },
      answerKey: null, feedback: { modelAnswer: p.guia.resposta } });
  }
  return out;
}
function renderHtmlString(html: string) {
  const dom = new JSDOM(`<!doctype html><body><div id="r">${html}</div></body>`);
  const root = dom.window.document.getElementById("r")!;
  renderFormulas(dom.window.document, root);
  return root.innerHTML;
}

/* ---------- importação ---------- */
async function main() {
  const [edition] = await db.select().from(schema.editions).where(eq(schema.editions.label, editionLabel));
  if (!edition) throw new Error(`Edição ${editionLabel} não existe. Rode o seed ou crie pela interface.`);
  const inventory: any = { source: ex.sourceFile, sha256: ex.sourceSha256, extractedAt: ex.extractedAt, edition: edition.label, units: [], pages: [], questions: 0, rubrics: [], datasets: [], gaps: [] };

  // unidades (aulas + trabalho final)
  const unitIds = new Map<number, string>();
  for (const a of ex.meta.aulas) {
    const kind = a.tipo === "trabalho" ? "trabalho" : "aula";
    let [u] = await db.select().from(schema.units).where(and(eq(schema.units.editionId, edition.id), eq(schema.units.kind, kind), eq(schema.units.number, a.n)));
    if (!u) [u] = await db.insert(schema.units).values({ id: newId(), editionId: edition.id, kind, number: a.n, title: a.titulo, deliverable: a.entrega, plannedMinutes: ex.meta.durAula, breakMinutes: ex.meta.intervalo, position: a.n, status: "published" }).returning();
    for (const c of a.caps) unitIds.set(c, u.id);
    inventory.units.push({ id: u.id, kind, number: a.n, title: a.titulo, chapters: a.caps });
  }
  // capítulos
  const chapterIds = new Map<number, string>();
  for (const c of ex.meta.capitulos) {
    const unitId = unitIds.get(c.n)!;
    let [ch] = await db.select().from(schema.chapters).where(and(eq(schema.chapters.unitId, unitId), eq(schema.chapters.slug, c.id)));
    const tema = ex.meta.temas[String(c.n)] ?? [null, null];
    if (!ch) [ch] = await db.insert(schema.chapters).values({ id: newId(), unitId, number: c.n, slug: c.id, title: c.nome, centralQuestion: c.pergunta, prerequisites: c.prereq, learn: c.aprende, motivation: c.motiva, activity: c.atividade, uses: c.usa, themeColor: tema[0], themeSoft: tema[1], position: c.n }).returning();
    chapterIds.set(c.n, ch.id);
  }
  // páginas + versões + questões
  let qCount = 0;
  const stats = { legacy: 0, static: 0, native: 0 };
  for (let i = 0; i < ex.pages.length; i++) {
    const p = ex.pages[i];
    const chapterId = chapterIds.get(p.cap)!;
    let [pg] = await db.select().from(schema.pages).where(and(eq(schema.pages.chapterId, chapterId), eq(schema.pages.slug, p.id)));
    if (!pg) [pg] = await db.insert(schema.pages).values({ id: newId(), chapterId, slug: p.id, number: p.n, position: i, level: p.nivel, level120: p.nivel120, minutes: p.min, origin: p.origem, status: "published" }).returning();
    const { blocks, classification } = buildBlocks(p);
    stats[classification as keyof typeof stats]++;
    if (!pg.publishedVersionId || republish) {
      const existing = await db.select({ v: schema.pageVersions.versionNo }).from(schema.pageVersions).where(eq(schema.pageVersions.pageId, pg.id));
      const versionNo = existing.length ? Math.max(...existing.map((e) => e.v)) + 1 : 1;
      const vid = newId();
      await db.insert(schema.pageVersions).values({
        id: vid, pageId: pg.id, versionNo, title: p.titulo, objective: p.aprendizado, support: p.apoio, connection: p.conexao, timeBudget: p.t,
        blocks, teacherGuide: p.guia, changeNote: versionNo === 1 ? `Migração do HTML original (sha256 ${ex.sourceSha256.slice(0, 12)})` : "Reimportação", publishedAt: new Date(),
      });
      await db.update(schema.pages).set({ publishedVersionId: vid, updatedAt: new Date(), level: p.nivel, level120: p.nivel120, minutes: p.min, origin: p.origem, position: i }).where(eq(schema.pages.id, pg.id));
    }
    for (const q of questionRecords(p)) {
      let [qq] = await db.select().from(schema.questions).where(and(eq(schema.questions.editionId, edition.id), eq(schema.questions.slug, q.slug)));
      if (!qq) [qq] = await db.insert(schema.questions).values({ id: newId(), editionId: edition.id, pageId: pg.id, slug: q.slug, kind: q.kind }).returning();
      if (!qq.currentVersionId || republish) {
        const existing = await db.select({ v: schema.questionVersions.versionNo }).from(schema.questionVersions).where(eq(schema.questionVersions.questionId, qq.id));
        const versionNo = existing.length ? Math.max(...existing.map((e) => e.v)) + 1 : 1;
        const vid = newId();
        await db.insert(schema.questionVersions).values({ id: vid, questionId: qq.id, versionNo, label: q.label, prompt: q.prompt, options: q.options, answerKey: q.answerKey, feedback: q.feedback });
        await db.update(schema.questions).set({ currentVersionId: vid }).where(eq(schema.questions.id, qq.id));
      }
      qCount++;
    }
    inventory.pages.push({ source: `#/${p.id}`, slug: p.id, pageId: pg.id, chapter: p.cap, unit: ex.meta.aulas.find((a: any) => a.caps.includes(p.cap))?.n, title: p.titulo, level: p.nivel, minutes: p.min, origin: p.origem,
      rendering: classification, controls: p.controls.length, svgs: p.svgs, tables: p.tables, questions: p.questoes.map((q: any) => q.slug), predictions: p.prever.map((x: any) => x.slug), hasGuide: Boolean(p.guia), hasFormula: p.hasFormula });
    process.stdout.write(`\r${i + 1}/${ex.pages.length} ${p.id} (${classification})      `);
  }
  console.log();
  inventory.questions = qCount;
  inventory.rendering = stats;

  // rubricas
  const rubricDefs = [
    { slug: "comite", name: "Rubrica do comitê (laboratório integrado)", def: {
      scale: [0, 1, 2, 3], maxScore: 15, rounding: { decimals: 1 }, cutoffRule: ex.rubrics.comite?.regraTexto || "Zero em qualquer uma das cinco dimensões reprova o memorando inteiro.",
      criteria: (ex.rubrics.comite?.rows ?? []).map((r: string[], i: number) => ({ key: `d${i + 1}`, name: r[0], weight: 1, levels: [0, 1, 2, 3].map((s) => ({ score: s, label: String(s), description: r[s + 1] })) })),
      source: "c10p10" } },
    { slug: "trabalho-final", name: "Avaliação final do trabalho (quatro perguntas)", def: {
      scale: [0, 1, 2], maxScore: 8, rounding: { decimals: 0 }, cutoffRule: null, source: "c11p18",
      levelsLegend: "0 não demonstrou · 1 parcial · 2 completo e sustentado por evidência",
      criteria: [
        { key: "problema_dados", name: "Problema e dados", weight: 1, question: "A pergunta está clara e os dados usados existiam na data da decisão?" },
        { key: "modelo_testes", name: "Modelo e testes", weight: 1, question: "O grupo comparou os modelos corretamente e preservou o teste OOT?" },
        { key: "uso_responsavel", name: "Uso responsável (governança, na prática)", weight: 1, question: "O grupo explicou quando usar o modelo, como acompanhá-lo e quem age se algo sair do esperado?" },
        { key: "reproducao_defesa", name: "Reprodução e defesa", weight: 1, question: "Outra pessoa consegue executar o projeto e o aluno explica as decisões que tomou?" },
      ].map((c) => ({ ...c, levels: [{ score: 0, label: "0", description: "não demonstrou" }, { score: 1, label: "1", description: "parcial" }, { score: 2, label: "2", description: "completo e sustentado por evidência" }] })),
      individualQuestion: "Mostre uma decisão que foi sua, a evidência que a sustentou e uma resposta da IA que você recusou ou corrigiu." } },
  ];
  const rubricVersionBySlug = new Map<string, string>();
  for (const r of rubricDefs) {
    let [rb] = await db.select().from(schema.rubrics).where(and(eq(schema.rubrics.editionId, edition.id), eq(schema.rubrics.slug, r.slug)));
    if (!rb) [rb] = await db.insert(schema.rubrics).values({ id: newId(), editionId: edition.id, slug: r.slug, name: r.name }).returning();
    if (!rb.currentVersionId) {
      const vid = newId();
      await db.insert(schema.rubricVersions).values({ id: vid, rubricId: rb.id, versionNo: 1, definition: r.def, changeNote: `Extraída da página ${r.def.source}` });
      await db.update(schema.rubrics).set({ currentVersionId: vid }).where(eq(schema.rubrics.id, rb.id));
      rb.currentVersionId = vid;
    }
    rubricVersionBySlug.set(r.slug, rb.currentVersionId!);
    inventory.rubrics.push({ slug: r.slug, criteria: r.def.criteria.length, source: r.def.source });
  }

  // catálogo de bases (referenciadas, não fornecidas)
  for (const c of ex.meta.casos) {
    const code = c.arquivo.replace(".zip", "");
    const [d] = await db.select().from(schema.datasets).where(and(eq(schema.datasets.editionId, edition.id), eq(schema.datasets.code, code)));
    if (!d) await db.insert(schema.datasets).values({ id: newId(), editionId: edition.id, code, name: c.nome, product: c.nome, population: c.pop, emphasis: c.enfase, status: "pendente", notes: `Referenciada no material como aluno/casos/${c.arquivo}. Arquivo não fornecido: cadastrar pelo painel.` });
    inventory.datasets.push({ code, name: c.nome, status: "pendente", referencedAs: `aluno/casos/${c.arquivo}` });
  }
  inventory.gaps.push("Bases dos 10 casos (aluno/casos/*.zip) referenciadas e não fornecidas: catálogo criado com status pendente.");
  inventory.gaps.push("Pacote do trabalho final (README.md, guia de dados, propostas_desenvolvimento.csv, propostas_oot_sem_desfecho.csv, dicionario_dados.csv, TEMPLATE-MANIFESTO-MODELO.md, ROTEIRO-DE-TESTES.md, notebook-guiado.ipynb) referenciado e não fornecido.");
  inventory.gaps.push("Rótulos verdadeiros do OOT (teste cego) não fornecidos: o teste cego fica configurável e inativo até o upload pelo professor.");

  // trabalhos e missões para turmas da edição que ainda não os têm
  const classes = await db.select().from(schema.classes).where(eq(schema.classes.editionId, edition.id));
  const missionTitles: Record<string, string> = {};
  for (const p of ex.pages) if (p.cap === 11 && /^Missão \d+/.test(p.titulo)) missionTitles[p.id] = p.titulo;
  for (const cls of classes) {
    const existing = await db.select({ id: schema.assignments.id }).from(schema.assignments).where(eq(schema.assignments.classId, cls.id));
    if (existing.length) continue;
    let pos = 0;
    for (const a of ex.meta.aulas) {
      const unitId = unitIds.get(a.caps[0])!;
      const isFinal = a.tipo === "trabalho";
      const slug = isFinal ? "trabalho-final" : `entrega-aula-${a.n}`;
      const aid = newId();
      await db.insert(schema.assignments).values({
        id: aid, classId: cls.id, unitId, slug, title: isFinal ? "Trabalho final: construir, testar e defender o modelo de PD" : `Entrega da aula ${a.n}: ${a.entrega}`,
        description: isFinal
          ? "Dossiê final, código reproduzível, teste OOT cego e defesa individual. As doze missões abaixo organizam o percurso; nem toda missão tem entrega ou nota separada."
          : `${a.entrega}. Entrega indicada no material da aula ${a.n} (${a.titulo}). Formato, prazo e rubrica são definidos pelo professor antes da publicação.`,
        objectives: isFinal ? ex.meta.capitulos.find((c: any) => c.n === 11)?.aprende : ex.meta.capitulos.filter((c: any) => a.caps.includes(c.n)).map((c: any) => c.aprende).join(" "),
        prerequisites: isFinal ? ex.meta.capitulos.find((c: any) => c.n === 11)?.prereq : null,
        deliverables: isFinal ? ["Dossiê final (PDF)", "Código reproduzível (ZIP)", "Manifesto do modelo congelado", "Previsões OOT (CSV com proposta_id, pd_modelo, decisao_politica, versao_modelo)"] : [a.entrega],
        mode: "grupo", status: "draft", position: pos++, blindTestEnabled: isFinal,
        rubricVersionId: isFinal ? rubricVersionBySlug.get("trabalho-final") ?? null : a.n === 4 ? rubricVersionBySlug.get("comite") ?? null : null,
      });
      if (isFinal) {
        const byMission = new Map<number, { title: string; pages: string[]; outputs: string[]; desc: string[] }>();
        for (const [slug, title] of Object.entries(missionTitles)) {
          const m = Number(title.match(/^Missão (\d+)/)![1]);
          const p = ex.pages.find((x: any) => x.id === slug);
          const cur = byMission.get(m) ?? { title: title.replace(/^Missão \d+ · /, ""), pages: [], outputs: [], desc: [] };
          cur.pages.push(slug);
          if (p?.guia?.saida) cur.outputs.push(p.guia.saida);
          if (p?.aprendizado) cur.desc.push(p.aprendizado);
          byMission.set(m, cur);
        }
        for (const [m, v] of [...byMission.entries()].sort((a, b) => a[0] - b[0])) {
          await db.insert(schema.assignmentSteps).values({ id: newId(), assignmentId: aid, number: m, title: v.title, description: v.desc.join(" "), pageSlug: v.pages[0], expectedOutputs: v.outputs, requiresDelivery: m === 12, position: m });
        }
      }
    }
  }

  // materiais: bibliografia de apoio (obras verificadas pelo professor antes da publicação)
  const refs = [
    { title: "Siddiqi, N. Intelligent Credit Scoring: Building and Implementing Better Credit Risk Scorecards. 2. ed. Wiley, 2017.", kind: "referencia", description: "Construção de scorecards, WoE/IV, segmentação e implantação." },
    { title: "Thomas, L. C.; Crook, J. N.; Edelman, D. B. Credit Scoring and Its Applications. 2. ed. SIAM, 2017.", kind: "referencia", description: "Fundamentos estatísticos de credit scoring, validação e decisão." },
    { title: "Hastie, T.; Tibshirani, R.; Friedman, J. The Elements of Statistical Learning. 2. ed. Springer, 2009.", kind: "referencia", description: "Árvores, boosting e viés-variância (capítulos 9 e 10)." },
    { title: "Friedman, J. H. Greedy Function Approximation: A Gradient Boosting Machine. Annals of Statistics, 29(5), 2001.", kind: "referencia", description: "Formulação original do gradient boosting (capítulo 6)." },
    { title: "DeLong, E. R.; DeLong, D. M.; Clarke-Pearson, D. L. Comparing the Areas under Two or More Correlated ROC Curves. Biometrics, 44(3), 1988.", kind: "referencia", description: "Teste de comparação de AUCs na mesma amostra (capítulo 7)." },
    { title: "Platt, J. Probabilistic Outputs for Support Vector Machines and Comparisons to Regularized Likelihood Methods. In: Advances in Large Margin Classifiers, MIT Press, 1999.", kind: "referencia", description: "Recalibração por escala de Platt (capítulo 7)." },
    { title: "Basel Committee on Banking Supervision. Basel III: Finalising post-crisis reforms. BIS, dezembro de 2017.", kind: "referencia", description: "Parâmetros PD, LGD e EAD na abordagem IRB (capítulo 8). Verificar vigência e documentos complementares." },
    { title: "Conselho Monetário Nacional. Resolução CMN nº 4.966, de 25 de novembro de 2021.", kind: "referencia", description: "Perda esperada e provisão para instrumentos financeiros no Brasil (capítulos 8 e 9). Verificar alterações posteriores e vigência." },
  ];
  const existingMats = await db.select({ title: schema.materials.title }).from(schema.materials).where(eq(schema.materials.editionId, edition.id));
  const have = new Set(existingMats.map((m) => m.title));
  let mpos = 0;
  for (const r of refs) if (!have.has(r.title)) await db.insert(schema.materials).values({ id: newId(), editionId: edition.id, title: r.title, kind: r.kind, description: r.description, citation: r.title, status: "published", position: mpos++ });

  await db.insert(schema.contentImports).values({ id: newId(), editionId: edition.id, sourceFile: ex.sourceFile, sourceSha256: ex.sourceSha256, summary: { pages: ex.pages.length, questions: qCount, rendering: stats, republish } });
  fs.writeFileSync(path.join(GEN, "inventory.json"), JSON.stringify(inventory, null, 1));
  console.log(`importação concluída: ${ex.pages.length} páginas (${JSON.stringify(stats)}), ${qCount} questões, ${rubricDefs.length} rubricas, ${ex.meta.casos.length} bases pendentes`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
