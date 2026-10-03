"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, Kpi, margens, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Codigo } from "../pecas";
import { BOOST, VERSOES } from "@/lib/capitulo12/dados";
import { preve } from "@/lib/capitulo12/metricas";
import { alvoDaEtapa, ETAPAS, XS } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 36 · c12p36 · Gradient boosting em três árvores: o código da aula em quatro partes (base de 100 pontos com y = 3x² +
 * ruído; árvore 1 em y; árvore 2 em y2 = y − h₁(x); árvore 3 em y3 = y2 − h₂(x)). O seletor de etapa acende o bloco de
 * código e o gráfico mostra o alvo daquela etapa (os 100 pontos de y, y2 ou y3) e a árvore ajustada a ele, em degraus.
 * Árvores de boosting() em metricas.ts (η = 1, profundidade 2), conferida contra DecisionTreeRegressor e
 * GradientBoostingRegressor no teste do capítulo; os pontos são BOOST.x e BOOST.y (base.json). O erro quadrático médio
 * depois de cada etapa vem de ETAPAS.mse. Estado inicial: etapa 1; "Restaurar" volta a ela.
 */
const COD = [
  "# Base",
  "np.random.seed(42)",
  "X_reg = np.random.rand(100, 1) - 0.5",
  "y_reg = 3 * X_reg[:, 0] ** 2 + 0.05 * np.random.randn(100)",
  "# 1: a primeira árvore ajusta os dados",
  "from sklearn.tree import DecisionTreeRegressor",
  "tree_reg1 = DecisionTreeRegressor(max_depth=2)",
  "tree_reg1.fit(X_reg, y_reg)",
  "# 2: a segunda ajusta o resíduo da primeira",
  "y2 = y_reg - tree_reg1.predict(X_reg)",
  "tree_reg2 = DecisionTreeRegressor(max_depth=2)",
  "tree_reg2.fit(X_reg, y2)",
  "# 3: a terceira ajusta o resíduo da segunda",
  "y3 = y2 - tree_reg2.predict(X_reg)",
  "tree_reg3 = DecisionTreeRegressor(max_depth=2)",
  "tree_reg3.fit(X_reg, y3)",
];
const BLOCO: Record<number, number[]> = { 1: [4, 5, 6, 7], 2: [8, 9, 10, 11], 3: [12, 13, 14, 15] };
const ALVO: Record<number, string> = { 1: "y", 2: "y2 = y − h₁(x)", 3: "y3 = y2 − h₂(x)" };
const ALVOS = [1, 2, 3].map((k) => alvoDaEtapa(k));
const N_PONTOS = BOOST.x.length;
const folhas = (a: (typeof ETAPAS.arvores)[number]): number => (typeof a === "number" ? 1 : folhas(a.esq) + folhas(a.dir));
if (ETAPAS.arvores.some((a) => folhas(a) !== 4)) throw new Error("s36: cada árvore de profundidade 2 deveria ter quatro folhas");
// a leitura diz que o erro cai a cada etapa
if (ETAPAS.mse.some((v, i) => i > 0 && v >= ETAPAS.mse[i - 1])) throw new Error("s36: o erro quadrático médio deveria cair a cada etapa");

export function S36BoostingCodigo({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(1);
  const alvo = ALVOS[k - 1], h = ETAPAS.arvores[k - 1];
  return (
    <Quadro slug="c12p36" pagina={pagina} layout="qd"
      conclusao={<>Etapa {int(k)}: a árvore ajusta {k === 1 ? "os dados" : `o resíduo, que vai de ${num(Math.min(...alvo), 2)} a ${num(Math.max(...alvo), 2)}`}, e o erro quadrático médio cai de {num(ETAPAS.mse[k - 1], 3)} para <b>{num(ETAPAS.mse[k], 3)}</b>. Cada árvore espera a anterior; a soma das três é o slide {SLIDE.c12p37.n}.</>}
      fonte={`${int(N_PONTOS)} pontos com np.random.seed(42), y = 3x² + 0,05 × ruído normal. Árvores de regressão de profundidade 2 ajustadas pelo critério do DecisionTreeRegressor; ${VERSOES}.`}>
      <div className="q12-col">
        <Codigo linhas={COD} destaque={BLOCO[k]} rotulo={`Código do boosting em três árvores; bloco aceso: etapa ${k}`} compacto />
        <ul className="q12-b3-lista q12-b3-lista--peq">
          <li>Treino sequencial: cada árvore espera a anterior.</li>
          <li>Árvores rasas, de profundidade 2, são aprendizes fracos: só quatro degraus cada.</li>
        </ul>
      </div>
      <Painel>
        <div className="q12-s36-cab">
          <Seg rotulo="Etapa do boosting" opcoes={[1, 2, 3].map((v) => ({ v, r: `Etapa ${v}` }))} valor={k} onChange={setK} />
          <Botao sec onClick={() => setK(1)} desab={k === 1}>Restaurar</Botao>
        </div>
        <Grafico titulo={`Alvo da etapa ${k}: ${ALVO[k]}`} sub={`e a árvore h${["₁", "₂", "₃"][k - 1]}(x) ajustada a ele`} arCelular="4 / 3"
          rotulo={`Etapa ${k}: ${N_PONTOS} pontos do alvo ${ALVO[k]} e a árvore de profundidade 2 em degraus`}>
          {(d) => {
            const m = margens(d.fs, { l: 3.4, b: 2.9, t: 1, r: 0.8 });
            const x = escala([-0.5, 0.5], [m.l, d.w - m.r]), y = escala([-0.3, 0.8], [d.h - m.b, m.t]);
            const deg = XS.map((v) => ({ x: x(v), y: y(preve(h, v)) }));
            return (
              <g>
                <Eixos x={x} y={y} xt={[-0.5, -0.25, 0, 0.25, 0.5]} yt={[-0.2, 0, 0.2, 0.4, 0.6, 0.8]} fx={(v) => num(v, 2)} fy={(v) => num(v, 1)} xTit="x" yTit={k === 1 ? "y" : `resíduo ${k === 2 ? "y2" : "y3"}`} />
                <line x1={x(-0.5)} x2={x(0.5)} y1={y(0)} y2={y(0)} stroke="#9AA1AD" strokeWidth={1.5} />
                {alvo.map((v, i) => k === 1
                  ? <circle key={i} cx={x(BOOST.x[i])} cy={y(v)} r={d.fs * 0.2} fill="#3D5A8A" />
                  : <path key={i} d={`M${x(BOOST.x[i]) - d.fs * 0.22} ${y(v)}h${d.fs * 0.44}M${x(BOOST.x[i])} ${y(v) - d.fs * 0.22}v${d.fs * 0.44}`} stroke="#3D5A8A" strokeWidth={1.6} />)}
                <path d={caminho(deg)} fill="none" stroke="#176C73" strokeWidth={d.fs * 0.17} strokeLinejoin="round" />
                <text className="q7-rot--peq" x={x(0)} y={y(0.8)} dy="1em" textAnchor="middle" style={{ fill: "#176C73", fontWeight: 700 }}>árvore h{["₁", "₂", "₃"][k - 1]}(x)</text>
                <text className="q7-rot--peq" x={x(-0.48)} y={y(-0.3)} dy="-.5em" style={{ fill: "#3D5A8A" }}>{k === 1 ? "● dados" : "+ resíduo de cada ponto"}</text>
              </g>
            );
          }}
        </Grafico>
        <div className="q7-kpis">
          <Kpi tam="mini" rotulo={k === 1 ? "Erro quadrático médio antes (previsão zero)" : `Erro quadrático médio depois da etapa ${k - 1}`} valor={num(ETAPAS.mse[k - 1], 3)} />
          <Kpi tam="mini" rotulo={`Erro quadrático médio depois da etapa ${k}`} valor={num(ETAPAS.mse[k], 3)} tom="prob" />
        </div>
      </Painel>
    </Quadro>
  );
}
