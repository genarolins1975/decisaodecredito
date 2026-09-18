"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { aucPorPares, curvaRoc, fmtNum, fmtPct, ks as ksDe, ordemDaFila, ordemSorteada, type Ponto } from "@/lib/visuais/metricas";

/**
 * A fila de risco (capítulo 7). As 737 propostas fora do tempo, ordenadas da maior PD estimada para a menor.
 * Mover o corte percorre a fila; a curva ROC e as acumuladas do KS são consequências dessa fila.
 * "Sortear sem modelo" embaralha a fila e mostra a ROC desabar sobre a diagonal.
 */
const Y = oot.y as number[]; const PD = oot.pd as number[]; const N = Y.length;
const N1 = Y.reduce((s, v) => s + v, 0); const N0 = N - N1;
const COLS = 53, CELL = 20, R = 7; const ROWS = Math.ceil(N / COLS);
const K_INICIAL = (() => { const o = ordemDaFila(PD); let k = 0; while (k < N && PD[o[k]] >= 0.12) k++; return k; })();

export function FilaDeRisco() {
  const ordemModelo = useMemo(() => ordemDaFila(PD), []);
  const [modo, setModo] = useState<"modelo" | "sorteio">("modelo");
  const [semente, setSemente] = useState(1);
  const [k, setK] = useState(K_INICIAL);
  const [varrendo, setVarrendo] = useState(false);
  const ordem = useMemo(() => (modo === "modelo" ? ordemModelo : ordemSorteada(N, semente)), [modo, semente, ordemModelo]);
  const posicao = useMemo(() => { const p = new Array<number>(N); ordem.forEach((idx, pos) => { p[idx] = pos; }); return p; }, [ordem]);
  const roc = useMemo(() => curvaRoc(Y, PD, ordem), [ordem]);
  const auc = useMemo(() => { if (modo === "modelo") return aucPorPares(Y, PD); const pdRank = new Array<number>(N); ordem.forEach((idx, pos) => { pdRank[idx] = 1 - pos / N; }); return aucPorPares(Y, pdRank); }, [modo, ordem]);
  const ksMax = useMemo(() => ksDe(roc), [roc]);
  const rocView = useTween(roc);
  const pt = roc[k];
  const defaultsRec = Math.round(pt.tpr * N1), goodsRec = Math.round(pt.fpr * N0);
  const pdCorte = k > 0 && modo === "modelo" ? PD[ordem[k - 1]] : null;

  // varredura: percorre a fila do início ao fim, desenhando a curva
  useEffect(() => {
    if (!varrendo) return;
    let raf = 0; const t0 = performance.now(); const dur = 7000; const k0 = k >= N ? 0 : k;
    const passo = (t: number) => { const f = Math.min(1, (t - t0) / dur); const kk = Math.round(k0 + (N - k0) * f); setK(kk); if (f < 1) raf = requestAnimationFrame(passo); else setVarrendo(false); };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varrendo]);

  const rotuloCorte = modo === "modelo" ? (pdCorte == null ? "nenhuma proposta recusada" : `corte em PD de ${fmtPct(pdCorte, 1)}`) : `sem modelo: recusar ${fmtPct(k / N)} da carteira ao acaso`;

  return (
    <figure className="vz" data-vz="fila-de-risco">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A fila de risco · {N} propostas fora do tempo · {N1} defaults</p>
          <p className="vz-tit">Mova o corte. A curva já estava na fila.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => setVarrendo((v) => !v)} aria-pressed={varrendo}>{varrendo ? "Parar" : "Percorrer todos os cortes"}</button>
          {modo === "modelo"
            ? <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setVarrendo(false); setModo("sorteio"); setSemente((s) => s + 1); }}>Sortear sem modelo</button>
            : <><button type="button" className="btn btn-sm btn-secondary" onClick={() => setSemente((s) => s + 1)}>Sortear de novo</button><button type="button" className="btn btn-sm btn-ghost" onClick={() => { setVarrendo(false); setModo("modelo"); }}>Voltar à fila do modelo</button></>}
        </div>
      </header>

      <div className="vz-fila-grade">
        <div className="vz-fita-bloco">
          <svg className="vz-fita" viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} role="img" aria-label={`Fila de ${N} propostas ordenadas ${modo === "modelo" ? "pela PD estimada" : "ao acaso"}; as ${k} primeiras estão recusadas`}>
            {Y.map((yi, i) => { const pos = posicao[i]; const x = (pos % COLS) * CELL + CELL / 2; const yy = Math.floor(pos / COLS) * CELL + CELL / 2; const recusada = pos < k; return (
              <circle key={i} r={R} cx={0} cy={0} className={`vz-dot ${yi ? "vz-dot--default" : "vz-dot--pagou"} ${recusada ? "vz-dot--recusada" : ""}`} style={{ transform: `translate(${x}px, ${yy}px)`, transitionDelay: `${pos * 0.5}ms` }} />
            ); })}
            {k > 0 && k < N && (() => { const x = (k % COLS) * CELL; const yy = Math.floor(k / COLS) * CELL; return <g className="vz-corte-marca" style={{ transform: `translate(${x}px, ${yy}px)` }}><rect x={-1.5} y={1} width={3} height={CELL - 2} rx={1.5} /></g>; })()}
          </svg>
          <div className="vz-legenda"><span><i className="vz-sw vz-sw--default" /> default observado</span><span><i className="vz-sw vz-sw--pagou" /> pagou</span><span><i className="vz-sw vz-sw--recusada" /> recusada pelo corte (à esquerda da marca dourada)</span><span className="vz-legenda-nota">ordem de leitura: da maior PD para a menor</span></div>
          <label className="vz-slider">
            <span className="vz-slider-rotulo"><b>Corte</b> <span className="vz-slider-valor">{rotuloCorte}</span></span>
            <input type="range" min={0} max={N} step={1} value={k} onChange={(e) => { setVarrendo(false); setK(Number(e.target.value)); }} aria-valuetext={`${k} propostas recusadas, ${rotuloCorte}`} />
          </label>
          <div className="vz-tiles" aria-live="polite">
            <div className="vz-tile"><p className="eyebrow">Defaults recusados</p><p className="vz-num vz-num--default">{fmtPct(pt.tpr)}</p><p className="hint">{defaultsRec} de {N1}</p></div>
            <div className="vz-tile"><p className="eyebrow">Adimplentes recusados junto</p><p className="vz-num">{fmtPct(pt.fpr)}</p><p className="hint">{goodsRec} de {N0}</p></div>
            <div className="vz-tile"><p className="eyebrow">Carteira recusada</p><p className="vz-num">{fmtPct(k / N)}</p><p className="hint">{k} de {N}</p></div>
            <div className="vz-tile"><p className="eyebrow">Separação neste corte</p><p className="vz-num">{fmtNum(Math.max(0, pt.tpr - pt.fpr))}</p><p className="hint">KS máximo {fmtNum(ksMax.ks)}{modo === "modelo" && Number.isFinite(ksMax.pd) ? ` em PD de ${fmtPct(ksMax.pd, 2)}` : ""}</p></div>
          </div>
        </div>

        <div className="vz-graficos">
          <Roc pontos={rocView} k={k} auc={auc.auc} pares={auc.pares} modo={modo} />
          <Ks pontos={rocView} k={k} ksMax={ksMax} modo={modo} />
        </div>
      </div>
      <figcaption className="vz-fonte">Recalculado aqui a partir das {N} propostas fora do tempo (safras 2023 08 a 2023 12), PD da regressão logística com pesos de evidência. AUC 0,7257 e KS 0,3621 conferem com o gerador. Sortear sem modelo embaralha a mesma fila: a curva cai sobre a diagonal e a AUC vai para perto de 0,5.</figcaption>
    </figure>
  );
}

/** Interpola a curva quando a fila muda (modelo ↔ sorteio), para a ROC "desabar" em vez de trocar de repente. */
function useTween(alvo: Ponto[]): Ponto[] {
  const [view, setView] = useState(alvo);
  const de = useRef(alvo);
  useEffect(() => {
    const reduz = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const origem = de.current;
    if (reduz || origem.length !== alvo.length) { de.current = alvo; setView(alvo); return; }
    let raf = 0; const t0 = performance.now(); const dur = 900;
    const passo = (t: number) => {
      const f = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - f, 3);
      const cur = alvo.map((p, i) => ({ ...p, fpr: origem[i].fpr + (p.fpr - origem[i].fpr) * e, tpr: origem[i].tpr + (p.tpr - origem[i].tpr) * e }));
      setView(cur); de.current = cur;
      if (f < 1) raf = requestAnimationFrame(passo); else de.current = alvo;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);
  return view;
}

const W = 320, H = 300, ML = 44, MR = 12, MT = 14, MB = 40;
const sx = (v: number) => ML + v * (W - ML - MR);
const sy = (v: number) => MT + (1 - v) * (H - MT - MB);

function Eixos({ xl, yl }: { xl: string; yl: string }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <g className="vz-eixos">
      {ticks.map((t) => <g key={t}><line x1={sx(0)} x2={sx(1)} y1={sy(t)} y2={sy(t)} className="vz-grade" /><text x={ML - 6} y={sy(t) + 4} textAnchor="end" className="vz-tick">{fmtPct(t)}</text><text x={sx(t)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(t)}</text></g>)}
      <text x={sx(0.5)} y={H - 6} textAnchor="middle" className="vz-rotulo">{xl}</text>
      <text transform={`translate(12 ${sy(0.5)}) rotate(-90)`} textAnchor="middle" className="vz-rotulo">{yl}</text>
    </g>
  );
}

function Roc({ pontos, k, auc, pares, modo }: { pontos: Ponto[]; k: number; auc: number; pares: number; modo: "modelo" | "sorteio" }) {
  const d = pontos.map((p, i) => `${i ? "L" : "M"}${sx(p.fpr).toFixed(1)} ${sy(p.tpr).toFixed(1)}`).join("");
  const dFeita = pontos.slice(0, k + 1).map((p, i) => `${i ? "L" : "M"}${sx(p.fpr).toFixed(1)} ${sy(p.tpr).toFixed(1)}`).join("");
  const p = pontos[k];
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">Curva ROC <span className="hint">{modo === "modelo" ? "logística" : "fila sorteada"} · AUC {fmtNum(auc)} · {pares.toLocaleString("pt-BR")} pares</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva ROC, AUC ${fmtNum(auc)}; no corte atual, ${fmtPct(p.tpr)} dos defaults e ${fmtPct(p.fpr)} dos adimplentes recusados`}>
        <Eixos xl="adimplentes recusados junto" yl="defaults recusados" />
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} className="vz-diagonal" />
        <path d={d} className="vz-curva vz-curva--fraca" />
        <path d={dFeita} className="vz-curva" />
        <circle cx={sx(p.fpr)} cy={sy(p.tpr)} r={5.5} className="vz-ponto" />
        <text x={sx(p.fpr) + 9} y={sy(p.tpr) - 8} className="vz-ponto-t">{k === 0 ? "recusar ninguém" : k >= pontos.length - 1 ? "recusar todos" : "seu corte"}</text>
        <text x={sx(0.62)} y={sy(0.52)} className="vz-tick vz-tick--diag" transform={`rotate(-40 ${sx(0.62)} ${sy(0.52)})`}>sortear sem olhar nada</text>
      </svg>
    </div>
  );
}

function Ks({ pontos, k, ksMax, modo }: { pontos: Ponto[]; k: number; ksMax: { ks: number; k: number; pd: number }; modo: "modelo" | "sorteio" }) {
  const n = pontos.length - 1;
  const dD = pontos.map((p, i) => `${i ? "L" : "M"}${sx(i / n).toFixed(1)} ${sy(p.tpr).toFixed(1)}`).join("");
  const dG = pontos.map((p, i) => `${i ? "L" : "M"}${sx(i / n).toFixed(1)} ${sy(p.fpr).toFixed(1)}`).join("");
  const pm = pontos[ksMax.k]; const p = pontos[k];
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">Acumuladas e KS <span className="hint">{modo === "modelo" ? "população da pior para a melhor PD" : "população na ordem sorteada"}</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Acumuladas de defaults e de adimplentes ao longo da fila; KS máximo ${fmtNum(ksMax.ks)}`}>
        <Eixos xl="carteira recusada, pior PD primeiro" yl="proporção acumulada" />
        <path d={dG} className="vz-curva vz-curva--pagou" />
        <path d={dD} className="vz-curva vz-curva--default" />
        <line x1={sx(ksMax.k / n)} x2={sx(ksMax.k / n)} y1={sy(pm.tpr)} y2={sy(pm.fpr)} className="vz-ks" />
        <text x={sx(ksMax.k / n) + 7} y={(sy(pm.tpr) + sy(pm.fpr)) / 2 + 4} className="vz-ks-t">KS {fmtNum(ksMax.ks)}</text>
        <line x1={sx(k / n)} x2={sx(k / n)} y1={sy(0)} y2={sy(1)} className="vz-corte-linha" />
        <line x1={sx(k / n)} x2={sx(k / n)} y1={sy(p.tpr)} y2={sy(p.fpr)} className="vz-corte-gap" />
        <text x={sx(0.02)} y={sy(0.94)} className="vz-tick vz-tick--default">defaults</text>
        <text x={sx(0.02)} y={sy(0.86)} className="vz-tick vz-tick--pagou">adimplentes</text>
      </svg>
    </div>
  );
}
