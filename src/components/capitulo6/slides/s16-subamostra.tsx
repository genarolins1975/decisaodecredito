"use client";
import { useEffect, useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { estagios, perdaLog } from "@/lib/capitulo6/gbm";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 16 · c6p16 · Subamostra (boosting estocástico de Friedman, 2002): cada árvore é ajustada numa fração das 1.472
 * propostas, sorteada sem reposição com semente (opções subamostra e semente de gbm.ts). Perda de validação por árvore
 * para a carteira inteira (sem sorteio) e para dez sementes de cada fração, com a média. Até 200 árvores, o bastante
 * para ver o mínimo e a subida. As curvas das sementes são calculadas uma por vez, depois da pintura, para não travar o
 * quadro; ficam memorizadas. A pergunta é feita no ponto de parada (o mínimo de cada curva, marcado na figura), onde o
 * modelo seria usado: ali a diferença média entre sementes e a curva sem sorteio é comparada com a faixa entre
 * sementes, e o sinal (melhora ou piora) é dito. Com 200 árvores, longe da parada, o sorteio achata a subida. Toda
 * frase comparativa é calculada aqui. A previsão esconde as sementes até a resposta certa.
 */
const T = 200, SEMENTES = Array.from({ length: 10 }, (_, k) => k + 1);
const FRACS = [0.8, 0.5, 0.3];
const DV = YV.reduce((s, v) => s + v, 0);
let CHEIA: number[] | null = null;
const cheia = () => (CHEIA ??= estagios(modelo(CFG_CARTEIRA), XV).slice(0, T + 1).map((F) => perdaLog(F, YV)));
const CACHE = new Map<number, number[][]>();
const curvaSemente = (f: number, s: number) => estagios(modelo({ ...CFG_CARTEIRA, arvores: T, subamostra: f, semente: s }), XV).map((F) => perdaLog(F, YV));
const media = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

function Curvas({ c0, cs, revelado, f, ate }: { c0: number[]; cs: number[][]; revelado: boolean; f: number; ate: number }) {
  const med = cs.length ? c0.map((_, k) => media(cs.map((c) => c[k]))) : null;
  return (
    <Grafico titulo="Perda de validação" sub={revelado ? "cinza: sem sorteio · verde: sementes e média · ▼ ● mínimos" : "cinza: sem sorteio · ▼ mínimo"} rotulo={`Perda de validação sem sorteio${revelado ? ` e com subamostra de ${pct(f, 0)} em ${cs.length} sementes, com o mínimo de cada curva marcado` : ""}, até ${ate} árvores`} arCelular="4 / 3">
      {(d) => {
        const g = margens(d.fs, { l: 3.6, r: 7.4, t: 0.8, b: 2.7 });
        const vis = (c: number[]) => c.slice(0, ate + 1);
        const todos = [...vis(c0), ...(revelado ? cs.flatMap(vis) : [])];
        const lo = Math.floor((Math.min(...todos) - 0.0015) * 200) / 200, hi = Math.ceil(Math.max(...todos) * 200) / 200;
        const passo = hi - lo > 0.03 ? 0.01 : 0.005;
        const yt: number[] = []; for (let v = Math.ceil(lo / passo - 1e-9) * passo; v <= hi + 1e-9; v += passo) yt.push(Math.round(v * 1000) / 1000);
        const x = escala([0, ate], [g.l, d.w - g.r]), y = escala([lo, hi], [d.h - g.b, g.t]);
        const pts = (c: number[]) => vis(c).map((v, k) => ({ x: x(k), y: y(v) }));
        let y0 = y(c0[ate]), y1 = med ? y(med[ate]) : 0; if (revelado && med && Math.abs(y0 - y1) < d.fs * 2.3) { const s = y0 < y1 ? -1 : 1, mid = (y0 + y1) / 2; y0 = mid + s * d.fs * 1.15; y1 = mid - s * d.fs * 1.15; }
        return (
          <g>
            <Eixos x={x} y={y} xt={ate < T ? [0, 10, 20, 30, 40, 50] : [0, 50, 100, 150, 200]} yt={yt} fx={(v) => int(v)} fy={(v) => num(v, passo < 0.01 ? 3 : 2)} xTit="número de árvores somadas" />
            {revelado && cs.map((c, k) => <path key={k} className="q7-linha q7-linha--val" strokeWidth={1.6} strokeOpacity={0.4} d={caminho(pts(c))} />)}
            <path className="q7-linha q7-linha--mudo" strokeDasharray="10 6" d={caminho(pts(c0))} />
            {revelado && med && <path className="q7-linha q7-linha--val" strokeWidth={4.5} d={caminho(pts(med))} />}
            {revelado && cs.map((c, k) => { const v = Math.min(...c), i = c.indexOf(v); return <circle key={k} cx={x(i)} cy={y(v)} r={d.fs * 0.28} fill="#2E6B4F" stroke="#fff" strokeWidth={1.5} />; })}
            {(() => { const v = Math.min(...c0), i = c0.indexOf(v), r = d.fs * 0.42; return <path d={`M${x(i)} ${y(v) + r * 0.4}L${x(i) + r * 0.95} ${y(v) - r * 1.3}L${x(i) - r * 0.95} ${y(v) - r * 1.3}Z`} fill="#5B6475" stroke="#fff" strokeWidth={1.5} />; })()}
            <text className="q7-rot--peq" x={d.w - g.r + d.fs * 0.4} y={y0 - d.fs * 0.15} style={{ fill: "#5B6475", fontWeight: 700 }}><tspan x={d.w - g.r + d.fs * 0.4}>sem sorteio</tspan><tspan x={d.w - g.r + d.fs * 0.4} dy="1.1em">{num(c0[ate], 4)}</tspan></text>
            {revelado && med && <text className="q7-rot--peq" x={d.w - g.r + d.fs * 0.4} y={y1 - d.fs * 0.15} style={{ fill: "#2E6B4F", fontWeight: 700 }}><tspan x={d.w - g.r + d.fs * 0.4}>{`média, ${pct(f, 0)}`}</tspan><tspan x={d.w - g.r + d.fs * 0.4} dy="1.1em">{num(med[ate], 4)}</tspan></text>}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S16Subamostra({ pagina }: { pagina?: Pagina }) {
  const [c0] = useState(cheia);
  const [f, setF] = useState(0.5);
  const [ate, setAte] = useState(T);
  const [esc, setEsc] = useState<number | null>(null);
  const [, setVersao] = useState(0);
  const cs = CACHE.get(f) ?? [];
  const pronto = cs.length === SEMENTES.length;
  // uma semente por vez, depois da pintura: o quadro responde enquanto as curvas chegam
  useEffect(() => {
    if (pronto) return;
    const id = window.setTimeout(() => { const lista = CACHE.get(f) ?? []; if (lista.length < SEMENTES.length) { lista.push(curvaSemente(f, SEMENTES[lista.length])); CACHE.set(f, lista); } setVersao((v) => v + 1); }, 30);
    return () => window.clearTimeout(id);
  }, [f, pronto, cs.length]);
  const fim = cs.map((c) => c[T]), mins = cs.map((c) => Math.min(...c));
  const min0 = Math.min(...c0), k0 = c0.indexOf(min0);
  const todasAbaixo = pronto && fim.every((v) => v < c0[T]);
  const mMin = pronto ? media(mins) : min0, ganhoMin = min0 - mMin;
  const faixaMin = pronto ? Math.max(...mins) - Math.min(...mins) : 0;
  const noRuido = pronto && Math.abs(ganhoMin) < faixaMin;
  // a previsão é sempre sobre 50%; com f trocado depois, os números da previsão continuam os de 50%
  const c50 = CACHE.get(0.5) ?? [], p50 = c50.length === SEMENTES.length;
  const m50 = p50 ? media(c50.map((c) => Math.min(...c))) : null, f50 = p50 ? media(c50.map((c) => c[T])) : null;
  const r50 = p50 ? Math.max(...c50.map((c) => Math.min(...c))) - Math.min(...c50.map((c) => Math.min(...c))) : null;
  const ops = [
    { texto: "Melhora com folga: o sorteio regulariza", certa: false, retorno: <>Confunde longe da parada com a parada: com {T} árvores a média cai de {num(c0[T], 4)} para {f50 !== null ? num(f50, 4) : "…"}, mas no mínimo só de {num(min0, 4)} para {m50 !== null ? num(m50, 4) : "…"}.</> },
    { texto: "Quase nada: a diferença cabe na variação entre sementes", certa: m50 === null || r50 === null || Math.abs(min0 - m50) < r50, retorno: <>Isso: no mínimo, {m50 !== null ? num(m50, 4) : "…"} contra {num(min0, 4)}.</> },
    { texto: "Piora: cada árvore vê menos propostas", certa: false, retorno: <>Com {pct(0.5, 0)}, a média dos mínimos fica {m50 !== null ? num(m50, 4) : "…"}, abaixo de {num(min0, 4)}: são {T} árvores com sorteios diferentes. O sinal muda com a fração: depois, teste {pct(0.3, 0)}.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  return (
    <Quadro slug="c6p16" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Cada árvore vê metade das propostas: parando no mínimo, a validação melhora?"}
      sub={revelado ? undefined : `Cada árvore ajusta ${pct(0.5, 0)} das ${int(NA)} propostas, sorteadas. Preveja no ponto de parada.`}
      conclusao={!revelado
        ? <>Sem sorteio, a perda de validação desce até {num(min0, 4)} em {k0} árvores e sobe a {num(c0[T], 4)} com {T}, a curva do <LinkSlide slug="c6p15">slide 15</LinkSlide>. Sorteando {pct(0.5, 0)}, o que muda no mínimo?</>
        : !pronto ? <>Sorteando: {cs.length} de {SEMENTES.length} sementes calculadas para a subamostra de {pct(f, 0)}.</>
        : <>Subamostra de {pct(f, 0)}, no mínimo: {num(mMin, 4)} na média das sementes contra {num(min0, 4)}, <b>{ganhoMin >= 0 ? "melhora" : "piora"} de {num(Math.abs(ganhoMin), 4)}</b>, {noRuido ? "menor" : "maior"} que a faixa entre sementes ({num(Math.min(...mins), 4)} a {num(Math.max(...mins), 4)}). Com {T} árvores, {todasAbaixo ? <>todas abaixo de {num(c0[T], 4)}: o sorteio achata a subida depois da parada</> : <>a média fica em {num(media(fim), 4)} contra {num(c0[T], 4)}</>}. O <LinkSlide slug="c6p17">slide 17</LinkSlide> compara com a logística.</>}
      fonte={`Validação sorteada: ${int(NV)} propostas, ${DV} defaults. η ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo ${CFG_CARTEIRA.minFolha}; subamostra sem reposição por árvore, sementes 1 a ${SEMENTES.length} (gbm.ts). Mínimos escolhidos na mesma validação. Friedman (2002).`}>
      <Painel>
        <Curvas c0={c0} cs={cs} revelado={revelado} f={f} ate={ate} />
        <div className="q6-s16-ctl">
          <div><p className="q7-k">Fração por árvore{revelado ? "" : ": depois da previsão"}</p><Seg rotulo="Fração sorteada por árvore" opcoes={FRACS.map((v) => ({ v, r: pct(v, 0) }))} valor={f} onChange={setF} cor desab={!revelado} /></div>
          <div><p className="q7-k">Eixo das árvores</p><Seg rotulo="Eixo das árvores" opcoes={[{ v: 50, r: "0 a 50" }, { v: T, r: `0 a ${T}` }]} valor={ate} onChange={setAte} cor /></div>
          <Botao sec onClick={() => { setF(0.5); setAte(T); setEsc(null); }}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Parando no mínimo de cada curva, a subamostra de ${pct(0.5, 0)}...`} opcoes={ops} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && ops[i].certa) setAte(50); }} recolher />
        {revelado && (
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">Perda de validação</th><th>No mínimo</th><th>Com {T} árvores</th></tr></thead>
            <tbody>
              <tr><th>Sem sorteio</th><td>{num(min0, 4)}</td><td>{num(c0[T], 4)}</td></tr>
              <tr data-on="1"><th>Média, {pct(f, 0)}</th><td>{pronto ? num(mMin, 4) : "·"}</td><td>{pronto ? num(media(fim), 4) : "·"}</td></tr>
              <tr><th>Faixa das sementes</th><td>{pronto ? `${num(Math.min(...mins), 4)} a ${num(Math.max(...mins), 4)}` : "·"}</td><td>{pronto ? `${num(Math.min(...fim), 4)} a ${num(Math.max(...fim), 4)}` : "·"}</td></tr>
            </tbody>
          </table>
        )}
      </Painel>
    </Quadro>
  );
}
