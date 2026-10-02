"use client";
import { useMemo, useState } from "react";
import { Botao, Controle, Eixos, escala, Expandir, Formula, Grafico, Kpi, Legenda, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { Pessoas } from "../pecas";
import { PL, Y } from "@/lib/capitulo7/dados";
import { mulberry32, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 17 · c7p9 · Uma PD de 10% fala de um grupo. Simulação: 100 propostas com a mesma PD p; cada amostra sorteia os
 * desfechos (a amostra n usa a semente 20261017 + n) e o gráfico acumula quantos defaults saíram em cada amostra, contra
 * a distribuição binomial exata, que só aparece depois da previsão. Na janela: as 100 propostas cuja PD da logística está
 * mais perto de 10%. A faixa de 95% da previsão sai da própria binomial (quantis de 2,5% e 97,5%).
 */
type Modo = "simulacao" | "janela";
const SEM = 20261017;
const amostra = (p: number, k: number) => { const r = mulberry32(SEM + k); return Array.from({ length: 100 }, () => r() < p); };
const binom = (n: number, p: number) => { const out: number[] = []; let lp = n * Math.log(1 - p); out.push(Math.exp(lp)); for (let k = 1; k <= n; k++) { lp += Math.log((n - k + 1) / k) + Math.log(p / (1 - p)); out.push(Math.exp(lp)); } return out; };
const PERTO = PL.map((p, i) => ({ i, d: Math.abs(p - 0.1) })).sort((a, b) => a.d - b.d || a.i - b.i).slice(0, 100).map((x) => x.i).sort((a, b) => a - b);
const PERTO_MEDIA = PERTO.reduce((s, i) => s + PL[i], 0) / 100, PERTO_D = PERTO.reduce((s, i) => s + Y[i], 0);
const PERTO_FAIXA = [Math.min(...PERTO.map((i) => PL[i])), Math.max(...PERTO.map((i) => PL[i]))];
const P0 = 0.1;
const B0 = binom(100, P0);
const quantilB = (q: number) => { let s = 0; for (let c = 0; c < B0.length; c++) { s += B0[c]; if (s >= q) return c; } return 100; };
const LO = quantilB(0.025), HI = quantilB(0.975);
const P_ALTO = B0.slice(25).reduce((a, b) => a + b, 0);
const OPS = [
  { texto: `Exatamente ${num(100 * P0, 0)}, em toda amostra`, certa: false, retorno: <>{num(100 * P0, 0)} é o centro, não uma promessa: cada amostra sorteia de novo. Confunde a PD de um grupo com uma contagem garantida.</> },
  { texto: `Quase sempre entre ${LO} e ${HI}`, certa: true, retorno: <>Isso: a binomial põe 95% das amostras entre {LO} e {HI}. Nenhuma contagem nessa faixa desmente a PD.</> },
  { texto: "Qualquer número: a PD não diz nada", certa: false, retorno: <>Diz: a contagem fica perto de {num(100 * P0, 0)}; 25 ou mais tem chance de {pct(P_ALTO, 4)}. Confunde incerteza com ignorância.</> },
];

export function S17PdColetiva({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("simulacao");
  const [p, setP] = useState(0.1);
  const [k, setK] = useState(1);
  const [esc, setEsc] = useState<number | null>(null);
  const atual = useMemo(() => amostra(p, k), [p, k]);
  const contagens = useMemo(() => Array.from({ length: k }, (_, j) => amostra(p, j + 1).filter(Boolean).length), [p, k]);
  const mediaAm = contagens.reduce((a, b) => a + b, 0) / k;
  const revelado = esc !== null;
  const teor = useMemo(() => binom(100, p), [p]);
  const sim = modo === "simulacao";
  const obs = sim ? atual.filter(Boolean).length : PERTO_D;
  const w = wilson(PERTO_D, 100)!;
  const maxK = 5 * Math.ceil(Math.max(20, p * 100 + 4 * Math.sqrt(100 * p * (1 - p))) / 5);
  return (
    <Quadro slug="c7p9" pagina={pagina} layout="gl"
      conclusao={sim ? <>PD de {pct(p, 0)} em 100 propostas: <b>espera-se {num(100 * p, 0)} defaults</b>; na amostra {k} saíram {obs}{k > 1 ? `, e a média das ${k} amostras é ${num(mediaAm, 1)}` : ""}. A PD promete a frequência média do grupo, não a contagem: por isso a calibração se mede em grupos, a partir do slide 18.</>
        : <>As 100 propostas com PD perto de 10% (de {pct(PERTO_FAIXA[0], 1)} a {pct(PERTO_FAIXA[1], 1)}, média {pct(PERTO_MEDIA, 1)}) tiveram <b>{PERTO_D} defaults</b>. Intervalo de 95% para a frequência: {pct(w.lo, 1)} a {pct(w.hi, 1)}.</>}
      fonte={sim ? `Simulação: 100 propostas independentes com a mesma PD; amostra n usa a semente ${SEM} + n. Curva: binomial exata de cada contagem, multiplicada pelo número de amostras.` : "Janela fora do tempo: as 100 propostas cuja PD da logística está mais perto de 10%; desfecho observado em 12 meses."}>
      <Painel titulo={sim ? `Amostra ${k}: 100 propostas com PD de ${pct(p, 0)}` : "Na janela: 100 propostas com PD perto de 10%"}>
        <div className="q7-s17 q7-g2-s17">
          <div className="q7-s17-pes">
            <Pessoas n={100} d={obs} esperados={100 * (sim ? p : PERTO_MEDIA)} rotulo={`${obs} defaults entre 100 propostas; a PD esperava ${num(100 * (sim ? p : PERTO_MEDIA), 1)}`} />
            <Legenda itens={[{ mk: "def", r: "deu default" }, { mk: "adi", r: "pagou" }, { mk: "", r: "contorno verde: esperados" }]} />
          </div>
          {sim && (
            <Grafico titulo="Defaults por amostra" sub={`${k} amostra${k > 1 ? "s" : ""}${revelado ? "; curva: binomial" : ""}`} rotulo={`Distribuição dos defaults em ${k} amostras, contra a binomial com PD ${pct(p, 0)}`} arCelular="4 / 3">
              {(d) => {
                const m = margens(d.fs, { l: 2.6, b: 2.8, t: 1, r: 0.8 });
                const x = escala([0, maxK], [m.l, d.w - m.r]); const cont = Array.from({ length: maxK + 1 }, (_, c) => contagens.filter((v) => v === c).length);
                const esp = teor.slice(0, maxK + 1).map((v) => v * k); const ymax = Math.max(5, ...cont, ...(revelado ? esp : [])) * 1.15; const y = escala([0, ymax], [d.h - m.b, m.t]); const bw = Math.max(2, (x(1) - x(0)) * 0.7);
                const passoY = ymax > 40 ? 20 : ymax > 15 ? 5 : ymax > 8 ? 2 : 1;
                return (
                  <g>
                    <Eixos x={x} y={y} xt={Array.from({ length: maxK / 5 + 1 }, (_, i) => 5 * i)} yt={Array.from({ length: Math.floor(ymax / passoY) + 1 }, (_, i) => i * passoY)} fx={(v) => int(v)} fy={(v) => int(v)} xTit="defaults na amostra de 100" yTit="amostras" />
                    {cont.map((f, c) => f > 0 && <rect key={c} x={x(c) - bw / 2} y={y(f)} width={bw} height={y(0) - y(f)} fill={c === obs ? "#8C2332" : "#9DB3D6"} />)}
                    {revelado && <path className="q7-linha q7-linha--prob q7-linha--fina" d={esp.map((v, c) => `${c ? "L" : "M"}${x(c).toFixed(1)} ${y(v).toFixed(1)}`).join("")} />}
                    <line x1={x(100 * p)} x2={x(100 * p)} y1={y(0)} y2={y(ymax)} stroke="#176C73" strokeDasharray="6 5" strokeWidth={2} />
                    <text className="q7-rot--peq" x={x(100 * p) + d.fs * 0.4} y={y(ymax) + d.fs * 0.9} style={{ fill: "#176C73", fontWeight: 700 }}>esperado: {num(100 * p, 0)}</text>
                  </g>
                );
              }}
            </Grafico>
          )}
          {!sim && (
            <Grafico titulo="Frequência observada no grupo" sub="barra: intervalo de 95% (Wilson)" rotulo={`Frequência observada ${pct(PERTO_D / 100, 1)}, intervalo de ${pct(w.lo, 1)} a ${pct(w.hi, 1)}; PD média ${pct(PERTO_MEDIA, 1)}`} arCelular="4 / 3">
              {(d) => {
                const x = escala([0, 0.25], [d.fs * 1.2, d.w - d.fs * 1.2]); const cy = d.h * 0.48; const base = d.h - d.fs * 2.6;
                return (
                  <g>
                    {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((v) => <g key={v}><line className="q7-grade" x1={x(v)} x2={x(v)} y1={d.fs * 1.5} y2={base} /><text className="q7-tick" x={x(v)} y={base} dy="1.2em" textAnchor="middle">{pct(v, 0)}</text></g>)}
                    <text className="q7-eixo-t" x={x(0.125)} y={base} dy="2.5em" textAnchor="middle">frequência de default no grupo</text>
                    <line x1={x(w.lo)} x2={x(w.hi)} y1={cy} y2={cy} stroke="#8C2332" strokeWidth={d.fs * 0.5} strokeLinecap="round" opacity={0.35} />
                    <circle cx={x(PERTO_D / 100)} cy={cy} r={d.fs * 0.5} fill="#8C2332" stroke="#fff" strokeWidth={2} />
                    <text className="q7-rot" x={x(w.hi) + d.fs * 0.7} y={cy - d.fs * 0.15} style={{ fill: "#8C2332" }}>observado {pct(PERTO_D / 100, 1)}</text>
                    <text className="q7-rot--peq" x={x(w.hi) + d.fs * 0.7} y={cy + d.fs * 1.05} style={{ fill: "#5B6475" }}>{pct(w.lo, 1)} a {pct(w.hi, 1)}</text>
                    <line x1={x(PERTO_MEDIA)} x2={x(PERTO_MEDIA)} y1={d.fs * 1.5} y2={base} stroke="#176C73" strokeWidth={2.5} strokeDasharray="6 5" />
                    <text className="q7-rot--peq" x={x(PERTO_MEDIA) - d.fs * 0.4} y={d.fs * 1.2} textAnchor="end" style={{ fill: "#176C73", fontWeight: 700 }}>PD média {pct(PERTO_MEDIA, 1)}</text>
                  </g>
                );
              }}
            </Grafico>
          )}
        </div>
        <div className={`q7-kpis ${sim ? "q7-kpis--3" : "q7-kpis--2"}`}>
          <Kpi rotulo="Defaults esperados" valor={num(100 * (sim ? p : PERTO_MEDIA), 1)} detalhe="100 × PD" tom="prob" tam="mini" />
          <Kpi rotulo="Observados" valor={String(obs)} detalhe={sim ? `amostra ${k}` : "na janela"} tom="def" tam="mini" />
          {sim && <Kpi rotulo="Média das amostras" valor={num(mediaAm, 1)} detalhe={`${k} amostra${k > 1 ? "s" : ""}`} tam="mini" />}
        </div>
      </Painel>
      <Painel>
        <Seg rotulo="Origem" opcoes={[{ v: "simulacao" as Modo, r: "Simulação" }, { v: "janela" as Modo, r: "Na janela" }]} valor={modo} onChange={setModo} />
        {sim && <>
          <Controle rotulo="PD das 100 propostas" valor={p} min={0.02} max={0.3} passo={0.01} onChange={(v) => { setP(v); setK(1); }} mostrar={pct(p, 0)} escala={["2%", "30%"]} />
          <div className="q7-botoes"><Botao prim onClick={() => setK(Math.min(500, k + 1))}>Nova amostra</Botao><Botao onClick={() => setK(Math.min(500, k + 50))} desab={!revelado}>+50 amostras</Botao><Botao sec onClick={() => { setK(1); setP(P0); setEsc(null); }}>Restaurar</Botao></div>
        </>}
        {sim && <Previsao pergunta={`Em amostras de 100 propostas com PD de ${pct(P0, 0)}, quantos defaults saem?`} opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && k < 20) { setP(P0); setK(20); } }} recolher />}
        {!sim && <p className="q7-p">A PD média do grupo, {pct(PERTO_MEDIA, 1)}, cai dentro do intervalo da frequência observada: o grupo não desmente a PD. A largura desse intervalo é o assunto do slide 21.</p>}
        <Expandir resumo="Definição">
          <Formula f={String.raw`P(Y=1 \mid \mathrm{PD}=p) = p`} simbolos={[["Y", "1 se deu default em 12 meses"], ["p", "a PD atribuída ao grupo"]]} />
          <p className="q7-nota">Calibração é essa igualdade entre grupos de propostas com a mesma PD. Para uma proposta isolada, nenhum desfecho confirma ou desmente 10%.</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}
