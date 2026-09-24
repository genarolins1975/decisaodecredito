"use client";
import { useMemo } from "react";
import { boostingRegressao } from "@/lib/visuais/boosting";
import { fmtNum } from "@/lib/visuais/metricas";
import { paraTex } from "@/lib/visuais/tex";
import { ComTex, Tex } from "./tex";
import { Eixos8, F0_8, LinhaF0, Pontos8, Residuo8, X8, Y8, escala8, sinal8 } from "./plano-8";

/**
 * O erro como novo alvo (c6p5). Os oito resíduos y − F₀ desenhados e rotulados no gráfico, e a conta do ponto x = 8:
 * 12,00 − 6,50 = +5,50. A próxima árvore é ajustada a esses oito números, não a y. E resíduo não é erro final:
 * depois de quatro árvores com η = 0,5, em x = 8 sobram 1,14. Substitui a página herdada, de três faixas de texto e
 * barras sem eixo.
 */
const E = escala8(560, 340);

export function ErroComoAlvo() {
  const fim = useMemo(() => boostingRegressao(X8, Y8, 0.5, 4)[4], []);
  const r8 = Y8[7] - F0_8;
  return (
    <figure className="vz" data-vz="erro-como-alvo">
      <div className="vz-up-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">O que sobra de cada ponto <span className="hint">vermelho: a previsão precisa subir · azul: precisa descer</span></p>
          <svg viewBox={`0 0 ${E.W} ${E.H}`} className="vz-p8" role="img" aria-label="Os oito pontos, o palpite 6,5 e o resíduo de cada ponto, de −4,5 a +5,5">
            <Eixos8 e={E} />
            <LinhaF0 e={E} />
            {X8.map((_, i) => <Residuo8 key={i} e={E} i={i} prev={F0_8} rotulo />)}
            <Pontos8 e={E} destaque={[7]} />
          </svg>
        </div>
        <div className="vz-up-folha">
          <p className="vz-rd-k">O novo alvo em x = 8</p>
          <p className="vz-ea-conta" role="img" aria-label={`${fmtNum(Y8[7], 2)} − ${fmtNum(F0_8, 2)} = ${sinal8(r8, 2)}`}><span className="tx-inteira"><Tex f={String.raw`\boldsymbol{${paraTex(fmtNum(Y8[7], 2))} - ${paraTex(fmtNum(F0_8, 2))}}`} /></span> <span className="tx-inteira"><Tex f={String.raw`\boldsymbol{=}`} /> <b><Tex f={String.raw`\boldsymbol{${paraTex(sinal8(r8, 2))}}`} /></b></span></p>
          <p className="vz-ea-leg">observado menos previsão atual</p>
          <p className="vz-up-porque">Sinal positivo: a previsão precisa subir. Negativo: precisa descer.</p>
          <p className="vz-up-porque">A próxima árvore é ajustada a estes oito resíduos, não a y.</p>
        </div>
      </div>
      <p className="vz-re-nota"><ComTex t={`Resíduo não é erro final: ele muda a cada árvore somada. Depois de quatro, em $x = 8$ sobram ${fmtNum(Y8[7] - fim.F[7], 2)}.`} /></p>
      <p className="vz-fonte"><ComTex t={String.raw`$\text{resíduo} = y - \text{previsão atual}$, com $F_0 = ${paraTex(fmtNum(F0_8, 2))}$, a média de 2; 3; 4,5; 5; 8; 8,5; 9; 12. Quatro tocos com $\eta = 0{,}5$ levam a previsão de $x = 8$ a ${fmtNum(fim.F[7], 2)}, conferido com o gerador.`} /></p>
    </figure>
  );
}
