"use client";
import { useEffect, useState } from "react";
import { Botao, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { estagios, ganhoMedioPareado, perdaLog, quantilT } from "@/lib/capitulo6/gbm";
import { int, num, pct, sinal } from "@/lib/capitulo7/formato";

/**
 * 16 · c6p16 · Subamostra (boosting estocástico; o método é de Friedman, 2002): cada árvore é ajustada numa fração das
 * 1.472 propostas, sorteada sem reposição com semente (opções subamostra e semente de gbm.ts), dez sementes por fração.
 * A peça principal é um gráfico de pontos do ganho de log loss de cada semente sobre o modelo sem sorteio, em dois
 * pontos: na parada do modelo sem sorteio (o mínimo da curva do slide 15, um ponto fixo para todas as sementes) e com
 * 200 árvores, longe dela. Duas ideias: longe da parada o sorteio regulariza (ganho maior, consistente entre sementes);
 * na parada o ganho cabe no erro da validação. Duas faixas de 95%, com o mesmo nome em gráfico, tabela e leitura:
 *   entre sementes   média das dez ± t de 9 graus × desvio padrão ÷ √10 (quantilT de gbm.ts): o sorteio ajuda de forma
 *                    consistente nesta validação? (variação do ajuste);
 *   da validação     0 ± t de n − 1 graus × erro padrão de dᵢ = perdaᵢ(sem sorteio) − média das perdasᵢ das dez sementes,
 *                    proposta a proposta (ganhoMedioPareado de gbm.ts): o que 631 propostas distinguem (variação da
 *                    amostra). z = ganho ÷ esse erro padrão; o ganho cabe na faixa quando |z| fica abaixo do t.
 * A parada também foi escolhida nesta validação, pelo modelo sem sorteio: favorece o sem sorteio (declarado na fonte).
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
/** Veredito entre sementes: a faixa de 95% da média de dez toca o zero? */
const entreSementes = (q: Fila) => (q.m - TS * q.se > 0 ? "consistente entre sementes" : q.m + TS * q.se < 0 ? "piora consistente entre sementes" : "sem sinal consistente entre sementes");
const cabe = (q: Fila) => Math.abs(q.z) < TV;
/** Veredito da validação, pela mesma faixa de 95%: |z| abaixo do t cabe; perto dele (90% ou mais), no limite. */
const naValidacao = (q: Fila) => (cabe(q) ? (Math.abs(q.z) >= 0.9 * TV ? "cabe, no limite, na faixa de 95% da validação" : "cabe na faixa de 95% da validação") : "passa da faixa de 95% da validação");
const curto = (q: Fila) => (cabe(q) ? (Math.abs(q.z) >= 0.9 * TV ? "cabe, no limite" : "cabe") : "passa");

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
  const ops = [
    { texto: "Melhora com folga: o ganho passa da faixa da validação", certa: folga, retorno: folga ? <>Isso: z = ganho ÷ erro padrão passa de {num(TV, 2)}, a faixa de 95% da validação.</> : <>Confunde o que acontece longe da parada com a parada: com muitas árvores, o modelo sem sorteio já decorou, e o sorteio tem o que frear (fila de baixo); na parada, ainda não decorou.</> },
    { texto: "Melhora pouco: a média de dez sementes fica acima de zero, mas dentro da faixa da validação", certa: !folga && consistente, retorno: !folga && consistente && F50 ? <>Isso: {F50.ganham} de {NS} sementes ganham e a faixa entre sementes não toca o zero, mas z = {num(F50.z, 2)}: o ganho cabe na faixa da validação.</> : folga ? <>Subestima: o ganho passa da faixa de 95% da validação.</> : <>Confunde ganho em várias sementes com efeito consistente: a faixa de 95% entre sementes toca o zero.</> },
    { texto: "Nada: as sementes caem para os dois lados", certa: !folga && !consistente, retorno: !folga && !consistente ? <>Isso: a faixa de 95% entre sementes toca o zero.</> : <>Confunde a dispersão de cada semente com a incerteza do efeito médio: uma semente oscila, mas a média de dez tem faixa estreita (t de {NS - 1} graus) e fica do lado do ganho.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  const a = filas?.[0], b = filas?.[1];
  const restaurar = () => { setF(0.5); setEsc(null); };
  return (
    <Quadro slug="c6p16" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : `Cada árvore vê metade das propostas: na parada, a validação melhora?`}
      sub={revelado ? `Método de Friedman (2002). Nesta amostra, de ${int(NV)} propostas e três variáveis, o sorteio regulariza longe da parada.` : `Cada árvore ajusta ${pct(0.5, 0)} das ${int(NA)} propostas, sorteadas. Preveja na parada.`}
      conclusao={!revelado
        ? <>Sem sorteio, a perda de validação desce até {num(L[k0], 4)} em {k0} árvores e sobe a {num(L[T], 4)} com {T} (<LinkSlide slug="c6p15">slide 15</LinkSlide>). Com {T} árvores, sortear {pct(0.5, 0)} baixa a perda {P ? (P[1].ganham === NS ? "em todas as sementes" : `em ${P[1].ganham} de ${NS} sementes`) : "nas sementes"}. E na parada?</>
        : !a || !b ? <>Sorteando: {ss.length} de {NS} sementes calculadas para a subamostra de {pct(f, 0)}.</>
        : <>Com {pct(f, 0)} e {T} árvores, <b>{sinal(b.m, 4)}</b>, {entreSementes(b)} ({b.ganham} de {NS}), e z = {num(b.z, 2)} {naValidacao(b)}. Na parada em {k0}, <b>{sinal(a.m, 4)}</b> ({a.ganham} de {NS}), z = {num(a.z, 2)}: {curto(a)}. <LinkSlide slug="c6p17">Slide 17</LinkSlide>: contra a logística.</>}
      fonte={`Validação: ${int(NV)} propostas, ${DV} defaults. η ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo ${CFG_CARTEIRA.minFolha}; sementes 1 a ${NS}, sem reposição. Faixas de 95%: ± t de ${NS - 1} graus (${num(TS, 3)}) × erro padrão entre sementes; ± t de ${int(NV - 1)} (${num(TV, 3)}) × erro padrão, por proposta, da perda sem sorteio − média das ${NS}. Parada escolhida nesta validação.`}>
      <Painel>
        {filas
          ? <Grafico titulo={`Subamostra de ${pct(f, 0)}`} sub="● semente · ◆ média, barra: faixa de 95% entre sementes · cinza: da validação" rotulo={`Ganho de log loss de dez sementes com subamostra de ${pct(f, 0)} sobre o modelo sem sorteio. ${filas.map((q, i) => `${q.tit}: ${revelado || i > 0 ? `média ${sinal(q.m, 4)}, faixa de 95% entre sementes ±${num(TS * q.se, 4)}, ${q.ganham} de ${NS} com ganho, z ${num(q.z, 2)}` : "oculto até a previsão"}; faixa de 95% da validação ±${num(TV * q.ev, 4)}`).join(". ")}`} arCelular="4 / 3">
            {(d) => <Pontos d={d} filas={filas} revelado={revelado} />}
          </Grafico>
          : <p className="q7-nota">Sorteando: {ss.length} de {NS} sementes calculadas.</p>}
        <div className="q6-s16-ctl">
          <div><p className="q7-k">Fração por árvore{revelado ? "" : ": depois da previsão"}</p><Seg rotulo="Fração sorteada por árvore" opcoes={FRACS.map((v) => ({ v, r: pct(v, 0) }))} valor={f} onChange={setF} cor desab={!revelado} /></div>
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Parando na árvore ${k0}, a parada sem sorteio, a subamostra de ${pct(0.5, 0)}...`} opcoes={ops} escolha={esc} onEscolha={setEsc} recolher />
        {revelado && a && b && <>
          <p className="q7-k">A mesma régua nas duas filas</p>
          <table className="q7-tab q6-s16-tab">
            <thead><tr><th className="q7-t-l"></th><th>Parada em {k0}</th><th>{T} árvores</th></tr></thead>
            <tbody>
              <tr><th>Ganho médio</th><td>{sinal(a.m, 4)}</td><td>{sinal(b.m, 4)}</td></tr>
              <tr><th>Sementes com ganho</th><td>{a.ganham} de {NS}</td><td>{b.ganham} de {NS}</td></tr>
              <tr data-on="1"><th>z = ganho ÷ erro padrão</th><td>{num(a.z, 2)}: {cabe(a) ? "cabe" : "passa"}</td><td>{num(b.z, 2)}: {cabe(b) ? "cabe" : "passa"}</td></tr>
            </tbody>
          </table>
        </>}
      </Painel>
    </Quadro>
  );
}
