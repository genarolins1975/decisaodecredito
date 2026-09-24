"use client";
import { useMemo } from "react";
import { fmtPct } from "@/lib/visuais/metricas";
import { crescer, wilson } from "@/lib/visuais/arvore";
import { ArvoreDiagrama, caminhoNaArvore } from "./arvore-diagrama";
import { BASE16 } from "./plano-16";

/**
 * Uma proposta dentro da árvore (c5p10). A #15 percorre a árvore de profundidade 2 e cai numa folha de duas
 * propostas: a taxa é 50%, e o intervalo de 95% (Wilson) vai de 9,5% a 90,5%. A lição é ler a taxa junto com o
 * tamanho da folha. Substitui a página herdada (linha do tempo em texto); a questão da página continua.
 */
const W = 440, H = 64, ML = 14, MR = 14;
const sx = (p: number) => ML + p * (W - ML - MR);

export function UmaProposta() {
  const arvore = useMemo(() => crescer(BASE16, 2), []);
  const p15 = BASE16.find((p) => p.id === 15)!;
  const cam = caminhoNaArvore(arvore, p15.util, p15.atraso);
  const folha = cam[cam.length - 1]; const pd = folha.d / folha.n; const ic = wilson(folha.d, folha.n);
  const vizinhas = folha.grupo.filter((p) => p.id !== 15);
  return (
    <figure className="vz" data-vz="uma-proposta">
      <div className="vz-up-grade">
        <div className="vz-up-arvore">
          <p className="vz-grafico-t">O caminho da #15 <span className="hint">{p15.util}% de utilização, {p15.atraso === 0 ? "sem atraso" : `${p15.atraso} dias de atraso`}, {p15.y ? "deu default" : "pagou"}</span></p>
          <ArvoreDiagrama no={arvore} caminho={cam} W={560} />
          <p className="vz-up-passos">{cam.slice(0, -1).map((n, k) => { const v = n.corte!.v === "util" ? p15.util : p15.atraso; return <span key={k}>{n.corte!.v === "util" ? "utilização" : "atraso"} ≤ {n.corte!.valor.toLocaleString("pt-BR")}{n.corte!.v === "util" ? "%" : " dias"}? <b>{v <= n.corte!.valor ? "sim" : "não"}</b></span>; })}</p>
        </div>
        <div className="vz-up-folha">
          <p className="vz-rd-k">A folha da #15</p>
          <p className="vz-re-pd">{fmtPct(pd)}</p>
          <p className="vz-re-conta">{folha.d} default em {folha.n} propostas</p>
          <p className="vz-up-porque">Na folha estão a #15, que pagou, e {vizinhas.map((p) => `a #${p.id}, que ${p.y ? "deu default" : "pagou"}`).join(" e ")}.</p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Intervalo de 95% da folha: de ${fmtPct(ic.lo, 1)} a ${fmtPct(ic.hi, 1)}`}>
            <line x1={sx(0)} x2={sx(1)} y1={26} y2={26} className="vz-up-trilho" />
            <rect x={sx(ic.lo)} y={18} width={sx(ic.hi) - sx(ic.lo)} height={16} rx={3} className="vz-up-ic" />
            <circle cx={sx(pd)} cy={26} r={7} className="vz-up-ponto" />
            {[0, 0.5, 1].map((v) => <text key={v} x={sx(v)} y={54} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text>)}
          </svg>
          <p className="vz-up-largura">Intervalo de 95%: {fmtPct(ic.lo, 1)} a {fmtPct(ic.hi, 1)}, <b>{Math.round(100 * (ic.hi - ic.lo))} pontos</b> de largura.</p>
        </div>
      </div>
      <p className="vz-re-nota">Taxa sem o tamanho da folha não é informação: com 2 propostas, a folha não separa um grupo excelente de um péssimo.</p>
      <p className="vz-fonte">Árvore de profundidade 2 sobre as 16 propostas didáticas. Intervalo de Wilson a 95% para a proporção de defaults da folha. Profundidade, folha mínima e validação continuam necessárias.</p>
    </figure>
  );
}
