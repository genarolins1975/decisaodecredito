/**
 * Gradient boosting de classificação com árvores de regressão, escrito para o capítulo 6 e conferido contra o
 * GradientBoostingClassifier do scikit-learn (loss="log_loss", criterion="friedman_mse") e o TreeExplainer do shap em
 * tests/capitulo6-gbm.test.ts. Funções puras, sem dependência de tela.
 *
 * Algoritmo (Friedman, 2001):
 *   F₀ = log(p̄ ÷ (1 − p̄))                          palpite constante: as log odds da carteira
 *   para m = 1..M:
 *     pᵢ = σ(F(xᵢ)); rᵢ = yᵢ − pᵢ                    pseudo-resíduo: menos o gradiente da log loss em F
 *     árvore de regressão em r (melhor corte por redução do erro quadrático, profundidade e mínimo por folha)
 *     valor da folha = Σ rᵢ ÷ Σ pᵢ(1 − pᵢ)            passo de Newton na folha
 *     F ← F + η · valor da folha
 * A busca de corte segue a do scikit-learn: valores ordenados, corte no ponto médio entre valores distintos, os dois
 * lados com pelo menos o mínimo por folha, melhor melhoria n_e·n_d·(média_e − média_d)²; em empate, o primeiro.
 */
import { betaRegularizada } from "@/lib/capitulo7/metricas";

export type Vetor = readonly number[];
export type Matriz = readonly Vetor[]; // linhas: propostas; colunas: variáveis

export type No =
  | { folha: true; valor: number; n: number; soma: number }
  | { folha: false; variavel: number; corte: number; n: number; esq: No; dir: No };

export type Opcoes = {
  eta: number; arvores: number; profundidade: number; minFolha: number;
  /** fração sorteada sem reposição por árvore (1 = todas); com semente, para o boosting estocástico de Friedman (2002) */
  subamostra?: number; semente?: number;
  /** +1: a PD não pode cair quando a variável sobe; −1: não pode subir; 0 ou ausente: livre */
  monotonia?: readonly number[];
};

export const sigmoide = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
export const logit = (p: number) => Math.log(p / (1 - p));

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

type Ctx = { X: Matriz; r: Vetor; h: Vetor; prof: number; minFolha: number; mono?: readonly number[]; ordem: number[][]; dentro: Uint8Array };

const valorNewton = (s: number, h: number) => (Math.abs(h) < 1e-150 ? 0 : s / h);

/** Melhor corte de um nó (índices marcados em c.dentro), ou null se nenhum respeita o mínimo por folha e a monotonia. */
function melhorCorte(c: Ctx, n: number, total: number, totalH: number) {
  let melhor: { variavel: number; corte: number; ganho: number; ve: number; vd: number } | null = null;
  for (let v = 0; v < c.ordem.length; v++) {
    const ord = c.ordem[v]; let se = 0, he = 0, ne = 0, ant = -1;
    for (const i of ord) {
      if (!c.dentro[i]) continue;
      if (ant >= 0) {
        const xa = c.X[ant][v], xb = c.X[i][v];
        const nd = n - ne;
        if (xb > xa + 1e-7 && ne >= c.minFolha && nd >= c.minFolha) {
          const ganho = ne * nd * (se / ne - (total - se) / nd) ** 2;
          const ve = valorNewton(se, he), vd = valorNewton(total - se, totalH - he);
          const ok = !c.mono || !c.mono[v] || (c.mono[v] > 0 ? ve <= vd : ve >= vd);
          if (ok && (!melhor || ganho > melhor.ganho)) {
            let corte = xa / 2 + xb / 2; if (corte === xb || !Number.isFinite(corte)) corte = xa;
            melhor = { variavel: v, corte, ganho, ve, vd };
          }
        }
      }
      se += c.r[i]; he += c.h[i]; ne++; ant = i;
    }
  }
  return melhor;
}

function crescer(c: Ctx, ids: number[], prof: number, lim: [number, number]): No {
  let soma = 0, somaH = 0; for (const i of ids) { soma += c.r[i]; somaH += c.h[i]; }
  const folha = (): No => ({ folha: true, valor: Math.min(lim[1], Math.max(lim[0], valorNewton(soma, somaH))), n: ids.length, soma });
  if (prof >= c.prof || ids.length < 2 * c.minFolha || ids.length < 2) return folha();
  let ss = 0; for (const i of ids) ss += (c.r[i] - soma / ids.length) ** 2;
  if (ss / ids.length <= 1e-15) return folha();
  for (const i of ids) c.dentro[i] = 1;
  const m = melhorCorte(c, ids.length, soma, somaH);
  for (const i of ids) c.dentro[i] = 0;
  if (!m) return folha();
  const esq: number[] = [], dir: number[] = [];
  for (const i of ids) (c.X[i][m.variavel] <= m.corte ? esq : dir).push(i); // X já em precisão simples
  let le = lim, ld = lim;
  if (c.mono && c.mono[m.variavel]) {
    // limites de Newton para os filhos: o meio entre os dois valores separa as regiões (método dos limites, como no LightGBM)
    const meio = Math.min(lim[1], Math.max(lim[0], (m.ve + m.vd) / 2));
    if (c.mono[m.variavel] > 0) { le = [lim[0], Math.min(lim[1], meio)]; ld = [Math.max(lim[0], meio), lim[1]]; }
    else { le = [Math.max(lim[0], meio), lim[1]]; ld = [lim[0], Math.min(lim[1], meio)]; }
  }
  return { folha: false, variavel: m.variavel, corte: m.corte, n: ids.length, esq: crescer(c, esq, prof + 1, le), dir: crescer(c, dir, prof + 1, ld) };
}

/** As variáveis entram em precisão simples, como no scikit-learn (as árvores convertem X para float32 antes de cortar). */
export function valorArvore(no: No, x: Vetor): number { let a = no; while (!a.folha) a = Math.fround(x[a.variavel]) <= a.corte ? a.esq : a.dir; return a.valor; }

export type Modelo = { f0: number; eta: number; arvores: No[]; opcoes: Opcoes };

/** Ajusta o boosting. Devolve o palpite inicial, a taxa e as árvores (os valores das folhas antes de multiplicar por η). */
export function ajustar(X0: Matriz, y: Vetor, o: Opcoes): Modelo {
  const X = X0.map((l) => l.map(Math.fround));
  const n = y.length; const pbar = y.reduce((s, v) => s + v, 0) / n; const f0 = logit(pbar);
  const F = new Array(n).fill(f0); const arvores: No[] = []; const r = new Array(n), h = new Array(n);
  const sorteio = o.subamostra && o.subamostra < 1 ? mulberry32(o.semente ?? 1) : null;
  const nv = X[0].length; const ordem = Array.from({ length: nv }, (_, v) => Array.from({ length: n }, (_, i) => i).sort((a, b) => X[a][v] - X[b][v] || a - b));
  const dentro = new Uint8Array(n);
  for (let m = 0; m < o.arvores; m++) {
    for (let i = 0; i < n; i++) { const p = sigmoide(F[i]); r[i] = y[i] - p; h[i] = p * (1 - p); }
    let ids = Array.from({ length: n }, (_, i) => i);
    if (sorteio) { const k = Math.max(1, Math.round(n * o.subamostra!)); for (let i = n - 1; i > 0; i--) { const j = Math.floor(sorteio() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } ids = ids.slice(0, k).sort((a, b) => a - b); }
    const arv = crescer({ X, r, h, prof: o.profundidade, minFolha: o.minFolha, mono: o.monotonia, ordem, dentro }, ids, 0, [-Infinity, Infinity]);
    arvores.push(arv);
    for (let i = 0; i < n; i++) F[i] += o.eta * valorArvore(arv, X[i]);
  }
  return { f0, eta: o.eta, arvores, opcoes: o };
}

/** Log odds do modelo com as k primeiras árvores (todas, se k ausente). */
export const escore = (mod: Modelo, x: Vetor, k = mod.arvores.length) => { let f = mod.f0; for (let m = 0; m < k; m++) f += mod.eta * valorArvore(mod.arvores[m], x); return f; };
export const pd = (mod: Modelo, x: Vetor, k?: number) => sigmoide(escore(mod, x, k));

/** Log odds de todas as propostas depois de cada árvore: linha m = modelo com m árvores (m = 0 é o palpite). */
export function estagios(mod: Modelo, X: Matriz): number[][] {
  const F = X.map(() => mod.f0); const out = [F.slice()];
  for (const arv of mod.arvores) { for (let i = 0; i < X.length; i++) F[i] += mod.eta * valorArvore(arv, X[i]); out.push(F.slice()); }
  return out;
}

/** Log loss média de log odds F contra y. */
export const perdaLog = (F: Vetor, y: Vetor) => { let s = 0; for (let i = 0; i < y.length; i++) { const p = Math.min(1 - 1e-15, Math.max(1e-15, sigmoide(F[i]))); s -= y[i] * Math.log(p) + (1 - y[i]) * Math.log(1 - p); } return s / y.length; };

/** AUC pela estatística de Mann e Whitney com postos médios (empates valem meio par). */
export function auc(y: Vetor, s: Vetor): number {
  const ord = s.map((_, i) => i).sort((a, b) => s[a] - s[b]); const posto = new Array(s.length);
  for (let i = 0; i < ord.length;) { let j = i; while (j + 1 < ord.length && s[ord[j + 1]] === s[ord[i]]) j++; const pm = (i + j) / 2 + 1; for (let k = i; k <= j; k++) posto[ord[k]] = pm; i = j + 1; }
  let n1 = 0, sr = 0; for (let i = 0; i < y.length; i++) if (y[i] === 1) { n1++; sr += posto[i]; }
  const n0 = y.length - n1; return (sr - (n1 * (n1 + 1)) / 2) / (n1 * n0);
}

/** Número de folhas e de nós internos de uma árvore. */
export function folhas(no: No): number { return no.folha ? 1 : folhas(no.esq) + folhas(no.dir); }

/* ------------------------------------------------------------------ explicação */

/**
 * Contribuições de Shapley de cada variável para as log odds de uma proposta, com a expectativa condicional pelo
 * caminho da árvore (cobertura de cada ramo), a mesma definição do TreeExplainer (feature_perturbation =
 * "tree_path_dependent"; Lundberg et al., 2020). Com poucas variáveis, a soma sobre os subconjuntos é exata. Soma das
 * contribuições + valor esperado = log odds do modelo.
 */
export function contribuicoes(mod: Modelo, x: Vetor): { base: number; phi: number[] } {
  const nv = x.length; const phi = new Array(nv).fill(0); let base = mod.f0;
  const fat = (k: number) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
  for (const arv of mod.arvores) {
    const E = (S: number) => esperado(arv, x, S);
    base += mod.eta * E(0);
    for (let j = 0; j < nv; j++) {
      let s = 0;
      for (let S = 0; S < 1 << nv; S++) {
        if (S & (1 << j)) continue;
        let k = 0; for (let b = 0; b < nv; b++) if (S & (1 << b)) k++;
        s += (fat(k) * fat(nv - k - 1)) / fat(nv) * (E(S | (1 << j)) - E(S));
      }
      phi[j] += mod.eta * s;
    }
  }
  return { base, phi };
}
/** Valor esperado da árvore fixando as variáveis do conjunto S (máscara de bits) e integrando as outras pela cobertura. */
function esperado(no: No, x: Vetor, S: number): number {
  if (no.folha) return no.valor;
  if (S & (1 << no.variavel)) return esperado(x[no.variavel] <= no.corte ? no.esq : no.dir, x, S);
  return (no.esq.n * esperado(no.esq, x, S) + no.dir.n * esperado(no.dir, x, S)) / no.n;
}

/** Dependência parcial: PD média da carteira X quando a variável v vale cada ponto da grade. */
export function dependenciaParcial(mod: Modelo, X: Matriz, v: number, grade: Vetor): number[] {
  return grade.map((g) => { let s = 0; for (const x of X) { const z = x.slice(); z[v] = g; s += pd(mod, z); } return s / X.length; });
}

/**
 * Importância por ganho, como o feature_importances_ do scikit-learn: em cada nó, a redução do erro quadrático dos
 * pseudo-resíduos daquela árvore, n_e·n_d ÷ n · (média_e − média_d)², somada por variável e normalizada para somar 1.
 * Diz quanto cada variável foi usada para cortar, não quanto pesa numa proposta (para isso, contribuicoes).
 */
export function importanciaGanho(mod: Modelo, X: Matriz, y: Vetor): number[] {
  const F = estagios(mod, X); const imp = new Array(X[0].length).fill(0);
  mod.arvores.forEach((arv, m) => {
    const r = y.map((v, i) => v - sigmoide(F[m][i]));
    const desce = (no: No, ids: number[]) => {
      if (no.folha) return;
      const e: number[] = [], d: number[] = [];
      for (const i of ids) (Math.fround(X[i][no.variavel]) <= no.corte ? e : d).push(i);
      const me = e.reduce((s, i) => s + r[i], 0) / e.length, md = d.reduce((s, i) => s + r[i], 0) / d.length;
      imp[no.variavel] += ((e.length * d.length) / ids.length) * (me - md) ** 2;
      desce(no.esq, e); desce(no.dir, d);
    };
    desce(arv, X.map((_, i) => i));
  });
  const t = imp.reduce((a, b) => a + b, 0); return imp.map((v) => (t > 0 ? v / t : 0));
}

/** Cortes que as árvores fazem na variável v, em ordem crescente (entre dois cortes, a previsão não muda com v). */
export function cortesDe(mod: Modelo, v: number): number[] {
  const c = new Set<number>(); const w = (n: No) => { if (n.folha) return; if (n.variavel === v) c.add(n.corte); w(n.esq); w(n.dir); };
  mod.arvores.forEach(w); return [...c].sort((a, b) => a - b);
}
/**
 * A mesma dependência parcial de dependenciaParcial, calculada uma vez por intervalo entre cortes da variável: pontos da
 * grade no mesmo intervalo têm a mesma previsão em toda proposta, então recebem o mesmo valor.
 */
export function dependenciaParcialRapida(mod: Modelo, X: Matriz, v: number, grade: Vetor): number[] {
  const cs = cortesDe(mod, v); const chave = (g: number) => cs.filter((c) => Math.fround(g) > c).length;
  const rep = new Map<number, number>(); for (const g of grade) if (!rep.has(chave(g))) rep.set(chave(g), g);
  const reps = [...rep.entries()]; const vals = dependenciaParcial(mod, X, v, reps.map(([, g]) => g));
  const por = new Map(reps.map(([k], i) => [k, vals[i]])); return grade.map((g) => por.get(chave(g))!);
}

/**
 * Diferença pareada de log loss entre dois modelos avaliados nas mesmas propostas: a média, proposta a proposta, de
 * (perda do modelo A − perda do modelo B), com o erro padrão da média (desvio padrão amostral ÷ √n) e o intervalo
 * normal de 95%. Positiva: B perde menos. Mede o que a amostra de validação consegue distinguir entre os dois, com as
 * propostas como unidades independentes; não inclui a variação do próprio ajuste (sementes, sorteio do ajuste).
 */
export function diferencaPerdaPareada(Fa: Vetor, Fb: Vetor, y: Vetor): { dif: number; ep: number; ic: [number, number]; n: number } {
  const n = y.length; const d = new Array<number>(n);
  const perda1 = (f: number, yi: number) => { const p = Math.min(1 - 1e-15, Math.max(1e-15, sigmoide(f))); return -(yi * Math.log(p) + (1 - yi) * Math.log(1 - p)); };
  let s = 0; for (let i = 0; i < n; i++) { d[i] = perda1(Fa[i], y[i]) - perda1(Fb[i], y[i]); s += d[i]; }
  const dif = s / n; let q = 0; for (let i = 0; i < n; i++) q += (d[i] - dif) ** 2;
  const ep = Math.sqrt(q / (n - 1) / n), z = 1.959963984540054;
  return { dif, ep, ic: [dif - z * ep, dif + z * ep], n };
}

/**
 * Ganho de perda de vários ajustes (as sementes de uma subamostra) sobre um modelo de referência, nas mesmas propostas:
 * dᵢ = perdaᵢ(referência) − média, sobre os ajustes, de perdaᵢ(ajuste). Devolve a média de dᵢ (igual à log loss da
 * referência menos a média das log loss dos ajustes) e o erro padrão dessa média (desvio padrão amostral de dᵢ ÷ √n).
 * Positivo: os ajustes perdem menos. É a régua da validação para o ganho médio de dez sementes: mede o que n propostas
 * distinguem, com as propostas como unidades independentes; a variação entre sementes fica de fora.
 */
export function ganhoMedioPareado(Fref: Vetor, Fs: readonly Vetor[], y: Vetor): { dif: number; ep: number; n: number } {
  const n = y.length, k = Fs.length; const d = new Array<number>(n);
  const perda1 = (f: number, yi: number) => { const p = Math.min(1 - 1e-15, Math.max(1e-15, sigmoide(f))); return -(yi * Math.log(p) + (1 - yi) * Math.log(1 - p)); };
  let s = 0;
  for (let i = 0; i < n; i++) { let m = 0; for (const F of Fs) m += perda1(F[i], y[i]); d[i] = perda1(Fref[i], y[i]) - m / k; s += d[i]; }
  const dif = s / n; let q = 0; for (let i = 0; i < n; i++) q += (d[i] - dif) ** 2;
  return { dif, ep: Math.sqrt(q / (n - 1) / n), n };
}

/**
 * Função de distribuição da t de Student com gl graus de liberdade, pela beta incompleta regularizada de
 * src/lib/capitulo7/metricas.ts: para t ≥ 0, F(t) = 1 − I_{gl ÷ (gl + t²)}(gl ÷ 2, ½) ÷ 2; simétrica em torno de 0.
 */
export function distribuicaoT(t: number, gl: number): number {
  const cauda = 0.5 * betaRegularizada(gl / (gl + t * t), gl / 2, 0.5);
  return t >= 0 ? 1 - cauda : cauda;
}
/**
 * Quantil da t de Student (o t tal que distribuicaoT(t, gl) = p), por bisseção na distribuição; conferido com
 * scipy.stats.t.ppf em tests/capitulo6-gbm.test.ts. Com p = 0,975 e gl = 9, o multiplicador do intervalo de 95% da
 * média de dez sementes.
 */
export function quantilT(p: number, gl: number): number {
  if (p === 0.5) return 0;
  if (p < 0.5) return -quantilT(1 - p, gl);
  let lo = 0, hi = 1; while (distribuicaoT(hi, gl) < p) { lo = hi; hi *= 2; }
  for (let i = 0; i < 200 && hi - lo > 1e-13 * Math.max(1, hi); i++) { const m = (lo + hi) / 2; if (distribuicaoT(m, gl) < p) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
