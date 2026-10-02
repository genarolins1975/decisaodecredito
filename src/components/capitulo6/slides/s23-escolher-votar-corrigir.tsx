"use client";
import { useState, type ReactNode } from "react";
import { Botao, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, type Dim, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { SLIDE } from "@/lib/capitulo6/roteiro";
import { estagios, perdaLog, sigmoide, type No } from "@/lib/capitulo6/gbm";
import { SEMENTE_VOTAR, amostrasVotar, arvoreY, folhaDe, freq, perdaPD } from "@/lib/capitulo6/metodos";
import { num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 02 · c6p23 · Escolher, votar ou corrigir: o conceito antes das curvas do slide 3 (c6p2). Três colunas, uma por método,
 * com as mesmas 16 propostas didáticas e as mesmas peças do slide 3 (src/lib/capitulo6/metodos.ts e o boosting da
 * biblioteca com CFG_DIDATICA):
 *   escolher  um modelo só: uma árvore ajustada no default y com as 16; PD = taxa de default da folha (as quatro folhas
 *             aparecem como chaves); em geral se escolhe entre candidatos, e a fonte diz isso como nota;
 *   votar     a árvore k numa amostra de 16 sorteada com reposição (semente SEMENTE_VOTAR): pilha de marcas = vezes que a
 *             proposta entrou na amostra, anel tracejado = ficou fora; as chaves mostram a PD que a árvore k dá; a PD
 *             final é a média das árvores;
 *   corrigir  a árvore k recebe y − p, o erro que sobrou depois das k − 1 anteriores; as setas dizem se ela sobe ou desce
 *             a PD de cada proposta; a PD é o palpite mais η vezes a folha de cada árvore.
 * No pé de cada coluna, a proposta acompanhada: o alvo que a árvore k recebe para ela e a PD acumulada. A proposta inicial
 * é calculada: a primeira adimplente que ficou fora da primeira amostra de votar e recebeu PD 100% dessa árvore (#7).
 * A previsão pergunta qual método, com uma árvore só, se ajusta melhor às 16 (menor log loss de treino). Antes da tentativa, o
 * quadro fica na árvore 1 e esconde o que responde: as taxas das folhas, a PD da proposta acompanhada e toda log loss; o
 * mecanismo (alvo, ligação, de onde sai a PD) fica à vista. No acerto, a linha de log loss com uma árvore (escolher,
 * votar sem limite, corrigir) e o seletor de árvores 1 a 3. Os retornos e a leitura explicam corrigir pelo passo de Newton
 * (slide 7) encolhido por η, com o número de η = 1 calculado aqui. Toda frase quantificadora é conferida abaixo.
 */
const SEMENTE_BASE = base.meta.seed;
const K = 3; // árvores acompanhadas
const N = DIDATICA.length;
const ETA = CFG_DIDATICA.eta;
type Met = "esc" | "vot" | "cor";

/* escolher */
const UMA = arvoreY(XD, YD);
const P_ESC = XD.map((x) => freq(UMA.no, x, UMA.pbar));
/* votar */
const AMOSTRAS = amostrasVotar(K, N);
const VOTO = AMOSTRAS.map((ids) => arvoreY(ids.map((i) => XD[i]), ids.map((i) => YD[i])));
const VEZES = AMOSTRAS.map((ids) => DIDATICA.map((_, i) => ids.filter((j) => j === i).length)); // VEZES[k][i]
const P_ARV = VOTO.map((t) => XD.map((x) => freq(t.no, x, t.pbar))); // PD que cada árvore de votar dá
const P_VOT = Array.from({ length: K }, (_, k) => DIDATICA.map((_, i) => P_ARV.slice(0, k + 1).reduce((s, P) => s + P[i], 0) / (k + 1)));
/* corrigir: as três primeiras árvores do boosting didático da biblioteca */
const MOD = modelo(CFG_DIDATICA, XD, YD);
const EST = estagios(MOD, XD);
const P_COR = EST.map((F) => F.map(sigmoide)); // P_COR[k][i], k = 0 é o palpite
const ALVO_COR = Array.from({ length: K }, (_, k) => YD.map((y, i) => y - P_COR[k][i])); // alvo da árvore k + 1

/** Folhas como corridas de propostas vizinhas (as 16 estão em ordem de utilização). */
type Corrida = { ini: number; fim: number; pd: number };
function corridas(no: No, pbar: number): Corrida[] {
  const out: (Corrida & { folha: unknown })[] = [];
  XD.forEach((x, i) => { const f = folhaDe(no, x); const u = out[out.length - 1]; if (u && u.folha === f) u.fim = i; else out.push({ ini: i, fim: i, pd: pbar + f.soma / f.n, folha: f }); });
  return out;
}
const FOLHAS_ESC = corridas(UMA.no, UMA.pbar);
const FOLHAS_VOT = VOTO.map((t) => corridas(t.no, t.pbar));
const nFolhas = (no: No): number => (no.folha ? 1 : nFolhas(no.esq) + nFolhas(no.dir));
// cada folha é uma corrida só (as chaves desenhadas são as folhas), e nenhuma proposta entra mais de 3 vezes numa amostra
if (FOLHAS_ESC.length !== nFolhas(UMA.no) || FOLHAS_VOT.some((c, k) => c.length !== nFolhas(VOTO[k].no)) || Math.max(...VEZES.flat()) > 3) throw new Error("folhas não contíguas ou amostra com repetição acima de 3");

/** Proposta inicial: a primeira adimplente fora da primeira amostra de votar que recebeu PD 100% dessa árvore. */
const FOCO0 = DIDATICA.findIndex((p, i) => p.y === 0 && VEZES[0][i] === 0 && P_ARV[0][i] >= 1);
const PURAS = P_ESC.filter((p) => p === 0 || p === 1).length;
const L_ESC = perdaPD(P_ESC, YD), L_VOT1 = perdaPD(P_VOT[0], YD), L_COR1 = perdaLog(EST[1], YD);
/* corrigir com uma árvore: o passo de Newton inteiro (η = 1) a partir do palpite, e o mesmo passo encolhido por η */
const EST_ETA1 = estagios(modelo({ ...CFG_DIDATICA, eta: 1, arvores: 1 }, XD, YD), XD);
const L_COR1_ETA1 = perdaLog(EST_ETA1[1], YD);
/* com mais árvores: em que árvore corrigir passa escolher na log loss de treino (as 20 do slide 3), e votar nunca passa */
const EST20 = estagios(modelo({ ...CFG_DIDATICA, arvores: 20 }, XD, YD), XD);
const K_PASSA = EST20.findIndex((F, k) => k > 0 && perdaLog(F, YD) < L_ESC!);
const VOT20 = amostrasVotar(20, N).map((ids) => arvoreY(ids.map((i) => XD[i]), ids.map((i) => YD[i])));
const VOT_NUNCA_PASSA = Array.from({ length: 20 }, (_, k) => perdaPD(DIDATICA.map((_, i) => VOT20.slice(0, k + 1).reduce((a, t) => a + freq(t.no, XD[i], t.pbar), 0) / (k + 1)), YD)).every((v) => v === null || v > L_ESC!);
if (K_PASSA < 1 || !VOT_NUNCA_PASSA) throw new Error("a frase sobre muitas árvores não vale nos dados");
const PURA0 = DIDATICA.map((_, i) => i).filter((i) => P_ESC[i] === 0); // adimplentes em folha pura de escolher
const PD_PURA_ETA1 = sigmoide(EST_ETA1[1][PURA0[0]]);
const COR1_LO = Math.min(...P_COR[1]), COR1_HI = Math.max(...P_COR[1]);
const P0 = sigmoide(MOD.f0); // PD do palpite
/* votar com uma árvore: as adimplentes que a primeira amostra deixou de fora e que receberam PD 100% */
const ERRADAS1 = DIDATICA.map((_, i) => i).filter((i) => (YD[i] === 0 && P_VOT[0][i] >= 1) || (YD[i] === 1 && P_VOT[0][i] <= 0));
// retornos e leitura: escolher tem a menor log loss com uma árvore; votar não tem limite porque adimplentes fora da amostra
// receberam PD 100%; corrigir separa os mesmos grupos (folhas puras no mesmo valor), mas o passo de Newton inteiro leva a
// folha pura a uma PD acima de 0% e ainda perde mais que escolher; com η < 1 perde mais ainda
if (!(FOCO0 >= 0 && PURAS > N / 2 && L_ESC !== null && L_VOT1 === null && ERRADAS1.length > 0 && ERRADAS1.every((i) => YD[i] === 0 && VEZES[0][i] === 0)
  && PURA0.every((i) => EST_ETA1[1][i] === EST_ETA1[1][PURA0[0]] && P_COR[1][i] === COR1_LO) && PD_PURA_ETA1 > 0
  && L_ESC < L_COR1_ETA1 && L_COR1_ETA1 < L_COR1 && ETA < 1)) throw new Error("a leitura do slide c6p23 não vale nos dados");
const IDS1 = ERRADAS1.map((i) => `#${DIDATICA[i].id}`).join(" e ");

const ID = (i: number) => DIDATICA[i].id;
const sinal = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), 2)}`;
const naAmostra = (k: number, i: number) => (VEZES[k][i] === 0 ? "fora da amostra" : VEZES[k][i] === 1 ? "1× na amostra" : `repetida ${VEZES[k][i]}×`);
const AZUL = "#3D5A8A", NAVY = "#00205B", PROB = "#176C73", MUDO = "#5B6475", CLARO = "#B5BAC4";
const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;

const OPCOES: Opcao[] = [
  { texto: "Escolher", certa: true, retorno: <>Isso: um modelo só, ajustado com as {N}, leva <b>{PURAS}</b> a folhas puras (PD {pct(0, 0)} ou {pct(1, 0)}, perda zero): log loss <b>{num(L_ESC!, 3)}</b>, contra {num(L_COR1, 3)} de corrigir; votar, sem limite.</> },
  { texto: "Votar", retorno: <>Com uma árvore, sortear só tira dados: a árvore 1 viu uma amostra sorteada e deixou de fora {IDS1}, adimplentes, que caíram numa folha só de defaults e receberam PD {pct(1, 0)}. PD {pct(1, 0)} num adimplente: perda <b>sem limite</b>.</> },
  { texto: "Corrigir", retorno: <>Separar os mesmos grupos não basta: o passo de Newton (<LinkSlide slug="c6p6">slide {SLIDE.c6p6.n}</LinkSlide>) a partir de {pct(P0, 0)} leva a folha pura a {pct(PD_PURA_ETA1, 1)}, não a {pct(0, 0)}, e só η = {num(ETA, 1)} dele entra: PDs de {pct(COR1_LO, 0)} e {pct(COR1_HI, 0)}, perda <b>{num(L_COR1, 3)}</b>. Mesmo com η = 1 seria {num(L_COR1_ETA1, 3)}.</> },
];

/** Uma coluna: alvo da árvore k nas 16, folhas ou efeito da árvore, ligação entre as árvores e a proposta acompanhada. */
function Coluna({ met, k, foco, rev }: { met: Met; k: number; foco: number; rev: boolean }) {
  const id = ID(foco), y = YD[foco];
  // antes da tentativa, a descrição para leitor de tela também omite as taxas das folhas e a PD da proposta
  const rotulo = met === "esc" ? `Escolher: um modelo só, uma árvore com as ${N} e ${FOLHAS_ESC.length} folhas${rev ? `, com PD ${FOLHAS_ESC.map((f) => pct(f.pd, 0)).join(", ")}; #${id} recebe PD ${pct(P_ESC[foco], 0)}` : `; #${id} recebe y = ${y}`}${k > 1 ? `; não há árvore ${k}` : ""}`
    : met === "vot" ? `Votar, árvore ${k}: amostra sorteada; #${id} ${naAmostra(k - 1, foco)}${rev ? `; a árvore dá PD ${pct(P_ARV[k - 1][foco], 0)} e a média ${k === 1 ? "de 1 árvore" : `das ${k}`} dá ${pct(P_VOT[k - 1][foco], 0)}` : ""}`
      : `Corrigir, árvore ${k}: alvo y − p; #${id} recebe ${sinal(ALVO_COR[k - 1][foco])}${rev ? ` e a PD vai a ${pct(P_COR[k][foco], 0)}` : ""}`;
  return (
    <Grafico rotulo={rotulo} arCelular="16 / 12">
      {(d: Dim) => {
        const H = 12.1 * d.fs, s = Math.max(0.85, d.h / H); // posições em unidades de letra, esticadas se sobra altura
        const Y = (u: number) => u * d.fs * s;
        const mx = d.fs * 0.35, passo = (d.w - 2 * mx) / N, cx = (i: number) => mx + passo * (i + 0.5);
        const r = Math.min(d.fs * 0.3, passo * 0.36);
        const yA = Y(2.85), yB = Y(4.95), yS = Y(7.65), yF1 = Y(10.35), yF2 = Y(11.75);
        const apagado = met === "esc" && k > 1;
        const cap = met === "esc" ? (k > 1 ? `um modelo só: não há árvore ${k}` : `uma árvore: o default y das ${N}`)
          : met === "vot" ? `árvore ${k}: y na amostra ${k}` : k === 1 ? "árvore 1: y − p do palpite" : `árvore ${k}: y − p que sobrou`;
        const folhas = met === "esc" ? FOLHAS_ESC : met === "vot" ? FOLHAS_VOT[k - 1] : null;
        // trajetória da PD da proposta acompanhada até a árvore k
        const traj = met === "esc" ? [P_ESC[foco]] : met === "vot" ? P_VOT.slice(0, k).map((P) => P[foco]) : P_COR.slice(1, k + 1).map((P) => P[foco]);
        const alvo = met === "esc" ? `y = ${y}` : met === "vot" ? `y = ${y}, ${naAmostra(k - 1, foco)}` : `y − p = ${sinal(ALVO_COR[k - 1][foco])}`;
        return (
          <g>
            <text className="q7-rot--peq" x={mx} y={Y(0.95)} style={{ fill: apagado ? MUDO : NAVY, fontWeight: 600 }}>{cap}</text>
            {/* proposta acompanhada: faixa em toda a altura do alvo e das folhas */}
            <rect x={cx(foco) - passo / 2} y={Y(1.35)} width={passo} height={yB - Y(1.35) + d.fs * 0.15} rx={4} fill="#EFF3FA" stroke={NAVY} strokeWidth={2} />
            <g opacity={apagado ? 0.3 : 1}>
              {met === "cor" ? <>
                <line x1={mx} x2={d.w - mx} y1={yA} y2={yA} stroke="#9AA1AD" strokeWidth={1.5} />
                {ALVO_COR[k - 1].map((v, i) => {
                  const h = (Math.abs(v) / 0.5) * d.fs * 1.05, sobe = v > 0; // a ponta de +0,50 fica abaixo do rótulo da coluna
                  return (
                    <g key={i}>
                      <rect className="q7-anim-d" x={cx(i) - passo * 0.27} y={sobe ? yA - h : yA} width={passo * 0.54} height={Math.max(1, h)} fill={AZUL} opacity={0.85} />
                      <circle cx={cx(i)} cy={sobe ? yA - h - r * 0.9 : yA + h + r * 0.9} r={r * 0.75} className={YD[i] ? "q7-pt-def" : "q7-pt-adi"} />
                    </g>
                  );
                })}
              </> : DIDATICA.map((p, i) => {
                const c = met === "vot" ? VEZES[k - 1][i] : 1;
                if (c === 0) return <circle key={i} cx={cx(i)} cy={yA} r={r * 0.86} fill="none" stroke="#9AA1AD" strokeWidth={1.8} strokeDasharray="3 3" />;
                return <g key={i}>{Array.from({ length: c }, (_, j) => <circle key={j} cx={cx(i)} cy={yA + (j - (c - 1) / 2) * r * 2.35} r={r} className={p.y ? "q7-pt-def" : "q7-pt-adi"} />)}</g>;
              })}
              {/* folhas da árvore (escolher, votar) ou o que a árvore k faz com a PD (corrigir) */}
              {folhas ? folhas.map((f, j) => {
                const x1 = cx(f.ini) - passo * 0.42, x2 = cx(f.fim) + passo * 0.42;
                return (
                  <g key={j}>
                    <path d={`M${x1} ${yB - d.fs * 0.35}V${yB}H${x2}V${yB - d.fs * 0.35}`} fill="none" stroke={PROB} strokeWidth={2} />
                    <text className="q7-rot--peq" x={(x1 + x2) / 2} y={yB} dy="1.15em" textAnchor="middle" style={{ fill: rev ? PROB : CLARO, fontWeight: 700 }}>{rev ? pct(f.pd, 0) : "?"}</text>
                  </g>
                );
              }) : <>
                {/* a seta fica junto do eixo, do lado oposto ao da barra, para não cruzar o círculo na ponta */}
                {DIDATICA.map((_, i) => { const dv = P_COR[k][i] - P_COR[k - 1][i]; return <text key={i} className="q7-rot--peq" x={cx(i)} y={dv > 0 ? yA : yA} dy={dv > 0 ? "1.05em" : "-.3em"} textAnchor="middle" style={{ fill: PROB, fontWeight: 700 }}>{dv > 1e-9 ? "↑" : dv < -1e-9 ? "↓" : "·"}</text>; })}
                <text className="q7-rot--peq" x={d.w / 2} y={yB} dy="1.15em" textAnchor="middle" style={{ fill: PROB }}>PD: ↑ sobe, ↓ desce, η = {num(ETA, 1)}</text>
              </>}
            </g>
            {/* ligação entre as árvores */}
            <Ligacao met={met} k={k} d={d} yS={yS} />
            {/* proposta acompanhada */}
            <text className="q7-rot--peq" x={mx} y={yF1} style={{ fill: NAVY }}><tspan style={{ fontWeight: 700 }}>#{id}</tspan> recebe {alvo}</text>
            <text className="q7-rot" x={mx} y={yF2} style={{ fill: PROB }}>
              <tspan style={{ fill: MUDO, fontWeight: 500 }}>{met === "vot" ? "média " : "PD "}</tspan>
              {rev ? traj.map((p, j) => <tspan key={j} style={{ fontWeight: j === traj.length - 1 ? 800 : 500, fontSize: j === traj.length - 1 ? "1.2em" : "0.86em", fill: j === traj.length - 1 ? PROB : MUDO }}>{j ? "\u202f→\u202f" : ""}{pct(p, 0)}</tspan>)
                : <tspan style={{ fill: CLARO, fontWeight: 800 }}>?</tspan>}
            </text>
          </g>
        );
      }}
    </Grafico>
  );
}

/** Desenho da ligação (mecanismo, à vista desde o início): um modelo só; árvores em paralelo que vão à média; árvores em cadeia a partir do palpite. */
function Ligacao({ met, k, d, yS }: { met: Met; k: number; d: Dim; yS: number }) {
  const bh = d.fs * 1.1, bw = d.fs * 2.1;
  const caixa = (x: number, yc: number, txt: ReactNode, on: boolean, fora = false, w = bw) => (
    <g opacity={fora ? 0.35 : 1}>
      <rect x={x - w / 2} y={yc - bh / 2} width={w} height={bh} rx={bh * 0.25} fill={on ? "#EFF3FA" : "#fff"} stroke={on ? NAVY : CLARO} strokeWidth={on ? 2.5 : 1.8} strokeDasharray={fora ? "5 4" : undefined} />
      <text className="q7-rot--peq" x={x} y={yc} dy=".35em" textAnchor="middle" style={{ fill: on ? NAVY : MUDO, fontWeight: 700 }}>{txt}</text>
    </g>
  );
  const seta = (x1: number, y1: number, x2: number, y2: number, cor = AZUL) => {
    const a = Math.atan2(y2 - y1, x2 - x1), t = d.fs * 0.32;
    return <g><line x1={x1} y1={y1} x2={x2 - Math.cos(a) * t * 0.8} y2={y2 - Math.sin(a) * t * 0.8} stroke={cor} strokeWidth={2.2} /><path d={`M${x2} ${y2}L${x2 - t * Math.cos(a - 0.45)} ${y2 - t * Math.sin(a - 0.45)}L${x2 - t * Math.cos(a + 0.45)} ${y2 - t * Math.sin(a + 0.45)}Z`} fill={cor} /></g>;
  };
  if (met === "esc") return <g>{caixa(d.w * 0.14, yS, 1, true)}<text className="q7-rot--peq" x={d.w * 0.14 + bw / 2 + d.fs * 0.5} y={yS} dy=".35em" style={{ fill: MUDO }}>um modelo só</text></g>;
  if (met === "vot") {
    const xs = [0.2, 0.5, 0.8].map((f) => d.w * f), yv = yS - d.fs * 0.6, ym = yS + d.fs * 0.95;
    return (
      <g>
        {xs.map((x, j) => <g key={j}>{caixa(x, yv, j + 1, j === k - 1, j > k - 1)}{seta(x, yv + bh / 2, d.w / 2 + (x - d.w / 2) * 0.25, ym - bh * 0.42, j > k - 1 ? CLARO : AZUL)}</g>)}
        {caixa(d.w / 2, ym, "média", false, false, d.fs * 3.4)}
      </g>
    );
  }
  const xs = [0.11, 0.37, 0.63, 0.89].map((f) => d.w * f);
  return (
    <g>
      {caixa(xs[0], yS, "F₀", false, false, d.fs * 1.7)}
      {[1, 2, 3].map((j) => <g key={j}>{seta(xs[j - 1] + bw / 2 - (j === 1 ? d.fs * 0.2 : 0), yS, xs[j] - bw / 2 - d.fs * 0.08, yS, j > k ? CLARO : AZUL)}{caixa(xs[j], yS, j, j === k, j > k)}</g>)}
    </g>
  );
}

const CAB: Record<Met, { s: string; nome: string; sub: string }> = {
  esc: { s: "┄", nome: "Escolher", sub: "um modelo só: uma árvore com as 16" },
  vot: { s: "■", nome: "Votar", sub: "bagging: a média reduz a variância" },
  cor: { s: "●", nome: "Corrigir", sub: "boosting: reduz o erro sistemático" },
};
/** Linhas comparativas (a ligação está desenhada em cada coluna): o mecanismo fica à vista; a log loss com uma árvore
 *  responde à previsão e só aparece no acerto. */
const LINHAS: { r: string; oculta: boolean; t: Record<Met, string> }[] = [
  { r: "Alvo", oculta: false, t: { esc: `o default y das ${N}`, vot: "y numa amostra sorteada", cor: "o erro que sobrou, y − p" } },
  { r: "PD", oculta: false, t: { esc: "taxa da folha", vot: "média das árvores", cor: "palpite + soma de pedaços" } },
  { r: "Log loss", oculta: true, t: { esc: `${num(L_ESC!, 3)} (1 árvore)`, vot: "sem limite (1 árvore)", cor: `${num(L_COR1, 3)} (1 árvore)` } },
];

export function S23EscolherVotarCorrigir({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [k, setK] = useState(1);
  const [foco, setFoco] = useState(FOCO0);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const kk = rev ? k : 1;
  const restaurar = () => { setEsc(null); setK(1); setFoco(FOCO0); };
  const p = DIDATICA[foco];
  return (
    <Quadro slug="c6p23" pagina={pagina} layout="glx"
      titulo={rev ? undefined : "Escolher, votar ou corrigir: com uma árvore só, qual se ajusta melhor às 16?"}
      sub={rev ? undefined : `As mesmas ${N} propostas nos três métodos. Veja o que a árvore 1 recebe em cada um e responda ao lado.`}
      conclusao={!rev ? <>Árvore 1, proposta #{p.id} ({p.y ? "default" : "adimplente"}): escolher ajusta uma árvore com as {N}; em votar, ela está {naAmostra(0, foco)}; corrigir lhe dá o alvo y − p = {sinal(ALVO_COR[0][foco])}. Qual dos três se ajusta melhor às {N} (menor log loss de treino)?</>
        : <>Com uma árvore, escolher perde menos na log loss das {N} (<b>{num(L_ESC!, 3)}</b> contra {num(L_COR1, 3)} de corrigir; votar sem limite). Corrigir dá um passo de Newton (<LinkSlide slug="c6p6">slide {SLIDE.c6p6.n}</LinkSlide>) encolhido pela taxa η = {num(ETA, 1)} (<LinkSlide slug="c6p7">slide {SLIDE.c6p7.n}</LinkSlide>): folha pura em {pct(COR1_LO, 0)} (com η = 1, {pct(PD_PURA_ETA1, 1)}; nunca {pct(0, 0)}). É ajuste ao treino: uma PD de {pct(0, 0)} numa folha pequena não é crível fora das {N}. Com mais árvores, no treino, corrigir passa escolher na árvore {K_PASSA}; votar melhora, mas fica acima (o ganho dele é fora da amostra): <LinkSlide slug="c6p2">slide {SLIDE.c6p2.n}</LinkSlide>.</>}
      fonte={`${N} propostas didáticas sintéticas (gerador do curso, semente ${SEMENTE_BASE}; ${YD.reduce((a, v) => a + v, 0)} defaults). Árvores de profundidade ${CFG_DIDATICA.profundidade}, mínimo de ${CFG_DIDATICA.minFolha} por folha. Escolher: em geral, entre candidatos; aqui, uma árvore. Votar: amostras com reposição, semente ${SEMENTE_VOTAR}; a floresta aleatória também sorteia variáveis. Corrigir: F₀ = ${num(MOD.f0, 0)}, taxa ${num(ETA, 1)}. Log loss média de treino, log natural.`}>
      <Painel>
        <div className="q6-s23" data-rev={rev ? "1" : "0"}>
          {LINHAS.map((l, j) => <p key={l.r} className="q7-k q6-s23-rl" style={{ gridRow: j + 3 }}>{l.r}</p>)}
          <ul className="q7-leg q6-s23-leg" aria-label="Legenda">
            <li><span className="q7-mk q7-mk--def" aria-hidden="true" />default</li>
            <li><span className="q7-mk q7-mk--adi" aria-hidden="true" />adimplente</li>
            <li><span className="q6-s23-mkf" aria-hidden="true" />#{p.id}, acompanhada</li>
            <li><span className="q6-s23-mkr" aria-hidden="true" />fora da amostra; pilha: repetida</li>
          </ul>
          {(["esc", "vot", "cor"] as Met[]).map((m, c) => (
            <div key={m} className="q6-s23-col" data-m={m} style={{ ["--c" as string]: c + 2 }}>
              <div className="q6-s23-fundo" aria-hidden="true" />
              <h3 className="q6-s23-h" data-cor={m === "cor" ? "1" : undefined}><span aria-hidden="true">{CAB[m].s}</span> {CAB[m].nome}<small>{CAB[m].sub}</small></h3>
              <div className="q6-s23-g"><Coluna met={m} k={kk} foco={foco} rev={rev} /></div>
              {LINHAS.map((l, j) => (
                <p key={l.r} className="q6-s23-c" style={{ gridRow: j + 3 }} data-oculta={l.oculta && !rev ? "1" : undefined}>
                  <span className="q6-s23-cl">{l.r}</span>{l.oculta && !rev ? <span aria-label="oculto até a previsão">?</span> : l.t[m]}
                </p>
              ))}
            </div>
          ))}
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Com uma árvore só, qual dos três se ajusta melhor às ${N} propostas (menor log loss de treino)?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setK(1); }} recolher />
        {rev && <Seg rotulo="Árvore" opcoes={Array.from({ length: K }, (_, j) => ({ v: j + 1, r: `Árvore ${j + 1}` }))} valor={k} onChange={setK} />}
        <label className="q6-s08-sel"><span>Acompanhar</span>
          <select value={foco} onChange={(e) => setFoco(Number(e.target.value))}>{DIDATICA.map((q, i) => <option key={i} value={i}>#{q.id} · {q.y ? "default" : "adimplente"}</option>)}</select>
        </label>
        <div className="q7-botoes"><Botao sec onClick={restaurar}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
