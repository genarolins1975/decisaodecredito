"use client";
import { useMemo } from "react";
import { fmtPct } from "@/lib/visuais/metricas";
import { crescer, folhas, wilson } from "@/lib/visuais/arvore";
import { BASE16 } from "./plano-16";

/**
 * Quanto cada folha afirma (c5p13). As quatro folhas da árvore de profundidade 2, com a taxa e o intervalo de Wilson a
 * 95%: as de duas propostas vão de 9,5% a 90,5%. Tabela e barras lado a lado, e duas leituras curtas. Substitui a página
 * herdada, que repetia o gráfico em quatro telas; a questão da página continua.
 */
const W = 520, LH = 46, ML = 104, MR = 58, MT = 12, MB = 40;
const sx = (p: number) => ML + p * (W - ML - MR);

export function ConfiancaDaFolha() {
  const fs = useMemo(() => folhas(crescer(BASE16, 2)).map((f, i) => ({ nome: `folha ${i + 1}`, n: f.n, d: f.d, pd: f.d / f.n, ic: wilson(f.d, f.n) })), []);
  const H = MT + fs.length * LH + MB;
  const larga = fs.reduce((m, f) => Math.max(m, f.ic.hi - f.ic.lo), 0);
  const volume = wilson(0, 600);
  return (
    <figure className="vz" data-vz="confianca-da-folha">
      <div className="vz-cf-grade">
        <div className="table-wrap"><table className="table vz-cf-tabela"><thead><tr><th>Folha</th><th>n</th><th>Defaults</th><th>PD</th><th>IC 95%</th></tr></thead><tbody>
          {fs.map((f) => <tr key={f.nome} className={f.ic.hi - f.ic.lo === larga ? "vz-t-on" : ""}><th scope="row">{f.nome}</th><td>{f.n}</td><td>{f.d}</td><td className="vz-t-forte">{fmtPct(f.pd, 1)}</td><td>{fmtPct(f.ic.lo, 1)} a {fmtPct(f.ic.hi, 1)}</td></tr>)}
        </tbody></table></div>
        <div className="vz-grafico">
          <p className="vz-grafico-t">PD da folha e intervalo de 95%</p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Intervalos de 95% das quatro folhas; os das folhas de duas propostas vão de 9,5% a 90,5%">
            {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={MT} y2={H - MB + 6} className="vz-grade" /><text x={sx(v)} y={H - MB + 22} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text></g>)}
            {fs.map((f, i) => { const y = MT + i * LH + LH / 2; return (
              <g key={f.nome}>
                <text x={ML - 10} y={y + 4} textAnchor="end" className="vz-tick vz-tick--forte">{f.nome} (n = {f.n})</text>
                <rect x={sx(f.ic.lo)} y={y - 8} width={Math.max(2, sx(f.ic.hi) - sx(f.ic.lo))} height={16} rx={3} className="vz-up-ic" />
                <circle cx={sx(f.pd)} cy={y} r={6.5} className={f.pd >= 0.5 ? "vz-cf-p vz-cf-p--alto" : "vz-cf-p"} />
                <text x={W - MR + 8} y={y + 4} className="vz-tick vz-tick--forte">{fmtPct(f.pd)}</text>
              </g>
            ); })}
          </svg>
        </div>
      </div>
      <ul className="vz-vf-notas">
        <li>Com 2 propostas, o intervalo vai de {fmtPct(fs[0].ic.lo, 1)} a {fmtPct(fs[0].ic.hi, 1)}: a folha quase não afirma nada.</li>
        <li>A mesma PD de 0% com 600 propostas teria intervalo de 0% a {fmtPct(volume.hi, 1)}.</li>
      </ul>
      <p className="vz-fonte">Intervalo de Wilson a 95% (src/lib/visuais/arvore.ts). Barras que se sobrepõem não demonstram risco diferente, mas sobreposição não é teste de diferença: o teste para comparar duas proporções está no capítulo 7.</p>
    </figure>
  );
}
