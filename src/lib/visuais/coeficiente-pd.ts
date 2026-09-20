/**
 * Slide 10 do capítulo 4 (c4p10): verificação da leitura de um coeficiente. O enunciado é fixo (utilização de 70%
 * para 80%, atraso mantido em 5 dias) e o aluno escolhe entre três interpretações; a conferência mostra a
 * demonstração numérica calculada pelo modelo. Coeficientes e sigmoide vêm de logit-slides.ts, com precisão
 * integral e arredondamento só na exibição. A leitura vale mantidas as demais variáveis constantes, em um modelo
 * de termos lineares sem interação entre utilização e atraso.
 */
import { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, fmtPp, sigmoide } from "./logit-slides";

export { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, fmtPp, sigmoide };

export const CASO = { utilDe: 70, utilPara: 80, atraso: 5 } as const;

/** Escore da proposta: as duas parcelas entram divididas por 10, que é a unidade dos coeficientes. */
export const escore = (util: number, atraso: number) => BETA0 + BETA1 * (util / 10) + BETA2 * (atraso / 10);

/** A demonstração: Δx em unidades da variável, Δz = β × Δx e as duas PDs, sem arredondamento intermediário. */
export function demonstracao() {
  const { utilDe, utilPara, atraso } = CASO;
  const dx = (utilPara - utilDe) / 10;
  const z0 = escore(utilDe, atraso), z1 = escore(utilPara, atraso);
  const pd0 = sigmoide(z0), pd1 = sigmoide(z1);
  return { dx, dz: z1 - z0, beta: BETA1, z0, z1, pd0, pd1, deltaPd: (pd1 - pd0) * 100, multiplicador: Math.exp(z1 - z0) };
}

export type Alternativa = { id: "A" | "B" | "C"; texto: string; correta: boolean; tituloFeedback: string; feedback: string };

export const ALTERNATIVAS: Alternativa[] = [
  { id: "A", texto: "A PD aumenta 0,7453 ponto percentual.", correta: false,
    tituloFeedback: "Você confundiu as escalas",
    feedback: "0,7453 é o incremento no escore em log odds. A mudança na PD precisa ser calculada pela função logística." },
  { id: "B", texto: "O escore em log odds aumenta 0,7453, mantendo o atraso constante.", correta: true,
    tituloFeedback: "Correto: o acréscimo ocorre no escore",
    feedback: "+10 pp correspondem a uma unidade da variável. Portanto, Δz = 0,7453 × 1." },
  { id: "C", texto: "A PD é multiplicada por 0,7453.", correta: false,
    tituloFeedback: "O coeficiente não é um multiplicador da PD",
    feedback: "O multiplicador das odds é exp(0,7453), aproximadamente 2,11. A PD exige outra transformação." },
];

export const alternativa = (id: string | null) => ALTERNATIVAS.find((a) => a.id === id) ?? null;

export const SITUACAO = [
  { k: "Utilização do limite", v: `${CASO.utilDe}% → ${CASO.utilPara}%`, n: `Variação: ${fmt(CASO.utilPara - CASO.utilDe, 0, true)} pp`, cor: "ambar" as const },
  { k: "Atraso observado", v: `${CASO.atraso} dias → ${CASO.atraso} dias`, n: "Mantido constante", cor: "roxo" as const },
  { k: "Coeficiente da utilização", v: `β = ${fmt(BETA1, 4)}`, n: "Por unidade de 10 pp", cor: "navy" as const },
];

export const ORIENTACAO = [
  "Quanto a característica mudou?",
  "Qual é a unidade do coeficiente?",
  "A frase fala de escore, odds ou PD?",
];
export const ORIENTACAO_FECHO = "Um coeficiente precisa ser interpretado com sua unidade e sua escala.";
export const NOTA_MODELO = "Considere o modelo apresentado, com termos lineares e sem interação entre utilização e atraso.";
export const SINTESE_ANTES = "Escolha uma interpretação e confira a mudança prevista pelo modelo.";
export const SINTESE_DEPOIS = "β soma no log odds. exp(β) multiplica as odds. A mudança na PD depende do ponto de partida.";
export const NOTA_CAUSAL = "Interpretação condicional do modelo; não estabelece causalidade por si só.";
export const DETALHE_K = "O que significa manter constante?";
export const DETALHE_T = `Comparamos duas previsões do modelo alterando apenas a utilização e mantendo o atraso em ${CASO.atraso} dias. Se essa combinação for rara nos dados, a comparação pode ter pouco suporte empírico. Uma interpretação causal exige hipóteses e uma estratégia de identificação adicionais.`;
export const RODAPE = "PD = probabilidade de default · pp = pontos percentuais · Exemplo didático";

/** As duas contas exibidas na demonstração, montadas a partir do caso e dos coeficientes. */
export function contas() {
  const d = demonstracao();
  return [
    `Δx = (${CASO.utilPara} − ${CASO.utilDe}) ÷ 10 = ${fmt(d.dx, 0)}`,
    `Δz = β × ${fmt(d.dx, 0)} = ${fmt(d.dz, 4)}`,
  ];
}
