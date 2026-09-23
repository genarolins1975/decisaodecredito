"use client";
import { useMemo } from "react";
import { fmtPct } from "@/lib/visuais/metricas";
import { BETA_AULA, atrasoNaFronteira, escore, sigmoide } from "@/lib/visuais/logistica";
import { crescer, folhas, type No } from "@/lib/visuais/arvore";
import { A0, A1, BASE16, EixosPlano, PontosPlano, U0, U1, escalaPlano } from "./plano-16";

/**
 * Uma reta contra cortes em sequência (c5p2). As mesmas 16 propostas em dois planos na mesma escala: à esquerda, a
 * fronteira de PD 50% da logística do capítulo 4, com as quatro propostas do lado errado; à direita, as quatro regiões
 * da árvore de profundidade 2, com a taxa de cada uma. Embaixo, o que a árvore ganha e o que perde. Substitui a página
 * herdada, que tinha a árvore com um corte só e pontos cortados pelo eixo.
 */
const E = escalaPlano();
const PD = BASE16.map((p) => sigmoide(escore(BETA_AULA, p.util, p.atraso).z));
const ERRADAS = BASE16.filter((p, i) => (PD[i] >= 0.5 ? 1 : 0) !== p.y).map((p) => p.id); // #2, #5, #10 e #15
const GANHA = ["Interação sem escrever o termo", "Efeito que sobe e desce, sem transformar a variável", "Regra legível, que vira política"];
const PERDE = ["Suavidade: a PD salta na fronteira", "Estabilidade: uma proposta a menos muda um corte"];

export function RetaOuDegraus() {
  const regioes = useMemo(() => folhas(crescer(BASE16, 2)), []);
  const fronteira = Array.from({ length: 181 }, (_, k) => U0 + k * 0.5).map((u) => [u, atrasoNaFronteira(BETA_AULA, 0.5, u)] as const)
    .filter(([, a]) => a >= A0 && a <= A1).map(([u, a], i) => `${i ? "L" : "M"}${E.su(u).toFixed(1)} ${E.sa(a).toFixed(1)}`).join("");
  const cortes = [...new Set(regioes.flatMap((f: No) => [f.caixa.u0, f.caixa.u1]).filter((u) => u > 0 && u < 100))];
  const x0 = (f: No) => E.su(Math.max(U0, f.caixa.u0)), x1 = (f: No) => E.su(Math.min(U1, f.caixa.u1));
  const tom = (p: number) => (p === 0.5 ? { fill: "#d9d6cc", fillOpacity: 0.45 } : { fill: p > 0.5 ? "var(--color-alert)" : "#9db6de", fillOpacity: 0.28 });
  return (
    <figure className="vz" data-vz="reta-ou-degraus">
      <div className="vz-rd-grade">
        <div className="vz-rd-painel">
          <p className="vz-rd-k">Logística</p>
          <p className="vz-rd-t">Uma reta: o mesmo efeito em todo o plano</p>
          <svg viewBox={`0 0 ${E.W} ${E.H}`} role="img" aria-label="As 16 propostas e a fronteira de PD 50% da logística; #2, #5, #10 e #15 ficam do lado errado">
            <EixosPlano e={E} />
            <path d={fronteira} className="vz-rd-reta" />
            <text x={E.su(47)} y={E.sa(22) + 2} className="vz-rd-reta-t">PD 50%</text>
            <PontosPlano e={E} anel={ERRADAS} />
          </svg>
          <p className="vz-rd-nota">Do lado errado da reta: <b>#2, #5, #10 e #15</b>. Deslocar a reta troca quem erra; o mínimo é 3.</p>
        </div>
        <div className="vz-rd-painel">
          <p className="vz-rd-k">Árvore</p>
          <p className="vz-rd-t">Cortes: cada região com a sua regra</p>
          <svg viewBox={`0 0 ${E.W} ${E.H}`} role="img" aria-label="As 16 propostas e as quatro regiões da árvore de profundidade 2, com PD de 50%, 0%, 100% e 50%">
            {regioes.map((f) => <rect key={f.caixa.u0} x={x0(f)} y={E.sa(A1)} width={x1(f) - x0(f)} height={E.sa(A0) - E.sa(A1)} style={tom(f.d / f.n)} />)}
            <EixosPlano e={E} />
            {cortes.map((u) => <line key={u} x1={E.su(u)} x2={E.su(u)} y1={E.sa(A1)} y2={E.sa(A0)} className={`vz-rd-corte ${u === 57.5 ? "vz-rd-corte--raiz" : ""}`} />)}
            {regioes.map((f) => <text key={`t${f.caixa.u0}`} x={(x0(f) + x1(f)) / 2} y={E.sa(36)} textAnchor="middle" className="vz-rd-regiao">{fmtPct(f.d / f.n)}</text>)}
            <PontosPlano e={E} anel={[2, 15]} />
          </svg>
          <p className="vz-rd-nota">Três cortes, quatro regiões: duas puras e duas em <b>50%</b>, onde ficam a #2 e a #15.</p>
        </div>
      </div>
      <div className="vz-rd-balanco">
        <div className="vz-rd-lista vz-rd-lista--ganha"><p className="vz-rd-k">A árvore ganha</p><ul>{GANHA.map((g) => <li key={g}>{g}</li>)}</ul></div>
        <div className="vz-rd-lista vz-rd-lista--perde"><p className="vz-rd-k">A árvore perde</p><ul>{PERDE.map((g) => <li key={g}>{g}</li>)}</ul></div>
      </div>
      <p className="vz-fonte">Base didática de 16 propostas. Reta: fronteira de PD 50% da logística do capítulo 4 (coeficientes da aula). Árvore: profundidade 2 por Gini, a árvore do capítulo. Anel dourado: à esquerda, proposta do lado errado da reta; à direita, proposta numa região de 50%.</p>
    </figure>
  );
}
