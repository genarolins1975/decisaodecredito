"use client";
import did from "@/lib/visuais/did.json";
import type { Proposta } from "@/lib/visuais/logistica";

/**
 * O plano das 16 propostas didáticas (utilização por atraso), comum às páginas redesenhadas do capítulo 5. Os eixos
 * têm folga (utilização de 10% a 100%, atraso de −4 a 44 dias): nenhum ponto encosta na borda nem é cortado pelo eixo,
 * como acontecia nos gráficos herdados. Pagou em azul-claro com número escuro; default em vermelho com número branco.
 */
export const BASE16 = did.base as Proposta[];
export const U0 = 10, U1 = 100, A0 = -4, A1 = 44;
export type Escala = { W: number; H: number; ML: number; MR: number; MT: number; MB: number; su: (u: number) => number; sa: (a: number) => number };

// MR 17: o rótulo "100%", centrado na ponta do eixo, tem cerca de 30 de largura na letra de 10,5; com 14 perdia a borda do %.
export function escalaPlano(W = 560, H = 372, ML = 46, MR = 17, MT = 26, MB = 44): Escala {
  return { W, H, ML, MR, MT, MB, su: (u) => ML + ((u - U0) / (U1 - U0)) * (W - ML - MR), sa: (a) => MT + (1 - (a - A0) / (A1 - A0)) * (H - MT - MB) };
}

export function EixosPlano({ e }: { e: Escala }) {
  return (
    <>
      {[0, 10, 20, 30, 40].map((a) => <g key={a}><line x1={e.ML} x2={e.W - e.MR} y1={e.sa(a)} y2={e.sa(a)} className="vz-grade" /><text x={e.ML - 8} y={e.sa(a) + 4} textAnchor="end" className="vz-tick">{a}</text></g>)}
      {[20, 40, 60, 80, 100].map((u) => <text key={u} x={e.su(u)} y={e.H - e.MB + 18} textAnchor="middle" className="vz-tick">{u}%</text>)}
      <text x={(e.ML + e.W - e.MR) / 2} y={e.H - 8} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
      <text x={e.ML - 34} y={e.MT - 12} className="vz-rotulo">atraso, dias</text>
    </>
  );
}

/** Os 16 pontos; `anel` destaca propostas com o contorno dourado, `apagadas` as deixa em segundo plano. */
export function PontosPlano({ e, anel = [], apagadas = [] }: { e: Escala; anel?: number[]; apagadas?: number[] }) {
  return <>{BASE16.map((p) => (
    <g key={p.id} className={`vz-front-ponto ${p.y ? "vz-front-ponto--default" : "vz-front-ponto--pagou"} ${anel.includes(p.id) ? "vz-front-ponto--recusada" : ""}`} opacity={apagadas.includes(p.id) ? 0.3 : 1} style={{ transform: `translate(${e.su(p.util)}px, ${e.sa(p.atraso)}px)` }}>
      <circle r={11} /><text y={4} textAnchor="middle" className={`vz-front-id ${p.y ? "" : "vz-rd-id--pagou"}`}>{p.id}</text>
    </g>
  ))}</>;
}
