"use client";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { NOME_VAR, folhas, gini, type No } from "@/lib/visuais/arvore";

/**
 * Diagrama de árvore compartilhado pelo capítulo 5: caixas por nó (propostas, defaults, taxa, Gini opcional), ramos
 * com sim e não, caminho aceso e destaque por elemento da anatomia (nó, regra, ramo, folha, profundidade).
 */
export type Anatomia = "no" | "regra" | "ramo" | "folha" | "profundidade" | null;
export type Pos = { x: number; y: number; n: No; filhos: Pos[] };
export const LH = 84;

export function posicoes(no: No, W: number): { raiz: Pos; todos: Pos[]; fs: No[]; prof: number } {
  const fs = folhas(no); const prof = Math.max(...fs.map((f) => f.prof)); let cursor = 0;
  const pos = (n: No): Pos => {
    if (!n.corte || !n.esq || !n.dir) { const x = (cursor + 0.5) * (W / fs.length); cursor++; return { x, y: n.prof * LH + 12, n, filhos: [] }; }
    const e = pos(n.esq), d = pos(n.dir); return { x: (e.x + d.x) / 2, y: n.prof * LH + 12, n, filhos: [e, d] };
  };
  const raiz = pos(no); const todos: Pos[] = []; const junta = (p: Pos) => { todos.push(p); p.filhos.forEach(junta); }; junta(raiz);
  return { raiz, todos, fs, prof };
}

export function ArvoreDiagrama({ no, caminho, mostrarGini = false, anatomia = null, W = 640 }: { no: No; caminho?: No[]; mostrarGini?: boolean; anatomia?: Anatomia; W?: number }) {
  const { todos, fs, prof } = posicoes(no, W); const H = (prof + 1) * LH - 20;
  const aceso = (n: No) => !!caminho?.includes(n);
  const rotulo = (n: No) => n.corte!.v === "util" ? `≤ ${fmtNum(n.corte!.valor, 1)}% ?` : `≤ ${fmtNum(n.corte!.valor, 1)} dias ?`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Árvore com ${fs.length} folhas e profundidade ${prof}`} className={`vz-ad ${anatomia ? `vz-ad--${anatomia}` : ""}`}>
      {anatomia === "profundidade" && Array.from({ length: prof + 1 }, (_, k) => <g key={k}><rect x={0} y={k * LH + 4} width={W} height={LH - 16} rx={6} className="vz-ad-nivel" /><text x={6} y={k * LH + 18} className="vz-tick vz-tick--forte">{k === 0 ? "raiz, profundidade 0" : `profundidade ${k}`}</text></g>)}
      {todos.map((p) => p.filhos.map((f, k) => { const on = aceso(p.n) && aceso(f.n); return <g key={`${p.x}-${k}`} className={`vz-ad-ramo-g ${on ? "vz-ad-ramo-g--aceso" : ""}`}>
        <line x1={p.x} y1={p.y + 48} x2={f.x} y2={f.y} className="vz-ad-ramo" />
        <text x={p.x + (f.x - p.x) * 0.5 + (k ? 6 : -6)} y={p.y + 48 + (f.y - p.y - 48) * 0.5} textAnchor={k ? "start" : "end"} className="vz-ad-ramo-t">{k ? "não" : "sim"}</text>
      </g>; }))}
      {todos.map((p) => { const n = p.n; const pd = n.n ? n.d / n.n : 0; const folha = !n.corte; const w = folha ? Math.min(118, W / fs.length - 8) : 176; const h = folha ? (mostrarGini ? 54 : 42) : 48; return (
        <g key={`${p.x}-${p.y}`} className={`vz-ad-no ${folha ? "vz-ad-no--folha" : "vz-ad-no--interno"} ${aceso(n) ? "vz-ad-no--aceso" : ""}`} style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
          <rect x={-w / 2} y={0} width={w} height={h} rx={6} className={folha ? (pd >= 0.5 ? "vz-ad-caixa vz-ad-caixa--default" : "vz-ad-caixa vz-ad-caixa--pagou") : "vz-ad-caixa vz-ad-caixa--no"} />
          {folha ? <>
            <text y={16} textAnchor="middle" className="vz-ad-t">{n.n} prop. · {n.d} def.</text>
            <text y={32} textAnchor="middle" className="vz-ad-t vz-ad-t--pd">PD {fmtPct(pd)}</text>
            {mostrarGini && <text y={47} textAnchor="middle" className="vz-ad-t vz-ad-t--gini">Gini {fmtNum(gini(n.d, n.n), 3)}</text>}
          </> : <>
            <text y={15} textAnchor="middle" className="vz-ad-t vz-ad-t--var">{NOME_VAR[n.corte!.v]} {rotulo(n)}</text>
            <text y={30} textAnchor="middle" className="vz-ad-t">{n.n} prop. · {n.d} def. · PD {fmtPct(pd)}</text>
            <text y={43} textAnchor="middle" className="vz-ad-t vz-ad-t--gini">{mostrarGini ? `Gini ${fmtNum(gini(n.d, n.n), 3)} · ` : ""}ganho {fmtNum(n.corte!.ganho, 3)}</text>
          </>}
        </g>
      ); })}
    </svg>
  );
}

/** Nós da raiz até a folha de uma proposta (utilização em %, atraso em dias). */
export function caminhoNaArvore(no: No, util: number, atraso: number): No[] {
  if (!no.corte || !no.esq || !no.dir) return [no];
  const v = no.corte.v === "util" ? util : atraso;
  return [no, ...caminhoNaArvore(v <= no.corte.valor ? no.esq : no.dir, util, atraso)];
}
