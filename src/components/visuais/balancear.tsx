"use client";
import { useMemo, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import woe from "@/lib/visuais/woe.json";
import { aucPorPares, fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * Balancear a amostra não muda o mundo (capítulo 3, c3p15). Reamostrar por classe desloca o nível da PD prevista e
 * não altera a ordenação, porque corrigir a prior é uma transformação monótona das odds. Medido na janela fora do
 * tempo, com a logística do gerador.
 */
const Y = oot.y as number[], P = oot.pd as number[];
const PI = woe.prevalenciaTreino;
export const reponderar = (p: number, pa: number, pi = PI) => { const pc = Math.min(1 - 1e-9, Math.max(1e-9, p)); const f = (pa / (1 - pa)) / (pi / (1 - pi)); const o = (pc / (1 - pc)) * f; return o / (1 + o); };
const W = 640, H = 300, ML = 50, MR = 14, MT = 20, MB = 38;
const sx = (v: number) => ML + v * (W - ML - MR), sy = (v: number) => MT + (1 - v) * (H - MT - MB);

export function Balancear() {
  const [pa, setPa] = useState(0.096);
  const [corrigido, setCorrigido] = useState(false);
  const r = useMemo(() => {
    const q = P.map((p) => reponderar(p, pa)); const volta = q.map((v) => reponderar(v, PI, pa));
    const media = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
    return { q, volta, auc: aucPorPares(Y, P).auc, aucQ: aucPorPares(Y, q).auc, aucV: aucPorPares(Y, volta).auc, mp: media(P), mq: media(q), mv: media(volta), obs: media(Y) };
  }, [pa]);
  const igual = Math.abs(r.auc - r.aucQ) < 1e-12;
  const curva = Array.from({ length: 101 }, (_, i) => i / 100).map((p, i) => `${i ? "L" : "M"}${sx(p).toFixed(1)} ${sy(corrigido ? p : reponderar(p, pa)).toFixed(1)}`).join("");
  const mostrada = corrigido ? r.mv : r.mq;
  return (
    <figure className="vz" data-vz="balancear">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Balancear a amostra não muda o mundo · treino com {fmtPct(PI, 1)} de defaults · medido na janela fora do tempo, 737 propostas</p>
          <p className="vz-tit">Reamostrar por classe desloca o nível da PD e não altera a ordenação. Corrigir a prior é uma transformação monótona das odds.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className={`btn btn-sm ${corrigido ? "btn-secondary" : ""}`} onClick={() => setCorrigido(false)}>Como sai do modelo balanceado</button>
          <button type="button" className={`btn btn-sm ${corrigido ? "" : "btn-secondary"}`} onClick={() => setCorrigido(true)}>Com a correção de volta</button>
        </div>
      </header>
      <div className={`vz-estado ${Math.abs(mostrada - r.obs) > 0.02 ? "vz-estado--alterado" : "vz-estado--ok"}`}><b>Amostra com {fmtPct(pa, 1)} de defaults: AUC {fmtNum(r.aucQ, 6)}, {igual ? "idêntica até a sexta casa decimal" : "diferente"}; PD média prevista {fmtPct(mostrada, 2)} contra {fmtPct(r.obs, 2)} observado.</b> {igual ? "A ordenação não sentiu a reamostragem, enquanto a PD média já se afastou do default observado." : "O AUC se moveu. Verifique a transformação: ela deixou de ser monótona."}{corrigido ? " A correção de volta recoloca o nível onde o modelo sem balancear estava." : ""}</div>
      <div className="vz-bal-grade">
        <div className="vz-bal-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Proporção de defaults na amostra de treino</b> <span className="vz-slider-valor">{fmtPct(pa, 1)}</span></span><input type="range" min={96} max={500} step={4} value={Math.round(pa * 1000)} onChange={(e) => setPa(Number(e.target.value) / 1000)} aria-valuetext={fmtPct(pa, 1)} /></label>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Medida</th><th>Sem balancear</th><th>Com amostra balanceada</th>{corrigido && <th>Corrigida de volta</th>}</tr></thead><tbody>
            <tr><th scope="row">AUC</th><td>{fmtNum(r.auc, 6)}</td><td>{fmtNum(r.aucQ, 6)}</td>{corrigido && <td>{fmtNum(r.aucV, 6)}</td>}</tr>
            <tr><th scope="row">PD média prevista</th><td>{fmtPct(r.mp, 2)}</td><td className="vz-t-default">{fmtPct(r.mq, 2)}</td>{corrigido && <td className="vz-t-ok">{fmtPct(r.mv, 2)}</td>}</tr>
            <tr><th scope="row">Default observado</th><td colSpan={corrigido ? 3 : 2}>{fmtPct(r.obs, 2)} na janela, 81 em 737</td></tr>
          </tbody></table></div>
          <div className="vz-formula">odds corrigida = odds da amostra × [π ÷ (1 − π)] ÷ [πa ÷ (1 − πa)]</div>
          <p className="hint">π é a prevalência real da população e πa a prevalência da amostra reamostrada. A correção supõe que o balanceamento alterou apenas a proporção entre as classes. Subamostragem seletiva quebra essa hipótese e não é consertada por esta fórmula.</p>
        </div>
        <div className="vz-bal-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">O que o balanceamento faz com cada PD <span className="hint">uma curva monótona acima da diagonal: a ordem de todas as propostas se preserva</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`PD balanceada em função da PD original; média ${fmtPct(mostrada, 2)}`}>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text><text x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text></g>)}
              <text x={sx(0.5)} y={H - 6} textAnchor="middle" className="vz-rotulo">PD do modelo sem balancear</text>
              <text x={ML + 4} y={MT - 7} className="vz-rotulo">PD {corrigido ? "corrigida de volta" : "do modelo balanceado"}</text>
              <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} className="vz-diagonal" />
              <path d={curva} className="vz-curva" />
              {P.filter((_, i) => i % 6 === 0).map((p, i) => <circle key={i} cx={sx(p)} cy={sy(corrigido ? reponderar(reponderar(p, pa), PI, pa) : reponderar(p, pa))} r={3} className={Y[i * 6] ? "vz-dot--default" : "vz-dot--pagou"} opacity={0.7} />)}
              <line x1={sx(r.mp)} x2={sx(r.mp)} y1={sy(0)} y2={sy(mostrada)} className="vz-corte-linha" /><line x1={sx(0)} x2={sx(r.mp)} y1={sy(mostrada)} y2={sy(mostrada)} className="vz-corte-linha" />
              <g className="vz-regua-ponto" style={{ transform: `translate(${sx(r.mp)}px, ${sy(mostrada)}px)` }}><circle r={7} /><text x={12} y={-8} className="vz-ponto-t">média {fmtPct(r.mp, 2)} → {fmtPct(mostrada, 2)}</text></g>
            </svg>
          </div>
          <div className="vz-tile vz-tile--alerta"><p className="eyebrow">Por que isso importa no capítulo 8</p><p className="vz-num vz-num--texto">A ordenação basta para aprovar e recusar. O nível é o que entra na perda esperada e na precificação. Um modelo balanceado sem correção de volta ordena bem e erra todos os valores em reais, e o erro passa despercebido em qualquer relatório que só reporte AUC.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Logística do gerador na janela fora do tempo: AUC 0,725685 com qualquer proporção artificial, porque a reponderação das odds é monótona. PD média 9,72% sem balancear, 9,76% com 9,6% de defaults na amostra, 19,35% com 20% e 45,34% com 50%; default observado 10,99%. Uma amostra de 737 propostas com 81 defaults.</p>
    </figure>
  );
}
