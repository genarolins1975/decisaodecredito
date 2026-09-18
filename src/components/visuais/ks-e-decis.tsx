"use client";
import { useMemo, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import mod from "@/lib/visuais/oot-modelos.json";
import { decisDeRisco, ganho, matrizConfusao } from "@/lib/visuais/avaliacao";
import { curvaRoc, fmtNum, fmtPct, ks as ksDe } from "@/lib/visuais/metricas";

/**
 * KS e ganho por decil (capítulo 7). Modo ks (c7p7): as duas acumuladas ao longo da fila, a maior distância e o ponto
 * em que ela ocorre, contra a separação no corte operacional escolhido. Modo ganho (c7p8): a fila em decis, a fração
 * de defaults alcançada e a alavancagem, logística contra boosting, com a frequência observada e o intervalo de cada decil.
 */
export type ModoKs = "ks" | "ganho";
const Y = oot.y as number[], PD = oot.pd as number[], PG = mod.pg as number[];
const W = 560, H = 300, ML = 50, MR = 16, MT = 14, MB = 40;
const sx = (v: number) => ML + v * (W - ML - MR); const sy = (v: number) => MT + (1 - v) * (H - MT - MB);

export function KsEDecis({ modo = "ks" }: { modo?: ModoKs }) {
  const [corte, setCorte] = useState(0.12);
  const [k, setK] = useState(2);
  const roc = useMemo(() => curvaRoc(Y, PD), []); const K = useMemo(() => ksDe(roc), [roc]);
  const c = matrizConfusao(Y, PD, corte); const sep = c.recusadaDefault / c.defaults - c.recusadaPagou / (Y.length - c.defaults);
  const dl = useMemo(() => decisDeRisco(Y, PD), []); const db = useMemo(() => decisDeRisco(Y, PG), []);
  const gl = ganho(dl, k), gb = ganho(db, k);
  const n = Y.length; const recusados = c.recusadaDefault + c.recusadaPagou;
  // acumuladas por fração da carteira recusada (pior para melhor)
  const pts = roc.map((p, i) => ({ x: (i + 1) / roc.length, tpr: p.tpr, fpr: p.fpr, pd: p.pd }));
  const dKs = (campo: "tpr" | "fpr") => `M${sx(0)} ${sy(0)}` + pts.map((p) => `L${sx(p.x).toFixed(1)} ${sy(p[campo]).toFixed(1)}`).join("");
  const iMax = pts.reduce((b, p, i) => (p.tpr - p.fpr > pts[b].tpr - pts[b].fpr ? i : b), 0);
  const iCorte = Math.max(0, recusados - 1);
  return (
    <figure className="vz" data-vz={`ks-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">{modo === "ks" ? "KS é uma distância · janela fora do tempo, 737 propostas, 81 defaults · fila do pior escore para o melhor" : "Ganho e alavancagem · decis da fila, dos piores para os melhores · logística contra boosting calibrado"}</p>
          <p className="vz-tit">{modo === "ks" ? "KS é a maior distância entre as duas acumuladas. Reportar o máximo e operar em outro corte superestima a separação." : "Ganho é a fração dos defaults alcançada olhando os piores primeiro. Alavancagem é essa fração dividida pelo que sortear daria."}</p>
        </div>
      </header>
      {modo === "ks" ? (
        <>
          <div className="vz-estado"><b>KS máximo {fmtNum(K.ks, 4)} em PD estimada de {fmtPct(K.pd, 2)}.</b> No corte operacional de {fmtPct(corte, 1)} a separação é {fmtNum(sep, 4)}, com {recusados} propostas recusadas ({fmtPct(recusados / n)} da carteira). {sep < K.ks - 1e-6 ? `É ${fmtNum(K.ks - sep, 4)} menor que o máximo.` : "Este corte coincide com o ponto do máximo."}</div>
          <div className="vz-ks-grade">
            <div className="vz-grafico">
              <p className="vz-grafico-t">Acumuladas ao longo da fila <span className="hint">vermelho: defaults alcançados · azul: pagadores alcançados · dourado: a distância</span></p>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Acumuladas de defaults e de pagadores e a distância KS">
                {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text><text x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text></g>)}
                <text x={sx(0.5)} y={H - 6} textAnchor="middle" className="vz-rotulo">carteira recusada, do pior escore para o melhor</text>
                <path d={dKs("tpr")} className="vz-curva vz-curva--default" /><path d={dKs("fpr")} className="vz-curva vz-curva--pagou" />
                <line x1={sx(pts[iMax].x)} x2={sx(pts[iMax].x)} y1={sy(pts[iMax].fpr)} y2={sy(pts[iMax].tpr)} className="vz-ks-dist" />
                <text x={sx(pts[iMax].x) + 6} y={sy((pts[iMax].tpr + pts[iMax].fpr) / 2)} className="vz-tick vz-tick--ouro">KS {fmtNum(K.ks, 4)} em PD {fmtPct(K.pd, 1)}</text>
                <line x1={sx(pts[iCorte].x)} x2={sx(pts[iCorte].x)} y1={sy(0)} y2={sy(1)} className="vz-corte" />
                <text x={sx(pts[iCorte].x) + 4} y={sy(1) + 12} className="vz-tick">seu corte {fmtPct(corte, 1)} · separação {fmtNum(sep, 4)}</text>
              </svg>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Corte operacional de PD</span><span className="vz-slider-valor">{fmtPct(corte, 1)}</span></span><input type="range" min={2} max={40} step={0.5} value={corte * 100} onChange={(e) => setCorte(Number(e.target.value) / 100)} /></label>
            </div>
            <div className="vz-ks-painel">
              <div className="vz-tile"><p className="eyebrow">Três declarações obrigatórias ao reportar KS</p><ul className="vz-mesa-papeis"><li><b>Amostra</b> janela fora do tempo, 737 propostas, 81 defaults</li><li><b>Sentido do eixo</b> população ordenada do pior escore para o melhor, da maior PD para a menor</li><li><b>Ponto de medição</b> o máximo ocorre em PD estimada de {fmtPct(K.pd, 2)}</li></ul><p className="hint">Sem as três, o número não é reprodutível. Inverter o eixo não muda o KS, mas muda a leitura da posição.</p></div>
              <div className="vz-tiles">
                <div className="vz-tile"><p className="eyebrow">KS máximo</p><p className="vz-num">{fmtNum(K.ks, 4)}</p><p className="hint">em PD de {fmtPct(K.pd, 2)}</p></div>
                <div className="vz-tile"><p className="eyebrow">Separação no seu corte</p><p className="vz-num">{fmtNum(sep, 4)}</p><p className="hint">em PD de {fmtPct(corte, 1)}</p></div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="vz-estado"><b>{k} de 10 decis examinados, {gl.examinados} propostas.</b> Ganho da logística {fmtPct(gl.ganho, 1)}, alavancagem {fmtNum(gl.alavancagem, 2)}× contra sortear; boosting {fmtPct(gb.ganho, 1)}, {fmtNum(gb.alavancagem, 2)}×. Sortear {fmtPct(k / 10)} da carteira alcançaria cerca de {fmtPct(k / 10)} dos defaults.</div>
          <div className="vz-ks-grade">
            <div className="vz-grafico">
              <p className="vz-grafico-t">Frequência observada em cada decil da logística <span className="hint">barra: observado · traço: intervalo de Wilson a 95% · destacados: os decis examinados</span></p>
              <div className="vz-res-barras">
                {dl.map((d) => <div key={d.j} className={`vz-res-barra ${d.j <= k ? "vz-res-barra--on" : "vz-res-barra--futuro"}`}><span className="vz-res-barra-rot">D{d.j} · {d.n}</span><span className="vz-res-barra-trilho vz-ind-trilho"><span className="vz-res-barra-fill" style={{ width: `${(d.obs / 0.45) * 100}%` }} /><span className="vz-dec-ic" style={{ left: `${(d.lo / 0.45) * 100}%`, width: `${((d.hi - d.lo) / 0.45) * 100}%` }} /></span><span className="vz-res-barra-val">{fmtPct(d.obs, 1)}</span></div>)}
              </div>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Decis examinados, dos piores para os melhores</span><span className="vz-slider-valor">{k} de 10</span></span><input type="range" min={1} max={10} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} /></label>
            </div>
            <div className="vz-ks-painel">
              <div className="vz-tiles">
                <div className="vz-tile"><p className="eyebrow">Ganho da logística</p><p className="vz-num">{fmtPct(gl.ganho, 1)}</p><p className="hint">{gl.defaults} de {gl.total} defaults em {gl.examinados} propostas</p></div>
                <div className="vz-tile"><p className="eyebrow">Alavancagem</p><p className="vz-num">{fmtNum(gl.alavancagem, 2)}×</p><p className="hint">contra sortear a mesma fração</p></div>
                <div className="vz-tile"><p className="eyebrow">Ganho do boosting</p><p className="vz-num">{fmtPct(gb.ganho, 1)}</p><p className="hint">alavancagem {fmtNum(gb.alavancagem, 2)}×</p></div>
              </div>
              <div className="vz-tile"><p className="eyebrow">Frequência nos {k} {k === 1 ? "decil" : "decis"} examinados</p><p className="vz-num">{fmtPct(gl.defaults / gl.examinados, 2)}</p><p className="hint">{(() => { const w = wilsonAgregado(gl.defaults, gl.examinados); return `intervalo de Wilson de ${fmtPct(w.lo, 2)} a ${fmtPct(w.hi, 2)}`; })()}</p></div>
              <p className="hint">ganho(x) = defaults nos x% piores ÷ defaults totais; alavancagem(x) = ganho(x) ÷ x. D1 é o decil de maior risco.</p>
            </div>
          </div>
        </>
      )}
      <p className="vz-fonte">Janela fora do tempo, PD da logística e do boosting calibrado por Platt. KS 0,3621 em PD 9,7%; separação 0,3426 no corte de 12% com 212 recusadas; dois decis da logística alcançam 42,0% dos defaults (2,10×) e do boosting 37,0%, os números das páginas.</p>
    </figure>
  );
}
function wilsonAgregado(d: number, n: number, z = 1.96) { const p = d / n, den = 1 + (z * z) / n, centro = (p + (z * z) / (2 * n)) / den, meia = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den; return { lo: Math.max(0, centro - meia), hi: Math.min(1, centro + meia) }; }
