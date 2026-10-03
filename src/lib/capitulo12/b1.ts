/**
 * Cálculos puros do bloco 1 do capítulo 12 (classificação): posição de um pixel na imagem 28 × 28 e no vetor de 784,
 * e o pixel de referência que os quadros realçam. Sem React; os números vêm de base.json via dados.ts.
 */
import { MN } from "./dados";
import { pixels } from "./metricas";

export const LADO = MN.lado;
/** Linha e coluna (de 0 a 27) do pixel de índice i (de 0 a 783), na ordem do reshape(28, 28) do NumPy. */
export const posicao = (i: number) => ({ lin: Math.floor(i / LADO), col: i % LADO });
export const indice = (lin: number, col: number) => lin * LADO + col;
const central = (i: number) => { const { lin, col } = posicao(i); return [lin, col].every((c) => c >= LADO / 4 && c < (3 * LADO) / 4); };
/** O pixel mais intenso da região central (linhas e colunas de 7 a 20): o realce não cai na borda da imagem. */
export function pixelCentral(px: string): number {
  const v = pixels(px);
  return v.reduce((m, p, i) => (central(i) && (m < 0 || p > v[m]) ? i : m), -1);
}
