"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XA, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { SLIDE } from "@/lib/capitulo6/roteiro";
import { escore, estagios, perdaLog } from "@/lib/capitulo6/gbm";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 13 · c6p12 · Profundidade como ordem de interação. Modelos da carteira com a referência do slide 12 (η = 0,1,
 * mínimo 40), mudando só a profundidade (1, 2, 3), cada um parado no mínimo da log loss da validação sorteada (o mesmo
 * critério do slide 16); o seletor de árvores mostra também o modelo de 300 árvores, para ver a "interação" de
 * decoreba. A peça é a log odds ao longo da utilização em três scores, com o atraso fixo em 0 dias. O efeito da utilização é a
 * média da log odds de 50% a 60% menos a de 0% a 10% (uma média por faixa, não um ponto da curva). Os eixos vão até o
 * percentil 95 da utilização no ajuste, e os três scores ficam entre os percentis 5 e 95 do score (calculados aqui e
 * conferidos na tela). Com tocos, cada árvore usa uma variável: as curvas são paralelas e o efeito é o mesmo em
 * qualquer score (calculado, não suposto). A previsão (o que acontece com tocos) trava os seletores até a resposta.
 */
const PROFS = [1, 2, 3] as const;
const SCORES = [750, 820, 900];
const quantil = (v: number[], p: number) => { const s = [...v].sort((a, b) => a - b); const h = (s.length - 1) * p; const l = Math.floor(h); return s[l] + (s[Math.ceil(h)] - s[l]) * (h - l); };
const U95 = quantil(XA.map((x) => x[0]), 0.95), S05 = quantil(XA.map((x) => x[2]), 0.05), S95 = quantil(XA.map((x) => x[2]), 0.95);
const BAIXA: [number, number] = [0, 10], ALTA: [number, number] = [50, 60];
const DV = YV.reduce((s, v) => s + v, 0);
type Arv = "parada" | 300;

function calcular() {
  return PROFS.map((p) => {
    const m300 = modelo({ ...CFG_CARTEIRA, profundidade: p });
    const pv = estagios(m300, XV).map((F) => perdaLog(F, YV));
    const k = pv.reduce((b, v, i) => (i >= 1 && v < pv[b] ? i : b), 1);
    return { p, k, min: pv[k], fim: pv[CFG_CARTEIRA.arvores], m300, mk: modelo({ ...CFG_CARTEIRA, profundidade: p, arvores: k }) };
  });
}
let CACHE: ReturnType<typeof calcular> | null = null;
/** Cálculo preguiçoso: só o slide visitado paga os ajustes (o registro importa todos os quadros). */
const dados = () => (CACHE ??= calcular());

type Mod = ReturnType<typeof calcular>[number]["mk"];
/** Média da log odds numa faixa de utilização, de meio em meio ponto. */
const mediaFaixa = (m: Mod, [a, b]: [number, number], atr: number, s: number) => { let t = 0, n = 0; for (let u = a; u <= b + 1e-9; u += 0.5) { t += escore(m, [u, atr, s]); n++; } return t / n; };
/** Efeito da utilização (faixa alta menos faixa baixa), em log odds, para cada score. */
const efeito = (m: Mod, atr: number) => SCORES.map((s) => mediaFaixa(m, ALTA, atr, s) - mediaFaixa(m, BAIXA, atr, s));
const TRACOS = ["", "10 6", "3 5"];
const sn = (v: number) => `${v >= 0 ? "+" : "−"}${num(Math.abs(v), 2)}`;

function Curvas({ m, atr, ds, p, k }: { m: Mod; atr: number; ds: number[]; p: number; k: number }) {
  const cur = useMemo(() => SCORES.map((s) => Array.from({ length: 123 }, (_, i) => (i / 122) * U95).map((u) => ({ u, f: escore(m, [u, atr, s]) }))), [m, atr]);
  const todos = cur.flat().map((c) => c.f);
  const c0 = Math.min(...todos), c1 = Math.max(...todos), meio = (c0 + c1) / 2, span = Math.max(1, c1 - c0);
  const lo = Math.floor((meio - span * 0.6) * 2) / 2, hi = Math.ceil((meio + span * 0.6) * 2) / 2;
  return (
    <Grafico titulo="Log odds por utilização, em três scores" sub={`profundidade ${p}, ${k} árvores, atraso ${atr} dias`} rotulo={`Log odds por utilização com profundidade ${p} e ${k} árvores, atraso ${atr} dias; efeito da faixa de ${BAIXA[0]}% a ${BAIXA[1]}% à de ${ALTA[0]}% a ${ALTA[1]}%: ${SCORES.map((s, i) => `score ${s} ${sn(ds[i])}`).join(", ")}`} arCelular="4 / 3">
      {(d) => {
        const g = margens(d.fs, { l: 3.2, r: 5.6, t: 1, b: 2.8 });
        const x = escala([0, U95], [g.l, d.w - g.r]), y = escala([lo, hi], [d.h - g.b, g.t]);
        const yt: number[] = []; const passo = hi - lo > 3 ? 1 : 0.5; for (let v = Math.ceil(lo / passo) * passo; v <= hi + 1e-9; v += passo) yt.push(v);
        // rótulos na ponta, afastados quando encostam
        const fim = cur.map((c) => y(c[c.length - 1].f)); const ord = fim.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
        for (let i = 1; i < ord.length; i++) if (ord[i][0] - ord[i - 1][0] < d.fs * 2.2) ord[i][0] = ord[i - 1][0] + d.fs * 2.2;
        const pos = new Array(3); ord.forEach(([v, i]) => (pos[i] = v));
        return (
          <g>
            {[BAIXA, ALTA].map(([a, b]) => <rect key={a} x={x(a)} y={g.t} width={x(b) - x(a)} height={d.h - g.b - g.t} fill="#EEF0F3" />)}
            <Eixos x={x} y={y} xt={[0, 10, 20, 30, 40, 50, 60]} yt={yt} fx={(v) => `${v}%`} fy={(v) => num(v, 1)} xTit="utilização do limite" yTit="log odds" />
            {cur.map((c, i) => <path key={i} className="q7-linha q7-linha--prob" strokeWidth={3.4} strokeDasharray={TRACOS[i] || undefined} d={caminho(c.map((q) => ({ x: x(q.u), y: y(q.f) })))} />)}
            {cur.map((_, i) => <text key={i} className="q7-rot--peq" x={x(U95) + d.fs * 0.4} y={pos[i] - d.fs * 0.2} style={{ fill: "#176C73", fontWeight: 700 }}><tspan x={x(U95) + d.fs * 0.4}>{`score ${SCORES[i]}`}</tspan><tspan x={x(U95) + d.fs * 0.4} dy="1.1em">{sn(ds[i])}</tspan></text>)}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S12Profundidade({ pagina }: { pagina?: Pagina }) {
  const D = dados();
  const [p, setP] = useState(2);
  const [arv, setArv] = useState<Arv>("parada");
  const atr = 0;
  const [esc, setEsc] = useState<number | null>(null);
  const R = D[p - 1], m = arv === "parada" ? R.mk : R.m300, k = arv === "parada" ? R.k : CFG_CARTEIRA.arvores;
  const ds = efeito(m, atr);
  const d1 = efeito(D[0].mk, 0);
  const iguais = Math.max(...ds) - Math.min(...ds) < 1e-9;
  const melhor = D.reduce((b, r) => (r.min < b.min ? r : b), D[0]);
  const ops = [
    { texto: "Ficam paralelas: mesmo efeito em todo score", certa: true, retorno: <>Isso: tocos parados em {D[0].k} árvores somam {sn(d1[0])} nos três scores.</> },
    { texto: "Continuam a se afastar", certa: false, retorno: <>Um toco corta uma variável só; nenhuma folha sabe o score e a utilização ao mesmo tempo. Sem folha conjunta, o efeito de uma não muda com a outra.</> },
    { texto: "Viram retas, como na logística", certa: false, retorno: <>Tocos dão degraus, não retas: cada árvore soma um valor de cada lado de um corte. O que eles têm da logística é a soma sem interação.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  const escolher = (i: number | null) => { setEsc(i); if (i !== null && ops[i].certa) { setP(1); setArv("parada"); } };
  const restaurar = () => { setP(2); setArv("parada"); setEsc(null); };
  const efeitoTxt = <>da faixa de {BAIXA[0]}% a {BAIXA[1]}% de utilização à de {ALTA[0]}% a {ALTA[1]}%, a log odds muda <b>{sn(ds[0])}</b> com score {SCORES[0]} e <b>{sn(ds[2])}</b> com {SCORES[2]}</>;
  return (
    <Quadro slug="c6p12" pagina={pagina} layout="gl"
      sub={revelado ? undefined : "Cada modelo parado pela validação sorteada; só muda a profundidade."}
      conclusao={!revelado
        ? <>Profundidade 2, parada em {R.k} árvores: {efeitoTxt}. E com tocos, de profundidade 1?</>
        : <>Profundidade {p}, {k} árvores: {efeitoTxt}{iguais ? ": curvas paralelas, modelo aditivo." : ": o efeito de uma variável depende da outra."} {arv === 300
          ? <>Sem parada, a validação piora de {num(R.min, 4)} para {num(R.fim, 4)}: interação de decoreba.</>
          : <>Interação só vale se validar: aqui a melhor perda é a da profundidade {melhor.p} ({num(melhor.min, 4)}).</>} O <LinkSlide slug="c6p13">slide {SLIDE.c6p13.n}</LinkSlide> junta os quatro controles.</>}
      fonte={`Ajuste: ${int(NA)} propostas; validação sorteada: ${int(NV)}, ${DV} defaults. η ${num(CFG_CARTEIRA.eta, 1)}, mínimo ${CFG_CARTEIRA.minFolha} (gbm.ts). Eixo até o percentil 95 da utilização (${num(U95, 1)}%); scores entre os percentis 5 e 95 (${int(S05)} e ${int(S95)}). Efeito: média nas faixas cinza, a alta menos a baixa.`}>
      <Painel>
        <Curvas m={m} atr={atr} ds={ds} p={p} k={k} />
      </Painel>
      <Painel>
        <div className="q6-s12-ctl">
          <div><p className="q7-k">Profundidade{revelado ? "" : ": depois da previsão"}</p><Seg rotulo="Profundidade das árvores" opcoes={PROFS.map((v) => ({ v, r: v === 1 ? "1: tocos" : String(v) }))} valor={p} onChange={setP} cor desab={!revelado} /></div>
          <div><p className="q7-k">Árvores</p><Seg rotulo="Número de árvores" opcoes={[{ v: "parada" as Arv, r: `parada (${R.k})` }, { v: 300 as Arv, r: "300" }]} valor={arv} onChange={setArv} cor desab={!revelado} /></div>
        </div>
        <Previsao pergunta="Com tocos (profundidade 1), as três curvas de log odds..." opcoes={ops} escolha={esc} onEscolha={escolher} recolher />
        {revelado && (
          <table className="q7-tab q6-s12-tab">
            <thead><tr><th className="q7-t-l">Validação sorteada</th>{D.map((r) => <th key={r.p}>{r.p === 1 ? "Tocos" : `Prof. ${r.p}`}</th>)}</tr></thead>
            <tbody>
              <tr><th>Parada, árvores</th>{D.map((r) => <td key={r.p}>{r.k}</td>)}</tr>
              <tr data-on="1"><th>Perda mínima</th>{D.map((r) => <td key={r.p}>{r === melhor ? <b>{num(r.min, 4)}</b> : num(r.min, 4)}</td>)}</tr>
            </tbody>
          </table>
        )}
        <div className="q7-botoes q6-fim"><Botao sec onClick={restaurar}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
