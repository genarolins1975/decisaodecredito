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
 * que é onde as duas perdas divergem. Até a resposta certa, só o Brier aparece: a curva da log loss, a tabela e o
 * título do roteiro (que entrega a resposta) abrem depois; aí uma chave em cada curva marca a subida de 1% para 0,1%,
 * que substitui a tabela.
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

function Curva({ y, p, tipo, d, oculta, chave }: { y: Yv; p: number; tipo: "brier" | "log"; d: Dim; oculta?: boolean; chave?: boolean }) {
  const m = margens(d.fs, { l: 2.8, b: 2.8, t: 1, r: 0.8 }); const ymax = tipo === "brier" ? 1 : 7;
  const x = escala([0, 1], [m.l, d.w - m.r]), yy = escala([0, ymax], [d.h - m.b, m.t]);
  const f = (q: number) => (tipo === "brier" ? perdaBrier1(q, y) : perdaLog1(q, y));
  const pts = Array.from({ length: 999 }, (_, i) => (i + 1) / 1000).map((q) => ({ x: x(q), y: yy(Math.min(ymax, f(q))) }));
  const v = f(p);
  const k0 = yy(Math.min(ymax, f(TAB[0]))), k1 = yy(Math.min(ymax, f(TAB[1]))), kx = x(0.25);
  return (
    <g>
      {oculta ? <><Eixos x={x} y={yy} xt={[0, 0.5, 1]} yt={[0, 2, 4, 6]} fx={(t) => pct(t, 0)} fy={(t) => num(t, 0)} xTit="PD dada ao cliente" yTit="−ln(prob. dada ao que aconteceu)" />
        <text className="q7-rot" x={(x(0) + x(1)) / 2} y={(yy(0) + yy(ymax)) / 2} textAnchor="middle" style={{ fill: "#5B6475", fontSize: "1.6em" }}>?</text>
        <text className="q7-rot--peq" x={(x(0) + x(1)) / 2} y={(yy(0) + yy(ymax)) / 2} dy="2.2em" textAnchor="middle" style={{ fill: "#5B6475" }}>abre depois da previsão</text></> : <>
      <Eixos x={x} y={yy} xt={[0, 0.5, 1]} yt={tipo === "brier" ? [0, 0.5, 1] : [0, 2, 4, 6]} fx={(t) => pct(t, 0)} fy={(t) => num(t, tipo === "brier" ? 1 : 0)} xTit="PD dada ao cliente" yTit={tipo === "brier" ? "(p − y)²" : "−ln(prob. dada ao que aconteceu)"} />
      <path className={`q7-linha ${tipo === "brier" ? "q7-linha--prob" : "q7-linha--ink"}`} d={caminho(pts)} strokeDasharray={tipo === "brier" ? undefined : "10 5"} />
      <circle cx={x(p)} cy={yy(Math.min(ymax, v))} r={d.fs * 0.42} fill="#00205B" stroke="#fff" strokeWidth={2.5} />
      <text className="q7-rot" x={x(p) + (p > 0.5 ? -d.fs * 0.6 : d.fs * 1.1)} y={yy(Math.min(ymax, v)) + (Math.min(ymax, v) / ymax > 0.8 ? d.fs * 1.5 : -d.fs * 0.5)} textAnchor={p > 0.5 ? "end" : "start"} style={{ fill: "#00205B", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.28em", strokeLinejoin: "round" }}>{num(v, 3)}{v > ymax ? " (fora do eixo)" : ""}</text>
      {chave && y === 1 && <g>
        {[k0, k1].map((k, i) => <line key={i} x1={x(i ? TAB[1] : TAB[0])} x2={kx} y1={k} y2={k} stroke="#A85A0C" strokeWidth={1.5} strokeDasharray="3 4" />)}
        <path d={`M${kx - d.fs * 0.4} ${k0}H${kx}V${k1}H${kx - d.fs * 0.4}`} fill="none" stroke="#A85A0C" strokeWidth={2.5} />
        <text className="q7-rot--peq" x={kx + d.fs * 0.7} y={(k0 + k1) / 2} dy=".35em" style={{ fill: "#A85A0C", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>de 1% para 0,1%: +{num(tipo === "brier" ? dB : dL, tipo === "brier" ? 3 : 2)}</text>
      </g>}
      </>}
    </g>
  );
}

export function S24LogLoss({ pagina }: { pagina?: Pagina }) {
  const [y, setY] = useState<Yv>(1);
  const [p, setP] = useState(0.005);
  const [esc, setEsc] = useState<number | null>(null);
  const dada = y ? p : 1 - p, baixa = dada < LIMITE;
  const revelado = esc !== null && OPS[esc].certa;
  return (
    <Quadro slug="c7p34" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Log loss: quanto custa a confiança que falha?"}
      sub={revelado ? undefined : "Um default recebeu PD baixa. Quanto cada perda cobra por isso?"}
      conclusao={!revelado ? <>{y ? "Default" : "Adimplente"} com PD de {pct(p, 1)}: probabilidade de {pct(dada, 1)} dada ao que aconteceu; Brier <b>{num(perdaBrier1(p, y), 3)}</b>, perto do teto de 1. E a log loss? Preveja ao lado antes de ver a curva.</> : <>{y ? "Default" : "Adimplente"} com PD de {pct(p, 1)}: probabilidade de {pct(dada, 1)} dada ao que aconteceu; Brier {num(perdaBrier1(p, y), 3)}, log loss <b>{num(perdaLog1(p, y), 3)}</b>. {baixa ? "Abaixo de 2%, as duas divergem: o Brier tem teto em 1; a log loss cresce sem limite." : "Um caso não desmente a PD; as duas perdas só julgam na média de muitos casos."}</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Log loss = −média[y ln p + (1 − y) ln(1 − p)], log natural. Limite numérico de ${EPS_LOG.toExponential(0).replace("e-", "e−")} só para evitar ln(0); nenhuma das ${N} previsões precisou dele.`}>
      <Painel titulo="O mesmo cliente, duas perdas, cada uma no seu eixo">
        <Seg rotulo="Desfecho" opcoes={[{ v: 1 as Yv, r: "Deu default (y = 1)" }, { v: 0 as Yv, r: "Pagou (y = 0)" }]} valor={y} onChange={setY} />
        <div className="q7-s24-g">
          <Grafico titulo="Brier" sub="teto em 1" rotulo={`Brier do cliente: ${num(perdaBrier1(p, y), 3)}`} arCelular="1 / 1">{(d) => <Curva y={y} p={p} tipo="brier" d={d} chave={revelado} />}</Grafico>
          <Grafico titulo="Log loss" sub={revelado ? "sem teto" : "oculta até a previsão"} rotulo={revelado ? `Log loss do cliente: ${num(perdaLog1(p, y), 3)}` : "Log loss: oculta até a previsão"} arCelular="1 / 1">{(d) => <Curva y={y} p={p} tipo="log" d={d} oculta={!revelado} chave={revelado} />}</Grafico>
        </div>
        <div className="q7-g2-linha">
          <Controle rotulo="PD dada ao cliente" valor={p} min={0.001} max={0.999} passo={0.001} onChange={setP} mostrar={pct(p, 1)} escala={["0,1%", "99,9%"]} />
          <div className="q7-botoes"><Botao onClick={() => { setY(0); setP(0.1); }}>Adimplente, PD 10%</Botao><Botao sec onClick={() => { setY(1); setP(0.005); setEsc(null); }}>Restaurar</Botao></div>
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de revelar: probabilidade baixa num default" pergunta="De 1% para 0,1% dado a um default, quanto sobe cada perda?" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        {revelado && <p className="q7-nota">Na janela, log loss da logística <b>{num(LL.valor, 5)}</b> contra {num(LL_REF.valor, 5)} da constante de {pct(PREVALENCIA.treino, 2)} do treino; o Brier da mesma logística é {num(BS, 5)} (slide 23), noutra escala.</p>}
        <Expandir resumo="Fórmula">
          <Formula f={String.raw`\begin{aligned}\mathrm{LL}&=-\frac1n\sum_i \ell_i\\ \ell_i&=y_i\ln p_i+(1-y_i)\ln(1-p_i)\end{aligned}`} compacta />
        </Expandir>
      </Painel>
    </Quadro>
  );
}
