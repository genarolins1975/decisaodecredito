/**
 * Motor econômico da aula 3 (capítulo 8) em funções puras, com os parâmetros declarados nas páginas c8p5 e c8p6:
 * receita de 28% da exposição se pagar, fração perdida de 65% no default, funding de 12%, custo operacional fixo de
 * R$ 120 e custo de capital de 2%. Conferido contra o gerador em tests/visuais.test.ts (corte 10%: 469 aprovados e
 * R$ 585 mil; máximo em 14% com R$ 608 mil).
 */
export type Parametros = { receita: number; lgd: number; funding: number; operacao: number; capital: number };
export const PARAMETROS: Parametros = { receita: 0.28, lgd: 0.65, funding: 0.12, operacao: 120, capital: 0.02 };
export type Parcelas = { receita: number; perda: number; funding: number; operacao: number; capital: number; total: number; aprovados: number };

/** Resultado esperado de uma proposta aprovada. */
export function esperado(pd: number, ead: number, p: Parametros = PARAMETROS): number {
  return p.receita * ead * (1 - pd) - p.lgd * ead * pd - p.funding * ead - p.operacao - p.capital * ead;
}
/** Resultado realizado, com o desfecho conhecido (só faz sentido sem choque). */
export function realizado(y: number, ead: number, p: Parametros = PARAMETROS): number {
  return (y ? -p.lgd * ead : p.receita * ead) - p.funding * ead - p.operacao - p.capital * ead;
}
/** Ponto de equilíbrio em PD de uma operação: resultado esperado igual a zero. */
export function pontoDeEquilibrio(ead: number, p: Parametros = PARAMETROS): number {
  return (p.receita * ead - p.funding * ead - p.operacao - p.capital * ead) / ((p.receita + p.lgd) * ead);
}
/** Choque de PD em log odds, sobre toda a carteira (0,3 leve; 0,5 moderado; 0,8 severo). */
export function chocar(pd: number, delta: number): number {
  if (!delta) return pd;
  const z = Math.log(pd / (1 - pd)) + delta;
  return 1 / (1 + Math.exp(-z));
}
/** Parcelas da carteira aprovada com um corte (aprovada quando PD < corte). */
export function parcelas(pd: number[], ead: number[], corte: number, p: Parametros = PARAMETROS): Parcelas {
  const r: Parcelas = { receita: 0, perda: 0, funding: 0, operacao: 0, capital: 0, total: 0, aprovados: 0 };
  for (let i = 0; i < pd.length; i++) {
    if (pd[i] >= corte) continue;
    r.aprovados++;
    r.receita += p.receita * ead[i] * (1 - pd[i]); r.perda -= p.lgd * ead[i] * pd[i]; r.funding -= p.funding * ead[i]; r.operacao -= p.operacao; r.capital -= p.capital * ead[i];
  }
  r.total = r.receita + r.perda + r.funding + r.operacao + r.capital;
  return r;
}
/** Curva de resultado por corte: uma avaliação completa da carteira em cada ponto da grade. */
export function curva(pd: number[], ead: number[], cortes: number[], p: Parametros = PARAMETROS): { corte: number; parcelas: Parcelas }[] {
  return cortes.map((c) => ({ corte: c, parcelas: parcelas(pd, ead, c, p) }));
}
export function otimo(pts: { corte: number; parcelas: Parcelas }[]): { corte: number; parcelas: Parcelas } {
  return pts.reduce((m, q) => (q.parcelas.total > m.parcelas.total ? q : m), pts[0]);
}
export const GRADE_CORTES = Array.from({ length: 120 }, (_, i) => (i + 1) * 0.005); // 0,5% a 60%, 120 avaliações
export const fmtReais = (v: number) => {
  const a = Math.abs(v); const s = v < 0 ? "−" : "";
  if (a >= 1e6) return `${s}R$ ${(a / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`;
  if (a >= 1e3) return `${s}R$ ${Math.round(a / 1e3).toLocaleString("pt-BR")} mil`;
  return `${s}R$ ${Math.round(a).toLocaleString("pt-BR")}`;
};
