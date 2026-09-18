"use client";
import { useEffect, useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { atrasoNaFronteira, descida, escore, logit, sigmoide, type Proposta } from "@/lib/visuais/logistica";

/**
 * A fronteira nasce (capítulo 4). Descida de gradiente sobre as 16 propostas: a cada bloco de iterações os três
 * coeficientes se movem juntos, a perda cai e a reta PD = corte gira no plano das variáveis até parar no lugar.
 * Mudar o corte desloca a reta paralelamente; mudar um coeficiente a gira.
 */
const BASE = did.base as Proposta[];
const MARCAS = [0, 1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000];
const CURVA = Array.from(new Set([...MARCAS, ...Array.from({ length: 60 }, (_, k) => Math.round(Math.pow(10, k / 13.7)))].filter((v) => v <= 20000))).sort((a, b) => a - b);
const PW = 420, PH = 360, PML = 50, PMR = 14, PMT = 14, PMB = 42;
const su = (u: number) => PML + (u / 100) * (PW - PML - PMR); const sa = (a: number) => PMT + (1 - a / 40) * (PH - PMT - PMB);

export function Fronteira() {
  const traj = useMemo(() => descida(BASE, CURVA), []);
  const porIt = useMemo(() => new Map(traj.map((t) => [t.it, t])), [traj]);
  const [idx, setIdx] = useState(MARCAS.length - 1);
  const [corte, setCorte] = useState(0.5);
  const [tocando, setTocando] = useState(false);
  const it = MARCAS[idx]; const atual = porIt.get(it)!; const beta = atual.beta; const fim = porIt.get(20000)!;
  const pds = BASE.map((b) => sigmoide(escore(beta, b.util, b.atraso).z));
  const rec = BASE.filter((_, i) => pds[i] >= corte); const evitados = rec.filter((b) => b.y === 1).length;

  useEffect(() => {
    if (!tocando) return;
    if (idx >= MARCAS.length - 1) { const t = setTimeout(() => setTocando(false), 0); return () => clearTimeout(t); }
    const t = setTimeout(() => setIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [tocando, idx]);

  // fronteira PD = corte: atraso em função da utilização; região recusada acima da reta quando β2 > 0
  const semReta = Math.abs(beta[2]) < 1e-9 && Math.abs(beta[1]) < 1e-9;
  const vertical = !semReta && Math.abs(beta[2]) < 1e-9;
  const y0 = vertical ? 0 : atrasoNaFronteira(beta, corte, -200), y1 = vertical ? 0 : atrasoNaFronteira(beta, corte, 300);
  const uVert = vertical ? ((logit(corte) - beta[0]) * 10) / beta[1] : 0;
  const lado = vertical ? (beta[1] > 0 ? 1 : -1) : beta[2] > 0 ? 1 : -1; // +1: recusa acima/à direita
  const poligono = semReta ? "" : vertical
    ? `${su(uVert)},${sa(-100)} ${su(uVert)},${sa(200)} ${su(lado > 0 ? 400 : -400)},${sa(200)} ${su(lado > 0 ? 400 : -400)},${sa(-100)}`
    : `${su(-200)},${sa(y0)} ${su(300)},${sa(y1)} ${su(300)},${sa(lado > 0 ? 2000 : -2000)} ${su(-200)},${sa(lado > 0 ? 2000 : -2000)}`;

  return (
    <figure className="vz" data-vz="fronteira">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A fronteira nasce · descida de gradiente com passo 0,1 · 16 propostas didáticas</p>
          <p className="vz-tit">Deixe o gradiente descer. A reta que separa o plano vai girando até parar no lugar.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => { if (idx >= MARCAS.length - 1) setIdx(0); setTocando((v) => !v); }} aria-pressed={tocando}>{tocando ? "Pausar" : idx >= MARCAS.length - 1 ? "Ver a descida de novo" : "Deixar o gradiente descer"}</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setTocando(false); setIdx(0); }}>Zerar os coeficientes</button>
        </div>
      </header>
      <div className="vz-front-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Plano das variáveis <span className="hint">{semReta ? "todos os coeficientes em zero: PD de 50% para todas, nenhuma fronteira" : `região sombreada: PD estimada acima de ${fmtPct(corte)}, recusada`}</span></p>
          <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Dezesseis propostas no plano utilização por atraso; ${rec.length} recusadas com corte de ${fmtPct(corte)} na iteração ${it}`}>
            <defs><clipPath id="vz-front-clip"><rect x={PML} y={PMT} width={PW - PML - PMR} height={PH - PMT - PMB} /></clipPath></defs>
            {[0, 20, 40, 60, 80, 100].map((u) => <g key={u}><line x1={su(u)} x2={su(u)} y1={PMT} y2={PH - PMB} className="vz-grade" /><text x={su(u)} y={PH - PMB + 16} textAnchor="middle" className="vz-tick">{u}%</text></g>)}
            {[0, 10, 20, 30, 40].map((a) => <g key={a}><line x1={PML} x2={PW - PMR} y1={sa(a)} y2={sa(a)} className="vz-grade" /><text x={PML - 6} y={sa(a) + 4} textAnchor="end" className="vz-tick">{a}</text></g>)}
            <text x={su(50)} y={PH - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            <text transform={`translate(12 ${sa(20)}) rotate(-90)`} textAnchor="middle" className="vz-rotulo">maior atraso em 6 meses, dias</text>
            <g clipPath="url(#vz-front-clip)">
              {!semReta && <polygon points={poligono} className="vz-front-recusa" />}
              {!semReta && (vertical ? <line x1={su(uVert)} x2={su(uVert)} y1={sa(0)} y2={sa(40)} className="vz-front-reta" /> : <line x1={su(-200)} y1={sa(y0)} x2={su(300)} y2={sa(y1)} className="vz-front-reta" />)}
            </g>
            {BASE.map((b, i) => <g key={b.id} className={`vz-front-ponto ${b.y ? "vz-front-ponto--default" : "vz-front-ponto--pagou"} ${pds[i] >= corte ? "vz-front-ponto--recusada" : ""}`} style={{ transform: `translate(${su(b.util)}px, ${sa(b.atraso)}px)` }}><circle r={9} /><text y={4} textAnchor="middle" className="vz-front-id">{b.id}</text></g>)}
            {!semReta && !vertical && <text x={su(96)} y={sa(Math.max(2, Math.min(38, atrasoNaFronteira(beta, corte, 96)))) - 8} textAnchor="end" className="vz-ks-t">PD = {fmtPct(corte)}</text>}
          </svg>
          <div className="vz-legenda"><span><i className="vz-sw vz-sw--default" /> deu default</span><span><i className="vz-sw vz-sw--pagou" /> pagou</span><span><i className="vz-sw vz-sw--recusada" /> recusada pelo corte</span></div>
        </div>
        <div className="vz-front-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Iterações executadas</b> <span className="vz-slider-valor">{it.toLocaleString("pt-BR")}</span></span>
            <input type="range" min={0} max={MARCAS.length - 1} step={1} value={idx} onChange={(ev) => { setTocando(false); setIdx(Number(ev.target.value)); }} aria-valuetext={`${it} iterações`} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Corte de PD para recusar</b> <span className="vz-slider-valor">{fmtPct(corte)}</span></span>
            <input type="range" min={0.1} max={0.9} step={0.05} value={corte} onChange={(ev) => setCorte(Number(ev.target.value))} aria-valuetext={fmtPct(corte)} /></label>
          <div className="vz-tiles" aria-live="polite">
            <div className="vz-tile"><p className="eyebrow">Perda agora</p><p className="vz-num">{fmtNum(atual.perda, 5)}</p><p className="hint">mínimo atingível {fmtNum(fim.perda, 6)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Recusadas</p><p className="vz-num">{rec.length} <span className="hint">de 16</span></p><p className="hint">{evitados} defaults evitados · {rec.length - evitados} boas recusadas · {8 - evitados} defaults aprovados</p></div>
          </div>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Coeficiente</th><th>agora</th><th>convergência</th><th>falta</th></tr></thead>
            <tbody>{(["β₀ intercepto", "β₁ utilização", "β₂ atraso"] as const).map((n, k) => <tr key={n}><th scope="row">{n}</th><td>{fmtNum(beta[k], 4)}</td><td>{fmtNum(fim.beta[k], 4)}</td><td>{fmtNum(fim.beta[k] - beta[k], 4)}</td></tr>)}</tbody></table></div>
          <Trajetorias traj={traj} it={it} />
        </div>
      </div>
      <figcaption className="vz-fonte">A fronteira é reta porque o escore é uma soma. Mudar o corte desloca a reta paralelamente; cada iteração muda os coeficientes e a gira. Descida a partir de zero com passo 0,1: em 20.000 iterações chega a β₀ {fmtNum(fim.beta[0], 4)}, β₁ {fmtNum(fim.beta[1], 4)} e β₂ {fmtNum(fim.beta[2], 4)}, os valores usados nas páginas 8 a 14, com perda {fmtNum(fim.perda, 6)}. Com corte de 50%, 8 recusadas, 6 defaults evitados e 2 boas recusadas. Recalculado aqui.</figcaption>
    </figure>
  );
}

function Trajetorias({ traj, it }: { traj: { it: number; beta: [number, number, number]; perda: number }[]; it: number }) {
  const W = 300, H = 210, ML = 44, MR = 10, MT = 10, MB = 30;
  const lx = (i: number) => ML + (i === 0 ? 0 : Math.log10(i) / Math.log10(20000)) * (W - ML - MR);
  const yP = (v: number) => MT + (1 - (v - 0.42) / (0.72 - 0.42)) * ((H - MT - MB) / 2 - 8);
  const yB = (v: number) => (H - MT - MB) / 2 + MT + 8 + (1 - (v + 6) / 8) * ((H - MT - MB) / 2 - 8);
  const cam = (f: (t: { it: number; beta: [number, number, number]; perda: number }) => number, y: (v: number) => number) => traj.map((t, i) => `${i ? "L" : "M"}${lx(t.it).toFixed(1)} ${y(f(t)).toFixed(1)}`).join("");
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">Perda e coeficientes <span className="hint">iterações em escala logarítmica</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Perda de treino caindo e os três coeficientes convergindo ao longo das iterações">
        {[1, 10, 100, 1000, 10000].map((v) => <g key={v}><line x1={lx(v)} x2={lx(v)} y1={MT} y2={H - MB} className="vz-grade" /><text x={lx(v)} y={H - MB + 14} textAnchor="middle" className="vz-tick">{v.toLocaleString("pt-BR")}</text></g>)}
        <text x={ML - 4} y={yP(0.69)} textAnchor="end" className="vz-tick">0,69</text><text x={ML - 4} y={yP(0.43) + 4} textAnchor="end" className="vz-tick">0,43</text>
        <text x={ML - 4} y={yB(0) + 4} textAnchor="end" className="vz-tick">0</text><text x={ML - 4} y={yB(-5.67) + 4} textAnchor="end" className="vz-tick">−5,7</text>
        <line x1={ML} x2={W - MR} y1={yB(0)} y2={yB(0)} className="vz-grade" />
        <path d={cam((t) => t.perda, yP)} className="vz-curva vz-curva--perda" />
        <path d={cam((t) => t.beta[0], yB)} className="vz-curva vz-curva--b0" />
        <path d={cam((t) => t.beta[1], yB)} className="vz-curva vz-curva--b1" />
        <path d={cam((t) => t.beta[2], yB)} className="vz-curva vz-curva--b2" />
        <line x1={lx(it)} x2={lx(it)} y1={MT} y2={H - MB} className="vz-corte-linha" />
        <text x={lx(1) + 4} y={yP(0.72) + 10} className="vz-tick vz-tick--forte">log loss</text>
        <text x={W - MR} y={yB(1.4) - 4} textAnchor="end" className="vz-tick vz-tick--b2">β₂ atraso</text>
        <text x={W - MR} y={yB(0.745) + 12} textAnchor="end" className="vz-tick vz-tick--b1">β₁ utilização</text>
        <text x={W - MR} y={yB(-5.67) - 4} textAnchor="end" className="vz-tick vz-tick--b0">β₀ intercepto</text>
      </svg>
    </div>
  );
}
