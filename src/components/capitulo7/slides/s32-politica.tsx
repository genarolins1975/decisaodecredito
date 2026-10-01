"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Legenda, Painel, Quadro, Seg, margens, type Pagina } from "../base";
import { D, EAD, N, PG, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { ks } from "@/lib/capitulo7/metricas";
import { fmtReais, PARAMETROS, parcelas, realizado, type Parametros } from "@/lib/visuais/economia";
import { pct } from "@/lib/capitulo7/formato";

/**
 * 32 · c7p18 · A política sai da PD e das hipóteses econômicas. Para cada corte da grade, o resultado esperado da
 * carteira aprovada, calculado com a PD do modelo pelo motor do capítulo 8, e o resultado realizado na janela, com o
 * desfecho observado (só existe depois). O corte do KS fica onde está, qualquer que seja a perda ou a receita; o corte
 * econômico se move com elas, e uma PD fora de nível o empurra para o lugar errado.
 */
type M = "pl" | "pgr" | "pg";
const MOD: Record<M, { nome: string; p: readonly number[] }> = {
  pl: { nome: "Logística", p: PL },
  pgr: { nome: "Boosting sem recalibrar", p: PGR },
  pg: { nome: "Boosting com Platt", p: PG },
};
const GRADE = Array.from({ length: 80 }, (_, i) => (i + 1) * 0.005);
const KS_CORTE = Object.fromEntries((Object.keys(MOD) as M[]).map((k) => [k, ks(Y, MOD[k].p).limiar])) as Record<M, number>;
function realizadoNo(p: readonly number[], c: number, pr: Parametros) { let s = 0; for (let i = 0; i < N; i++) if (p[i] < c) s += realizado(Y[i], EAD[i], pr); return s; }

export function S32Politica({ pagina }: { pagina?: Pagina }) {
  const [m, setM] = useState<M>("pl");
  const [lgd, setLgd] = useState(PARAMETROS.lgd);
  const [rec, setRec] = useState(PARAMETROS.receita);
  const pr = useMemo(() => ({ ...PARAMETROS, lgd, receita: rec }), [lgd, rec]);
  const p = MOD[m].p;
  const curvas = useMemo(() => GRADE.map((c) => ({ c, esp: parcelas(p as number[], EAD as number[], c, pr).total, real: realizadoNo(p, c, pr) })), [p, pr]);
  const otE = curvas.reduce((a, b) => (b.esp > a.esp ? b : a)), otR = curvas.reduce((a, b) => (b.real > a.real ? b : a));
  const cKs = KS_CORTE[m]; const realKs = realizadoNo(p, cKs, pr);
  const padrao = lgd === PARAMETROS.lgd && rec === PARAMETROS.receita;
  return (
    <Quadro slug="c7p18" pagina={pagina} layout="gl"
      conclusao={<>{MOD[m].nome}{padrao ? ", hipóteses do capítulo 8" : `, perda ${pct(lgd, 0)} e receita ${pct(rec, 0)}`}: resultado esperado máximo no corte de <b>{pct(otE.c, 1)}</b>; a janela entrega {fmtReais(realizadoNo(p, otE.c, pr))} nele. Visto depois, o melhor corte seria {pct(otR.c, 1)}{otE.c > otR.c + 0.0125 ? ": PD abaixo do nível real faz a conta aprovar demais" : otE.c < otR.c - 0.0125 ? ": PD acima do nível real faz a conta recusar demais" : ""}.{Math.abs(otE.esp - realizadoNo(p, otE.c, pr)) > 0.2 * Math.abs(realizadoNo(p, otE.c, pr)) ? <> A PD promete {fmtReais(otE.esp)} nesse corte: erro de nível vira erro de orçamento.</> : null} O KS fica em {pct(cKs, 1)} qualquer que seja a perda; quando acerta, é coincidência.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults, exposição de cada proposta. Aprova quando PD < corte; grade de 0,5% a 40%. Motor econômico do capítulo 8: funding ${pct(PARAMETROS.funding, 0)}, R$ ${PARAMETROS.operacao} de operação e capital ${pct(PARAMETROS.capital, 0)} fixos. Resultado realizado usa o desfecho observado, só se conhece depois e, com ${D} defaults, é ruidoso.`}>
      <Painel titulo="Resultado da carteira aprovada, por corte">
        <Grafico rotulo={`Resultado esperado e realizado por corte; ótimo esperado em ${pct(otE.c, 1)}, KS em ${pct(cKs, 2)}`} arCelular="4 / 3">
          {(d) => {
            const mg = margens(d.fs, { l: 4.6, b: 2.9, t: 1.4, r: 1 });
            const vals = curvas.flatMap((q) => [q.esp, q.real]); const lo = Math.min(0, ...vals), hi = Math.max(...vals);
            const x = escala([0, 0.4], [mg.l, d.w - mg.r]), y = escala([lo, hi * 1.08], [d.h - mg.b, mg.t]);
            const passo = hi > 8e5 ? 2e5 : 1e5; const yt: number[] = []; for (let v = Math.ceil(lo / passo) * passo; v <= hi * 1.08; v += passo) yt.push(v);
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 0.1, 0.2, 0.3, 0.4]} yt={yt} fx={(v) => pct(v, 0)} fy={(v) => fmtReais(v).replace("R$ ", "")} xTit="Corte de PD (aprova abaixo)" yTit="R$" />
                {lo < 0 && <line className="q7-diag" x1={x(0)} x2={x(0.4)} y1={y(0)} y2={y(0)} />}
                <path className="q7-linha q7-linha--prob" d={caminho(curvas.map((q) => ({ x: x(q.c), y: y(q.esp) })))} />
                <path className="q7-linha q7-linha--ink" strokeDasharray="7 5" d={caminho(curvas.map((q) => ({ x: x(q.c), y: y(q.real) })))} />
                <line className="q7-corte" x1={x(otE.c)} x2={x(otE.c)} y1={y(lo)} y2={mg.t} />
                <text className="q7-corte-t" x={x(otE.c) + d.fs * 0.4} y={mg.t + d.fs * 0.9}>ótimo esperado {pct(otE.c, 1)}</text>
                <line x1={x(cKs)} x2={x(cKs)} y1={y(lo)} y2={mg.t} stroke="#3D5A8A" strokeWidth={2.5} strokeDasharray="3 4" />
                <text className="q7-corte-t q7-corte-t--ord" x={x(cKs) - d.fs * 0.4} y={y(lo) - d.fs * 0.7} textAnchor="end">KS {pct(cKs, 1)}</text>
                <circle cx={x(otR.c)} cy={y(otR.real)} r={d.fs * 0.4} fill="#00205B" stroke="#fff" strokeWidth={2} />
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "linha prob", r: "esperado, pela PD do modelo" }, { mk: "trac ink", r: "realizado na janela (depois)" }, { mk: "trac dec", r: "corte de maior resultado esperado" }, { mk: "trac ord", r: "corte do KS" }]} />
      </Painel>
      <Painel>
        <Seg rotulo="Modelo" opcoes={(Object.keys(MOD) as M[]).map((k) => ({ v: k, r: k === "pl" ? "Logística" : k === "pgr" ? "Boosting" : "Boosting + Platt" }))} valor={m} onChange={setM} cor />
        <Controle rotulo="Perda no default (fração da exposição)" valor={lgd} min={0.3} max={0.9} passo={0.05} onChange={setLgd} mostrar={pct(lgd, 0)} />
        <Controle rotulo="Receita se pagar (fração da exposição)" valor={rec} min={0.15} max={0.4} passo={0.01} onChange={setRec} mostrar={pct(rec, 0)} />
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Corte econômico" valor={pct(otE.c, 1)} detalhe={`realizado ${fmtReais(realizadoNo(p, otE.c, pr))}`} tom="dec" tam="mini" />
          <Kpi rotulo="Corte do KS" valor={pct(cKs, 1)} detalhe={`realizado ${fmtReais(realKs)}`} tam="mini" />
          <Kpi rotulo="Esperado no ótimo" valor={fmtReais(otE.esp)} detalhe="o que a PD promete" tom="prob" tam="mini" />
          <Kpi rotulo="Melhor corte, visto depois" valor={pct(otR.c, 1)} detalhe={`${fmtReais(otR.real)}; não existe na decisão`} tam="mini" />
        </div>
        <div className="q7-botoes"><Botao sec onClick={() => { setM("pl"); setLgd(PARAMETROS.lgd); setRec(PARAMETROS.receita); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
