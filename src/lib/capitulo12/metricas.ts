/**
 * Núcleo numérico do capítulo 12 (classificação e ensembles): matriz de confusão e as métricas que saem dela, curvas
 * por limiar a partir do histograma de scores, voto por maioria, curvas ROC binormais, fração fora da amostra
 * bootstrap, peso de evidência e valor da informação, e o gradient boosting de árvores rasas em uma variável.
 * Funções puras, sem React, com precisão interna completa (o arredondamento é só da apresentação).
 *
 * Conferido contra scikit-learn, SciPy e NumPy em tests/capitulo12-metricas.test.ts, com a referência gerada por
 * scripts/capitulo12/referencia.py. Denominador zero devolve null, nunca 0 nem NaN.
 */
export type Vetor = readonly number[];
const razao = (a: number, b: number) => (b ? a / b : null);

/* ------------------------------------------------------------------ matriz de confusão */

export type Confusao = { vp: number; fp: number; fn: number; vn: number };
export type Metricas = Confusao & {
  n: number; positivos: number; negativos: number; previstosPositivos: number;
  acuracia: number; precisao: number | null; recall: number | null; f1: number | null; fpr: number | null; especificidade: number | null; prevalencia: number;
};
/** Métricas da matriz, com a classe positiva como a que se quer detectar (o 5 no MNIST, o mau pagador no crédito). */
export function metricas({ vp, fp, fn, vn }: Confusao): Metricas {
  const n = vp + fp + fn + vn, positivos = vp + fn, negativos = fp + vn;
  return {
    vp, fp, fn, vn, n, positivos, negativos, previstosPositivos: vp + fp,
    acuracia: (vp + vn) / n, precisao: razao(vp, vp + fp), recall: razao(vp, positivos),
    f1: razao(2 * vp, 2 * vp + fp + fn), fpr: razao(fp, negativos), especificidade: razao(vn, negativos), prevalencia: positivos / n,
  };
}
/** Modelo que nunca diz positivo: acerta todos os negativos e nenhum positivo. */
export const trivial = (positivos: number, negativos: number) => metricas({ vp: 0, fp: 0, fn: positivos, vn: negativos });

export const mediaHarmonica = (p: number, r: number) => (p + r > 0 ? (2 * p * r) / (p + r) : 0);
export const mediaSimples = (p: number, r: number) => (p + r) / 2;

/* ------------------------------------------------------------------ histograma de scores */

/**
 * Histograma de scores por classe: `bordas` crescentes (k + 1 valores) e, para cada faixa [borda_i, borda_i+1), quantos
 * positivos e quantos negativos caíram nela. A regra é prever positivo quando score ≥ limiar; num limiar que é borda,
 * a contagem é exata (é como a referência foi gravada).
 */
export type Histograma = { bordas: Vetor; pos: Vetor; neg: Vetor };

/** Matriz no limiar t, que precisa ser uma borda do histograma (o índice da borda é procurado). */
export function confusaoNoIndice(h: Histograma, i: number): Confusao {
  let vp = 0, fp = 0, P = 0, N = 0;
  for (let k = 0; k < h.pos.length; k++) { P += h.pos[k]; N += h.neg[k]; if (k >= i) { vp += h.pos[k]; fp += h.neg[k]; } }
  return { vp, fp, fn: P - vp, vn: N - fp };
}
export function indiceDaBorda(h: Histograma, t: number): number {
  let melhor = 0, dist = Infinity;
  h.bordas.forEach((b, i) => { const d = Math.abs(b - t); if (d < dist) { dist = d; melhor = i; } });
  return melhor;
}
export const confusaoNoLimiar = (h: Histograma, t: number) => confusaoNoIndice(h, indiceDaBorda(h, t));

export type PontoCurva = { i: number; limiar: number; vp: number; fp: number; tpr: number; fpr: number; precisao: number | null; recall: number };
/** Um ponto por borda, do limiar mais baixo (tudo positivo) ao mais alto (nada positivo). */
export function curvaPorLimiar(h: Histograma): PontoCurva[] {
  const P = h.pos.reduce((a, b) => a + b, 0), N = h.neg.reduce((a, b) => a + b, 0);
  const out: PontoCurva[] = []; let vp = P, fp = N;
  for (let i = 0; i < h.bordas.length; i++) {
    out.push({ i, limiar: h.bordas[i], vp, fp, tpr: vp / P, fpr: fp / N, precisao: razao(vp, vp + fp), recall: vp / P });
    if (i < h.pos.length) { vp -= h.pos[i]; fp -= h.neg[i]; }
  }
  return out;
}
/**
 * AUC pelo histograma: pares (positivo, negativo) em que o positivo está numa faixa acima, mais meio ponto para os que
 * dividem a faixa. Difere da AUC exata só pelos pares dentro da mesma faixa (no MNIST, menos de 0,001).
 */
export function aucHistograma(h: Histograma): number {
  const P = h.pos.reduce((a, b) => a + b, 0), N = h.neg.reduce((a, b) => a + b, 0);
  let negAbaixo = 0, s = 0;
  for (let k = 0; k < h.pos.length; k++) { s += h.pos[k] * (negAbaixo + 0.5 * h.neg[k]); negAbaixo += h.neg[k]; }
  return s / (P * N);
}
/** Limiar de menor custo total entre as bordas: custo = cFn × FN + cFp × FP. */
export function limiarDeMenorCusto(h: Histograma, cFn: number, cFp: number) {
  let melhor: { i: number; custo: number; c: Confusao } | null = null;
  for (let i = 0; i < h.bordas.length; i++) {
    const c = confusaoNoIndice(h, i); const custo = cFn * c.fn + cFp * c.fp;
    if (!melhor || custo < melhor.custo) melhor = { i, custo, c };
  }
  return melhor!;
}

export const gini = (auc: number) => 2 * auc - 1;
export const aucDoGini = (g: number) => (g + 1) / 2;

/* ------------------------------------------------------------------ voto por maioria */

function logGama(x: number): number {
  // Lanczos (g = 7, n = 9): precisão de cerca de 15 dígitos para x > 0
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGama(1 - x);
  x -= 1; let a = c[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
const logComb = (n: number, k: number) => logGama(n + 1) - logGama(k + 1) - logGama(n - k + 1);
/** P(Binomial(n, p) = k), pela escala logarítmica para n grande. */
export const binomialPmf = (n: number, k: number, p: number) => Math.exp(logComb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
/**
 * Acurácia do voto por maioria de n classificadores independentes, cada um com acerto p: P(mais da metade acerta).
 * n ímpar evita empate. É binom.sf(n // 2, n, p) do SciPy.
 */
export function acertoDaMaioria(n: number, p: number): number {
  let s = 0; for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += binomialPmf(n, k, p);
  return Math.min(1, s);
}
/**
 * Erros que andam juntos (modelo ilustrativo de mistura): com probabilidade ρ os n classificadores copiam um voto comum,
 * que acerta com p; senão votam de forma independente. O acerto do conjunto é ρ·p + (1 − ρ)·maioria(n, p). Com ρ = 1,
 * o conjunto vale um classificador; com ρ = 0, a Lei dos Grandes Números trabalha inteira. Hipótese didática, não
 * medida em nenhum modelo.
 */
export const acertoComCorrelacao = (n: number, p: number, rho: number) => rho * p + (1 - rho) * acertoDaMaioria(n, p);

/* ------------------------------------------------------------------ ROC binormal */

/** Função de distribuição da normal padrão (Cody, via erfc com precisão de cerca de 1e-15). */
export function Phi(x: number): number {
  const z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? 1 - r / 2 : r / 2;
}
/** Inversa da normal padrão (Acklam, refinada por um passo de Newton). */
export function PhiInv(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425; let x: number;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else if (p <= 1 - pl) { const q = p - 0.5, r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  else { const q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const e = Phi(x) - p; return x - e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
}
/** Curva binormal: TPR = Φ(a + b·Φ⁻¹(FPR)); AUC = Φ(a ÷ √(1 + b²)). */
export const tprBinormal = (a: number, b: number, fpr: number) => (fpr <= 0 ? 0 : fpr >= 1 ? 1 : Phi(a + b * PhiInv(fpr)));
export const aucBinormal = (a: number, b: number) => Phi(a / Math.sqrt(1 + b * b));
/** FPR em que duas binormais se cruzam (b diferentes). */
export const cruzamentoBinormal = (a1: number, b1: number, a2: number, b2: number) => Phi((a1 - a2) / (b2 - b1));

/* ------------------------------------------------------------------ bootstrap */

/** Probabilidade de uma instância ficar fora de m sorteios com reposição entre m: (1 − 1/m)^m, que tende a 1/e. */
export const foraDaAmostra = (m: number) => Math.pow(1 - 1 / m, m);

/* ------------------------------------------------------------------ crédito: corte, WoE e IV */

/** Grupo da regra: [contratos, bons, maus]. Contratos podem passar de bons + maus (sem classificação). */
export type Grupo = readonly [number, number, number];
export type Regra = { corte: Grupo; resto: Grupo; iv: number };
export function avaliaCorte(r: Regra) {
  const [nc, bc, mc] = r.corte, [nr, br, mr] = r.resto;
  const B = bc + br, M = mc + mr;
  const g = [bc / B, br / B], b = [mc / M, mr / M];
  const woe = [Math.log(g[0] / b[0]), Math.log(g[1] / b[1])];
  return {
    contratos: nc + nr, classificados: B + M, maus: M, bons: B, taxaMaus: M / (B + M),
    volume: nc / (nc + nr), precisao: mc / (bc + mc), recall: mc / M, mausNoResto: mr / (br + mr),
    woe, iv: (g[0] - b[0]) * woe[0] + (g[1] - b[1]) * woe[1], ivDeclarado: r.iv, semClassificacao: nc + nr - B - M,
  };
}

/* ------------------------------------------------------------------ árvore de regressão e boosting em uma variável */

export type Arvore = { corte: number; esq: Arvore | number; dir: Arvore | number } | number;
const mediaDe = (v: Vetor) => v.reduce((a, b) => a + b, 0) / v.length;
/**
 * Árvore de regressão CART em uma variável, com erro quadrático: em cada nó, o corte no ponto médio entre valores
 * consecutivos que mais reduz a soma dos quadrados; as folhas recebem a média. Mesmo critério de DecisionTreeRegressor.
 */
export function arvoreRegressao(x: Vetor, y: Vetor, profundidade: number): Arvore {
  if (profundidade === 0 || x.length < 2) return mediaDe(y);
  const ord = x.map((_, i) => i).sort((a, b) => x[a] - x[b]);
  const n = ord.length; let sT = 0, qT = 0; for (const i of ord) { sT += y[i]; qT += y[i] * y[i]; }
  let melhor = { ganho: -Infinity, k: -1 }; let sE = 0, qE = 0;
  const sse = (s: number, q: number, m: number) => q - (s * s) / m;
  const pai = sse(sT, qT, n);
  for (let k = 0; k < n - 1; k++) {
    const yi = y[ord[k]]; sE += yi; qE += yi * yi;
    if (x[ord[k]] === x[ord[k + 1]]) continue;
    const g = pai - sse(sE, qE, k + 1) - sse(sT - sE, qT - qE, n - k - 1);
    if (g > melhor.ganho + 1e-12) melhor = { ganho: g, k };
  }
  if (melhor.k < 0) return mediaDe(y);
  const corte = (x[ord[melhor.k]] + x[ord[melhor.k + 1]]) / 2;
  const e = ord.slice(0, melhor.k + 1), d = ord.slice(melhor.k + 1);
  return { corte, esq: arvoreRegressao(e.map((i) => x[i]), e.map((i) => y[i]), profundidade - 1), dir: arvoreRegressao(d.map((i) => x[i]), d.map((i) => y[i]), profundidade - 1) };
}
export function preve(a: Arvore, v: number): number { return typeof a === "number" ? a : preve(v <= a.corte ? a.esq : a.dir, v); }

/**
 * Boosting com perda quadrática, partindo de zero (como na aula): a árvore m ajusta o resíduo y − F_{m−1}(x) e entra na
 * soma multiplicada pela taxa η. Com η = 1 e três árvores, é a sequência tree_reg1, tree_reg2, tree_reg3 da aula.
 */
export function boosting(x: Vetor, y: Vetor, arvores: number, eta = 1, profundidade = 2) {
  const F = new Array<number>(x.length).fill(0); const lista: Arvore[] = []; const mse: number[] = [mediaDe(y.map((v) => v * v))];
  for (let m = 0; m < arvores; m++) {
    const r = y.map((v, i) => v - F[i]);
    const h = arvoreRegressao(x, r, profundidade); lista.push(h);
    for (let i = 0; i < x.length; i++) F[i] += eta * preve(h, x[i]);
    mse.push(mediaDe(y.map((v, i) => (v - F[i]) ** 2)));
  }
  return { arvores: lista, mse, preve: (v: number, ate = lista.length) => lista.slice(0, ate).reduce<number>((s, h) => s + eta * preve(h, v), 0) };
}

/* ------------------------------------------------------------------ utilidades de dados */

/** Pixels de uma imagem 28 × 28 gravados como hexadecimal (dois dígitos por pixel, 0 a 255). */
export const pixels = (hex: string) => Array.from({ length: hex.length / 2 }, (_, i) => parseInt(hex.slice(2 * i, 2 * i + 2), 16));
/** Acertos de um vetor de previsões gravado como texto de 0 e 1, contra os rótulos. */
export const acertos = (pred: string, y: Vetor) => y.reduce((s, v, i) => s + (Number(pred[i]) === v ? 1 : 0), 0);
