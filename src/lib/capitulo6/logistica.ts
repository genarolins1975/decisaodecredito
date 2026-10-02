/**
 * Logística sem penalidade com intercepto, por Newton (IRLS), para a referência linear do capítulo 6: as mesmas três
 * variáveis do boosting, ajustadas na mesma amostra. Conferida contra o Logit do statsmodels.
 */
import type { Matriz, Vetor } from "./gbm";
import { sigmoide } from "./gbm";

function resolver(A: number[][], b: number[]): number[] {
  const n = b.length, M = A.map((l, i) => [...l, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((l, i) => l[n] / l[i]);
}

/** Coeficientes [β₀, β₁, …] da logística de y em [1, X]. */
export function ajustarLogistica(X: Matriz, y: Vetor, iter = 100): number[] {
  const k = X[0].length + 1; let b = new Array(k).fill(0);
  for (let it = 0; it < iter; it++) {
    const H = Array.from({ length: k }, () => new Array(k).fill(0)), g = new Array(k).fill(0);
    for (let i = 0; i < y.length; i++) {
      const z = [1, ...X[i]]; const p = sigmoide(z.reduce((s, v, j) => s + v * b[j], 0)); const w = p * (1 - p);
      for (let a = 0; a < k; a++) { g[a] += (y[i] - p) * z[a]; for (let c = 0; c < k; c++) H[a][c] += w * z[a] * z[c]; }
    }
    const d = resolver(H, g); b = b.map((v, j) => v + d[j]);
    if (Math.max(...d.map(Math.abs)) < 1e-13) break;
  }
  return b;
}
export const escoreLogistica = (b: Vetor, x: Vetor) => b[0] + x.reduce((s, v, j) => s + v * b[j + 1], 0);
