/**
 * Compositor do deck: divide as unidades de uma página em telas que cabem no palco.
 *
 * Unidades são pedaços indivisíveis (parágrafo, painel, figura, questão). Podem pertencer a um grupo de duas colunas
 * (o `.palcoflex` do material), onde a altura da tela é a da coluna mais alta. Um grupo pode ter uma coluna
 * persistente (a figura), que aparece em todas as telas do grupo enquanto a outra coluna é paginada.
 *
 * Critério: o menor número de telas em que cada tela cabe na altura e não passa do teto de palavras; entre as
 * partições com esse número, a que equilibra melhor as telas (menor carga máxima). Se uma unidade sozinha não
 * cabe, ela vai sozinha e recebe zoom no palco.
 */
export type Unidade = { h: number; w: number; grupo?: number; coluna?: 0 | 1 };
export type Grupo = { persistente?: { coluna: 0 | 1; h: number; w: number } };
export type Opcoes = { altura: number; palavras?: number; gap?: number; maxTelas?: number; ocupacaoMinima?: number; alturaMinima?: number };

/** carga de uma tela com as unidades [i, j): max(altura/teto, palavras/teto) */
export function carga(us: Unidade[], grupos: Record<number, Grupo>, i: number, j: number, o: Opcoes): { h: number; w: number; carga: number } {
  const gap = o.gap ?? 0; const W = o.palavras ?? 150;
  let h = 0, w = 0, n = 0;
  const cols: Record<number, { h: [number, number]; n: [number, number]; max: [number, number] }> = {}; // por grupo, por coluna
  for (let k = i; k < j; k++) {
    const u = us[k];
    if (u.grupo === undefined) { h += u.h + (n ? gap : 0); n++; w += u.w; continue; }
    const c = (cols[u.grupo] ??= { h: [0, 0], n: [0, 0], max: [0, 0] }); const col = u.coluna ?? 0;
    c.h[col] += u.h + (c.n[col] ? gap : 0); c.n[col]++; c.max[col] = Math.max(c.max[col], u.h); w += u.w;
  }
  for (const [g, c] of Object.entries(cols)) {
    const p = grupos[Number(g)]?.persistente;
    if (p) { c.h[p.coluna] = Math.max(c.h[p.coluna], p.h); c.n[p.coluna] = Math.max(1, c.n[p.coluna]); w += p.w; }
    let hg = Math.max(c.h[0], c.h[1]);
    // coluna sozinha na tela com duas ou mais unidades: ganha a largura toda e flui em duas colunas (altura cai pela metade)
    const so: 0 | 1 | null = c.n[0] === 0 ? 1 : c.n[1] === 0 ? 0 : null;
    if (so !== null && c.n[so] >= 2 && !p) hg = Math.max(c.max[so], c.h[so] / 2);
    h += hg + (n ? gap : 0); n++;
  }
  return { h, w, carga: Math.max(h / o.altura, w / W) };
}

/** partição contígua em N telas que minimiza a carga máxima (programação dinâmica) */
function particionar(us: Unidade[], grupos: Record<number, Grupo>, N: number, o: Opcoes): { telas: number[][]; max: number } {
  const n = us.length; const c = Array.from({ length: n + 1 }, () => new Float64Array(n + 1));
  for (let i = 0; i < n; i++) for (let j = i + 1; j <= n; j++) c[i][j] = carga(us, grupos, i, j, o).carga;
  // dp[k][j] = menor carga máxima dividindo as primeiras j unidades em k telas
  const dp = Array.from({ length: N + 1 }, () => new Float64Array(n + 1).fill(Infinity));
  const corte = Array.from({ length: N + 1 }, () => new Int32Array(n + 1));
  dp[0][0] = 0;
  for (let k = 1; k <= N; k++) for (let j = k; j <= n; j++) for (let i = k - 1; i < j; i++) {
    const v = Math.max(dp[k - 1][i], c[i][j]);
    if (v < dp[k][j] - 1e-9) { dp[k][j] = v; corte[k][j] = i; }
  }
  const max = dp[N][n];
  // entre as partições com essa carga máxima (tolerância de 2%), a que deixa a tela mais baixa o mais alta possível
  const h = Array.from({ length: n + 1 }, () => new Float64Array(n + 1));
  for (let i = 0; i < n; i++) for (let j = i + 1; j <= n; j++) h[i][j] = carga(us, grupos, i, j, o).h;
  const eq = Array.from({ length: N + 1 }, () => new Float64Array(n + 1).fill(-Infinity));
  const corte2 = Array.from({ length: N + 1 }, () => new Int32Array(n + 1));
  eq[0][0] = Infinity;
  for (let k = 1; k <= N; k++) for (let j = k; j <= n; j++) for (let i = k - 1; i < j; i++) {
    if (c[i][j] > max + 0.02 || eq[k - 1][i] === -Infinity) continue;
    const v = Math.min(eq[k - 1][i], h[i][j]);
    if (v > eq[k][j] + 1e-9) { eq[k][j] = v; corte2[k][j] = i; }
  }
  const usar = eq[N][n] > -Infinity ? corte2 : corte;
  const telas: number[][] = []; let j = n;
  for (let k = N; k >= 1; k--) { const i = usar[k][j]; telas.unshift(Array.from({ length: j - i }, (_, t) => i + t)); j = i; }
  return { telas, max };
}

export function paginar(us: Unidade[], grupos: Record<number, Grupo>, o: Opcoes): number[][] {
  const n = us.length; if (!n) return [];
  // menor número de telas que cabe (primeiro que couber, contíguo)
  let nMin = 1; let ini = 0;
  for (let j = 1; j <= n; j++) if (j - ini > 1 && carga(us, grupos, ini, j, o).h > o.altura) { nMin++; ini = j - 1; }
  const limite = Math.min(n, o.maxTelas ?? 6);
  let melhor = particionar(us, grupos, Math.min(nMin, limite), o);
  for (let N = Math.min(nMin, limite) + 1; N <= limite && melhor.max > 1; N++) {
    const cand = particionar(us, grupos, N, o);
    if (cand.max > melhor.max - 0.02) break; // dividir mais não melhora: uma unidade sozinha já estoura
    // dividir por palavras só vale se nenhuma tela ficar rala: ocupação média de 40% e mínima de 30% antes do zoom
    const alturas = cand.telas.map((t) => carga(us, grupos, t[0], t[t.length - 1] + 1, o).h);
    const media = alturas.reduce((s, h) => s + h, 0) / N;
    if (media < (o.ocupacaoMinima ?? 0.4) * o.altura || Math.min(...alturas) < (o.alturaMinima ?? 0.3) * o.altura) break;
    melhor = cand;
  }
  return melhor.telas;
}
