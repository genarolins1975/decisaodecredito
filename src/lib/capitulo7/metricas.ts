/**
 * Núcleo numérico do capítulo 7: ordenação, decisão por corte, calibração, perdas probabilísticas, recalibração e
 * incerteza. Funções puras, sem React, com precisão interna completa (o arredondamento é só da apresentação).
 *
 * Convenções do capítulo: y = 1 é default; PD maior é risco maior; a fila é decrescente em PD; a regra de decisão
 * recusa quando PD ≥ t. Conferido contra scikit-learn 1.9.1, statsmodels 0.15.0 e SciPy 1.17.1 em
 * tests/capitulo7-metricas.test.ts, com a referência gerada por scripts/capitulo7/referencia.py.
 *
 * Casos de borda com comportamento definido: denominador zero devolve null (nunca 0 nem NaN); faixa vazia não vira
 * taxa zero (obs null); amostra sem uma das classes devolve AUC null; empates valem meio ponto; o log loss usa
 * EPS_LOG só para estabilidade numérica e declara quantas previsões foram limitadas.
 */
export type Vetor = readonly number[];

export const EPS_LOG = 1e-15;
/** quantil 97,5% da normal padrão (o mesmo valor que statsmodels usa para 95%) */
export const Z95 = 1.959963984540054;

export const soma = (v: Vetor) => { let s = 0; for (const x of v) s += x; return s; };
export const media = (v: Vetor) => (v.length ? soma(v) / v.length : null);
export const sigmoide = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
export const logit = (p: number) => Math.log(p / (1 - p));
const razao = (a: number, b: number) => (b ? a / b : null);

/* ------------------------------------------------------------------ ordenação */

/** Índices da fila, do maior risco para o menor; empates mantêm a ordem da base (ordenação estável). */
export function fila(pd: Vetor): number[] {
  return pd.map((_, i) => i).sort((a, b) => pd[b] - pd[a] || a - b);
}

export type Contagem = { auc: number | null; corretos: number; empates: number; invertidos: number; nDefaults: number; nAdimplentes: number; pares: number };
/**
 * AUC como proporção de pares (default, adimplente) em que o default recebeu PD maior, com meio ponto por empate.
 * Varre a fila agrupando PDs iguais: O(n log n). Sem uma das classes, a AUC não existe (null).
 */
export function aucPorPares(y: Vetor, pd: Vetor): Contagem {
  const ord = fila(pd); const n1 = soma(y), n0 = y.length - n1;
  let corretos = 0, empates = 0, adimplentesAbaixo = n0;
  for (let i = 0; i < ord.length;) {
    let j = i, d = 0, g = 0;
    while (j < ord.length && pd[ord[j]] === pd[ord[i]]) { if (y[ord[j]] === 1) d++; else g++; j++; }
    adimplentesAbaixo -= g; corretos += d * adimplentesAbaixo; empates += d * g; i = j;
  }
  const pares = n1 * n0;
  return { auc: pares ? (corretos + 0.5 * empates) / pares : null, corretos, empates, invertidos: pares - corretos - empates, nDefaults: n1, nAdimplentes: n0, pares };
}

export type Par = { d: number; a: number; estado: "correto" | "empate" | "invertido" };
/** Todos os pares de uma base pequena, linha a linha (defaults) e coluna a coluna (adimplentes). */
export function paresDetalhados(y: Vetor, pd: Vetor): Par[] {
  const ds = y.map((v, i) => (v ? i : -1)).filter((i) => i >= 0), as = y.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const out: Par[] = [];
  for (const d of ds) for (const a of as) out.push({ d, a, estado: pd[d] > pd[a] ? "correto" : pd[d] === pd[a] ? "empate" : "invertido" });
  return out;
}

export type PontoRoc = { limiar: number; recusados: number; vp: number; fp: number; tpr: number; fpr: number };
/**
 * Curva ROC com um ponto por limiar distinto (recusar quem tem PD ≥ limiar), do mais exigente ao menos exigente,
 * começando em (0, 0) sem nenhuma recusa. Empates entram juntos no mesmo ponto, como em roc_curve do scikit-learn
 * com drop_intermediate=False.
 */
export function curvaRoc(y: Vetor, pd: Vetor): PontoRoc[] {
  const ord = fila(pd); const n1 = soma(y), n0 = y.length - n1;
  const pts: PontoRoc[] = [{ limiar: Infinity, recusados: 0, vp: 0, fp: 0, tpr: 0, fpr: 0 }];
  let vp = 0, fp = 0;
  for (let i = 0; i < ord.length;) {
    let j = i;
    while (j < ord.length && pd[ord[j]] === pd[ord[i]]) { if (y[ord[j]] === 1) vp++; else fp++; j++; }
    pts.push({ limiar: pd[ord[i]], recusados: j, vp, fp, tpr: n1 ? vp / n1 : 0, fpr: n0 ? fp / n0 : 0 }); i = j;
  }
  return pts;
}
/** Área sob a ROC pela regra do trapézio; coincide com a contagem de pares (o empate vira o segmento diagonal). */
export function areaTrapezio(pts: { x: number; y: number }[]): number {
  let a = 0; for (let k = 1; k < pts.length; k++) a += (pts[k].x - pts[k - 1].x) * (pts[k].y + pts[k - 1].y) / 2; return a;
}

export type Ks = { ks: number; limiar: number; recusados: number; tpr: number; fpr: number };
/** KS: maior TPR − FPR ao longo dos limiares, isto é, a maior distância entre as acumuladas dos dois desfechos. */
export function ks(y: Vetor, pd: Vetor): Ks {
  let m: Ks = { ks: 0, limiar: Infinity, recusados: 0, tpr: 0, fpr: 0 };
  for (const p of curvaRoc(y, pd)) { const v = p.tpr - p.fpr; if (v > m.ks) m = { ks: v, limiar: p.limiar, recusados: p.recusados, tpr: p.tpr, fpr: p.fpr }; }
  return m;
}

/* ------------------------------------------------------------- decisão por corte */

export type Confusao = {
  corte: number; n: number; vp: number; fp: number; fn: number; vn: number;
  /** recall: defaults recusados ÷ defaults */ sensibilidade: number | null;
  /** adimplentes aprovados ÷ adimplentes */ especificidade: number | null;
  /** precisão: defaults entre os recusados */ precisao: number | null;
  acuracia: number | null; prevalencia: number | null; taxaRecusa: number | null;
  /** default observado entre os aprovados */ defaultAprovados: number | null;
};
/** Matriz de confusão da regra "recusar quando PD ≥ corte". Positivo = default previsto = recusado. */
export function confusao(y: Vetor, pd: Vetor, corte: number): Confusao {
  let vp = 0, fp = 0, fn = 0, vn = 0;
  for (let i = 0; i < y.length; i++) { const rec = pd[i] >= corte; if (rec) { if (y[i]) vp++; else fp++; } else if (y[i]) fn++; else vn++; }
  const n = y.length;
  return { corte, n, vp, fp, fn, vn, sensibilidade: razao(vp, vp + fn), especificidade: razao(vn, vn + fp), precisao: razao(vp, vp + fp), acuracia: razao(vp + vn, n), prevalencia: razao(vp + fn, n), taxaRecusa: razao(vp + fp, n), defaultAprovados: razao(fn, fn + vn) };
}

export type Ganho = { q: number; examinados: number; capturados: number; defaults: number; ganho: number | null; lift: number | null; taxaGrupo: number | null; taxaMedia: number | null };
/**
 * Ganho acumulado ao examinar a fração q da fila, dos piores para os melhores: k = ⌊q·n + ½⌋ posições
 * (desempate pela ordem da base). Lift acumulado = ganho ÷ fração examinada = taxa do grupo ÷ taxa média.
 */
export function ganho(y: Vetor, pd: Vetor, q: number, ord = fila(pd)): Ganho {
  const n = y.length, k = Math.floor(q * n + 0.5), D = soma(y);
  let c = 0; for (let i = 0; i < k; i++) c += y[ord[i]];
  const taxaMedia = razao(D, n), taxaGrupo = razao(c, k);
  return { q: n ? k / n : 0, examinados: k, capturados: c, defaults: D, ganho: razao(c, D), lift: taxaGrupo !== null && taxaMedia ? taxaGrupo / taxaMedia : null, taxaGrupo, taxaMedia };
}
/** Curva de ganho completa: um ponto por posição da fila (k/n, capturados/D). */
export function curvaGanho(y: Vetor, pd: Vetor, ord = fila(pd)): { x: number; y: number }[] {
  const n = y.length, D = soma(y); const pts = [{ x: 0, y: 0 }]; let c = 0;
  for (let k = 0; k < n; k++) { c += y[ord[k]]; pts.push({ x: (k + 1) / n, y: D ? c / D : 0 }); }
  return pts;
}
/** Lift de uma faixa da fila (posições de q1 a q2): taxa da faixa ÷ taxa média. */
export function liftFaixa(y: Vetor, pd: Vetor, q1: number, q2: number, ord = fila(pd)) {
  const n = y.length, k1 = Math.floor(q1 * n + 0.5), k2 = Math.floor(q2 * n + 0.5); let c = 0;
  for (let i = k1; i < k2; i++) c += y[ord[i]];
  const taxa = razao(c, k2 - k1), tm = razao(soma(y), n);
  return { n: k2 - k1, defaults: c, taxa, lift: taxa !== null && tm ? taxa / tm : null };
}

export type PontoPR = { limiar: number; recall: number; precisao: number; recusados: number };
/** Precisão e recall por limiar distinto (mesmos limiares da ROC, sem o ponto inicial). */
export function curvaPR(y: Vetor, pd: Vetor): PontoPR[] {
  const n1 = soma(y);
  return curvaRoc(y, pd).slice(1).map((p) => ({ limiar: p.limiar, recusados: p.recusados, recall: n1 ? p.vp / n1 : 0, precisao: p.vp / p.recusados }));
}
/**
 * Precisão média (AP) como em average_precision_score do scikit-learn: soma de (Rₖ − Rₖ₋₁) × Pₖ nos limiares
 * distintos. Não é a área trapezoidal sob a curva PR, que interpola a precisão linearmente e costuma ser otimista.
 */
export function precisaoMedia(y: Vetor, pd: Vetor): number | null {
  if (!soma(y)) return null;
  let ap = 0, r0 = 0; for (const p of curvaPR(y, pd)) { ap += (p.recall - r0) * p.precisao; r0 = p.recall; } return ap;
}

/* ------------------------------------------------------------------- calibração */

export type Intervalo = { p: number; lo: number; hi: number };
/** Intervalo de Wilson (1927) para uma proporção binomial; n = 0 não tem intervalo (null). */
export function wilson(d: number, n: number, z = Z95): Intervalo | null {
  if (!n) return null;
  const p = d / n, z2 = z * z, den = 1 + z2 / n, centro = (p + z2 / (2 * n)) / den, meia = (z / den) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return { p, lo: Math.max(0, centro - meia), hi: Math.min(1, centro + meia) };
}
/** Intervalo pela aproximação normal (Wald), só para mostrar por que ele falha com n pequeno ou proporção baixa. */
export function wald(d: number, n: number, z = Z95): Intervalo | null {
  if (!n) return null; const p = d / n, m = z * Math.sqrt((p * (1 - p)) / n); return { p, lo: p - m, hi: p + m };
}

export type Faixa = { j: number; n: number; d: number; somaPd: number; pdMedia: number | null; obs: number | null; ic: Intervalo | null; de: number; ate: number; compativel: boolean | null };
const fechaFaixa = (j: number, ids: number[], y: Vetor, pd: Vetor, de: number, ate: number): Faixa => {
  let d = 0, s = 0; for (const i of ids) { d += y[i]; s += pd[i]; }
  const ic = wilson(d, ids.length); const pm = ids.length ? s / ids.length : null;
  return { j, n: ids.length, d, somaPd: s, pdMedia: pm, obs: ids.length ? d / ids.length : null, ic, de, ate, compativel: ic && pm !== null ? pm >= ic.lo && pm <= ic.hi : null };
};
/**
 * Faixas de mesmo tamanho pela posição na fila crescente de PD (decis quando k = 10): a faixa j reúne as posições de
 * ⌊j·n/k + ½⌋ a ⌊(j+1)·n/k + ½⌋, com desempate pela ordem da base. As fronteiras podem diferir em um caso das faixas do
 * gerador do curso (DADOS.calib), que usa outra regra de arredondamento; os números do capítulo saem todos daqui.
 */
export function faixasQuantis(y: Vetor, pd: Vetor, k: number): Faixa[] {
  const asc = pd.map((_, i) => i).sort((a, b) => pd[a] - pd[b] || a - b); const n = pd.length;
  const borda = (j: number) => Math.floor((j * n) / k + 0.5);
  return Array.from({ length: k }, (_, j) => { const ids = asc.slice(borda(j), borda(j + 1)); return fechaFaixa(j + 1, ids, y, pd, ids.length ? pd[ids[0]] : NaN, ids.length ? pd[ids[ids.length - 1]] : NaN); });
}
/**
 * Faixas de largura fixa entre bordas [b0, b1, …, bk]; a faixa j é (bⱼ, bⱼ₊₁], com a primeira fechada em b0, a
 * convenção de calibration_curve(strategy="uniform") do scikit-learn. Faixa vazia fica com n = 0 e obs null.
 */
export function faixasFixas(y: Vetor, pd: Vetor, bordas: number[]): Faixa[] {
  const k = bordas.length - 1; const grupos: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < pd.length; i++) {
    let j = 0; while (j < k - 1 && pd[i] > bordas[j + 1]) j++;
    grupos[j].push(i);
  }
  return grupos.map((ids, j) => fechaFaixa(j + 1, ids, y, pd, bordas[j], bordas[j + 1]));
}

export type Global = { n: number; esperados: number; observados: number; pdMedia: number | null; taxa: number | null; razaoOE: number | null };
/** Calibração global: defaults esperados (soma das PDs) contra observados; razão O/E acima de 1 = risco subestimado. */
export function calibracaoGlobal(y: Vetor, pd: Vetor): Global {
  const e = soma(pd), o = soma(y);
  return { n: y.length, esperados: e, observados: o, pdMedia: media(pd), taxa: media(y), razaoOE: razao(o, e) };
}

/**
 * Regressão logística por Newton (IRLS) de y em [1, x] com deslocamento fixo `offset`: devolve os coeficientes de
 * máxima verossimilhança. Base de três diagnósticos e dois calibradores: slope e intercepto de calibração (x =
 * logit(PD)), intercepto com slope fixado em 1 (só offset) e o ajuste de Platt na amostra de calibração.
 */
export function logisticaNewton(y: Vetor, x: Vetor | null, offset: Vetor, iter = 60): { a: number; b: number; convergiu: boolean } {
  let a = 0, b = 0;
  for (let k = 0; k < iter; k++) {
    let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
    for (let i = 0; i < y.length; i++) {
      const xi = x ? x[i] : 0; const p = sigmoide(a + b * xi + offset[i]); const w = p * (1 - p); const r = y[i] - p;
      g0 += r; g1 += r * xi; h00 += w; h01 += w * xi; h11 += w * xi * xi;
    }
    let da: number, db: number;
    if (x) { const det = h00 * h11 - h01 * h01; da = (h11 * g0 - h01 * g1) / det; db = (h00 * g1 - h01 * g0) / det; }
    else { da = g0 / h00; db = 0; }
    a += da; b += db;
    if (Math.abs(da) < 1e-12 && Math.abs(db) < 1e-12) return { a, b, convergiu: true };
  }
  return { a, b, convergiu: false };
}
const logits = (pd: Vetor) => pd.map(logit);
/** Intercepto e slope de calibração: regressão de y em logit(PD). Ideal: intercepto 0 e slope 1 juntos. */
export function interceptoESlope(y: Vetor, pd: Vetor) { const r = logisticaNewton(y, logits(pd), pd.map(() => 0)); return { intercepto: r.a, slope: r.b }; }
/** Intercepto com slope fixado em 1 (calibração no agregado): o a que faz Σ σ(a + logit PD) = Σ y. Ideal: 0. */
export function interceptoComSlope1(y: Vetor, pd: Vetor) { return logisticaNewton(y, null, logits(pd)).a; }

export const brier = (y: Vetor, pd: Vetor) => { let s = 0; for (let i = 0; i < y.length; i++) s += (pd[i] - y[i]) ** 2; return s / y.length; };
/** Log loss em log natural. EPS_LOG só evita ln(0) na probabilidade dada ao que aconteceu; `limitadas` conta quantas previsões precisaram dele. */
export function logLoss(y: Vetor, pd: Vetor): { valor: number; limitadas: number } {
  let s = 0, lim = 0;
  for (let i = 0; i < y.length; i++) { const q = y[i] ? pd[i] : 1 - pd[i]; if (q < EPS_LOG) lim++; s -= Math.log(Math.max(q, EPS_LOG)); }
  return { valor: s / y.length, limitadas: lim };
}
/** Perda de uma única proposta: (p − y)² e −ln da probabilidade dada ao que aconteceu. */
export const perdaBrier1 = (p: number, y: 0 | 1) => (p - y) ** 2;
export const perdaLog1 = (p: number, y: 0 | 1) => -Math.log(y ? Math.max(p, EPS_LOG) : Math.max(1 - p, EPS_LOG));

/**
 * Decomposição de Murphy (1973) por faixas: Brier = confiabilidade − resolução + incerteza + resíduo. O resíduo só é
 * zero quando a PD é constante dentro de cada faixa; com PD contínua ele mede o que a média da faixa esconde
 * (Stephenson, Coelho e Jolliffe, 2008). O quadro mostra o resíduo em vez de omiti-lo.
 */
export function decomposicaoBrier(y: Vetor, pd: Vetor, faixas: Faixa[]) {
  const n = y.length, obar = soma(y) / n; let rel = 0, res = 0;
  for (const f of faixas) { if (!f.n || f.pdMedia === null || f.obs === null) continue; rel += f.n * (f.pdMedia - f.obs) ** 2; res += f.n * (f.obs - obar) ** 2; }
  rel /= n; res /= n; const unc = obar * (1 - obar); const bs = brier(y, pd);
  return { brier: bs, confiabilidade: rel, resolucao: res, incerteza: unc, residuo: bs - (rel - res + unc) };
}

/* ----------------------------------------------------------------- recalibração */

/** p' = σ(a + b · logit p): a desloca o nível, b estica (b > 1) ou comprime (b < 1) as distâncias em log odds. */
export const transformar = (pd: Vetor, a: number, b: number) => pd.map((p) => sigmoide(a + b * logit(p)));
/** Ajuste de intercepto estimado numa amostra de calibração (máxima verossimilhança, slope fixado em 1). */
export const ajustarIntercepto = (yCal: Vetor, pdCal: Vetor) => interceptoComSlope1(yCal, pdCal);
/** Platt sobre o escore s = logit(PD): regressão logística de y em s, por máxima verossimilhança, sem suavizar os alvos. */
export function ajustarPlatt(yCal: Vetor, pdCal: Vetor) { const r = logisticaNewton(yCal, logits(pdCal), pdCal.map(() => 0)); return { a: r.a, b: r.b }; }

export type Isotonica = { x: number[]; y: number[] };
/**
 * Regressão isotônica não decrescente pelo algoritmo PAV (pool adjacent violators). PDs iguais na amostra são
 * agrupadas antes, com peso igual ao número de casos, como no IsotonicRegression do scikit-learn. Devolve os pontos
 * de quebra (primeiro e último x de cada bloco), que é o que a previsão interpola.
 */
export function ajustarIsotonica(xCal: Vetor, yCal: Vetor): Isotonica {
  const ord = xCal.map((_, i) => i).sort((a, b) => xCal[a] - xCal[b]);
  const xs: number[] = [], ys: number[] = [], ws: number[] = [];
  for (const i of ord) { const k = xs.length - 1; if (k >= 0 && xs[k] === xCal[i]) { ys[k] += yCal[i]; ws[k]++; } else { xs.push(xCal[i]); ys.push(yCal[i]); ws.push(1); } }
  for (let k = 0; k < ys.length; k++) ys[k] /= ws[k];
  // blocos: valor, peso, primeiro e último índice de xs
  const bv: number[] = [], bw: number[] = [], bi: number[] = [], bf: number[] = [];
  for (let k = 0; k < xs.length; k++) {
    bv.push(ys[k]); bw.push(ws[k]); bi.push(k); bf.push(k);
    while (bv.length > 1 && bv[bv.length - 2] >= bv[bv.length - 1]) {
      const w = bw[bw.length - 2] + bw[bw.length - 1]; const v = (bv[bv.length - 2] * bw[bw.length - 2] + bv[bv.length - 1] * bw[bw.length - 1]) / w;
      bv.splice(-2, 2, v); bw.splice(-2, 2, w); const ini = bi[bi.length - 2]; bi.splice(-2, 2, ini); bf.splice(-2, 2, bf[bf.length - 1]);
    }
  }
  const x: number[] = [], y: number[] = [];
  for (let k = 0; k < bv.length; k++) { x.push(xs[bi[k]]); y.push(bv[k]); if (bf[k] !== bi[k]) { x.push(xs[bf[k]]); y.push(bv[k]); } }
  return { x, y };
}
/** Previsão da isotônica: interpolação linear entre os pontos de quebra e valor da ponta fora do intervalo. */
export function aplicarIsotonica(f: Isotonica, pd: Vetor): number[] {
  return pd.map((p) => {
    if (p <= f.x[0]) return f.y[0]; const m = f.x.length - 1; if (p >= f.x[m]) return f.y[m];
    let lo = 0, hi = m; while (hi - lo > 1) { const md = (lo + hi) >> 1; if (f.x[md] <= p) lo = md; else hi = md; }
    const t = (p - f.x[lo]) / (f.x[hi] - f.x[lo]); return f.y[lo] + t * (f.y[hi] - f.y[lo]);
  });
}
/**
 * Diagrama de confiabilidade CORP (Dimitriadis, Gneiting e Jordan, 2021, PNAS 118(8)): a isotônica de y sobre a PD,
 * ajustada na própria amostra avaliada, substitui a escolha de faixas. Com ela, o Brier se decompõe em
 * BS = MCB − DSC + UNC: MCB (erro de calibração) = BS − BS da PD recalibrada; DSC (discriminação) = UNC − BS da
 * recalibrada; UNC (incerteza) = BS da taxa média. É diagnóstico na amostra, não calibrador para outra amostra.
 */
export function corp(y: Vetor, pd: Vetor) {
  const iso = ajustarIsotonica(pd, y); const rc = aplicarIsotonica(iso, pd);
  const tx = media(y)!; const bs = brier(y, pd), bsRc = brier(y, rc), unc = tx * (1 - tx);
  return { iso, recalibrada: rc, blocos: iso.x.length, bs, bsRc, mcb: bs - bsRc, dsc: unc - bsRc, unc };
}
export const valoresDistintos = (v: Vetor) => new Set(v).size;
/**
 * Arredondamento comercial (meio para cima) feito em inteiros: as PDs da base têm seis casas, então x·10⁶ é inteiro e
 * a regra fica exata, sem o erro de representação binária de x·10ᶜ.
 */
export const arredondar = (v: Vetor, casas: number) => { const d = 10 ** (6 - casas); return v.map((x) => Math.floor((Math.round(x * 1e6) + d / 2) / d) * d / 1e6); };

/* ------------------------------------------------------------------- incerteza */

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
/** Quantil empírico com interpolação linear (método 7 de Hyndman e Fan, o padrão do NumPy). */
export function quantil(ordenado: Vetor, q: number) {
  const h = (ordenado.length - 1) * q, lo = Math.floor(h), hi = Math.ceil(h); return ordenado[lo] + (h - lo) * (ordenado[hi] - ordenado[lo]);
}
/**
 * Reamostragem pareada: em cada réplica, as mesmas propostas (sorteadas com reposição) avaliam os dois modelos, e a
 * diferença de AUC é calculada nelas. Réplicas sem uma das classes são descartadas e contadas.
 */
export function bootstrapPareado(y: Vetor, s1: Vetor, s2: Vetor, replicas: number, semente: number) {
  const r = mulberry32(semente), n = y.length; const a1: number[] = [], a2: number[] = [], dif: number[] = []; let descartadas = 0;
  const yy = new Array<number>(n), p1 = new Array<number>(n), p2 = new Array<number>(n);
  for (let b = 0; b < replicas; b++) {
    for (let i = 0; i < n; i++) { const j = Math.floor(r() * n); yy[i] = y[j]; p1[i] = s1[j]; p2[i] = s2[j]; }
    const u = aucPorPares(yy, p1).auc, v = aucPorPares(yy, p2).auc;
    if (u === null || v === null) { descartadas++; continue; }
    a1.push(u); a2.push(v); dif.push(u - v);
  }
  return { a1, a2, dif, descartadas };
}

/** Função de distribuição da normal padrão pela aproximação de erfc de Numerical Recipes (erro relativo abaixo de 1,2e−7). */
export function normalCdf(x: number): number {
  const t = 1 / (1 + 0.5 * Math.abs(x / Math.SQRT2));
  const e = t * Math.exp(-((x / Math.SQRT2) ** 2) - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? 1 - e / 2 : e / 2;
}

/**
 * Teste de DeLong, DeLong e Clarke-Pearson (1988), para duas AUCs calculadas nas mesmas propostas: componentes
 * estruturais de cada caso, matriz de covariância das duas AUCs e erro padrão da diferença. Hipóteses: casos
 * independentes entre si; nenhuma hipótese sobre a forma das distribuições dos escores.
 */
export function delong(y: Vetor, s1: Vetor, s2: Vetor) {
  const pos = y.map((v, i) => (v ? i : -1)).filter((i) => i >= 0), neg = y.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const m = pos.length, n = neg.length;
  const psi = (a: number, b: number) => (a > b ? 1 : a === b ? 0.5 : 0);
  const comp = (s: Vetor) => {
    const v10 = pos.map((i) => { let t = 0; for (const j of neg) t += psi(s[i], s[j]); return t / n; });
    const v01 = neg.map((j) => { let t = 0; for (const i of pos) t += psi(s[i], s[j]); return t / m; });
    return { auc: soma(v10) / m, v10, v01 };
  };
  const c1 = comp(s1), c2 = comp(s2);
  const cov = (u: number[], v: number[], mu: number, mv: number) => { let t = 0; for (let k = 0; k < u.length; k++) t += (u[k] - mu) * (v[k] - mv); return t / (u.length - 1); };
  const s10 = [cov(c1.v10, c1.v10, c1.auc, c1.auc), cov(c1.v10, c2.v10, c1.auc, c2.auc), cov(c2.v10, c2.v10, c2.auc, c2.auc)];
  const s01 = [cov(c1.v01, c1.v01, c1.auc, c1.auc), cov(c1.v01, c2.v01, c1.auc, c2.auc), cov(c2.v01, c2.v01, c2.auc, c2.auc)];
  const varDif = (s10[0] + s10[2] - 2 * s10[1]) / m + (s01[0] + s01[2] - 2 * s01[1]) / n;
  const dif = c1.auc - c2.auc, ep = Math.sqrt(varDif), z = dif / ep, p = 2 * (1 - normalCdf(Math.abs(z)));
  const ep1 = Math.sqrt(s10[0] / m + s01[0] / n), ep2 = Math.sqrt(s10[2] / m + s01[2] / n);
  return { auc1: c1.auc, auc2: c2.auc, ep1, ep2, dif, ep, z, p, ic: [dif - Z95 * ep, dif + Z95 * ep] as [number, number], correlacao: (s10[1] / m + s01[1] / n) / (ep1 * ep2) };
}

/** Diferença entre duas proporções independentes com erro padrão próprio (teste de Wald da diferença). */
/** Log da função gama (Lanczos, g = 7, nove coeficientes): erro relativo abaixo de 10⁻¹⁴ para x > 0. */
export function lnGama(x: number): number {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lnGama(1 - x);
  x -= 1; let a = c[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
/** Beta incompleta regularizada I_x(a, b) pela fração contínua de Lentz (como em Numerical Recipes, 6.4). */
export function betaRegularizada(x: number, a: number, b: number): number {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const ln = lnGama(a + b) - lnGama(a) - lnGama(b) + a * Math.log(x) + b * Math.log(1 - x);
  const fc = (xx: number, aa: number, bb: number) => {
    const TINY = 1e-300; let c = 1, d = 1 - ((aa + bb) * xx) / (aa + 1); if (Math.abs(d) < TINY) d = TINY; d = 1 / d; let h = d;
    for (let m = 1; m <= 500; m++) {
      const m2 = 2 * m; let num = (m * (bb - m) * xx) / ((aa + m2 - 1) * (aa + m2));
      d = 1 + num * d; if (Math.abs(d) < TINY) d = TINY; c = 1 + num / c; if (Math.abs(c) < TINY) c = TINY; d = 1 / d; h *= d * c;
      num = (-(aa + m) * (aa + bb + m) * xx) / ((aa + m2) * (aa + m2 + 1));
      d = 1 + num * d; if (Math.abs(d) < TINY) d = TINY; c = 1 + num / c; if (Math.abs(c) < TINY) c = TINY; d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  };
  return x < (a + 1) / (a + b + 2) ? (Math.exp(ln) * fc(x, a, b)) / a : 1 - (Math.exp(ln) * fc(1 - x, b, a)) / b;
}
/**
 * Teste de Jeffreys usado pelo BCE no backtesting de PD (ECB, Instructions for reporting the validation results of
 * internal models): com d defaults em n casos e a PD aplicada à faixa, o p-valor é a função de distribuição da
 * Beta(d + ½, n − d + ½) no ponto PD. H0: a PD não subestima a taxa verdadeira; p-valor pequeno indica subestimação.
 */
export const jeffreys = (d: number, n: number, pd: number) => betaRegularizada(pd, d + 0.5, n - d + 0.5);
export function diferencaProporcoes(d1: number, n1: number, d2: number, n2: number) {
  const p1 = d1 / n1, p2 = d2 / n2, ep = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2), dif = p1 - p2;
  return { dif, ep, ic: [dif - Z95 * ep, dif + Z95 * ep] as [number, number] };
}
