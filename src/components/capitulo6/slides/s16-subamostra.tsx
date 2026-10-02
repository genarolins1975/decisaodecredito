"use client";
import { useEffect, useState } from "react";
import { Botao, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { diferencaPerdaPareada, estagios, perdaLog } from "@/lib/capitulo6/gbm";
import { Z95 } from "@/lib/capitulo7/metricas";
import { int, num, pct, sinal } from "@/lib/capitulo7/formato";

/**
 * 16 · c6p16 · Subamostra (boosting estocástico de Friedman, 2002): cada árvore é ajustada numa fração das 1.472
 * propostas, sorteada sem reposição com semente (opções subamostra e semente de gbm.ts), dez sementes por fração.
 * A peça principal é um gráfico de pontos do ganho de log loss de cada semente sobre o modelo sem sorteio, em dois
 * pontos: na parada do modelo sem sorteio (o mínimo da curva do slide 15, um ponto fixo para todas as sementes) e com
 * 200 árvores, longe dela. Duas réguas para o mesmo ganho:
 *   entre sementes   média das dez com ±1,96 erro padrão da média (desvio padrão ÷ √10): o sorteio ajuda de forma
 *                    consistente? (variação do ajuste);
 *   da validação     faixa de ±1,96 erro padrão da diferença pareada de log loss, proposta a proposta, entre uma
 *                    semente e o modelo sem sorteio (diferencaPerdaPareada de gbm.ts; mediana das dez sementes): o que
 *                    631 propostas conseguem distinguir (variação da amostra).
 * Depois da previsão, um seletor troca a parada fixa pelo mínimo de cada semente, escolhido na mesma validação, para
 * mostrar o viés de seleção (o ganho cresce). A parada fixa também foi escolhida nesta validação, pelo modelo sem
 * sorteio: favorece o sem sorteio. As sementes são calculadas uma por vez, depois da pintura, para não travar o
 * quadro, e ficam memorizadas. Toda frase comparativa e a alternativa certa são calculadas aqui.
 */
const T = 200, SEMENTES = Array.from({ length: 10 }, (_, k) => k + 1);
const FRACS = [0.8, 0.5, 0.3];
const DV = YV.reduce((s, v) => s + v, 0);
const media = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const dp = (v: number[]) => { const m = media(v); return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)); };
const mediana = (v: number[]) => { const o = [...v].sort((a, b) => a - b), h = o.length / 2; return o.length % 2 ? o[Math.floor(h)] : (o[h - 1] + o[h]) / 2; };

type Sem = { Fk: number[]; FT: number[]; Fmin: number[]; Lk: number; LT: number; Lmin: number; kmin: number };
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
  const E = estagios(modelo({ ...CFG_CARTEIRA, arvores: T, subamostra: f, semente: s }), XV); const L = E.map((F) => perdaLog(F, YV));
  const kmin = L.reduce((k, x, i) => (i >= 1 && x < L[k] ? i : k), 1);
  return { Fk: E[k0], FT: E[T], Fmin: E[kmin], Lk: L[k0], LT: L[T], Lmin: L[kmin], kmin };
}

/** Uma fila do gráfico: ganho de cada semente, média com a régua entre sementes e a régua da validação. */
type Fila = { tit: string; g: number[]; m: number; se: number; ev: number; abaixo: number };
function fila(tit: string, ref: number, Fref: number[], ss: Sem[], L: (s: Sem) => number, F: (s: Sem) => number[]): Fila {
  const g = ss.map((s) => ref - L(s));
  return { tit, g, m: media(g), se: dp(g) / Math.sqrt(g.length), ev: mediana(ss.map((s) => diferencaPerdaPareada(Fref, F(s), YV).ep)), abaixo: g.filter((v) => v > 0).length };
}

function Pontos({ d, filas, revelado }: { d: Dim; filas: Fila[]; revelado: boolean }) {
  const fs = d.fs, m = { l: fs * 0.6, r: fs * 0.8, t: fs * 0.2, b: fs * 3.1 };
  const vals = filas.flatMap((f, i) => [Z95 * f.ev, -Z95 * f.ev, ...(revelado || i > 0 ? [...f.g, f.m + Z95 * f.se, f.m - Z95 * f.se] : [])]);
  const lo0 = Math.min(...vals), hi0 = Math.max(...vals), pad = (hi0 - lo0) * 0.05;
  const passo = hi0 - lo0 > 0.03 ? 0.01 : 0.005;
  const x = escala([lo0 - pad, hi0 + pad], [m.l, d.w - m.r]);
  const xt: number[] = []; for (let t = Math.ceil((lo0 - pad) / passo) * passo; t <= hi0 + pad + 1e-12; t += passo) xt.push(Math.round(t * 1000) / 1000);
  const alt = (d.h - m.t - m.b) / filas.length, r = fs * 0.34, larg = (t: string, k = 1) => t.length * fs * 0.53 * k;
  return (
    <g>
      {xt.map((t) => <g key={t}><line className="q7-grade" x1={x(t)} x2={x(t)} y1={m.t} y2={d.h - m.b} /><text className="q7-tick" x={x(t)} y={d.h - m.b} dy="1.25em" textAnchor="middle" style={t === 0 ? { fontWeight: 700, fill: "#5B6475" } : undefined}>{t === 0 ? "0: sem sorteio" : sinal(t, 3)}</text></g>)}
      <text className="q7-eixo-t" x={(m.l + d.w - m.r) / 2} y={d.h - m.b} dy="2.55em" textAnchor="middle">Ganho de log loss sobre o modelo sem sorteio (à direita, o sorteio ajuda)</text>
      {filas.map((f, i) => {
        const y0 = m.t + alt * i, ver = revelado || i > 0;
        const topo = y0 + fs * 1.75, base = y0 + alt - fs * 0.4, cyM = base - fs * 0.85, cyD = (topo + cyM - fs * 0.8) / 2;
        // pontos sem sobreposição: cada semente vai ao nível vertical mais próximo do centro em que não toca as vizinhas,
        // dentro da faixa entre o título da fila e a barra da média; sem nível livre, fica no centro (a transparência mostra)
        const nmax = Math.max(0, Math.floor((cyD - topo - r) / (r * 2.15)));
        const ord = f.g.map((v, k) => ({ v, k })).sort((a, b) => a.v - b.v); const pos: { x: number; y: number }[] = [];
        for (const o of ord) { const px = x(o.v); let py = cyD; for (let n = 0; n <= 2 * nmax; n++) { const nv = n === 0 ? 0 : (n % 2 ? -1 : 1) * Math.ceil(n / 2); const qy = cyD + nv * r * 2.15; if (pos.every((p) => Math.hypot(p.x - px, p.y - qy) > r * 2.1)) { py = qy; break; } } pos.push({ x: px, y: py }); }
        const bx0 = x(-Z95 * f.ev), bx1 = x(Z95 * f.ev), xm = x(f.m), ws = Math.max(1.5, x(f.m + Z95 * f.se) - xm);
        const rot = `média ${sinal(f.m, 4)}`, cabeDir = xm + ws + fs * 0.6 + larg(rot) < d.w - m.r;
        return (
          <g key={f.tit}>
            {i > 0 && <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y0} y2={y0} />}
            <rect x={bx0} y={topo} width={bx1 - bx0} height={base - topo} rx={fs * 0.3} fill="#9AA1AD" fillOpacity={0.2} />
            <line x1={x(0)} x2={x(0)} y1={topo} y2={base} stroke="#5B6475" strokeWidth={2} strokeDasharray="6 4" />
            <text className="q7-rot" x={m.l} y={y0} dy="1.2em" style={{ fill: "#00205B", fontWeight: 700 }}>{f.tit}<tspan style={{ fill: "#5B6475", fontWeight: 500 }}>{` · erro da validação ±${num(Z95 * f.ev, 4)}`}</tspan></text>
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

type Modo = "fixa" | "minimo";
export function S16Subamostra({ pagina }: { pagina?: Pagina }) {
  const [c0] = useState(cheia);
  const [f, setF] = useState(0.5);
  const [modo, setModo] = useState<Modo>("fixa");
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
  const filasDe = (lista: Sem[], md: Modo): Fila[] => [
    md === "fixa" ? fila(`Parado em ${k0} árvores, a parada sem sorteio`, L[k0], E[k0], lista, (s) => s.Lk, (s) => s.Fk)
      : fila("No mínimo de cada semente", L[k0], E[k0], lista, (s) => s.Lmin, (s) => s.Fmin),
    fila(`Com ${T} árvores, longe da parada`, L[T], E[T], lista, (s) => s.LT, (s) => s.FT),
  ];
  const filas = pronto ? filasDe(ss, modo) : null;
  const fx = pronto && modo === "minimo" ? filasDe(ss, "fixa")[0] : null;
  // a previsão é sempre sobre 50% na parada fixa; trocar a fração ou o modo depois não muda a alternativa certa
  const s50 = CACHE.get(0.5) ?? [], p50 = s50.length === SEMENTES.length;
  const F50 = p50 ? filasDe(s50, "fixa")[0] : null;
  const folga = F50 ? F50.m > Z95 * F50.ev : false, consistente = F50 ? F50.m > Z95 * F50.se : true;
  const ops = [
    { texto: "Melhora com folga: o sorteio regulariza", certa: folga, retorno: folga ? <>Isso: o ganho passa do que a validação distingue.</> : <>Confunde o que acontece longe da parada com a parada: com muitas árvores, o sorteio freia a decoreba (fila de baixo); na parada, o modelo ainda não decorou e sobra pouco para frear.</> },
    { texto: "Melhora pouco: em quase toda semente, mas menos que o erro da validação", certa: !folga && consistente, retorno: !folga && consistente ? <>Isso: as sementes concordam no sinal, então o efeito médio existe; mas ele é menor que o erro amostral de uma validação deste tamanho, e outras propostas poderiam inverter a comparação.</> : <>Os números não sustentam as duas metades da frase ao mesmo tempo.</> },
    { texto: "Nada: as sementes caem para os dois lados", certa: !folga && !consistente, retorno: !folga && !consistente ? <>Isso: a média das sementes não se afasta do zero mais que a variação entre elas.</> : <>Confunde a dispersão de cada semente com a incerteza do efeito médio: uma semente oscila, mas a média de dez tem erro bem menor e fica do lado do ganho.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  const a = filas?.[0], b = filas?.[1];
  const consist = (q: Fila) => (q.m > Z95 * q.se ? "consistente" : q.m < -Z95 * q.se ? "piora consistente" : "sem sinal consistente");
  const restaurar = () => { setF(0.5); setModo("fixa"); setEsc(null); };
  return (
    <Quadro slug="c6p16" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : `Cada árvore vê metade das propostas: na parada, a validação melhora?`}
      sub={revelado ? undefined : `Cada árvore ajusta ${pct(0.5, 0)} das ${int(NA)} propostas, sorteadas. Preveja na parada.`}
      conclusao={!revelado
        ? <>Sem sorteio, a perda de validação desce até {num(L[k0], 4)} em {k0} árvores e sobe a {num(L[T], 4)} com {T} (<LinkSlide slug="c6p15">slide 15</LinkSlide>). Com {T} árvores, sortear {pct(0.5, 0)} baixa a perda {b && b.abaixo === SEMENTES.length ? "em todas as sementes" : b ? `em ${b.abaixo} de ${SEMENTES.length} sementes` : "nas sementes"}. E na parada?</>
        : !a || !b ? <>Sorteando: {ss.length} de {SEMENTES.length} sementes calculadas para a subamostra de {pct(f, 0)}.</>
        : <>Subamostra de {pct(f, 0)}, {modo === "fixa" ? `parada em ${k0}` : "mínimo de cada semente"}: ganho médio de <b>{sinal(a.m, 4)}</b>, {consist(a)} entre sementes ({a.abaixo} de {SEMENTES.length}), {Math.abs(a.m) > Z95 * a.ev ? "maior que" : "dentro do"} erro da validação. Com {T} árvores, {sinal(b.m, 4)}, {num(b.m / b.ev, 1)} {Math.abs(b.m / b.ev) >= 2 ? "vezes" : "vez"} o erro da validação. {modo === "minimo" && fx ? <>Na parada fixa, {sinal(fx.m, 4)}: escolher o ponto na mesma validação {a.m > fx.m ? "infla" : "não infla"} o ganho. </> : ""}O <LinkSlide slug="c6p17">slide 17</LinkSlide> compara com a logística.</>}
      fonte={`Validação sorteada: ${int(NV)} propostas, ${DV} defaults. η ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo ${CFG_CARTEIRA.minFolha}; subamostra sem reposição, sementes 1 a ${SEMENTES.length}. Erro da validação: diferença pareada por proposta (mediana das sementes). Parada em ${k0} escolhida nesta validação. Friedman (2002).`}>
      <Painel>
        {filas
          ? <Grafico titulo={`Subamostra de ${pct(f, 0)}`} sub="● semente · ◆ média ± 1,96 erro entre sementes · cinza: ± 1,96 erro da validação" rotulo={`Ganho de log loss de dez sementes com subamostra de ${pct(f, 0)} sobre o modelo sem sorteio. ${filas.map((q, i) => `${q.tit}: ${revelado || i > 0 ? `média ${sinal(q.m, 4)}, erro entre sementes ${num(q.se, 4)}, ${q.abaixo} de ${SEMENTES.length} com ganho` : "oculto até a previsão"}; erro da validação ${num(q.ev, 4)}`).join(". ")}`} arCelular="4 / 3">
            {(d) => <Pontos d={d} filas={filas} revelado={revelado} />}
          </Grafico>
          : <p className="q7-nota">Sorteando: {ss.length} de {SEMENTES.length} sementes calculadas.</p>}
        <div className="q6-s16-ctl">
          <div><p className="q7-k">Fração por árvore{revelado ? "" : ": depois da previsão"}</p><Seg rotulo="Fração sorteada por árvore" opcoes={FRACS.map((v) => ({ v, r: pct(v, 0) }))} valor={f} onChange={setF} cor desab={!revelado} /></div>
          {revelado && <div><p className="q7-k">Ponto de comparação</p><Seg rotulo="Ponto de comparação" opcoes={[{ v: "fixa" as Modo, r: `parada em ${k0}` }, { v: "minimo" as Modo, r: "mínimo de cada semente" }]} valor={modo} onChange={setModo} cor /></div>}
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Parando na árvore ${k0}, a parada sem sorteio, a subamostra de ${pct(0.5, 0)}...`} opcoes={ops} escolha={esc} onEscolha={setEsc} recolher />
        {revelado && a && <>
          <p className="q7-k">Duas réguas para o ganho de {sinal(a.m, 4)}</p>
          <table className="q7-tab q6-s16-tab">
            <thead><tr><th className="q7-t-l">Erro padrão</th><th>Valor</th><th>O ganho</th></tr></thead>
            <tbody>
              <tr><th>Entre sementes</th><td>{num(a.se, 4)}</td><td>{Math.abs(a.m) > Z95 * a.se ? "passa" : "cabe"}</td></tr>
              <tr data-on="1"><th>Da validação ({int(NV)})</th><td>{num(a.ev, 4)}</td><td>{Math.abs(a.m) > Z95 * a.ev ? "passa" : "cabe"}</td></tr>
            </tbody>
          </table>
        </>}
      </Painel>
    </Quadro>
  );
}
