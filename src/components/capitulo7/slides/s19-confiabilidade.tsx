"use client";
import { useState } from "react";
import { Botao, escala, Grafico, Painel, Quadro, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, faixasQuantis } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 19 · c7p10 · A curva de confiabilidade construída diante da turma. As 737 PDs da logística, em ordem crescente,
 * são cortadas em dez faixas de mesmo tamanho; a faixa destacada vira um ponto: x = PD média prevista, y = frequência
 * observada. A tabela traz n e defaults de cada ponto. A incerteza de cada ponto é o assunto do slide 21.
 */
const F = faixasQuantis(Y, PL, 10);
const ACIMA = F.filter((f) => f.obs! > f.pdMedia!).length;
const OE = calibracaoGlobal(Y, PL).razaoOE!;
const ASC = PL.map((p, i) => ({ p, y: Y[i] })).sort((a, b) => a.p - b.p);

export function S19Confiabilidade({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(0);
  const f = k ? F[k - 1] : null;
  return (
    <Quadro slug="c7p10" pagina={pagina} layout="um"
      conclusao={!f ? "Avance uma faixa por vez: cada faixa vira um ponto." : k < 10 ? <>Faixa {f.j}: {f.n} propostas com PD média de {pct(f.pdMedia!, 1)}; {f.d} deram default, {pct(f.obs!, 1)}. {f.obs! > f.pdMedia! ? "O ponto fica acima da diagonal: neste grupo o modelo subestimou o risco." : "O ponto fica abaixo da diagonal: neste grupo o modelo superestimou o risco."}</>
        : <>Dez pontos: a curva acompanha a diagonal e fica acima dela em {ACIMA} das 10 faixas, na direção do O/E de {num(OE, 2)} (risco subestimado). Se cada distância é padrão ou ruído, o intervalo do ponto vai dizer.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; PD da logística. Faixas de mesmo tamanho pela posição na fila crescente de PD (73 ou 74 propostas).`}>
      <div className="q7-s19">
        <Painel titulo="As 737 PDs em ordem crescente, cortadas em dez faixas" className="q7-s19-r">
          <Grafico rotulo="Faixa destacada na régua de PDs ordenadas" arCelular="6 / 1">
            {(d) => {
              const x = escala([0, N], [0, d.w]); const h = d.h * 0.62;
              return (
                <g>
                  {ASC.map((a, i) => <line key={i} x1={x(i + 0.5)} x2={x(i + 0.5)} y1={h} y2={h - Math.max(2, (a.p / 0.46) * h)} stroke={a.y ? "#8C2332" : "#9AA1AD"} strokeWidth={a.y ? 1.8 : 1} />)}
                  {F.map((ff, j) => { const i0 = F.slice(0, j).reduce((s, z) => s + z.n, 0); return <g key={ff.j}><rect x={x(i0)} y={h + 3} width={x(ff.n) - 2} height={d.h * 0.32} fill={k === ff.j ? "#176C73" : j < k ? "#9FC7C9" : "#E7E4DC"} rx={3} /><text className="q7-rot--peq" x={x(i0 + ff.n / 2)} y={h + 3 + d.h * 0.25} textAnchor="middle" style={{ fill: k === ff.j ? "#fff" : "#2A3342" }}>F{ff.j}</text></g>; })}
                </g>
              );
            }}
          </Grafico>
          <p className="q7-nota">Cada traço é uma proposta, com altura proporcional à PD; em vinho, as que deram default.</p>
        </Painel>
        <Painel className="q7-s19-c"><Confiabilidade ticks={[0, 0.1, 0.2, 0.3]} rotulo="Curva de confiabilidade da logística, faixa a faixa" max={0.3} destaque={k || null} series={[{ faixas: F.slice(0, k), classe: "prob", linha: k > 1 }]} /></Painel>
        <Painel titulo="A conta de cada ponto" className="q7-s19-t">
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">Faixa</th><th>n</th><th>Defaults</th><th>PD média</th><th>Observado</th></tr></thead>
            <tbody>{F.map((ff) => <tr key={ff.j} data-on={ff.j === k ? "1" : undefined}><th>F{ff.j}</th>{ff.j <= k ? <><td>{ff.n}</td><td>{ff.d}</td><td>{pct(ff.pdMedia!, 1)}</td><td>{pct(ff.obs!, 1)}</td></> : <td colSpan={4} className="q7-t-l" style={{ color: "#6B7280" }}>ainda não calculada</td>}</tr>)}</tbody>
          </table>
          <div className="q7-botoes"><Botao prim onClick={() => setK(Math.min(10, k + 1))} desab={k >= 10}>Próxima faixa</Botao><Botao onClick={() => setK(10)} desab={k >= 10}>Todas</Botao><Botao sec onClick={() => setK(0)}>Restaurar</Botao></div>
        </Painel>
      </div>
    </Quadro>
  );
}
