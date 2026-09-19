/**
 * Dois primeiros slides do capítulo 4 (c4p1): como o logit transforma uma proposta em PD, e o que um coeficiente
 * significa. Um único estado matemático alimenta números, gráficos e textos; precisão integral nas contas,
 * arredondamento só na exibição. Coeficientes fixos da aula: BETA_AULA = [β₀, β₁ por 10 pp de utilização, β₂ por 10 dias].
 */
import { BETA_AULA } from "./logistica";

export const [BETA0, BETA1, BETA2] = BETA_AULA;
export const EXEMPLO = { util: 70, atraso: 5 }; // utilização em %, atraso em dias
export const LIMITES = { util: [0, 100] as const, atraso: [0, 30] as const, delta: [-20, 20] as const };
export const ATALHOS_DELTA = [-10, 0, 10, 20] as const;
export const CENARIOS = [0.02, 0.1, 0.5, 0.9] as const;
export const JANELA_Z = { min: -6, max: 6 } as const;

/** Logística estável. */
export const sigmoide = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));

/** Arredondamento decimal meio para cima, imune ao ruído binário (1,3955 × 0,5 = 0,69775 → 0,6978 com 4 casas). */
export function arredondar(v: number, casas: number): number {
  const f = 10 ** casas; const bruto = Number((v * f).toFixed(3)); return Math.round(bruto) / f;
}
export const fmt = (v: number, casas: number, sinal = false) => {
  const r = arredondar(v, casas); const s = Math.abs(r).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return `${r < 0 ? "−" : sinal && r > 0 ? "+" : ""}${s}`;
};
export const fmtPct = (p: number, casas = 2) => `${fmt(p * 100, casas)}%`;
export const fmtPp = (pp: number, casas = 2) => `${fmt(pp, casas, true)} pp`;

/** Slide 1: unidades transformadas, parcelas do escore, escore e PD, com a soma em precisão integral. */
export function proposta(util: number, atraso: number) {
  const x1 = util / 10, x2 = atraso / 10;
  const c1 = BETA1 * x1, c2 = BETA2 * x2; const z = BETA0 + c1 + c2; const pd = sigmoide(z);
  return {
    x1, x2, intercepto: BETA0, c1, c2, z, pd,
    parcelas: [
      { id: "b0", rotulo: "Intercepto", conta: "", valor: BETA0, cor: "cinza" as const },
      { id: "util", rotulo: "Utilização", conta: `${fmt(BETA1, 4)} × ${fmt(x1, 1)}`, valor: c1, cor: "ambar" as const },
      { id: "atraso", rotulo: "Atraso", conta: `${fmt(BETA2, 4)} × ${fmt(x2, 1)}`, valor: c2, cor: "roxo" as const },
    ],
    foraDaJanela: z < JANELA_Z.min ? ("esquerda" as const) : z > JANELA_Z.max ? ("direita" as const) : null,
    esperadosEm100: Math.round(pd * 100),
  };
}

/** Slide 2: variação de utilização em pp → variação do escore e multiplicador das odds. β₁ é por unidade de 10 pp. */
export function efeitoCoeficiente(deltaPp: number) {
  const dz = BETA1 * (deltaPp / 10); const m = Math.exp(dz);
  return { deltaPp, dx: deltaPp / 10, dz, m };
}

/** PD depois de multiplicar as odds por m: p' = m p ÷ (1 − p + m p). */
export const pdNova = (p: number, m: number) => (m * p) / (1 - p + m * p);

/** As quatro réguas: cenários de partida, não observações. */
export function cenarios(deltaPp: number) {
  const { m } = efeitoCoeficiente(deltaPp);
  return CENARIOS.map((p0) => { const p1 = pdNova(p0, m); return { p0, p1, deltaPp: (p1 - p0) * 100, semMudanca: Math.abs(p1 - p0) < 1e-12 }; });
}

/** Frase de interpretação do slide 1. */
export const interpretarPd = (pd: number) => `Como interpretar: para operações com esse perfil, o modelo estima cerca de ${Math.round(pd * 100)} defaults a cada 100, no horizonte definido.`;
