"use client";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Painel, Quadro, margens, type Pagina } from "../base";
import { useCompartilhado } from "../estado";
import { D, FILA_PL, N, PL, Y } from "@/lib/capitulo7/dados";
import { curvaGanho, ganho } from "@/lib/capitulo7/metricas";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 12 · c7p8 · Ganho acumulado. A fração examinada (compartilhada com o slide 13) define quantas propostas, dos piores
 * escores para os melhores, a equipe olha; o quadro mostra quantos dos 81 defaults elas alcançam, a curva de ganho
 * contra o sorteio e a fila perfeita, e separa a captura da última faixa de 10% da captura acumulada.
 */
const CURVA = curvaGanho(Y, PL, FILA_PL);
const PI = D / N;
const FAIXAS = Array.from({ length: 10 }, (_, j) => { const a = ganho(Y, PL, j / 10, FILA_PL), b = ganho(Y, PL, (j + 1) / 10, FILA_PL); return { j, n: b.examinados - a.examinados, d: b.capturados - a.capturados }; });

export function S12Ganho({ pagina }: { pagina?: Pagina }) {
  const [q, setQ] = useCompartilhado("fracaoExaminada");
  const g = ganho(Y, PL, q, FILA_PL);
  const faixa = FAIXAS[Math.min(9, Math.ceil(q * 10 - 1e-9) - 1)] ?? FAIXAS[0];
  return (
    <Quadro slug="c7p8" pagina={pagina} layout="gl"
      conclusao={<>Examinando os {pct(q, 0)} mais arriscados ({int(g.examinados)} propostas), a equipe alcança <b>{g.capturados} dos {D} defaults: ganho de {pct(g.ganho!, 1)}</b>. Ao acaso, alcançaria cerca de {pct(q, 0)}.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults; fila pela PD da logística, desempate pela ordem da base. Examinar a fração q é olhar as ⌊q·${N} + ½⌋ primeiras posições.`}>
      <Grafico titulo="Curva de ganho acumulado" sub="fração da carteira examinada contra fração dos defaults alcançados" rotulo={`Curva de ganho; em ${pct(q, 0)} da carteira, ${pct(g.ganho!, 1)} dos defaults`} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, 1], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.2, 0.4, 0.6, 0.8, 1]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="Fração examinada, dos piores aos melhores" yTit={`Defaults alcançados, de ${D}`} />
              <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />
              <path className="q7-linha q7-linha--mudo q7-linha--fina" strokeDasharray="2 6" d={caminho([{ x: x(0), y: y(0) }, { x: x(PI), y: y(1) }, { x: x(1), y: y(1) }])} />
              <text className="q7-rot--peq" x={x(PI) + 8} y={y(1) + d.fs * 1.1} style={{ fill: "#5B6475" }}>fila perfeita</text>
              <text className="q7-rot--peq" x={x(0.7)} y={y(0.62)} style={{ fill: "#5B6475" }}>ao acaso</text>
              <path className="q7-area" fill="#3D5A8A" d={`${caminho(CURVA.filter((p) => p.x <= q).map((p) => ({ x: x(p.x), y: y(p.y) })))}L${x(q)} ${y(0)}L${x(0)} ${y(0)}Z`} />
              <path className="q7-linha q7-linha--ord" d={caminho(CURVA.map((p) => ({ x: x(p.x), y: y(p.y) })))} />
              <line className="q7-corte" x1={x(q)} x2={x(q)} y1={y(0)} y2={y(g.ganho!)} />
              <circle cx={x(q)} cy={y(g.ganho!)} r={d.fs * 0.42} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} />
              <text className="q7-corte-t" x={x(q) + d.fs * 0.6} y={y(g.ganho!) + d.fs * 0.35}>{pct(g.ganho!, 1)}</text>
            </g>
          );
        }}
      </Grafico>
      <Painel>
        <Controle rotulo="Fração da carteira examinada" valor={q} min={0.05} max={1} passo={0.05} onChange={setQ} mostrar={`${pct(q, 0)} (${int(g.examinados)})`} escala={["5%", "100%"]} />
        <div className="q7-botoes"><Botao onClick={() => setQ(0.1)}>10%</Botao><Botao onClick={() => setQ(0.2)}>20%</Botao><Botao onClick={() => setQ(0.3)}>30%</Botao></div>
        <div className="q7-kpis">
          <Kpi rotulo="Ganho acumulado" valor={pct(g.ganho!, 1)} detalhe={`${g.capturados} de ${D} defaults`} tom="def" />
          <Kpi rotulo="Ao acaso" valor={pct(q, 0)} detalhe={`cerca de ${int(Math.round(q * D))} defaults`} />
        </div>
        <div className="q7-s12-faixa">
          <p className="q7-k">Captura na faixa e acumulada</p>
          <div className="q7-s12-bar" role="img" aria-label="Defaults por faixa de 10% da fila">
            {FAIXAS.map((f) => <span key={f.j} data-on={f.j * 10 < Math.round(q * 100) ? "1" : "0"} data-atual={f === faixa ? "1" : "0"} style={{ height: `${(f.d / 22) * 100}%` }}><b>{f.d}</b></span>)}
          </div>
          <p className="q7-nota">Barras: defaults em cada faixa de 10% da fila. Na faixa de {pct(faixa.j / 10, 0)} a {pct((faixa.j + 1) / 10, 0)}: {faixa.d} de {faixa.n}; acumulado até {pct(q, 0)}: {g.capturados}.</p>
        </div>
      </Painel>
    </Quadro>
  );
}
