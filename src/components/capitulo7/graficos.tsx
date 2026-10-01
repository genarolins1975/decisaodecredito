"use client";
import type { ReactNode } from "react";
import { caminho, Eixos, escala, Grafico, margens, type Dim } from "./base";
import type { Faixa, PontoRoc } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * Gráficos compartilhados do capítulo 7: curva de confiabilidade (com intervalo, n e faixa vazia declarada), curva
 * ROC e curva genérica de linhas. Eixos, unidades e denominadores escritos no desenho; a tabela acessível vai junto.
 */
export type SerieCal = { faixas: Faixa[]; classe: "ink" | "prob" | "dec" | "def" | "ord" | "mudo"; nome?: string; ic?: boolean; linha?: boolean; rotuloN?: boolean };

const ticksAte = (max: number) => { const passo = max > 0.4 ? 0.1 : max > 0.2 ? 0.05 : 0.02; const t: number[] = []; for (let v = 0; v <= max + 1e-9; v += passo) t.push(Math.round(v * 1000) / 1000); return t; };

export function Confiabilidade({ series, max = 0.4, destaque, rotulo, titulo, sub, anotar = true, extra, arCelular, ticks, semTitulos }: {
  series: SerieCal[]; max?: number; destaque?: number | null; rotulo: string; titulo?: ReactNode; sub?: ReactNode; anotar?: boolean; extra?: (x: (v: number) => number, y: (v: number) => number, d: Dim) => ReactNode; arCelular?: string; ticks?: number[]; semTitulos?: boolean;
}) {
  const tab = (
    <table><caption>{rotulo}</caption><thead><tr><th>Série</th><th>Faixa</th><th>n</th><th>Defaults</th><th>PD média prevista</th><th>Default observado</th><th>Intervalo de 95%</th></tr></thead>
      <tbody>{series.flatMap((s, si) => s.faixas.map((f) => <tr key={`${si}-${f.j}`}><td>{s.nome ?? ""}</td><td>{f.j}</td><td>{f.n}</td><td>{f.d}</td><td>{f.pdMedia === null ? "faixa vazia" : pct(f.pdMedia, 2)}</td><td>{f.obs === null ? "sem casos" : pct(f.obs, 2)}</td><td>{f.ic ? `${pct(f.ic.lo, 1)} a ${pct(f.ic.hi, 1)}` : "não se aplica"}</td></tr>))}</tbody></table>
  );
  return (
    <Grafico titulo={titulo} sub={sub} rotulo={rotulo} tabela={tab} arCelular={arCelular ?? "1 / 1"}>
      {(d) => {
        const m = margens(d.fs, semTitulos ? { l: 3.1, b: 1.6, t: 0.6, r: 0.8 } : { l: 3.1, b: 2.9, t: 1.2, r: 0.8 });
        const lado = Math.min(d.w - m.l - m.r, d.h - m.t - m.b);
        const x = escala([0, max], [m.l, m.l + lado]), y = escala([0, max], [m.t + lado, m.t]);
        const t = ticks ?? ticksAte(max); const r = d.fs * 0.42;
        return (
          <g>
            <Eixos x={x} y={y} xt={t} yt={t} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit={semTitulos ? undefined : "PD média prevista na faixa"} yTit={semTitulos ? undefined : "Default observado na faixa"} />
            <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(max)} y2={y(max)} />
            {anotar && <>
              <text className="q7-rot--peq" x={x(max * 0.04)} y={y(max * 0.9)} style={{ fill: "#5B6475" }}>acima da diagonal: risco subestimado</text>
              <text className="q7-rot--peq" x={x(max * 0.96)} y={y(max * 0.07)} textAnchor="end" style={{ fill: "#5B6475" }}>abaixo: risco superestimado</text>
            </>}
            {series.map((s, si) => (
              <g key={si}>
                {s.linha && <path className={`q7-linha q7-linha--fina q7-linha--${s.classe}`} d={caminho(s.faixas.filter((f) => f.obs !== null && f.pdMedia !== null).map((f) => ({ x: x(Math.min(max, f.pdMedia!)), y: y(Math.min(max, f.obs!)) })))} />}
                {s.faixas.map((f) => {
                  if (f.pdMedia === null || f.obs === null) {
                    // faixa vazia: marca no eixo de baixo, sem ponto (não vira taxa zero)
                    const cx = x(Math.min(max, (f.de + f.ate) / 2));
                    return <g key={f.j}><line x1={cx} x2={cx} y1={y(0) - d.fs * 0.5} y2={y(0) + d.fs * 0.1} stroke="#9AA1AD" strokeWidth={2} strokeDasharray="3 3" /><text className="q7-rot--peq" x={cx} y={y(0) - d.fs * 0.7} textAnchor="middle" style={{ fill: "#5B6475" }}>vazia</text></g>;
                  }
                  const cx = x(Math.min(max, f.pdMedia)), cy = y(Math.min(max, f.obs)); const on = destaque === f.j;
                  return (
                    <g key={f.j} opacity={destaque != null && !on ? 0.55 : 1}>
                      {s.ic && f.ic && <line x1={cx} x2={cx} y1={y(Math.min(max, f.ic.lo))} y2={y(Math.min(max, f.ic.hi))} className={`q7-linha q7-linha--fina q7-linha--${s.classe}`} strokeOpacity={0.55} strokeWidth={Math.max(2, d.fs * 0.14)} />}
                      <circle cx={cx} cy={cy} r={on ? r * 1.35 : r} className={`q7-ptc q7-ptc--${s.classe}`} />
                      {s.rotuloN && <text className="q7-rot--peq" x={cx + r * 1.4} y={cy - r * 0.9} style={{ fill: "#5B6475" }}>{`${f.d}/${f.n}`}</text>}
                    </g>
                  );
                })}
              </g>
            ))}
            {extra?.(x, y, d)}
          </g>
        );
      }}
    </Grafico>
  );
}

export function Roc({ series, rotulo, titulo, sub, ponto, xTit = "Adimplentes recusados (taxa de falso positivo)", yTit = "Defaults recusados (taxa de verdadeiro positivo)", extra, arCelular }: {
  series: { pts: PontoRoc[]; classe: string; nome?: string; area?: boolean; degraus?: number }[]; rotulo: string; titulo?: ReactNode; sub?: ReactNode; ponto?: { fpr: number; tpr: number; rot?: string } | null; xTit?: string; yTit?: string;
  extra?: (x: (v: number) => number, y: (v: number) => number, d: Dim) => ReactNode; arCelular?: string;
}) {
  return (
    <Grafico titulo={titulo} sub={sub} rotulo={rotulo} arCelular={arCelular ?? "1 / 1"}>
      {(d) => {
        const m = margens(d.fs, { l: 3.1, b: 2.9, t: 1.2, r: 0.8 });
        const lado = Math.min(d.w - m.l - m.r, d.h - m.t - m.b);
        const x = escala([0, 1], [m.l, m.l + lado]), y = escala([0, 1], [m.t + lado, m.t]);
        const t = [0, 0.25, 0.5, 0.75, 1];
        return (
          <g>
            <Eixos x={x} y={y} xt={t} yt={t} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit={xTit} yTit={yTit} />
            <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />
            <text className="q7-rot--peq" x={x(0.62)} y={y(0.5)} style={{ fill: "#5B6475" }}>sorteio: AUC 0,5</text>
            {series.map((s, i) => {
              const pts = s.pts.map((p) => ({ x: x(p.fpr), y: y(p.tpr) }));
              return <g key={i}>
                {s.area && <path className={`q7-area`} fill={s.classe === "prob" ? "#176C73" : "#3D5A8A"} d={`${caminho(pts)}L${x(1)} ${y(0)}L${x(0)} ${y(0)}Z`} />}
                <path className={`q7-linha q7-linha--${s.classe}`} d={caminho(pts)} />
              </g>;
            })}
            {ponto && <g><circle cx={x(ponto.fpr)} cy={y(ponto.tpr)} r={d.fs * 0.5} fill="#B8640F" stroke="#fff" strokeWidth={2.5} />{ponto.rot && <text className="q7-corte-t" x={x(ponto.fpr) + d.fs * 0.7} y={y(ponto.tpr) + d.fs * 0.35}>{ponto.rot}</text>}</g>}
            {extra?.(x, y, d)}
          </g>
        );
      }}
    </Grafico>
  );
}

/** Lista curta de pares (rótulo, valor) com valor tabular, para painéis laterais. */
export function Lista({ itens }: { itens: [ReactNode, ReactNode, string?][] }) {
  return <dl className="q7-lista">{itens.map(([k, v, tom], i) => <div key={i} data-tom={tom}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

export const fmtN = (v: number) => int(v);
export const fmtAuc = (v: number | null) => (v === null ? "não existe" : num(v, 4));
