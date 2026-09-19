"use client";
import { useState } from "react";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { escoreDidatico, logit, odds } from "@/lib/visuais/logistica";

/**
 * A régua das quatro escalas (capítulo 4, página 6). As páginas 3, 4 e 5 são as peças escala-probabilidade,
 * escala-odds e escala-logodds. Uma só PD lida em quatro réguas, mais o escore didático 600 − 90 × z.
 */
export type ModoEscalas = "regua";
const W = 640;
const REGUA_PDS = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 0.95];

export function Escalas({ modo }: { modo: ModoEscalas }) {
  void modo;
  const [pd, setPd] = useState(0.05);
  return <Regua pd={pd} setPd={setPd} />;
}

function Slider({ rotulo, pd, setPd, min = 1, max = 95 }: { rotulo: string; pd: number; setPd: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="vz-slider"><span className="vz-slider-rotulo"><b>{rotulo}</b> <span className="vz-slider-valor">{fmtPct(pd)}</span></span>
      <input type="range" min={min} max={max} step={1} value={Math.round(pd * 100)} onChange={(e) => setPd(Number(e.target.value) / 100)} aria-valuetext={fmtPct(pd)} /></label>
  );
}

/* Página c4p6: as quatro réguas lado a lado e a tabela de tradução. */
function Regua({ pd, setPd }: { pd: number; setPd: (v: number) => void }) {
  const o = odds(pd), z = logit(pd), sc = escoreDidatico(pd);
  const ML = 24, MR = 24, span = W - ML - MR;
  const xp = (q: number) => ML + q * span, xo = (v: number) => ML + ((Math.log10(v) + 2) / 4) * span, xz = (v: number) => ML + ((v + 6) / 12) * span;
  const zc = Math.max(-6, Math.min(6, z)), oc = Math.max(0.01, Math.min(100, o));
  const perto = REGUA_PDS.reduce((m, q) => (Math.abs(q - pd) < Math.abs(m - pd) ? q : m), REGUA_PDS[0]);
  const reguas = [
    { y: 44, nome: "probabilidade", x: xp(pd), rotulo: fmtPct(pd), ticks: [0, 0.25, 0.5, 0.75, 1].map((v) => ({ x: xp(v), t: fmtPct(v) })), nota: `em 100 propostas semelhantes, cerca de ${Math.round(100 * pd)} defaults` },
    { y: 112, nome: "odds", x: xo(oc), rotulo: fmtNum(o, 3), ticks: [0.01, 0.1, 1, 10, 100].map((v) => ({ x: xo(v), t: v.toLocaleString("pt-BR") })), nota: "defaults para cada adimplente, escala logarítmica" },
    { y: 180, nome: "log odds", x: xz(zc), rotulo: fmtNum(z, 3), ticks: [-6, -3, 0, 3, 6].map((v) => ({ x: xz(v), t: String(v) })), nota: "a escala em que somar faz sentido" },
    { y: 248, nome: "escore 600 − 90 × z", x: xz(zc), rotulo: String(sc), ticks: [-6, -3, 0, 3, 6].map((v) => ({ x: xz(v), t: String(600 - 90 * v) })), nota: "a mesma régua, deslocada e invertida: maior é melhor" },
  ];
  return (
    <figure className="vz" data-vz="escala-regua">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">As três escalas na mesma régua · e a convenção de escore do curso</p>
          <p className="vz-tit">Nenhuma das escalas é a correta. Cada uma resolve uma etapa, e as quatro preservam a mesma ordem.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Probabilidades de exemplo">
          {[0.05, 0.1, 0.5, 0.9].map((q) => <button key={q} type="button" className={`btn btn-sm ${Math.abs(pd - q) < 1e-6 ? "" : "btn-secondary"}`} onClick={() => setPd(q)}>PD {fmtPct(q)}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>PD {fmtPct(pd)}:</b> odds {fmtNum(o, 3)}, log odds {fmtNum(z, 3)}, escore didático {sc}. Só muda a régua usada para comunicar e calcular.</div>
      <div className="vz-esc-grade">
        <div className="vz-esc-painel">
          <Slider rotulo="PD" pd={pd} setPd={setPd} />
          <div className="vz-grafico vz-esc-reguas">
            <svg viewBox={`0 0 ${W} 276`} role="img" aria-label={`PD ${fmtPct(pd)}, odds ${fmtNum(o, 3)}, log odds ${fmtNum(z, 3)}, escore ${sc}`}>
              <polyline points={reguas.map((r) => `${r.x},${r.y}`).join(" ")} className="vz-liga" />
              {reguas.map((r) => { const anc = r.x > W - MR - 150 ? "end" : r.x < ML + 110 ? "start" : "middle"; const dx = anc === "end" ? -10 : anc === "start" ? 10 : 0;
                return <g key={r.nome}>
                  <text x={ML} y={r.y - 17} className="vz-rotulo">{r.nome}</text>
                  <text x={W - MR} y={r.y - 17} textAnchor="end" className="vz-tick vz-tick--nota">{r.nota}</text>
                  <line x1={ML} x2={W - MR} y1={r.y} y2={r.y} className="vz-regua" />
                  {r.ticks.map((t) => <g key={t.t}><line x1={t.x} x2={t.x} y1={r.y - 4} y2={r.y + 4} className="vz-regua" /><text x={t.x} y={r.y + 18} textAnchor="middle" className="vz-tick">{t.t}</text></g>)}
                  <g className="vz-regua-ponto" style={{ transform: `translate(${r.x}px, ${r.y}px)` }}><circle r={7} /><text x={dx} y={-6 + (anc === "middle" ? -3 : 0)} textAnchor={anc} className="vz-ponto-t">{r.rotulo}</text></g>
                </g>; })}
            </svg>
          </div>
          <div className="vz-tile"><p className="eyebrow">Onde cada escala é usada</p>
            <table className="table text-[.85em] vz-esc-usos"><tbody>
              <tr><th scope="row">Log odds</th><td>dentro do modelo, onde os efeitos somam. Capítulos 4 e 6</td></tr>
              <tr><th scope="row">Odds</th><td>na comunicação de efeito: esta variável multiplica as chances por tanto. Capítulo 4</td></tr>
              <tr><th scope="row">Probabilidade</th><td>na calibração e na conta econômica, onde ela multiplica exposição e perda. Capítulos 7 e 8</td></tr>
              <tr><th scope="row">Escore</th><td>na operação e na comunicação com áreas de negócio. Capítulo 8</td></tr>
            </tbody></table></div>
        </div>
        <div className="vz-esc-lado">
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>PD</th><th>Odds</th><th>Log odds</th><th>Escore (600 − 90 × z)</th></tr></thead><tbody>
            {REGUA_PDS.map((q) => <tr key={q} className={q === perto ? "vz-t-on" : ""}><th scope="row">{fmtPct(q, q < 0.1 ? 1 : 0)}</th><td>{fmtNum(odds(q), 3)}</td><td>{fmtNum(logit(q), 3)}</td><td>{escoreDidatico(q)}</td></tr>)}
          </tbody></table></div>
          <p className="hint">A última coluna é a convenção de escore deste curso. Ela apenas desloca e inverte o log odds para que número maior signifique risco menor, como o mercado espera. Nenhuma informação é acrescentada.</p>
        </div>
      </div>
      <p className="vz-fonte">odds = p ÷ (1 − p); z = ln(odds); p = 1 ÷ (1 + e^(−z)); escore = 600 − 90 × z, arredondado. PD 5%: odds 0,053, log odds −2,944 e escore 865; PD 50%: odds 1, log odds 0 e escore 600. A tabela de tradução serve para levar para a mesa.</p>
    </figure>
  );
}

