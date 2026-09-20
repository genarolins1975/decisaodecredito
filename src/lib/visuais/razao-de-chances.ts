/**
 * Slide 11 do capítulo 4 (c4p11): a razão de odds multiplica odds, não probabilidade. O multiplicador vem do
 * coeficiente do projeto, OR = exp(β) com a precisão integral de β; "2,11×" é exibição. Uma única fonte de estado:
 * todas as contas partem de p inicial e de OR, sem arredondamento intermediário.
 */
import { BETA1, arredondar, fmt, fmtPct, fmtPp, sigmoide } from "./logit-slides";

export { BETA1, arredondar, fmt, fmtPct, fmtPp, sigmoide };

export const PD_INICIAL = 0.1;
export const DELTA_UTIL = 10; // pp
/** Razão de odds da utilização por unidade de 10 pp: exp(β), nunca o 2,11 arredondado. */
export const OR = Math.exp(BETA1);

export const oddsDeP = (p: number) => p / (1 - p);
export const pDeOdds = (o: number) => o / (1 + o);

/** Os três passos da conversão, calculados em sequência a partir de p inicial e de OR. */
export function conversao(p0 = PD_INICIAL, or = OR) {
  const odds0 = oddsDeP(p0), odds1 = odds0 * or, p1 = pDeOdds(odds1);
  return { p0, or, odds0, odds1, p1, deltaPd: (p1 - p0) * 100, ganhoOdds: (or - 1) * 100 };
}

export type Alternativa = { id: "A" | "B" | "C"; valor: number; rotulo: string; explicacao: string; correta: boolean; feedback: string };

/** As três alternativas: multiplicar a PD, o caminho correto pelas odds e somar em pontos percentuais. */
export function alternativas(p0 = PD_INICIAL, or = OR): Alternativa[] {
  const c = conversao(p0, or);
  return [
    { id: "A", valor: p0 * or, rotulo: "Multiplicar diretamente a PD por 2,11.", explicacao: "PD × OR", correta: false,
      feedback: "O multiplicador atua sobre as odds, não diretamente sobre a PD." },
    { id: "B", valor: c.p1, rotulo: "Multiplicar as odds e converter de volta para PD.", explicacao: "odds × OR, depois volta a PD", correta: true,
      feedback: "Correto. Primeiro multiplicamos as odds; depois voltamos à probabilidade." },
    // o erro que a alternativa C representa é ler o multiplicador exibido, 2,11, como um acréscimo em pontos percentuais
    { id: "C", valor: p0 + arredondar(or, 2) / 100, rotulo: `Somar ${fmt(or, 2)} pontos percentuais à PD.`, explicacao: `PD + ${fmt(or, 2)} pp`, correta: false,
      feedback: "A razão de odds é um fator multiplicativo, não um acréscimo em pontos percentuais." },
  ];
}

export const alternativa = (id: string | null, p0 = PD_INICIAL, or = OR) => alternativas(p0, or).find((a) => a.id === id) ?? null;

/** PD com uma casa decimal, como as alternativas pedem. */
export const fmtPd1 = (p: number) => `${fmt(p * 100, 1)}%`;

export const ENUNCIADO = [
  { k: "PD inicial", v: fmtPd1(PD_INICIAL).replace(",0", ""), cor: "verde" as const },
  { k: "Mudança na utilização", v: `${fmt(DELTA_UTIL, 0, true)} pp`, cor: "ambar" as const },
  { k: "Multiplicador das odds", v: `${fmt(OR, 2)}×`, cor: "roxo" as const },
];
export const NOTA_ENUNCIADO = "Mantidas as demais variáveis constantes, no modelo sem interação.";
export const NOTA_OR = "Multiplicador exibido arredondado; cálculo com precisão integral.";
export const CAMINHO = [
  { t: "Converter a PD em odds", f: "odds = p ÷ (1 − p)" },
  { t: "Aplicar o multiplicador", f: "novas odds = odds × OR" },
  { t: "Voltar à probabilidade", f: "nova PD = novas odds ÷ (1 + novas odds)" },
];
export const CAMINHO_FECHO = "Identifique a grandeza que recebe o multiplicador.";
export const SINTESE_ANTES = "Escolha sua resposta e acompanhe a conversão.";
export const TRANSICAO = "O mesmo multiplicador pode produzir mudanças diferentes na PD.";
export const RODAPE = "PD = probabilidade de default · pp = pontos percentuais · OR = razão de odds";

/** As três etapas da demonstração, com a conta escrita e o resultado. */
export function etapas(p0 = PD_INICIAL, or = OR) {
  const c = conversao(p0, or);
  return [
    { k: "Da PD às odds", conta: `odds₀ = ${fmt(p0, 2)} ÷ ${fmt(1 - p0, 2)}`, valor: fmt(c.odds0, 4), destaque: false },
    { k: "Multiplicar as odds", conta: `odds₁ = odds₀ × ${fmt(or, 4)}`, valor: fmt(c.odds1, 4), destaque: false },
    { k: "Voltar à probabilidade", conta: `PD₁ = odds₁ ÷ (1 + odds₁)`, valor: fmtPct(c.p1), destaque: true },
  ];
}

/** Conclusão da base, com os dois números que a turma leva: o ganho em odds e o deslocamento em PD. */
export function conclusao(p0 = PD_INICIAL, or = OR) {
  const c = conversao(p0, or);
  return {
    principal: `As odds aumentaram cerca de ${fmt(c.ganhoOdds, 0)}%. A PD passou de ${fmtPd1(p0).replace(",0", "")} para cerca de ${fmt(c.p1 * 100, 0)}%.`,
    detalhe: `Isso representa aproximadamente ${fmt(c.deltaPd, 0, true)} pontos percentuais de PD.`,
  };
}
