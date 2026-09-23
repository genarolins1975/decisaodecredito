"use client";
import { useMemo } from "react";
import { boostingRegressao } from "@/lib/visuais/boosting";
import { fmtNum } from "@/lib/visuais/metricas";
import { Degraus8, Eixos8, LinhaF0, Pontos8, Residuo8, X8, Y8, escala8, sinal8 } from "./plano-8";

/**
 * A primeira árvore de correção (c6p6). Um toco ajustado aos resíduos corta em x ≤ 4,5 e devolve a correção média de
 * cada lado, −2,875 e +2,875. Somada inteira (η = 1), leva o erro quadrático médio de 10,19 a 1,92, mas passa do ponto:
 * cinco dos oito resíduos trocam de sinal, entre eles o de x = 5 (+1,50 para −1,375). É o problema que a taxa de
 * aprendizagem resolve na página seguinte. Substitui a página herdada, de caixas de texto.
 */
const E = escala8(560, 340);

export function PrimeiraCorrecao() {
  const [p0, p1] = useMemo(() => boostingRegressao(X8, Y8, 1, 1), []);
  const toco = p1.arvore!; const corte = toco.corte!.valor;
  const esq = toco.esq!.valor, dir = toco.dir!.valor;
  const res1 = Y8.map((y, i) => y - p1.F[i]);
  const trocam = X8.map((_, i) => i).filter((i) => Math.sign(p0.res[i]) !== Math.sign(res1[i]));
  const i5 = X8.indexOf(5);
  return (
    <figure className="vz" data-vz="primeira-correcao">
      <div className="vz-up-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Palpite mais a correção inteira <span className="hint">anel: resíduo que trocou de sinal</span></p>
          <svg viewBox={`0 0 ${E.W} ${E.H}`} className="vz-p8" role="img" aria-label={`Corte em x ≤ ${fmtNum(corte, 1)}: correção ${sinal8(esq, 3)} à esquerda e ${sinal8(dir, 3)} à direita; ${trocam.length} dos 8 resíduos trocam de sinal`}>
            <rect x={E.sx(0.5)} y={E.MT} width={E.sx(corte) - E.sx(0.5)} height={E.sy(0) - E.MT} className="vz-pc-regiao vz-pc-regiao--desce" />
            <rect x={E.sx(corte)} y={E.MT} width={E.sx(8.5) - E.sx(corte)} height={E.sy(0) - E.MT} className="vz-pc-regiao vz-pc-regiao--sobe" />
            <Eixos8 e={E} />
            <line x1={E.sx(corte)} x2={E.sx(corte)} y1={E.MT} y2={E.sy(0)} className="vz-rd-corte vz-rd-corte--raiz" />
            <text x={(E.sx(0.5) + E.sx(corte)) / 2} y={E.MT + 18} textAnchor="middle" className="vz-rd-regiao">{sinal8(esq, 3)}</text>
            <text x={(E.sx(corte) + E.sx(8.5)) / 2} y={E.MT + 18} textAnchor="middle" className="vz-rd-regiao">{sinal8(dir, 3)}</text>
            <LinhaF0 e={E} apagada />
            <Degraus8 e={E} F={p1.F} />
            {X8.map((_, i) => <Residuo8 key={i} e={E} i={i} prev={p1.F[i]} />)}
            <Pontos8 e={E} anel={trocam} />
          </svg>
        </div>
        <div className="vz-up-folha">
          <p className="vz-rd-k">A regra da árvore</p>
          <p className="vz-pc-regra">x ≤ {fmtNum(corte, 1)}?</p>
          <p className="vz-up-porque"><b>sim: {sinal8(esq, 3)}</b>, o palpite está alto</p>
          <p className="vz-up-porque"><b>não: {sinal8(dir, 3)}</b>, o palpite está baixo</p>
          <p className="vz-pc-mse">Erro quadrático médio: {fmtNum(p0.mse, 2)} → <b>{fmtNum(p1.mse, 2)}</b></p>
          <p className="vz-re-pd">{trocam.length} de {X8.length}</p>
          <p className="vz-re-conta">resíduos trocam de sinal; em x = 5, {sinal8(p0.res[i5], 2)} vira {sinal8(res1[i5], 3)}</p>
        </div>
      </div>
      <p className="vz-re-nota">A direção está certa, mas o passo é grande demais: a correção inteira cai também sobre quem já estava perto. A taxa de aprendizagem, na próxima página, soma só um pedaço.</p>
      <p className="vz-fonte">Toco (árvore de profundidade 1) ajustado aos resíduos y − 6,5 pela soma de quadrados; cada folha guarda a média dos resíduos do seu lado. Correção somada inteira, η = 1 (src/lib/visuais/boosting.ts).</p>
    </figure>
  );
}
