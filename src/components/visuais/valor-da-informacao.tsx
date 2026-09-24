"use client";
import { useState } from "react";
import woe from "@/lib/visuais/woe.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { Formula } from "./tex";

/**
 * Valor da informação por faixa (capítulo 3, c3p17). O IV é a soma, em cada faixa, da diferença de proporções
 * multiplicada pelo WoE: pequenas separações entre bons e maus, faixa por faixa. As seis faixas de renda da base
 * de treino do gerador, com a leitura convencional da força.
 */
type Faixa = { faixa: number; n: number; pb: number; pm: number; woe: number; iv: number };
const F = woe.renda.faixas as Faixa[]; const EDGES = woe.renda.edges as number[];
export const IV_TOTAL = F.reduce((s, f) => s + f.iv, 0);
export const leituraIV = (iv: number) => (iv < 0.02 ? "inútil" : iv < 0.1 ? "fraca" : iv < 0.3 ? "média" : "forte");
const reais = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
const rotulo = (i: number) => i === 0 ? `até ${reais(EDGES[0])}` : i === EDGES.length ? `acima de ${reais(EDGES[i - 1])}` : `${reais(EDGES[i - 1])} a ${reais(EDGES[i])}`;
const W = 640, H = 230, ML = 50, MR = 14, MT = 20, MB = 44;

export function ValorDaInformacao() {
  const [i, setI] = useState(0);
  const f = F[i]; const maior = F.reduce((m, x) => (x.iv > m.iv ? x : m), F[0]);
  const max = Math.max(...F.map((x) => x.iv)) * 1.2; const bw = (W - ML - MR) / F.length;
  const sy = (v: number) => MT + (1 - v / max) * (H - MT - MB);
  return (
    <figure className="vz" data-vz="valor-da-informacao">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Valor da informação por faixa · renda declarada · 2.103 propostas de treino do gerador</p>
          <p className="vz-tit">O IV é a soma de pequenas separações entre bons e maus, faixa por faixa. Uma faixa numerosa não é necessariamente a mais informativa.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Faixa">{F.map((x, j) => <button key={x.faixa} type="button" className={`btn btn-sm ${i === j ? "" : "btn-secondary"}`} onClick={() => setI(j)}>F{j + 1}</button>)}</div>
      </header>
      <div className="vz-estado"><b>F{i + 1}, {rotulo(i)}, {f.n} clientes: WoE {fmtNum(f.woe, 4)}, contribuição para o IV {fmtNum(f.iv, 5)}.</b> IV total da variável {fmtNum(IV_TOTAL, 5)}, leitura {leituraIV(IV_TOTAL)}; a maior contribuição vem de F{maior.faixa + 1}, com {maior.n} clientes.</div>
      <div className="vz-vi-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Contribuição de cada faixa para o IV <span className="hint">(% bons − % maus) × WoE, sempre positiva; a soma é o IV</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Contribuições: ${F.map((x) => fmtNum(x.iv, 5)).join(", ")}; total ${fmtNum(IV_TOTAL, 5)}`}>
            {[0, 0.0025, 0.005, 0.0075, 0.01].map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 4)}</text></g>)}
            {F.map((x, j) => <g key={x.faixa} onClick={() => setI(j)} style={{ cursor: "pointer" }}><rect x={ML + j * bw + 10} y={sy(x.iv)} width={bw - 20} height={sy(0) - sy(x.iv)} rx={3} className={`vz-vi-b ${j === i ? "vz-vi-b--on" : ""} ${x.woe >= 0 ? "vz-vi-b--bom" : "vz-vi-b--mau"}`} /><text x={ML + (j + 0.5) * bw} y={sy(x.iv) - 6} textAnchor="middle" className="vz-tick vz-tick--forte">{fmtNum(x.iv, 5)}</text><text x={ML + (j + 0.5) * bw} y={H - MB + 16} textAnchor="middle" className="vz-tick">F{j + 1} · {x.n}</text><text x={ML + (j + 0.5) * bw} y={H - MB + 30} textAnchor="middle" className="vz-tick">WoE {fmtNum(x.woe, 2)}</text></g>)}
            <text x={ML + 4} y={MT - 7} className="vz-rotulo">contribuição para o IV</text>
          </svg>
          <Formula f={String.raw`\mathrm{IV} = \sum_{\text{faixas}} \big(\%\,\text{bons} - \%\,\text{maus}\big) \times \mathrm{WoE}`} />
        </div>
        <div className="vz-vi-lado">
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">F{i + 1} · {f.n} clientes</p><p className={`vz-num ${f.woe >= 0 ? "vz-num--ok" : "vz-num--default"}`}>{fmtNum(f.woe, 4)}</p><p className="hint">WoE da faixa: {fmtPct(f.pb, 2)} dos bons e {fmtPct(f.pm, 2)} dos maus</p></div>
            <div className="vz-tile"><p className="eyebrow">Contribuição para o IV</p><p className="vz-num">{fmtNum(f.iv, 5)}</p><p className="hint">({fmtPct(f.pb, 2)} − {fmtPct(f.pm, 2)}) × {fmtNum(f.woe, 4)}</p></div>
          </div>
          <div className="vz-tiles vz-tiles--3">
            <div className="vz-tile"><p className="eyebrow">IV total da variável</p><p className="vz-num">{fmtNum(IV_TOTAL, 5)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Maior contribuição</p><p className="vz-num">F{maior.faixa + 1}</p></div>
            <div className="vz-tile"><p className="eyebrow">Leitura</p><p className="vz-num vz-num--default">{leituraIV(IV_TOTAL)}</p></div>
          </div>
          <div className="table-wrap"><table className="table text-[.8em]"><thead><tr><th>Faixa</th><th>Clientes</th><th>% bons</th><th>% maus</th><th>WoE</th><th>IV</th></tr></thead><tbody>
            {F.map((x, j) => <tr key={x.faixa} className={j === i ? "vz-t-on" : ""} onClick={() => setI(j)} style={{ cursor: "pointer" }}><th scope="row">F{j + 1}</th><td>{x.n}</td><td>{fmtPct(x.pb, 2)}</td><td>{fmtPct(x.pm, 2)}</td><td>{fmtNum(x.woe, 4)}</td><td>{fmtNum(x.iv, 5)}</td></tr>)}
            <tr className="vz-t-on"><th scope="row">total</th><td>{F.reduce((s, x) => s + x.n, 0).toLocaleString("pt-BR")}</td><td /><td /><td /><td className="vz-t-forte">{fmtNum(IV_TOTAL, 5)}</td></tr>
          </tbody></table></div>
          <p className="hint">Convenção de leitura: abaixo de 0,02 inútil, até 0,10 fraca, até 0,30 média, acima forte. O sinal mostra de que lado está a concentração relativa; a contribuição mede quanto esta faixa separa bons e maus.</p>
        </div>
      </div>
      <p className="vz-fonte">Faixas de renda declarada no treino do gerador; F1 tem 3 clientes e WoE −0,4556 com contribuição 0,00041; F5 tem 841 e contribui 0,00867; IV total 0,03174, fraca. A soma das seis contribuições fecha com o IV publicado pelo gerador.</p>
    </figure>
  );
}
