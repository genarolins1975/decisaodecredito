"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { BETA_AULA, escore, sigmoide, type Proposta } from "@/lib/visuais/logistica";

/**
 * Três escalas, um ponto (capítulo 4). As duas características movem o escore em log odds; o mesmo risco aparece
 * ao mesmo tempo em probabilidade, odds e log odds, e como ponto na curva logística. Coeficientes da aula.
 */
const BASE = did.base as Proposta[];
const PRESETS = [{ id: 3, nome: "conservadora" }, { id: 11, nome: "pressionada" }, { id: 16, nome: "crítica" }].map((p) => ({ ...p, ...BASE.find((b) => b.id === p.id)! }));
const W = 640, ML = 20, MR = 20; const span = W - ML - MR;
const xp = (p: number) => ML + p * span;
const xo = (o: number) => ML + ((Math.log10(o) + 2) / 4) * span;
const xz = (z: number) => ML + ((z + 6) / 12) * span;

/** "1 dezena", "1,5 dezena", "0 dezenas", "5,5 dezenas": singular entre 1 e 2, como em português se diz 1,5 milhão. */
const dezenas = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${v >= 1 && v < 2 ? "dezena" : "dezenas"}`;

export function TresEscalas() {
  const [util, setUtil] = useState(55);
  const [atraso, setAtraso] = useState(10);
  const e = useMemo(() => escore(BETA_AULA, util, atraso), [util, atraso]);
  const p = sigmoide(e.z); const odds = p / (1 - p);
  const zc = Math.max(-6, Math.min(6, e.z)); const oc = Math.max(0.01, Math.min(100, odds));
  const pMais1 = sigmoide(e.z + 1);
  return (
    <figure className="vz" data-vz="tres-escalas">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Três escalas, um ponto · coeficientes da aula · 16 propostas didáticas</p>
          <p className="vz-tit">Mova uma característica. O mesmo risco muda de língua nas três réguas ao mesmo tempo.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Propostas de exemplo">
          {PRESETS.map((q) => <button key={q.id} type="button" className={`btn btn-sm ${util === q.util && atraso === q.atraso ? "" : "btn-secondary"}`} onClick={() => { setUtil(q.util); setAtraso(q.atraso); }}>#{q.id}, {q.nome}</button>)}
        </div>
      </header>
      <div className="vz-escalas-grade">
        <div className="vz-escalas-painel">
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Utilização do limite</b> <span className="vz-slider-valor">{util}% · {dezenas(util / 10)} de pontos</span></span>
            <input type="range" min={0} max={100} step={1} value={util} onChange={(ev) => setUtil(Number(ev.target.value))} aria-valuetext={`${util}%`} /></label>
          <label className="vz-slider"><span className="vz-slider-rotulo"><b>Maior atraso em 6 meses</b> <span className="vz-slider-valor">{atraso} dias · {dezenas(atraso / 10)} de dias</span></span>
            <input type="range" min={0} max={40} step={1} value={atraso} onChange={(ev) => setAtraso(Number(ev.target.value))} aria-valuetext={`${atraso} dias`} /></label>
          <div className="vz-contrib">
            <p className="vz-grafico-t">Contribuições para o escore, em log odds <span className="hint">o escore é uma soma ponderada, e nada além disso</span></p>
            <svg viewBox="-70 0 720 132" role="img" aria-label={`Intercepto ${fmtNum(e.intercepto, 3)}, utilização ${fmtNum(e.util, 3)}, atraso ${fmtNum(e.atraso, 3)}, escore ${fmtNum(e.z, 3)}`}>
              {[{ n: "intercepto", v: e.intercepto, c: "vz-contrib--fixo" }, { n: "utilização", v: e.util, c: "vz-contrib--util" }, { n: "atraso", v: e.atraso, c: "vz-contrib--atraso" }, { n: "escore z", v: e.z, c: "vz-contrib--z" }].map((b, i) => {
                const y = 10 + i * 30; const x0 = xz(0); const x1 = xz(Math.max(-6, Math.min(6, b.v)));
                return <g key={b.n}><text x={ML - 14} y={y + 14} textAnchor="end" className="vz-tick">{b.n}</text><rect x={Math.min(x0, x1)} y={y} width={Math.abs(x1 - x0)} height={20} rx={3} className={`vz-contrib-barra ${b.c}`} /><text x={b.v < 0 ? x0 + 6 : x1 + 6} y={y + 14} textAnchor="start" className="vz-tick vz-tick--forte">{b.v > 0 ? "+" : ""}{fmtNum(b.v, 3)}</text></g>;
              })}
              <line x1={xz(0)} x2={xz(0)} y1={4} y2={128} className="vz-zero" />
            </svg>
          </div>
        </div>
        <div className="vz-escalas-reguas">
          <svg viewBox={`0 0 ${W} 200`} role="img" aria-label={`Probabilidade ${fmtPct(p, 2)}, odds ${fmtNum(odds, 3)}, log odds ${fmtNum(e.z, 3)}`}>
            <polyline points={`${xp(p)},40 ${xo(oc)},106 ${xz(zc)},172`} className="vz-liga" />
            <Regua y={40} nome="probabilidade" ticks={[0, 0.25, 0.5, 0.75, 1].map((v) => ({ x: xp(v), t: fmtPct(v) }))} x={xp(p)} rotulo={fmtPct(p, 2)} nota={`em 100 propostas semelhantes, cerca de ${Math.round(p * 100)} defaults`} />
            <Regua y={106} nome="odds" ticks={[0.01, 0.1, 1, 10, 100].map((v) => ({ x: xo(v), t: v.toLocaleString("pt-BR") }))} x={xo(oc)} rotulo={fmtNum(odds, 3)} nota={odds < 1 ? `${fmtNum(1 / odds, 1)} adimplentes para cada default` : `${fmtNum(odds, 1)} defaults para cada adimplente`} />
            <Regua y={172} nome="log odds" ticks={[-6, -3, 0, 3, 6].map((v) => ({ x: xz(v), t: String(v) }))} x={xz(zc)} rotulo={fmtNum(e.z, 3)} nota="a escala em que somar faz sentido" />
          </svg>
          <Sigmoide z={e.z} p={p} pMais1={pMais1} />
        </div>
      </div>
      <figcaption className="vz-fonte">Escore z = {fmtNum(BETA_AULA[0], 4)} + {fmtNum(BETA_AULA[1], 4)} × utilização em dezenas de pontos + {fmtNum(BETA_AULA[2], 4)} × atraso em dezenas de dias; PD = 1 ÷ (1 + e^(−z)). As quatro leituras preservam a mesma ordem: só muda a régua. A inclinação da curva logística é p × (1 − p), máxima em z = 0 (0,25), por isso somar 1 a z desloca a PD de forma diferente conforme o ponto de partida.</figcaption>
    </figure>
  );
}

function Regua({ y, nome, ticks, x, rotulo, nota }: { y: number; nome: string; ticks: { x: number; t: string }[]; x: number; rotulo: string; nota: string }) {
  const anc = x > W - MR - 150 ? "end" : x < ML + 110 ? "start" : "middle"; const dx = anc === "end" ? -10 : anc === "start" ? 10 : 0;
  return (
    <g>
      <text x={ML} y={y - 17} className="vz-rotulo">{nome}</text>
      <text x={W - MR} y={y - 17} textAnchor="end" className="vz-tick vz-tick--nota">{nota}</text>
      <line x1={ML} x2={W - MR} y1={y} y2={y} className="vz-regua" />
      {ticks.map((t) => <g key={t.t}><line x1={t.x} x2={t.x} y1={y - 4} y2={y + 4} className="vz-regua" /><text x={t.x} y={y + 18} textAnchor="middle" className="vz-tick">{t.t}</text></g>)}
      <g className="vz-regua-ponto" style={{ transform: `translate(${x}px, ${y}px)` }}><circle r={7} /><text x={dx} y={-6 + (anc === "middle" ? -3 : 0)} textAnchor={anc} className="vz-ponto-t">{rotulo}</text></g>
    </g>
  );
}

function Sigmoide({ z, p, pMais1 }: { z: number; p: number; pMais1: number }) {
  const H = 230, MT = 16, MB = 36, MLS = 56, MRS = 16;
  const sx = (v: number) => MLS + ((v + 8) / 16) * (W - MLS - MRS); const sy = (v: number) => MT + (1 - v) * (H - MT - MB);
  const d = Array.from({ length: 161 }, (_, i) => -8 + i * 0.1).map((v, i) => `${i ? "L" : "M"}${sx(v).toFixed(1)} ${sy(sigmoide(v)).toFixed(1)}`).join("");
  const zc = Math.max(-8, Math.min(8, z)); const incl = p * (1 - p);
  const t0 = Math.max(-8, zc - 1.5), t1 = Math.min(8, zc + 1.5);
  return (
    <div className="vz-grafico">
      <p className="vz-grafico-t">Do escore para a probabilidade <span className="hint">somar 1 a z leva a PD de {fmtPct(p, 1)} para {fmtPct(pMais1, 1)} · inclinação aqui {fmtNum(incl, 4)}</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva logística; z ${fmtNum(z, 2)} dá PD ${fmtPct(p, 1)}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={sx(-8)} x2={sx(8)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={MLS - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text></g>)}
        {[-8, -4, 0, 4, 8].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{v}</text>)}
        <text x={sx(0)} y={H - 6} textAnchor="middle" className="vz-rotulo">escore z, em log odds</text>
        <path d={d} className="vz-curva" />
        <line x1={sx(t0)} y1={sy(p + incl * (t0 - zc))} x2={sx(t1)} y2={sy(p + incl * (t1 - zc))} className="vz-tangente" />
        <line x1={sx(zc)} x2={sx(zc)} y1={sy(0)} y2={sy(p)} className="vz-corte-linha" />
        <line x1={sx(-8)} x2={sx(zc)} y1={sy(p)} y2={sy(p)} className="vz-corte-linha" />
        <g className="vz-regua-ponto" style={{ transform: `translate(${sx(zc)}px, ${sy(p)}px)` }}><circle r={7} /><text x={12} y={-8} className="vz-ponto-t">z = {fmtNum(z, 2)} → PD {fmtPct(p, 1)}</text></g>
      </svg>
    </div>
  );
}
