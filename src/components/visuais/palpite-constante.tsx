"use client";
import { fmtNum } from "@/lib/visuais/metricas";
import { paraTex } from "@/lib/visuais/tex";
import { ComTex, Tex } from "./tex";
import { F0_8, Y8 } from "./plano-8";

/**
 * F₀, o melhor palpite constante (c6p4). O erro quadrático médio de cada valor único atribuído aos oito pontos:
 * o mínimo cai na média, 52,0 ÷ 8 = 6,50, com 10,1875. Mesmo desenho da c5p12 (valor da folha): tabela de cinco
 * candidatos, a curva inteira e três consequências. Substitui a página herdada, que ocupava duas telas e repetia o
 * gráfico dos resíduos, assunto da página seguinte.
 */
const CANDIDATOS = [4, 5.5, 6.5, 7.5, 9];
const W = 520, H = 300, ML = 48, MR = 14, MT = 16, MB = 44, C0 = 2, C1 = 11, YMAX = 32;
const sx = (c: number) => ML + ((c - C0) / (C1 - C0)) * (W - ML - MR);
const sy = (v: number) => MT + (1 - Math.min(v, YMAX) / YMAX) * (H - MT - MB);
export const erroConstante = (c: number) => Y8.reduce((s, y) => s + (y - c) ** 2, 0) / Y8.length;
const SOMA = Y8.reduce((s, y) => s + y, 0);
const NOTAS = [
  "É o mesmo resultado da PD constante do capítulo 2 e do valor da folha do capítulo 5: o melhor constante é o que minimiza o critério.",
  "Em erro quadrático, o melhor constante é a média; em log loss, é a proporção de defaults.",
  "O que sobra de cada ponto até 6,50 é o resíduo: o alvo da próxima página.",
];

export function PalpiteConstante() {
  const curva = Array.from({ length: 91 }, (_, k) => C0 + k * 0.1).map((c, i) => `${i ? "L" : "M"}${sx(c).toFixed(1)} ${sy(erroConstante(c)).toFixed(1)}`).join("");
  const minimo = erroConstante(F0_8);
  return (
    <figure className="vz" data-vz="palpite-constante">
      <div className="vz-vf-grade">
        <div>
          <p className="vz-rd-k">Um valor para os oito pontos</p>
          <div className="table-wrap"><table className="table vz-vf-tabela"><thead><tr><th>Valor constante</th><th>Erro quadrático médio</th></tr></thead><tbody>
            {CANDIDATOS.map((c) => <tr key={c} className={c === F0_8 ? "vz-t-on" : ""}><th scope="row">{fmtNum(c, 2)}</th><td className={c === F0_8 ? "vz-t-forte" : ""}>{fmtNum(erroConstante(c), 5)}</td></tr>)}
          </tbody></table></div>
          <p className="vz-vf-min">O mínimo está na média dos oito valores: <span className="tx-inteira" role="img" aria-label={`${fmtNum(SOMA, 1)} ÷ ${Y8.length} = ${fmtNum(F0_8, 2)}`}><Tex f={String.raw`${paraTex(fmtNum(SOMA, 1))} \div ${Y8.length} = \mathbf{${paraTex(fmtNum(F0_8, 2))}}`} className="tx-linha" /></span>. Não foi escolhido: foi calculado.</p>
        </div>
        <div className="vz-grafico">
          <p className="vz-grafico-t">Erro quadrático médio, por valor constante</p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva do erro quadrático médio por valor constante, com mínimo ${fmtNum(minimo, 4)} em ${fmtNum(F0_8, 2)}`}>
            {[0, 10, 20, 30].map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 8} y={sy(v) + 4} textAnchor="end" className="vz-tick">{v}</text></g>)}
            {[2, 4, 6, 8, 10].map((c) => <text key={c} x={sx(c)} y={H - MB + 18} textAnchor="middle" className="vz-tick">{c}</text>)}
            <text x={(ML + W - MR) / 2} y={H - 8} textAnchor="middle" className="vz-rotulo">valor atribuído aos oito pontos</text>
            <path d={curva} className="vz-vf-curva" />
            {CANDIDATOS.map((c) => <circle key={c} cx={sx(c)} cy={sy(erroConstante(c))} r={c === F0_8 ? 7 : 4.5} className={c === F0_8 ? "vz-vf-otimo" : "vz-vf-cand"} />)}
            <text x={sx(F0_8)} y={sy(minimo) + 26} textAnchor="middle" className="vz-vf-otimo-t">mínimo em {fmtNum(F0_8, 2)}</text>
          </svg>
        </div>
      </div>
      <ul className="vz-vf-notas">{NOTAS.map((n) => <li key={n}>{n}</li>)}</ul>
      <p className="vz-fonte"><ComTex t={String.raw`Erro quadrático médio de um valor constante $c$: $\text{média de } (y - c)^2$ sobre os oito pontos, que é $${paraTex(fmtNum(minimo, 4))} + (6{,}5 - c)^2$; por isso a curva é uma parábola com fundo na média. Confere com o gerador em Python: ${fmtNum(minimo, 4)}.`} /></p>
    </figure>
  );
}
