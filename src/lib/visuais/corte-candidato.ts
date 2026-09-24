/**
 * Avaliar um corte candidato (capítulo 5, c5p6): o ganho de um corte em três passos, sobre as 16 propostas. Antes, o
 * Gini da raiz; depois, o Gini de cada lado, ponderado pelo tamanho do lado; o ganho é a diferença. Os candidatos são os
 * pontos médios entre valores vizinhos observados. A média simples, sem ponderar, entra só como comparação: é o erro que a
 * ponderação evita. Funções puras; arredondamento só na exibição.
 */
import did from "./did.json";
import { avaliarCorte, cortesCandidatos, NOME_VAR, type Avaliacao, type Variavel } from "./arvore";
import type { Proposta } from "./logistica";
import { fmtNum } from "./metricas";

export { fmtNum, NOME_VAR };
export type { Variavel };

export const BASE = did.base as Proposta[];
export const VARS: Variavel[] = ["util", "atraso"];
export const CORTES: Record<Variavel, number[]> = { util: cortesCandidatos(BASE, "util"), atraso: cortesCandidatos(BASE, "atraso") };

export type Corte = Avaliacao & { nE: number; nD: number; dE: number; dD: number; pesoE: number; pesoD: number; simples: number; ganhoSimples: number };

export function avaliar(v: Variavel, corte: number): Corte {
  const a = avaliarCorte(BASE, v, corte);
  const nE = a.esq.length, nD = a.dir.length, n = BASE.length;
  const simples = (a.giniEsq + a.giniDir) / 2;
  return { ...a, nE, nD, dE: a.esq.filter((r) => r.y).length, dD: a.dir.filter((r) => r.y).length, pesoE: nE / n, pesoD: nD / n, simples, ganhoSimples: a.giniAntes - simples };
}

/** Todos os candidatos das duas variáveis, e o melhor: maior ganho, empate com o primeiro avaliado, como na árvore. */
export const TODOS = VARS.flatMap((v) => CORTES[v].map((c) => avaliar(v, c)));
export const MELHOR = TODOS.reduce((m, a) => (a.ganho > m.ganho + 1e-12 ? a : m));

export const INICIAL = { v: "util" as Variavel, corte: 62.5 };
export const ATALHOS: Record<Variavel, number[]> = { util: [22.5, 27.5, 57.5, 62.5], atraso: [7.5, 15, 27.5] };
export const indiceDe = (v: Variavel, corte: number) => CORTES[v].findIndex((c) => Math.abs(c - corte) < 1e-9);

/** Valor de corte com a unidade: 62,5% na utilização, 15 d no atraso. */
export const fmtCorte = (v: Variavel, c: number) => `${Number.isInteger(c) ? String(c) : fmtNum(c, 1)}${v === "util" ? "%" : " d"}`;
export const NOME_CURTO: Record<Variavel, string> = { util: "Utilização", atraso: "Atraso" };
export const EIXO: Record<Variavel, string> = { util: "utilização, em %", atraso: "atraso, em dias" };

const iguais = (x: number, y: number) => Math.abs(x - y) < 1e-9;

/** Leitura do corte para o painel. */
export function leitura(a: Corte) {
  if (iguais(a.ganho, MELHOR.ganho)) return "O maior ganho de toda a raiz: é este o corte que a árvore escolhe.";
  if (iguais(a.ganho, 0)) return "Ganho zero: os dois lados guardam a mistura da raiz.";
  const puro = [{ n: a.nE, g: a.giniEsq }, { n: a.nD, g: a.giniDir }].find((l) => iguais(l.g, 0));
  if (puro && puro.n <= 2) return `Um lado ficou puro, mas pesa só ${puro.n} em ${BASE.length}: o ganho é pequeno.`;
  return "Ganho positivo, mas há corte melhor: a próxima página testa todos.";
}

/** O que a média simples diria no lugar da ponderada. */
export function comparacaoSimples(a: Corte) {
  if (iguais(a.ganhoSimples, a.ganho)) return `Aqui as duas médias coincidem: sem ponderar, o ganho também seria ${fmtNum(a.ganho, 5)}.`;
  const razao = a.ganho > 1e-9 ? a.ganhoSimples / a.ganho : Infinity;
  if (razao >= 1.5) return `Sem ponderar, o ganho seria ${fmtNum(a.ganhoSimples, 5)}, ${fmtNum(razao, 1)} vezes o correto: o lado de ${Math.min(a.nE, a.nD)} contaria como metade do grupo.`;
  return `Sem ponderar, o ganho seria ${fmtNum(a.ganhoSimples, 5)}, perto do correto, porque os lados têm tamanhos parecidos.`;
}

/** Número com vírgula decimal para o KaTeX, que trataria a vírgula como pontuação. */
export const paraTex = (s: string) => s.replace(",", "{,}");

/** Os dois passos finais da conta, em TeX, com os números do corte; o terceiro é a média simples, quando pedida. */
export function conta(a: Corte) {
  const f = (x: number) => paraTex(fmtNum(x, 5));
  return {
    depois: String.raw`\tfrac{${a.nE}}{${BASE.length}} \times ${f(a.giniEsq)} + \tfrac{${a.nD}}{${BASE.length}} \times ${f(a.giniDir)} = ${f(a.depois)}`,
    ganho: String.raw`${f(a.giniAntes)} - ${f(a.depois)} = \mathbf{${f(a.ganho)}}`,
    simples: String.raw`${f(a.giniAntes)} - \tfrac{${f(a.giniEsq)} + ${f(a.giniDir)}}{2} = ${f(a.ganhoSimples)}`,
  };
}

export const TITULO = "Avaliar um corte candidato";
export const SUBTITULO = "O ganho é a impureza que o corte remove, ponderada pelo tamanho de cada lado.";
export const FORMULAS = [
  { k: "Ganho de um corte", tex: String.raw`\text{ganho} = \mathrm{Gini}_{\text{antes}} - \big(\tfrac{n_e}{n}\,\mathrm{Gini}_e + \tfrac{n_d}{n}\,\mathrm{Gini}_d\big)` },
  { k: "Gini de cada grupo", tex: String.raw`\mathrm{Gini} = 2\,p\,(1-p)` },
] as const;
export const TITULO_REGUA = "Onde cortar?";
export const TITULO_CONTA = "A conta, passo a passo";
export const TITULO_CTL = "Mova o corte";
export const ROTULO_ATALHOS = "Ir para";
export const ROTULO_SIMPLES = "Comparar com a média simples";
export const RODAPE = "A seguir: a disputa pela raiz · e, d: lados do corte";

/** Os três cartões da base; os números vêm das contas, não do texto. */
export function cartoes() {
  const puro = avaliar("util", 22.5), zero = avaliar("util", 27.5);
  return [
    { k: "Pesa o tamanho", t: `Em ${fmtCorte("util", 22.5)}, o lado puro tem ${Math.min(puro.nE, puro.nD)} proposta, peso ${Math.min(puro.nE, puro.nD)}/${BASE.length}: ganho de só ${fmtNum(puro.ganho, 5)}.` },
    { k: "Ganho zero", t: `Em ${fmtCorte("util", 27.5)}, os dois lados seguem ${zero.dE * 2 === zero.nE && zero.dD * 2 === zero.nD ? "meio a meio" : "misturados"}: o corte não informa nada.` },
    { k: "O melhor da raiz", t: `${NOME_CURTO[MELHOR.v]} ≤ ${fmtCorte(MELHOR.v, MELHOR.corte)}, ganho ${fmtNum(MELHOR.ganho, 5)}. A próxima página confere os ${TODOS.length} candidatos.` },
  ];
}
