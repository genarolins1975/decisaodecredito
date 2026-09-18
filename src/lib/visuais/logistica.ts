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

/** Odds de uma probabilidade: defaults para cada adimplente. */
export const odds = (p: number) => p / (1 - p);
/** Convenção de escore do curso: desloca e inverte o log odds para que número maior signifique risco menor. */
export const escoreDidatico = (p: number) => Math.round(600 - 90 * logit(p));
/** Perda logarítmica de uma proposta. */
export const perdaIndividual = (p: number, y: number) => -(y ? Math.log(p) : Math.log(1 - p));
/** Inclinação local da curva logística por diferença central (a conta da página c4p7). */
export const inclinacaoLocal = (z: number, dz = 0.1) => (sigmoide(z + dz) - sigmoide(z - dz)) / (2 * dz);
/** Distância euclidiana entre um vetor de coeficientes e os coeficientes de convergência. */
export const distanciaAoOtimo = (beta: readonly number[], alvo: readonly number[] = BETA_AULA) => Math.hypot(beta[0] - alvo[0], beta[1] - alvo[1], beta[2] - alvo[2]);
/** Uma iteração da descida: PD de cada proposta, gradiente e os coeficientes seguintes. */
export function passo(beta: readonly number[], base: Proposta[], eta = PASSO): { p: number[]; g: [number, number, number]; novo: [number, number, number]; perda: number } {
  const p = base.map((b) => sigmoide(escore(beta, b.util, b.atraso).z));
  const g = gradiente(beta, base);
  return { p, g, novo: [beta[0] - eta * g[0], beta[1] - eta * g[1], beta[2] - eta * g[2]], perda: perdaLog(beta, base) };
}
/** Trajetória completa da descida a partir de zero: coeficientes e perda em cada iteração de 0 a n. */
export function trajetoria(base: Proposta[], n = 20000, eta = PASSO): { beta: [number, number, number][]; perda: number[] } {
  let beta: [number, number, number] = [0, 0, 0]; const betas: [number, number, number][] = [beta]; const perdas: number[] = [perdaLog(beta, base)];
  for (let it = 1; it <= n; it++) {
    const g = gradiente(beta, base); beta = [beta[0] - eta * g[0], beta[1] - eta * g[1], beta[2] - eta * g[2]];
    betas.push(beta); perdas.push(perdaLog(beta, base));
  }
  return { beta: betas, perda: perdas };
}
/** Faixas de contagem igual de uma variável: limites, casos, defaults e taxa (a página c4p21). */
export function faixasIguais(x: number[], y: number[], k = 4): { de: number; ate: number; n: number; d: number; taxa: number }[] {
  const ordem = x.map((v, i) => i).sort((a, b) => x[a] - x[b]); const out: { de: number; ate: number; n: number; d: number; taxa: number }[] = [];
  for (let f = 0; f < k; f++) {
    const ini = Math.floor((f * ordem.length) / k), fim = Math.floor(((f + 1) * ordem.length) / k); const ids = ordem.slice(ini, fim);
    const d = ids.reduce((s, i) => s + y[i], 0);
    out.push({ de: x[ids[0]], ate: x[ids[ids.length - 1]], n: ids.length, d, taxa: d / ids.length });
  }
  return out;
}
/** Logística de uma variável por Newton (IRLS): intercepto e inclinação por unidade de x. Poucas iterações bastam. */
export function logisticaNewton(x: number[], y: number[], iteracoes = 25): [number, number] {
  let a = Math.log((y.reduce((s, v) => s + v, 0) + 0.5) / (y.length - y.reduce((s, v) => s + v, 0) + 0.5)), b = 0;
  for (let it = 0; it < iteracoes; it++) {
    let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
    for (let i = 0; i < x.length; i++) { const p = sigmoide(a + b * x[i]), r = p - y[i], w = p * (1 - p); g0 += r; g1 += r * x[i]; h00 += w; h01 += w * x[i]; h11 += w * x[i] * x[i]; }
    const det = h00 * h11 - h01 * h01; if (Math.abs(det) < 1e-12) break;
    const da = (h11 * g0 - h01 * g1) / det, db = (h00 * g1 - h01 * g0) / det; a -= da; b -= db;
    if (Math.abs(da) + Math.abs(db) < 1e-10) break;
  }
  return [a, b];
}
