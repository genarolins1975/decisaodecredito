"use client";
import { useState } from "react";
import { Botao, Kpi, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Codigo, PlanoLuas } from "../pecas";
import { LegendaLuas } from "../b3";
import { ACERTOS_LUAS, FONTE_LUAS, LUAS, N_TESTE_LUAS, N_TREINO_LUAS } from "@/lib/capitulo12/dados";
import { UM_ACERTO } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 30 · c12p30 · Bagging com 500 árvores supera a árvore única. Código da aula (BaggingClassifier de árvores, 500
 * estimadores, max_samples=100, bootstrap) com o número de árvores aceso; KPIs do bagging de 500 (0,904, 113 de 125) e da
 * árvore única (0,856, 107). O seletor troca o número de árvores (1, 5, 25, 100, 500; LUAS.baggingN, mesma semente) e
 * o plano mostra a região de decisão e os pontos de teste; cada botão traz os acertos, e a leitura assume o que eles
 * mostram: a curva não é monotônica (5 e 100 árvores acertam mais que 500) e as diferenças são de poucos acertos.
 * Estado inicial: 500 árvores, o modelo da aula; "Restaurar" volta a ele.
 */
const NS = Object.keys(LUAS.baggingN).map(Number).sort((a, b) => a - b);
const BN = LUAS.baggingN as Record<string, { acc: number; acertos: number; grade: string }>;
const N0 = 500, MAX_S = 100;
const MELHOR = Math.max(...NS.map((n) => BN[n].acertos));
const NS_MELHOR = NS.filter((n) => BN[n].acertos === MELHOR);
const monotonica = NS.every((n, i) => i === 0 || BN[n].acertos >= BN[NS[i - 1]].acertos);
if (BN[N0].acertos !== ACERTOS_LUAS.bag500) throw new Error("s30: baggingN[500] deveria ser o bag500");
if (LUAS.modelos.arvore.accTreino !== 1) throw new Error("s30: a árvore única deveria acertar todo o treino");
if (monotonica) throw new Error("s30: a leitura afirma que a curva não é monotônica");
const codigo = (n: number) => [
  "from sklearn.ensemble import BaggingClassifier",
  "from sklearn.tree import DecisionTreeClassifier",
  "",
  "bag_clf = BaggingClassifier(",
  "    DecisionTreeClassifier(random_state=42),",
  `    n_estimators=${n}, max_samples=${MAX_S},`,
  "    bootstrap=True, n_jobs=-1, random_state=42",
  ")",
  "bag_clf.fit(X_train, y_train)",
  "y_pred = bag_clf.predict(X_test)",
];
const lista = (v: number[]) => v.map((n) => int(n)).join(" e ");

export function S30Bagging500({ pagina }: { pagina?: Pagina }) {
  const [n, setN] = useState(N0);
  const b = BN[n];
  return (
    <Quadro slug="c12p30" pagina={pagina} layout="gg"
      conclusao={<>Com {int(N0)} árvores, <b>{int(BN[N0].acertos)} de {int(N_TESTE_LUAS)}</b>, {int(BN[N0].acertos - ACERTOS_LUAS.arvore)} acertos acima da árvore única. A curva não é monotônica: {lista(NS_MELHOR)} árvores acertam {int(MELHOR)}. Cada acerto vale {num(UM_ACERTO * 100, 1)} ponto; o que muda de forma estável é a fronteira (slide {SLIDE.c12p31.n}).</>}
      fonte={`${FONTE_LUAS}. Mesma semente (random_state=42) para todo número de árvores; acertos no teste de ${int(N_TESTE_LUAS)}.`}>
      <Painel className="q12-s30-g">
        <PlanoLuas regiao={b.grade} conjunto="teste" titulo={`Bagging com ${int(n)} ${n === 1 ? "árvore" : "árvores"}`} sub={`${num(b.acc, 3)} no teste · ${int(b.acertos)} de ${int(N_TESTE_LUAS)}`}
          rotulo={`Região de decisão do bagging com ${int(n)} árvores e os ${int(N_TESTE_LUAS)} pontos de teste: ${int(b.acertos)} acertos`} arCelular="8 / 5" />
        <p className="q7-k">Número de árvores · acertos no teste</p>
        <Seg rotulo="Número de árvores do bagging" opcoes={NS.map((v) => ({ v, r: <>{int(v)} <small className="q12-s30-a">· {int(BN[v].acertos)}</small></> }))} valor={n} onChange={setN} />
        <div className="q12-s30-rod"><LegendaLuas treino={false} /><Botao sec onClick={() => setN(N0)} desab={n === N0}>Restaurar</Botao></div>
      </Painel>
      <div className="q12-col">
        <Codigo linhas={codigo(n)} destaque={[5]} rotulo={`Código do bagging com ${n} árvores e ${MAX_S} instâncias por árvore`} compacto />
        <div className="q7-kpis">
          <Kpi rotulo={`Bagging, ${int(N0)} árvores`} valor={num(LUAS.modelos.bag500.acc, 3)} detalhe={`${int(ACERTOS_LUAS.bag500)} acertos em ${int(N_TESTE_LUAS)}`} tom="prob" />
          <Kpi rotulo="Árvore única" valor={num(LUAS.modelos.arvore.acc, 3)} detalhe={`${int(ACERTOS_LUAS.arvore)} acertos em ${int(N_TESTE_LUAS)}`} />
        </div>
        <ul className="q12-b3-lista q12-b3-lista--peq">
          <li><b>max_samples={MAX_S}</b>: cada árvore vê {int(MAX_S)} das {int(N_TREINO_LUAS)} instâncias.</li>
          <li>A árvore única vê as {int(N_TREINO_LUAS)} e cresce até separar todas.</li>
        </ul>
      </div>
    </Quadro>
  );
}
