"use client";
import { useMemo } from "react";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { crescer, folhas } from "@/lib/visuais/arvore";
import { BASE16 } from "./plano-16";

/**
 * A previsão da folha é a frequência da folha (c5p12). Numa folha com 1 default em 2 propostas, a log loss média de
 * cada valor atribuído: o mínimo cai exatamente em 1 ÷ 2 = 50%. Tabela de cinco candidatos, a curva inteira e três
 * consequências em uma linha cada. Substitui a página herdada, que ocupava duas telas de texto.
 */
const CANDIDATOS = [0.1, 0.25, 0.5, 0.75, 0.9];
const W = 520, H = 300, ML = 48, MR = 14, MT = 16, MB = 44, YMAX = 2.5;
const sx = (v: number) => ML + v * (W - ML - MR);
const sy = (l: number) => MT + (1 - Math.min(l, YMAX) / YMAX) * (H - MT - MB);
const NOTAS = [
  "É a mesma conta da PD constante do capítulo 2 e do ponto de partida do boosting, no capítulo 6.",
  "No treino, a folha fica calibrada por construção; fora do tempo, só o capítulo 7 diz.",
  "Folha pura devolve 0% ou 100%: afirma uma certeza que não tem.",
];

export function ValorDaFolha() {
  const folha = useMemo(() => folhas(crescer(BASE16, 2)).find((f) => f.n === 2 && f.d === 1)!, []);
  const perda = (v: number) => -(folha.d * Math.log(v) + (folha.n - folha.d) * Math.log(1 - v)) / folha.n;
  const otimo = folha.d / folha.n;
  const curva = Array.from({ length: 97 }, (_, k) => 0.02 + k * 0.01).map((v, i) => `${i ? "L" : "M"}${sx(v).toFixed(1)} ${sy(perda(v)).toFixed(1)}`).join("");
  return (
    <figure className="vz" data-vz="valor-da-folha">
      <div className="vz-vf-grade">
        <div>
          <p className="vz-rd-k">Uma folha: {folha.d} default em {folha.n} propostas</p>
          <div className="table-wrap"><table className="table vz-vf-tabela"><thead><tr><th>Valor atribuído</th><th>Perda média</th></tr></thead><tbody>
            {CANDIDATOS.map((v) => <tr key={v} className={v === otimo ? "vz-t-on" : ""}><th scope="row">{fmtPct(v, 1)}</th><td className={v === otimo ? "vz-t-forte" : ""}>{fmtNum(perda(v), 5)}</td></tr>)}
          </tbody></table></div>
          <p className="vz-vf-min">O mínimo está na frequência observada: <span className="whitespace-nowrap">{folha.d} ÷ {folha.n} = <b>{fmtPct(otimo, 1)}</b></span>. Não foi escolhido: foi calculado.</p>
        </div>
        <div className="vz-grafico">
          <p className="vz-grafico-t">Log loss média na folha, por valor atribuído</p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva da log loss média na folha, com mínimo em ${fmtPct(otimo, 1)}`}>
            {[0, 0.5, 1, 1.5, 2, 2.5].map((l) => <g key={l}><line x1={ML} x2={W - MR} y1={sy(l)} y2={sy(l)} className="vz-grade" /><text x={ML - 8} y={sy(l) + 4} textAnchor="end" className="vz-tick">{fmtNum(l, 1)}</text></g>)}
            {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={sx(v)} y={H - MB + 18} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text>)}
            <text x={(ML + W - MR) / 2} y={H - 8} textAnchor="middle" className="vz-rotulo">valor atribuído à folha</text>
            <path d={curva} className="vz-vf-curva" />
            {CANDIDATOS.map((v) => <circle key={v} cx={sx(v)} cy={sy(perda(v))} r={v === otimo ? 7 : 4.5} className={v === otimo ? "vz-vf-otimo" : "vz-vf-cand"} />)}
            <text x={sx(otimo)} y={sy(perda(otimo)) + 26} textAnchor="middle" className="vz-vf-otimo-t">mínimo em {fmtPct(otimo, 1)}</text>
          </svg>
        </div>
      </div>
      <ul className="vz-vf-notas">{NOTAS.map((n) => <li key={n}>{n}</li>)}</ul>
      <p className="vz-fonte">Perda média na folha = −[d × ln(v) + (n − d) × ln(1 − v)] ÷ n, com d = {folha.d} e n = {folha.n}. Implementações reais aplicam um piso às folhas puras, porque previsão de 0% sobre um default tem perda infinita.</p>
    </figure>
  );
}
