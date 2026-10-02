"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Legenda, Painel, Quadro, Seg, margens, type Pagina } from "../base";
import { D, EAD, N, PG, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { ks, melhorCorte } from "@/lib/capitulo7/metricas";
import { esperado, fmtReais, PARAMETROS, parcelas, realizado, type Parametros } from "@/lib/visuais/economia";
import { pct } from "@/lib/capitulo7/formato";

/**
 * 32 · c7p18 · A política sai da PD e das hipóteses econômicas. Para cada corte da grade de 0,5%, o resultado esperado
 * da carteira aprovada, calculado com a PD do modelo pelo motor do capítulo 8 (o corte econômico é escolhido antes, nessa
 * grade), e o resultado realizado na janela, com o desfecho observado (só existe depois). O melhor corte realizado é
 * procurado em todos os limiares distintos de PD (melhorCorte de metricas.ts), não na grade: nesta janela ele cai no
 * corte do KS, por acaso, e a leitura diz isso com os números e mostra o que acontece quando a receita sobe a 40%.
 */
type M = "pl" | "pgr" | "pg";
const MOD: Record<M, { nome: string; p: readonly number[] }> = {
  pl: { nome: "Logística", p: PL },
  pgr: { nome: "Boosting sem recalibrar", p: PGR },
  pg: { nome: "Boosting com Platt", p: PG },
};
const GRADE = Array.from({ length: 80 }, (_, i) => (i + 1) * 0.005);
const REC_ALTA = 0.4;
const KS_CORTE = Object.fromEntries((Object.keys(MOD) as M[]).map((k) => [k, ks(Y, MOD[k].p).limiar])) as Record<M, number>;
function realizadoNo(p: readonly number[], c: number, pr: Parametros) { let s = 0; for (let i = 0; i < N; i++) if (p[i] < c) s += realizado(Y[i], EAD[i], pr); return s; }
/** Corte econômico (máximo do esperado na grade), o que ele realiza, o do KS e o melhor corte visto depois, em todos os limiares. */
function cenario(p: readonly number[], pr: Parametros, cKs: number) {
  const esp = GRADE.map((c) => ({ c, esp: parcelas(p as number[], EAD as number[], c, pr).total }));
  const otE = esp.reduce((a, b) => (b.esp > a.esp ? b : a));
  const otR = melhorCorte(p, Y.map((y, i) => realizado(y, EAD[i], pr)));
  let regra = 0, nRegra = 0; for (let i = 0; i < N; i++) { const e = esperado(p[i], EAD[i], pr); if (e > 0) { regra += e; nRegra++; } }
  return { esp, otE, realE: realizadoNo(p, otE.c, pr), realKs: realizadoNo(p, cKs, pr), otR, regra, nRegra };
}

export function S32Politica({ pagina }: { pagina?: Pagina }) {
  const [m, setM] = useState<M>("pl");
  const [lgd, setLgd] = useState(PARAMETROS.lgd);
  const [rec, setRec] = useState(PARAMETROS.receita);
  const pr = useMemo(() => ({ ...PARAMETROS, lgd, receita: rec }), [lgd, rec]);
  const p = MOD[m].p; const cKs = KS_CORTE[m];
  const cen = useMemo(() => cenario(p, pr, cKs), [p, pr, cKs]);
  const alta = useMemo(() => (rec < REC_ALTA ? cenario(p, { ...pr, receita: REC_ALTA }, cKs) : null), [p, pr, rec, cKs]);
  const { otE, otR, realE, realKs } = cen;
  // curva realizada na grade, com os dois cortes especiais inseridos para que os marcadores caiam sobre ela
  const curvaReal = useMemo(() => [...new Set([...GRADE, cKs, otR.corte].filter((c) => c <= 0.4))].sort((a, b) => a - b).map((c) => ({ c, real: realizadoNo(p, c, pr) })), [p, pr, cKs, otR.corte]);
  const padrao = lgd === PARAMETROS.lgd && rec === PARAMETROS.receita;
  const ksGanha = realKs > realE;
  return (
    <Quadro slug="c7p18" pagina={pagina} layout="gl"
      conclusao={<>{MOD[m].nome}{padrao ? ", hipóteses do capítulo 8" : `, perda ${pct(lgd, 0)} e receita ${pct(rec, 0)}`}: o corte econômico, escolhido antes, é <b>{pct(otE.c, 1)}</b> e realiza {fmtReais(realE)}; o KS ({pct(cKs, 1)}) realiza {fmtReais(realKs)}{ksGanha ? <>, <b>mais, por acaso</b>: ele não olha perda nem receita.</> : <>, menos: ele não se moveu com as hipóteses.</>}{ksGanha && alta ? <> Suba a receita para {pct(REC_ALTA, 0)}: o corte econômico vai a {pct(alta.otE.c, 1)} e realiza {fmtReais(alta.realE)}; o KS, parado, {fmtReais(alta.realKs)}.</> : <> O melhor corte visto depois ({pct(otR.corte, 1)}) não existia na hora de decidir.</>}</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Aprova quando PD < corte; corte econômico na grade de 0,5%; melhor corte realizado em todos os limiares. O corte único simplifica a regra por proposta (resultado esperado positivo: ${fmtReais(cen.regra)}, ${cen.nRegra} aprovados): com custo fixo de R$ ${PARAMETROS.operacao}, o equilíbrio depende da exposição. Motor do capítulo 8; realizado ruidoso, com ${D} defaults.`}>
      <Painel titulo="Resultado da carteira aprovada, por corte">
        <Grafico rotulo={`Resultado esperado e realizado por corte; ótimo esperado em ${pct(otE.c, 1)}, KS em ${pct(cKs, 2)}, melhor realizado em ${pct(otR.corte, 2)}`} arCelular="4 / 3">
          {(d) => {
            const mg = margens(d.fs, { l: 4.6, b: 2.9, t: 1.4, r: 1 });
            const vals = [...cen.esp.map((q) => q.esp), ...curvaReal.map((q) => q.real)]; const lo = Math.min(0, ...vals), hi = Math.max(...vals);
            const x = escala([0, 0.4], [mg.l, d.w - mg.r]), y = escala([lo, hi * 1.08], [d.h - mg.b, mg.t]);
            const passo = hi > 8e5 ? 2e5 : 1e5; const yt: number[] = []; for (let v = Math.ceil(lo / passo) * passo; v <= hi * 1.08; v += passo) yt.push(v);
            const xR = x(otR.corte), yR = y(otR.total), dir = xR < d.w * 0.6;
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 0.1, 0.2, 0.3, 0.4]} yt={yt} fx={(v) => pct(v, 0)} fy={(v) => fmtReais(v).replace("R$ ", "")} xTit="Corte de PD (aprova abaixo)" yTit="R$" />
                {lo < 0 && <line className="q7-diag" x1={x(0)} x2={x(0.4)} y1={y(0)} y2={y(0)} />}
                <path className="q7-linha q7-linha--prob" d={caminho(cen.esp.map((q) => ({ x: x(q.c), y: y(q.esp) })))} />
                <path className="q7-linha q7-linha--ink" strokeDasharray="7 5" d={caminho(curvaReal.map((q) => ({ x: x(q.c), y: y(q.real) })))} />
                <line className="q7-corte" x1={x(otE.c)} x2={x(otE.c)} y1={y(lo)} y2={mg.t} />
                <text className="q7-corte-t" x={x(otE.c) + (otE.c >= cKs ? d.fs * 0.4 : -d.fs * 0.4)} y={y(lo) - d.fs * 0.7} textAnchor={otE.c >= cKs ? "start" : "end"}>corte econômico {pct(otE.c, 1)}</text>
                <line x1={x(cKs)} x2={x(cKs)} y1={y(lo)} y2={mg.t} stroke="#3D5A8A" strokeWidth={2.5} strokeDasharray="3 4" />
                <text className="q7-corte-t q7-corte-t--ord" x={x(cKs) + (otE.c >= cKs ? -d.fs * 0.4 : d.fs * 0.4)} y={y(lo) - d.fs * (otE.c === cKs ? 2 : 0.7)} textAnchor={otE.c >= cKs ? "end" : "start"}>KS {pct(cKs, 1)}</text>
                <circle cx={xR} cy={yR} r={d.fs * 0.42} fill="#00205B" stroke="#fff" strokeWidth={2} />
                <text className="q7-rot--peq" x={xR + (dir ? d.fs * 0.7 : -d.fs * 0.7)} y={yR - d.fs * 0.6} textAnchor={dir ? "start" : "end"} style={{ fill: "#00205B", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.28em" }}>● melhor visto depois</text>
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "linha prob", r: "esperado, pela PD do modelo" }, { mk: "trac ink", r: "realizado na janela (depois)" }, { mk: "linha dec", r: "corte econômico" }, { mk: "trac ord", r: "corte do KS" }]} />
      </Painel>
      <Painel>
        <div className="q7-linha-ctl"><Seg rotulo="Modelo" opcoes={(Object.keys(MOD) as M[]).map((k) => ({ v: k, r: k === "pl" ? "Logística" : k === "pgr" ? "Boosting" : "Com Platt" }))} valor={m} onChange={setM} cor /><Botao sec onClick={() => { setM("pl"); setLgd(PARAMETROS.lgd); setRec(PARAMETROS.receita); }}>Restaurar</Botao></div>
        <Controle rotulo="Perda no default (fração da exposição)" valor={lgd} min={0.3} max={0.9} passo={0.05} onChange={setLgd} mostrar={pct(lgd, 0)} />
        <Controle rotulo="Receita se pagar (fração da exposição)" valor={rec} min={0.15} max={0.4} passo={0.01} onChange={setRec} mostrar={pct(rec, 0)} />
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Corte econômico" valor={pct(otE.c, 1)} detalhe={`realiza ${fmtReais(realE)}`} tom="dec" tam="mini" />
          <Kpi rotulo="Corte do KS" valor={pct(cKs, 1)} detalhe={`realiza ${fmtReais(realKs)}`} tam="mini" />
          <Kpi rotulo="Prometido pela PD" valor={fmtReais(otE.esp)} detalhe="no corte econômico" tom="prob" tam="mini" />
          <Kpi rotulo="Melhor corte, visto depois" valor={pct(otR.corte, 1)} detalhe={`${fmtReais(otR.total)}, só depois`} tam="mini" />
        </div>
      </Painel>
    </Quadro>
  );
}
