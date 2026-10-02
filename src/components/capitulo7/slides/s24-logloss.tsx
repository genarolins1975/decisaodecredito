"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Painel, Previsao, Quadro, Seg, margens, type Dim, type Pagina } from "../base";
import { D, N, PL, PREVALENCIA, Y } from "@/lib/capitulo7/dados";
import { EPS_LOG, brier, logLoss, perdaBrier1, perdaLog1 } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 24 · c7p34 · Log loss contra Brier, para o mesmo cliente, cada uma no seu eixo (sem escala comum que engane). O
 * controle vai de 0,1% a 99,9%: nos extremos a log loss da confiança errada cresce sem limite, e o Brier para em 1.
 * Log natural; EPS_LOG = 10⁻¹⁵ só evita ln(0) no cálculo, e nenhuma previsão da janela precisou dele. Um desfecho
 * isolado não desmente uma PD (slide 17): o quadro só fala em probabilidade baixa dada ao que aconteceu (menos de 2%),
 * que é onde as duas perdas divergem. A tabela abre depois da previsão.
 */
type Yv = 0 | 1;
const LL = logLoss(Y, PL);
const LL_REF = logLoss(Y, PL.map(() => PREVALENCIA.treino));
const BS = brier(Y, PL);
const TAB = [0.01, 0.001];
const LIMITE = 0.02;
const dB = perdaBrier1(0.001, 1) - perdaBrier1(0.01, 1), dL = perdaLog1(0.001, 1) - perdaLog1(0.01, 1);
const OPS = [
  { texto: "As duas sobem muito", certa: false, retorno: <>O Brier quase não se move ({num(dB, 3)}): perto de zero, (p − 1)² já está perto do teto de 1. Confunde as duas escalas.</> },
  { texto: "As duas sobem pouco", certa: false, retorno: <>Vale para o Brier ({num(dB, 3)}), não para a log loss: −ln p cresce sem limite quando p vai a zero.</> },
  { texto: "O Brier quase não muda; a log loss sobe mais de 2", certa: true, retorno: <>Isso: o Brier sobe {num(dB, 3)} e a log loss {num(dL, 2)}. Na média, a log loss pesa a confiança que falhou; o slide 25 mostra que nenhuma das duas isola a calibração.</> },
];

function Curva({ y, p, tipo, d }: { y: Yv; p: number; tipo: "brier" | "log"; d: Dim }) {
  const m = margens(d.fs, { l: 2.8, b: 2.8, t: 1, r: 0.8 }); const ymax = tipo === "brier" ? 1 : 7;
  const x = escala([0, 1], [m.l, d.w - m.r]), yy = escala([0, ymax], [d.h - m.b, m.t]);
  const f = (q: number) => (tipo === "brier" ? perdaBrier1(q, y) : perdaLog1(q, y));
  const pts = Array.from({ length: 999 }, (_, i) => (i + 1) / 1000).map((q) => ({ x: x(q), y: yy(Math.min(ymax, f(q))) }));
  const v = f(p);
  return (
    <g>
      <Eixos x={x} y={yy} xt={[0, 0.5, 1]} yt={tipo === "brier" ? [0, 0.5, 1] : [0, 2, 4, 6]} fx={(t) => pct(t, 0)} fy={(t) => num(t, tipo === "brier" ? 1 : 0)} xTit="PD dada ao cliente" yTit={tipo === "brier" ? "(p − y)²" : "−ln(prob. dada ao que aconteceu)"} />
      <path className={`q7-linha ${tipo === "brier" ? "q7-linha--prob" : "q7-linha--ink"}`} d={caminho(pts)} strokeDasharray={tipo === "brier" ? undefined : "10 5"} />
      <circle cx={x(p)} cy={yy(Math.min(ymax, v))} r={d.fs * 0.42} fill="#00205B" stroke="#fff" strokeWidth={2.5} />
      <text className="q7-rot" x={x(p) + (p > 0.5 ? -d.fs * 0.6 : d.fs * 1.1)} y={yy(Math.min(ymax, v)) + (Math.min(ymax, v) / ymax > 0.8 ? d.fs * 1.5 : -d.fs * 0.5)} textAnchor={p > 0.5 ? "end" : "start"} style={{ fill: "#00205B", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.28em", strokeLinejoin: "round" }}>{num(v, 3)}{v > ymax ? " (fora do eixo)" : ""}</text>
    </g>
  );
}

export function S24LogLoss({ pagina }: { pagina?: Pagina }) {
  const [y, setY] = useState<Yv>(1);
  const [p, setP] = useState(0.005);
  const [esc, setEsc] = useState<number | null>(null);
  const dada = y ? p : 1 - p, baixa = dada < LIMITE;
  return (
    <Quadro slug="c7p34" pagina={pagina} layout="gl"
      conclusao={<>{y ? "Default" : "Adimplente"} com PD de {pct(p, 1)}: probabilidade de {pct(dada, 1)} dada ao que aconteceu; Brier {num(perdaBrier1(p, y), 3)}, log loss <b>{num(perdaLog1(p, y), 3)}</b>. {baixa ? "Abaixo de 2%, as duas divergem: o Brier tem teto em 1; a log loss cresce sem limite." : "Um caso não desmente a PD; as duas perdas só julgam na média de muitos casos."}</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Log loss = −média[y ln p + (1 − y) ln(1 − p)], log natural. Limite numérico de ${EPS_LOG.toExponential(0).replace("e-", "e−")} só para evitar ln(0); nenhuma das ${N} previsões precisou dele.`}>
      <Painel titulo="O mesmo cliente, duas perdas, cada uma no seu eixo">
        <Seg rotulo="Desfecho" opcoes={[{ v: 1 as Yv, r: "Deu default (y = 1)" }, { v: 0 as Yv, r: "Pagou (y = 0)" }]} valor={y} onChange={setY} />
        <div className="q7-s24-g">
          <Grafico titulo="Brier" sub="teto em 1" rotulo={`Brier do cliente: ${num(perdaBrier1(p, y), 3)}`} arCelular="1 / 1">{(d) => <Curva y={y} p={p} tipo="brier" d={d} />}</Grafico>
          <Grafico titulo="Log loss" sub="sem teto" rotulo={`Log loss do cliente: ${num(perdaLog1(p, y), 3)}`} arCelular="1 / 1">{(d) => <Curva y={y} p={p} tipo="log" d={d} />}</Grafico>
        </div>
        <div className="q7-g2-linha">
          <Controle rotulo="PD dada ao cliente" valor={p} min={0.001} max={0.999} passo={0.001} onChange={setP} mostrar={pct(p, 1)} escala={["0,1%", "99,9%"]} />
          <div className="q7-botoes"><Botao onClick={() => { setY(0); setP(0.1); }}>Adimplente, PD 10%</Botao><Botao sec onClick={() => { setY(1); setP(0.005); setEsc(null); }}>Restaurar</Botao></div>
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de revelar: probabilidade baixa num default" pergunta="De 1% para 0,1% dado a um default, quanto sobe cada perda?" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        {esc !== null && OPS[esc].certa && (
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">PD dada</th><th>Brier</th><th>Log loss</th></tr></thead>
            <tbody>{TAB.map((q) => <tr key={q}><th>{pct(q, q < 0.01 ? 1 : 0)}</th><td>{num(perdaBrier1(q, 1), 3)}</td><td>{num(perdaLog1(q, 1), 2)}</td></tr>)}</tbody>
          </table>
        )}
        <p className="q7-nota">Na janela, log loss da logística <b>{num(LL.valor, 5)}</b> contra {num(LL_REF.valor, 5)} da constante de {pct(PREVALENCIA.treino, 2)} do treino; o Brier da mesma logística é {num(BS, 5)} (slide 23), noutra escala.</p>
        <Expandir resumo="Fórmula">
          <Formula f={String.raw`\begin{aligned}\mathrm{LL}&=-\frac1n\sum_i \ell_i\\ \ell_i&=y_i\ln p_i+(1-y_i)\ln(1-p_i)\end{aligned}`} compacta />
        </Expandir>
      </Painel>
    </Quadro>
  );
}
