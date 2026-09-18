"use client";
import { useEffect, useMemo, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { faixasDeCalibracao } from "@/lib/visuais/avaliacao";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * Calibração só pode ser verificada em grupos (capítulo 7). Modo grupos (c7p9): três faixas didáticas, esperados contra
 * observados, com as propostas desenhadas uma a uma. Modo faixas (c7p10): decis de PD prevista na janela, previsto
 * contra observado com o intervalo de Wilson, revelados faixa a faixa; o intervalo diz se a faixa contradiz o nível.
 */
export type ModoCal = "grupos" | "faixas";
const Y = oot.y as number[], PD = oot.pd as number[];
const GRUPOS = [{ rot: "faixa 5%", prev: 0.05, obs: 0.04, n: 120 }, { rot: "faixa 10%", prev: 0.1, obs: 0.11, n: 180 }, { rot: "faixa 20%", prev: 0.2, obs: 0.19, n: 140 }];
const W = 560, H = 300, ML = 50, MR = 16, MT = 14, MB = 40;
const sx = (v: number) => ML + (v / 0.35) * (W - ML - MR); const sy = (v: number) => MT + (1 - v / 0.45) * (H - MT - MB);

export function CalibracaoPorFaixa({ modo = "faixas" }: { modo?: ModoCal }) {
  const [g, setG] = useState(0);
  const [k, setK] = useState(1);
  const [revelando, setRevelando] = useState(false);
  const faixas = useMemo(() => faixasDeCalibracao(Y, PD), []);
  useEffect(() => { if (!revelando) return; const id = setTimeout(() => { if (k >= 10) setRevelando(false); else setK(k + 1); }, 600); return () => clearTimeout(id); }, [revelando, k]);
  const grupo = GRUPOS[g]; const esperados = Math.round(grupo.n * grupo.prev), observados = Math.round(grupo.n * grupo.obs);
  const vis = faixas.slice(0, k); const fora = vis.filter((f) => !f.compativel).length; const ult = faixas[k - 1];
  return (
    <figure className="vz" data-vz={`calibracao-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">{modo === "grupos" ? "Calibração só pode ser verificada em grupos · três faixas de risco" : "Compatibilidade entre previsão e frequência · decis de PD prevista na janela fora do tempo, logística"}</p>
          <p className="vz-tit">{modo === "grupos" ? "Uma pessoa não confirma uma probabilidade. O grupo fornece a frequência, e a frequência tem incerteza." : "O intervalo mostra se os dados de uma faixa contradizem o nível previsto. Ele não prova calibração."}</p>
        </div>
        {modo === "grupos" ? <div className="vz-acoes"><div className="vz-seg" role="group" aria-label="Faixa">{GRUPOS.map((x, i) => <button key={x.rot} type="button" className={`vz-seg-b ${g === i ? "vz-seg-b--on" : ""}`} onClick={() => setG(i)}>{x.rot}</button>)}</div></div>
          : <div className="vz-acoes"><button type="button" className="btn btn-sm" onClick={() => { setK(1); setRevelando(true); }} disabled={revelando}>{revelando ? "Revelando…" : "Revelar faixa a faixa"}</button></div>}
      </header>
      {modo === "grupos" ? (
        <>
          <div className="vz-estado"><b>{grupo.n} propostas com PD média prevista de {fmtPct(grupo.prev)}:</b> esperados {esperados} defaults, observados {observados}. Calibração é uma afirmação sobre grupos: compare a média prevista com a frequência observada e declare a incerteza.</div>
          <div className="vz-cal-grade">
            <div className="vz-grafico">
              <p className="vz-grafico-t">As {grupo.n} propostas da faixa <span className="hint">vermelho: default observado · contorno: quantos a PD média esperava</span></p>
              <div className="vz-cal-pontos" role="img" aria-label={`${grupo.n} propostas, ${observados} defaults observados, ${esperados} esperados`}>
                {Array.from({ length: grupo.n }, (_, i) => <i key={i} className={`${i < observados ? "vz-cal-p--d" : ""} ${i < esperados ? "vz-cal-p--esp" : ""}`} />)}
              </div>
            </div>
            <div className="vz-cal-painel">
              <div className="vz-tiles">
                <div className="vz-tile"><p className="eyebrow">Esperados</p><p className="vz-num">{esperados}</p><p className="hint">{grupo.n} × {fmtPct(grupo.prev)}</p></div>
                <div className="vz-tile"><p className="eyebrow">Observados</p><p className="vz-num vz-num--default">{observados}</p><p className="hint">frequência {fmtPct(grupo.obs)}</p></div>
              </div>
              <div className="vz-tile"><p className="eyebrow">Leitura</p><p className="vz-num vz-num--texto">Uma PD de {fmtPct(grupo.prev)} é uma afirmação sobre {grupo.n} propostas parecidas: cerca de {esperados} devem dar default. {observados} observados é compatível com isso; a página seguinte diz o quanto.</p></div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="vz-estado"><b>Faixas exibidas: {k} de 10.</b> Última faixa: previsto {fmtPct(ult.prev, 2)}, observado {fmtPct(ult.obs, 2)}, {ult.n} casos e {ult.k} {ult.k === 1 ? "default" : "defaults"}; intervalo de 95% de {fmtPct(ult.lo, 2)} a {fmtPct(ult.hi, 2)}. {ult.compativel ? "Os dados desta faixa são compatíveis com o nível previsto. Isso não comprova calibração nem equivalência prática." : "O nível previsto fica fora do intervalo: esta faixa contradiz a previsão."} Entre as {k} faixas exibidas, {fora} {fora === 1 ? "está" : "estão"} fora do respectivo intervalo.</div>
          <div className="vz-cal-grade">
            <div className="vz-grafico">
              <p className="vz-grafico-t">Previsto contra observado, faixa a faixa <span className="hint">diagonal: calibração perfeita · traço: intervalo de Wilson do observado</span></p>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de calibração por decil com intervalos">
                {[0, 0.1, 0.2, 0.3, 0.4].map((v) => <g key={v}><line x1={sx(0)} x2={sx(0.35)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text></g>)}
                {[0, 0.1, 0.2, 0.3].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text>)}
                <text x={sx(0.175)} y={H - 6} textAnchor="middle" className="vz-rotulo">PD média prevista na faixa</text><text x={12} y={MT + 10} className="vz-rotulo">observado</text>
                <line x1={sx(0)} x2={sx(0.35)} y1={sy(0)} y2={sy(0.35)} className="vz-corte" />
                {vis.map((f) => <g key={f.j}><line x1={sx(f.prev)} x2={sx(f.prev)} y1={sy(f.lo)} y2={sy(f.hi)} className="vz-eq-ic" /><circle cx={sx(f.prev)} cy={sy(f.obs)} r={f.j === k ? 7 : 5} className={f.compativel ? "vz-cal-pt" : "vz-cal-pt vz-cal-pt--fora"} /><text x={sx(f.prev) + (f.j % 2 ? 8 : -8)} y={sy(f.obs) + (f.j % 2 ? -9 : 14)} textAnchor={f.j % 2 ? "start" : "end"} className="vz-tick">F{f.j}</text></g>)}
              </svg>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Faixas exibidas</span><span className="vz-slider-valor">{k} de 10</span></span><input type="range" min={1} max={10} step={1} value={k} onChange={(e) => { setRevelando(false); setK(Number(e.target.value)); }} /></label>
            </div>
            <div className="vz-cal-painel">
              <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Faixa</th><th>n</th><th>Prev.</th><th>Obs.</th><th>IC 95%</th></tr></thead><tbody>{vis.map((f) => <tr key={f.j} className={f.j === k ? "vz-t-on" : undefined}><td>F{f.j}</td><td>{f.n}</td><td>{fmtPct(f.prev, 2)}</td><td>{fmtPct(f.obs, 2)}</td><td className={f.compativel ? "" : "vz-t-baixo"}>{fmtPct(f.lo, 1)} a {fmtPct(f.hi, 1)}</td></tr>)}</tbody></table></div>
              <p className="hint">Faixas por decil de PD prevista, na janela fora do tempo, com a logística. Cada intervalo é recalculado em tela a partir de k e n da faixa.</p>
            </div>
          </div>
        </>
      )}
      <p className="vz-fonte">{modo === "grupos" ? "Três faixas didáticas: 120 propostas em 5% (6 esperados, 5 observados), 180 em 10% (18 e 20), 140 em 20% (28 e 27)." : "Decis de PD prevista da logística na janela fora do tempo. Primeira faixa: previsto 2,48%, observado 1,35%, 74 casos e 1 default, intervalo de 0,24% a 7,27%; última: previsto 25,15%, observado 29,73%, 22 defaults em 74, os números da página."}</p>
    </figure>
  );
}
