/**
 * Slide 15 do capítulo 4 (c4p15): como a log loss orienta a estimação. Cada uma das 16 propostas didáticas recebe
 * uma PD do modelo; o desfecho observado e a PD determinam a perda individual, e a média dessas perdas é o objetivo
 * que a estimação busca reduzir. Perda calculada a partir do logit, na forma estável
 * ℓ = max(z, 0) − y z + log1p(exp(−|z|)), sem arredondar a PD antes. Regressão logística sem penalização e com
 * pesos iguais: numa média simples toda observação pesa o mesmo, ainda que contribua com perdas diferentes.
 */
import base from "./did.json";
import { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, sigmoide } from "./logit-slides";

export { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, sigmoide };

export type Proposta = { id: number; util: number; atraso: number; y: number };
export const PROPOSTAS: Proposta[] = base.base;
export const SELECAO_INICIAL = 2;
export const ATALHOS = [2, 10, 15] as const;

export const escore = (p: Proposta) => BETA0 + BETA1 * (p.util / 10) + BETA2 * (p.atraso / 10);

/** Perda individual a partir do logit: estável em z extremos e igual a −[y ln p + (1 − y) ln(1 − p)]. */
export const perdaDoLogit = (z: number, y: number) => Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z)));
/** A mesma perda escrita pela probabilidade; serve de conferência em valores moderados. */
export const perdaDaProbabilidade = (p: number, y: number) => -(y === 1 ? Math.log(p) : Math.log(1 - p));

export type Linha = Proposta & { z: number; pd: number; pObservado: number; perda: number };

/** As 16 linhas na ordem original, com PD, probabilidade do desfecho observado e perda. */
export function linhas(): Linha[] {
  return PROPOSTAS.map((p) => {
    const z = escore(p), pd = sigmoide(z);
    return { ...p, z, pd, pObservado: p.y === 1 ? pd : 1 - pd, perda: perdaDoLogit(z, p.y) };
  });
}

export const media = (ls: Linha[] = linhas()) => ls.reduce((s, l) => s + l.perda, 0) / ls.length;
export const proposta = (id: number, ls: Linha[] = linhas()) => ls.find((l) => l.id === id) ?? ls[0];

/** As três maiores perdas e a participação delas na perda total, para a leitura da base. */
export function maiores(n = 3, ls: Linha[] = linhas()) {
  const total = ls.reduce((s, l) => s + l.perda, 0);
  const top = [...ls].sort((a, b) => b.perda - a.perda).slice(0, n);
  return { ids: top.map((l) => l.id), participacao: (top.reduce((s, l) => s + l.perda, 0) / total) * 100, total };
}

/** Texto da fórmula aplicável ao desfecho da proposta. */
export function formula(l: Linha) {
  return l.y === 1
    ? { regra: "Perda = −ln(PD)", conta: `−ln(${fmt(l.pd, 4)}) ≈ ${fmt(l.perda, 4)}`, desfecho: "Default · y = 1", rotulo: "PD estimada" }
    : { regra: "Perda = −ln(1 − PD)", conta: `−ln(1 − ${fmt(l.pd, 4)}) ≈ ${fmt(l.perda, 4)}`, desfecho: "Sem default · y = 0", rotulo: "PD estimada" };
}

/** Frase curta de leitura da proposta selecionada. */
export function leitura(l: Linha) {
  // "mas" só quando o modelo deu menos da metade ao que ocorreu; a probabilidade do desfecho observado está logo acima no painel
  const liga = l.pObservado < 0.5 ? "mas" : "e";
  return l.y === 1
    ? `Houve default, ${liga} o modelo atribuiu ${fmtPct(l.pd)} a esse desfecho.`
    : `Não houve default, ${liga} o modelo atribuiu ${fmtPct(l.pd)} ao default.`;
}

export const CASOS = [
  { k: "Se houve default · y = 1", f: "Perda = −ln(PD)" },
  { k: "Se não houve default · y = 0", f: "Perda = −ln(1 − PD)" },
];
export const FRASE_PERDA = "A perda cai quando o modelo dá mais probabilidade ao desfecho que ocorreu.";
export const NOTA_LN = "ln = logaritmo natural; perda estatística, não financeira";
export const TITULO_GRAF = "A contribuição de cada proposta";
export const EIXO_Y = "Log loss individual";
export const ROTULO_MEDIA = "Log loss média do modelo";
export const TITULO_PAINEL = "Por que esta proposta gera perda?";
export const SINTESE = "Os coeficientes minimizam a log loss média das 16 propostas.";
export const SINTESE_2 = "Reduzir a perda de uma pode aumentar a de outras;";
export const NOTA_FORA = "Bom ajuste no treinamento não comprova desempenho fora da amostra.";
export const NOTA_ESTIMACAO = "Na amostra de treino, sem penalização e com pesos iguais.";
export const TITULO_GRAF_CURTO = "A contribuição de cada proposta";
export const RODAPE = "Exemplo didático";
