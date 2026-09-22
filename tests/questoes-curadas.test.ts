import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** As perguntas curadas existem porque a pergunta de checagem é aberta e não dá veredito ao aluno
    que estuda sozinho. O contrato aqui é o mesmo das questões vindas do material original. */
type Erro = { confusao: string; conceito: string; seu: string; adequado: string } | null;
type Curada = { pagina: string; slug: string; rot: string; pergunta: string; alt: string[]; certa: number; porqueCerta: string; erros: Erro[] };

const arquivo = path.join(process.cwd(), "content", "questoes-curadas.json");
const { questoes } = JSON.parse(fs.readFileSync(arquivo, "utf8")) as { questoes: Curada[] };

describe("perguntas curadas", () => {
  it("cobre as páginas essenciais dos capítulos 4, 5 e 6 que não são abertura de capítulo", () => {
    const esperadas = ["c4p3", "c4p4", "c4p5", "c4p7", "c4p8", "c5p3", "c5p4", "c5p7", "c5p10",
                       "c5p18", "c6p2", "c6p5", "c6p6", "c6p7", "c6p10", "c6p13"];
    expect(questoes.map((q) => q.pagina).sort()).toEqual([...esperadas].sort());
  });

  it("uma alternativa certa, três alternativas e diagnóstico em cada errada", () => {
    for (const q of questoes) {
      expect(q.alt, q.slug).toHaveLength(3);
      expect(q.erros, q.slug).toHaveLength(3);
      expect(q.certa, q.slug).toBeGreaterThanOrEqual(0);
      expect(q.certa, q.slug).toBeLessThan(q.alt.length);
      expect(q.erros[q.certa], q.slug).toBeNull();
      q.erros.forEach((e, i) => {
        if (i === q.certa) return;
        expect(e, `${q.slug} alternativa ${i}`).not.toBeNull();
        for (const campo of ["confusao", "conceito", "seu", "adequado"] as const) {
          expect(e![campo]?.length ?? 0, `${q.slug}.${campo}`).toBeGreaterThan(20);
        }
      });
    }
  });

  it("não termina 'seu' nem 'adequado' com ponto, porque o renderizador acrescenta um", () => {
    for (const q of questoes) {
      for (const e of q.erros) {
        if (!e) continue;
        expect(e.seu.endsWith("."), `${q.slug}.seu`).toBe(false);
        expect(e.adequado.endsWith("."), `${q.slug}.adequado`).toBe(false);
      }
    }
  });

  it("slug é o da página seguido de q, e não colide entre si", () => {
    const slugs = questoes.map((q) => q.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const q of questoes) expect(q.slug).toBe(`${q.pagina}q`);
  });

  it("segue a regra editorial: nenhum travessão como pontuação de prosa", () => {
    const bruto = fs.readFileSync(arquivo, "utf8");
    const achados = bruto.split("\n").filter((l) => /[—–]/.test(l));
    expect(achados, achados.join("\n")).toHaveLength(0);
  });
});
