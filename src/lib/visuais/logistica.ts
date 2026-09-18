/**
 * Regressão logística do capítulo 4 em funções puras, sobre as 16 propostas didáticas (src/lib/visuais/did.json):
 * escalas (probabilidade, odds, log odds), escore como soma ponderada, descida de gradiente com passo 0,1 e a reta de
 * mínimos quadrados da página c4p2. Conferido contra o gerador em tests/visuais.test.ts.
 */
export const sigmoide = (z: number) => 1 / (1 + Math.exp(-z));
export const logit = (p: number) => Math.log(p / (1 - p));
export type Proposta = { id: number; util: number; atraso: number; y: number };
/** Coeficientes de convergência da aula (intercepto, utilização em dezenas de pontos, atraso em dezenas de dias). */
export const BETA_AULA = [-5.66657, 0.7453, 1.3955] as const;
export const PASSO = 0.1;

/** Escore em log odds de uma proposta: soma ponderada e nada além disso. */
export function escore(beta: readonly number[], util: number, atraso: number): { intercepto: number; util: number; atraso: number; z: number } {
  const cu = beta[1] * (util / 10), ca = beta[2] * (atraso / 10);
  return { intercepto: beta[0], util: cu, atraso: ca, z: beta[0] + cu + ca };
}
/** Perda logarítmica média de um vetor de coeficientes na base. */
export function perdaLog(beta: readonly number[], base: Proposta[]): number {
  let s = 0;
  for (const b of base) { const p = sigmoide(escore(beta, b.util, b.atraso).z); s += -(b.y * Math.log(p) + (1 - b.y) * Math.log(1 - p)); }
  return s / base.length;
}
/** Gradiente: cada componente é a média de (p − y) vezes a variável correspondente. */
export function gradiente(beta: readonly number[], base: Proposta[]): [number, number, number] {
  const g: [number, number, number] = [0, 0, 0];
  for (const b of base) { const r = sigmoide(escore(beta, b.util, b.atraso).z) - b.y; g[0] += r; g[1] += r * (b.util / 10); g[2] += r * (b.atraso / 10); }
  return [g[0] / base.length, g[1] / base.length, g[2] / base.length];
}
/** Descida de gradiente a partir de zero, devolvendo os coeficientes e a perda nas iterações pedidas (ordenadas). */
export function descida(base: Proposta[], marcas: number[], passo = PASSO): { it: number; beta: [number, number, number]; perda: number }[] {
  let beta: [number, number, number] = [0, 0, 0]; const out: { it: number; beta: [number, number, number]; perda: number }[] = [];
  const ultimo = marcas[marcas.length - 1]; let k = 0;
  for (let it = 0; it <= ultimo; it++) {
    while (k < marcas.length && marcas[k] === it) { out.push({ it, beta: [...beta] as [number, number, number], perda: perdaLog(beta, base) }); k++; }
    if (it === ultimo) break;
    const g = gradiente(beta, base); beta = [beta[0] - passo * g[0], beta[1] - passo * g[1], beta[2] - passo * g[2]];
  }
  return out;
}
/** Fronteira PD = corte no plano (utilização em %, atraso em dias): atraso = (logit(corte) − β0 − β1·u/10) · 10 / β2. */
export function atrasoNaFronteira(beta: readonly number[], corte: number, util: number): number {
  return ((logit(corte) - beta[0] - beta[1] * (util / 10)) * 10) / beta[2];
}
/** Mínimos quadrados de y sobre a utilização (a reta que quebra): intercepto e inclinação por ponto de utilização. */
export function retaMinimosQuadrados(base: Proposta[]): { a: number; b: number } {
  const n = base.length; const mu = base.reduce((s, p) => s + p.util, 0) / n; const my = base.reduce((s, p) => s + p.y, 0) / n;
  const b = base.reduce((s, p) => s + (p.util - mu) * (p.y - my), 0) / base.reduce((s, p) => s + (p.util - mu) ** 2, 0);
  return { a: my - b * mu, b };
}
/** Logística só com utilização, ajustada aqui por descida de gradiente (passo 0,1, 50.000 iterações). */
export function logisticaSoUtil(base: Proposta[], iteracoes = 50000, passo = PASSO): [number, number] {
  let c: [number, number] = [0, 0];
  for (let it = 0; it < iteracoes; it++) {
    let g0 = 0, g1 = 0;
    for (const b of base) { const r = sigmoide(c[0] + c[1] * (b.util / 10)) - b.y; g0 += r; g1 += r * (b.util / 10); }
    c = [c[0] - (passo * g0) / base.length, c[1] - (passo * g1) / base.length];
  }
  return c;
}
