"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, modelo, NA, NV, XA, XV, YA, YV } from "@/lib/capitulo6/dados";
import { auc, dependenciaParcialRapida, estagios, perdaLog, type Modelo, type Opcoes } from "@/lib/capitulo6/gbm";
import { delong, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 20 · c6p20 · Restrição monotônica. Na amostra de ajuste, as propostas com 31 a 60 dias de atraso não tiveram default
 * (contagem e intervalo de Wilson calculados na tela). O boosting da carteira (taxa 0,1, profundidade 2) com folhas
 * pequenas e muitas árvores aprende uma PD que cai quando o atraso sobe: a dependência parcial (dependenciaParcial de
 * gbm.ts, a PD média da carteira de ajuste com o atraso fixado em cada valor) mostra isso. Com monotonia [utilização
 * +1, atraso +1, score −1] (a opção monotonia de gbm.ts, conferida por propriedade no teste), a curva não cai, o que é
 * verificado na tela (trechos de queda contados). O custo na validação é medido com AUC, log loss e IC de DeLong
 * pareado; com "Parada", cada modelo usa o próprio mínimo da log loss de validação. A dependência parcial é constante
 * entre cortes do atraso nas árvores: calcula-se um valor por intervalo (o mesmo resultado, mais rápido).
 */
type Arv = "parada" | 100 | 300;
const MONO = [1, 1, -1] as const;
const GRADE = Array.from({ length: 61 }, (_, i) => i);
const FAIXAS: [number, number][] = [[0, 0], [1, 10], [11, 20], [21, 30], [31, 60]];
const OBS = FAIXAS.map(([a, b]) => {
  let n = 0, d = 0; XA.forEach((x, i) => { if (x[1] >= a && x[1] <= b) { n++; d += YA[i]; } });
  return { a, b, n, d, ic: wilson(d, n) };
});
const ALTA = OBS[OBS.length - 1];
const DA = YA.reduce((s, v) => s + v, 0), DV = YV.reduce((s, v) => s + v, 0);

const corta = (mod: Modelo, k: number) => ({ ...mod, arvores: mod.arvores.slice(0, k) });
/** Dependência parcial no atraso em toda a GRADE, um ponto por intervalo entre cortes (biblioteca, conferida no teste). */
const dpAtraso = (mod: Modelo) => dependenciaParcialRapida(mod, XA, 1, GRADE);
const quedas = (dp: number[]) => dp.reduce((s, v, i) => s + (i > 0 && v < dp[i - 1] - 1e-12 ? 1 : 0), 0);

type Ajuste = { mod: Modelo; ev: number[][]; parada: number };
const AJ = new Map<string, Ajuste>();
function ajuste(minFolha: number, mono: boolean): Ajuste {
  const k = `${minFolha}-${mono}`; let a = AJ.get(k);
  if (!a) {
    const o: Opcoes = { ...CFG_CARTEIRA, minFolha, ...(mono ? { monotonia: MONO } : {}) };
    const mod = modelo(o); const ev = estagios(mod, XV); const ll = ev.map((F) => perdaLog(F, YV));
    a = { mod, ev, parada: ll.reduce((b, v, i) => (i >= 1 && v < ll[b] ? i : b), 1) }; AJ.set(k, a);
  }
  return a;
}
const DP = new Map<string, number[]>();
function estado(mf: number, arv: Arv) {
  const r = [false, true].map((mono) => {
    const a = ajuste(mf, mono); const k = arv === "parada" ? a.parada : arv; const key = `${mf}-${mono}-${k}`;
    let dp = DP.get(key); if (!dp) { dp = dpAtraso(corta(a.mod, k)); DP.set(key, dp); }
    return { k, dp, auc: auc(YV, a.ev[k]), ll: perdaLog(a.ev[k], YV), F: a.ev[k] };
  });
  return { livre: r[0], mono: r[1], dl: delong(YV, r[1].F, r[0].F) };
}
const MF0 = 10, ARV0: Arv = 300;
function calcular() {
  const E0 = estado(MF0, ARV0);
  const at = (dp: number[], g: number) => dp[GRADE.indexOf(g)];
  const P30 = at(E0.livre.dp, 30), P_FIM = at(E0.livre.dp, 60);
  const PICO = GRADE.reduce((b, g) => (g <= 30 && E0.livre.dp[g] > E0.livre.dp[b] ? g : b), 0);
  const CAI = P_FIM < P30;
  const G_FIM = GRADE.find((g) => g > 30 && Math.abs(E0.livre.dp[g] - P_FIM) < 1e-12) ?? 60;

  const OPS = [
    { texto: "Sobe, como manda o crédito", certa: false, retorno: <>O modelo não conhece a lógica de crédito, só os dados: as {ALTA.n} propostas acima de 30 dias tiveram {ALTA.d} defaults, e a PD livre vai de {pct(P30, 1)} (30 dias) a {pct(P_FIM, 1)}.</> },
    { texto: CAI ? `Cai: ${ALTA.n} propostas sem default ensinam isso` : "Cai", certa: CAI, retorno: <>Isso: de {pct(P30, 1)} com 30 dias para {pct(P_FIM, 1)} a partir de {G_FIM} dias; a PD mais alta, {pct(E0.livre.dp[PICO], 1)}, fica em {PICO} dias.</> },
    { texto: "Fica estável: são poucas propostas", certa: !CAI, retorno: <>Com mínimo de {MF0} por folha, {ALTA.n} propostas bastam para uma folha só delas; ao longo de {E0.livre.k} árvores, o modelo as usa.</> },
  ];
  return { E0, at, P30, P_FIM, PICO, CAI, G_FIM, OPS };
}
let CACHE: ReturnType<typeof calcular> | null = null;
/** Cálculo preguiçoso: só o slide visitado paga o ajuste dos modelos (o registro importa todos os quadros). */
const dados = () => (CACHE ??= calcular());

function Curvas({ d, e, ver }: { d: Dim; e: ReturnType<typeof estado>; ver: boolean }) {
  const m = margens(d.fs, { l: 3.4, r: 6.8, t: 1.4, b: 2.9 });
  const ymax = Math.ceil(Math.max(...OBS.map((o) => o.ic!.hi), ...(ver ? [...e.livre.dp, ...e.mono.dp] : [])) * 20) / 20;
  const x = escala([0, 60], [m.l, d.w - m.r]), y = escala([0, ymax], [d.h - m.b, m.t]);
  const yt: number[] = []; for (let t = 0; t <= ymax + 1e-9; t += ymax > 0.3 ? 0.1 : 0.05) yt.push(Math.round(t * 100) / 100);
  const degraus = (dp: number[]) => caminho(GRADE.flatMap((g, i) => (i ? [{ x: x(g - 0.5), y: y(dp[i - 1]) }, { x: x(g - 0.5), y: y(dp[i]) }] : [{ x: x(0), y: y(dp[0]) }])).concat([{ x: x(60), y: y(dp[dp.length - 1]) }]));
  const yl = y(e.livre.dp[60]), ym = y(e.mono.dp[60]); const sep = Math.abs(yl - ym) < d.fs * 1.1 ? (yl < ym ? -0.6 : 0.6) * d.fs : 0;
  return (
    <g>
      <rect x={x(30.5)} y={m.t} width={x(60) - x(30.5)} height={d.h - m.b - m.t} fill="#F5F4F0" />
      <text className="q7-rot--peq" x={x(45)} y={m.t} dy="1.1em" textAnchor="middle" style={{ fill: "#5B6475" }}>31 a 60 dias: {ALTA.n} propostas no ajuste</text>
      <Eixos x={x} y={y} xt={[0, 10, 20, 30, 40, 50, 60]} yt={yt} fx={(v) => String(v)} fy={(v) => pct(v, 0)} xTit="Atraso máximo em 6 meses (dias)" yTit="PD (dependência parcial) e default observado" />
      {OBS.map((o) => {
        const cx = x((o.a + o.b) / 2), w = Math.max(d.fs * 0.6, x(o.b + 0.5) - x(o.a - 0.5));
        return (
          <g key={o.a}>
            <line x1={cx} x2={cx} y1={y(o.ic!.lo)} y2={y(o.ic!.hi)} stroke="#8C2332" strokeOpacity={0.55} strokeWidth={Math.max(2, d.fs * 0.14)} />
            <line x1={cx - w / 2} x2={cx + w / 2} y1={y(o.d / o.n)} y2={y(o.d / o.n)} stroke="#8C2332" strokeWidth={2} strokeOpacity={0.5} />
            <rect x={cx - d.fs * 0.3} y={y(o.d / o.n) - d.fs * 0.3} width={d.fs * 0.6} height={d.fs * 0.6} fill="#8C2332" />
            <text className="q7-rot--peq" x={o.a === ALTA.a || o.a === 0 ? cx + d.fs * 0.45 : cx} y={o.a === ALTA.a ? y(0) : y(o.ic!.hi)} dy={o.a === ALTA.a ? "-.5em" : "-.45em"} textAnchor={o.a === ALTA.a || o.a === 0 ? "start" : "middle"} style={{ fill: "#8C2332", fontWeight: o.a === ALTA.a ? 700 : 500, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{o.d}/{o.n}</text>
          </g>
        );
      })}
      <text className="q7-rot--peq" x={x(ALTA.a + 1)} y={y(ALTA.ic!.hi)} dy="-.45em" style={{ fill: "#8C2332" }}>■ observado, IC até {pct(ALTA.ic!.hi, 1)}</text>
      {ver ? <>
        <path d={degraus(e.livre.dp)} fill="none" stroke="#176C73" strokeWidth={3} strokeDasharray="9 6" />
        <path d={degraus(e.mono.dp)} fill="none" stroke="#176C73" strokeWidth={4.5} />
        <text className="q7-rot--peq" x={x(60) + d.fs * 0.4} y={yl + sep} dy=".35em" style={{ fill: "#176C73", fontWeight: 700 }}>livre</text>
        <text className="q7-rot--peq" x={x(60) + d.fs * 0.4} y={ym - sep} dy=".35em" style={{ fill: "#176C73", fontWeight: 700 }}>monotônico</text>
      </> : <text className="q7-rot--peq" x={x(16)} y={y(ymax * 0.72)} textAnchor="middle" style={{ fill: "#176C73", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.35em", strokeLinejoin: "round" }}><tspan x={x(16)}>PD do modelo livre:</tspan><tspan x={x(16)} dy="1.2em">abre depois da previsão</tspan></text>}
    </g>
  );
}

export function S20Monotonia({ pagina }: { pagina?: Pagina }) {
  const { E0, OPS } = dados();
  const [esc, setEsc] = useState<number | null>(null);
  const [mf, setMf] = useState(MF0);
  const [arv, setArv] = useState<Arv>(ARV0);
  const revelado = esc !== null && OPS[esc].certa;
  const e = revelado ? estado(mf, arv) : E0;
  const ql = quedas(e.livre.dp), qm = quedas(e.mono.dp);
  const custo = e.mono.auc - e.livre.auc;
  const restaurar = () => { setEsc(null); setMf(MF0); setArv(ARV0); };
  return (
    <Quadro slug="c6p20" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : <>{ALTA.n} propostas com mais de 30 dias de atraso, {ALTA.d === 0 ? "nenhuma" : ALTA.d} em default</>}
      sub={revelado ? undefined : <>Na amostra de ajuste. O que o boosting livre aprende com isso?</>}
      conclusao={!revelado
        ? <>Zero default em {ALTA.n} propostas não prova risco baixo: o intervalo de Wilson vai até <b>{pct(ALTA.ic!.hi, 1)}</b>. Com {ARV0} árvores e mínimo de {MF0} por folha, o que a PD do modelo livre faz acima de 30 dias? Preveja ao lado.</>
        : <>{e.livre.k} árvores, mínimo de {mf}: a PD livre cai em <b>{ql} {ql === 1 ? "trecho" : "trechos"}</b>; com monotonia, em {qm}. Na validação, AUC {num(e.livre.auc, 4)} livre e {num(e.mono.auc, 4)} monotônico (diferença {num(custo, 3)}, IC de {num(e.dl.ic[0], 3)} a {num(e.dl.ic[1], 3)}): {e.dl.ic[0] > 0 ? "com monotonia a ordenação melhora, e o IC exclui zero" : e.dl.ic[1] < 0 ? "a monotonia custa ordenação, e o IC exclui zero" : custo >= 0 ? "a diferença cabe no ruído, e a restrição sai sem custo medido" : "o custo cabe no ruído"}. O <LinkSlide slug="c6p21">slide 21</LinkSlide> leva isso à lista do comitê.</>}
      fonte={`Ajuste: ${int(NA)} propostas, ${DA} defaults; validação: ${int(NV)}, ${DV}. Boosting: taxa 0,1, profundidade 2; monotonia: utilização +1, atraso +1, score −1. Wilson de 95%; IC de DeLong pareado.`}>
      <Painel titulo="PD por atraso, com as outras variáveis da carteira mantidas">
        <Grafico rotulo={`PD por atraso pela dependência parcial. Observado no ajuste: ${OBS.map((o) => `${o.a} a ${o.b} dias, ${o.d} de ${o.n}`).join("; ")}. ${revelado ? `Modelo livre com ${ql} trechos de queda; monotônico com ${qm}.` : "Modelo livre oculto até a previsão."}`} arCelular="5 / 4">
          {(d) => <Curvas d={d} e={e} ver={revelado} />}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de revelar" pergunta={`${ARV0} árvores, mínimo de ${MF0} por folha: e a PD livre acima de 30 dias?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        {revelado && <>
          <div className="q6-s20-ctl">
            <span className="q7-k">Árvores</span>
            <Seg rotulo="Número de árvores" opcoes={[{ v: "parada" as Arv, r: "Parada" }, { v: 100 as Arv, r: "100" }, { v: 300 as Arv, r: "300" }]} valor={arv} onChange={setArv} cor />
            <span className="q7-k">Mínimo por folha</span>
            <Seg rotulo="Mínimo de propostas por folha" opcoes={[{ v: 10, r: "10" }, { v: 40, r: "40" }]} valor={mf} onChange={setMf} cor />
            <Botao sec onClick={restaurar}>Restaurar</Botao>
          </div>
          <table className="q7-tab q6-s20-tab">
            <thead><tr><th className="q7-t-l">Validação</th><th>Árvores</th><th>AUC</th><th>Log loss</th></tr></thead>
            <tbody>
              <tr><th>╌ Livre</th><td>{e.livre.k}</td><td className="q6-val">{num(e.livre.auc, 4)}</td><td className="q6-val">{num(e.livre.ll, 4)}</td></tr>
              <tr><th>━ Monotônico</th><td>{e.mono.k}</td><td className="q6-val">{num(e.mono.auc, 4)}</td><td className="q6-val">{num(e.mono.ll, 4)}</td></tr>
            </tbody>
          </table>
        </>}
      </Painel>
    </Quadro>
  );
}
