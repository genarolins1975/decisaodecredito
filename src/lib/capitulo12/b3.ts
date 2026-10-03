/**
 * Cálculos do bloco 3 do capítulo 12 (ensembles), derivados de dados.ts e metricas.ts: os erros de cada modelo nos 125
 * pontos de teste das luas (das strings de previsão gravadas pela referência), a sobreposição dos erros dos três
 * votantes, a amostra de um preditor no bagging ou no pasting (sorteio com semente, mulberry32), as etapas do boosting
 * da aula e a escala dos números de cada slide. Funções puras, sem React.
 */
import { BOOST, LUAS, N_TESTE_LUAS, N_TREINO_LUAS, type ModeloLua } from "./dados";
import { boosting, preve } from "./metricas";
import { mulberry32 } from "../capitulo7/metricas";

/* ------------------------------------------------------------------ erros no teste das luas */

export const Y_TESTE = LUAS.teste.y;
/** Índices dos pontos de teste em que a previsão gravada difere do rótulo. */
export const errosDe = (pred: string) => Y_TESTE.flatMap((v, i) => (Number(pred[i]) === v ? [] : [i]));
export const MODELOS = Object.keys(LUAS.modelos) as ModeloLua[];
export const ERROS = Object.fromEntries(MODELOS.map((k) => [k, errosDe(LUAS.modelos[k].pred)])) as Record<ModeloLua, number[]>;
/** Um acerto no teste vale 1 ÷ 125 da acurácia (0,8 ponto percentual). */
export const UM_ACERTO = 1 / N_TESTE_LUAS;

/**
 * Sobreposição dos erros dos três votantes isolados (logística, floresta de 10 árvores, SVC): para cada ponto de teste,
 * quantos dos três erram. A maioria de três erra exatamente onde dois ou três erram; o esperado sob independência usa
 * as taxas de erro observadas de cada um (Poisson binomial).
 */
export const TRES: ModeloLua[] = ["lr", "rf10", "svc"];
export function sobreposicao(modelos: ModeloLua[] = TRES) {
  const n = N_TESTE_LUAS;
  const quantos = Y_TESTE.map((_, i) => modelos.filter((m) => ERROS[m].includes(i)).length);
  const taxas = modelos.map((m) => ERROS[m].length / n);
  // distribuição do número de erros num ponto se os três errassem de forma independente
  let dist = [1];
  for (const q of taxas) { const nova = new Array<number>(dist.length + 1).fill(0); dist.forEach((p, k) => { nova[k] += p * (1 - q); nova[k + 1] += p * q; }); dist = nova; }
  const conta = (k: number) => quantos.filter((v) => v === k).length;
  return {
    quantos, nenhum: conta(0), um: conta(1), dois: conta(2), tres: conta(3), algum: n - conta(0),
    esperadoTres: n * dist[3], esperadoMaioria: n * (dist[2] + dist[3]),
  };
}
export const SOBRE = sobreposicao();
/** Conferência: o hard voting gravado erra exatamente onde dois ou três dos votantes erram. */
const maioriaErra = SOBRE.quantos.flatMap((q, i) => (q >= 2 ? [i] : []));
if (maioriaErra.length !== ERROS.hard.length || maioriaErra.some((v, i) => v !== ERROS.hard[i])) throw new Error("b3: o hard voting deveria errar onde a maioria dos três erra");

/* ------------------------------------------------------------------ amostra de um preditor */

/**
 * Amostra de um preditor entre m instâncias, k sorteios: quantas vezes cada instância saiu. Bagging sorteia com
 * reposição (índice ⌊u·m⌋ a cada uniforme); pasting sorteia sem reposição (Fisher e Yates parcial), e por isso k ≤ m.
 */
export function amostraPreditor(m: number, k: number, semente: number, reposicao: boolean): number[] {
  const r = mulberry32(semente), c = new Array<number>(m).fill(0);
  if (reposicao) { for (let j = 0; j < k; j++) c[Math.min(m - 1, Math.floor(r() * m))]++; return c; }
  const idx = Array.from({ length: m }, (_, i) => i);
  for (let j = 0; j < Math.min(k, m); j++) { const t = j + Math.min(m - j - 1, Math.floor(r() * (m - j))); [idx[j], idx[t]] = [idx[t], idx[j]]; c[idx[j]] = 1; }
  return c;
}

/* ------------------------------------------------------------------ boosting da aula */

/** As três árvores da aula (η = 1, profundidade 2) e o alvo de cada etapa: y, y2 = y − h₁(x), y3 = y2 − h₂(x). */
export const ETAPAS = boosting(BOOST.x, BOOST.y, 3, 1);
export const alvoDaEtapa = (k: number) => BOOST.y.map((v, i) => v - ETAPAS.arvores.slice(0, k - 1).reduce<number>((s, h) => s + preve(h, BOOST.x[i]), 0));
/** Grade de 201 pontos de −0,5 a 0,5, a mesma em que a referência gravou as previsões. */
export const XS = Array.from({ length: 201 }, (_, i) => -0.5 + i / 200);

/* ------------------------------------------------------------------ escalas */

export const N_TREINO = N_TREINO_LUAS, N_TESTE = N_TESTE_LUAS;
