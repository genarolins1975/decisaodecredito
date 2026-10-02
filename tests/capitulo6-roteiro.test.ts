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
  it("22 slides, numeração contínua, um slug por slide, apêndice por último", () => {
    expect(TOTAL).toBe(22);
    expect(ROTEIRO.map((s) => s.n)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
    expect(new Set(ROTEIRO.map((s) => s.slug)).size).toBe(22);
    expect(ROTEIRO[21].nivel).toBe("apendice");
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
