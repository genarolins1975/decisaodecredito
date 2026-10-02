/**
 * Dados e modelos do capítulo 6, lidos de src/lib/capitulo6/base.json (montado por scripts/capitulo6/montar-base.mjs).
 * Três escalas do mesmo caso:
 *   DIDATICA   as 16 propostas dos capítulos 4 e 5 (utilização e atraso), para fazer o algoritmo à mão;
 *   AJUSTE e VALIDACAO  as 2.103 propostas do treino do curso, sorteadas em 1.472 e 631 (semente 20260601); a base não
 *              traz a safra por proposta, então esta validação é aleatória, não temporal;
 *   OOT        as 737 propostas da janela fora do tempo, as mesmas do capítulo 7, com a PD verdadeira do gerador.
 * Variáveis, nesta ordem: utilização do limite (%), atraso máximo em 6 meses (dias), score de bureau.
 */
import base from "./base.json";
import { ajustar, type Opcoes } from "./gbm";
import { ajustarLogistica } from "./logistica";

const linhas = (d: { util: number[]; atr: number[]; sc: number[] }) => d.util.map((_, i) => [d.util[i], d.atr[i], d.sc[i]]);
export const VARIAVEIS = ["Utilização", "Atraso", "Score"] as const;
export const UNIDADE = ["%", " dias", ""] as const;

export const XA = linhas(base.ajuste), YA = base.ajuste.y as number[];
export const XV = linhas(base.validacao), YV = base.validacao.y as number[];
export const XO = linhas(base.oot), YO = base.oot.y as number[], PT = base.oot.pt as number[];
export const NA = YA.length, NV = YV.length, NO = YO.length;

export type PropostaD = { id: number; util: number; atraso: number; y: number };
export const DIDATICA = base.didatica as PropostaD[];
export const XD = DIDATICA.map((p) => [p.util, p.atraso]), YD = DIDATICA.map((p) => p.y);
export const CFG_DIDATICA: Opcoes = { eta: 0.4, arvores: 4, profundidade: 2, minFolha: 2 };

/** Configuração de referência do capítulo para a carteira: tocos não, profundidade 2, taxa 0,1, até 300 árvores. */
export const CFG_CARTEIRA: Opcoes = { eta: 0.1, arvores: 300, profundidade: 2, minFolha: 40 };

/** Candidato do comitê (capítulo 7): o boosting completo do gerador, com sete variáveis. Agregados, sem vetores. */
export const GRID = base.grid as { max_iter: number; max_leaf_nodes: number; auc_val: number; auc_treino: number; auc_oot: number }[];
export const HP_CANDIDATO = base.meta.gbm_hp as { max_iter: number; max_leaf_nodes: number; learning_rate: number; min_samples_leaf: number; l2_regularization: number; auc_val: number };
export const RES = base.res;

const cache = new Map<string, ReturnType<typeof ajustar>>();
/** Ajuste memorizado por configuração (os quadros pedem os mesmos modelos várias vezes). */
export function modelo(o: Opcoes, X = XA, y = YA) {
  const k = JSON.stringify([o, X === XA ? "A" : X === XD ? "D" : X.length]);
  let m = cache.get(k); if (!m) { m = ajustar(X, y, o); cache.set(k, m); } return m;
}
export const LOGISTICA = ajustarLogistica(XA, YA);
