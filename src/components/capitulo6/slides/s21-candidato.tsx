"use client";
import { useState, type ReactNode } from "react";
import { Botao, LinkSlide, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, GRID, HP_CANDIDATO, LOGISTICA, RES, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { estagios, logit, perdaLog } from "@/lib/capitulo6/gbm";
import { escoreLogistica } from "@/lib/capitulo6/logistica";
import { delong, wilson, Z95 } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 21 · c6p21 · O fecho. A peça principal é a lista do validador independente, com os números do candidato do comitê:
 * o boosting completo do gerador do curso (hiperparâmetros e variáveis de base.json meta), julgado na validação temporal
 * do gerador (760 propostas, safras 2023-03 a 2023-07; RES de dados.ts). Cada item tem um estado (cumprido, não
 * cumprido, a provar), uma evidência gráfica mínima e dois modos de texto: o veredito e o que o validador deve pedir.
 *   referência linear  dois pontos (as duas AUC) e a barra de ±1,96 erro padrão aproximado de uma AUC isolada (Hanley e
 *                      McNeil, 1982); a régua exibida é a que decide (EMPATA). O gerador não publica as previsões do
 *                      candidato nas 760 (base.json só as traz na janela fora do tempo, congelada para o capítulo 7):
 *                      o DeLong pareado (correlação de 0,95 no slide 17) fica para o validador;
 *   nível              PD média dos dois contra a faixa de Wilson da taxa observada: os dois erram a safra;
 *   escolha            as 12 AUC da grade com a faixa de um erro padrão da melhor (quantas cabem nela, calculado); a
 *                      melhor só aparece depois do acerto ou da terceira tentativa;
 *   monotonia          as sete variáveis do candidato (meta.features), sem o score de bureau dos slides 11 a 20;
 *   janela             a linha das safras (meta.treino, validacao, oot); a janela fora do tempo traz a PD verdadeira
 *                      de cada proposta (base.oot.pt), o que só a base sintética permite.
 * A grade (GRID) começa sem célula escolhida e com o envio desabilitado. Envio errado abre só a célula enviada, sem tom,
 * e diz a direção da maior validação (menos árvores, menos folhas), com o retorno da região da grade; a melhor abre com
 * o acerto, com a célula mais simples dentro de um erro padrão (regra de um erro padrão, não é erro) ou na terceira
 * tentativa. A leitura final fecha a conta do slide 1: o excesso estimado lá (queda do boosting menos a da logística)
 * era otimismo do treino; na validação temporal os dois empatam e erram a mesma safra.
 */
type G = (typeof GRID)[number];
const ARVS = [...new Set(GRID.map((g) => g.max_iter))].sort((a, b) => a - b);
const FOLHAS = [...new Set(GRID.map((g) => g.max_leaf_nodes))].sort((a, b) => a - b);
const cel = (a: number, f: number) => GRID.find((g) => g.max_iter === a && g.max_leaf_nodes === f)!;
const ORD_V = [...GRID].sort((a, b) => b.auc_val - a.auc_val);
const BEST = ORD_V[0], PIOR = ORD_V[ORD_V.length - 1];
const TOP_T = GRID.reduce((b, g) => (g.auc_treino > b.auc_treino ? g : b), GRID[0]);
const HP = HP_CANDIDATO;
const CONFERE = BEST.max_iter === HP.max_iter && BEST.max_leaf_nodes === HP.max_leaf_nodes && BEST.auc_val === HP.auc_val;
const NA_BORDA = BEST.max_iter === ARVS[0] || BEST.max_leaf_nodes === FOLHAS[0];
const META = base.meta;
const NV = META.n_val, DV = Math.round(RES.gbm_val.obs * NV), AV = NV - DV;
const TAXA = wilson(DV, NV)!;
const noWilson = (p: number) => p >= TAXA.lo && p <= TAXA.hi;
const NIVEL_OK = noWilson(RES.gbm_val.pd_media), LOGIT_OK = noWilson(RES.logit_val.pd_media);
/** Erro padrão aproximado de uma AUC isolada (Hanley e McNeil, 1982), com os defaults e adimplentes da validação temporal. */
const epAuc = (A: number) => { const q1 = A / (2 - A), q2 = (2 * A * A) / (1 + A); return Math.sqrt((A * (1 - A) + (DV - 1) * (q1 - A * A) + (AV - 1) * (q2 - A * A)) / (DV * AV)); };
const EP = epAuc(BEST.auc_val);
const REGUA = Z95 * EP;
const DIF_LOG = RES.gbm_val.auc - RES.logit_val.auc;
const EMPATA = Math.abs(DIF_LOG) < REGUA;
/** Mais simples que a melhor (nem mais árvores nem mais folhas) e dentro de um erro padrão dela: a regra de um erro padrão. */
const ACEITA = (g: G) => g !== BEST && g.max_iter <= BEST.max_iter && g.max_leaf_nodes <= BEST.max_leaf_nodes && BEST.auc_val - g.auc_val < EP;
/** Células a menos de um erro padrão da melhor (ela inclusa). */
const N_1EP = GRID.filter((g) => BEST.auc_val - g.auc_val < EP).length;
const F0 = logit(RES.gbm_treino.obs);
const NCEL = GRID.length;
const TENTATIVAS = 3;
/** O excesso do slide 1, com a mesma conta: queda do boosting do treino à validação temporal menos a da logística. */
const EXCESSO = (RES.gbm_treino.auc - RES.gbm_val.auc) - (RES.logit_treino.auc - RES.logit_val.auc);
/** A janela fora do tempo traz a PD verdadeira de cada proposta? (base.oot.pt, uma por proposta) */
const TEM_PT = Array.isArray(base.oot.pt) && base.oot.pt.length === META.n_oot;
if (!TEM_PT) throw new Error("a janela fora do tempo não traz a PD verdadeira de cada proposta");

/** Nomes das variáveis do gerador (meta.features), na tela e na fonte. */
const NOME: Record<string, { curto: string; longo: string }> = {
  renda: { curto: "renda", longo: "renda" },
  tempo_emprego: { curto: "emprego", longo: "tempo de emprego" },
  utilizacao: { curto: "utilização", longo: "utilização" },
  atraso_max_6m: { curto: "atraso", longo: "atraso máximo em 6 meses" },
  comprometimento: { curto: "comprometimento", longo: "comprometimento" },
  relacionamento: { curto: "relacionamento", longo: "relacionamento" },
  consultas_bureau_3m: { curto: "consultas", longo: "consultas ao bureau em 3 meses" },
};
const nome = (v: string) => NOME[v] ?? { curto: v, longo: v };
const TEM_SCORE = META.features.some((v) => /score|bureau/i.test(v) && !/consulta/i.test(v));
const lista = (xs: string[]) => `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`;
const VARS = lista(META.features.map((v) => nome(v).longo));

/** Safras em meses corridos, de "safras AAAA-MM a AAAA-MM". */
const meses = (s: string) => { const m = s.match(/(\d{4})-(\d{2}) a (\d{4})-(\d{2})/)!; return [Number(m[1]) * 12 + Number(m[2]) - 1, Number(m[3]) * 12 + Number(m[4])] as const; };
const JAN = [
  { k: "treino", r: "treino", n: META.n_treino, m: meses(META.treino) },
  { k: "val", r: "validação", n: META.n_val, m: meses(META.validacao) },
  { k: "oot", r: "fora do tempo", n: META.n_oot, m: meses(META.oot) },
];
const periodo = (s: string) => s.replace("safras ", "");

/** Correlação das duas AUC (logística e boosting parado, nas mesmas propostas) no slide 17, pelo DeLong. */
let CORR: number | null = null;
function correlacaoS17() {
  if (CORR !== null) return CORR;
  const EV = estagios(modelo(CFG_CARTEIRA), XV); const LL = EV.map((F) => perdaLog(F, YV));
  const k = LL.reduce((b, x, i) => (i >= 1 && x < LL[b] ? i : b), 1);
  return (CORR = delong(YV, XV.map((x) => escoreLogistica(LOGISTICA, x)), EV[k]).correlacao);
}

/** Direção da célula enviada até a maior validação. */
function direcao(g: G) {
  const p: string[] = [];
  if (g.max_iter !== BEST.max_iter) p.push(g.max_iter > BEST.max_iter ? "menos árvores" : "mais árvores");
  if (g.max_leaf_nodes !== BEST.max_leaf_nodes) p.push(g.max_leaf_nodes > BEST.max_leaf_nodes ? "menos folhas" : "mais folhas");
  return p.join(" e ");
}
/** Retorno pela região da grade em relação à melhor. */
function regiao(g: G) {
  const maisA = g.max_iter > BEST.max_iter, maisF = g.max_leaf_nodes > BEST.max_leaf_nodes;
  const p: string[] = [];
  if (maisA) p.push("mais correções com a mesma taxa decoram o ajuste");
  if (maisF) p.push("folhas a mais são interações que a validação não confirma");
  if (!maisA && !maisF) p.push("simples demais: falta ajuste que a validação confirma");
  const t = p.join("; ");
  return t[0].toUpperCase() + t.slice(1);
}

type Estado = "ok" | "nao" | "provar";
type Modo = "tem" | "pede";
const SELO: Record<Estado, { s: string; r: string }> = { ok: { s: "✓", r: "cumprido" }, nao: { s: "✗", r: "não cumprido" }, provar: { s: "?", r: "a provar" } };
const tom = (g: G) => (g.auc_val - PIOR.auc_val) / (BEST.auc_val - PIOR.auc_val);
const verde = (g: G) => `rgba(46,107,79,${0.1 + 0.75 * tom(g)})`;

/* ------------------------------------------------------------ evidências gráficas mínimas (viewBox 200 de largura) */
const W = 200, FS = 11;
const lin = (d: [number, number], r: [number, number]) => (v: number) => r[0] + ((v - d[0]) / (d[1] - d[0])) * (r[1] - r[0]);
function Mini({ h, rotulo, children }: { h: number; rotulo: string; children: ReactNode }) {
  return <svg className="q6-s21-mini" viewBox={`0 0 ${W} ${h}`} role="img" aria-label={rotulo} fontSize={FS}>{children}</svg>;
}
const Txt = ({ x, y, a = "start", c = "var(--q7-texto)", b, children }: { x: number; y: number; a?: "start" | "middle" | "end"; c?: string; b?: boolean; children: ReactNode }) =>
  <text x={x} y={y} textAnchor={a} fill={c} fontWeight={b ? 700 : 500} style={{ fontVariantNumeric: "tabular-nums" }}>{children}</text>;

/** Referência linear: as duas AUC e a barra de ±1,96 erro padrão em torno do boosting. */
function MiniRef() {
  const g = RES.gbm_val.auc, l = RES.logit_val.auc;
  const x = lin([g - REGUA - 0.012, g + REGUA + 0.012], [6, W - 6]);
  const y = 25;
  return (
    <Mini h={48} rotulo={`AUC na validação temporal: boosting ${num(g, 4)}, logística ${num(l, 4)}; barra de mais ou menos ${num(Z95, 2)} × ${num(EP, 3)} = ${num(REGUA, 3)} em torno do boosting, que contém a logística`}>
      <line x1={x(g - REGUA)} x2={x(g + REGUA)} y1={y} y2={y} stroke="var(--q7-ord)" strokeOpacity={0.5} strokeWidth={3} />
      {[g - REGUA, g + REGUA].map((v) => <line key={v} x1={x(v)} x2={x(v)} y1={y - 6} y2={y + 6} stroke="var(--q7-ord)" strokeOpacity={0.6} strokeWidth={1.5} />)}
      <rect x={x(l) - 4} y={y - 4} width={8} height={8} fill="#fff" stroke="var(--q7-mudo)" strokeWidth={1.8} />
      <circle cx={x(g)} cy={y} r={4.6} fill="var(--q7-ord)" />
      <Txt x={x(g) - 3} y={12} c="var(--q7-ord)" b>● boosting {num(g, 4)}</Txt>
      <Txt x={x(l) + 3} y={45} a="end" c="var(--q7-mudo)">■ logística {num(l, 4)}</Txt>
      <Txt x={x(g + REGUA)} y={45} a="end" c="var(--q7-ord)">±{num(Z95, 2)} × {num(EP, 3)}</Txt>
    </Mini>
  );
}

/** Nível: PD média dos dois contra a faixa de Wilson da taxa observada. */
function MiniNivel() {
  const pg = RES.gbm_val.pd_media, pl = RES.logit_val.pd_media;
  const hi = Math.ceil((TAXA.hi + 0.01) * 100) / 100;
  const x = lin([0, hi], [4, W - 4]);
  return (
    <Mini h={50} rotulo={`PD média: boosting ${pct(pg, 2)}, logística ${pct(pl, 2)}; taxa observada ${pct(TAXA.p, 2)}, faixa de Wilson de ${pct(TAXA.lo, 1)} a ${pct(TAXA.hi, 1)}: os dois fora da faixa`}>
      <rect x={x(TAXA.lo)} y={14} width={x(TAXA.hi) - x(TAXA.lo)} height={24} fill="var(--q7-def-s)" stroke="var(--q7-def)" strokeOpacity={0.45} />
      <line x1={x(TAXA.p)} x2={x(TAXA.p)} y1={14} y2={38} stroke="var(--q7-def)" strokeWidth={2} />
      <Txt x={x(TAXA.p)} y={11} a="middle" c="var(--q7-def)" b>observada {pct(TAXA.p, 2)}</Txt>
      <Txt x={x(TAXA.lo)} y={49} a="middle" c="var(--q7-def)">{pct(TAXA.lo, 1)}</Txt>
      <Txt x={x(TAXA.hi)} y={49} a="end" c="var(--q7-def)">{pct(TAXA.hi, 1)}</Txt>
      <circle cx={x(pg)} cy={20} r={4.2} fill="var(--q7-prob)" />
      <rect x={x(pl) - 3.8} y={28.2} width={7.6} height={7.6} fill="#fff" stroke="var(--q7-prob)" strokeWidth={1.8} />
      <Txt x={x(pg) - 7} y={24} a="end" c="var(--q7-prob)" b>boosting {pct(pg, 2)}</Txt>
      <Txt x={x(pl) - 7} y={36} a="end" c="var(--q7-prob)">logística {pct(pl, 2)}</Txt>
    </Mini>
  );
}

/** Escolha: as 12 AUC de validação e a faixa de um erro padrão da melhor; antes do acerto, só as células enviadas. */
function MiniEscolha({ vistas, revelado }: { vistas: G[]; revelado: boolean }) {
  const x = lin([PIOR.auc_val - 0.003, BEST.auc_val + 0.003], [8, W - 8]);
  const pts = (revelado ? [...GRID] : vistas).sort((a, b) => a.auc_val - b.auc_val);
  let ult = -1e9, alt = 0;
  const pos = pts.map((g) => { const px = x(g.auc_val); alt = px - ult < 6 ? 1 - alt : 0; ult = px; return { g, px, py: 26 + (alt ? -6 : 0) + (alt ? 0 : 2) }; });
  return (
    <Mini h={48} rotulo={revelado
      ? `AUC de validação das ${NCEL} células, de ${num(PIOR.auc_val, 4)} a ${num(BEST.auc_val, 4)}; ${N_1EP} de ${NCEL} a menos de um erro padrão (${num(EP, 3)}) da melhor, ${BEST.max_iter} árvores e ${BEST.max_leaf_nodes} folhas`
      : `AUC de validação das células já enviadas; a maior abre com o acerto`}>
      <line x1={8} x2={W - 8} y1={38} y2={38} stroke="var(--q7-borda)" strokeWidth={1.5} />
      {revelado && <rect x={x(BEST.auc_val - EP)} y={14} width={x(BEST.auc_val) - x(BEST.auc_val - EP)} height={24} fill="var(--q7-val-s)" stroke="var(--q7-val)" strokeOpacity={0.35} />}
      {pos.map(({ g, px, py }) => g === BEST && revelado
        ? <circle key={`${g.max_iter}-${g.max_leaf_nodes}`} cx={px} cy={py} r={4.8} fill="var(--q7-val)" />
        : <circle key={`${g.max_iter}-${g.max_leaf_nodes}`} cx={px} cy={py} r={3.4} fill="#fff" stroke="var(--q7-val)" strokeWidth={1.6} />)}
      {revelado ? <>
        <Txt x={x(BEST.auc_val) + 4} y={10} a="end" c="var(--q7-val)" b>{BEST.max_iter} × {BEST.max_leaf_nodes}: {num(BEST.auc_val, 4)}</Txt>
        <Txt x={x(PIOR.auc_val) - 4} y={10} c="var(--q7-mudo)">{num(PIOR.auc_val, 4)}</Txt>
        <Txt x={x(BEST.auc_val) + 4} y={49} a="end" c="var(--q7-val)">um erro padrão: {N_1EP} de {NCEL}</Txt>
      </> : <Txt x={W / 2} y={49} a="middle" c="var(--q7-mudo)">a maior abre com o acerto</Txt>}
    </Mini>
  );
}

/** Variáveis do candidato (meta.features), sem o score de bureau dos slides 11 a 20. */
function MiniVars() {
  const tags = [...META.features.map((v) => ({ r: nome(v).curto, fora: false })), ...(TEM_SCORE ? [] : [{ r: "score", fora: true }])];
  const larg = (t: string) => t.length * 5.5 + 9;
  const linhas: { r: string; fora: boolean; x: number; w: number; l: number }[] = [];
  let lx = 0, li = 0;
  for (const t of tags) { const w = larg(t.r); if (lx + w > W && lx > 0) { li++; lx = 0; } linhas.push({ ...t, x: lx, w, l: li }); lx += w + 4; }
  return (
    <Mini h={li * 15 + 15} rotulo={`As ${META.features.length} variáveis do candidato: ${VARS}${TEM_SCORE ? "" : "; sem o score de bureau dos slides 11 a 20"}`}>
      {linhas.map((t) => (
        <g key={t.r} transform={`translate(${t.x} ${t.l * 15})`} fontSize={10.5}>
          <rect x={0.5} y={1} width={t.w} height={13} rx={6.5} fill={t.fora ? "#fff" : "var(--q7-papel2)"} stroke={t.fora ? "var(--q7-mudo)" : "var(--q7-borda)"} strokeDasharray={t.fora ? "3 2" : undefined} />
          <Txt x={t.w / 2 + 0.5} y={11} a="middle" c={t.fora ? "var(--q7-mudo)" : "var(--q7-texto)"}>{t.r}</Txt>
          {t.fora && <line x1={4} x2={t.w - 3} y1={7.5} y2={7.5} stroke="var(--q7-mudo)" strokeWidth={1.2} />}
        </g>
      ))}
    </Mini>
  );
}

/** Safras: treino, validação temporal e janela fora do tempo, em meses corridos. */
function MiniJanela() {
  const m0 = JAN[0].m[0], m1 = JAN[JAN.length - 1].m[1];
  const x = lin([m0, m1], [1, W - 1]);
  const cor: Record<string, { f: string; s: string; t: string }> = {
    treino: { f: "#E4E6EA", s: "#C9CDD5", t: "var(--q7-mudo)" }, val: { f: "var(--q7-val)", s: "var(--q7-val)", t: "var(--q7-val)" }, oot: { f: "var(--q7-ord-s)", s: "var(--q7-ink)", t: "var(--q7-ink)" },
  };
  return (
    <Mini h={48} rotulo={JAN.map((j) => `${j.r}: ${int(j.n)} propostas`).join("; ") + `; a janela fora do tempo, ${periodo(META.oot)}, fica congelada${TEM_PT ? ", com a PD verdadeira de cada proposta" : ""}`}>
      {JAN.map((j, i) => {
        const a = x(j.m[0]), b = x(j.m[1]);
        return (
          <g key={j.k}>
            <rect x={a + (i ? 1 : 0)} y={16} width={b - a - (i ? 1 : 0)} height={14} fill={cor[j.k].f} stroke={cor[j.k].s} strokeDasharray={j.k === "oot" ? "3 2" : undefined} />
            <Txt x={j.k === "oot" ? W - 1 : (a + b) / 2} y={j.k === "oot" ? 45 : 11} a={j.k === "oot" ? "end" : "middle"} c={cor[j.k].t} b={j.k !== "treino"}>{j.r} {int(j.n)}</Txt>
          </g>
        );
      })}
      <Txt x={1} y={45} c="var(--q7-mudo)">{periodo(META.treino).slice(0, 7)}</Txt>
    </Mini>
  );
}

export function S21Candidato({ pagina }: { pagina?: Pagina }) {
  const [corr] = useState(correlacaoS17);
  const [sel, setSel] = useState<G | null>(null);
  const [enviado, setEnviado] = useState<G | null>(null);
  const [envios, setEnvios] = useState<G[]>([]);
  const [tent, setTent] = useState(0);
  const [modo, setModo] = useState<Modo>("tem");
  const certo = enviado === BEST, aceito = enviado !== null && ACEITA(enviado);
  const esgotou = !certo && !aceito && tent >= TENTATIVAS;
  const revelado = certo || aceito || esgotou;
  const abre = (g: G) => revelado || envios.includes(g);
  const enviar = () => { if (!sel) return; setEnviado(sel); setTent((n) => n + 1); setEnvios((e) => (e.includes(sel) ? e : [...e, sel])); };
  const outra = () => { setEnviado(null); setSel(null); };
  const restaurar = () => { setSel(null); setEnviado(null); setEnvios([]); setTent(0); setModo("tem"); };
  const dif = (g: G) => BEST.auc_val - g.auc_val;
  const retorno = !enviado ? null
    : certo ? <>Isso: a maior AUC de validação{CONFERE ? ", a regra que escolheu o candidato" : ""}; {N_1EP} das {NCEL} ficam a menos de um erro padrão dela.</>
      : aceito ? <>Não é erro: {num(dif(enviado), 4)} abaixo da maior, dentro de um erro padrão ({num(EP, 3)}); um validador pode preferir o mais simples. O candidato é a maior: {BEST.max_iter} árvores e {BEST.max_leaf_nodes} folhas.</>
        : <>{enviado === TOP_T ? <>Confunde ajuste com generalização. </> : null}{regiao(enviado)}: treino {num(enviado.auc_treino, 2)}, validação {num(enviado.auc_val, 4)}{dif(enviado) < EP ? <>, {num(dif(enviado), 4)} abaixo da maior (dentro de um erro padrão)</> : null}.{" "}
          {esgotou ? <>A maior: {BEST.max_iter} árvores e {BEST.max_leaf_nodes} folhas, {num(BEST.auc_val, 4)}.</> : <>A maior validação tem {direcao(enviado)}.</>}</>;
  const s17 = <LinkSlide slug="c6p17">slide 17</LinkSlide>;
  const dois = !NIVEL_OK && !LOGIT_OK;
  const LISTA: { t: string; s: string; e: Estado; g: ReactNode; tem: ReactNode; pede: ReactNode }[] = [
    { t: "Referência linear", s: "c6p17", e: !EMPATA && DIF_LOG > 0 ? "ok" : "provar", g: <MiniRef />,
      tem: <>diferença {num(DIF_LOG, 4)}, {EMPATA ? "menor" : "maior"} que {num(Z95, 2)} × {num(EP, 3)} = {num(REGUA, 3)}: {EMPATA ? "empate" : DIF_LOG > 0 ? "supera" : "perde"}</>,
      pede: <>previsões por proposta e DeLong pareado (correlação {num(corr, 2)} no {s17}): IC acima de zero</> },
    { t: "Nível da PD", s: "c6p18", e: NIVEL_OK ? "ok" : "nao", g: <MiniNivel />,
      tem: <>só a média: {dois ? "os dois erram" : NIVEL_OK ? "no Wilson" : "o boosting erra"}</>,
      pede: <>recalibrar {dois ? "os dois" : "o boosting"}; curva por faixa e slope com IC contendo 1</> },
    { t: "Escolha pela validação", s: "c6p15", e: "provar", g: <MiniEscolha vistas={envios} revelado={revelado} />,
      tem: !revelado ? <>a maior de {NCEL}, nas mesmas {int(NV)} da comparação</>
        : <>{BEST.max_iter} árvores e {BEST.max_leaf_nodes} folhas{NA_BORDA ? ", na borda" : ""}; favorece o boosting</>,
      pede: <>AUC em propostas que não escolheram a célula (slides 13 e 15){revelado && NA_BORDA ? "; grade além da borda" : ""}</> },
    { t: "Monotonia e explicação", s: "c6p20", e: "provar", g: <MiniVars />,
      tem: <>sem as árvores</>,
      pede: <>as árvores: sem queda em variável com sinal de negócio; contribuições (slide 19)</> },
    { t: "Janela fora do tempo", s: "c7p1", e: "provar", g: <MiniJanela />,
      tem: <>intocada até o capítulo 7</>,
      pede: <>abrir uma vez, com modelo, corte e calibração congelados</> },
  ];
  return (
    <Quadro slug="c6p21" pagina={pagina} layout="gl"
      conclusao={!revelado
        ? <>Qual célula valida melhor? Escolha e envie (tentativa {Math.min(tent + (enviado ? 0 : 1), TENTATIVAS)} de {TENTATIVAS}).</>
        : <>O excesso de <b>{num(EXCESSO, 3)}</b> do <LinkSlide slug="c6p1">slide 1</LinkSlide> era otimismo do treino: na validação temporal os dois empatam (<b>{num(RES.gbm_val.auc, 4)}</b> contra {num(RES.logit_val.auc, 4)}) e erram a mesma safra (<b>{pct(RES.gbm_val.pd_media, 2)}</b> e {pct(RES.logit_val.pd_media, 2)} contra {pct(TAXA.p, 2)}). <b>Mecanismo:</b> F₀ = {num(F0, 2)} mais {HP.max_iter} × {num(HP.learning_rate, 2)} por folha. <b>Probabilidade:</b> em log odds, sigmoide no fim; cada PD se explica por contribuições quando as árvores estiverem disponíveis (<LinkSlide slug="c6p19">slide 19</LinkSlide>). <b>Controle:</b> {BEST.max_iter} × {BEST.max_leaf_nodes}. <b>Prova:</b> a janela futura decide (<LinkSlide slug="c7p1">capítulo 7</LinkSlide>).</>}
      fonte={`Base sintética (semente ${META.seed}). Candidato: ajustado nas ${int(META.n_treino)} propostas do treino (${periodo(META.treino)}) com ${VARS}; ${HP.max_iter} árvores de até ${HP.max_leaf_nodes} folhas, taxa ${num(HP.learning_rate, 2)}, mínimo ${HP.min_samples_leaf} por folha, L2 = ${num(HP.l2_regularization, 0)}. Validação temporal: ${int(NV)} propostas, ${DV} defaults, ${periodo(META.validacao)} (não o sorteio dos slides 11 a 20). Wilson; Hanley e McNeil (1982).`}>
      <Painel>
        <div className="q6-s21-cab">
          <p className="q6-s21-sint">
            <b>Base sintética:</b> dá a PD verdadeira da janela futura, intocada até o capítulo 7, que usa as duas: nenhuma carteira real dá isso. Sem as previsões do candidato nas {int(NV)}, o DeLong pareado fica com o validador.
          </p>
          <Seg rotulo="O que a lista do validador mostra" opcoes={[{ v: "tem" as Modo, r: "Evidência" }, { v: "pede" as Modo, r: "O que pedir" }]} valor={modo} onChange={setModo} cor />
        </div>
        <ol className="q6-s21-lista">
          {LISTA.map((it) => (
            <li key={it.t} data-estado={it.e}>
              <span className="q6-s21-m" aria-hidden="true">{SELO[it.e].s}</span>
              <span className="q6-s21-t"><LinkSlide slug={it.s}>{it.t}</LinkSlide></span>
              <span className="q6-s21-e">{SELO[it.e].r}</span>
              <span className="q6-s21-p">{modo === "tem" ? it.tem : it.pede}</span>
              <span className="q6-s21-g">{it.g}</span>
            </li>
          ))}
        </ol>
      </Painel>
      <Painel titulo="AUC: validação (treino)" className="q6-s21-dir">
        <div className="q6-s21-grade" role="group" aria-label="Grade de hiperparâmetros: escolha uma célula">
          <span className="q6-s21-g0">folhas \ árvores</span>
          {ARVS.map((a) => <span key={a} className="q6-s21-gc">{a}</span>)}
          {FOLHAS.map((f) => [
            <span key={`r${f}`} className="q6-s21-gr">{f}</span>,
            ...ARVS.map((a) => {
              const g = cel(a, f), on = abre(g);
              return (
                <button key={`${a}-${f}`} type="button" className="q6-s21-cel" aria-pressed={g === sel || g === enviado} disabled={enviado !== null || revelado}
                  data-ver={on ? (revelado ? (g === BEST ? "melhor" : "1") : "enviada") : undefined} data-escuro={on && revelado && tom(g) > 0.6 ? "1" : undefined} style={on && revelado ? { background: verde(g) } : undefined}
                  aria-label={`${a} árvores e ${f} folhas: AUC de treino ${num(g.auc_treino, 2)}${on ? `, de validação ${num(g.auc_val, 4)}` : ""}`} onClick={() => setSel(g)}>
                  <b>{on ? num(g.auc_val, 4) : "?"}</b><small>({num(g.auc_treino, 2)})</small>
                </button>
              );
            }),
          ])}
        </div>
        <div className="q6-s21-bot">
          {!enviado ? <Botao prim desab={!sel} onClick={enviar}>Mandar ao comitê</Botao>
            : !revelado ? <Botao sec onClick={outra}>Tentar outra</Botao> : null}
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
        {retorno && <p className="q7-retorno" data-tom={certo ? "certa" : aceito ? undefined : "errada"} aria-live="polite">{retorno}</p>}
      </Painel>
    </Quadro>
  );
}
