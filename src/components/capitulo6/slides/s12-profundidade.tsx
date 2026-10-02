"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Eixos, escala, Expandir, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { escore, estagios, perdaLog, sigmoide } from "@/lib/capitulo6/gbm";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 12 · c6p12 · Profundidade como ordem de interação. Três modelos da carteira com a referência do slide 11 (η = 0,1,
 * mínimo 40, 300 árvores), mudando só a profundidade (1, 2, 3). À esquerda, a superfície de PD em utilização × score
 * com o atraso fixo; à direita, as log odds ao longo da utilização em três scores. Com tocos (profundidade 1) cada
 * árvore usa uma variável e o modelo é uma soma de funções de uma variável: as três curvas são paralelas, e o ganho de
 * 0% a 60% de utilização é o mesmo em qualquer score (calculado, não suposto). Com profundidade 2, as folhas combinam
 * duas variáveis e as curvas se afastam. A faixa dos eixos vai dos percentis 5 a 95 do ajuste (utilização até 61%,
 * score de 712 a 927). A previsão (o que acontece com tocos) trava a troca de profundidade até a resposta certa.
 */
const PROFS = [1, 2, 3] as const;
const ATRASOS = [0, 5, 15];
const SCORES = [700, 800, 900];
const U_MAX = 65, U_DELTA = 60, S_MIN = 700, S_MAX = 940;
const NU = 52, NS = 24;
const mod = (p: number) => modelo({ ...CFG_CARTEIRA, profundidade: p });
/** Ganho em log odds de 0% a 60% de utilização, para cada score, com o atraso fixo. */
const delta = (p: number, atr: number) => SCORES.map((s) => escore(mod(p), [U_DELTA, atr, s]) - escore(mod(p), [0, atr, s]));
const cacheV = new Map<number, { min: number; em: number }>();
/** Melhor perda de validação ao longo das 300 árvores, por profundidade (para a pergunta "a interação paga?"). */
function melhorVal(p: number) {
  let r = cacheV.get(p); if (!r) { const pv = estagios(mod(p), XV).map((F) => perdaLog(F, YV)); const min = Math.min(...pv); r = { min, em: pv.indexOf(min) }; cacheV.set(p, r); } return r;
}
const tons = ["#F2F7F7", "#C7E1E1", "#8CC2C3", "#4A9A9C", "#176C73", "#0B474D"];
function cor(v: number) { const t = Math.max(0, Math.min(1, v)) * (tons.length - 1); const i = Math.min(tons.length - 2, Math.floor(t)); const f = t - i; const h = (c: string) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)); const a = h(tons[i]), b = h(tons[i + 1]); return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(",")})`; }
const TRACOS = ["", "10 6", "3 5"];

function Superficie({ p, atr }: { p: number; atr: number }) {
  const grade = useMemo(() => { const m = mod(p); return Array.from({ length: NS }, (_, j) => Array.from({ length: NU }, (_, i) => sigmoide(escore(m, [((i + 0.5) / NU) * U_MAX, atr, S_MIN + ((j + 0.5) / NS) * (S_MAX - S_MIN)])))); }, [p, atr]);
  const pmax = Math.max(0.1, Math.ceil(Math.max(...grade.flat()) * 10) / 10);
  return (
    <Grafico titulo="PD por utilização e score" sub={`atraso ${atr} dias`} rotulo={`Mapa de PD com profundidade ${p}, atraso fixo em ${atr} dias: utilização de 0% a ${U_MAX}% e score de ${S_MIN} a ${S_MAX}; PD de ${pct(Math.min(...grade.flat()), 1)} a ${pct(Math.max(...grade.flat()), 1)}`} arCelular="1 / 1">
      {(d) => {
        const g = margens(d.fs, { l: 3, r: 0.6, t: 1.4, b: 4.6 });
        const x = escala([0, U_MAX], [g.l, d.w - g.r]), y = escala([S_MIN, S_MAX], [d.h - g.b, g.t]);
        const cw = (x(U_MAX) - x(0)) / NU, ch = (y(S_MIN) - y(S_MAX)) / NS;
        const lx = g.l, lw = Math.min(d.w - g.l - g.r, d.fs * 14), ly = d.h - d.fs * 1.5;
        return (
          <g>
            {grade.map((lin, j) => lin.map((v, i) => <rect key={`${i}-${j}`} x={x(0) + i * cw} y={y(S_MIN) - (j + 1) * ch} width={cw + 0.6} height={ch + 0.6} fill={cor(Math.sqrt(v / pmax))} />))}
            {SCORES.map((s, k) => <g key={s}><line x1={x(0)} x2={x(U_MAX)} y1={y(s)} y2={y(s)} stroke="#fff" strokeWidth={3} strokeDasharray={TRACOS[k] || undefined} /><line x1={x(0)} x2={x(U_MAX)} y1={y(s)} y2={y(s)} stroke="#00205B" strokeWidth={1.5} strokeDasharray={TRACOS[k] || undefined} /></g>)}
            <Eixos x={x} y={y} xt={[0, 20, 40, 60]} yt={[700, 800, 900]} fx={(v) => `${v}%`} fy={(v) => int(v)} xTit="utilização do limite" yTit="score" grade={false} />
            <defs><linearGradient id="q6s12g">{tons.map((c, k) => <stop key={k} offset={k / (tons.length - 1)} stopColor={c} />)}</linearGradient></defs>
            <rect x={lx} y={ly - d.fs * 0.45} width={lw} height={d.fs * 0.55} fill="url(#q6s12g)" stroke="#C9CDD5" />
            <text className="q7-tick" x={lx} y={ly + d.fs * 0.95}>PD 0%</text>
            <text className="q7-tick" x={lx + lw / 2} y={ly + d.fs * 0.95} textAnchor="middle">{pct(pmax / 4, 1)}</text>
            <text className="q7-tick" x={lx + lw} y={ly + d.fs * 0.95} textAnchor="end">{pct(pmax, 0)}</text>
          </g>
        );
      }}
    </Grafico>
  );
}

function Cortes({ p, atr, ds }: { p: number; atr: number; ds: number[] }) {
  const cur = useMemo(() => { const m = mod(p); return SCORES.map((s) => Array.from({ length: 131 }, (_, i) => (i / 130) * U_MAX).map((u) => ({ u, f: escore(m, [u, atr, s]) }))); }, [p, atr]);
  const todos = cur.flat().map((c) => c.f);
  const lo = Math.floor(Math.min(...todos)), hi = Math.ceil(Math.max(...todos));
  return (
    <Grafico titulo="Log odds" sub={`rótulo: de 0% a ${U_DELTA}%`} rotulo={`Log odds por utilização com profundidade ${p}, atraso ${atr} dias, para scores ${SCORES.join(", ")}`} arCelular="1 / 1">
      {(d) => {
        const g = margens(d.fs, { l: 2.6, r: 4.8, t: 1.4, b: 2.7 });
        const x = escala([0, U_MAX], [g.l, d.w - g.r]), y = escala([lo, hi], [d.h - g.b, g.t]);
        const yt = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
        // rótulos na ponta, afastados quando encostam
        const fim = cur.map((c) => y(c[c.length - 1].f)); const ord = fim.map((v, k) => [v, k]).sort((a, b) => a[0] - b[0]);
        for (let k = 1; k < ord.length; k++) if (ord[k][0] - ord[k - 1][0] < d.fs * 2.1) ord[k][0] = ord[k - 1][0] + d.fs * 2.1;
        const pos = new Array(3); ord.forEach(([v, k]) => (pos[k] = v));
        return (
          <g>
            <Eixos x={x} y={y} xt={[0, 20, 40, 60]} yt={yt} fx={(v) => `${v}%`} fy={(v) => num(v, 0)} xTit="utilização do limite" yTit="log odds" />
            <line x1={x(U_DELTA)} x2={x(U_DELTA)} y1={g.t} y2={d.h - g.b} stroke="#C9CDD5" strokeWidth={1.5} strokeDasharray="4 5" />
            {cur.map((c, k) => <path key={k} className="q7-linha q7-linha--prob" strokeWidth={3.2} strokeDasharray={TRACOS[k] || undefined} d={caminho(c.map((q) => ({ x: x(q.u), y: y(q.f) })))} />)}
            {cur.map((_, k) => <text key={k} className="q7-rot--peq" x={x(U_MAX) + d.fs * 0.35} y={pos[k] - d.fs * 0.2} style={{ fill: "#176C73", fontWeight: 700 }}><tspan x={x(U_MAX) + d.fs * 0.35}>{`score ${SCORES[k]}`}</tspan><tspan x={x(U_MAX) + d.fs * 0.35} dy="1.1em">{`${ds[k] >= 0 ? "+" : "−"}${num(Math.abs(ds[k]), 2)}`}</tspan></text>)}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S12Profundidade({ pagina }: { pagina?: Pagina }) {
  const [p, setP] = useState(2);
  const [atr, setAtr] = useState(0);
  const [esc, setEsc] = useState<number | null>(null);
  const ds = useMemo(() => delta(p, atr), [p, atr]);
  const d1 = useMemo(() => delta(1, 0), []);
  const iguais = Math.max(...ds) - Math.min(...ds) < 1e-9;
  const sn = (v: number) => `${v >= 0 ? "+" : "−"}${num(Math.abs(v), 2)}`;
  const ops = [
    { texto: "Ficam paralelas: a utilização soma o mesmo em qualquer score", certa: true, retorno: <>Isso: com tocos, de 0% a {U_DELTA}% a utilização soma {sn(d1[0])} em log odds nos três scores.</> },
    { texto: "Continuam a se afastar, como com profundidade 2", certa: false, retorno: <>Um toco corta uma variável só; nenhuma folha sabe o score e a utilização ao mesmo tempo. Sem folha conjunta, não há como o efeito de uma mudar com a outra.</> },
    { texto: "Viram retas, como na logística", certa: false, retorno: <>Tocos dão degraus, não retas: cada árvore soma um valor de cada lado de um corte. O que eles têm da logística é a soma sem interação.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  const escolher = (i: number | null) => { setEsc(i); if (i !== null && ops[i].certa) setP(1); };
  const [vals, setVals] = useState<{ p: number; min: number; em: number }[] | null>(null);
  return (
    <Quadro slug="c6p12" pagina={pagina} layout="gl"
      sub={revelado ? undefined : "Mesma carteira e mesma taxa; só muda a profundidade das árvores. O que ela muda na forma da PD?"}
      conclusao={!revelado
        ? <>Profundidade 2: de 0% a {U_DELTA}% de utilização, as log odds mudam {sn(ds[0])} com score {SCORES[0]} e {sn(ds[2])} com score {SCORES[2]}. E com tocos, de profundidade 1?</>
        : iguais
          ? <>Profundidade {p}: de 0% a {U_DELTA}% de utilização soma <b>{sn(ds[0])}</b> em log odds com score {SCORES[0]}, {SCORES[1]} ou {SCORES[2]}. Curvas paralelas: o modelo é uma soma de uma função por variável, como na logística, só que em degraus.</>
          : <>Profundidade {p}: a mesma utilização soma <b>{sn(ds[0])}</b> com score {SCORES[0]} e <b>{sn(ds[2])}</b> com score {SCORES[2]}: o efeito de uma variável depende da outra. Mais profundidade, mais complexidade: o <LinkSlide slug="c6p13">slide 13</LinkSlide> junta os quatro controles.</>}
      fonte={`Ajuste: ${int(NA)} propostas; validação: ${int(NV)}. η = ${num(CFG_CARTEIRA.eta, 1)}, mínimo ${CFG_CARTEIRA.minFolha} por folha, ${CFG_CARTEIRA.arvores} árvores, profundidade 1, 2 ou 3 (gbm.ts). Eixos nos percentis 5 a 95 do ajuste; a terceira variável, o atraso, fica fixa.`}>
      <Painel>
        <div className="q6-s12-g">
          <Superficie p={p} atr={atr} />
          <Cortes p={p} atr={atr} ds={ds} />
        </div>
      </Painel>
      <Painel>
        <div className="q6-s12-ctl">
          <div><p className="q7-k">Profundidade{revelado ? "" : ": depois da previsão"}</p><Seg rotulo="Profundidade das árvores" opcoes={PROFS.map((v) => ({ v, r: v === 1 ? "1: tocos" : String(v) }))} valor={p} onChange={setP} cor desab={!revelado} /></div>
          <div><p className="q7-k">Atraso fixo</p><Seg rotulo="Atraso fixo, em dias" opcoes={ATRASOS.map((v) => ({ v, r: `${v} dias` }))} valor={atr} onChange={setAtr} cor /></div>
        </div>
        <Previsao pergunta="Com tocos (profundidade 1), as três curvas de log odds..." opcoes={ops} escolha={esc} onEscolha={escolher} recolher />
        {revelado && (
          <Expandir resumo="A interação paga na validação?">
            {vals ? <>
              <table className="q7-tab"><thead><tr><th className="q7-t-l">Profundidade</th><th>Melhor perda de validação</th><th>Com</th></tr></thead>
                <tbody>{vals.map((v) => <tr key={v.p}><th>{v.p}</th><td>{num(v.min, 4)}</td><td>{v.em} árvores</td></tr>)}</tbody></table>
              <p className="q7-nota">{vals[0].min < vals[1].min ? "Aqui não: nesta carteira, os tocos validam melhor que as árvores mais fundas." : "Aqui a profundidade 2 valida melhor que os tocos."} Com {int(NV)} propostas e {YV.reduce((a, b) => a + b, 0)} defaults, diferenças na terceira casa pedem cautela.</p>
            </> : <Botao onClick={() => setVals(PROFS.map((q) => ({ p: q, ...melhorVal(q) })))}>Calcular nas {int(NV)} de validação</Botao>}
          </Expandir>
        )}
        <div className="q7-botoes q6-fim"><Botao sec onClick={() => { setP(2); setAtr(0); setEsc(null); setVals(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
