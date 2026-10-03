/**
 * Dados do capítulo 12, todos de src/lib/capitulo12/base.json (gerado por scripts/capitulo12/referencia.py) e
 * derivados aqui pelas funções de metricas.ts. Nenhum número dos quadros é digitado: os quadros importam daqui.
 */
import base from "./base.json";
import { acertos, avaliaCorte, curvaPorLimiar, foraDaAmostra, metricas, trivial, type Histograma, type Regra } from "./metricas";

export const BASE = base;
export const VERSOES = `scikit-learn ${base.versoes["scikit-learn"]}`;

/* MNIST: detector de 5 com SGD, validação cruzada em três partes no treino de 60.000 */
export const MN = base.mnist;
export const CV = { vp: MN.cv.tp, fp: MN.cv.fp, fn: MN.cv.fn, vn: MN.cv.tn };
export const M_SGD = metricas(CV);
export const M_TRIVIAL = trivial(M_SGD.positivos, M_SGD.negativos);
export const HIST: Histograma = MN.hist;
export const HIST_RF: Histograma = MN.histFloresta;
export const CURVA_SGD = curvaPorLimiar(HIST);
export const CURVA_RF = curvaPorLimiar(HIST_RF);
export const INDICE_ZERO = HIST.bordas.indexOf(0);
export const AUC_SGD = MN.auc, AUC_RF = MN.aucFloresta;
export const TESTE = metricas({ vp: MN.teste.tp, fp: MN.teste.fp, fn: MN.teste.fn, vn: MN.teste.tn });
export const EXEMPLOS = MN.exemplos;
export const CONTAGEM_DIGITOS = MN.contagemDigitos;
export const FONTE_MNIST = `MNIST (OpenML mnist_784, versão 1): 60.000 imagens de treino, ${M_SGD.positivos.toLocaleString("pt-BR")} delas de 5. SGDClassifier(loss="hinge", random_state=42), validação cruzada em três partes; ${VERSOES}`;

/* luas: make_moons(500, ruído 0,30, semente 42), 375 de treino e 125 de teste */
export const LUAS = base.luas;
export const N_TREINO_LUAS = LUAS.treino.y.length, N_TESTE_LUAS = LUAS.teste.y.length;
export type ModeloLua = keyof typeof LUAS.modelos;
export const ACERTOS_LUAS = Object.fromEntries(Object.entries(LUAS.modelos).map(([k, m]) => [k, acertos(m.pred, LUAS.teste.y)])) as Record<ModeloLua, number>;
export const FONTE_LUAS = `make_moons(n_samples=500, noise=0.30, random_state=42); train_test_split(random_state=42): ${N_TREINO_LUAS} de treino, ${N_TESTE_LUAS} de teste; ${VERSOES}`;

/* Iris e boosting */
export const IRIS = base.iris;
export const BOOST = base.boosting;
export const FORA_375 = foraDaAmostra(N_TREINO_LUAS);

/* caso de crédito: tabelas do material da aula */
export const CASO = base.caso;
export type NomeRegra = "politica" | "never_paid" | "combinada";
export const REGRAS: { id: NomeRegra; nome: string; usa: string }[] = [
  { id: "politica", nome: "Política BACEN", usa: "Ausência de informação no BACEN (bancarização precária)" },
  { id: "never_paid", nome: "Never Paid", usa: "Modelo com cadastro e informações do BACEN" },
  { id: "combinada", nome: "Política e modelo", usa: "As duas regras combinadas" },
];
export const CORTE = {
  curto: Object.fromEntries(REGRAS.map((r) => [r.id, avaliaCorte(CASO.curto.regras[r.id] as unknown as Regra)])) as Record<NomeRegra, ReturnType<typeof avaliaCorte>>,
  longo: Object.fromEntries(REGRAS.map((r) => [r.id, avaliaCorte(CASO.longo.regras[r.id] as unknown as Regra)])) as Record<NomeRegra, ReturnType<typeof avaliaCorte>>,
};
export const META_VOLUME = 0.1;
export const FONTE_CASO = "Caso de crédito do material da aula: contratos por regra e grupo (quadros do apêndice); precisão e recall com o mau como classe positiva; cálculo próprio";
