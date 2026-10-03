import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BLOCOS, CURTO, PERGUNTAS, ROTEIRO, SLIDE, TOTAL, minutos } from "@/lib/capitulo12/roteiro";

/**
 * Contrato do capítulo 12 (classificação e ensembles, Aula 6): roteiro, material de origem (camada V20), guias do
 * professor, figuras, registro dos quadros e renderização no servidor, no mesmo regime dos capítulos 6 e 7.
 */
vi.mock("next/navigation", () => ({ usePathname: () => "/aulas/c12p1" }));

const raiz = process.cwd();
const dir = path.join(raiz, "content/capitulo12");
const arquivos = fs.readdirSync(dir).filter((f) => /^paginas-b[1-4]\.json$/.test(f));
const paginas = Object.assign({}, JSON.parse(fs.readFileSync(path.join(dir, "paginas.json"), "utf8")).paginas, ...arquivos.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).paginas)) as Record<string, any>;
const extracao = JSON.parse(fs.readFileSync(path.join(raiz, "content/generated/extract.json"), "utf8"));
const c12 = (extracao.pages as any[]).filter((p) => String(p.id).startsWith("c12p"));

describe("roteiro do capítulo 12", () => {
  it("53 slides, numeração contínua, um slug por slide, apêndices por último", () => {
    expect(TOTAL).toBe(53);
    expect(ROTEIRO.map((s) => s.n)).toEqual(Array.from({ length: 53 }, (_, i) => i + 1));
    expect(new Set(ROTEIRO.map((s) => s.slug)).size).toBe(53);
    expect(ROTEIRO.slice(-3).every((s) => s.nivel === "apendice")).toBe(true);
  });
  it("cada uma das quatro perguntas tem slides e um bloco que abre nela", () => {
    for (const p of PERGUNTAS) expect(ROTEIRO.some((s) => s.pergunta === p.id), p.id).toBe(true);
    for (const b of BLOCOS) { expect(SLIDE[b.abre].pergunta).toBe(b.pergunta); for (const [, s] of b.passos) expect(SLIDE[s], s).toBeTruthy(); }
  });
  it("títulos, rótulos e guias sem travessão nem meia risca", () => {
    for (const s of ROTEIRO) for (const t of [s.titulo, s.sub, CURTO[s.slug]]) expect(/[–—]/.test(t), s.slug).toBe(false);
    for (const f of arquivos) expect(/[–—]/.test(fs.readFileSync(path.join(dir, f), "utf8")), f).toBe(false);
  });
  it("percurso essencial cabe na aula de 165 minutos úteis", () => {
    expect(minutos("essencial")).toBeLessThanOrEqual(165);
  });
  it("guia completo em todas as páginas, com tempo que fecha com o roteiro", () => {
    for (const s of ROTEIRO) {
      const p = paginas[s.slug]; expect(p, s.slug).toBeTruthy();
      expect(Object.values(p.t as Record<string, number>).reduce((a, b) => a + b, 0), s.slug).toBe(s.min);
      for (const c of ["funcao", "pre", "conducao", "leitura", "pergunta", "resposta", "interacao", "verificacao", "transicao"]) expect(p.guia?.[c]?.length ?? 0, `${s.slug}.${c}`).toBeGreaterThan(5);
      expect(/p[áa]gina\s+\d/i.test(p.guia.pre), `${s.slug}.pre`).toBe(false);
    }
  });
  it("material de origem extraído com o mesmo título, a mesma ordem e o guia, numa Aula 6 própria", () => {
    expect(c12.map((p) => p.id)).toEqual(ROTEIRO.map((s) => s.slug));
    for (const p of c12) { expect(p.titulo, p.id).toBe(SLIDE[p.id].titulo); expect(p.guia?.funcao, p.id).toBe(paginas[p.id].guia.funcao); }
    expect(extracao.meta.capitulos.find((c: any) => c.n === 12)?.id).toBe("c12");
    expect(extracao.meta.aulas.find((a: any) => a.n === 6)?.caps).toEqual([12]);
  });
  it("toda figura citada pelos quadros existe em public/capitulo12", () => {
    const slides = fs.readdirSync(path.join(raiz, "src/components/capitulo12/slides"));
    for (const f of slides) {
      const t = fs.readFileSync(path.join(raiz, "src/components/capitulo12/slides", f), "utf8");
      for (const m of t.matchAll(/<Figura[^>]*\bsrc="([^"]+)"/g)) expect(fs.existsSync(path.join(raiz, "public/capitulo12", `${m[1]}.webp`)), `${f}: ${m[1]}`).toBe(true);
    }
  });
  it("todo slide tem quadro registrado e fica no palco próprio", async () => {
    const { QUADROS_C12 } = await import("@/components/capitulo12/registro");
    const { PALCO_PROPRIO } = await import("@/lib/visuais/palco-proprio");
    for (const s of ROTEIRO) { expect(QUADROS_C12[s.slug], s.slug).toBeTruthy(); expect(PALCO_PROPRIO.has(s.slug), s.slug).toBe(true); }
  });
  it("cada quadro renderiza no servidor com o título do roteiro e sem número quebrado", async () => {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { QUADROS_C12_ESTATICOS } = await import("@/components/capitulo12/registro-estatico");
    for (const s of ROTEIRO) {
      const html = renderToStaticMarkup(createElement(QUADROS_C12_ESTATICOS[s.slug], {}));
      const texto = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
      expect(html, s.slug).toContain(`id="${s.slug}-tit"`);
      expect(html, s.slug).toContain("Classificação");
      expect(texto, s.slug).not.toMatch(/\bNaN\b|\bundefined\b|\bInfinity\b|\bnull\b/);
      expect(texto, s.slug).not.toMatch(/Em construção/);
      expect(/[–—]/.test(texto), s.slug).toBe(false);
    }
  }, 120000);
});
