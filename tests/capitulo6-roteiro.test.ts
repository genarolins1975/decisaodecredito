import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CURTO, PERGUNTAS, ROTEIRO, SLIDE, TOTAL, minutos } from "@/lib/capitulo6/roteiro";

/**
 * Contrato do capítulo 6 reconstruído: roteiro, material de origem (camada V19), guias do professor, registro dos
 * quadros e renderização no servidor, no mesmo regime do capítulo 7.
 */
vi.mock("next/navigation", () => ({ usePathname: () => "/aulas/c6p1" }));

const raiz = process.cwd();
const fonte = fs.readFileSync(path.join(raiz, "content/capitulo6/paginas.json"), "utf8");
const paginas = JSON.parse(fonte).paginas as Record<string, any>;
const extracao = JSON.parse(fs.readFileSync(path.join(raiz, "content/generated/extract.json"), "utf8"));
const lista: any[] = Array.isArray(extracao) ? extracao : extracao.paginas ?? extracao.pages;
const c6 = lista.filter((p) => String(p.id).startsWith("c6p"));

describe("roteiro do capítulo 6", () => {
  it("23 slides, numeração contínua, um slug por slide, conceito dos três métodos antes das curvas, apêndice por último", () => {
    expect(TOTAL).toBe(23);
    expect(ROTEIRO.map((s) => s.n)).toEqual(Array.from({ length: 23 }, (_, i) => i + 1));
    expect(new Set(ROTEIRO.map((s) => s.slug)).size).toBe(23);
    expect(ROTEIRO.slice(0, 3).map((s) => s.slug)).toEqual(["c6p1", "c6p23", "c6p2"]);
    expect(ROTEIRO[22].nivel).toBe("apendice");
  });
  it("cada uma das quatro perguntas tem slides", () => {
    for (const p of PERGUNTAS) expect(ROTEIRO.some((s) => s.pergunta === p.id), p.id).toBe(true);
  });
  it("títulos, rótulos e textos sem travessão nem meia risca", () => {
    for (const s of ROTEIRO) for (const t of [s.titulo, s.sub, CURTO[s.slug]]) expect(/[–—]/.test(t), s.slug).toBe(false);
    expect(/[–—]/.test(fonte)).toBe(false);
  });
  it("percurso essencial cabe na aula: no máximo 65 minutos", () => {
    expect(minutos("essencial")).toBeLessThanOrEqual(65);
  });
  it("guia completo em todas as páginas, com tempo que fecha com o roteiro", () => {
    for (const s of ROTEIRO) {
      const p = paginas[s.slug]; expect(p, s.slug).toBeTruthy();
      expect(Object.values(p.t as Record<string, number>).reduce((a, b) => a + b, 0), s.slug).toBe(s.min);
      for (const c of ["funcao", "pre", "conducao", "leitura", "pergunta", "resposta", "interacao", "verificacao", "transicao"]) expect(p.guia?.[c]?.length ?? 0, `${s.slug}.${c}`).toBeGreaterThan(5);
      expect(/p[áa]gina\s+\d/i.test(p.guia.pre), `${s.slug}.pre`).toBe(false);
    }
  });
  it("material de origem extraído com o mesmo título, a mesma ordem e o guia", () => {
    expect(c6.map((p) => p.id)).toEqual(ROTEIRO.map((s) => s.slug));
    for (const p of c6) { expect(p.titulo, p.id).toBe(SLIDE[p.id].titulo); expect(p.guia?.funcao, p.id).toBe(paginas[p.id].guia.funcao); }
  });
  it("todo slide tem quadro registrado e fica no palco próprio", async () => {
    const { QUADROS_C6 } = await import("@/components/capitulo6/registro");
    const { PALCO_PROPRIO, ABERTURA_NATIVA } = await import("@/lib/visuais/palco-proprio");
    for (const s of ROTEIRO) { expect(QUADROS_C6[s.slug], s.slug).toBeTruthy(); expect(PALCO_PROPRIO.has(s.slug), s.slug).toBe(true); }
    expect(ABERTURA_NATIVA.has("c6p1")).toBe(false);
  });
  it("todo LinkSlide dos quadros mostra o número do slug no roteiro, nunca um número digitado diferente", () => {
    const dir = path.join(raiz, "src/components/capitulo6/slides");
    let vistos = 0;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".tsx"))) {
      const src = fs.readFileSync(path.join(dir, f), "utf8");
      for (const m of src.matchAll(/<LinkSlide\s+slug="(c6p\d+)"[^>]*>([\s\S]*?)<\/LinkSlide>/g)) {
        const [, slug, corpo] = m; vistos++;
        expect(SLIDE[slug], `${f}: slug ${slug} fora do roteiro`).toBeTruthy();
        const semExpr = corpo.replace(/\{[^}]*\}/g, "");
        for (const n of semExpr.match(/\d+/g) ?? []) expect(Number(n), `${f}: LinkSlide ${slug} com "${corpo.trim()}"`).toBe(SLIDE[slug].n);
        for (const e of corpo.matchAll(/SLIDE\.(c6p\d+)\.n/g)) expect(e[1], `${f}: LinkSlide ${slug} mostra o número de ${e[1]}`).toBe(slug);
      }
    }
    expect(vistos).toBeGreaterThan(30);
  });
  it("menções a slides nos guias, nas explicações e nas questões do capítulo 6 são coerentes com o roteiro", () => {
    /* Âncoras: termos que identificam um slide sem ambiguidade. Uma menção "slide N" é conferida quando o parêntese
       logo depois ("Slide 8 (taxa)") ou o trecho logo antes ("o candidato (slide 22)") casa com a âncora de um único slide,
       ou quando vem junto de um slug ("slide 2, c6p23"). Toda menção fica entre 1 e TOTAL, e o pré-requisito de uma página
       vem antes dela. */
    const ANCORA: Record<string, RegExp> = {
      c6p1: /\bo caso\b|excesso de/, c6p23: /escolher, votar e corrigir/, c6p2: /curvas de log loss|log loss dos três/, c6p3: /palpite|f₀/,
      c6p4: /resíduos|erro como alvo/, c6p5: /as folhas e a média do erro|primeira árvore/, c6p6: /newton|valor da folha/, c6p7: /^\W*taxa\W*$|a taxa$/,
      c6p8: /sem garantia|quatro árvores/, c6p9: /parcelas|pd final/, c6p10: /fórmula de friedman|algoritmo em cinco linhas/, c6p11: /carteira de 1\.472|na carteira/,
      c6p12: /profundidade/, c6p13: /como controles|quatro controles/, c6p14: /se escolhem junt|se compensam/, c6p15: /\bparada\b|quando parar|sai da validação|na validação$/,
      c6p16: /subamostra|sortear propostas/, c6p17: /contra a logística/, c6p18: /nível das pds/, c6p19: /contribuiç|atraso fora do modelo/, c6p20: /monotonia|monotônica/,
      c6p21: /candidato|lista do validador|precisa provar/, c6p22: /apêndice/,
    };
    const textos: [string, string, string][] = []; // [página, campo, texto]
    const coletar = (pg: string, o: unknown, campo: string) => {
      if (typeof o === "string") textos.push([pg, campo, o]);
      else if (Array.isArray(o)) o.forEach((v, i) => coletar(pg, v, `${campo}[${i}]`));
      else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) coletar(pg, v, campo ? `${campo}.${k}` : k);
    };
    for (const [pg, p] of Object.entries(paginas)) coletar(pg, p, "");
    for (const [nome, q] of Object.entries(JSON.parse(fonte).questoes ?? {})) coletar(`c6p${nome.match(/C6P(\d+)/)![1]}`, q, nome);
    const expl = JSON.parse(fs.readFileSync(path.join(raiz, "scripts/apostila/explicacoes/c06.json"), "utf8")) as Record<string, unknown>;
    for (const [pg, e] of Object.entries(expl)) coletar(pg, e, "explicação");
    const curadas = JSON.parse(fs.readFileSync(path.join(raiz, "content/questoes-curadas.json"), "utf8")).questoes as { pagina: string }[];
    for (const q of curadas.filter((x) => x.pagina.startsWith("c6p"))) coletar(q.pagina, q, "questão curada");
    let conferidas = 0;
    for (const [pg, campo, t] of textos) {
      for (const m of t.matchAll(/[Ss]lides? (\d+(?:(?:, | e | a )\d+(?![.,]\d))*)(?![.,]\d)/g)) {
        const ns = m[1].match(/\d+/g)!.map(Number);
        for (const n of ns) expect(n >= 1 && n <= TOTAL, `${pg}.${campo}: "${m[0]}"`).toBe(true);
        if (campo.endsWith("guia.pre") && SLIDE[pg]) for (const n of ns) expect(n, `${pg}.pre cita o slide ${n}, que não vem antes`).toBeLessThan(SLIDE[pg].n);
        if (ns.length !== 1 || /slides/i.test(m[0])) continue;
        const depois = t.slice(m.index! + m[0].length);
        const slugJunto = depois.match(/^,? \(?(c6p\d+)\)?/)?.[1] ?? t.slice(0, m.index!).match(/(c6p\d+)\)?,? (?:no |o |do )?$/)?.[1];
        const paren = depois.match(/^ \(([^)]*)\)/)?.[1];
        const antes = t.slice(Math.max(0, m.index! - 45), m.index!).match(/(.*) \($/)?.[1];
        const ctx = (paren ?? antes ?? "").toLowerCase();
        const casam = Object.keys(ANCORA).filter((s) => ctx && ANCORA[s].test(ctx));
        const alvo = slugJunto ?? (casam.length === 1 ? casam[0] : null);
        if (!alvo) continue;
        conferidas++;
        expect(SLIDE[alvo].n, `${pg}.${campo}: "${m[0]}${paren ? ` (${paren})` : ""}" deveria citar ${alvo}`).toBe(ns[0]);
      }
    }
    expect(conferidas).toBeGreaterThanOrEqual(20);
  });
  it("cada quadro renderiza no servidor com o título do roteiro do capítulo 6 e sem número quebrado", async () => {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { QUADROS_C6_ESTATICOS } = await import("@/components/capitulo6/registro-estatico");
    for (const s of ROTEIRO) {
      const html = renderToStaticMarkup(createElement(QUADROS_C6_ESTATICOS[s.slug], {}));
      const texto = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
      expect(html, s.slug).toContain(`id="${s.slug}-tit"`);
      expect(html, s.slug).toContain("Mecanismo");
      expect(texto, s.slug).not.toMatch(/\bNaN\b|\bundefined\b|\bInfinity\b|\bnull\b/);
      expect(/[–—]/.test(texto), s.slug).toBe(false);
    }
  }, 60000);
});
