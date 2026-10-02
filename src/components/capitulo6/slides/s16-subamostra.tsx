"use client";
import { useEffect, useState } from "react";
import { Botao, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { SLIDE } from "@/lib/capitulo6/roteiro";
import { estagios, ganhoMedioPareado, perdaLog, quantilT } from "@/lib/capitulo6/gbm";
import { int, num, pct, sinal } from "@/lib/capitulo7/formato";

/**
 * 17 · c6p16 · Subamostra (boosting estocástico; o método é de Friedman, 2002): cada árvore é ajustada numa fração das
 * 1.472 propostas, sorteada sem reposição com semente (opções subamostra e semente de gbm.ts), dez sementes por fração.
 * A peça principal é um gráfico de pontos do ganho de log loss de cada semente sobre o modelo sem sorteio, em dois
 * pontos: na parada do modelo sem sorteio (o mínimo da curva do slide 16, um ponto fixo para todas as sementes) e com
 * 200 árvores, longe dela. A ideia: com 50%, o ganho é consistente entre sementes nas duas filas e cabe na faixa da
 * validação nas duas; a diferença entre as filas é de tamanho (a razão é calculada), não de veredito. Título, subtítulo,
 * retornos e leitura acompanham a fração escolhida. Duas faixas de 95%, com o mesmo nome em gráfico, tabela e leitura:
 *   entre sementes   média das dez ± t de 9 graus × desvio padrão ÷ √10 (quantilT de gbm.ts): o sorteio ajuda de forma
 *                    consistente nesta validação? (variação do ajuste);
 *   da validação     0 ± t de n − 1 graus × erro padrão de dᵢ = perdaᵢ(sem sorteio) − média das perdasᵢ das dez sementes,
 *                    proposta a proposta (ganhoMedioPareado de gbm.ts): o que 631 propostas distinguem (variação da
 *                    amostra). z = ganho ÷ esse erro padrão; o ganho cabe na faixa quando |z| fica abaixo do t.
 * A parada também foi escolhida nesta validação, pelo modelo sem sorteio: favorece o sem sorteio (declarado na fonte).
 * Sortear não muda a decisão tomada na parada: a frase final só vale quando a fila da parada cabe na faixa da validação.
 * As sementes são calculadas uma por vez, depois da pintura, para não travar o quadro, e ficam memorizadas. Toda frase
 * comparativa e a alternativa certa são calculadas aqui.
 */
const T = 200, SEMENTES = Array.from({ length: 10 }, (_, k) => k + 1);
const FRACS = [0.8, 0.5, 0.3];
const DV = YV.reduce((s, v) => s + v, 0);
const TS = quantilT(0.975, SEMENTES.length - 1), TV = quantilT(0.975, NV - 1);
const media = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const dp = (v: number[]) => { const m = media(v); return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)); };

type Sem = { Fk: number[]; FT: number[]; Lk: number; LT: number };
let CHEIA: { E: number[][]; L: number[]; k0: number } | null = null;
const cheia = () => {
  if (CHEIA) return CHEIA;
  const E = estagios(modelo(CFG_CARTEIRA), XV).slice(0, T + 1); const L = E.map((F) => perdaLog(F, YV));
  const k0 = L.reduce((k, x, i) => (i >= 1 && x < L[k] ? i : k), 1);
  return (CHEIA = { E, L, k0 });
};
const CACHE = new Map<number, Sem[]>();
function semente(f: number, s: number): Sem {
  const { k0 } = cheia();
  const E = estagios(modelo({ ...CFG_CARTEIRA, arvores: T, subamostra: f, semente: s }), XV);
  return { Fk: E[k0], FT: E[T], Lk: perdaLog(E[k0], YV), LT: perdaLog(E[T], YV) };
}

/** Uma fila do gráfico: ganho de cada semente, média com a faixa entre sementes e o erro padrão da validação. */
type Fila = { tit: string; g: number[]; m: number; se: number; ev: number; z: number; ganham: number };
function fila(tit: string, ref: number, Fref: number[], ss: Sem[], L: (s: Sem) => number, F: (s: Sem) => number[]): Fila {
  const g = ss.map((s) => ref - L(s)); const ev = ganhoMedioPareado(Fref, ss.map(F), YV).ep, m = media(g);
  return { tit, g, m, se: dp(g) / Math.sqrt(g.length), ev, z: m / ev, ganham: g.filter((v) => v > 0).length };
}
/** Veredito da validação: |z| abaixo do t de 630 graus cabe na faixa de 95%; perto dele (90% ou mais), no limite. */
const cabe = (q: Fila) => Math.abs(q.z) < TV;
/** Faixa de 95% entre sementes da média de dez. */
const faixaS = (q: Fila): [number, number] => [q.m - TS * q.se, q.m + TS * q.se];
/** Sinal entre sementes: ganho, nulo ou piora, pela faixa de 95% da média. */
const sinalS = (q: Fila) => (faixaS(q)[0] > 0 ? "ganho" : faixaS(q)[1] < 0 ? "piora" : "nulo");
/** "Por pouco": a faixa entre sementes fica do lado do ganho, mas o limite perto do zero está a menos de um décimo da média. */
const porPouco = (q: Fila) => sinalS(q) !== "nulo" && Math.abs(q.m > 0 ? faixaS(q)[0] : faixaS(q)[1]) < 0.1 * Math.abs(q.m);
const deAte = (q: Fila) => `de ${sinal(faixaS(q)[0], 4)} a ${sinal(faixaS(q)[1], 4)}`;
/** Título revelado, calculado para a fração: o que a régua diz nas duas filas, sem contraste que ela não mostre. */
function tituloRevelado(f: number, a: Fila, b: Fila) {
  const pre = f === 0.5 ? "Sortear metade" : `Sortear ${pct(f, 0)}`;
  const nome = { ganho: "ganho consistente", nulo: "sem sinal consistente", piora: "piora consistente" } as const;
  const sa = sinalS(a), sb = sinalS(b);
  const meio = sa === sb ? nome[sa]
    : sa === "nulo" ? `${sb === "ganho" ? "ganho" : "piora"} só longe da parada`
    : sa === "piora" && sb === "ganho" ? "piora na parada e ganho longe dela"
    : `na parada, ${nome[sa]}; longe dela, ${nome[sb]}`;
  const val = cabe(a) && cabe(b) ? (sa === sb ? "dentro do erro da validação" : "dentro do erro da validação nas duas filas") : !cabe(a) && !cabe(b) ? "além do erro da validação" : cabe(a) ? "além do erro só longe da parada" : "além do erro só na parada";
  return `${pre}: ${meio}, ${val}`;
}
/** Subtítulo revelado: o tamanho relativo das filas (razão calculada) e a origem do método. */
function subRevelado(f: number, a: Fila, b: Fila) {
  const lim = cabe(b) ? (Math.abs(b.z) >= 0.9 * TV ? "chega ao limite da faixa" : "cabe na faixa") : "passa da faixa";
  const frase = sinalS(a) === "ganho" && !porPouco(a) && sinalS(b) === "ganho" && b.m > a.m
    ? `Longe da parada, ganho cerca de ${int(Math.round(b.m / a.m))} vezes maior, que ${lim}`
    : `Na parada, ${sinal(a.m, 4)}; com ${T} árvores, ${sinal(b.m, 4)}, que ${lim}`;
  return `${frase}. Método de Friedman (2002); resultado desta amostra.`;
}
/** Frase de conclusão da leitura: o que o aluno leva para a decisão na parada. */
function conclusaoParada(f: number, a: Fila) {
  if (!cabe(a)) return a.m > 0 ? <>Aqui a validação distingue o ganho do acaso: sortear muda a decisão tomada na parada.</> : <>Aqui a validação distingue a piora do acaso: com {pct(f, 0)}, não sortear.</>;
  const s = sinalS(a);
  if (s === "ganho") return <><b>Nesta carteira, sortear não muda a decisão tomada na parada</b>: o ganho se repete nas sementes{porPouco(a) ? ", por pouco" : ""}, mas fica dentro do erro da validação de {int(NV)} propostas; é um controle barato, não uma prova.</>;
  if (s === "nulo") return <><b>Nesta carteira, sortear não muda a decisão tomada na parada</b>: ali o ganho não se repete de forma consistente ({a.ganham} de {a.g.length} sementes; {deAte(a)}); é um controle barato, não uma prova.</>;
  return <><b>Com {pct(f, 0)}, sortear piora a parada em {a.g.length - a.ganham} de {a.g.length} sementes</b>, ainda dentro do erro da validação: a fração também se escolhe na validação, não se presume.</>;
}

function Pontos({ d, filas, revelado }: { d: Dim; filas: Fila[]; revelado: boolean }) {
  const fs = d.fs, m = { l: fs * 0.6, r: fs * 0.8, t: fs * 0.2, b: fs * 3.1 };
  const vals = filas.flatMap((f, i) => [TV * f.ev, -TV * f.ev, ...(revelado || i > 0 ? [...f.g, f.m + TS * f.se, f.m - TS * f.se] : [])]);
  const lo0 = Math.min(...vals), hi0 = Math.max(...vals), pad = (hi0 - lo0) * 0.05;
  const passo = hi0 - lo0 > 0.03 ? 0.01 : 0.005;
  const x = escala([lo0 - pad, hi0 + pad], [m.l, d.w - m.r]);
  const xt: number[] = []; for (let t = Math.ceil((lo0 - pad) / passo) * passo; t <= hi0 + pad + 1e-12; t += passo) xt.push(Math.round(t * 1000) / 1000);
  const alt = (d.h - m.t - m.b) / filas.length, r = fs * 0.34, larg = (t: string, k = 1) => t.length * fs * 0.53 * k;
  // no celular o gráfico tem cerca de 30 letras de largura: rótulos curtos para nada passar da borda
  const estreito = d.w < fs * 36;
  return (
    <g>
      {xt.map((t) => <g key={t}><line className="q7-grade" x1={x(t)} x2={x(t)} y1={m.t} y2={d.h - m.b} /><text className="q7-tick" x={x(t)} y={d.h - m.b} dy="1.25em" textAnchor="middle" style={t === 0 ? { fontWeight: 700, fill: "#5B6475" } : undefined}>{t === 0 ? (estreito ? "0" : "0: sem sorteio") : sinal(t, 3)}</text></g>)}
      <text className="q7-eixo-t" x={(m.l + d.w - m.r) / 2} y={d.h - m.b} dy="2.55em" textAnchor="middle">{estreito ? "Ganho sobre o sem sorteio (0); à direita, ajuda" : "Ganho de log loss sobre o modelo sem sorteio (à direita, o sorteio ajuda)"}</text>
      {filas.map((f, i) => {
        const y0 = m.t + alt * i, ver = revelado || i > 0;
        const topo = y0 + fs * 1.75, base = y0 + alt - fs * 0.4, cyM = base - fs * 0.85, cyD = (topo + cyM - fs * 0.8) / 2;
        // pontos sem sobreposição: cada semente vai ao nível vertical mais próximo do centro em que não toca as vizinhas,
        // dentro da faixa entre o título da fila e a barra da média; sem nível livre, fica no centro (a transparência mostra)
        const nmax = Math.max(0, Math.floor((cyD - topo - r) / (r * 2.15)));
        const ord = f.g.map((v, k) => ({ v, k })).sort((a, b) => a.v - b.v); const pos: { x: number; y: number }[] = [];
        for (const o of ord) { const px = x(o.v); let py = cyD; for (let n = 0; n <= 2 * nmax; n++) { const nv = n === 0 ? 0 : (n % 2 ? -1 : 1) * Math.ceil(n / 2); const qy = cyD + nv * r * 2.15; if (pos.every((p) => Math.hypot(p.x - px, p.y - qy) > r * 2.1)) { py = qy; break; } } pos.push({ x: px, y: py }); }
        const bx0 = x(-TV * f.ev), bx1 = x(TV * f.ev), xm = x(f.m), ws = Math.max(1.5, x(f.m + TS * f.se) - xm);
        const rot = `média ${sinal(f.m, 4)}`, cabeDir = xm + ws + fs * 0.6 + larg(rot) < d.w - m.r;
        return (
          <g key={f.tit}>
            {i > 0 && <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y0} y2={y0} />}
            <rect x={bx0} y={topo} width={bx1 - bx0} height={base - topo} rx={fs * 0.3} fill="#9AA1AD" fillOpacity={0.2} />
            <line x1={x(0)} x2={x(0)} y1={topo} y2={base} stroke="#5B6475" strokeWidth={2} strokeDasharray="6 4" />
            <text className="q7-rot" x={m.l} y={y0} dy="1.2em" style={{ fill: "#00205B", fontWeight: 700 }}>{estreito ? f.tit.split(",")[0] : f.tit}<tspan style={{ fill: "#5B6475", fontWeight: 500 }}>{estreito ? ` · ±${num(TV * f.ev, 4)}` : ` · faixa de 95% da validação ±${num(TV * f.ev, 4)}`}</tspan></text>
            {!ver && <text className="q7-rot" x={x(0)} y={(topo + base) / 2} dy=".35em" textAnchor="middle" style={{ fill: "#2E6B4F", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.35em", strokeLinejoin: "round" }}>sementes: abrem depois da previsão</text>}
            {ver && <>
              {pos.map((p, k) => <circle key={k} cx={p.x} cy={p.y} r={r} fill="#2E6B4F" fillOpacity={0.6} stroke="#fff" strokeWidth={1.2} />)}
              <line x1={xm - ws} x2={xm + ws} y1={cyM} y2={cyM} stroke="#1F5A40" strokeWidth={Math.max(3, fs * 0.16)} />
              {[xm - ws, xm + ws].map((xx, k) => <line key={k} x1={xx} x2={xx} y1={cyM - fs * 0.4} y2={cyM + fs * 0.4} stroke="#1F5A40" strokeWidth={2.5} />)}
              <path d={`M${xm} ${cyM - fs * 0.6}l${fs * 0.5} ${fs * 0.6}l${-fs * 0.5} ${fs * 0.6}l${-fs * 0.5} ${-fs * 0.6}Z`} fill="#1F5A40" stroke="#fff" strokeWidth={1.5} />
              <text className="q7-rot" x={cabeDir ? xm + ws + fs * 0.6 : xm - ws - fs * 0.6} y={cyM} dy=".35em" textAnchor={cabeDir ? "start" : "end"} style={{ fill: "#1F5A40", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{rot}</text>
            </>}
          </g>
        );
      })}
    </g>
  );
}

export function S16Subamostra({ pagina }: { pagina?: Pagina }) {
  const [c0] = useState(cheia);
  const [f, setF] = useState(0.5);
  const [esc, setEsc] = useState<number | null>(null);
  const [, setVersao] = useState(0);
  const ss = CACHE.get(f) ?? [];
  const pronto = ss.length === SEMENTES.length;
  // uma semente por vez, depois da pintura: o quadro responde enquanto as sementes chegam
  useEffect(() => {
    if (pronto) return;
    const id = window.setTimeout(() => { const lista = CACHE.get(f) ?? []; if (lista.length < SEMENTES.length) { lista.push(semente(f, SEMENTES[lista.length])); CACHE.set(f, lista); } setVersao((v) => v + 1); }, 30);
    return () => window.clearTimeout(id);
  }, [f, pronto, ss.length]);
  const { E, L, k0 } = c0;
  const NS = SEMENTES.length;
  const filasDe = (lista: Sem[]): Fila[] => [
    fila(`Parado em ${k0} árvores, a parada sem sorteio`, L[k0], E[k0], lista, (s) => s.Lk, (s) => s.Fk),
    fila(`Com ${T} árvores, longe da parada`, L[T], E[T], lista, (s) => s.LT, (s) => s.FT),
  ];
  const filas = pronto ? filasDe(ss) : null;
  // a previsão é sempre sobre 50% na parada; trocar a fração depois não muda a alternativa certa
  const s50 = CACHE.get(0.5) ?? [], p50 = s50.length === NS;
  const P = p50 ? filasDe(s50) : null, F50 = P ? P[0] : null;
  const folga = F50 ? !cabe(F50) && F50.m > 0 : false, consistente = F50 ? F50.m - TS * F50.se > 0 : true;
  const b50 = P ? P[1] : null;
  const a = filas?.[0], b = filas?.[1];
  const ops = [
    { texto: "Melhora com folga: o ganho passa da faixa da validação", certa: folga, retorno: folga ? <>Isso: com {pct(0.5, 0)}, z = ganho ÷ erro padrão passa de {num(TV, 2)}, a faixa de 95% da validação.</>
      : b50 && cabe(b50) ? <>Confunde ganho que se repete nas sementes com ganho que a validação distingue: nem com {T} árvores, em que {b50.ganham} de {NS} sementes ganham, o ganho passa da faixa (z = {num(b50.z, 2)}, abaixo de {num(TV, 2)}); na parada, o modelo ainda não decorou e há menos a frear.</>
      : <>Confunde o que acontece longe da parada com a parada: com muitas árvores, o modelo sem sorteio já decorou, e o sorteio tem o que frear (fila de baixo); na parada, ainda não decorou.</> },
    { texto: "Melhora pouco: média acima de zero, dentro da faixa da validação", certa: !folga && consistente, retorno: !folga && consistente && F50 ? f === 0.5 ? <>Isso: com {pct(0.5, 0)}, acima de zero entre sementes{porPouco(F50) ? ", por pouco" : ""} ({deAte(F50).replace("de ", "")}); na validação, z = {num(F50.z, 2)} cabe.</> : <>Isso, com {pct(0.5, 0)}, a fração da pergunta. A tabela dá a régua com {pct(f, 0)}.</> : folga ? <>Subestima: o ganho passa da faixa de 95% da validação.</> : <>Confunde ganho em várias sementes com efeito consistente: a faixa de 95% entre sementes toca o zero.</> },
    { texto: "Nada: as sementes caem para os dois lados", certa: !folga && !consistente, retorno: !folga && !consistente ? f === 0.5 ? <>Isso: com {pct(0.5, 0)}, a faixa de 95% entre sementes toca o zero.</> : <>Isso, com {pct(0.5, 0)}, a fração da pergunta. A tabela dá a régua com {pct(f, 0)}.</> : <>Confunde a dispersão de cada semente com a incerteza do efeito médio: uma semente oscila, mas a média de dez tem faixa estreita (t de {NS - 1} graus) e fica do lado do ganho.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  const restaurar = () => { setF(0.5); setEsc(null); };
  return (
    <Quadro slug="c6p16" pagina={pagina} layout="gl"
      titulo={!revelado ? `Cada árvore vê metade das propostas: na parada, a validação melhora?` : a && b ? tituloRevelado(f, a, b) : undefined}
      sub={!revelado ? `Cada árvore ajusta ${pct(0.5, 0)} das ${int(NA)} propostas, sorteadas. Preveja na parada.` : a && b ? subRevelado(f, a, b) : `Método de Friedman (2002); resultado desta amostra (${int(NV)} propostas de validação).`}
      conclusao={!revelado
        ? <>Sem sorteio, a perda de validação desce até {num(L[k0], 4)} em {k0} árvores e sobe a {num(L[T], 4)} com {T} (<LinkSlide slug="c6p15">slide {SLIDE.c6p15.n}</LinkSlide>). Com {T} árvores, sortear {pct(0.5, 0)} baixa a perda {P ? (P[1].ganham === NS ? "em todas as sementes" : `em ${P[1].ganham} de ${NS} sementes`) : "nas sementes"}. E na parada?</>
        : !a || !b ? <>Sorteando: {ss.length} de {NS} sementes calculadas para a subamostra de {pct(f, 0)}.</>
        : <>Com {pct(f, 0)}, {cabe(a) && cabe(b) ? "as duas filas cabem na faixa" : !cabe(a) && !cabe(b) ? "as duas filas passam da faixa" : cabe(a) ? `só a de ${T} árvores passa da faixa` : "só a da parada passa da faixa"} (z = {num(a.z, 2)} e {num(b.z, 2)}). {conclusaoParada(f, a)} <LinkSlide slug="c6p17">Slide {SLIDE.c6p17.n}</LinkSlide>: contra a logística.</>}
      fonte={`Validação: ${int(NV)} propostas, ${DV} defaults; boosting do slide ${SLIDE.c6p15.n}, sementes 1 a ${NS}, parada escolhida nesta validação. 95%: t de ${NS - 1} graus (${num(TS, 3)}) entre sementes; t de ${int(NV - 1)} (${num(TV, 3)}) com erro pareado por proposta.`}>
      <Painel>
        {filas
          ? <Grafico titulo={`Subamostra de ${pct(f, 0)}`} sub="● semente · ◆ média ± 95% entre sementes · cinza: validação" rotulo={`Ganho de log loss de dez sementes com subamostra de ${pct(f, 0)} sobre o modelo sem sorteio. ${filas.map((q, i) => `${q.tit}: ${revelado || i > 0 ? `média ${sinal(q.m, 4)}, faixa de 95% entre sementes ±${num(TS * q.se, 4)}, ${q.ganham} de ${NS} com ganho, z ${num(q.z, 2)}` : "oculto até a previsão"}; faixa de 95% da validação ±${num(TV * q.ev, 4)}`).join(". ")}`} arCelular="4 / 3">
            {(d) => <Pontos d={d} filas={filas} revelado={revelado} />}
          </Grafico>
          : <p className="q7-nota">Sorteando: {ss.length} de {NS} sementes calculadas.</p>}
        <div className="q6-s16-ctl">
          <div><p className="q7-k">Fração por árvore{revelado ? "" : ": depois da previsão"}</p><Seg rotulo="Fração sorteada por árvore" opcoes={FRACS.map((v) => ({ v, r: pct(v, 0) }))} valor={f} onChange={setF} cor desab={!revelado} /></div>
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Parando na árvore ${k0}, a parada sem sorteio, a subamostra de ${pct(0.5, 0)}...`} opcoes={ops} escolha={esc} onEscolha={(i) => { setEsc(i); if (i === null) setF(0.5); }} recolher />
        {revelado && a && b && <>
          <table className="q7-tab q6-s16-tab">
            <thead><tr><th className="q7-t-l">Régua, {pct(f, 0)}</th><th>Parada em {k0}</th><th>{T} árvores</th></tr></thead>
            <tbody>
              <tr><th>Ganho médio</th><td>{sinal(a.m, 4)}</td><td>{sinal(b.m, 4)}</td></tr>
              <tr><th>95% entre sementes</th><td>±{num(TS * a.se, 4)}</td><td>±{num(TS * b.se, 4)}</td></tr>
              <tr><th>Com ganho</th><td>{a.ganham} de {NS}</td><td>{b.ganham} de {NS}</td></tr>
              <tr data-on="1"><th>z = ganho ÷ erro padrão</th><td>{num(a.z, 2)}: {cabe(a) ? "cabe" : "passa"}</td><td>{num(b.z, 2)}: {cabe(b) ? "cabe" : "passa"}</td></tr>
            </tbody>
          </table>
        </>}
      </Painel>
    </Quadro>
  );
}
