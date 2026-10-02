"use client";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Painel, Quadro, margens, type Pagina } from "../base";
import { useCompartilhado } from "../estado";
import { D, FILA_PL, N, PL, Y } from "@/lib/capitulo7/dados";
import { ganho, liftFaixa } from "@/lib/capitulo7/metricas";
import { int, num, pct, vezes } from "@/lib/capitulo7/formato";

/**
 * 13 · c7p25 · Lift. Lift acumulado = ganho ÷ fração examinada = taxa de default no grupo examinado ÷ taxa da
 * carteira. Lift de faixa = taxa numa faixa de 10% ÷ taxa da carteira. A tabela separa defaults capturados (fração dos
 * 81) de inadimplência entre os examinados (fração do grupo). Mesmo controle do slide 12.
 */
const PI = D / N;
const QS = Array.from({ length: 20 }, (_, i) => (i + 1) / 20);
const LIFTS = QS.map((q) => ({ q, l: ganho(Y, PL, q, FILA_PL).lift! }));
const BANDAS = Array.from({ length: 10 }, (_, j) => ({ j, ...liftFaixa(Y, PL, j / 10, (j + 1) / 10, FILA_PL) }));

export function S13Lift({ pagina }: { pagina?: Pagina }) {
  const [q, setQ] = useCompartilhado("fracaoExaminada");
  const g = ganho(Y, PL, q, FILA_PL);
  return (
    <Quadro slug="c7p25" pagina={pagina} layout="gl"
      conclusao={<>Nos {pct(q, 0)} mais arriscados, a taxa de default é <b>{pct(g.taxaGrupo!, 1)}</b> contra {pct(PI, 1)} na carteira: <b>lift de {vezes(g.lift!)}</b>. São coisas diferentes: {pct(g.ganho!, 1)} dos defaults capturados e {pct(g.taxaGrupo!, 1)} de inadimplência entre os examinados.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults (taxa ${pct(PI, 2)}); fila pela PD da logística. Lift de faixa calculado em faixas de 10% da fila.`}>
      <Grafico titulo="Lift acumulado e lift de cada faixa de 10%" sub="1,0 é escolher ao acaso" rotulo={`Lift acumulado em ${pct(q, 0)}: ${num(g.lift!, 2)}`} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, 1], [m.l, d.w - m.r]), y = escala([0, 4], [d.h - m.b, m.t]);
          const bw = (x(0.1) - x(0)) * 0.72;
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.2, 0.4, 0.6, 0.8, 1]} yt={[0, 1, 2, 3, 4]} fx={(v) => pct(v, 0)} fy={(v) => `${num(v, 0)}×`} xTit="Fração da carteira examinada, dos piores para os melhores" yTit="Lift" />
              {BANDAS.map((b) => <g key={b.j}><rect x={x(b.j / 10 + 0.05) - bw / 2} y={y(b.lift!)} width={bw} height={y(0) - y(b.lift!)} fill={b.j / 10 < q - 1e-9 ? "#C9D8F2" : "#EEF0F3"} /><text className="q7-rot--peq" x={x(b.j / 10 + 0.05)} y={y(b.lift!) - 6} textAnchor="middle" style={{ fill: "#5B6475" }}>{num(b.lift!, 1)}</text></g>)}
              <line x1={x(0)} x2={x(1)} y1={y(1)} y2={y(1)} stroke="#5B6475" strokeWidth={2} strokeDasharray="7 6" />
              <path className="q7-linha q7-linha--ord" d={caminho(LIFTS.map((p) => ({ x: x(p.q), y: y(p.l) })))} />
              <line className="q7-corte" x1={x(q)} x2={x(q)} y1={y(0)} y2={y(g.lift!)} />
              <circle cx={x(q)} cy={y(g.lift!)} r={d.fs * 0.42} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} />
              <text className="q7-corte-t" x={x(q) + d.fs * 0.6} y={y(g.lift!) - d.fs * 0.4}>{vezes(g.lift!)}</text>
              <text className="q7-rot--peq" x={x(0.62)} y={y(1) + d.fs * 1.1} style={{ fill: "#5B6475" }}>ao acaso: 1×</text>
            </g>
          );
        }}
      </Grafico>
      <Painel>
        <Controle rotulo="Fração da carteira examinada" valor={q} min={0.05} max={1} passo={0.05} onChange={setQ} mostrar={`${pct(q, 0)} (${int(g.examinados)})`} escala={["5%", "100%"]} />
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Grupo</th><th>n</th><th>Defaults</th><th>Taxa</th></tr></thead>
          <tbody>
            <tr data-on="1"><th>Examinados</th><td>{int(g.examinados)}</td><td>{g.capturados}</td><td>{pct(g.taxaGrupo!, 1)}</td></tr>
            <tr><th>Carteira</th><td>{int(N)}</td><td>{D}</td><td>{pct(PI, 1)}</td></tr>
          </tbody>
        </table>
        <dl className="q7-lista">
          <div data-tom="dec"><dt>Lift acumulado</dt><dd>{pct(g.taxaGrupo!, 1)} ÷ {pct(PI, 1)} = {vezes(g.lift!)}</dd></div>
          <div data-tom="def"><dt>Defaults capturados (ganho)</dt><dd>{g.capturados} ÷ {D} = {pct(g.ganho!, 1)}</dd></div>
        </dl>
        <div className="q7-botoes"><Botao onClick={() => setQ(0.1)}>10%</Botao><Botao onClick={() => setQ(0.5)}>50%</Botao><Botao onClick={() => setQ(1)}>100%</Botao></div>
        <Expandir resumo="Lift acumulado e lift de faixa">
          <Formula f={String.raw`\begin{aligned}\mathrm{lift}(q)&=\frac{\mathrm{ganho}(q)}{q}\\&=\frac{\text{taxa no grupo}}{\text{taxa da carteira}}\end{aligned}`} />
          <p className="q7-nota">O lift de faixa usa só a faixa (barras); o acumulado usa tudo até q (linha). Em 100% da carteira, o lift acumulado é 1.</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}
