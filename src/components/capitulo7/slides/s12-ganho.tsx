"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Painel, Previsao, Quadro, margens, type Opcao, type Pagina } from "../base";
import { useCompartilhado } from "../estado";
import { D, FILA_PL, N, PL, Y } from "@/lib/capitulo7/dados";
import { curvaGanho, ganho } from "@/lib/capitulo7/metricas";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 12 · c7p8 · Ganho acumulado. A turma estima primeiro que parcela dos 81 defaults está nos 10% mais arriscados; só
 * então a curva, o ponto e as barras aparecem. A fração examinada (compartilhada com o slide 13) define quantas
 * propostas, dos piores escores para os melhores, a equipe olha; o quadro mostra quantos defaults elas alcançam, contra
 * o sorteio e a fila perfeita, e separa nas barras a captura de cada faixa de 10% da captura acumulada.
 */
const CURVA = curvaGanho(Y, PL, FILA_PL);
const PI = D / N;
const Q0 = 0.1;
const FAIXAS = Array.from({ length: 10 }, (_, j) => { const a = ganho(Y, PL, j / 10, FILA_PL), b = ganho(Y, PL, (j + 1) / 10, FILA_PL); return { j, n: b.examinados - a.examinados, d: b.capturados - a.capturados }; });
const MAXF = Math.max(...FAIXAS.map((f) => f.d));
const G0 = ganho(Y, PL, Q0, FILA_PL);
const PERF = ganho(Y, Y, Q0); // fila perfeita: os defaults primeiro
const OPCOES: Opcao[] = [
  { texto: `Perto de ${pct(Q0, 0)}`, retorno: <>{pct(Q0, 0)} é o <b>acaso</b>: examinar {pct(Q0, 0)} da carteira sorteada alcança {pct(Q0, 0)} dos defaults. A fila pela PD concentra risco no topo.</> },
  { texto: "Perto de 25%", certa: true, retorno: <>Isso: <b>{G0.capturados} de {D}</b>, ganho de {pct(G0.ganho!, 1)}. Bem acima do acaso, longe da fila perfeita.</> },
  { texto: "Perto de 50%", retorno: <>Superestima a ordem: o topo mistura defaults e adimplentes. Para comparar, a <b>fila perfeita</b> chegaria a {pct(PERF.ganho!, 0)} ({PERF.capturados} de {D}) nesses {pct(Q0, 0)}.</> },
];

export function S12Ganho({ pagina }: { pagina?: Pagina }) {
  const [q, setQ] = useCompartilhado("fracaoExaminada");
  const [esc, setEsc] = useState<number | null>(null);
  const rev = esc !== null;
  const g = ganho(Y, PL, q, FILA_PL);
  const faixa = FAIXAS[Math.min(9, Math.ceil(q * 10 - 1e-9) - 1)] ?? FAIXAS[0];
  return (
    <Quadro slug="c7p8" pagina={pagina} layout="gl"
      conclusao={!rev ? "No gráfico, só as referências: o acaso (diagonal) e a fila perfeita (pontilhado). A curva da logística fica entre as duas; estime onde."
        : <>Examinando os {pct(q, 0)} mais arriscados ({int(g.examinados)} propostas), a equipe alcança <b>{g.capturados} dos {D} defaults: ganho de {pct(g.ganho!, 1)}</b>. Ao acaso, alcançaria cerca de {pct(q, 0)}; na faixa de {pct(faixa.j / 10, 0)} a {pct((faixa.j + 1) / 10, 0)}, só {faixa.d} de {faixa.n}.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults; fila pela PD da logística, desempate pela ordem da base. Examinar a fração q é olhar as ⌊q·${N} + ½⌋ primeiras posições.`}>
      <Grafico titulo="Curva de ganho acumulado" sub="fração da carteira examinada contra fração dos defaults alcançados" rotulo={rev ? `Curva de ganho; em ${pct(q, 0)} da carteira, ${pct(g.ganho!, 1)} dos defaults; barras com os defaults de cada faixa de 10%: ${FAIXAS.map((f) => f.d).join(", ")}` : "Curva de ganho oculta até a estimativa; à vista, o acaso e a fila perfeita"} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, 1], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
          // barras por faixa de 10%, no canto inferior direito, que a curva não ocupa
          const bx = escala([0, 10], [x(0.56), x(0.985)]), by = escala([0, MAXF], [y(0.05), y(0.3)]), bw = (bx(1) - bx(0)) * 0.72;
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.2, 0.4, 0.6, 0.8, 1]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="Fração examinada, dos piores aos melhores" yTit={`Defaults alcançados, de ${D}`} />
              <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />
              <path className="q7-linha q7-linha--mudo q7-linha--fina" strokeDasharray="2 6" d={caminho([{ x: x(0), y: y(0) }, { x: x(PI), y: y(1) }, { x: x(1), y: y(1) }])} />
              <text className="q7-rot--peq" x={x(PI) + 8} y={y(1) + d.fs * 1.1} style={{ fill: "#5B6475" }}>fila perfeita</text>
              <text className="q7-rot--peq" x={x(0.7)} y={y(0.62)} style={{ fill: "#5B6475" }}>ao acaso</text>
              {rev && <>
                <path className="q7-area" fill="#3D5A8A" d={`${caminho(CURVA.filter((p) => p.x <= q).map((p) => ({ x: x(p.x), y: y(p.y) })))}L${x(q)} ${y(0)}L${x(0)} ${y(0)}Z`} />
                <path className="q7-linha q7-linha--ord" d={caminho(CURVA.map((p) => ({ x: x(p.x), y: y(p.y) })))} />
                <line className="q7-corte" x1={x(q)} x2={x(q)} y1={y(0)} y2={y(g.ganho!)} />
                <circle cx={x(q)} cy={y(g.ganho!)} r={d.fs * 0.42} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} />
                <text className="q7-corte-t" x={x(q) + d.fs * 0.6} y={y(g.ganho!) + d.fs * 0.35}>{pct(g.ganho!, 1)}</text>
                <text className="q7-rot--peq" x={bx(0)} y={by(MAXF) - d.fs * 1.5} style={{ fill: "#5B6475" }}>defaults em cada faixa de 10% da fila</text>
                <line x1={bx(0)} x2={bx(10)} y1={by(0)} y2={by(0)} stroke="#9AA1AD" />
                {FAIXAS.map((f) => {
                  const on = f.j * 10 < Math.round(q * 100), atual = f === faixa;
                  return <g key={f.j}>
                    <rect x={bx(f.j + 0.5) - bw / 2} y={by(f.d)} width={bw} height={by(0) - by(f.d)} rx={2} fill={atual ? "#A85A0C" : on ? "#3D5A8A" : "#DCE3EE"} />
                    <text className="q7-rot--peq" x={bx(f.j + 0.5)} y={by(f.d) - d.fs * 0.3} textAnchor="middle" style={{ fill: "#00205B", fontWeight: 700 }}>{f.d}</text>
                  </g>;
                })}
              </>}
            </g>
          );
        }}
      </Grafico>
      <Painel className="q7-s12-p">
        <Previsao rotulo="Antes de revelar" pergunta={`Dos ${D} defaults, que parcela está nos ${pct(Q0, 0)} de propostas com PD mais alta?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setQ(Q0); }} recolher />
        {rev && <>
          <Controle rotulo="Fração da carteira examinada" valor={q} min={0.05} max={1} passo={0.05} onChange={setQ} mostrar={`${pct(q, 0)} (${int(g.examinados)})`} escala={[pct(0.05, 0), pct(1, 0)]} />
          <div className="q7-botoes"><Botao onClick={() => setQ(0.1)}>10%</Botao><Botao onClick={() => setQ(0.2)}>20%</Botao><Botao onClick={() => setQ(0.3)}>30%</Botao><Botao sec onClick={() => { setEsc(null); setQ(Q0); }}>Restaurar</Botao></div>
        </>}
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Ganho acumulado" valor={rev ? pct(g.ganho!, 1) : "?"} detalhe={rev ? `${g.capturados} de ${D} defaults` : `de ${D} defaults`} tom="def" tam="mini" />
          <Kpi rotulo="Ao acaso" valor={pct(q, 0)} detalhe={`cerca de ${int(Math.round(q * D))} defaults`} tam="mini" />
          {!rev && <Kpi rotulo="Fila perfeita" valor={pct(PERF.ganho!, 0)} detalhe={`${PERF.capturados} de ${D}: o teto`} tam="mini" />}
        </div>
      </Painel>
    </Quadro>
  );
}
