"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Expandir, Formula, Grafico, Legenda, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { CAL, CAL_PGR, D, N, PG, PGR, PLATT, Y } from "@/lib/capitulo7/dados";
import { ajustarPlatt, aucPorPares, brier, faixasQuantis, interceptoESlope, logit, logLoss, media, sigmoide, transformar } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 29 · c7p13 · Platt: σ(a + b · logit p) sobre o boosting sem recalibrar. Três versões na mesma janela: sem calibrar,
 * o Platt do curso (parâmetros estimados antes da janela, na validação) e o Platt ajustado na amostra de calibração.
 * O ajuste aqui é máxima verossimilhança simples; o scikit-learn (CalibratedClassifierCV, method="sigmoid") usa a
 * suavização de alvos de Platt (1999) e escreve 1/(1 + exp(A f + B)). Os valores do scikit-learn 1.9.1 na mesma
 * amostra estão na nota, conferidos por scripts/capitulo7/referencia.py.
 */
type V = "bruto" | "curso" | "cal";
const PC = ajustarPlatt(CAL.y, CAL_PGR);
const P_CAL = transformar(PGR, PC.a, PC.b);
const SK = { A: -0.7204, B: 0.4025 };
const VERS: Record<V, { nome: string; a: number | null; b: number | null; p: readonly number[]; onde: string }> = {
  bruto: { nome: "Sem calibrar", a: null, b: null, p: PGR, onde: "saída do boosting" },
  curso: { nome: "Platt do curso", a: PLATT.a, b: PLATT.b, p: PG, onde: "ajustado na validação" },
  cal: { nome: "Platt da amostra de calibração", a: PC.a, b: PC.b, p: P_CAL, onde: `ajustado em ${int(CAL.n)} casos` },
};
const MET = Object.fromEntries((Object.keys(VERS) as V[]).map((k) => { const p = VERS[k].p; return [k, { media: media(p)!, auc: aucPorPares(Y, p).auc!, brier: brier(Y, p), ll: logLoss(Y, p).valor, slope: interceptoESlope(Y, p).slope }]; })) as Record<V, { media: number; auc: number; brier: number; ll: number; slope: number }>;

export function S29Platt({ pagina }: { pagina?: Pagina }) {
  const [v, setV] = useState<V>("bruto");
  const [prev, setPrev] = useState<number | null>(null);
  const m = MET[v];
  const curvas = (Object.keys(VERS) as V[]).filter((k) => k !== "bruto");
  return (
    <Quadro slug="c7p13" pagina={pagina} layout="gl"
      conclusao={prev === null ? <>Antes de comparar as três versões: o que Platt faz com a ordenação?</>
        : v === "bruto" ? <>O boosting sem calibrar tem PD média {pct(m.media, 2)} contra {pct(D / N, 2)} observados e slope de calibração {num(m.slope, 2)} na janela: PDs um pouco extremas demais. Escolha um calibrador.</>
          : <>{VERS[v].nome}: a = {num(VERS[v].a!, 3)}, b = {num(VERS[v].b!, 3)}. PD média {pct(m.media, 2)}, Brier {num(m.brier, 5)} (sem calibrar {num(MET.bruto.brier, 5)}), log loss {num(m.ll, 4)} ({num(MET.bruto.ll, 4)}). A AUC continua <b>{num(m.auc, 4)}</b>. Com b {"<"} 1 Platt comprime as PDs; na janela o slope passa a {num(m.slope, 2)}: comprimiu além do necessário.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Amostra de calibração simulada: ${int(CAL.n)} casos, semente ${CAL.semente}. Platt do curso: parâmetros do capítulo 6, estimados na validação. Slope: coeficiente de logit p numa logística de y na janela.`}>
      <Painel>
        <div className="q7-s26-g">
          <Grafico titulo="A transformação" sub="PD sem calibrar → PD calibrada" rotulo="Curvas de Platt do curso e da amostra de calibração contra a diagonal" arCelular="1 / 1">
            {(d) => {
              const mg = margens(d.fs, { l: 3, b: 2.8, t: 1, r: 0.8 }); const lado = Math.min(d.w - mg.l - mg.r, d.h - mg.t - mg.b);
              const x = escala([0, 0.5], [mg.l, mg.l + lado]), y = escala([0, 0.5], [mg.t + lado, mg.t]);
              const qs = Array.from({ length: 100 }, (_, i) => 0.003 + (i / 99) * 0.497);
              return (
                <g>
                  <Eixos x={x} y={y} xt={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} yt={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} fx={(t) => pct(t, 0)} fy={(t) => pct(t, 0)} xTit="PD sem calibrar" yTit="PD calibrada" />
                  <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(0.5)} y2={y(0.5)} />
                  {curvas.map((k) => <path key={k} className={`q7-linha ${k === "curso" ? "q7-linha--dec" : "q7-linha--prob"}`} strokeDasharray={k === "curso" ? "7 5" : undefined} style={{ opacity: v === "bruto" || v === k ? 1 : 0.35 }} d={caminho(qs.map((q) => ({ x: x(q), y: y(sigmoide(VERS[k].a! + VERS[k].b! * logit(q))) })))} />)}
                  {PGR.map((p, i) => <line key={i} x1={x(Math.min(p, 0.5))} x2={x(Math.min(p, 0.5))} y1={y(0)} y2={y(0) - d.fs * 0.5} stroke="#5B6475" strokeOpacity={0.25} />)}
                </g>
              );
            }}
          </Grafico>
          <Confiabilidade titulo="Confiabilidade na janela" sub="decis da PD" rotulo={`Curva de confiabilidade: ${VERS[v].nome}`} max={0.4} ticks={[0, 0.1, 0.2, 0.3, 0.4]}
            series={[{ faixas: faixasQuantis(Y, PGR, 10), classe: "mudo", linha: true }, ...(v === "bruto" ? [] : [{ faixas: faixasQuantis(Y, VERS[v].p, 10), classe: (v === "curso" ? "dec" : "prob") as "dec" | "prob", linha: true }])]} anotar={false} />
        </div>
        <Legenda itens={[{ mk: "linha prob", r: "Platt da amostra de calibração" }, { mk: "trac dec", r: "Platt do curso" }, { mk: "linha mudo", r: "sem calibrar" }, { mk: "", r: `tracinhos no eixo: as ${N} PDs da janela` }]} />
      </Painel>
      <Painel>
        {prev === null ? (
          <Previsao pergunta="Platt com b positivo é aplicado às PDs do boosting. O que acontece com a AUC na janela?" escolha={prev} onEscolha={setPrev} recolher
            opcoes={[
              { texto: "Sobe, porque as PDs ficam mais corretas", retorno: "Confunde calibração com ordenação. Uma função estritamente crescente não troca ninguém de lugar; a AUC só depende da ordem." },
              { texto: "Fica igual", certa: true, retorno: "Isso: com b > 0, σ(a + b logit p) é estritamente crescente, a ordem das propostas é a mesma e a AUC não muda." },
              { texto: "Cai, porque Platt comprime as PDs", retorno: "Comprimir aproxima as PDs mas não inverte nenhum par; sem inversão nem empate novo, a AUC não muda." },
            ]} />
        ) : (
          <>
            <Seg rotulo="Versão" opcoes={(Object.keys(VERS) as V[]).map((k) => ({ v: k, r: k === "bruto" ? "Sem calibrar" : k === "curso" ? "Platt do curso" : "Platt da calibração" }))} valor={v} onChange={setV} cor />
            <table className="q7-tab">
              <thead><tr><th className="q7-t-l">Na janela</th><th>Sem</th><th>Curso</th><th>Calibração</th></tr></thead>
              <tbody>
                <tr><th>a ; b</th><td>·</td><td>{num(PLATT.a, 3)} ; {num(PLATT.b, 3)}</td><td>{num(PC.a, 3)} ; {num(PC.b, 3)}</td></tr>
                {([["PD média", (k: V) => pct(MET[k].media, 2)], ["AUC", (k: V) => num(MET[k].auc, 4)], ["Brier", (k: V) => num(MET[k].brier, 5)], ["Log loss", (k: V) => num(MET[k].ll, 4)], ["Slope", (k: V) => num(MET[k].slope, 2)]] as const).map(([r, f]) => (
                  <tr key={r}><th>{r}</th>{(["bruto", "curso", "cal"] as V[]).map((k) => <td key={k} data-on={k === v ? "1" : undefined}>{f(k)}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <p className="q7-nota">Observado na janela: {pct(D / N, 2)}. Nenhuma das versões foi ajustada nela.</p>
          </>
        )}
        <Expandir resumo="A fórmula e a convenção do scikit-learn">
          <Formula f={String.raw`\begin{aligned}\text{aqui: }p'&=\sigma\big(a+b\,\operatorname{logit}p\big)\\ \text{scikit-learn: }p'&=\frac{1}{1+e^{A\,\operatorname{logit}p+B}}\\ \Rightarrow\ A&=-b,\ \ B=-a\end{aligned}`} />
          <p className="q7-nota">Na mesma amostra, o scikit-learn 1.9.1 dá b = {num(-SK.A, 4)} e a = {num(-SK.B, 4)}, contra {num(PC.b, 4)} e {num(PC.a, 4)} aqui: ele suaviza os alvos como Platt (1999).</p>
        </Expandir>
        <div className="q7-botoes"><Botao sec onClick={() => { setV("bruto"); setPrev(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
