import { describe, expect, it } from "vitest";
import { chapterAssumptions, resolvePrerequisite } from "../src/lib/content/prerequisites";

const slugs = new Set<string>();
for (const [c, n] of [[1, 8], [2, 18], [3, 20], [4, 22], [5, 19], [6, 19], [7, 20], [8, 13], [9, 9], [10, 14], [11, 18]]) for (let p = 1; p <= n; p++) slugs.add(`c${c}p${p}`);
const links = (s: ReturnType<typeof resolvePrerequisite>) => (s ?? []).filter((x) => x.slug).map((x) => x.slug);
const text = (s: ReturnType<typeof resolvePrerequisite>) => (s ?? []).map((x) => x.text).join("");

describe("prerrequisitos derivados do guia docente", () => {
  it("capítulo e página explícitos", () => {
    const s = resolvePrerequisite("Gradiente da logística, capítulo 4 página 16.", { chapter: 6, pageNumber: 12, slugs });
    expect(links(s)).toEqual(["c4p1", "c4p16"]); expect(text(s)).toBe("Gradiente da logística, capítulo 4 página 16.");
  });
  it("páginas do próprio capítulo, com vírgulas e 'e'", () => {
    expect(links(resolvePrerequisite("Páginas 7, 11, 12 e 14. Sem elas o exercício vira adivinhação.", { chapter: 3, pageNumber: 19, slugs }))).toEqual(["c3p7", "c3p11", "c3p12", "c3p14"]);
  });
  it("capítulo citado na frase define o capítulo das páginas seguintes; nova frase reinicia", () => {
    expect(links(resolvePrerequisite("Capítulo 1, páginas 2 e 3. Capítulo 8, a equação de resultado e a política congelada.", { chapter: 10, pageNumber: 2, slugs }))).toEqual(["c1p1", "c1p2", "c1p3", "c8p1"]);
    expect(links(resolvePrerequisite("Rodada 1 congelada. Capítulo 8, página 11, onde o choque em log odds foi construído.", { chapter: 10, pageNumber: 12, slugs }))).toEqual(["c8p1", "c8p11"]);
  });
  it("'página N do capítulo M' e intervalos de capítulos", () => {
    expect(links(resolvePrerequisite("Em especial a política congelada na página 12 do capítulo 8 e o painel selecionado na página 8 do capítulo 9.", { chapter: 10, pageNumber: 1, slugs }))).toEqual(["c8p12", "c8p1", "c9p8", "c9p1"]);
    const r = resolvePrerequisite("Capítulos 1 a 3.", { chapter: 4, pageNumber: 1, slugs });
    expect(links(r)).toEqual(["c1p1", "c2p1", "c3p1"]); expect(text(r)).toBe("Capítulos 1 a 3.");
    expect(links(resolvePrerequisite("Capítulos 4 e 5.", { chapter: 6, pageNumber: 1, slugs }))).toEqual(["c4p1", "c5p1"]);
  });
  it("página anterior e páginas anteriores", () => {
    expect(links(resolvePrerequisite("Definição de PD da página anterior.", { chapter: 1, pageNumber: 6, slugs }))).toEqual(["c1p5"]);
    expect(links(resolvePrerequisite("As formas de variável das duas páginas anteriores.", { chapter: 3, pageNumber: 6, slugs }))).toEqual(["c3p4"]);
    expect(links(resolvePrerequisite("As três páginas anteriores.", { chapter: 4, pageNumber: 6, slugs }))).toEqual(["c4p3"]);
    expect(links(resolvePrerequisite("Página anterior.", { chapter: 1, pageNumber: 1, slugs }))).toEqual([]);
  });
  it("nenhum, arquivos e páginas inexistentes não viram link", () => {
    expect(resolvePrerequisite("Nenhum. Esta é a primeira página do curso.", { chapter: 1, pageNumber: 1, slugs })).toBeNull();
    expect(links(resolvePrerequisite("guia-dados-e-missoes.xlsx e dados/dicionario_dados.csv", { chapter: 11, pageNumber: 4, slugs }))).toEqual([]);
    expect(links(resolvePrerequisite("Capítulo 4 página 99.", { chapter: 6, pageNumber: 2, slugs }))).toEqual(["c4p1"]);
  });
  it("agregação por capítulo ignora o próprio capítulo e ordena", () => {
    const agg = chapterAssumptions([
      { pageNumber: 11, pre: "Curva logística, capítulo 4 página 7; a fórmula do boosting." },
      { pageNumber: 12, pre: "Gradiente da logística, capítulo 4 página 16." },
      { pageNumber: 15, pre: "Hiperparâmetros, capítulo 2; freios da árvore, capítulo 5." },
      { pageNumber: 5, pre: "F₀, o palpite constante da página anterior." },
    ], { chapter: 6, slugs });
    expect(agg).toEqual([{ chapter: 2, slugs: ["c2p1"] }, { chapter: 4, slugs: ["c4p1", "c4p7", "c4p16"] }, { chapter: 5, slugs: ["c5p1"] }]);
  });
});
