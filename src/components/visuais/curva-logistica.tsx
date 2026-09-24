"use client";
import { useMemo, useState } from "react";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { inclinacaoLocal, sigmoide } from "@/lib/visuais/logistica";
import { Formula } from "./tex";

/**
 * A curva logística faz o caminho de volta (capítulo 4, c4p7). Um escore z em log odds vira PD; somar 1 a z desloca a
 * PD de forma diferente conforme o ponto de partida, e a inclinação é máxima em z = 0. Contas da página herdada.
 */
const W = 640, H = 330, ML = 50, MR = 16, MT = 24, MB = 38;
const sx = (v: number) => ML + ((v + 8) / 16) * (W - ML - MR), sy = (v: number) => MT + (1 - v) * (H - MT - MB);
const PROPRIEDADES = [
  { n: "Domínio garantido", t: "nenhum z produz PD fora de 0 a 1, por construção" },
  { n: "Monotonicidade", t: "z maior sempre significa PD maior, sem exceção" },
  { n: "Inclinação máxima em z = 0", t: "é onde a PD é 50% e onde uma unidade de z desloca mais a PD" },
];

export function CurvaLogistica() {
  const [z, setZ] = useState(-1.5);
  const p = sigmoide(z), p1 = sigmoide(z + 1), incl = inclinacaoLocal(z);
  const curva = useMemo(() => Array.from({ length: 161 }, (_, i) => -8 + i * 0.1).map((v, i) => `${i ? "L" : "M"}${sx(v).toFixed(1)} ${sy(sigmoide(v)).toFixed(1)}`).join(""), []);
  const zc = Math.max(-8, Math.min(8, z)), t0 = Math.max(-8, zc - 1.6), t1 = Math.min(8, zc + 1.6);
  return (
    <figure className="vz" data-vz="curva-logistica">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A curva logística faz o caminho de volta · da reta inteira para o intervalo de 0 a 1</p>
          <p className="vz-tit">Se o log odds leva a PD para a reta inteira, a logística traz a reta inteira de volta. Uma é a outra ao contrário.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Escores de exemplo">
          {[-4, -1.5, 0, 2].map((v) => <button key={v} type="button" className={`btn btn-sm ${Math.abs(z - v) < 1e-9 ? "" : "btn-secondary"}`} onClick={() => setZ(v)}>z = {fmtNum(v, 1)}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>z = {fmtNum(z, 2)}:</b> odds {fmtNum(Math.exp(z), 3)} e PD {fmtPct(p, 1)}. Somar 1 a z leva a PD de {fmtPct(p, 1)} para {fmtPct(p1, 1)}, uma variação de {fmtNum(100 * (p1 - p), 2)} pontos. A inclinação local é {fmtNum(incl, 4)}, máxima em z = 0, onde vale 0,25.</div>
      <div className="vz-cl-grade">
        <div className="vz-cl-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Escore z, em log odds</b> <span className="vz-slider-valor">{fmtNum(z, 2)}</span></span>
            <input type="range" min={-600} max={600} step={5} value={Math.round(z * 100)} onChange={(e) => setZ(Number(e.target.value) / 100)} aria-valuetext={`z ${fmtNum(z, 2)}`} /></label>
          <div className="vz-tiles vz-tiles--3">
            <div className="vz-tile"><p className="eyebrow">z</p><p className="vz-num">{fmtNum(z, 2)}</p></div>
            <div className="vz-tile"><p className="eyebrow">odds = e^z</p><p className="vz-num vz-num--odds">{fmtNum(Math.exp(z), 3)}</p></div>
            <div className="vz-tile"><p className="eyebrow">PD</p><p className="vz-num vz-num--ouro">{fmtPct(p, 1)}</p></div>
          </div>
          <Formula f={String.raw`\mathrm{PD} = \dfrac{1}{1 + e^{-z}} \qquad z = \ln\dfrac{\mathrm{PD}}{1 - \mathrm{PD}}`} />
          <div className="vz-tile"><p className="eyebrow">Três propriedades que importam</p>
            <table className="table text-[.85em] vz-esc-usos"><tbody>{PROPRIEDADES.map((q) => <tr key={q.n}><th scope="row">{q.n}</th><td>{q.t}</td></tr>)}</tbody></table></div>
        </div>
        <div className="vz-grafico">
          <p className="vz-grafico-t">Curva logística <span className="hint">o degrau mostra o que somar 1 a z faz com a PD neste ponto</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva logística; z ${fmtNum(z, 2)} dá PD ${fmtPct(p, 1)}; z mais 1 dá ${fmtPct(p1, 1)}`}>
            {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={sx(-8)} x2={sx(8)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text></g>)}
            {[-8, -4, 0, 4, 8].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{v}</text>)}
            <text x={sx(0)} y={H - 6} textAnchor="middle" className="vz-rotulo">escore z, em log odds</text>
            <text x={ML + 4} y={MT - 9} className="vz-rotulo">PD</text>
            <line x1={sx(0)} x2={sx(0)} y1={sy(0)} y2={sy(1)} className="vz-zero" opacity={0.35} />
            <path d={curva} className="vz-curva" />
            <line x1={sx(t0)} y1={sy(p + incl * (t0 - zc))} x2={sx(t1)} y2={sy(p + incl * (t1 - zc))} className="vz-tangente" />
            <line x1={sx(zc)} x2={sx(zc)} y1={sy(0)} y2={sy(p)} className="vz-corte-linha" />
            <line x1={sx(-8)} x2={sx(zc)} y1={sy(p)} y2={sy(p)} className="vz-corte-linha" />
            {zc + 1 <= 8 && <g className="vz-cl-degrau">
              <line x1={sx(zc)} x2={sx(zc + 1)} y1={sy(p)} y2={sy(p)} />
              <line x1={sx(zc + 1)} x2={sx(zc + 1)} y1={sy(p)} y2={sy(p1)} />
              <text x={sx(zc + 1) + 8} y={(sy(p) + sy(p1)) / 2 + 4} className="vz-cl-degrau-t">+{fmtNum(100 * (p1 - p), 2)} pontos</text>
              <text x={(sx(zc) + sx(zc + 1)) / 2} y={sy(p) + 14} textAnchor="middle" className="vz-tick">+1 em z</text>
            </g>}
            <g className="vz-regua-ponto" style={{ transform: `translate(${sx(zc)}px, ${sy(p)}px)` }}><circle r={7} /><text x={z < -5.5 ? 12 : -12} y={z < -5.5 ? -26 : 22} textAnchor={z < -5.5 ? "start" : "end"} className="vz-ponto-t">z = {fmtNum(z, 2)} → PD {fmtPct(p, 1)}</text></g>
            <text x={sx(7.9)} y={sy(0.05)} textAnchor="end" className="vz-tick vz-tick--nota">inclinação aqui {fmtNum(incl, 4)} · em z = 0, 0,25</text>
          </svg>
        </div>
      </div>
      <p className="vz-fonte">A função logística leva qualquer número real para o intervalo de 0 a 1 e é exatamente a inversa do log odds. Em z = −1,50: odds 0,223, PD 18,2%; somar 1 leva a 37,8%, 19,51 pontos, com inclinação local 0,1492 por diferença central. Em z = 4, o mesmo +1 vale 1,1 ponto.</p>
    </figure>
  );
}
