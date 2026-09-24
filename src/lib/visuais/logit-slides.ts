/**
 * Dois primeiros slides do capítulo 4 (c4p1): como o logit transforma uma proposta em PD, e o que um coeficiente
 * significa. Um único estado matemático alimenta números, gráficos e textos; precisão integral nas contas,
 * arredondamento só na exibição. Coeficientes fixos da aula: BETA_AULA = [β₀, β₁ por 10 pp de utilização, β₂ por 10 dias].
 */
import { BETA_AULA } from "./logistica";
import { paraTex } from "./tex";

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
/** Número para dentro de uma fórmula TeX: sinal de menos do TeX e vírgula decimal protegida (src/lib/visuais/tex.ts). */
export { paraTex };
export const fmtTex = (v: number, casas: number, sinal = false) => paraTex(fmt(v, casas, sinal));

/** Fórmulas fixas dos dois quadros, em texto (rótulo acessível) e em TeX (KaTeX). */
export const FORMULA_Z = "z = β₀ + β₁x₁ + β₂x₂";
export const FORMULA_Z_TEX = String.raw`z = \beta_0 + \beta_1 x_1 + \beta_2 x_2`;
export const FORMULA_PD = "PD = 1 ÷ (1 + e^(−z))";
export const FORMULA_PD_TEX = String.raw`\mathrm{PD} = \dfrac{1}{1 + e^{-z}}`;
export const FORMULA_PNOVO = "p novo = m · p inicial ÷ (1 − p inicial + m · p inicial)";
export const FORMULA_PNOVO_TEX = String.raw`p_{\text{novo}} = \dfrac{m \cdot p_{\text{inicial}}}{1 - p_{\text{inicial}} + m \cdot p_{\text{inicial}}}`;
export const FORMULA_M = "m = e^(β · Δx)";
export const FORMULA_M_TEX = String.raw`m = e^{\beta \cdot \Delta x}`;

/** A conta da unidade de cada característica, em texto e em TeX: 70% ÷ 10 pp = 7,0 unidades; 5 dias ÷ 10 dias = 0,5 unidades. */
export function contaUnidade(valor: number, tipo: "util" | "atraso") {
  const x = valor / 10; const un = x === 1 ? "unidade" : "unidades";
  if (tipo === "util") return { texto: `${valor}% ÷ 10 pp = ${fmt(x, 1)} ${un}`, tex: String.raw`${valor}\% \div 10\ \text{pp} = ${fmtTex(x, 1)}\ \text{${un}}` };
  const d = valor === 1 ? "dia" : "dias";
  return { texto: `${valor} ${d} ÷ 10 dias = ${fmt(x, 1)} ${un}`, tex: String.raw`${valor}\ \text{${d}} \div 10\ \text{dias} = ${fmtTex(x, 1)}\ \text{${un}}` };
}

/** Slide 1: unidades transformadas, parcelas do escore, escore e PD, com a soma em precisão integral. */
export function proposta(util: number, atraso: number) {
  const x1 = util / 10, x2 = atraso / 10;
  const c1 = BETA1 * x1, c2 = BETA2 * x2; const z = BETA0 + c1 + c2; const pd = sigmoide(z);
  return {
    x1, x2, intercepto: BETA0, c1, c2, z, pd,
    parcelas: [
      { id: "b0", rotulo: "Intercepto", conta: "", contaTex: "", valor: BETA0, cor: "cinza" as const },
      { id: "util", rotulo: "Utilização", conta: `${fmt(BETA1, 4)} × ${fmt(x1, 1)}`, contaTex: String.raw`${fmtTex(BETA1, 4)} \times ${fmtTex(x1, 1)}`, valor: c1, cor: "ambar" as const },
      { id: "atraso", rotulo: "Atraso", conta: `${fmt(BETA2, 4)} × ${fmt(x2, 1)}`, contaTex: String.raw`${fmtTex(BETA2, 4)} \times ${fmtTex(x2, 1)}`, valor: c2, cor: "roxo" as const },
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

/** O escore z, em texto e em TeX. */
export const escoreTexto = (z: number) => `z ≈ ${fmt(z, 4)}`;
export const escoreTex = (z: number) => String.raw`z \approx ${fmtTex(z, 4)}`;

/** Slide 2: o multiplicador escrito como potência, e^Δz ≈ m, em texto e em TeX. */
export const potenciaTexto = (dz: number, m: number) => `e^${fmt(dz, 4)} ≈ ${fmt(m, 2)}`;
export const potenciaTex = (dz: number, m: number) => String.raw`e^{${fmtTex(dz, 4)}} \approx ${fmtTex(m, 2)}`;

/** Frases do slide 2 com trechos em TeX entre cifrões (ComTex): o coeficiente fixo e o Δx da conta. */
export const FRASE_COEFICIENTE = String.raw`Coeficiente fixo: $\beta = ${fmtTex(BETA1, 4)}$ por 10 pp.`;
export function fraseDeltaX(deltaPp: number) {
  const dx = deltaPp / 10;
  return String.raw`$\Delta x$ em unidades de 10 pp: $${fmtTex(deltaPp, 0, true)}\ \text{pp} = ${fmtTex(dx, 1, true)}\ \text{${Math.abs(dx) === 1 ? "unidade" : "unidades"}}$.`;
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
