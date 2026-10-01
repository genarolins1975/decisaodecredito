"use client";
import { useMemo, useState } from "react";
import { Botao, Controle, Eixos, escala, Expandir, Formula, Grafico, Kpi, Legenda, Painel, Quadro, Seg, margens, type Pagina } from "../base";
import { Pessoas } from "../pecas";
import { PL, Y } from "@/lib/capitulo7/dados";
import { mulberry32, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 17 · c7p9 · Uma PD de 10% fala de um grupo. Simulação: 100 propostas com a mesma PD p; cada amostra sorteia os
 * desfechos (semente 20261017 + número da amostra) e o gráfico acumula quantos defaults saíram em cada amostra, contra a
 * distribuição binomial exata. Na janela: as 100 propostas cuja PD da logística está mais perto de 10%.
 */
type Modo = "simulacao" | "janela";
const SEM = 20261017;
const amostra = (p: number, k: number) => { const r = mulberry32(SEM + k); return Array.from({ length: 100 }, () => r() < p); };
const binom = (n: number, p: number) => { const out: number[] = []; let lp = n * Math.log(1 - p); out.push(Math.exp(lp)); for (let k = 1; k <= n; k++) { lp += Math.log((n - k + 1) / k) + Math.log(p / (1 - p)); out.push(Math.exp(lp)); } return out; };
const PERTO = PL.map((p, i) => ({ i, d: Math.abs(p - 0.1) })).sort((a, b) => a.d - b.d || a.i - b.i).slice(0, 100).map((x) => x.i).sort((a, b) => a - b);
const PERTO_MEDIA = PERTO.reduce((s, i) => s + PL[i], 0) / 100, PERTO_D = PERTO.reduce((s, i) => s + Y[i], 0);
const PERTO_FAIXA = [Math.min(...PERTO.map((i) => PL[i])), Math.max(...PERTO.map((i) => PL[i]))];

export function S17PdColetiva({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("simulacao");
  const [p, setP] = useState(0.1);
  const [k, setK] = useState(1);
  const atual = useMemo(() => amostra(p, k - 1), [p, k]);
  const contagens = useMemo(() => Array.from({ length: k }, (_, j) => amostra(p, j).filter(Boolean).length), [p, k]);
  const teor = useMemo(() => binom(100, p), [p]);
  const sim = modo === "simulacao";
  const obs = sim ? atual.filter(Boolean).length : PERTO_D;
  const w = wilson(PERTO_D, 100)!;
  const maxK = Math.max(20, Math.ceil(p * 100 + 4 * Math.sqrt(100 * p * (1 - p))));
  return (
    <Quadro slug="c7p9" pagina={pagina} layout="gl"
      conclusao={sim ? <>PD de {pct(p, 0)} em 100 propostas: <b>espera-se {num(100 * p, 0)} defaults</b>; nesta amostra saíram {obs}. Uma PD não promete um número exato: promete a frequência média, com variação de amostra para amostra.</>
        : <>As 100 propostas com PD perto de 10% (de {pct(PERTO_FAIXA[0], 1)} a {pct(PERTO_FAIXA[1], 1)}, média {pct(PERTO_MEDIA, 1)}) tiveram <b>{PERTO_D} defaults</b>. Intervalo de 95% para a frequência: {pct(w.lo, 1)} a {pct(w.hi, 1)}.</>}
      fonte={sim ? `Simulação: 100 propostas independentes com a mesma PD; amostra n usa a semente ${SEM} + n. Curva: probabilidade binomial exata de cada contagem.` : "Janela fora do tempo: as 100 propostas cuja PD da logística está mais perto de 10%; desfecho observado em 12 meses."}>
      <Painel titulo={sim ? `Amostra ${k}: 100 propostas com PD de ${pct(p, 0)}` : "Na janela: 100 propostas com PD perto de 10%"}>
        <div className="q7-s17">
          <div className="q7-s17-pes">
            <Pessoas n={100} d={obs} esperados={100 * (sim ? p : PERTO_MEDIA)} rotulo={`${obs} defaults entre 100 propostas; a PD esperava ${num(100 * (sim ? p : PERTO_MEDIA), 1)}`} />
            <Legenda itens={[{ mk: "def", r: "deu default" }, { mk: "adi", r: "pagou" }, { mk: "", r: "contorno verde: quantos a PD esperava" }]} />
          </div>
          {sim && (
            <Grafico titulo="Defaults por amostra" sub={`${k} amostra${k > 1 ? "s" : ""}; curva: binomial esperada`} rotulo={`Distribuição dos defaults em ${k} amostras, contra a binomial com PD ${pct(p, 0)}`} arCelular="4 / 3">
              {(d) => {
                const m = margens(d.fs, { l: 2.6, b: 2.8, t: 1, r: 0.8 });
                const x = escala([0, maxK], [m.l, d.w - m.r]); const cont = Array.from({ length: maxK + 1 }, (_, c) => contagens.filter((v) => v === c).length);
                const esp = teor.slice(0, maxK + 1).map((v) => v * k); const ymax = Math.max(5, ...cont, ...esp) * 1.15; const y = escala([0, ymax], [d.h - m.b, m.t]); const bw = Math.max(2, (x(1) - x(0)) * 0.7);
                const passoY = ymax > 40 ? 20 : ymax > 15 ? 5 : ymax > 8 ? 2 : 1;
                return (
                  <g>
                    <Eixos x={x} y={y} xt={Array.from({ length: 5 }, (_, i) => Math.round((i * maxK) / 4))} yt={Array.from({ length: Math.floor(ymax / passoY) + 1 }, (_, i) => i * passoY)} fx={(v) => int(v)} fy={(v) => int(v)} xTit="defaults na amostra de 100" yTit="amostras" />
                    {cont.map((f, c) => f > 0 && <rect key={c} x={x(c) - bw / 2} y={y(f)} width={bw} height={y(0) - y(f)} fill={c === obs ? "#8C2332" : "#9DB3D6"} />)}
                    <path className="q7-linha q7-linha--prob q7-linha--fina" d={esp.map((v, c) => `${c ? "L" : "M"}${x(c).toFixed(1)} ${y(v).toFixed(1)}`).join("")} />
                    <line x1={x(100 * p)} x2={x(100 * p)} y1={y(0)} y2={y(ymax)} stroke="#176C73" strokeDasharray="6 5" strokeWidth={2} />
                  </g>
                );
              }}
            </Grafico>
          )}
        </div>
      </Painel>
      <Painel>
        <Seg rotulo="Origem" opcoes={[{ v: "simulacao" as Modo, r: "Simulação" }, { v: "janela" as Modo, r: "Na janela" }]} valor={modo} onChange={setModo} />
        {sim && <>
          <Controle rotulo="PD das 100 propostas" valor={p} min={0.02} max={0.3} passo={0.01} onChange={(v) => { setP(v); setK(1); }} mostrar={pct(p, 0)} escala={["2%", "30%"]} />
          <div className="q7-botoes"><Botao prim onClick={() => setK(Math.min(500, k + 1))}>Nova amostra</Botao><Botao onClick={() => setK(Math.min(500, k + 50))}>+50 amostras</Botao><Botao sec onClick={() => { setK(1); setP(0.1); }}>Restaurar</Botao></div>
        </>}
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Defaults esperados" valor={num(100 * (sim ? p : PERTO_MEDIA), 1)} detalhe="100 × PD média" tom="prob" />
          <Kpi rotulo="Defaults observados" valor={String(obs)} detalhe={sim ? `amostra ${k}` : "na janela"} tom="def" />
        </div>
        <Expandir resumo="Definição">
          <Formula f={String.raw`P(Y=1 \mid \mathrm{PD}=p) = p`} simbolos={[["Y", "1 se deu default em 12 meses"], ["p", "a PD atribuída ao grupo"]]} />
          <p className="q7-nota">Calibração é essa igualdade entre grupos de propostas com a mesma PD. Para uma proposta isolada, nenhum desfecho confirma ou desmente 10%.</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}
