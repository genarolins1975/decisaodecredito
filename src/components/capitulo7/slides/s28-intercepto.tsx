"use client";
import { useState } from "react";
import { Botao, escala, Expandir, Formula, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { CAL, CAL_PGR, CAL_PL, D, MINI, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, logit, logLoss, media, sigmoide, transformar, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 28 · c7p12 · Correção de nível por ajuste de intercepto. O a é estimado na amostra de calibração resolvendo
 * Σ σ(logit pᵢ + a) = Σ yᵢ por Newton (a mesma conta da máxima verossimilhança com slope fixado em 1); a diferença de
 * logits das médias aparece ao lado para mostrar que ela não resolve a equação. A janela fora do tempo fica fechada até
 * a previsão: o que acontece com o Brier quando só o nível é corrigido. Começa na logística, o modelo em produção: o
 * ajuste de nível melhora Brier e log loss na janela (o Platt do slide 27 piorava, porque o slope estimado achata as
 * PDs) e é a correção que o comitê aprova no slide 36. O seletor troca para o boosting sem recalibrar, em que o nível
 * já era compatível com o observado e as perdas quase não mudam. A taxa observada vem com o intervalo de Wilson.
 */
type Mod = "logistica" | "boosting";
const ALVO = CAL.y.reduce((s, v) => s + v, 0);
function calcula(pdCal: readonly number[], pdJan: readonly number[]) {
  const iter: { k: number; a: number; soma: number }[] = []; let a = 0;
  for (let k = 0; k < 6; k++) { let f = 0, g = 0; for (const p of pdCal) { const q = sigmoide(logit(p) + a); f += q; g += q * (1 - q); } iter.push({ k, a, soma: f }); a -= (f - ALVO) / g; }
  const A = iter[iter.length - 1].a, ingenuo = logit(ALVO / CAL.n) - logit(media(pdCal)!);
  const depois = transformar(pdJan, A, 1);
  return { iter, A, ingenuo, somaIngenuo: pdCal.reduce((s, p) => s + sigmoide(logit(p) + ingenuo), 0), antes: pdJan, depois, auc0: aucPorPares(Y, pdJan).auc!, auc1: aucPorPares(Y, depois).auc!,
    bs0: brier(Y, pdJan), bs1: brier(Y, depois), ll0: logLoss(Y, pdJan).valor, ll1: logLoss(Y, depois).valor, pm0: media(pdJan)!, pm1: media(depois)! };
}
const R: Record<Mod, ReturnType<typeof calcula>> = { logistica: calcula(CAL_PL, PL), boosting: calcula(CAL_PGR, PGR) };
const NOME: Record<Mod, string> = { logistica: "logística", boosting: "boosting sem recalibrar" };
const OBS = wilson(D, N)!;
const CERTA = 1;

export function S28Intercepto({ pagina }: { pagina?: Pagina }) {
  const [prev, setPrev] = useState<number | null>(null);
  const aberto = prev === CERTA;
  const [mod, setMod] = useState<Mod>("logistica");
  const r = R[mod];
  const melhora = r.ll1 < r.ll0 && r.bs1 < r.bs0;
  return (
    <Quadro slug="c7p12" pagina={pagina} layout="gl"
      conclusao={!aberto ? <>Na amostra de calibração ({int(CAL.n)} casos, {ALVO} defaults), Newton chega a <b>a = {num(r.A, 4)}</b> para a {NOME[mod]}. A diferença de logits das médias daria {num(r.ingenuo, 4)}, que não fecha a conta: esperaria {num(r.somaIngenuo, 1)} defaults, não {ALVO}. A janela continua fechada: primeiro a previsão.</>
        : melhora ? <>Na janela, a PD média da {NOME[mod]} vai de {pct(r.pm0, 2)} para <b>{pct(r.pm1, 2)}</b>, compatível com os {pct(OBS.p, 2)} observados (IC {pct(OBS.lo, 1)} a {pct(OBS.hi, 1)}), e a AUC não se move. Brier ({num(r.bs0, 5)} para {num(r.bs1, 5)}) e log loss ({num(r.ll0, 4)} para {num(r.ll1, 4)}) melhoram pouco, mas melhoram: <b>é a correção que o comitê aprova no <LinkSlide slug="c7p38">slide 36</LinkSlide></b>.</>
        : <>Na janela, a PD média do {NOME[mod]} vai de {pct(r.pm0, 2)} para <b>{pct(r.pm1, 2)}</b> contra {pct(OBS.p, 2)} observados (IC {pct(OBS.lo, 1)} a {pct(OBS.hi, 1)}): o nível já era compatível antes e continua depois. Brier ({num(r.bs0, 5)} para {num(r.bs1, 5)}) e log loss ({num(r.ll0, 4)} para {num(r.ll1, 4)}) quase não mudam: o que separa o boosting da logística é a ordem (AUC {num(r.auc1, 4)}), e o intercepto não toca nela.</>}
      fonte={`Calibração sintética: ${int(CAL.n)} sorteios dos proponentes da janela, desfecho novo da PD verdadeira (semente ${CAL.semente}). Janela fora do tempo: ${N} propostas, ${D} defaults; IC de Wilson de 95%. p' = σ(logit p + a).`}>
      <Painel titulo="Antes e depois, na mesma escala: 20 propostas da mini-base">
        <Grafico rotulo={`PD da ${NOME[mod]} antes e depois do ajuste de intercepto ${num(r.A, 3)} para 20 propostas; nenhuma linha se cruza`} arCelular="4 / 3">
          {(d) => {
            const x = escala([0, 0.4], [d.fs * 1.2, d.w - d.fs * 1.2]); const yA = d.fs * 3.2, yB = d.h - d.fs * 3;
            const antes = MINI.map((m) => r.antes[m.id]), dep = MINI.map((m) => r.depois[m.id]);
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
        <Formula f={String.raw`\begin{aligned}p'&=\sigma\big(\operatorname{logit}(p)+a\big)\\ \textstyle\sum_i y_i&=\textstyle\sum_i \sigma\big(\operatorname{logit}(p_i)+a\big)\end{aligned}`} />
        <Expandir resumo="Por que não a diferença de logits das médias?">
          <p className="q7-nota">logit(média de y) − logit(média de p) = {num(r.ingenuo, 4)}. Como σ não é linear, somar esse valor a cada logit não leva a média das PDs à taxa observada: dá {num(r.somaIngenuo, 1)} esperados contra {ALVO}. A equação precisa de uma raiz numérica, aqui por Newton.</p>
        </Expandir>
      </Painel>
      <Painel>
        <div className="q7-linha-ctl"><Seg rotulo="Modelo" opcoes={[{ v: "logistica" as Mod, r: "Logística" }, { v: "boosting" as Mod, r: "Boosting" }]} valor={mod} onChange={setMod} cor /><Botao sec onClick={() => { setPrev(null); setMod("logistica"); }}>Restaurar</Botao></div>
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Newton, na calibração</th><th>a</th><th>Defaults esperados</th></tr></thead>
          <tbody>{r.iter.slice(0, 3).map((it) => <tr key={it.k}><th>{it.k}</th><td>{num(it.a, 4)}</td><td>{num(it.soma, 2)}</td></tr>)}<tr data-on="1"><th>alvo</th><td></td><td>{ALVO}</td></tr></tbody>
        </table>
        {aberto ? (
          <>
            <Kpi rotulo="PD média na janela" valor={pct(r.pm1, 2)} detalhe={`antes ${pct(r.pm0, 2)} · observado ${pct(OBS.p, 2)}, IC ${pct(OBS.lo, 1)} a ${pct(OBS.hi, 1)}`} tom="prob" tam="mini" />
            <div className="q7-kpis q7-kpis--3">
              <Kpi rotulo="AUC" valor={num(r.auc1, 4)} detalhe={`antes ${num(r.auc0, 4)}`} tam="mini" />
              <Kpi rotulo="Brier" valor={num(r.bs1, 5)} detalhe={`antes ${num(r.bs0, 5)}`} tom={r.bs1 < r.bs0 ? "val" : undefined} tam="mini" />
              <Kpi rotulo="Log loss" valor={num(r.ll1, 4)} detalhe={`antes ${num(r.ll0, 4)}`} tom={r.ll1 < r.ll0 ? "val" : undefined} tam="mini" />
            </div>
          </>
        ) : (
          <Previsao pergunta="Só o nível é corrigido. Na janela, o Brier..." escolha={prev} onEscolha={setPrev} recolher
            opcoes={[
              { certa: false, texto: "Cai muito: a PD média chega ao observado", retorno: "Confunde nível com qualidade total. O Brier soma o erro de nível, a resolução e a incerteza do evento; o intercepto só mexe na primeira parcela, e a ordem (AUC) não muda." },
              { texto: "Quase não muda", certa: true, retorno: "Isso." },
              { certa: false, texto: `Piora: a calibração teve ${pct(ALVO / CAL.n, 1)} de defaults, a janela não`, retorno: `Seria um risco se a calibração viesse de outra população. Aqui ela sai da mesma PD verdadeira, e ${pct(ALVO / CAL.n, 1)} cabe no intervalo da janela (${pct(OBS.lo, 1)} a ${pct(OBS.hi, 1)}): diferença de nível desse tamanho é ruído.` },
            ]} />
        )}
      </Painel>
    </Quadro>
  );
}
