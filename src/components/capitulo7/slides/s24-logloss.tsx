"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Painel, Quadro, Seg, margens, type Dim, type Pagina } from "../base";
import { D, N, PL, PREVALENCIA, Y } from "@/lib/capitulo7/dados";
import { EPS_LOG, logLoss, perdaBrier1, perdaLog1 } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 24 · c7p34 · Log loss contra Brier, para o mesmo cliente, cada uma no seu eixo (sem escala comum que engane). O
 * controle vai de 0,1% a 99,9%: nos extremos a log loss da confiança errada cresce sem limite, e o Brier para em 1.
 * Log natural; EPS_LOG = 10⁻¹⁵ só evita ln(0) no cálculo, e nenhuma previsão da janela precisou dele.
 */
type Yv = 0 | 1;
const LL = logLoss(Y, PL);
const LL_REF = logLoss(Y, PL.map(() => PREVALENCIA.treino));
const TAB = [0.5, 0.1, 0.01, 0.001];

function Curva({ y, p, tipo, d }: { y: Yv; p: number; tipo: "brier" | "log"; d: Dim }) {
  const m = margens(d.fs, { l: 2.8, b: 2.8, t: 1, r: 0.8 }); const ymax = tipo === "brier" ? 1 : 7;
  const x = escala([0, 1], [m.l, d.w - m.r]), yy = escala([0, ymax], [d.h - m.b, m.t]);
  const f = (q: number) => (tipo === "brier" ? perdaBrier1(q, y) : perdaLog1(q, y));
  const pts = Array.from({ length: 999 }, (_, i) => (i + 1) / 1000).map((q) => ({ x: x(q), y: yy(Math.min(ymax, f(q))) }));
  const v = f(p);
  return (
    <g>
      <Eixos x={x} y={yy} xt={[0, 0.5, 1]} yt={tipo === "brier" ? [0, 0.5, 1] : [0, 2, 4, 6]} fx={(t) => pct(t, 0)} fy={(t) => num(t, tipo === "brier" ? 1 : 0)} xTit="PD dada ao cliente" yTit={tipo === "brier" ? "(p − y)²" : "−ln(prob. dada ao que aconteceu)"} />
      <path className={`q7-linha ${tipo === "brier" ? "q7-linha--prob" : "q7-linha--def"}`} d={caminho(pts)} />
      <circle cx={x(p)} cy={yy(Math.min(ymax, v))} r={d.fs * 0.42} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} />
      <text className="q7-corte-t" x={x(p) + (p > 0.5 ? -d.fs * 0.6 : d.fs * 0.6)} y={yy(Math.min(ymax, v)) - d.fs * 0.5} textAnchor={p > 0.5 ? "end" : "start"}>{num(v, 3)}{v > ymax ? " (fora do eixo)" : ""}</text>
    </g>
  );
}

export function S24LogLoss({ pagina }: { pagina?: Pagina }) {
  const [y, setY] = useState<Yv>(1);
  const [p, setP] = useState(0.1);
  const errado = (y === 1 && p < 0.5) || (y === 0 && p > 0.5);
  return (
    <Quadro slug="c7p34" pagina={pagina} layout="glx"
      conclusao={<>{y ? "Default" : "Adimplente"} com PD de {pct(p, 1)}: Brier {num(perdaBrier1(p, y), 3)}, log loss <b>{num(perdaLog1(p, y), 3)}</b>. {errado ? "Confiança errada: o Brier tem teto em 1; a log loss cresce sem limite quando a probabilidade dada ao que aconteceu vai a zero." : "Acertar com confiança é recompensado pelas duas perdas."}</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Log loss = −média[y ln p + (1 − y) ln(1 − p)], log natural. Limite numérico de ${EPS_LOG.toExponential(0).replace("e-", "e−")} só para evitar ln(0); nenhuma das ${N} previsões precisou dele.`}>
      <Painel titulo="O mesmo cliente, duas perdas, cada uma no seu eixo">
        <Seg rotulo="Desfecho" opcoes={[{ v: 1 as Yv, r: "Deu default (y = 1)" }, { v: 0 as Yv, r: "Pagou (y = 0)" }]} valor={y} onChange={setY} />
        <div className="q7-s24-g">
          <Grafico titulo="Brier" sub="teto em 1" rotulo={`Brier do cliente: ${num(perdaBrier1(p, y), 3)}`} arCelular="1 / 1">{(d) => <Curva y={y} p={p} tipo="brier" d={d} />}</Grafico>
          <Grafico titulo="Log loss" sub="sem teto" rotulo={`Log loss do cliente: ${num(perdaLog1(p, y), 3)}`} arCelular="1 / 1">{(d) => <Curva y={y} p={p} tipo="log" d={d} />}</Grafico>
        </div>
        <Controle rotulo="PD dada ao cliente" valor={p} min={0.001} max={0.999} passo={0.001} onChange={setP} mostrar={pct(p, 1)} escala={["0,1%", "99,9%"]} />
      </Painel>
      <Painel titulo="Confiança errada: um default">
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">PD dada</th><th>Brier</th><th>Log loss</th></tr></thead>
          <tbody>{TAB.map((q) => <tr key={q}><th>{pct(q, q < 0.01 ? 1 : 0)}</th><td>{num(perdaBrier1(q, 1), 3)}</td><td>{num(perdaLog1(q, 1), 2)}</td></tr>)}</tbody>
        </table>
        <p className="q7-nota">De 1% para 0,1%, o Brier sobe {num(perdaBrier1(0.001, 1) - perdaBrier1(0.01, 1), 3)}; a log loss sobe {num(perdaLog1(0.001, 1) - perdaLog1(0.01, 1), 2)}.</p>
        <dl className="q7-lista">
          <div data-tom="def"><dt>Logística na janela</dt><dd>{num(LL.valor, 5)}</dd></div>
          <div data-tom="mudo"><dt>Constante {pct(PREVALENCIA.treino, 2)} (treino)</dt><dd>{num(LL_REF.valor, 5)}</dd></div>
        </dl>
        <Expandir resumo="Fórmula">
          <Formula f={String.raw`\begin{aligned}\mathrm{LL}&=-\frac1n\sum_i \ell_i\\ \ell_i&=y_i\ln p_i+(1-y_i)\ln(1-p_i)\end{aligned}`} compacta />
        </Expandir>
        <div className="q7-botoes"><Botao onClick={() => { setY(1); setP(0.005); }}>Default com PD de 0,5%</Botao><Botao sec onClick={() => { setY(1); setP(0.1); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
