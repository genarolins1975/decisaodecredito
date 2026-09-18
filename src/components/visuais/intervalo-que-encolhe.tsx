"use client";
import { useState } from "react";
import { wilson } from "@/lib/visuais/arvore";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * O intervalo que encolhe (capítulo 2, c2p16). Mesma fração, 1 em 8, com a amostra crescendo: a estimativa pontual
 * não muda, só a largura do intervalo, e ela cai com a raiz do número de observações.
 */
const W = 600, H = 150, ML = 90, MR = 20;
const sx = (v: number) => ML + v * (W - ML - MR);
const N8 = [8, 16, 32, 80, 200, 800, 3200];

export function IntervaloQueEncolhe() {
  const [i, setI] = useState(0);
  const n = N8[i]; const k = n / 8; const w = wilson(k, n); const largura = w.hi - w.lo;
  const w1 = wilson(0, 1);
  return (
    <figure className="vz" data-vz="intervalo-que-encolhe">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O intervalo que encolhe · 1 default em cada 8, com a amostra crescendo · intervalo de Wilson a 95%</p>
          <p className="vz-tit">A estimativa é sempre 12,5%. Só a largura muda, e ela cai com a raiz do número de observações.</p>
        </div>
      </header>
      <div className="vz-estado"><b>{n.toLocaleString("pt-BR")} observações, {k.toLocaleString("pt-BR")} defaults:</b> estimativa {fmtPct(k / n, 1)}, intervalo de {fmtPct(w.lo, 1)} a {fmtPct(w.hi, 1)}, largura {fmtPct(largura, 1)}. {i > 0 && <>Quadruplicar a amostra reduz a largura pela metade: de 8 para 32 a largura cai de {fmtPct(wilson(1, 8).hi - wilson(1, 8).lo, 1)} para {fmtPct(wilson(4, 32).hi - wilson(4, 32).lo, 1)}.</>}</div>
      <div className="vz-int-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Intervalos para cada tamanho de amostra <span className="hint">ponto: estimativa · traço: intervalo · destacado: o tamanho escolhido</span></p>
          <svg viewBox={`0 0 ${W} ${40 + N8.length * 28}`} role="img" aria-label="Intervalos de Wilson por tamanho de amostra">
            {[0, 0.125, 0.25, 0.5].map((v) => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={8} y2={N8.length * 28 + 12} className={v === 0.125 ? "vz-corte" : "vz-grade"} /><text x={sx(v)} y={N8.length * 28 + 28} textAnchor="middle" className="vz-tick">{fmtPct(v, 1)}</text></g>)}
            {N8.map((m, j) => { const ww = wilson(m / 8, m); const y = 20 + j * 28; const on = j === i; return <g key={m} className={`vz-int-linha ${on ? "vz-int-linha--on" : ""}`} onClick={() => setI(j)}>
              <text x={ML - 10} y={y + 4} textAnchor="end" className="vz-rotulo">{m.toLocaleString("pt-BR")} <tspan className="vz-tick">obs.</tspan></text>
              <line x1={sx(ww.lo)} x2={sx(ww.hi)} y1={y} y2={y} className="vz-eq-ic" />
              <line x1={sx(ww.lo)} x2={sx(ww.lo)} y1={y - 7} y2={y + 7} className="vz-eq-ic" /><line x1={sx(ww.hi)} x2={sx(ww.hi)} y1={y - 7} y2={y + 7} className="vz-eq-ic" />
              <circle cx={sx(0.125)} cy={y} r={on ? 6 : 4} className="vz-int-pt" />
              <text x={sx(ww.hi) + 8} y={y + 4} className="vz-tick">largura {fmtPct(ww.hi - ww.lo, 1)}</text>
            </g>; })}
          </svg>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Observações no grupo, mantendo 1 em 8</span><span className="vz-slider-valor">{n.toLocaleString("pt-BR")}</span></span><input type="range" min={0} max={N8.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} /></label>
        </div>
        <div className="vz-int-painel">
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">Largura do intervalo</p><p className="vz-num">{fmtPct(largura, 1)}</p><p className="hint">largura ∝ 1 ÷ √n: com {n.toLocaleString("pt-BR")} observações, √n = {fmtNum(Math.sqrt(n), 1)}</p></div>
            <div className="vz-tile"><p className="eyebrow">A folha de uma proposta, revisitada</p><p className="vz-num vz-num--texto">Com 1 observação e 0 defaults, o intervalo vai de 0% a {fmtPct(w1.hi, 1)}. A folha não afirma nada.</p></div>
            <div className="vz-tile"><p className="eyebrow">Onde isso reaparece</p><p className="vz-num vz-num--texto">Folhas com poucos casos produzem PD sem significado; o capítulo 7 exige intervalo em toda curva de calibração.</p></div>
          </div>
        </div>
      </div>
      <p className="vz-fonte">Intervalo de Wilson a 95%. Com 8 observações e 1 default: 2,2% a 47,1%, largura 44,8%; com 80 e 10: 6,9% a 21,5%; com 800 e 100: 10,4% a 15,0%, os números da página.</p>
    </figure>
  );
}
