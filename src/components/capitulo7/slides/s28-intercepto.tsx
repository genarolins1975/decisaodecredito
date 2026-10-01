"use client";
import { useState } from "react";
import { Botao, escala, Expandir, Formula, Grafico, Kpi, Painel, Quadro, type Pagina } from "../base";
import { CAL, CAL_PGR, D, MINI, N, PGR, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, logit, logLoss, media, sigmoide, transformar } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 28 · c7p12 · Correção de nível por ajuste de intercepto, sobre o boosting sem recalibrar. O a é estimado na amostra
 * de calibração resolvendo Σ σ(logit pᵢ + a) = Σ yᵢ por Newton (a mesma conta da máxima verossimilhança com slope
 * fixado em 1); a diferença de logits das médias aparece ao lado para mostrar que ela não resolve a equação. O teste
 * fica fechado até o botão.
 */
const ALVO = CAL.y.reduce((s, v) => s + v, 0);
const ITER = (() => { const out: { k: number; a: number; soma: number }[] = []; let a = 0; for (let k = 0; k < 6; k++) { let f = 0, g = 0; for (const p of CAL_PGR) { const q = sigmoide(logit(p) + a); f += q; g += q * (1 - q); } out.push({ k, a, soma: f }); a -= (f - ALVO) / g; } return out; })();
const A = ITER[ITER.length - 1].a;
const INGENUO = logit(ALVO / CAL.n) - logit(media(CAL_PGR)!);
const somaCom = (a: number) => CAL_PGR.reduce((s, p) => s + sigmoide(logit(p) + a), 0);
const DEPOIS = transformar(PGR, A, 1);
const AUC0 = aucPorPares(Y, PGR).auc!, AUC1 = aucPorPares(Y, DEPOIS).auc!;

export function S28Intercepto({ pagina }: { pagina?: Pagina }) {
  const [aberto, setAberto] = useState(false);
  return (
    <Quadro slug="c7p12" pagina={pagina} layout="gl"
      conclusao={!aberto ? <>Na amostra de calibração ({int(CAL.n)} casos, {ALVO} defaults), Newton chega a <b>a = {num(A, 4)}</b> em poucos passos. A diferença de logits das médias daria {num(INGENUO, 4)}, que não fecha a conta: esperaria {num(somaCom(INGENUO), 1)} defaults, não {ALVO}. Agora abra o teste.</>
        : <>No teste, a PD média vai de {pct(media(PGR)!, 2)} para <b>{pct(media(DEPOIS)!, 2)}</b> contra {pct(D / N, 2)} observados, e a AUC fica em {num(AUC1, 4)}: a fila não mudou. Brier e log loss pioram um pouco: o ajuste aprendeu o nível da amostra de calibração ({pct(ALVO / CAL.n, 1)}), e não o do teste.</>}
      fonte={`Modelo: boosting sem recalibrar. Amostra de calibração simulada (${int(CAL.n)} casos, semente ${CAL.semente}); teste: janela fora do tempo, ${N} propostas, ${D} defaults. p' = σ(logit p + a).`}>
      <Painel titulo="Antes e depois, na mesma escala: 20 propostas da mini-base">
        <Grafico rotulo={`PD do boosting antes e depois do ajuste de intercepto ${num(A, 3)} para 20 propostas; nenhuma linha se cruza`} arCelular="4 / 3">
          {(d) => {
            const x = escala([0, 0.4], [d.fs * 1.2, d.w - d.fs * 1.2]); const yA = d.fs * 3.2, yB = d.h - d.fs * 3;
            const antes = MINI.map((m) => PGR[m.id]), dep = MINI.map((m) => DEPOIS[m.id]);
            return (
              <g>
                <text className="q7-eixo-t" x={x(0)} y={yA - d.fs * 1.75}>PD antes</text>
                <text className="q7-eixo-t" x={x(0)} y={yB + d.fs * 2.5}>PD depois do ajuste</text>
                {[yA, yB].map((yy, k) => <g key={k}><line className="q7-eixo" x1={x(0)} x2={x(0.4)} y1={yy} y2={yy} />{[0, 0.1, 0.2, 0.3, 0.4].map((t) => <text key={t} className="q7-tick" x={x(t)} y={yy} dy={k ? "1.2em" : "-.5em"} textAnchor="middle">{pct(t, 0)}</text>)}</g>)}
                {MINI.map((m, i) => <line key={m.id} x1={x(antes[i])} y1={yA} x2={x(dep[i])} y2={yB} stroke={m.y ? "#8C2332" : "#9AA1AD"} strokeWidth={m.y ? 2.6 : 1.6} />)}
                {MINI.map((m, i) => <g key={`c${m.id}`}><circle cx={x(antes[i])} cy={yA} r={d.fs * 0.3} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /><circle cx={x(dep[i])} cy={yB} r={d.fs * 0.3} className={m.y ? "q7-pt-def" : "q7-pt-adi"} /></g>)}
              </g>
            );
          }}
        </Grafico>
        <Formula f={String.raw`p'=\sigma\big(\operatorname{logit}(p)+a\big)\quad\text{com}\quad \sum_i \sigma\big(\operatorname{logit}(p_i)+a\big)=\sum_i y_i`} />
        <Expandir resumo="Por que não a diferença de logits das médias?">
          <p className="q7-nota">logit(média de y) − logit(média de p) = {num(INGENUO, 4)}. Como σ não é linear, somar esse valor a cada logit não leva a média das PDs à taxa observada: dá {num(somaCom(INGENUO), 1)} esperados contra {ALVO}. A equação precisa de uma raiz numérica, aqui por Newton.</p>
        </Expandir>
      </Painel>
      <Painel>
        <p className="q7-k">Na amostra de calibração: Newton</p>
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Passo</th><th>a</th><th>Defaults esperados</th></tr></thead>
          <tbody>{ITER.slice(0, 3).map((it) => <tr key={it.k}><th>{it.k}</th><td>{num(it.a, 4)}</td><td>{num(it.soma, 2)}</td></tr>)}<tr data-on="1"><th>alvo</th><td></td><td>{ALVO}</td></tr></tbody>
        </table>
        {aberto ? (
          <div className="q7-kpis q7-kpis--2">
            <Kpi rotulo="PD média no teste" valor={pct(media(DEPOIS)!, 2)} detalhe={`antes ${pct(media(PGR)!, 2)} · obs. ${pct(D / N, 2)}`} tom="prob" tam="mini" />
            <Kpi rotulo="AUC no teste" valor={num(AUC1, 4)} detalhe={`antes ${num(AUC0, 4)}`} tam="mini" />
            <Kpi rotulo="Brier" valor={num(brier(Y, DEPOIS), 5)} detalhe={`antes ${num(brier(Y, PGR), 5)}`} tam="mini" />
            <Kpi rotulo="Log loss" valor={num(logLoss(Y, DEPOIS).valor, 4)} detalhe={`antes ${num(logLoss(Y, PGR).valor, 4)}`} tam="mini" />
          </div>
        ) : <p className="q7-p">O teste continua fechado: nenhuma escolha olhou para ele.</p>}
        <div className="q7-botoes"><Botao prim={!aberto} onClick={() => setAberto(true)} desab={aberto}>Abrir o teste</Botao><Botao sec onClick={() => setAberto(false)}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
