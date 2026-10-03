"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, margens, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Figura, MatrizReal } from "../pecas";
import { COR, sc } from "../b2";
import { CURVA_SGD, FONTE_MNIST, HIST, INDICE_ZERO, M_SGD } from "@/lib/capitulo12/dados";
import { confusaoNoIndice } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 18 · c12p18 · Subir o limiar troca recall por precisão. Precisão e recall do detector contra o limiar do score, um
 * ponto por borda do histograma da validação cruzada (CURVA_SGD), entre −50.000 e 25.000. O controle move o limiar
 * pelas bordas (contagem exata) e a linha vertical, com a matriz e os dois números ao lado; a marca cinza é o limiar 0
 * (a matriz do slide 11). O trecho em que a precisão cai ao subir o limiar é procurado no dado (a última queda) e
 * marcado. A figura original (Géron, cap. 3) é outra versão do experimento, com outra escala de score. Estado
 * inicial: limiar 0. "Restaurar" volta a ele.
 */
const DE = -50000, ATE = 25000;
const PTS = CURVA_SGD.filter((p) => p.limiar >= DE && p.limiar <= ATE && p.precisao !== null);
const I_MIN = PTS[0].i, I_MAX = PTS[PTS.length - 1].i;
// recall nunca sobe quando o limiar sobe (conferido em todas as bordas)
for (let k = 1; k < CURVA_SGD.length; k++) if (CURVA_SGD[k].recall > CURVA_SGD[k - 1].recall) throw new Error("s18: o recall subiu com o limiar");
// última queda da precisão ao subir o limiar, dentro da faixa desenhada
const QUEDA = (() => { for (let k = PTS.length - 1; k > 0; k--) if (PTS[k].precisao! < PTS[k - 1].precisao!) return { a: PTS[k - 1], b: PTS[k] }; return null; })();
if (!QUEDA) throw new Error("s18: a precisão não oscila na faixa desenhada");

export function S18PrecisaoRecall({ pagina }: { pagina?: Pagina }) {
  const [i, setI] = useState(INDICE_ZERO);
  const p = CURVA_SGD[i], c = confusaoNoIndice(HIST, i), zero = i === INDICE_ZERO;
  return (
    <Quadro slug="c12p18" pagina={pagina} layout="gl"
      conclusao={<>No limiar {sc(p.limiar)}: precisão <b>{p.precisao === null ? "indefinida" : pct(p.precisao, 1)}</b> e recall <b>{pct(p.recall, 1)}</b>{zero ? ", a matriz do slide " + SLIDE.c12p11.n : ""}. Precisão e recall dependem do limiar. Como comparar dois modelos sem escolher um? (slide {SLIDE.c12p19.n})</>}
      fonte={`${FONTE_MNIST}. Uma borda do histograma de scores por ponto (cerca de 100 imagens por faixa); previsto 5 quando score ≥ limiar.`}>
      <div className="q12-s18-esq">
        <Grafico rotulo={`Precisão e recall contra o limiar; no limiar ${sc(p.limiar)}, precisão ${p.precisao === null ? "indefinida" : pct(p.precisao, 1)} e recall ${pct(p.recall, 1)}`} arCelular="4 / 3"
          tabela={<table><caption>Precisão e recall por limiar (a cada vinte bordas)</caption><thead><tr><th>Limiar</th><th>Precisão</th><th>Recall</th></tr></thead><tbody>{PTS.filter((_, k) => k % 20 === 0).map((q) => <tr key={q.i}><td>{sc(q.limiar)}</td><td>{pct(q.precisao!, 1)}</td><td>{pct(q.recall, 1)}</td></tr>)}</tbody></table>}>
          {(d) => {
            const m = margens(d.fs, { l: 3.2, b: 2.8, t: 1.4, r: 1 });
            const x = escala([DE, ATE], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
            const xl = x(p.limiar), xa = x(QUEDA!.a.limiar), xb = x(QUEDA!.b.limiar);
            return (
              <g>
                <rect x={xl} y={m.t} width={Math.max(0, x(ATE) - xl)} height={y(0) - m.t} fill="#FBF2E5" />
                <Eixos x={x} y={y} xt={[-40000, -20000, 0, 20000]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={sc} fy={(v) => pct(v, 0)} xTit="Limiar do score" />
                <line x1={x(0)} x2={x(0)} y1={m.t} y2={y(0)} stroke={COR.mudo} strokeWidth={1.6} strokeDasharray="4 5" />
                {!zero && <text className="q7-rot--peq" x={x(0)} y={y(0)} dy="-.4em" dx=".3em" style={{ fill: COR.mudo }}>limiar 0</text>}
                <path className="q7-linha" stroke={COR.pos} d={caminho(PTS.map((q) => ({ x: x(q.limiar), y: y(q.precisao!) })))} />
                <path className="q7-linha" stroke="#00205B" strokeDasharray="10 6" d={caminho(PTS.map((q) => ({ x: x(q.limiar), y: y(q.recall) })))} />
                <text className="q7-rot" x={x(-38000)} y={y(PTS[0].precisao!)} dy="-.6em" style={{ fill: COR.pos }}>precisão</text>
                <text className="q7-rot" x={x(-38000)} y={y(0.99)} dy="1.2em" style={{ fill: "#00205B" }}>recall (só cai)</text>
                <ellipse cx={(xa + xb) / 2} cy={y((QUEDA!.a.precisao! + QUEDA!.b.precisao!) / 2)} rx={Math.max(d.fs * 1.2, (xb - xa) / 2 + d.fs * 0.6)} ry={d.fs * 1.4} fill="none" stroke={COR.erro} strokeWidth={2} strokeDasharray="5 4" />
                {d.w >= 500 && <text className="q7-rot--peq" x={x(ATE)} y={y(0.74)} textAnchor="end" style={{ fill: COR.erro, fontWeight: 600, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}><tspan x={x(ATE)}>precisão oscila no topo:</tspan><tspan x={x(ATE)} dy="1.15em">{`${pct(QUEDA!.a.precisao!, 1)} → ${pct(QUEDA!.b.precisao!, 1)}`}</tspan></text>}
                <line x1={xl} x2={xl} y1={m.t - d.fs * 0.3} y2={y(0)} stroke={COR.lim} strokeWidth={3} />
                {p.precisao !== null && <circle cx={xl} cy={y(p.precisao)} r={d.fs * 0.38} fill={COR.pos} stroke="#fff" strokeWidth={2} />}
                <rect x={xl - d.fs * 0.34} y={y(p.recall) - d.fs * 0.34} width={d.fs * 0.68} height={d.fs * 0.68} fill="#00205B" stroke="#fff" strokeWidth={2} />
                <text className="q7-corte-t" x={xl - d.fs * 0.35} y={m.t} dy=".6em" textAnchor="end">limiar {sc(p.limiar)}</text>
              </g>
            );
          }}
        </Grafico>
        <div className="q12-s18-ctl">
          <Controle rotulo="Limiar do score" valor={i} min={I_MIN} max={I_MAX} passo={1} onChange={setI} mostrar={sc(p.limiar)} escala={[sc(CURVA_SGD[I_MIN].limiar), sc(CURVA_SGD[I_MAX].limiar)]} />
          <Botao sec onClick={() => setI(INDICE_ZERO)} desab={zero}>Restaurar</Botao>
        </div>
      </div>
      <Painel className="q12-s18-dir">
        <div className="q7-kpis">
          <Kpi rotulo="Precisão" valor={p.precisao === null ? "0/0" : pct(p.precisao, 1)} detalhe={`${int(c.vp)} de ${int(c.vp + c.fp)} ditos 5`} tom="prob" tam="mini" />
          <Kpi rotulo="Recall" valor={pct(p.recall, 1)} detalhe={`${int(c.vp)} de ${int(M_SGD.positivos)} cincos`} tom="prob" tam="mini" />
        </div>
        <MatrizReal vn={c.vn} fp={c.fp} fn={c.fn} vp={c.vp} compacta />
        <Figura src="precisao-recall-limiar" alt="Curvas de precisão (tracejada) e recall (contínua) contra o limiar, do livro: a precisão sobe e o recall cai à medida que o limiar aumenta" credito="Géron, Mãos à obra, cap. 3: outra versão do experimento, com outra escala de score" className="q12-s18-fig" />
      </Painel>
    </Quadro>
  );
}
