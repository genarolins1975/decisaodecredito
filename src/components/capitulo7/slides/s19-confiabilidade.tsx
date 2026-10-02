"use client";
import { useState } from "react";
import { Botao, escala, Grafico, Painel, Quadro, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, faixasQuantis } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 19 · c7p10 · A curva de confiabilidade construída diante da turma. As 737 PDs da logística, em ordem crescente,
 * são cortadas em dez faixas de mesmo tamanho; a faixa destacada vira um ponto: x = PD média prevista, y = frequência
 * observada. Antes de cada passo a turma pode prever se o ponto fica acima ou abaixo da diagonal. Ao fim, o intervalo
 * de Wilson de cada faixa (slide 21) mostra quanto de cada distância é ruído.
 */
const F = faixasQuantis(Y, PL, 10);
const ACIMA = F.filter((f) => f.obs! > f.pdMedia!).length;
const COMPATIVEIS = F.filter((f) => f.compativel).length;
const OE = calibracaoGlobal(Y, PL).razaoOE!;
const ASC = PL.map((p, i) => ({ p, y: Y[i] })).sort((a, b) => a.p - b.p);
const PMAX = ASC[ASC.length - 1].p;
type Palpite = "acima" | "abaixo" | null;

export function S19Confiabilidade({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(0);
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [ic, setIc] = useState(false);
  const f = k ? F[k - 1] : null;
  const avancar = (p: Palpite) => { if (k >= 10) return; setPalpites([...palpites.slice(0, k), p]); setK(k + 1); };
  const feitos = palpites.filter((p, i) => p !== null && i < k);
  const acertos = palpites.filter((p, i) => p !== null && i < k && (F[i].obs! > F[i].pdMedia! ? "acima" : "abaixo") === p).length;
  const ultimo = k ? palpites[k - 1] : null;
  const lado = f ? (f.obs! > f.pdMedia! ? "acima" : "abaixo") : null;
  const max = ic ? 0.42 : 0.3;
  return (
    <Quadro slug="c7p10" pagina={pagina} layout="um"
      conclusao={!f ? "Antes de cada faixa, preveja: o ponto fica acima ou abaixo da diagonal? Cada faixa vira um ponto."
        : k < 10 ? <>Faixa {f.j}: {f.n} propostas com PD média de {pct(f.pdMedia!, 1)}; {f.d} deram default, <b>{pct(f.obs!, 1)}</b>. O ponto fica {lado} da diagonal: neste grupo o modelo {lado === "acima" ? "subestimou" : "superestimou"} o risco.</>
        : ic ? <>Com o intervalo de 95% de cada faixa (Wilson, slide 21), a PD média cai dentro do intervalo em <b>{COMPATIVEIS} das 10 faixas</b>: nenhuma distância isolada prova descalibração. O que pesa é o padrão, {ACIMA} de 10 acima, que o slide 21 testa na carteira.</>
        : <>Dez pontos: a curva acompanha a diagonal e fica <b>acima dela em {ACIMA} das 10 faixas</b>, na direção do O/E de {num(OE, 2)} (risco subestimado). Cada distância é padrão ou ruído? Mostre o intervalo de cada faixa.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults; PD da logística. Faixas de mesmo tamanho pela posição na fila crescente de PD (73 ou 74 propostas). Intervalo: Wilson de 95% com o n de cada faixa.`}>
      <div className="q7-g2-s19">
        <Painel className="q7-g2-s19-c">
          <Confiabilidade ticks={ic ? [0, 0.1, 0.2, 0.3, 0.4] : [0, 0.1, 0.2, 0.3]} rotulo="Curva de confiabilidade da logística, faixa a faixa" max={max} destaque={k < 10 ? k || null : null} anotar={false}
            series={[{ faixas: F.slice(0, k), classe: "prob", linha: k > 1, ic }]}
            extra={(x, y) => <g>
              <text className="q7-rot--peq" x={x(max * 0.03)} y={y(max * 0.95)} style={{ fill: "#5B6475" }}><tspan>▲ acima: risco</tspan><tspan x={x(max * 0.03)} dy="1.15em">subestimado</tspan></text>
              <text className="q7-rot--peq" x={x(max * 0.97)} y={y(max * 0.035)} textAnchor="end" style={{ fill: "#5B6475" }}>▼ abaixo: superestimado</text>
            </g>} />
        </Painel>
        <div className="q7-g2-s19-dir">
          <Painel titulo={`As ${int(N)} PDs em ordem crescente, cortadas em dez faixas`} className="q7-g2-s19-r">
            <Grafico rotulo="Faixa destacada na régua de PDs ordenadas" arCelular="5 / 1">
              {(d) => {
                const x = escala([0, N], [0, d.w]); const h = d.h * 0.66;
                return (
                  <g>
                    {ASC.map((a, i) => <line key={i} x1={x(i + 0.5)} x2={x(i + 0.5)} y1={h} y2={h - Math.max(2, (a.p / PMAX) * (h - 2))} stroke={a.y ? "#8C2332" : "#B5BAC4"} strokeWidth={a.y ? 2 : 1.2} />)}
                    {F.map((ff, j) => { const i0 = F.slice(0, j).reduce((s, z) => s + z.n, 0); return <g key={ff.j}><rect x={x(i0) + 1} y={h + 3} width={x(ff.n) - 2} height={d.h * 0.3} fill={k === ff.j ? "#176C73" : j < k ? "#9FC7C9" : "#E7E4DC"} rx={3} /><text className="q7-rot--peq" x={x(i0 + ff.n / 2)} y={h + 3 + d.h * 0.21} textAnchor="middle" style={{ fill: k === ff.j ? "#fff" : "#2A3342" }}>F{ff.j}</text></g>; })}
                  </g>
                );
              }}
            </Grafico>
            <p className="q7-nota">Traço: uma proposta, com altura proporcional à PD; em vinho e mais grossos, os defaults.</p>
            <div className="q7-g2-s19-ctl">
              <span className="q7-k">{k < 10 ? `Faixa ${k + 1}: o ponto fica` : "Completa. E o ruído?"}</span>
              {k < 10 ? <>
                <Botao prim onClick={() => avancar("acima")} rotulo={`Prever acima da diagonal e calcular a faixa ${k + 1}`}>▲ acima</Botao>
                <Botao prim onClick={() => avancar("abaixo")} rotulo={`Prever abaixo da diagonal e calcular a faixa ${k + 1}`}>▼ abaixo</Botao>
                <Botao onClick={() => { setPalpites([...palpites.slice(0, k), ...Array(10 - k).fill(null)]); setK(10); }}>Todas</Botao>
              </> : <Botao prim={!ic} onClick={() => setIc(!ic)}>{ic ? "Esconder o intervalo de Wilson" : "Mostrar o intervalo de Wilson"}</Botao>}
              <Botao sec onClick={() => { setK(0); setPalpites([]); setIc(false); }}>Restaurar</Botao>
            </div>
          </Painel>
          <Painel titulo="A conta de cada ponto" className="q7-g2-s19-t">
            {ultimo && f && <p className="q7-g2-s19-fb" data-ok={ultimo === lado ? "1" : "0"} aria-live="polite">{ultimo === lado ? "Acertou" : "Errou"}: você previu {ultimo}; ficou {lado} ({pct(f.obs!, 1)} contra {pct(f.pdMedia!, 1)}). Acertos: {acertos} de {feitos.length}.</p>}
            {k === 0 && <p className="q7-p">A faixa 1 reúne as {F[0].n} propostas de menor PD. Preveja onde o ponto dela vai cair.</p>}
            <table className="q7-tab q7-g2-s19-tab">
              <thead><tr><th className="q7-t-l">Faixa</th>{F.map((ff) => <th key={ff.j} data-on={ff.j === k && k < 10 ? "1" : undefined}>F{ff.j}</th>)}</tr></thead>
              <tbody>
                <tr><th>Defaults/n</th>{F.map((ff) => <td key={ff.j} data-on={ff.j === k && k < 10 ? "1" : undefined}>{ff.j <= k ? `${ff.d}/${ff.n}` : "·"}</td>)}</tr>
                <tr><th>PD média</th>{F.map((ff) => <td key={ff.j} data-on={ff.j === k && k < 10 ? "1" : undefined}>{ff.j <= k ? pct(ff.pdMedia!, 1) : "·"}</td>)}</tr>
                <tr><th>Observado</th>{F.map((ff) => <td key={ff.j} data-on={ff.j === k && k < 10 ? "1" : undefined}>{ff.j <= k ? <>{ff.obs! > ff.pdMedia! ? "▲" : "▼"} {pct(ff.obs!, 1)}</> : "·"}</td>)}</tr>
                {ic && <tr><th>Intervalo de 95%</th>{F.map((ff) => <td key={ff.j}>{pct(ff.ic!.lo, 1)}<br />{pct(ff.ic!.hi, 1)}</td>)}</tr>}
              </tbody>
            </table>
          </Painel>
        </div>
      </div>
    </Quadro>
  );
}
