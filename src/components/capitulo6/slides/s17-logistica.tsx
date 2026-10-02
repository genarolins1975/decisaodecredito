"use client";
import { useState } from "react";
import { Botao, caminho, Controle, escala, Expandir, Grafico, LinkSlide, Painel, Previsao, Quadro, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, LOGISTICA, modelo, NA, NV, XA, XV, YA, YV } from "@/lib/capitulo6/dados";
import { auc, estagios, perdaLog, type No } from "@/lib/capitulo6/gbm";
import { escoreLogistica } from "@/lib/capitulo6/logistica";
import { delong } from "@/lib/capitulo7/metricas";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 17 · c6p17 · A logística nas mesmas três variáveis (LOGISTICA de dados.ts, ajustada nas 1.472 propostas de ajuste)
 * como referência do boosting da carteira (CFG_CARTEIRA). O gráfico mostra AUC e log loss por número de árvores, no
 * ajuste e na validação, com as duas linhas da logística; a validação fica escondida até a previsão. Tudo sai da
 * biblioteca: estágios do boosting (conferidos com staged_decision_function), logística (conferida com o statsmodels),
 * AUC de Mann e Whitney e IC de DeLong da diferença pareada. A frase "em nenhum número de árvores" é calculada: o
 * máximo da AUC de validação do boosting e o mínimo da log loss de validação são comparados com os da logística. A
 * janela fora do tempo não aparece: fica fechada até o capítulo 7.
 */
function calcular() {
  const M = modelo(CFG_CARTEIRA);
  const EA = estagios(M, XA), EV = estagios(M, XV);
  const K_MAX = M.arvores.length;
  const AUC_A = EA.map((F) => auc(YA, F)), AUC_V = EV.map((F) => auc(YV, F));
  const LL_A = EA.map((F) => perdaLog(F, YA)), LL_V = EV.map((F) => perdaLog(F, YV));
  const argmin = (v: number[], de = 0) => v.reduce((k, x, i) => (i >= de && x < v[k] ? i : k), de);
  const argmax = (v: number[], de = 0) => v.reduce((k, x, i) => (i >= de && x > v[k] ? i : k), de);
  const K_PARADA = argmin(LL_V, 1);
  const K_PICO = argmax(AUC_V, 1);
  const ZA = XA.map((x) => escoreLogistica(LOGISTICA, x)), ZV = XV.map((x) => escoreLogistica(LOGISTICA, x));
  const LOG = { aucA: auc(YA, ZA), aucV: auc(YV, ZV), llA: perdaLog(ZA, YA), llV: perdaLog(ZV, YV) };
  const DL = delong(YV, ZV, EV[K_PARADA]);
  const NUNCA = AUC_V[K_PICO] < LOG.aucV && LL_V[K_PARADA] > LOG.llV;
  const K_PASSA = AUC_A.findIndex((a, i) => i > 0 && a > LOG.aucA);
  const DA = YA.reduce((s, v) => s + v, 0), DV = YV.reduce((s, v) => s + v, 0);
  const usa = (no: No, v: number): boolean => !no.folha && (no.variavel === v || usa(no.esq, v) || usa(no.dir, v));
  const USA_ATRASO = M.arvores.slice(0, K_PARADA).some((a) => usa(a, 1));

  const OPS = [
    { texto: "Sim, com árvores suficientes", certa: false, retorno: <>Confunde ajuste com validação: com {K_MAX} árvores, a AUC de validação do boosting cai a {num(AUC_V[K_MAX], 4)}, contra {num(LOG.aucV, 4)} da logística.</> },
    { texto: `Sim, parado em ${K_PARADA} árvores`, certa: false, retorno: <>O melhor boosting não é o melhor modelo: parado em {K_PARADA} árvores, AUC {num(AUC_V[K_PARADA], 4)} e log loss {num(LL_V[K_PARADA], 4)}, as duas piores que as da logística.</> },
    { texto: NUNCA ? "Não, em nenhum número de árvores" : "Só em parte das métricas", certa: true, retorno: <>Isso: o pico de AUC do boosting na validação é {num(AUC_V[K_PICO], 4)} ({K_PICO} árvores) e a menor log loss, {num(LL_V[K_PARADA], 4)} ({K_PARADA}).</> },
  ];
  return { M, EA, EV, K_MAX, AUC_A, AUC_V, LL_A, LL_V, argmin, argmax, K_PARADA, K_PICO, ZA, ZV, LOG, DL, NUNCA, K_PASSA, DA, DV, usa, USA_ATRASO, OPS };
}
let CACHE: ReturnType<typeof calcular> | null = null;
/** Cálculo preguiçoso: só o slide visitado paga o ajuste dos modelos (o registro importa todos os quadros). */
const dados = () => (CACHE ??= calcular());

const lk = (k: number) => Math.log(k);
function Painel2({ d, k, revelado }: { d: Dim; k: number; revelado: boolean }) {
  const { K_MAX, AUC_A, AUC_V, LL_A, LL_V, K_PARADA, LOG } = dados();
  const fs = d.fs, m = { l: fs * 3.6, r: fs * 9.2, t: fs * 1.3, b: fs * 2.7 }, gap = fs * 2.2;
  const hh = (d.h - m.t - m.b - gap) / 2;
  const x = escala([lk(1), lk(K_MAX)], [m.l, d.w - m.r]);
  const ks = Array.from({ length: K_MAX }, (_, i) => i + 1);
  const ticks = [1, 3, 10, 30, 100, 300].filter((t) => t <= K_MAX);
  const blocos = [
    { tit: "AUC (maior é melhor)", a: AUC_A, v: AUC_V, la: LOG.aucA, lv: LOG.aucV, top: m.t, casas: 2, fmt: (t: number) => num(t, 2) },
    { tit: "Log loss (menor é melhor)", a: LL_A, v: LL_V, la: LOG.llA, lv: LOG.llV, top: m.t + hh + gap, casas: 3, fmt: (t: number) => num(t, 2) },
  ];
  // a linha da parada vem primeiro: rótulos e curvas passam por cima dela
  return (
    <g>
      <line x1={x(lk(K_PARADA))} x2={x(lk(K_PARADA))} y1={m.t - fs * 0.2} y2={d.h - m.b} stroke="#00205B" strokeWidth={1.5} strokeDasharray="3 4" />
      {blocos.map((b, bi) => {
        const vals = [...b.a.slice(1), ...b.v.slice(1), b.la, b.lv];
        const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.08;
        const y = escala([lo - pad, hi + pad], [b.top + hh, b.top]);
        const passo = (hi - lo) > 0.2 ? 0.1 : 0.02;
        const yt: number[] = []; for (let t = Math.ceil((lo - pad) / passo) * passo; t <= hi + pad; t += passo) yt.push(Math.round(t * 1000) / 1000);
        const pa = ks.map((kk) => ({ x: x(lk(kk)), y: y(b.a[kk]) })), pv = ks.map((kk) => ({ x: x(lk(kk)), y: y(b.v[kk]) }));
        const xe = d.w - m.r + fs * 0.4;
        const rot = [
          { y: y(b.a[K_MAX]), t: "boosting, ajuste", c: "#5B6475" },
          { y: y(b.la), t: "logística, ajuste", c: "#5B6475" },
          ...(revelado ? [{ y: y(b.v[K_MAX]), t: "boosting, validação", c: "#2E6B4F" }, { y: y(b.lv), t: "logística, validação", c: "#2E6B4F" }] : []),
        ].sort((p, q) => p.y - q.y);
        for (let i = 1; i < rot.length; i++) if (rot[i].y - rot[i - 1].y < fs * 0.95) rot[i].y = rot[i - 1].y + fs * 0.95;
        return (
          <g key={bi}>
            <text className="q7-eixo-t" x={m.l} y={b.top} dy="-.5em">{b.tit}</text>
            {yt.map((t) => <g key={t}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(t)} y2={y(t)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(t)} dy=".34em" textAnchor="end">{b.fmt(t)}</text></g>)}
            <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={b.top + hh} y2={b.top + hh} />
            {bi === 1 && ticks.map((t) => <text key={t} className="q7-tick" x={x(lk(t))} y={b.top + hh} dy="1.25em" textAnchor="middle">{t}</text>)}
            <line x1={m.l} x2={d.w - m.r} y1={y(b.la)} y2={y(b.la)} stroke="#5B6475" strokeWidth={2} strokeDasharray="8 6" />
            <path className="q7-linha q7-linha--mudo q7-linha--fina" d={caminho(pa)} />
            {revelado && <>
              <line x1={m.l} x2={d.w - m.r} y1={y(b.lv)} y2={y(b.lv)} stroke="#2E6B4F" strokeWidth={3} strokeDasharray="10 6" />
              <path className="q7-linha q7-linha--val" d={caminho(pv)} />
              <circle cx={x(lk(k))} cy={y(b.v[k])} r={fs * 0.42} fill="#2E6B4F" stroke="#fff" strokeWidth={2} />
            </>}
            {!revelado && (() => {
              // rótulo com fundo próprio, à direita da linha da parada: nada o atravessa
              const t = "validação: abre depois da previsão", w = t.length * fs * 0.86 * 0.56 + fs, xc = Math.min(d.w - m.r - w / 2, x(lk(K_PARADA)) + fs * 0.8 + w / 2), yc = b.top + hh * (bi ? 0.25 : 0.82);
              return <g><rect x={xc - w / 2} y={yc - fs * 0.85} width={w} height={fs * 1.3} rx={fs * 0.3} fill="#fff" stroke="#2E6B4F" strokeOpacity={0.35} /><text className="q7-rot--peq" x={xc} y={yc} textAnchor="middle" style={{ fill: "#2E6B4F", fontWeight: 700 }}>{t}</text></g>;
            })()}
            <rect x={x(lk(k)) - fs * 0.32} y={y(b.a[k]) - fs * 0.32} width={fs * 0.64} height={fs * 0.64} fill="#fff" stroke="#5B6475" strokeWidth={2.5} />
            {rot.map((r) => <text key={r.t} className="q7-rot--peq" x={xe} y={r.y} dy=".35em" style={{ fill: r.c, fontWeight: 600 }}>{r.t}</text>)}
          </g>
        );
      })}
      <text className="q7-rot--peq" x={x(lk(K_PARADA)) + fs * 0.3} y={m.t + hh + gap * 0.62} style={{ fill: "#00205B", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.35em", strokeLinejoin: "round" }}>parada: {K_PARADA} árvores</text>
      <text className="q7-eixo-t" x={(m.l + d.w - m.r) / 2} y={d.h - m.b} dy="2.5em" textAnchor="middle">Número de árvores (escala logarítmica)</text>
    </g>
  );
}

export function S17Logistica({ pagina }: { pagina?: Pagina }) {
  const { K_MAX, AUC_A, AUC_V, LL_V, K_PARADA, LOG, DL, K_PASSA, DA, DV, USA_ATRASO, OPS } = dados();
  const [esc, setEsc] = useState<number | null>(null);
  const [k, setK] = useState(K_PARADA);
  const revelado = esc !== null && OPS[esc].certa === true;
  const restaurar = () => { setEsc(null); setK(K_PARADA); };
  return (
    <Quadro slug="c6p17" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Com três variáveis, quem valida melhor: a logística ou o boosting?"}
      sub={revelado ? undefined : <>Os dois modelos com as mesmas {int(NA)} propostas de ajuste e {int(NV)} de validação.</>}
      conclusao={!revelado
        ? <>No ajuste, o boosting passa a AUC da logística ({num(LOG.aucA, 4)}) já com {K_PASSA} árvores e chega a {num(AUC_A[K_MAX], 4)} com {K_MAX}. E na validação? Preveja ao lado.</>
        : <>Validação: logística com AUC <b>{num(LOG.aucV, 4)}</b> e log loss <b>{num(LOG.llV, 4)}</b>; boosting parado em {K_PARADA} árvores, {num(AUC_V[K_PARADA], 4)} e {num(LL_V[K_PARADA], 4)}. A diferença de AUC, {num(DL.dif, 3)} (IC de 95% de {num(DL.ic[0], 3)} a {num(DL.ic[1], 3)}), {DL.ic[0] > 0 ? "não é ruído" : "cabe no ruído"}. Com {DA} defaults no ajuste, a amostra não mostra interação nem forma que o boosting aproveite, e a referência linear vence; o <LinkSlide slug="c6p18">slide 18</LinkSlide> confere o nível das PDs do boosting.</>}
      fonte={`Ajuste: ${int(NA)} propostas, ${DA} defaults; validação sorteada: ${int(NV)}, ${DV} defaults. Boosting: taxa ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo de ${CFG_CARTEIRA.minFolha} por folha; parada em ${K_PARADA} escolhida nesta validação. IC de DeLong pareado.`}>
      <Painel titulo="AUC e log loss por número de árvores; a logística é uma reta">
        <Grafico rotulo={`AUC e log loss do boosting por número de árvores, no ajuste e na validação, contra a logística. Logística na validação: AUC ${num(LOG.aucV, 4)}, log loss ${num(LOG.llV, 4)}; boosting parado em ${K_PARADA} árvores: ${num(AUC_V[K_PARADA], 4)} e ${num(LL_V[K_PARADA], 4)}`} arCelular="4 / 5">
          {(d) => <Painel2 d={d} k={k} revelado={revelado} />}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de revelar" pergunta="Na validação, em algum número de árvores o boosting supera a logística?" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q6-rola"><table className="q7-tab q6-s17-tab">
          <thead><tr><th className="q7-t-l">Modelo</th><th>AUC ajuste</th><th>AUC valid.</th><th>Log loss valid.</th></tr></thead>
          <tbody>
            <tr><th>Logística</th><td>{num(LOG.aucA, 4)}</td><td className="q6-val">{revelado ? num(LOG.aucV, 4) : "?"}</td><td className="q6-val">{revelado ? num(LOG.llV, 4) : "?"}</td></tr>
            <tr data-on="1"><th>Boosting, {k} {k === 1 ? "árvore" : "árvores"}</th><td>{num(AUC_A[k], 4)}</td><td className="q6-val">{revelado ? num(AUC_V[k], 4) : "?"}</td><td className="q6-val">{revelado ? num(LL_V[k], 4) : "?"}</td></tr>
          </tbody>
        </table></div>
        <div className="q6-s17-ctl">
          <Controle rotulo="Árvores do boosting" valor={k} min={1} max={K_MAX} passo={1} onChange={setK} mostrar={`${k}`} />
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
        {revelado && <Expandir resumo="Quando o boosting ganharia">
          <p className="q7-nota">Quando o risco tem interação (o efeito do atraso depende do score) ou forma curva que a reta na log odds não captura: as árvores aprendem essas formas por construção (Friedman, 2001). Como resultado empírico, num benchmark com várias bases de crédito, conjuntos de modelos, entre eles os de árvores, superaram a logística na média (Lessmann et al., 2015). Aqui, parado em {K_PARADA} árvores, ele {USA_ATRASO ? "corta pouco no atraso" : "nem corta no atraso"}: só troca a reta por degraus estimados com {DA} defaults.</p>
        </Expandir>}
      </Painel>
    </Quadro>
  );
}
