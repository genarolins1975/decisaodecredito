"use client";
import { useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtPct } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";

/**
 * Probabilidade condicional (capítulo 2, c2p7). Condicionar é restringir a contagem a um grupo definido por uma
 * característica observada antes da decisão. Quatro condições sobre as 16 propostas, dentro e fora do grupo,
 * com o plano e a fronteira. Nada aqui vem de fórmula: é contagem.
 */
const BASE = did.base as Proposta[];
type Cond = { k: string; nome: string; f: (p: Proposta) => boolean; tipo: "vertical" | "horizontal"; v: number; rotulo: string };
export const CONDICOES: Cond[] = [
  { k: "u57", nome: "utilização acima de 57,5%", f: (p) => p.util > 57.5, tipo: "vertical", v: 57.5, rotulo: "57,5%" },
  { k: "u40", nome: "utilização acima de 40%", f: (p) => p.util > 40, tipo: "vertical", v: 40, rotulo: "40%" },
  { k: "a20", nome: "atraso de 20 dias ou mais", f: (p) => p.atraso >= 20, tipo: "horizontal", v: 17.5, rotulo: "20 dias" },
  { k: "a05", nome: "atraso acima de 5 dias", f: (p) => p.atraso > 5, tipo: "horizontal", v: 5, rotulo: "5 dias" },
];
const PW = 640, PH = 360, PML = 46, PMR = 14, PMT = 16, PMB = 40;
const su = (u: number) => PML + (u / 100) * (PW - PML - PMR), sa = (a: number) => PMT + (1 - a / 40) * (PH - PMT - PMB);

export function Condicional() {
  const [k, setK] = useState("u57");
  const c = CONDICOES.find((x) => x.k === k)!;
  const dentro = BASE.filter(c.f), fora = BASE.filter((p) => !c.f(p));
  const kd = dentro.filter((p) => p.y).length, kf = fora.filter((p) => p.y).length; const total = BASE.filter((p) => p.y).length / BASE.length;
  const regiao = c.tipo === "vertical" ? { x: su(c.v), y: sa(40), w: su(100) - su(c.v), h: sa(0) - sa(40) } : { x: su(0), y: sa(40), w: su(100) - su(0), h: sa(c.v) - sa(40) };
  return (
    <figure className="vz" data-vz="condicional">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Probabilidade condicional · estimar dentro de um grupo · 16 propostas didáticas</p>
          <p className="vz-tit">Condicionar é restringir a contagem a um grupo definido por uma característica observada antes da decisão.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Condição sobre a proposta">{CONDICOES.map((x) => <button key={x.k} type="button" className={`btn btn-sm ${k === x.k ? "" : "btn-secondary"}`} onClick={() => setK(x.k)}>{x.nome}</button>)}</div>
      </header>
      <div className="vz-estado"><b>Dado que {c.nome}: {fmtPct(kd / dentro.length, 1)}, {kd} default{kd === 1 ? "" : "s"} em {dentro.length} propostas.</b> Fora do grupo, {fmtPct(kf / fora.length, 1)}, {kf} em {fora.length}. Sem condição alguma a estimativa seria {fmtPct(total, 1)} para todas as dezesseis.</div>
      <div className="vz-cond-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">As 16 propostas e a condição escolhida <span className="hint">a área sombreada é o grupo; tudo à direita da barra restringe quem entra na contagem</span></p>
          <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Grupo com ${dentro.length} propostas e ${kd} defaults`}>
            <rect x={regiao.x} y={regiao.y} width={regiao.w} height={regiao.h} className="vz-cond-regiao" />
            {[0, 25, 50, 75, 100].map((u) => <text key={u} x={su(u)} y={PH - PMB + 16} textAnchor="middle" className="vz-tick">{u}%</text>)}
            {[0, 10, 20, 30, 40].map((a) => <text key={a} x={PML - 6} y={sa(a) + 4} textAnchor="end" className="vz-tick">{a} d</text>)}
            <text x={su(50)} y={PH - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            <text x={PML + 4} y={PMT - 4} className="vz-rotulo">maior atraso em 6 meses</text>
            {c.tipo === "vertical" ? <line x1={su(c.v)} x2={su(c.v)} y1={sa(40)} y2={sa(0)} className="vz-arv-cand" /> : <line x1={su(0)} x2={su(100)} y1={sa(c.v)} y2={sa(c.v)} className="vz-arv-cand" />}
            <text x={c.tipo === "vertical" ? su(c.v) + 6 : su(100) - 4} y={c.tipo === "vertical" ? sa(40) + 14 : sa(c.v) - 6} textAnchor={c.tipo === "vertical" ? "start" : "end"} className="vz-ks-t">{c.rotulo}</text>
            {BASE.map((p) => { const d = c.f(p); return <g key={p.id} style={{ transform: `translate(${su(p.util)}px, ${sa(p.atraso)}px)`, opacity: d ? 1 : 0.45 }}><circle r={d ? 10 : 8} className={p.y ? "vz-int-c--default" : "vz-int-c--pagou"} /><text y={3.5} textAnchor="middle" className="vz-cc-id">{p.id}</text></g>; })}
          </svg>
        </div>
        <div className="vz-cond-lado">
          <div className="vz-tile vz-cc-tile--dir"><p className="eyebrow">Dentro do grupo: {c.nome}</p><p className="vz-num vz-num--default">{fmtPct(kd / dentro.length, 1)}</p><p className="hint">{kd} default{kd === 1 ? "" : "s"} em {dentro.length} propostas: {dentro.map((p) => `#${p.id}`).join(", ")}</p></div>
          <div className="vz-tile vz-cc-tile--esq"><p className="eyebrow">Fora do grupo</p><p className="vz-num vz-num--ok">{fmtPct(kf / fora.length, 1)}</p><p className="hint">{kf} default{kf === 1 ? "" : "s"} em {fora.length} propostas: {fora.map((p) => `#${p.id}`).join(", ")}</p></div>
          <div className="vz-formula">P(default = 1 | condição) = defaults no grupo ÷ propostas no grupo</div>
          <p className="hint">A barra vertical significa dado que. Tudo à direita dela restringe quem entra na contagem. Sem condição alguma a estimativa seria {fmtPct(total, 1)} para todas as dezesseis.</p>
        </div>
      </div>
      <p className="vz-fonte">Utilização acima de 57,5%: 7 defaults em 8 (87,5%) contra 1 em 8 fora (12,5%). Condicionar por uma pergunta é a árvore do capítulo 5; condicionar por uma fórmula contínua é a regressão do capítulo 4.</p>
    </figure>
  );
}
