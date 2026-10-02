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
 * quadro; ficam memorizadas. Toda frase comparativa (todas as sementes abaixo, ganho no mínimo contra a variação entre
 * sementes) é calculada aqui. A previsão esconde as sementes até a resposta certa.
 */
const T = 200, SEMENTES = Array.from({ length: 10 }, (_, k) => k + 1);
const FRACS = [0.8, 0.5, 0.3];
const DV = YV.reduce((s, v) => s + v, 0);
let CHEIA: number[] | null = null;
const cheia = () => (CHEIA ??= estagios(modelo(CFG_CARTEIRA), XV).slice(0, T + 1).map((F) => perdaLog(F, YV)));
const CACHE = new Map<number, number[][]>();
const curvaSemente = (f: number, s: number) => estagios(modelo({ ...CFG_CARTEIRA, arvores: T, subamostra: f, semente: s }), XV).map((F) => perdaLog(F, YV));
const media = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

function Curvas({ c0, cs, revelado, f }: { c0: number[]; cs: number[][]; revelado: boolean; f: number }) {
  const med = cs.length ? c0.map((_, k) => media(cs.map((c) => c[k]))) : null;
  return (
    <Grafico titulo="Perda de validação por número de árvores" sub={revelado ? `cinza: sem sorteio · verde: ${cs.length} sementes e a média` : "cinza: sem sorteio"} rotulo={`Perda de validação sem sorteio${revelado ? ` e com subamostra de ${pct(f, 0)} em ${cs.length} sementes` : ""}, até ${T} árvores`} arCelular="4 / 3">
      {(d) => {
        const g = margens(d.fs, { l: 3.6, r: 7.4, t: 0.8, b: 2.7 });
        const todos = [...c0, ...(revelado ? cs.flat() : [])];
        const lo = Math.floor(Math.min(...todos) * 100) / 100, hi = Math.ceil(Math.max(...todos) * 100) / 100;
        const yt: number[] = []; for (let v = lo; v <= hi + 1e-9; v += 0.01) yt.push(Math.round(v * 100) / 100);
        const x = escala([0, T], [g.l, d.w - g.r]), y = escala([lo, hi], [d.h - g.b, g.t]);
        const pts = (c: number[]) => c.map((v, k) => ({ x: x(k), y: y(v) }));
        let y0 = y(c0[T]), y1 = med ? y(med[T]) : 0; if (revelado && med && Math.abs(y0 - y1) < d.fs * 2.3) { const s = y0 < y1 ? -1 : 1, mid = (y0 + y1) / 2; y0 = mid + s * d.fs * 1.15; y1 = mid - s * d.fs * 1.15; }
        return (
          <g>
            <Eixos x={x} y={y} xt={[0, 50, 100, 150, 200]} yt={yt} fx={(v) => int(v)} fy={(v) => num(v, 2)} xTit="número de árvores somadas" />
            {revelado && cs.map((c, k) => <path key={k} className="q7-linha q7-linha--val" strokeWidth={1.6} strokeOpacity={0.4} d={caminho(pts(c))} />)}
            <path className="q7-linha q7-linha--mudo" strokeDasharray="10 6" d={caminho(pts(c0))} />
            {revelado && med && <path className="q7-linha q7-linha--val" strokeWidth={4.5} d={caminho(pts(med))} />}
            <text className="q7-rot--peq" x={d.w - g.r + d.fs * 0.4} y={y0 - d.fs * 0.15} style={{ fill: "#5B6475", fontWeight: 700 }}><tspan x={d.w - g.r + d.fs * 0.4}>sem sorteio</tspan><tspan x={d.w - g.r + d.fs * 0.4} dy="1.1em">{num(c0[T], 4)}</tspan></text>
            {revelado && med && <text className="q7-rot--peq" x={d.w - g.r + d.fs * 0.4} y={y1 - d.fs * 0.15} style={{ fill: "#2E6B4F", fontWeight: 700 }}><tspan x={d.w - g.r + d.fs * 0.4}>{`média, ${pct(f, 0)}`}</tspan><tspan x={d.w - g.r + d.fs * 0.4} dy="1.1em">{num(med[T], 4)}</tspan></text>}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S16Subamostra({ pagina }: { pagina?: Pagina }) {
  const [c0] = useState(cheia);
  const [f, setF] = useState(0.5);
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
  const min0 = Math.min(...c0);
  const todasAbaixo = pronto && fim.every((v) => v < c0[T]);
  const ganhoMin = pronto ? min0 - media(mins) : 0;
  const ops = [
    { texto: "Piora: cada árvore vê menos propostas", certa: false, retorno: <>Cada árvore vê menos, mas são {T} árvores, e o sorteio muda a cada uma. Com {T} árvores, as sementes ficam {pronto ? <>entre {num(Math.min(...fim), 4)} e {num(Math.max(...fim), 4)}</> : "abaixo"}, contra {num(c0[T], 4)} sem sorteio.</> },
    { texto: "Melhora, em todas as sementes", certa: true, retorno: <>Isso: cada árvore vê outra amostra, e a decoreba do ruído demora mais.</> },
    { texto: "Não muda: só acrescenta ruído", certa: false, retorno: <>Acrescenta ruído a cada árvore, e é isso que regulariza: com {T} árvores, a média das sementes fica {pronto ? num(media(fim), 4) : "abaixo"} contra {num(c0[T], 4)}.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  return (
    <Quadro slug="c6p16" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Cada árvore vê só metade das propostas: a validação melhora ou piora?"}
      sub={revelado ? undefined : `Antes de cada árvore, sorteiam-se ${pct(0.5, 0)} das ${int(NA)} propostas de ajuste. Preveja o efeito.`}
      conclusao={!revelado
        ? <>Sem sorteio, a perda de validação desce até {num(min0, 4)} e chega a {num(c0[T], 4)} com {T} árvores, a curva do <LinkSlide slug="c6p15">slide 15</LinkSlide>. Com subamostra de {pct(0.5, 0)}, o que acontece?</>
        : !pronto ? <>Sorteando: {cs.length} de {SEMENTES.length} sementes calculadas para a subamostra de {pct(f, 0)}.</>
        : <>Subamostra de {pct(f, 0)}: com {T} árvores, as {SEMENTES.length} sementes ficam entre {num(Math.min(...fim), 4)} e {num(Math.max(...fim), 4)}, {todasAbaixo ? <b>todas abaixo de {num(c0[T], 4)}</b> : <>contra {num(c0[T], 4)}</>} sem sorteio. No mínimo, a média das sementes é {num(media(mins), 4)} contra {num(min0, 4)}: diferença de {num(Math.abs(ganhoMin), 4)}, {Math.abs(ganhoMin) < Math.max(...mins) - Math.min(...mins) ? "menor" : "maior"} que a faixa entre sementes ({num(Math.min(...mins), 4)} a {num(Math.max(...mins), 4)}). A seguir, o <LinkSlide slug="c6p17">slide 17</LinkSlide> compara com a logística.</>}
      fonte={`Validação: ${int(NV)} propostas, ${DV} defaults; ajuste: ${int(NA)}. η = ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo ${CFG_CARTEIRA.minFolha}, ${T} árvores; subamostra sem reposição a cada árvore, sementes 1 a ${SEMENTES.length} (gbm.ts). Friedman (2002), Computational Statistics & Data Analysis 38(4).`}>
      <Painel>
        <Curvas c0={c0} cs={cs} revelado={revelado} f={f} />
      </Painel>
      <Painel>
        <div className="q6-s16-ctl"><div><p className="q7-k">Fração sorteada por árvore{revelado ? "" : ": depois da previsão"}</p><Seg rotulo="Fração sorteada por árvore" opcoes={FRACS.map((v) => ({ v, r: pct(v, 0) }))} valor={f} onChange={setF} cor desab={!revelado} /></div></div>
        {revelado && (
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">Perda de validação</th><th>No mínimo</th><th>Com {T} árvores</th></tr></thead>
            <tbody>
              <tr><th>Sem sorteio</th><td>{num(min0, 4)}</td><td>{num(c0[T], 4)}</td></tr>
              <tr data-on="1"><th>Média, {pct(f, 0)}</th><td>{pronto ? num(media(mins), 4) : "·"}</td><td>{pronto ? num(media(fim), 4) : "·"}</td></tr>
              <tr><th>Faixa das sementes</th><td>{pronto ? `${num(Math.min(...mins), 4)} a ${num(Math.max(...mins), 4)}` : "·"}</td><td>{pronto ? `${num(Math.min(...fim), 4)} a ${num(Math.max(...fim), 4)}` : "·"}</td></tr>
            </tbody>
          </table>
        )}
        <Previsao pergunta={`Com subamostra de ${pct(0.5, 0)} e ${T} árvores, a perda de validação...`} opcoes={ops} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q7-botoes q6-fim"><Botao sec onClick={() => { setF(0.5); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
