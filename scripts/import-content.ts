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
/* Perguntas escritas para páginas essenciais que só tinham a pergunta aberta de checagem: sem uma
   pergunta com gabarito, o aluno responde e não recebe veredito nenhum, e o acompanhamento não
   registra acerto. O formato é o mesmo das que vêm do material original, inclusive o diagnóstico
   por alternativa errada, e o importador as trata do mesmo jeito. */
const CURADAS: Record<string, any[]> = (() => {
  const arquivo = path.join(process.cwd(), "content", "questoes-curadas.json");
  if (!fs.existsSync(arquivo)) return {};
  const bruto = JSON.parse(fs.readFileSync(arquivo, "utf8")) as { questoes?: any[] };
  const por: Record<string, any[]> = {};
  for (const q of bruto.questoes ?? []) (por[q.pagina] ??= []).push(q);
  return por;
})();

function questionRecords(p: any) {
  const out: { slug: string; kind: string; label: string | null; prompt: string; options: unknown; answerKey: unknown; feedback: unknown }[] = [];
  for (const q of [...p.questoes, ...(CURADAS[p.id] ?? [])]) {
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

  /* Arranjo da edição. `extract.json` é a extração fiel do original e não é editada; o rearranjo,
     quando existe, fica declarado aqui. Hoje não há nenhum: cada aula fica com os capítulos que o
     material original lhe dá, e a Aula 2 com os capítulos 4, 5 e 6, as três técnicas.

     Houve uma etapa em que esses três capítulos formavam um apêndice à parte, porque a Aula 2 era
     conduzida pelos 50 slides e não tinha capítulo nenhum. O baralho continua sendo como a aula é
     apresentada, mas o conteúdo dela são os capítulos, como nas outras aulas; o bloco mais abaixo
     desfaz o apêndice em edições que já foram importadas com ele. */
  type Unidade = { kind: string; n: number; titulo: string; entrega: string | null; caps: number[]; position: number };
  const unidades: Unidade[] = ex.meta.aulas.map((a: any) => ({
    kind: a.tipo === "trabalho" ? "trabalho" : "aula", n: a.n, titulo: a.titulo, entrega: a.entrega,
    caps: a.caps as number[], position: a.n,
  }));
  unidades.sort((x, y) => x.n - y.n);
  unidades.forEach((u, i) => { u.position = i + 1; });

  const unitIds = new Map<number, string>();
  const unidadePorChave = new Map<string, string>();
  for (const a of unidades) {
    let [u] = await db.select().from(schema.units).where(and(eq(schema.units.editionId, edition.id), eq(schema.units.kind, a.kind), eq(schema.units.number, a.n)));
    if (!u) [u] = await db.insert(schema.units).values({ id: newId(), editionId: edition.id, kind: a.kind, number: a.n, title: a.titulo, deliverable: a.entrega, plannedMinutes: ex.meta.durAula, breakMinutes: ex.meta.intervalo, position: a.position, status: "published" }).returning();
    else if (u.position !== a.position) {
      [u] = await db.update(schema.units).set({ position: a.position }).where(eq(schema.units.id, u.id)).returning();
      console.log(`unidade ${a.kind} ${a.n} reposicionada para ${a.position}`);
    }
    for (const c of a.caps) unitIds.set(c, u.id);
    unidadePorChave.set(`${a.kind}:${a.n}`, u.id);
    inventory.units.push({ id: u.id, kind: a.kind, number: a.n, title: a.titulo, chapters: a.caps });
  }
  // capítulos. A busca é pelo slug em toda a edição, não dentro da unidade: quando o arranjo muda,
  // o capítulo existente é movido de unidade em vez de duplicado.
  const chapterIds = new Map<number, string>();
  for (const c of ex.meta.capitulos) {
    const unitId = unitIds.get(c.n)!;
    const tema = ex.meta.temas[String(c.n)] ?? [null, null];
    const [achado] = await db.select({ ch: schema.chapters }).from(schema.chapters)
      .innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId))
      .where(and(eq(schema.units.editionId, edition.id), eq(schema.chapters.slug, c.id)));
    let ch = achado?.ch;
    if (!ch) [ch] = await db.insert(schema.chapters).values({ id: newId(), unitId, number: c.n, slug: c.id, title: c.nome, centralQuestion: c.pergunta, prerequisites: c.prereq, learn: c.aprende, motivation: c.motiva, activity: c.atividade, uses: c.usa, themeColor: tema[0], themeSoft: tema[1], position: c.n }).returning();
    else if (ch.unitId !== unitId) {
      [ch] = await db.update(schema.chapters).set({ unitId }).where(eq(schema.chapters.id, ch.id)).returning();
      console.log(`capítulo ${c.id} movido para a unidade ${unitId}`);
    }
    chapterIds.set(c.n, ch.id);
  }
  /* Desfaz o apêndice de edições importadas antes deste arranjo. Os capítulos já voltaram para a
     aula no laço acima; aqui sobram a unidade vazia e o que ainda aponta para ela. Só remove
     unidade de apêndice que ficou sem capítulo nenhum, e só depois de repontar o que a referencia. */
  const apendices = await db.select().from(schema.units).where(and(eq(schema.units.editionId, edition.id), eq(schema.units.kind, "apendice")));
  for (const ap of apendices) {
    const sobraram = await db.select({ id: schema.chapters.id }).from(schema.chapters).where(eq(schema.chapters.unitId, ap.id));
    const destino = unidadePorChave.get("aula:2");
    if (sobraram.length || !destino) {
      console.log(`apêndice ${ap.number} mantido: ${sobraram.length} capítulo(s) ainda nele${destino ? "" : ", e sem aula de destino"}`);
      continue;
    }
    const t1 = await db.update(schema.assignments).set({ unitId: destino }).where(eq(schema.assignments.unitId, ap.id)).returning({ id: schema.assignments.id });
    const t2 = await db.update(schema.materials).set({ unitId: destino }).where(eq(schema.materials.unitId, ap.id)).returning({ id: schema.materials.id });
    const t3 = await db.update(schema.meetings).set({ unitId: destino }).where(eq(schema.meetings.unitId, ap.id)).returning({ id: schema.meetings.id });
    await db.delete(schema.units).where(eq(schema.units.id, ap.id));
    console.log(`apêndice removido: ${t1.length} trabalho(s), ${t2.length} material(is) e ${t3.length} encontro(s) voltaram para a Aula 2`);
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

  // Correções de conteúdo versionadas: aplicadas a bancos já importados (nova versão da questão, idempotente por conteúdo)
  await applyContentPatches(edition.id);

  // rubricas
  const rubricDefs = [
    { slug: "comite", name: "Rubrica do comitê (laboratório integrado)", def: {
      scale: [0, 1, 2, 3], maxScore: 15, rounding: { decimals: 1 }, cutoffRule: ex.rubrics.comite?.regraTexto || "Zero em qualquer uma das cinco dimensões reprova o memorando inteiro.",
      criteria: (ex.rubrics.comite?.rows ?? []).map((r: string[], i: number) => ({ key: `d${i + 1}`, name: r[0], weight: 1, levels: [0, 1, 2, 3].map((s) => ({ score: s, label: String(s), description: r[s + 1] })) })),
      source: "c10p10" } },
    { slug: "trabalho-final", name: "Avaliação final do trabalho (modelo e blueprint)", def: RUBRICA_TRABALHO_FINAL_V2 },
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
        id: aid, classId: cls.id, unitId, slug, title: isFinal ? TRABALHO_FINAL.title : `Entrega da aula ${a.n}: ${a.entrega}`,
        description: isFinal ? TRABALHO_FINAL.description : `${a.entrega}. Entrega indicada no material da aula ${a.n} (${a.titulo}). Formato, prazo e rubrica são definidos pelo professor antes da publicação.`,
        objectives: isFinal ? ex.meta.capitulos.find((c: any) => c.n === 11)?.aprende : ex.meta.capitulos.filter((c: any) => a.caps.includes(c.n)).map((c: any) => c.aprende).join(" "),
        prerequisites: isFinal ? ex.meta.capitulos.find((c: any) => c.n === 11)?.prereq : null,
        deliverables: isFinal ? TRABALHO_FINAL.deliverables : [a.entrega],
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
        for (const st of ETAPAS_BLUEPRINT) await db.insert(schema.assignmentSteps).values({ id: newId(), assignmentId: aid, ...st });
      }
    }
  }

  // materiais: bibliografia de apoio (obras verificadas pelo professor antes da publicação)
  /* `url` aponta para uma rota da própria plataforma; `citation` fica só nas referências bibliográficas.
     O título nomeia os capítulos porque `materiaisDoCapitulo` casa o material ao capítulo pelo título. */
  const refs: { title: string; kind: string; description: string; url?: string; unitId?: string; status?: string }[] = [
    { title: "Aula 2 em 50 slides: logit, árvore e boosting", kind: "aula",
      description: "A apresentação da Aula 2: os capítulos 4, 5 e 6 percorridos em 50 slides interativos, com abertura no problema de crédito e fechamento em avaliação e decisão. Abre no navegador, funciona sem rede e traz as notas de condução do professor e o modo de impressão. O conteúdo da aula continua sendo o dos capítulos, página a página; o aluno recebe a versão de estudo do baralho, sem as notas de condução.",
      url: "/slides/aula-2", unitId: unidadePorChave.get("aula:2") },
    { title: "Aula 2: guia do aluno (PDF)", kind: "arquivo",
      description: "Uma página por slide, na ordem da aula: a captura do slide, como ler o que está nele, o que mexer na tela, as fórmulas na notação dos slides e os exercícios sem gabarito, para resolver no papel e conferir na tela. Fecha com a lista de verificação de saída e o glossário.",
      url: "/api/materiais/aula-2/guia-do-aluno.pdf", unitId: unidadePorChave.get("aula:2") },
    { title: "Aula 2: guia do professor (PDF)", kind: "arquivo",
      description: "Condução, respostas esperadas, cuidados, aprofundamentos e transição de cada slide, com a captura no estado revelado, o ritmo proposto por bloco, a comparação dos três modelos no teste e os sinais para observar na turma. Contém gabaritos: não distribuir aos alunos.",
      url: "/api/materiais/aula-2/guia-do-professor.pdf", unitId: unidadePorChave.get("aula:2"), status: "professor" },
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
  for (const r of refs) {
    if (!have.has(r.title)) { await db.insert(schema.materials).values({ id: newId(), editionId: edition.id, title: r.title, kind: r.kind, description: r.description, url: r.url ?? null, unitId: r.unitId ?? null, citation: r.url ? null : r.title, status: r.status ?? "published", position: mpos++ }); continue; }
    // material já cadastrado: o repositório é a fonte do endereço, do tipo, da unidade e da descrição, e uma edição deles precisa chegar aos bancos já importados
    if (r.url) await db.update(schema.materials).set({ description: r.description, url: r.url, kind: r.kind, unitId: r.unitId ?? null, status: r.status ?? "published" }).where(and(eq(schema.materials.editionId, edition.id), eq(schema.materials.title, r.title)));
  }

  await db.insert(schema.contentImports).values({ id: newId(), editionId: edition.id, sourceFile: ex.sourceFile, sourceSha256: ex.sourceSha256, summary: { pages: ex.pages.length, questions: qCount, rendering: stats, republish } });
  fs.writeFileSync(path.join(GEN, "inventory.json"), JSON.stringify(inventory, null, 1));
  const catalogo = await db.select({ status: schema.datasets.status }).from(schema.datasets).where(eq(schema.datasets.editionId, edition.id));
  const pend = catalogo.filter((d) => d.status === "pendente").length;
  console.log(`importação concluída: ${ex.pages.length} páginas (${JSON.stringify(stats)}), ${qCount} questões, ${rubricDefs.length} rubricas, ${catalogo.length} bases no catálogo (${catalogo.length - pend} disponíveis, ${pend} pendentes)`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Patches de conteúdo. Cada um verifica se a versão corrente ainda tem o defeito e, se tiver, cria uma
 * nova versão da questão (respostas antigas continuam ligadas à versão anterior). Idempotente.
 */
async function applyContentPatches(editionId: string) {
  await patchCapitulo11(editionId);
  await patchTrabalhoFinal(editionId);
  // P1 (auditoria de 17/09/2026, achado F03): pergunta de retomada de c3p7q com gabarito incoerente.
  // Com latência de 45 dias e decisão em 10 de agosto, junho (fecha 30/06, disponível 14/08) não estaria disponível;
  // a decisão passa a 20 de agosto para que "junho" seja de fato o mês mais recente utilizável.
  const [q] = await db.select().from(schema.questions).where(and(eq(schema.questions.editionId, editionId), eq(schema.questions.slug, "c3p7q")));
  if (!q?.currentVersionId) return;
  const [v] = await db.select().from(schema.questionVersions).where(eq(schema.questionVersions.id, q.currentVersionId));
  const key = v?.answerKey as { perAlternative?: ({ followUp?: { prompt: string; explanation?: string | null } | null } | null)[] } | null;
  const fu = key?.perAlternative?.[0]?.followUp;
  if (!fu || !fu.prompt.includes("A decisão é de 10 de agosto")) return;
  const fixed = JSON.parse(JSON.stringify(key));
  fixed.perAlternative[0].followUp.prompt = fu.prompt.replace("A decisão é de 10 de agosto", "A decisão é de 20 de agosto");
  fixed.perAlternative[0].followUp.explanation = "Com 45 dias de latência, o fechamento de julho (31 de julho) só estaria disponível em meados de setembro. Junho fecha em 30 de junho e fica disponível em 14 de agosto, antes da decisão de 20 de agosto; por isso junho é o mês mais recente utilizável.";
  const existing = await db.select({ v: schema.questionVersions.versionNo }).from(schema.questionVersions).where(eq(schema.questionVersions.questionId, q.id));
  const versionNo = Math.max(...existing.map((e) => e.v)) + 1;
  const vid = newId();
  await db.insert(schema.questionVersions).values({ id: vid, questionId: q.id, versionNo, label: v.label, prompt: v.prompt, options: v.options, answerKey: fixed, feedback: v.feedback });
  await db.update(schema.questions).set({ currentVersionId: vid }).where(eq(schema.questions.id, q.id));
  console.log(`patch c3p7q: nova versão ${versionNo} (decisão em 20 de agosto)`);
}

/**
 * P1 (bases do trabalho final, 17/09/2026): o capítulo 11 descrevia o pacote antigo (60.000 propostas, OOT de 9.000 IDs,
 * baseline 6,655%). Com 15 bases de cerca de 1 milhão de propostas e OOT de 100.000 IDs, os números fixos viram
 * referências à base do grupo. Cria nova versão publicada das páginas afetadas quando a versão corrente ainda tem o texto antigo.
 */
const PATCH_C11: Record<string, [string, string][]> = {
 "c11p1": [
  [
   "60.000 propostas",
   "1 milhão de propostas"
  ]
 ],
 "c11p2": [
  [
   "<span class=\"big\">51.000</span><small>treino + validação · rótulo somente nas aprovadas</small>",
   "<span class=\"big\">≈ 900 mil</span><small>treino + validação (jan/21 a dez/23) · rótulo somente nas aprovadas</small>"
  ],
  [
   "<span class=\"big\">8.420</span><small>5.930 propostas aprovadas com rótulo</small>",
   "<span class=\"big\">jul–dez/23</span><small>cerca de 150 mil propostas; as aprovadas com rótulo você conta na sua base</small>"
  ],
  [
   "<span class=\"big\">9.000</span><small>jan–jun/24 · nenhum desfecho no pacote do aluno</small>",
   "<span class=\"big\">100.000</span><small>jan–jun/24 · nenhum desfecho no pacote do aluno</small>"
  ]
 ],
 "c11p7": [
  [
   "<small>42.580 propostas</small><small>30.938 aprovadas com rótulo</small>",
   "<small>cerca de 750 mil propostas</small><small>aprovadas com rótulo: contar na sua base</small>"
  ],
  [
   "<small>8.420 propostas</small><small>5.930 aprovadas com rótulo</small>",
   "<small>cerca de 150 mil propostas</small><small>aprovadas com rótulo: contar na sua base</small>"
  ],
  [
   "<small>9.000 IDs, sem desfecho</small>",
   "<small>100.000 IDs, sem desfecho</small>"
  ]
 ],
 "c11p8": [
  [
   "<small>baseline aprendido no treino</small><span class=\"big\">6,655%</span><p>a mesma PD para toda proposta</p>",
   "<small>baseline aprendido no treino</small><span class=\"big\">p̂₀ da sua base</span><p>a mesma PD para toda proposta: defaults sobre aprovadas com rótulo no treino (o exemplo abaixo é do Banco Aurora)</p>"
  ]
 ],
 "c11p9": [
  [
   "exatamente os mesmos 5.930 casos aprovados da validação",
   "exatamente os mesmos casos aprovados com rótulo da validação (o número é o da sua base)"
  ]
 ],
 "c11p17": [
  [
   "Exatamente 9.000 IDs; nenhuma volta para melhorar.",
   "Exatamente 100.000 IDs; nenhuma volta para melhorar."
  ]
 ]
};
async function patchCapitulo11(editionId: string) {
  // atividade central do capítulo: "base de 60.000 propostas" vira a base do grupo
  const caps = await db.select({ id: schema.chapters.id, activity: schema.chapters.activity }).from(schema.chapters)
    .innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId)).where(and(eq(schema.units.editionId, editionId), eq(schema.chapters.slug, "c11")));
  for (const c of caps) if (c.activity?.includes("uma base de 60.000 propostas")) {
    await db.update(schema.chapters).set({ activity: c.activity.replace("sobre uma base de 60.000 propostas, com teste", "sobre a base do grupo, com cerca de 1 milhão de propostas e teste") }).where(eq(schema.chapters.id, c.id));
    console.log("patch c11: atividade central com a base do grupo");
  }
  const rows = await db.select({ page: schema.pages, v: schema.pageVersions }).from(schema.pages)
    .innerJoin(schema.chapters, eq(schema.chapters.id, schema.pages.chapterId)).innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId))
    .innerJoin(schema.pageVersions, eq(schema.pageVersions.id, schema.pages.publishedVersionId))
    .where(and(eq(schema.units.editionId, editionId), eq(schema.chapters.slug, "c11")));
  for (const { page, v } of rows) {
    const subs = PATCH_C11[page.slug]; if (!subs) continue;
    let json = JSON.stringify(v.blocks); let changed = false;
    for (const [a, b] of subs) { const ea = JSON.stringify(a).slice(1, -1), eb = JSON.stringify(b).slice(1, -1); if (json.includes(ea)) { json = json.split(ea).join(eb); changed = true; } }
    // guia docente: a saída esperada da missão 3 citava 60.000 IDs (pacote antigo)
    let guide = v.teacherGuide; const gj = JSON.stringify(guide ?? null);
    if (gj.includes("60.000 IDs")) { guide = JSON.parse(gj.split("60.000 IDs").join("todos os IDs da base do grupo")); changed = true; }
    if (!changed) continue;
    const existing = await db.select({ v: schema.pageVersions.versionNo }).from(schema.pageVersions).where(eq(schema.pageVersions.pageId, page.id));
    const versionNo = Math.max(...existing.map((e) => e.v)) + 1; const vid = newId();
    await db.insert(schema.pageVersions).values({ id: vid, pageId: page.id, versionNo, title: v.title, objective: v.objective, support: v.support, connection: v.connection, timeBudget: v.timeBudget, blocks: JSON.parse(json), teacherGuide: guide, changeNote: "Bases do trabalho final: 15 bases de cerca de 1 milhão de propostas e OOT de 100.000 IDs; números fixos do pacote antigo substituídos", publishedAt: new Date() });
    await db.update(schema.pages).set({ publishedVersionId: vid, updatedAt: new Date() }).where(eq(schema.pages.id, page.id));
    console.log(`patch ${page.slug}: nova versão ${versionNo} (números do pacote de bases)`);
  }
}

/**
 * Trabalho final com dois componentes sobre o mesmo produto (17/09/2026): o modelo (doze missões) e o blueprint da
 * operação (fluxo de concessão, governança e três linhas de defesa, modelo de decisão integrado, monitoramento e RAS).
 */
const TRABALHO_FINAL = {
  title: "Trabalho final: o modelo de PD e o blueprint da operação do mesmo produto",
  description: "Dois componentes sobre o mesmo produto de crédito, o da base escolhida pelo grupo. Componente 1, o modelo: construir, testar e defender o modelo de PD seguindo as doze missões (dossiê, código reproduzível, manifesto congelado, previsões OOT, defesa individual). Componente 2, o blueprint: desenhar a operação completa desse produto, da captação do cliente ao desembolso e ao monitoramento pós-concessão, integrando o fluxo de concessão, a governança com três linhas de defesa (políticas, comitês, alçadas, segregação de funções, RAS) e o modelo de decisão do componente 1 com sua justificativa. Entregas do blueprint: fluxograma da jornada de crédito, alçadas e comitês, limites derivados do RAS e indicadores de monitoramento. Critérios: coerência entre fluxo, governança e modelo; aderência regulatória (Bacen, LGPD); viabilidade operacional; clareza na apresentação ao Conselho ou à diretoria. As etapas abaixo organizam o percurso; nem toda etapa tem entrega ou nota separada.",
  deliverables: ["Componente 1 · Dossiê do modelo (PDF)", "Componente 1 · Código reproduzível (ZIP)", "Componente 1 · Manifesto do modelo congelado", "Componente 1 · Previsões OOT (CSV com proposta_id, pd_modelo, decisao_politica, versao_modelo)", "Componente 2 · Blueprint da operação (PDF): fluxograma da jornada, alçadas e comitês, limites RAS, indicadores de monitoramento e modelo de decisão integrado"],
};
const DESCRICAO_ANTIGA = "Dossiê final, código reproduzível, teste OOT cego e defesa individual. As doze missões abaixo organizam o percurso; nem toda missão tem entrega ou nota separada.";
const ETAPAS_BLUEPRINT = [
  { number: 13, title: "Blueprint · Fluxo de concessão", description: "Jornada completa do produto escolhido: captação, análise, decisão, desembolso e pós-concessão. Onde cada informação nasce e onde o modelo entra.", pageSlug: null, expectedOutputs: ["Fluxograma da jornada de crédito com pontos de decisão e dados disponíveis em cada ponto"], requiresDelivery: false, position: 13 },
  { number: 14, title: "Blueprint · Governança e três linhas de defesa", description: "Políticas, comitês, alçadas, segregação de funções e apetite a risco (RAS) com limites que derivam da conta econômica da missão 10.", pageSlug: null, expectedOutputs: ["Matriz de alçadas e comitês", "Limites do RAS por produto (PD média, perda esperada, concentração)"], requiresDelivery: false, position: 14 },
  { number: 15, title: "Blueprint · Modelo de decisão integrado", description: "Como o modelo do componente 1 entra no fluxo: limiar, faixa manual, exceções, tratamento de categorias novas e de ausência, aderência a Bacen e LGPD.", pageSlug: null, expectedOutputs: ["Política de decisão escrita (limiar, faixa cinza, exceções) e justificativa da escolha do modelo"], requiresDelivery: false, position: 15 },
  { number: 16, title: "Blueprint · Monitoramento e apresentação ao Conselho", description: "Indicadores com limite, frequência, responsável e ação (missão 11) ligados ao RAS; síntese de uma página para o Conselho ou a diretoria.", pageSlug: null, expectedOutputs: ["Painel de indicadores e gatilhos", "Sumário executivo de uma página"], requiresDelivery: true, position: 16 },
];
const NIVEIS = [{ score: 0, label: "0", description: "não demonstrou" }, { score: 1, label: "1", description: "parcial" }, { score: 2, label: "2", description: "completo e sustentado por evidência" }];
const RUBRICA_TRABALHO_FINAL_V2 = {
  scale: [0, 1, 2], maxScore: 16, rounding: { decimals: 0 }, cutoffRule: null, source: "c11p18",
  levelsLegend: "0 não demonstrou · 1 parcial · 2 completo e sustentado por evidência",
  criteria: [
    { key: "problema_dados", name: "Modelo · Problema e dados", weight: 1, question: "A pergunta está clara e os dados usados existiam na data da decisão?" },
    { key: "modelo_testes", name: "Modelo · Modelo e testes", weight: 1, question: "O grupo comparou os modelos corretamente e preservou o teste OOT?" },
    { key: "uso_responsavel", name: "Modelo · Uso responsável (governança, na prática)", weight: 1, question: "O grupo explicou quando usar o modelo, como acompanhá-lo e quem age se algo sair do esperado?" },
    { key: "reproducao_defesa", name: "Modelo · Reprodução e defesa", weight: 1, question: "Outra pessoa consegue executar o projeto e o aluno explica as decisões que tomou?" },
    { key: "bp_coerencia", name: "Blueprint · Coerência entre fluxo, governança e modelo", weight: 1, question: "O fluxograma, as alçadas e o modelo de decisão descrevem a mesma operação, sem contradições?" },
    { key: "bp_regulatorio", name: "Blueprint · Aderência regulatória", weight: 1, question: "Políticas, alçadas, uso de dados e monitoramento respeitam as normas do Bacen e a LGPD, com as referências citadas?" },
    { key: "bp_viabilidade", name: "Blueprint · Viabilidade operacional", weight: 1, question: "A operação cabe na capacidade declarada (faixa manual, prazos, sistemas) e escala sem quebrar a governança?" },
    { key: "bp_conselho", name: "Blueprint · Clareza para o Conselho", weight: 1, question: "Um conselheiro entende em uma página o que se decide, com que risco, quem responde e o que dispara ação?" },
  ].map((c) => ({ ...c, levels: NIVEIS })),
  individualQuestion: "Mostre uma decisão que foi sua, a evidência que a sustentou e uma resposta da IA que você recusou ou corrigiu.",
};
async function patchTrabalhoFinal(editionId: string) {
  // rubrica: nova versão com os oito critérios quando a corrente ainda tem só os quatro do modelo
  const [rb] = await db.select().from(schema.rubrics).where(and(eq(schema.rubrics.editionId, editionId), eq(schema.rubrics.slug, "trabalho-final")));
  if (!rb?.currentVersionId) return;
  const [cur] = await db.select().from(schema.rubricVersions).where(eq(schema.rubricVersions.id, rb.currentVersionId));
  let versionId = rb.currentVersionId;
  if (cur && (cur.definition as { criteria: unknown[] }).criteria.length < 8) {
    versionId = newId();
    await db.insert(schema.rubricVersions).values({ id: versionId, rubricId: rb.id, versionNo: cur.versionNo + 1, definition: RUBRICA_TRABALHO_FINAL_V2, changeNote: "Trabalho final com dois componentes: critérios do blueprint da operação" });
    await db.update(schema.rubrics).set({ currentVersionId: versionId, name: "Avaliação final do trabalho (modelo e blueprint)" }).where(eq(schema.rubrics.id, rb.id));
    console.log(`patch rubrica trabalho-final: versão ${cur.versionNo + 1} (oito critérios)`);
  }
  // trabalhos finais das turmas da edição ainda com o enunciado original: enunciado, entregáveis, rubrica e etapas do blueprint
  const classes = await db.select({ id: schema.classes.id, code: schema.classes.code }).from(schema.classes).where(eq(schema.classes.editionId, editionId));
  for (const cls of classes) {
    const [a] = await db.select().from(schema.assignments).where(and(eq(schema.assignments.classId, cls.id), eq(schema.assignments.slug, "trabalho-final")));
    if (!a) continue;
    const graded = await db.select({ id: schema.grades.id }).from(schema.grades).where(eq(schema.grades.assignmentId, a.id)).limit(1);
    if (a.description === DESCRICAO_ANTIGA) {
      await db.update(schema.assignments).set({ title: TRABALHO_FINAL.title, description: TRABALHO_FINAL.description, deliverables: TRABALHO_FINAL.deliverables, ...(graded.length ? {} : { rubricVersionId: versionId }) }).where(eq(schema.assignments.id, a.id));
      console.log(`patch trabalho-final ${cls.code}: enunciado com dois componentes`);
    }
    const steps = await db.select({ number: schema.assignmentSteps.number }).from(schema.assignmentSteps).where(eq(schema.assignmentSteps.assignmentId, a.id));
    const have = new Set(steps.map((s) => s.number));
    for (const st of ETAPAS_BLUEPRINT) if (!have.has(st.number)) await db.insert(schema.assignmentSteps).values({ id: newId(), assignmentId: a.id, ...st });
  }
}
