/**
 * Cálculos puros do bloco 4 do capítulo 12 (crédito, síntese e apêndice): a tabela de AUC fora do tempo com variação
 * e Gini, a régua de IV de Siddiqi, os dois horizontes do caso e as frases quantificadoras que os quadros afirmam,
 * conferidas aqui (o módulo lança erro se o dado deixar de sustentar uma delas). Tudo sai de dados.ts e metricas.ts.
 */
import { CASO, CORTE, META_VOLUME, REGRAS, type NomeRegra } from "./dados";
import { gini } from "./metricas";

export type Horizonte = "curto" | "longo";
export const HORIZONTES: { v: Horizonte; nome: string; alvo: string; def: string }[] = [
  { v: "curto", nome: "Curto prazo", alvo: CASO.curto.alvo, def: "atraso nas três primeiras parcelas" },
  { v: "longo", nome: "Longo prazo", alvo: CASO.longo.alvo, def: "alvo de longo prazo do material" },
];
export const HZ = Object.fromEntries(HORIZONTES.map((h) => [h.v, h])) as Record<Horizonte, (typeof HORIZONTES)[number]>;

/** Os três modelos do caso no treino e na validação fora do tempo: variação relativa e Gini = 2 × AUC − 1. */
export const AUC_TEMPO = CASO.auc.map((a) => ({
  ...a,
  variacao: a.validacao / a.treino - 1,
  giniTreino: gini(a.treino), giniValidacao: gini(a.validacao),
  variacaoGini: gini(a.validacao) / gini(a.treino) - 1,
}));
/** O exemplo que o material classifica como sobreajuste é o de maior queda. */
export const BVS = AUC_TEMPO.reduce((m, a) => (a.variacao < m.variacao ? a : m));
export const QUEDAS_SIMPLES = AUC_TEMPO.filter((a) => a !== BVS);
if (!AUC_TEMPO.every((a) => a.validacao < a.treino)) throw new Error("b4: algum modelo não perde AUC fora do tempo");
if (!/BVS/.test(BVS.modelo)) throw new Error("b4: a maior queda não é a do exemplo BVS");
if (!QUEDAS_SIMPLES.every((a) => -a.variacao * 2 < -BVS.variacao)) throw new Error("b4: a queda do BVS não é mais que o dobro das outras");

/** Régua de IV de Siddiqi: fraco abaixo de 0,1, médio de 0,1 a 0,3, forte acima de 0,3. */
export const IV_FRACO = 0.1, IV_FORTE = 0.3;
export const forcaIV = (iv: number) => (iv < IV_FRACO ? "fraco" : iv <= IV_FORTE ? "médio" : "forte");

/** Regras que cumprem a meta de volume em cada horizonte, e a de maior recall. */
export const cumpreMeta = (h: Horizonte, r: NomeRegra) => CORTE[h][r].volume < META_VOLUME;
export const LIDER_RECALL = (h: Horizonte) => REGRAS.reduce((m, r) => (CORTE[h][r.id].recall > CORTE[h][m.id].recall ? r : m)).id;
for (const h of ["curto", "longo"] as Horizonte[]) {
  const ok = REGRAS.filter((r) => cumpreMeta(h, r.id)).map((r) => r.id);
  if (ok.length !== 1 || ok[0] !== "politica") throw new Error(`b4: no ${h} prazo, não é só a política que cumpre a meta`);
  if (LIDER_RECALL(h) !== "combinada") throw new Error(`b4: no ${h} prazo, a combinação não lidera o recall`);
  // todas concentram os maus no grupo removido
  if (!REGRAS.every((r) => CORTE[h][r.id].precisao > CORTE[h][r.id].taxaMaus && CORTE[h][r.id].mausNoResto < CORTE[h][r.id].taxaMaus)) throw new Error(`b4: alguma regra não concentra os maus no corte (${h})`);
}
/** "A combinação quase dobra o recall da política": razão entre 1,7 e 2. */
export const RAZAO_RECALL = CORTE.curto.combinada.recall / CORTE.curto.politica.recall;
if (!(RAZAO_RECALL > 1.7 && RAZAO_RECALL < 2)) throw new Error("b4: a combinação não quase dobra o recall da política");
/** O IV calculado arredonda para o declarado no material (três casas). */
for (const h of ["curto", "longo"] as Horizonte[]) for (const r of REGRAS) {
  const c = CORTE[h][r.id];
  if (Math.abs(c.iv - c.ivDeclarado) > 0.0015) throw new Error(`b4: IV calculado de ${r.id} (${h}) difere do declarado`);
}

/** Faixa de valores de uma métrica do corte entre as três regras. */
export const faixa = (h: Horizonte, f: (c: (typeof CORTE)["curto"]["politica"]) => number) => {
  const v = REGRAS.map((r) => f(CORTE[h][r.id]));
  return [Math.min(...v), Math.max(...v)] as const;
};

/**
 * A proposta do caso, citada do material da aula (slide do caso): é texto do material, não número calculado, e por
 * isso fica aqui, numa constante única, em vez de espalhada pelos quadros.
 */
export const PROPOSTA_MATERIAL = "6 ratings (4 premium e 2 populares); grupo de corte com mais de 60% de maus; rating A com 5%.";
