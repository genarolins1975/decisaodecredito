"use client";
import { useMemo, useState } from "react";
import { boostingRegressao } from "@/lib/visuais/boosting";
import { fmtNum } from "@/lib/visuais/metricas";
import type { Block } from "@/lib/services/content";
import { Degraus8, Eixos8, F0_8, LinhaF0, Pontos8, Residuo8, X8, Y8, escala8, sinal8 } from "./plano-8";
import { paraTex } from "@/lib/visuais/tex";
import { ComTex } from "./tex";

/**
 * Abertura do capítulo 6 (c6p1). Substitui o bloco do desafio, no mesmo desenho da abertura do capítulo 5: o texto do
 * desafio e as três etapas vêm do conteúdo, e os oito pontos de regressão são o visual. Cada etapa acende o que diz:
 * o palpite constante (F₀ = 6,5), os resíduos que viram alvo e a soma de quatro árvores com η = 0,5, que leva o erro
 * quadrático médio de 10,19 a 0,45. No palco, dispensa o infográfico de abertura.
 */
type Episodio = Extract<Block, { type: "episode" }>;
const E = escala8(560, 330);
const ETA = 0.5, M = 4;

export function AberturaBoosting({ episodio }: { palco?: boolean; episodio?: Episodio }) {
  const [etapa, setEtapa] = useState(0);
  const passos = useMemo(() => boostingRegressao(X8, Y8, ETA, M), []);
  const fim = passos[M];
  const res8 = Y8[7] - F0_8;
  const legenda = [
    `O palpite inicial é a média dos oito valores, ${fmtNum(F0_8, 1)}: a mesma previsão para todos, sem olhar para x.`,
    `O que sobra em cada ponto vira o alvo da próxima árvore: em x = 8, faltam ${fmtNum(res8, 1)}.`,
    `Quatro árvores rasas somadas com η = ${fmtNum(ETA, 1)}: o erro quadrático médio cai de ${fmtNum(passos[0].mse, 2)} para ${fmtNum(fim.mse, 2)}.`,
  ];
  // a mesma legenda com as igualdades em KaTeX, para a tela; a versão em texto fica como rótulo do gráfico
  const legendaTex = [
    legenda[0],
    `O que sobra em cada ponto vira o alvo da próxima árvore: em $x = 8$, faltam ${fmtNum(res8, 1)}.`,
    String.raw`Quatro árvores rasas somadas com $\eta = ${paraTex(fmtNum(ETA, 1))}$: o erro quadrático médio cai de ${fmtNum(passos[0].mse, 2)} para ${fmtNum(fim.mse, 2)}.`,
  ];
  const etapas = episodio?.steps ?? [];
  return (
    <figure className="vz" data-vz="abertura-boosting">
      <div className="vz-ab-grade">
        <div className="vz-ab-texto">
          <p className="vz-ab-num" aria-hidden="true">{String(episodio?.number ?? 6).padStart(2, "0")}</p>
          <p className="eyebrow">O desafio deste capítulo</p>
          {episodio && <h3 className="vz-ab-desafio">{episodio.challenge}</h3>}
          {episodio && <p className="vz-ab-lead">{episodio.text}</p>}
          <div className="vz-ab-etapas" role="group" aria-label="Etapas do capítulo">
            {etapas.map((s, k) => (
              <button key={s.title} type="button" className="vz-ab-etapa" aria-pressed={k === etapa} onClick={() => setEtapa(k)}>
                <span className="vz-ab-n" aria-hidden="true">{k + 1}</span><b>{s.title}</b><span className="vz-ab-det">{s.detail}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="vz-ab-visual">
          <svg viewBox={`0 0 ${E.W} ${E.H}`} className="vz-p8" role="img" aria-label={legenda[etapa]}>
            <Eixos8 e={E} />
            <LinhaF0 e={E} apagada={etapa === 2} />
            {etapa === 1 && X8.map((_, i) => <Residuo8 key={i} e={E} i={i} prev={F0_8} rotulo={i === 7} />)}
            {etapa === 2 && <>
              <Degraus8 e={E} F={fim.F} />
              {X8.map((_, i) => <Residuo8 key={i} e={E} i={i} prev={fim.F[i]} rotulo={i === 7} />)}
              <text x={E.sx(8.5)} y={E.sy(fim.F[7]) + 18} textAnchor="end" className="vz-tick vz-p8-degrau-t">previsão com {M} árvores</text>
            </>}
            <Pontos8 e={E} destaque={etapa === 0 ? [] : [7]} />
          </svg>
          <p className="vz-ab-legenda" aria-live="polite"><ComTex t={legendaTex[etapa]} /></p>
        </div>
      </div>
      <p className="vz-fonte"><ComTex t={String.raw`Oito pontos de regressão, $x$ de 1 a 8 e $y = 2;\ 3;\ 4{,}5;\ 5;\ 8;\ 8{,}5;\ 9;\ 12$. Boosting com tocos (profundidade 1) e $\eta = ${paraTex(fmtNum(ETA, 1))}$, recalculado aqui; em $x = 8$ a previsão chega a ${fmtNum(fim.F[7], 2)} e o resíduo cai de ${sinal8(res8, 2)} para ${sinal8(Y8[7] - fim.F[7], 2)}.`} /></p>
    </figure>
  );
}
