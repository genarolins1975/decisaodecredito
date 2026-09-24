"use client";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { sigmoide } from "@/lib/visuais/logistica";
import { paraTex, pctTex } from "@/lib/visuais/tex";
import { ComTex, Tex } from "./tex";

/**
 * Onde a soma acontece (c6p11). Somar correções em probabilidade sai do intervalo (0,50 + 0,30 + 0,25 = 1,05); somar
 * em log odds e aplicar a logística no fim dá sempre uma PD válida (0 + 1,2 + 1,05 = 2,25, PD 90,47%). A fórmula do
 * boosting de classificação numa linha e duas consequências: a escala comum com a logística e o F₀ da prevalência.
 * Substitui a página herdada, que ocupava duas telas.
 */
const PROB = { partida: 0.5, correcoes: [0.3, 0.25] };
const LOGODDS = { partida: 0, correcoes: [1.2, 1.05] };
const soma = (s: { partida: number; correcoes: number[] }) => s.correcoes.reduce((a, b) => a + b, s.partida);
const mais = (v: number, casas: number) => `+${fmtNum(v, casas)}`;

export function SomaEmLogOdds() {
  const somaP = soma(PROB), escore = soma(LOGODDS), pd = sigmoide(escore);
  const f0Carteira = Math.log(0.1 / 0.9);
  return (
    <figure className="vz" data-vz="soma-em-log-odds">
      <div className="vz-rd-balanco vz-sl-grade">
        <div className="vz-rd-lista vz-rd-lista--perde">
          <p className="vz-rd-k">Somar em probabilidade</p>
          <table className="table vz-sl-tabela"><tbody>
            <tr><th scope="row">Ponto de partida</th><td>{fmtNum(PROB.partida, 2)}</td></tr>
            {PROB.correcoes.map((c, k) => <tr key={k}><th scope="row">Correção {k + 1}</th><td>{mais(c, 2)}</td></tr>)}
            <tr className="vz-sl-fim vz-sl-fim--ruim"><th scope="row">Resultado</th><td>{fmtNum(somaP, 2)}</td></tr>
          </tbody></table>
          <p className="vz-rd-nota">Passa de 1. Truncar repete o problema da reta do capítulo 4.</p>
        </div>
        <div className="vz-rd-lista vz-rd-lista--ganha">
          <p className="vz-rd-k">Somar em log odds</p>
          <table className="table vz-sl-tabela"><tbody>
            <tr><th scope="row">Ponto de partida</th><td>{fmtNum(LOGODDS.partida, 3)}</td></tr>
            {LOGODDS.correcoes.map((c, k) => <tr key={k}><th scope="row">Correção {k + 1}</th><td>{mais(c, 3)}</td></tr>)}
            <tr><th scope="row">Escore</th><td>{fmtNum(escore, 3)}</td></tr>
            <tr className="vz-sl-fim vz-sl-fim--bom"><th scope="row">PD pela logística</th><td>{fmtPct(pd, 2)}</td></tr>
          </tbody></table>
          <p className="vz-rd-nota">Qualquer soma vira uma PD entre 0 e 1.</p>
        </div>
      </div>
      <p className="vz-sl-formula" role="img" aria-label="F M de x igual a F zero mais eta vezes a soma das árvores; PD igual à logística de F M; F zero igual ao logaritmo de pi dividido por um menos pi">
        <Tex f={String.raw`F_M(x) = F_0 + \eta \cdot \textstyle\sum_m h_m(x)`} /><Tex f={String.raw`\mathrm{PD}(x) = \sigma\big(F_M(x)\big)`} /><Tex f={String.raw`F_0 = \ln\big(\pi \div (1 - \pi)\big)`} />
      </p>
      <ul className="vz-vf-notas">
        <li>Logística e boosting somam na mesma escala, log odds: por isso o capítulo 7 compara os dois.</li>
        <li>F₀ é o log odds da prevalência: 50% dá 0; numa carteira com 10% de default, {fmtNum(f0Carteira, 4)}.</li>
      </ul>
      <p className="vz-fonte"><ComTex t={String.raw`Correções ilustrativas. $\sigma$ é a função logística do capítulo 4: $\sigma(${paraTex(fmtNum(escore, 2))}) = ${pctTex(fmtPct(pd, 2))}$. $\pi$ é a prevalência de default da amostra de treino; na base didática de 16 propostas, 50%.`} /></p>
    </figure>
  );
}
