"use client";
import { useState } from "react";
import { Botao, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Codigo, Figura, PlanoLuas } from "../pecas";
import { LegendaLuas } from "../b3";
import { ACERTOS_LUAS, FONTE_LUAS, IRIS, LUAS, N_TESTE_LUAS, N_TREINO_LUAS, type ModeloLua } from "@/lib/capitulo12/dados";
import { ERROS } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 34 · c12p34 · Floresta aleatória: amostras e características sorteadas. Código da aula (RandomForestClassifier com 500
 * árvores e até 16 folhas) e a figura original; à esquerda, o plano das luas com o seletor floresta (rf500) ou bagging
 * (bag500), a região de decisão, os pontos de teste e os erros circulados (LUAS.modelos, base.json). A leitura assume
 * que a diferença é de um acerto e que os dois modelos diferem também em max_samples e max_leaf_nodes; com duas
 * características, o sorteio de cada divisão (max_features="sqrt", ⌊√2⌋ = 1) escolhe uma das duas. Estado inicial:
 * floresta; "Restaurar" volta a ela.
 */
const COD = [
  "from sklearn.ensemble import RandomForestClassifier",
  "",
  "rnd_clf = RandomForestClassifier(",
  "    n_estimators=500, max_leaf_nodes=16,",
  "    n_jobs=-1, random_state=42",
  ")",
  "rnd_clf.fit(X_train, y_train)",
];
const OPC: { v: ModeloLua; r: string; nome: string }[] = [
  { v: "rf500", r: "Floresta aleatória", nome: "Floresta aleatória, 500 árvores" },
  { v: "bag500", r: "Bagging de árvores", nome: "Bagging, 500 árvores" },
];
const N_CARAC = LUAS.treino.x[0].length;
const POR_DIVISAO = Math.max(1, Math.floor(Math.sqrt(N_CARAC)));

export function S34Floresta({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState<ModeloLua>("rf500");
  const o = OPC.find((x) => x.v === k)!, m = LUAS.modelos[k];
  const dif = ACERTOS_LUAS.rf500 - ACERTOS_LUAS.bag500;
  return (
    <Quadro slug="c12p34" pagina={pagina} layout="gl"
      conclusao={<>Floresta: <b>{num(LUAS.modelos.rf500.acc, 3)}</b> ({int(ACERTOS_LUAS.rf500)} de {int(N_TESTE_LUAS)}); bagging: {num(LUAS.modelos.bag500.acc, 3)} ({int(ACERTOS_LUAS.bag500)}). {int(Math.abs(dif))} {Math.abs(dif) === 1 ? "acerto" : "acertos"} de diferença, com outros hiperparâmetros também diferentes: aqui não se isola o efeito do sorteio. Na Iris, com {int(IRIS.nomes.length)} variáveis, a floresta também mede quais pesam mais (slide {SLIDE.c12p35.n}).</>}
      fonte={`${FONTE_LUAS}. Floresta: max_leaf_nodes=16, amostras bootstrap de ${int(N_TREINO_LUAS)}; bagging: max_samples=100, árvores sem limite. max_features="sqrt": ${int(POR_DIVISAO)} de ${int(N_CARAC)} características por divisão.`}>
      <Painel>
        <PlanoLuas regiao={m.grade} conjunto="teste" erros={m.pred} titulo={o.nome} sub={`${num(m.acc, 3)} no teste · ${int(ACERTOS_LUAS[k])} de ${int(N_TESTE_LUAS)}`}
          rotulo={`Região de decisão de ${o.nome.toLowerCase()} e os ${int(N_TESTE_LUAS)} pontos de teste: ${int(ERROS[k].length)} erros circulados`} arCelular="8 / 5" />
        <div className="q12-s34-rod">
          <Seg rotulo="Modelo mostrado" opcoes={OPC.map((x) => ({ v: x.v, r: <>{x.r} <small className="q12-s30-a">· {int(ACERTOS_LUAS[x.v])}</small></> }))} valor={k} onChange={setK} />
          <LegendaLuas treino={false} erros />
          <Botao sec onClick={() => setK("rf500")} desab={k === "rf500"}>Restaurar</Botao>
        </div>
      </Painel>
      <div className="q12-col">
        <Codigo linhas={COD} destaque={[3]} rotulo="Código da floresta aleatória de 500 árvores" compacto />
        <Painel className="q12-s34-dir">
          <Figura src="floresta" alt="Ilustração de árvores coloridas sobre colinas: uma floresta de árvores de decisão." credito="Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7" fundo={false} />
          <ul className="q12-b3-lista q12-b3-lista--peq">
            <li>Bagging de árvores, com amostras bootstrap.</li>
            <li>Cada divisão sorteia as características: árvores menos correlacionadas.</li>
            <li>Nas luas, {int(N_CARAC)} características: cada divisão sorteia {int(POR_DIVISAO)}.</li>
          </ul>
        </Painel>
      </div>
    </Quadro>
  );
}
