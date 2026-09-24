"use client";
import { useMemo } from "react";
import { fmtPct } from "@/lib/visuais/metricas";
import { crescer, type No } from "@/lib/visuais/arvore";
import { A0, A1, BASE16, EixosPlano, PontosPlano, U0, U1, escalaPlano } from "./plano-16";

/**
 * A raiz escolhida (c5p8). Um corte só, utilização ≤ 57,5%, já separa a base em 12,5% e 87,5% de default; a #2 e a
 * #15 ficam do lado errado e são o assunto do resto do capítulo. Substitui a página herdada (texto longo e gráfico
 * com pontos cortados pelo eixo). Os grupos e as taxas saem da árvore crescida aqui.
 */
const E = escalaPlano();
const LADO_ERRADO = [2, 15];

function Grupo({ regra, no }: { regra: string; no: No }) {
  const pd = no.d / no.n; const ids = no.grupo.map((p) => p.id);
  return (
    <div className={`vz-re-grupo ${pd >= 0.5 ? "vz-re-grupo--alto" : "vz-re-grupo--baixo"}`}>
      <p className="vz-rd-k">{regra}</p>
      <p className="vz-re-pd">{fmtPct(pd, 1)}</p>
      <p className="vz-re-conta">{no.d} default{no.d === 1 ? "" : "s"} em {no.n} propostas</p>
      <p className="vz-re-ids">{ids.map((id, k) => <span key={id}>{k ? ", " : ""}{LADO_ERRADO.includes(id) ? <b>#{id}</b> : `#${id}`}</span>)}</p>
    </div>
  );
}

export function RaizEscolhida() {
  const raiz = useMemo(() => crescer(BASE16, 1), []);
  const esq = raiz.esq!, dir = raiz.dir!, corte = raiz.corte!.valor;
  return (
    <figure className="vz" data-vz="raiz-escolhida">
      <div className="vz-re-grade">
        <div className="vz-re-grupos">
          <Grupo regra={`utilização ≤ ${corte.toLocaleString("pt-BR")}%`} no={esq} />
          <Grupo regra={`utilização > ${corte.toLocaleString("pt-BR")}%`} no={dir} />
          <p className="hint vz-re-confere">O mesmo corte sai do navegador, do gerador em Python e do scikit-learn com profundidade 1.</p>
        </div>
        <div className="vz-rd-painel">
          <svg viewBox={`0 0 ${E.W} ${E.H}`} role="img" aria-label={`As 16 propostas e o corte em utilização ${corte}%: 12,5% de default à esquerda e 87,5% à direita; a #2 e a #15 do lado errado`}>
            <rect x={E.su(U0)} y={E.sa(A1)} width={E.su(corte) - E.su(U0)} height={E.sa(A0) - E.sa(A1)} style={{ fill: "#9db6de", fillOpacity: 0.22 }} />
            <rect x={E.su(corte)} y={E.sa(A1)} width={E.su(U1) - E.su(corte)} height={E.sa(A0) - E.sa(A1)} style={{ fill: "var(--color-alert)", fillOpacity: 0.16 }} />
            <EixosPlano e={E} />
            <line x1={E.su(corte)} x2={E.su(corte)} y1={E.sa(A1)} y2={E.sa(A0)} className="vz-rd-corte vz-rd-corte--raiz" />
            <text x={E.su(corte) + 6} y={E.sa(41)} className="vz-rd-reta-t">{corte.toLocaleString("pt-BR")}%</text>
            <PontosPlano e={E} anel={LADO_ERRADO} />
          </svg>
        </div>
      </div>
      <p className="vz-re-nota">A <b>#2</b> deu default no grupo bom; a <b>#15</b> pagou no grupo ruim. Um corte só não dá conta delas.</p>
      <p className="vz-fonte">Raiz da árvore crescida aqui sobre as 16 propostas: utilização ≤ 57,5%, 8 propostas de cada lado, Gini 0,21875 nos dois. A conferência independente usa o gerador da aula e o scikit-learn.</p>
    </figure>
  );
}
