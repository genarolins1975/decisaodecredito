"use client";
import { useState } from "react";
import woe from "@/lib/visuais/woe.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { Formula } from "./tex";

/**
 * O peso da evidência (capítulo 3, c3p16). A faixa vista pelos dois desfechos: WoE é o logaritmo da razão entre a
 * participação de bons e a de maus naquela faixa, direto na escala de log odds. A composição na mão, e depois as
 * seis faixas de utilização estimadas na base de treino do gerador.
 */
const EXEMPLOS = [{ k: "igual", rot: "mesma proporção", bom: 0.5, mau: 0.5 }, { k: "bons", rot: "mais bons", bom: 0.7, mau: 0.3 }, { k: "maus", rot: "mais maus", bom: 0.25, mau: 0.75 }];
const U = woe.utilizacao as { edges: number[]; woe: number[]; n: number[] };
const rotuloFaixa = (i: number) => i === 0 ? `até ${fmtNum(U.edges[0], 1)}%` : i === U.edges.length ? `acima de ${fmtNum(U.edges[i - 1], 1)}%` : `${fmtNum(U.edges[i - 1], 1)}% a ${fmtNum(U.edges[i], 1)}%`;
const W = 640, H = 250, ML = 50, MR = 14, MT = 20, MB = 50;

export function Woe() {
  const [bom, setBom] = useState(0.5);
  const [mau, setMau] = useState(0.5);
  const w = Math.log(bom / mau);
  const leitura = Math.abs(w) < 0.001 ? "A faixa aparece na mesma proporção nos dois grupos: não separa." : w > 0 ? "Sinal positivo: a faixa concentra relativamente mais bons." : "Sinal negativo: a faixa concentra relativamente mais maus.";
  const max = Math.max(...U.woe.map(Math.abs)) * 1.15; const bw = (W - ML - MR) / U.woe.length;
  const sy = (v: number) => MT + (1 - (v + max) / (2 * max)) * (H - MT - MB);
  return (
    <figure className="vz" data-vz="woe">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O peso da evidência · a faixa vista pelos dois desfechos · WoE = ln(% bons ÷ % maus)</p>
          <p className="vz-tit">O WoE troca o valor bruto da faixa pelo logaritmo da razão entre a participação de bons e a de maus, direto na escala de log odds.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Composição de exemplo">{EXEMPLOS.map((e) => <button key={e.k} type="button" className={`btn btn-sm ${bom === e.bom && mau === e.mau ? "" : "btn-secondary"}`} onClick={() => { setBom(e.bom); setMau(e.mau); }}>{e.rot}</button>)}</div>
      </header>
      <div className="vz-estado"><b>Bons na faixa {fmtPct(bom)}, maus na faixa {fmtPct(mau)}: WoE = ln({fmtNum(bom, 2)} ÷ {fmtNum(mau, 2)}) = {fmtNum(w, 3)}.</b> {leitura}</div>
      <div className="vz-woe-grade">
        <div className="vz-woe-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Participação da faixa entre os bons</b> <span className="vz-slider-valor">{fmtPct(bom)}</span></span><input type="range" min={5} max={95} step={5} value={Math.round(bom * 100)} onChange={(e) => setBom(Number(e.target.value) / 100)} aria-valuetext={fmtPct(bom)} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Participação da faixa entre os maus</b> <span className="vz-slider-valor">{fmtPct(mau)}</span></span><input type="range" min={5} max={95} step={5} value={Math.round(mau * 100)} onChange={(e) => setMau(Number(e.target.value) / 100)} aria-valuetext={fmtPct(mau)} /></label>
          <div className="vz-woe-balanca" role="img" aria-label={`WoE ${fmtNum(w, 3)}`}>
            <div className="vz-woe-lado"><span className="eyebrow">bons na faixa</span><span className="vz-woe-barra vz-woe-barra--bom" style={{ height: `${bom * 100}%` }} /><b>{fmtPct(bom)}</b></div>
            <div className="vz-woe-div">÷</div>
            <div className="vz-woe-lado"><span className="eyebrow">maus na faixa</span><span className="vz-woe-barra vz-woe-barra--mau" style={{ height: `${mau * 100}%` }} /><b>{fmtPct(mau)}</b></div>
            <div className="vz-woe-res"><span className="eyebrow">concentração relativa</span><p className={`vz-num ${w > 0.001 ? "vz-num--ok" : w < -0.001 ? "vz-num--default" : ""}`}>{fmtNum(w, 3)}</p><span className="hint">ln({fmtNum(bom / mau, 3)})</span></div>
          </div>
          <Formula f={String.raw`\mathrm{WoE}_{\text{faixa}} = \ln\dfrac{\text{proporção de bons}}{\text{proporção de maus}}`} />
        </div>
        <div className="vz-woe-lado2">
          <div className="vz-grafico">
            <p className="vz-grafico-t">O WoE das seis faixas de utilização na base de treino <span className="hint">2.103 propostas, faixas de contagem quase igual</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`WoE por faixa: ${U.woe.map((v) => fmtNum(v, 3)).join(", ")}`}>
              {[-0.8, -0.4, 0, 0.4, 0.8].map((v) => <g key={v}><line x1={ML} x2={W - MR} y1={sy(v)} y2={sy(v)} className={v === 0 ? "vz-zero" : "vz-grade"} /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 1)}</text></g>)}
              {U.woe.map((v, i) => <g key={i}><rect x={ML + i * bw + 8} y={Math.min(sy(0), sy(v))} width={bw - 16} height={Math.abs(sy(v) - sy(0))} rx={3} className={v >= 0 ? "vz-woe-b--bom" : "vz-woe-b--mau"} /><text x={ML + (i + 0.5) * bw} y={v >= 0 ? sy(v) - 6 : sy(v) + 14} textAnchor="middle" className="vz-tick vz-tick--forte">{fmtNum(v, 3)}</text><text x={ML + (i + 0.5) * bw} y={H - MB + 16} textAnchor="middle" className="vz-tick">{rotuloFaixa(i)}</text><text x={ML + (i + 0.5) * bw} y={H - MB + 30} textAnchor="middle" className="vz-tick">{U.n[i]} propostas</text></g>)}
              <text x={ML + 4} y={MT - 7} className="vz-rotulo">WoE, positivo concentra bons</text>
            </svg>
          </div>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">Como ler as barras</p><p className="vz-num vz-num--texto">Utilização baixa concentra bons, WoE positivo; utilização alta concentra maus, WoE negativo. A ordem das faixas é monótona, o que sustenta a hipótese econômica. O sinal diz de que lado está a concentração; a magnitude, o quanto a faixa separa.</p></div>
        </div>
      </div>
      <p className="vz-fonte">WoE das faixas de utilização no treino do gerador: {U.woe.map((v, i) => `${rotuloFaixa(i)} ${fmtNum(v, 4)}`).join("; ")}. A próxima página soma, faixa a faixa, o quanto essa separação vale: o valor da informação.</p>
    </figure>
  );
}
