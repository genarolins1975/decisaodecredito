import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** Os quadros 16:9 do capítulo 4 têm altura fixa e linhas em proporção. Duas armadilhas já
    cortaram conteúdo e ficam presas aqui:
    1. dois componentes usam o mesmo `data-tela`. Isso é permitido, desde que cada regra de linhas
       diga de quem é: sem escopo, a última regra do arquivo vence e um quadro recebe as linhas do
       outro, o que põe o painel de baixo por cima do de cima;
    2. consulta de contêiner sem nome dentro do sistema .rl. A regra que troca o layout do próprio
       quadro mede um elemento e as que trocam o layout dos filhos medem outro; quando os dois
       discordam, as colunas empilham dentro de uma caixa de altura fixa e o conteúdo é cortado. */
const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
const pastaVisuais = path.join(process.cwd(), "src/components/visuais");

/** tela -> componentes que a usam */
function donosPorTela() {
  const mapa = new Map<string, string[]>();
  for (const arq of fs.readdirSync(pastaVisuais).filter((f) => f.endsWith(".tsx"))) {
    const txt = fs.readFileSync(path.join(pastaVisuais, arq), "utf8");
    const vz = txt.match(/data-vz="([^"]+)"/)?.[1];
    if (!vz) continue;
    for (const m of txt.matchAll(/data-tela="([^"]+)"/g)) {
      const lista = mapa.get(m[1]) ?? [];
      if (!lista.includes(vz)) lista.push(vz);
      mapa.set(m[1], lista);
    }
  }
  return mapa;
}

/** blocos @container do arquivo, com a condição e o corpo */
function blocosContainer() {
  const blocos: { condicao: string; corpo: string; linha: number }[] = [];
  const re = /@container([^{]*)\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let nivel = 1, i = re.lastIndex;
    while (i < css.length && nivel > 0) { if (css[i] === "{") nivel++; else if (css[i] === "}") nivel--; i++; }
    blocos.push({ condicao: m[1].trim(), corpo: css.slice(re.lastIndex, i - 1), linha: css.slice(0, m.index).split("\n").length });
  }
  return blocos;
}

describe("quadros 16:9 do sistema .rl", () => {
  it("toda regra de linhas do quadro diz de qual componente é", () => {
    const donos = donosPorTela();
    const problemas: string[] = [];
    for (const m of css.matchAll(/(\[data-vz="([^"]+)"\]\s+)?\.rl-slide\[data-tela="([^"]+)"\]/g)) {
      const [, escopo, vz, tela] = m;
      if (!escopo) { problemas.push(`tela ${tela} sem escopo de componente`); continue; }
      const lista = donos.get(tela);
      if (lista && !lista.includes(vz)) problemas.push(`tela ${tela} escopada em ${vz}, que não a usa`);
    }
    expect(problemas).toEqual([]);
  });

  it("toda tela compartilhada por mais de um componente tem regra para cada um", () => {
    const donos = donosPorTela();
    const faltando: string[] = [];
    for (const [tela, lista] of donos) {
      if (lista.length < 2) continue;
      for (const vz of lista) {
        const tem = css.includes(`[data-vz="${vz}"] .rl-slide[data-tela="${tela}"]`);
        if (!tem) faltando.push(`${vz} usa a tela ${tela} e não tem regra própria`);
      }
    }
    expect(faltando).toEqual([]);
  });

  it("as consultas de largura que mexem no sistema .rl nomeiam o contêiner do quadro", () => {
    const soltas = blocosContainer()
      .filter((b) => !b.condicao.startsWith("quadro"))
      .filter((b) => /(^|[\s,>])\.rl[-\s.]/.test(b.corpo))
      .map((b) => `linha ${b.linha}: @container ${b.condicao}`);
    expect(soltas).toEqual([]);
  });

  it("a figura do quadro declara o contêiner nomeado", () => {
    const bloco = css.slice(css.indexOf(".rl { --rl-bg:"), css.indexOf(".rl-slide { container-type"));
    expect(bloco).toContain("container-name: quadro");
    expect(bloco).toContain("container-type: inline-size");
  });

  it("nenhuma consulta nomeada quadro escapa do sistema .rl", () => {
    const nomeadas = blocosContainer().filter((b) => b.condicao.startsWith("quadro"));
    expect(nomeadas.length).toBeGreaterThan(5);
  });
});
