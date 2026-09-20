/**
 * Slide 12 do capítulo 4 (c4p12): o mesmo multiplicador das odds produz aumentos diferentes em pontos percentuais
 * de PD conforme a probabilidade inicial. O experimento é fixo (+10 pp de utilização, Δz = β, m = exp(Δz)) e o aluno
 * só muda a PD de partida. A forma p' = m p ÷ (1 − p + m p) vale em p = 0 e p = 1 sem passar por odds infinitas.
 * Precisão integral; arredondamento só na exibição.
 */
import { BETA1, arredondar, fmt, fmtPct, fmtPp, sigmoide } from "./logit-slides";

export { BETA1, arredondar, fmt, fmtPct, fmtPp, sigmoide };

export const DELTA_UTIL = 10; // pp de utilização, fixos neste slide
export const DELTA_Z = BETA1 * (DELTA_UTIL / 10);
export const M = Math.exp(DELTA_Z);
export const PD_INICIAL = 0.1;
export const FAIXA_PD: readonly [number, number] = [0.001, 0.999];
export const ATALHOS = [0.02, 0.1, 0.5, 0.9] as const;
export const CENARIOS = [0.02, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9] as const;
export const Y_MAX_PP = 20;
export const TICKS_X = [0, 0.25, 0.5, 0.75, 1] as const;
export const TICKS_Y = [0, 5, 10, 15, 20] as const;

/** PD depois de multiplicar as odds por m, sem passar por odds: exata em p = 0 e p = 1. */
export const pdFinal = (p: number, m = M) => (m * p) / (1 - p + m * p);
export const aumentoPp = (p: number, m = M) => 100 * (pdFinal(p, m) - p);

/** Máximo analítico do aumento finito: p* = 1 ÷ (1 + √m) e Δ* = (√m − 1) ÷ (√m + 1). */
export function maximo(m = M) {
  const r = Math.sqrt(m);
  const p = 1 / (1 + r);
  return { p, pp: (100 * (r - 1)) / (r + 1) };
}

/** Curva do aumento, amostrada densamente e sempre incluindo os extremos e o máximo. */
export function curva(n = 400, m = M): { p: number; pp: number }[] {
  const pts: { p: number; pp: number }[] = [];
  for (let i = 0; i <= n; i++) { const p = i / n; pts.push({ p, pp: aumentoPp(p, m) }); }
  const pm = maximo(m).p;
  pts.push({ p: pm, pp: aumentoPp(pm, m) });
  return pts.sort((a, b) => a.p - b.p);
}

export type Cenario = { p: number; pFinal: number; pp: number; maiorDaLista: boolean };
/** Os sete cenários da tabela, pela mesma função do gráfico. */
export function cenarios(m = M): Cenario[] {
  const linhas = CENARIOS.map((p) => ({ p, pFinal: pdFinal(p, m), pp: aumentoPp(p, m), maiorDaLista: false }));
  const topo = Math.max(...linhas.map((l) => l.pp));
  for (const l of linhas) l.maiorDaLista = l.pp === topo;
  return linhas;
}

export type Validacao = { ok: true; valor: number } | { ok: false; erro: string };
const parse = (t: string) => { const s = t.trim().replace(/\s|%/g, "").replace("−", "-").replace(",", "."); return s === "" ? NaN : Number(s); };

/** PD inicial digitada, em porcentagem, dentro da faixa do controle. */
export function validarPd(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite uma PD em porcentagem, por exemplo 10 ou 2,5." };
  // arredonda antes de comparar: 99,9 ÷ 100 dá 0,9990000000000001 em ponto flutuante e cairia fora da faixa
  const p = Math.round((v / 100) * 1000) / 1000;
  if (p < FAIXA_PD[0] || p > FAIXA_PD[1]) return { ok: false, erro: `A PD inicial vai de ${fmt(FAIXA_PD[0] * 100, 1)}% a ${fmt(FAIXA_PD[1] * 100, 1)}%.` };
  return { ok: true, valor: p };
}

/** PD do controle: uma casa decimal. */
export const fmtPd1 = (p: number) => `${fmt(p * 100, 1)}%`;

export const EXPERIMENTO = [
  { k: "Mudança na utilização", v: `${fmt(DELTA_UTIL, 0, true)} pp`, cor: "ambar" as const },
  { k: "Incremento no escore", v: `Δz = ${fmt(DELTA_Z, 4, true)}`, cor: "navy" as const },
  { k: "Multiplicador das odds", v: `× ${fmt(M, 2)}`, cor: "vinho" as const },
];
export const NOTA_EXPERIMENTO = "Mantidas as demais variáveis constantes, no modelo sem interação.";
export const CONTA = "PD final = m × p ÷ (1 − p + m × p)";
export const CONTA_L = "p = PD inicial; m = multiplicador das odds.";
export const PERGUNTA_MAX = "O maior impacto ocorre em 50%?";
export const NOTA_SENSIBILIDADE = "50% é o ponto de maior sensibilidade local. Para uma mudança finita, o ponto de partida que maximiza o aumento pode ser diferente.";
export const NOTA_CENARIOS = "Cenários didáticos; não representam uma amostra de clientes.";
export const CONCLUSAO = "Para traduzir uma razão de odds em pontos percentuais, precisamos conhecer a PD inicial.";
export const RODAPE = "pp = pontos percentuais · m = exp(Δz) · valores arredondados apenas na exibição";

/** Frase da revelação, com os dois números derivados do máximo analítico. */
export const fraseMaximo = (m = M) => {
  const x = maximo(m);
  return `Para este aumento finito, o maior impacto ocorre perto de uma PD inicial de ${fmt(x.p * 100, 1)}%, com aumento de aproximadamente ${fmt(x.pp, 2)} pp.`;
};
