/**
 * Roteiro do capítulo 6, gradient boosting com árvores: a ordem, a pergunta de cada slide, o título (afirmação ou
 * pergunta útil), o nível e o tempo. Os quadros leem daqui e a camada capitulo6ReconstruidoV19 do material de origem
 * usa os mesmos títulos.
 *
 * Arco:
 *   gancho    o boosting que o comitê julga no capítulo 7 ordenou o treino com AUC 0,8196 e a validação com 0,6476;
 *   pergunta  como somar árvores pequenas, cada uma corrigindo o erro das anteriores, produz uma PD?
 *   tensão    cada árvore costuma reduzir a perda de treino; taxa, profundidade e número de árvores aceleram o ganho;
 *   virada    na validação, a perda volta a subir depois de poucas árvores, e com três variáveis a logística valida melhor;
 *   decisão   complexidade escolhida na validação, monotonia, nível conferido e PD explicada: o boosting vai ao comitê
 *             como desafiante, com essas provas.
 * Caso: as propostas do curso em três escalas, ligadas na tela: 16 propostas para fazer o algoritmo à mão (as mesmas dos
 * capítulos 4 e 5), 2.103 do treino para rodar o mesmo algoritmo (1.472 de ajuste e 631 de validação) e o candidato
 * com sete variáveis que o comitê julga no capítulo 7.
 */
import type { Nivel, Pergunta, Slide } from "@/lib/capitulo7/roteiro";
import { num } from "../capitulo7/formato";
import base from "./base.json";

/** Queda de AUC do candidato do treino à validação temporal do gerador, com a mesma casa decimal do slide 1. */
const QUEDA_GBM = base.res.gbm_treino.auc - base.res.gbm_val.auc;
const N_DIDATICA = base.didatica.length;

export const PERGUNTAS: { id: Exclude<Pergunta, "todas" | "apoio">; nome: string; frase: string }[] = [
  { id: "ordenacao", nome: "Mecanismo", frase: "Como somar árvores pequenas, cada uma corrigindo a anterior, produz uma PD?" },
  { id: "probabilidade", nome: "Probabilidade", frase: "O que a PD do boosting afirma, em que escala, e como explicá-la proposta a proposta?" },
  { id: "decisao", nome: "Controle", frase: "Que escolhas controlam a complexidade, e o que cada uma troca?" },
  { id: "validacao", nome: "Prova", frase: "O ganho do treino se sustenta em propostas que o modelo não viu?" },
];

export const ROTEIRO: Slide[] = [
  { slug: "c6p1", n: 1, pergunta: "todas", titulo: `Do treino à validação, o boosting perdeu ${num(QUEDA_GBM, 3)} de AUC`, sub: "Parte da queda é a safra, parte é decoreba. Como o boosting se forma? O comitê do capítulo 7 vai julgá-lo.", nivel: "essencial", min: 4 },
  { slug: "c6p2", n: 2, pergunta: "ordenacao", titulo: "Escolher, votar ou corrigir: o boosting corrige em sequência", sub: "Três maneiras de combinar árvores; só uma usa o erro da anterior.", nivel: "essencial", min: 3 },
  { slug: "c6p3", n: 3, pergunta: "ordenacao", titulo: "O palpite inicial são as log odds da carteira", sub: "Dezesseis propostas, as mesmas dos capítulos 4 e 5, e um único número para todas.", nivel: "essencial", min: 3 },
  { slug: "c6p4", n: 4, pergunta: "ordenacao", titulo: "O erro de cada proposta vira o alvo da próxima árvore", sub: "Em log loss, menos o gradiente na escala de log odds é y − p.", nivel: "essencial", min: 4 },
  { slug: "c6p5", n: 5, pergunta: "ordenacao", titulo: "A primeira árvore separa onde o palpite errou", sub: "Com palpite único, ela separa os mesmos grupos que uma árvore de default; a diferença aparece da segunda árvore em diante.", nivel: "essencial", min: 4 },
  { slug: "c6p6", n: 6, pergunta: "ordenacao", titulo: "O valor da folha é um passo de Newton, não a média do erro", sub: "A soma dos erros dividida pela soma de p(1 − p): é o que o scikit-learn usa.", nivel: "essencial", min: 3 },
  { slug: "c6p7", n: 7, pergunta: "ordenacao", titulo: "Taxa de aprendizagem: um pedaço menor da correção desce mais devagar no treino", sub: `Nas ${N_DIDATICA} propostas, taxas perto de 1 descem mais rápido; a taxa pequena não serve ao treino, e quem a julga é a validação (slides 14 e 15).`, nivel: "essencial", min: 3 },
  { slug: "c6p8", n: 8, pergunta: "ordenacao", titulo: "Nas quatro árvores, a perda de treino cai", sub: "Quatro correções nas dezesseis propostas, com a PD de cada uma se movendo.", nivel: "essencial", min: 4 },
  { slug: "c6p9", n: 9, pergunta: "probabilidade", titulo: "A PD final se decompõe em parcelas rastreáveis", sub: "Palpite mais η vezes cada folha, em log odds; a sigmoide só no fim.", nivel: "aprofundamento", min: 3 },
  { slug: "c6p10", n: 10, pergunta: "ordenacao", titulo: "A fórmula de Friedman resume os passos já vistos", sub: "Cada termo do algoritmo é uma peça dos slides anteriores.", nivel: "aprofundamento", min: 3 },
  { slug: "c6p11", n: 11, pergunta: "validacao", titulo: "O mesmo algoritmo em 1.472 propostas: o treino sempre melhora", sub: "Utilização, atraso e score de bureau; a validação sorteada são 631 propostas que o modelo não viu.", nivel: "essencial", min: 4 },
  { slug: "c6p12", n: 12, pergunta: "decisao", titulo: "Profundidade é a ordem de interação", sub: "Com tocos, cada variável age sozinha; com profundidade 2, o efeito de uma depende da outra.", nivel: "aprofundamento", min: 3 },
  { slug: "c6p13", n: 13, pergunta: "decisao", titulo: "Quatro controles mexem na mesma complexidade", sub: "Taxa, número de árvores, profundidade e mínimo por folha, medidos no ajuste e na validação.", nivel: "essencial", min: 4 },
  { slug: "c6p14", n: 14, pergunta: "decisao", titulo: "Metade da taxa pede o dobro de árvores", sub: "Taxa e número de árvores andam juntos: escolher um sem o outro não faz sentido.", nivel: "aprofundamento", min: 3 },
  { slug: "c6p15", n: 15, pergunta: "validacao", titulo: "A validação diz quando parar", sub: "A perda de validação desce e volta a subir; o ponto mais baixo escolhe o número de árvores.", nivel: "essencial", min: 4 },
  { slug: "c6p16", n: 16, pergunta: "decisao", titulo: "Sortear propostas regulariza longe da parada; perto dela, o efeito some no ruído", sub: "O boosting estocástico de Friedman (2002): cada árvore vê só uma parte do ajuste.", nivel: "aprofundamento", min: 3 },
  { slug: "c6p17", n: 17, pergunta: "validacao", titulo: "Com três variáveis, a logística valida melhor", sub: "O boosting só ganha quando há interação ou forma que a logística não captura.", nivel: "essencial", min: 3 },
  { slug: "c6p18", n: 18, pergunta: "probabilidade", titulo: "Árvores demais distorcem as PDs, mesmo com a média certa", sub: "Parado pela validação, o nível cabe no ruído; com mais árvores, as PDs exageram. O capítulo 7 mede e corrige.", nivel: "essencial", min: 3 },
  { slug: "c6p19", n: 19, pergunta: "probabilidade", titulo: "Por que esta PD? A contribuição de cada variável", sub: "Contribuições de Shapley pelo caminho das árvores somam exatamente a log odds da proposta.", nivel: "essencial", min: 4 },
  { slug: "c6p20", n: 20, pergunta: "decisao", titulo: "PD que cai quando o atraso sobe? Restrição monotônica", sub: "O modelo livre pode contrariar a lógica de crédito em trechos com poucos dados.", nivel: "essencial", min: 3 },
  { slug: "c6p21", n: 21, pergunta: "todas", titulo: "O candidato do comitê: o que o boosting precisa provar", sub: "Sete variáveis, hiperparâmetros escolhidos na validação, e a lista que o validador independente confere.", nivel: "essencial", min: 4 },
  { slug: "c6p22", n: 22, pergunta: "apoio", titulo: "Apêndice: fórmulas, fronteira e referências", sub: "Material de consulta; o percurso da aula termina no slide anterior.", nivel: "apendice", min: 3 },
];

export const SLIDE = Object.fromEntries(ROTEIRO.map((s) => [s.slug, s])) as Record<string, Slide>;
export const TOTAL = ROTEIRO.length;
export const minutos = (nivel?: Nivel) => ROTEIRO.filter((s) => (nivel ? s.nivel === nivel : s.nivel !== "apendice")).reduce((a, s) => a + s.min, 0);

/** Rótulo curto de cada slide, para o mapa do slide 1 e o fecho. */
export const CURTO: Record<string, string> = {
  c6p1: "Mapa", c6p2: "Escolher, votar, corrigir", c6p3: "Palpite inicial", c6p4: "Erro como alvo", c6p5: "Primeira árvore",
  c6p6: "Passo de Newton", c6p7: "Taxa de aprendizagem", c6p8: "Perda que cai", c6p9: "Parcelas da PD", c6p10: "Fórmula de Friedman",
  c6p11: "Na carteira", c6p12: "Profundidade", c6p13: "Quatro controles", c6p14: "Taxa e árvores", c6p15: "Quando parar",
  c6p16: "Subamostra", c6p17: "Logística como referência", c6p18: "Nível das PDs", c6p19: "Contribuições", c6p20: "Monotonia",
  c6p21: "Candidato do comitê", c6p22: "Apêndice",
};

/** Declaração da base que o Quadro acrescenta à fonte de cada slide deste capítulo. */
export const BASE_C6 = "Base sintética do curso (semente 20260501); treino das safras 2022-01 a 2023-02, dividido em ajuste e validação por sorteio (semente 20260601)";
