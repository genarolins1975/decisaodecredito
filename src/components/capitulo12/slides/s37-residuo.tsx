"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Formula, Grafico, Kpi, Legenda, margens, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Figura } from "../pecas";
import { BOOST, VERSOES } from "@/lib/capitulo12/dados";
import { boosting } from "@/lib/capitulo12/metricas";
import { XS } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 37 · c12p37 · Gradient boosting: cada árvore ajusta o resíduo. Figura original (Géron, cap. 7: em cada linha, a árvore
 * da etapa e a previsão acumulada) à esquerda; ŷ(x) = h₁(x) + h₂(x) + h₃(x) em KaTeX. Experimento nativo: número de
 * árvores M (1 a 10) e taxa de aprendizado η (0,1 a 1); o gráfico mostra a previsão acumulada sobre os 100 pontos (com a
 * da etapa anterior tracejada) e, embaixo, o erro quadrático médio de treino por etapa. Tudo de boosting(BOOST.x,
 * BOOST.y, M, η) em metricas.ts, conferido contra GradientBoostingRegressor(init="zero") no teste do capítulo. Estado
 * inicial: M = 3 e η = 1, as três árvores da aula; "Restaurar" volta a ele.
 */
const M0 = 3, ETA0 = 1, MMAX = 10;
const N_PONTOS = BOOST.x.length;

export function S37Residuo({ pagina }: { pagina?: Pagina }) {
  const [mm, setM] = useState(M0);
  const [eta, setEta] = useState(ETA0);
  const b = useMemo(() => boosting(BOOST.x, BOOST.y, MMAX, eta), [eta]);
  const atual = XS.map((v) => b.preve(v, mm)), antes = XS.map((v) => b.preve(v, mm - 1));
  const mse = b.mse[mm];
  const inicial = mm === M0 && eta === ETA0;
  const caiuSempre = b.mse.slice(0, mm + 1).every((v, i, a) => i === 0 || v < a[i - 1]);
  return (
    <Quadro slug="c12p37" pagina={pagina} layout="um"
      conclusao={<>Com {int(mm)} {mm === 1 ? "árvore" : "árvores"} e η = {num(eta, 1)}, o erro quadrático médio de treino vai de {num(b.mse[0], 3)} a <b>{num(mse, 3)}</b>{caiuSempre ? ", caindo a cada etapa" : ""}. Com η menor, cada árvore corrige só uma parte e são precisas mais árvores. Síntese do bloco: slide {SLIDE.c12p38.n}.</>}
      fonte={`${int(N_PONTOS)} pontos da aula (np.random.seed(42)); árvores de regressão de profundidade 2, previsão inicial zero; erro medido no treino. ${VERSOES}.`}>
      <div className="q12-s37">
        <Painel className="q12-s37-fig">
          <Figura src="boosting-residuos" alt="Três linhas de gráficos: à esquerda, os resíduos e a árvore de cada etapa; à direita, a previsão acumulada, que acompanha cada vez melhor a curva dos dados." credito="Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7" fundo={false} />
          <p className="q7-nota">Cada linha é uma etapa: à esquerda, a árvore da etapa; à direita, a previsão acumulada.</p>
        </Painel>
        <Painel className="q12-s37-g">
          <Grafico titulo={`Previsão acumulada com ${int(mm)} ${mm === 1 ? "árvore" : "árvores"}`} sub={`η = ${num(eta, 1)}`} arCelular="4 / 3"
            rotulo={`Previsão acumulada do boosting com ${int(mm)} árvores e taxa ${num(eta, 1)} sobre os ${int(N_PONTOS)} pontos; erro quadrático médio ${num(mse, 3)}`}>
            {(d) => {
              const m = margens(d.fs, { l: 3.2, b: 2.6, t: 0.8, r: 0.8 });
              const x = escala([-0.5, 0.5], [m.l, d.w - m.r]), y = escala([-0.1, 0.8], [d.h - m.b, m.t]);
              return (
                <g>
                  <Eixos x={x} y={y} xt={[-0.5, -0.25, 0, 0.25, 0.5]} yt={[0, 0.2, 0.4, 0.6, 0.8]} fx={(v) => num(v, 2)} fy={(v) => num(v, 1)} xTit="x" yTit="y" />
                  {BOOST.x.map((v, i) => <circle key={i} cx={x(v)} cy={y(BOOST.y[i])} r={d.fs * 0.18} fill="#3D5A8A" />)}
                  {mm > 1 && <path d={caminho(XS.map((v, i) => ({ x: x(v), y: y(antes[i]) })))} fill="none" stroke="#9AA1AD" strokeWidth={2} strokeDasharray="6 5" />}
                  <path d={caminho(XS.map((v, i) => ({ x: x(v), y: y(atual[i]) })))} fill="none" stroke="#176C73" strokeWidth={d.fs * 0.16} strokeLinejoin="round" />
                </g>
              );
            }}
          </Grafico>
          <Legenda itens={[{ mk: "circ ord", r: "dados" }, { mk: "linha prob", r: `ŷ com ${int(mm)}` }, ...(mm > 1 ? [{ mk: "trac mudo", r: `ŷ com ${int(mm - 1)}` }] : [])]} />
          <Grafico titulo="Erro quadrático médio de treino" sub="por número de árvores" arCelular="16 / 6" estilo={{ flex: "0 0 32%" }}
            rotulo={`Erro quadrático médio por número de árvores: ${b.mse.slice(0, mm + 1).map((v, i) => `${i}: ${num(v, 3)}`).join("; ")}`}>
            {(d) => {
              const m = margens(d.fs, { l: 3.2, b: 2.2, t: 0.6, r: 0.8 });
              const x = escala([0, MMAX], [m.l, d.w - m.r]), y = escala([0, 0.13], [d.h - m.b, m.t]);
              const pts = b.mse.map((v, i) => ({ x: x(i), y: y(v) }));
              return (
                <g>
                  <Eixos x={x} y={y} xt={[0, 2, 4, 6, 8, 10]} yt={[0, 0.06, 0.12]} fx={(v) => int(v)} fy={(v) => num(v, 2)} />
                  <path d={caminho(pts)} fill="none" stroke="#C9CDD5" strokeWidth={2} />
                  <path d={caminho(pts.slice(0, mm + 1))} fill="none" stroke="#176C73" strokeWidth={2.5} />
                  {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={d.fs * (i === mm ? 0.36 : 0.2)} fill={i <= mm ? "#176C73" : "#C9CDD5"} stroke={i === mm ? "#fff" : "none"} strokeWidth={2} />)}
                  <text className="q7-rot--peq" x={pts[mm].x} y={pts[mm].y} dx={mm > 7 ? "-.6em" : ".6em"} dy="-.6em" textAnchor={mm > 7 ? "end" : "start"} style={{ fill: "#176C73", fontWeight: 700 }}>{num(mse, 3)}</text>
                </g>
              );
            }}
          </Grafico>
        </Painel>
        <Painel className="q12-s37-dir">
          <Formula f={String.raw`\hat y(x)=h_1(x)+h_2(x)+h_3(x)`} compacta />
          <Controle rotulo="Número de árvores, M" valor={mm} min={1} max={MMAX} passo={1} onChange={setM} mostrar={int(mm)} escala={["1", int(MMAX)]} />
          <Controle rotulo="Taxa de aprendizado, η" valor={eta} min={0.1} max={1} passo={0.1} onChange={(v) => setEta(Math.round(v * 10) / 10)} mostrar={num(eta, 1)} escala={["0,1", "1"]} />
          <div className="q12-s37-kpi">
            <Kpi tam="mini" rotulo={`Erro quadrático médio, ${int(mm)} ${mm === 1 ? "árvore" : "árvores"}`} valor={num(mse, 3)} tom="prob" />
            <Botao sec onClick={() => { setM(M0); setEta(ETA0); }} desab={inicial}>Restaurar</Botao>
          </div>
          <ul className="q12-b3-lista q12-b3-lista--peq">
            <li><b>Por que gradiente</b>: com perda quadrática, o resíduo y − ŷ é o gradiente negativo da perda.</li>
            <li>Na prática, cada correção é reduzida pela taxa de aprendizado η.</li>
          </ul>
        </Painel>
      </div>
    </Quadro>
  );
}
