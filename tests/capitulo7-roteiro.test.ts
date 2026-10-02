import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ROTEIRO, SLIDE, TOTAL, PRINCIPAL, PERGUNTAS, CURTO, minutos } from "@/lib/capitulo7/roteiro";

/**
 * Contrato do capítulo 7 reconstruído: roteiro, material de origem (camada V18), guias do professor, registro dos
 * quadros e renderização no servidor. O que um aluno ou um professor lê precisa sair de uma fonte só e dizer a mesma
 * coisa em todo lugar.
 */
vi.mock("next/navigation", () => ({ usePathname: () => "/aulas/c7p1" }));

const raiz = process.cwd();
const paginas = JSON.parse(fs.readFileSync(path.join(raiz, "content/capitulo7/paginas.json"), "utf8")).paginas as Record<string, any>;
const extracao = JSON.parse(fs.readFileSync(path.join(raiz, "content/generated/extract.json"), "utf8"));
const lista: any[] = Array.isArray(extracao) ? extracao : extracao.paginas ?? extracao.pages;

describe("roteiro do capítulo 7", () => {
  it("38 slides, numeração contínua, um slug por slide, apêndice por último", () => {
    expect(TOTAL).toBe(38);
    expect(ROTEIRO.map((s) => s.n)).toEqual(Array.from({ length: 38 }, (_, i) => i + 1));
    expect(new Set(ROTEIRO.map((s) => s.slug)).size).toBe(38);
    expect(ROTEIRO[37].nivel).toBe("apendice");
    expect(PRINCIPAL).toBe(37);
    expect(ROTEIRO[0].slug).toBe("c7p1");
  });

  it("toda pergunta citada existe, e cada uma das quatro tem slides", () => {
    for (const p of PERGUNTAS) expect(ROTEIRO.some((s) => s.pergunta === p.id), p.id).toBe(true);
    for (const s of ROTEIRO) expect(["ordenacao", "probabilidade", "decisao", "validacao", "todas", "apoio"]).toContain(s.pergunta);
  });

  it("títulos e textos sem travessão nem meia risca", () => {
    for (const s of ROTEIRO) for (const t of [s.titulo, s.sub, CURTO[s.slug]]) expect(/[–—]/.test(t), s.slug).toBe(false);
    expect(/[–—]/.test(fs.readFileSync(path.join(raiz, "content/capitulo7/paginas.json"), "utf8"))).toBe(false);
  });

  it("guia completo em todas as páginas, com tempo que fecha com o roteiro", () => {
    for (const s of ROTEIRO) {
      const p = paginas[s.slug];
      expect(p, s.slug).toBeTruthy();
      expect(Object.values(p.t as Record<string, number>).reduce((a, b) => a + b, 0), s.slug).toBe(s.min);
      for (const c of ["funcao", "pre", "conducao", "leitura", "pergunta", "resposta", "interacao", "verificacao", "transicao"]) expect(p.guia?.[c]?.length ?? 0, `${s.slug}.${c}`).toBeGreaterThan(5);
      expect(Array.isArray(p.guia.erros), s.slug).toBe(true);
      // "página N" no pré-requisito vira link para c7pN, que não é o slide N: o guia cita slides pelo número de ordem
      expect(/p[áa]gina\s+\d/i.test(p.guia.pre), `${s.slug}.pre`).toBe(false);
    }
    expect(minutos("essencial")).toBe(107);
    expect(minutos()).toBe(134);
  });

  it("material de origem extraído com o mesmo título, a mesma ordem e o guia", () => {
    const c7 = lista.filter((p) => String(p.id).startsWith("c7p"));
    expect(c7.map((p) => p.id)).toEqual(ROTEIRO.map((s) => s.slug));
    for (const p of c7) {
      expect(p.titulo, p.id).toBe(SLIDE[p.id].titulo);
      expect(p.guia?.funcao, p.id).toBe(paginas[p.id].guia.funcao);
    }
  });

  it("todo slide tem quadro registrado e fica no palco próprio", async () => {
    const { QUADROS_C7 } = await import("@/components/capitulo7/registro");
    const { PALCO_PROPRIO } = await import("@/lib/visuais/palco-proprio");
    for (const s of ROTEIRO) {
      expect(QUADROS_C7[s.slug], s.slug).toBeTruthy();
      expect(PALCO_PROPRIO.has(s.slug), s.slug).toBe(true);
    }
  });

  it("cada quadro renderiza no servidor com título, conclusão ou fonte, e sem número quebrado", async () => {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { QUADROS_C7 } = await import("@/components/capitulo7/registro");
    for (const s of ROTEIRO) {
      const html = renderToStaticMarkup(createElement(QUADROS_C7[s.slug], {}));
      const texto = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
      expect(html, s.slug).toContain(`id="${s.slug}-tit"`);
      expect(texto, s.slug).not.toMatch(/\bNaN\b|\bundefined\b|\bInfinity\b|\bnull\b/);
      expect(/[–—]/.test(texto), s.slug).toBe(false);
    }
  });
});
