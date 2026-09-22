import { describe, expect, it } from "vitest";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Contrato do conteúdo didático dos materiais da Aula 2 (aula_credito_html/material/conteudo):
 * cobre os 50 slides, cada slide tem explicação e instrução de tela, os exercícios têm enunciado
 * e nenhum texto exibido traz hífen ou travessão (só as fórmulas TeX podem ter o sinal de menos).
 */
const base = path.resolve(__dirname, "..", "aula_credito_html", "material", "conteudo");
const carregar = async (nome: string) => import(/* @vite-ignore */ pathToFileURL(path.join(base, nome)).href);

function textos(valor: unknown, caminho: string, saida: [string, string][]) {
  if (typeof valor === "string") saida.push([caminho, valor]);
  else if (Array.isArray(valor)) valor.forEach((v, i) => textos(v, `${caminho}[${i}]`, saida));
  else if (valor && typeof valor === "object") {
    for (const [k, v] of Object.entries(valor)) if (k !== "tex") textos(v, `${caminho}.${k}`, saida);
  }
}

describe("conteúdo dos materiais da Aula 2", () => {
  it("cobre os 50 slides com explicação, instrução de tela e exercícios onde a aula os tem", async () => {
    const partes = await Promise.all(["slides-01-20.mjs", "slides-21-36.mjs", "slides-37-50.mjs"].map(carregar));
    const slides = Object.assign({}, ...partes.map((m) => m.slides));
    const ids = Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, "0"));
    expect(Object.keys(slides).sort()).toEqual(ids);
    for (const id of ids) {
      expect(slides[id].comoLer.length, `slide ${id}: explicação curta demais`).toBeGreaterThan(400);
      expect(slides[id].naTela.length, `slide ${id}: sem instrução de tela`).toBeGreaterThan(40);
      for (const f of slides[id].formulas ?? []) { expect(f.tex.length).toBeGreaterThan(3); expect(f.nota.length).toBeGreaterThan(10); }
    }
    const comExercicio = ids.filter((id) => slides[id].exercicio);
    expect(comExercicio).toEqual(["01", "04", "20", "30", "42", "49", "50"]);
    for (const id of comExercicio) {
      expect(slides[id].exercicio.titulo).toBeTruthy();
      expect(slides[id].exercicio.itens.length).toBeGreaterThan(1);
    }
  });

  it("blocos cobrem os slides 01 a 50 sem lacunas e o ritmo soma os 165 minutos úteis", async () => {
    const { blocos, glossario, errosComuns, verificacaoSaida, roteiroAplicacao } = await carregar("blocos.mjs");
    expect(blocos.map((b: { de: string }) => b.de)).toEqual(["01", "07", "21", "31", "43"]);
    expect(blocos.map((b: { ate: string }) => b.ate)).toEqual(["06", "20", "30", "42", "50"]);
    expect(blocos.reduce((s: number, b: { tempo: number }) => s + b.tempo, 0)).toBe(165);
    expect(glossario.length).toBeGreaterThan(15);
    expect(errosComuns.length).toBeGreaterThan(10);
    expect(verificacaoSaida.length).toBe(10);
    expect(roteiroAplicacao.length).toBe(6);
  });

  it("nenhum texto exibido contém hífen ou travessão", async () => {
    const modulos = await Promise.all(["blocos.mjs", "slides-01-20.mjs", "slides-21-36.mjs", "slides-37-50.mjs"].map(carregar));
    const saida: [string, string][] = [];
    modulos.forEach((m, i) => textos({ ...m }, `modulo${i}`, saida));
    const comTraco = saida.filter(([, t]) => /[-–—]/.test(t)).map(([c, t]) => `${c}: ${t.slice(0, 60)}`);
    expect(comTraco).toEqual([]);
  });
});
