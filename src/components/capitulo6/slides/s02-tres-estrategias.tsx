"use client";
import { useState } from "react";
import { Botao, Controle, Eixos, Expandir, Grafico, LinkSlide, Painel, Previsao, Quadro, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { SLIDE } from "@/lib/capitulo6/roteiro";
import { estagios, perdaLog, sigmoide } from "@/lib/capitulo6/gbm";
import { SEMENTE_VOTAR, amostrasVotar, arvoreY, freq, perdaPD } from "@/lib/capitulo6/metodos";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 03 · c6p2 · Escolher, votar ou corrigir, medidos. Os três métodos que o slide 2 (c6p23) explica, com árvores de
 * profundidade 2 (mínimo de 2 por folha) nas 16 propostas didáticas, pela log loss de treino conforme o número de árvores
 * cresce. As peças de escolher e votar vêm de src/lib/capitulo6/metodos.ts (as mesmas do slide 2); corrigir é o boosting
 * da biblioteca (CFG_DIDATICA com 20 árvores). Uma PD de 0% dada a um default (ou de 100% a um adimplente) torna a log
 * loss infinita: o quadro marca "sem limite" em vez de usar o piso numérico. A turma prevê o comportamento com 20 árvores
 * antes de ver as curvas; só no acerto o controle de árvores aparece. A expansão do painel explica a primeira árvore, com
 * números calculados aqui: folhas puras de escolher, PDs extremas de corrigir com η = 0,4 e com η = 1 (passo de Newton
 * inteiro), e as propostas que a primeira amostra de votar deixou de fora.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const KMAX = 20;
const UMA = arvoreY(XD, YD);
const P_ESC = XD.map((x) => freq(UMA.no, x, UMA.pbar));
const L_ESC = perdaPD(P_ESC, YD)!;
const AMOSTRAS = amostrasVotar(KMAX, XD.length);
const VOTO = AMOSTRAS.map((ids) => arvoreY(ids.map((i) => XD[i]), ids.map((i) => YD[i])));
const P_VOT = Array.from({ length: KMAX }, (_, k) => XD.map((x) => VOTO.slice(0, k + 1).reduce((s, t) => s + freq(t.no, x, t.pbar), 0) / (k + 1)));
const L_VOT = P_VOT.map((P) => perdaPD(P, YD));
const MOD = modelo({ ...CFG_DIDATICA, arvores: KMAX }, XD, YD);
const EST = estagios(MOD, XD);
const L_COR = EST.map((F) => perdaLog(F, YD)); // índice k = k árvores
const P1 = sigmoide(EST[KMAX][0]), P2 = sigmoide(EST[KMAX][1]);
const fmtL = (v: number | null) => (v === null ? "sem limite" : num(v, 3));
const DEFS = ["┄ escolher: uma árvore", "■ votar: média de árvores", "● corrigir: soma em sequência"];
const DEFS_CURTAS = ["┄ escolher", "■ votar", "● corrigir"]; // gráfico estreito (celular): só o nome, como no slide 2

/** Votar para de cair: a menor perda de votar fica numa árvore intermediária e, dali até KMAX, oscila acima dela. */
const VALIDOS = L_VOT.map((v, i) => [v, i + 1] as const).filter((q): q is readonly [number, number] => q[0] !== null);
const [VMIN, KVMIN] = VALIDOS.reduce((a, q) => (q[0] < a[0] ? q : a));
const VMAX_DEPOIS = Math.max(...VALIDOS.filter(([, k]) => k >= KVMIN).map(([v]) => v));
const COR_CAI = L_COR.every((v, k) => k === 0 || v < L_COR[k - 1]);
if (!(KVMIN < KMAX && COR_CAI && L_VOT[KMAX - 1]! > VMIN)) throw new Error("as frases de votar e corrigir não valem nos dados");

/* A primeira árvore, explicada com os números da tela. */
const PURAS = P_ESC.filter((p) => p === 0 || p === 1).length; // folhas puras: perda zero
const MEIO = P_ESC.filter((p) => p > 0 && p < 1);
const PD_COR1 = EST[1].map(sigmoide), COR1 = [Math.min(...PD_COR1), Math.max(...PD_COR1)];
const EST_ETA1 = estagios(modelo({ ...CFG_DIDATICA, eta: 1, arvores: 1 }, XD, YD), XD);
const COR1_ETA1 = Math.min(...EST_ETA1[1].map(sigmoide)), L_COR1_ETA1 = perdaLog(EST_ETA1[1], YD);
const FORA1 = DIDATICA.filter((_, i) => !AMOSTRAS[0].includes(i));
const ERRADAS1 = DIDATICA.filter((p, i) => (p.y === 0 && P_VOT[0][i] >= 1) || (p.y === 1 && P_VOT[0][i] <= 0));
const ids = (ps: { id: number }[]) => ps.map((p) => `#${p.id}`).join(" e ");
if (!(new Set(MEIO).size === 1 && L_VOT[0] === null && ERRADAS1.length > 0 && ERRADAS1.every((p) => p.y === 0 && FORA1.includes(p)) && L_ESC < L_COR[1] && L_COR1_ETA1 < L_COR[1]))
  throw new Error("a explicação da primeira árvore não vale nos dados");

const OPCOES: Opcao[] = [
  { texto: `As duas continuam caindo a cada árvore até a ${KMAX}`, retorno: <>Votar cai nas primeiras árvores ({fmtL(L_VOT[1])} com 2, {num(VMIN, 3)} com {KVMIN}) e depois oscila entre {num(VMIN, 3)} e {num(VMAX_DEPOIS, 3)}: a média de árvores no mesmo y reduz a <b>variância</b> e estaciona no erro que todas cometem. Só corrigir mira o erro que sobrou.</> },
  { texto: "Votar para de cair e oscila; corrigir cai a cada árvore", certa: true, retorno: <>Isso. Com {KMAX} árvores, votar fica em <b>{fmtL(L_VOT[KMAX - 1])}</b> (a menor foi {num(VMIN, 3)}, na árvore {KVMIN}) e corrigir vai a <b>{num(L_COR[KMAX], 3)}</b>: já é decorar (#1 e #2, vizinhas, terminam com {pct(P1, 0)} e {pct(P2, 0)}).</> },
  { texto: "Votar cai mais, porque cada árvore vê outra amostra", retorno: <>Sortear amostras deixa as árvores diferentes e a média mais estável: reduz a <b>variância</b>, não o erro que todas cometem juntas.</> },
];

export function S02TresEstrategias({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [k, setK] = useState(KMAX);
  const rev = esc !== null && !!OPCOES[esc].certa;
  return (
    <Quadro slug="c6p2" pagina={pagina} layout="gl"
      conclusao={!rev ? <>Com uma árvore, escolher tem log loss <b>{num(L_ESC, 3)}</b>: {PURAS} das {DIDATICA.length} caem em folhas puras. Corrigir fica em {num(L_COR[1], 3)} e votar não tem limite (por quê, ao lado). E com {KMAX} árvores?</>
        : <>Com {k} árvore{k > 1 ? "s" : ""}: votar {fmtL(L_VOT[k - 1])}, corrigir <b>{num(L_COR[k], 3)}</b>. Votar para de cair na árvore {KVMIN} ({num(VMIN, 3)}); corrigir cai em todas: cada árvore mira o erro que sobrou. A sequência parte de um palpite único: <LinkSlide slug="c6p3">slide {SLIDE.c6p3.n}</LinkSlide>.</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}; utilização e atraso; ${int(YD.reduce((s, v) => s + v, 0))} defaults). Árvores de profundidade ${CFG_DIDATICA.profundidade}, mínimo de ${CFG_DIDATICA.minFolha} por folha. Votar: amostras com reposição (semente ${SEMENTE_VOTAR}). Corrigir: taxa ${num(CFG_DIDATICA.eta, 1)} (slide ${SLIDE.c6p7.n}). Log loss média, log natural.`}>
      <Painel>
        <Grafico titulo="Log loss de treino nas 16 propostas" sub="conforme as árvores se somam" rotulo={rev ? `Log loss com ${k} árvores: votar ${fmtL(L_VOT[k - 1])}, corrigir ${num(L_COR[k], 3)}; escolher, uma árvore, ${num(L_ESC, 3)}` : `Com uma árvore: escolher ${num(L_ESC, 3)}, corrigir ${num(L_COR[1], 3)}, votar sem limite; o resto oculto até a previsão`} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.4, r: 9.5, t: 1.6, b: 2.9 });
            const x = escala([1, KMAX], [m.l, d.w - m.r]), y = escala([0, 0.7], [d.h - m.b, m.t]);
            const ate = rev ? k : 1;
            const cy = (v: number | null) => (v === null ? -1 : y(Math.min(0.7, v)));
            const vot = Array.from({ length: ate }, (_, i) => ({ x: x(i + 1), y: cy(L_VOT[i]) }));
            const cor = Array.from({ length: ate }, (_, i) => ({ x: x(i + 1), y: y(L_COR[i + 1]) }));
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const ult = (s: { x: number; y: number }[]) => s[s.length - 1];
            return (
              <g>
                <Eixos x={x} y={y} xt={[1, 5, 10, 15, 20]} yt={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]} fx={(v) => int(v)} fy={(v) => num(v, 1)} xTit="Número de árvores" />
                <line x1={x(1)} x2={x(KMAX)} y1={y(L_ESC)} y2={y(L_ESC)} stroke="#5B6475" strokeWidth={2.5} strokeDasharray="9 6" />
                <text className="q7-rot--peq" x={x(KMAX)} y={y(L_ESC)} dx=".6em" dy=".35em" style={{ fill: "#5B6475" }}>escolher {num(L_ESC, 3)}</text>
                {ate > 1 && <path className="q7-linha q7-linha--mudo" d={caminho(vot.filter((p) => p.y >= 0))} />}
                {ate > 1 && <path className="q7-linha q7-linha--ink" d={caminho(cor)} />}
                {vot.map((p, i) => (L_VOT[i] === null ? <g key={i}><text className="q7-rot" x={p.x} y={m.t} dy=".1em" textAnchor="middle" style={{ fill: "#5B6475" }}>↑</text><text className="q7-rot--peq" x={p.x} y={m.t} dx=".9em" dy=".1em" style={{ fill: "#5B6475" }}>votar com 1 árvore: sem limite</text></g>
                  : <rect key={i} x={p.x - d.fs * 0.3} y={p.y - d.fs * 0.3} width={d.fs * 0.6} height={d.fs * 0.6} fill="#fff" stroke="#5B6475" strokeWidth={2.2} />))}
                {cor.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={d.fs * 0.3} fill="#00205B" stroke="#fff" strokeWidth={1.5} />)}
                {rev && ate > 1 && L_VOT[ate - 1] !== null && <text className="q7-rot" x={ult(vot).x} y={ult(vot).y} dx=".8em" dy="-.4em" style={{ fill: "#5B6475", ...halo }}>■ votar {fmtL(L_VOT[ate - 1])}</text>}
                <text className="q7-rot" x={ult(cor).x} y={ult(cor).y} dx=".8em" dy=".9em" style={{ fill: "#00205B", ...halo }}>● corrigir {num(L_COR[ate], 3)}</text>
                {!rev && <g>
                  <rect x={x(6)} y={y(0.5)} width={x(KMAX) - x(6)} height={y(0.05) - y(0.5)} rx={8} fill="none" stroke="#9AA1AD" strokeWidth={2} strokeDasharray="7 6" />
                  <text className="q7-rot" x={(x(6) + x(KMAX)) / 2} y={(y(0.5) + y(0.05)) / 2} textAnchor="middle" style={{ fill: "#5B6475" }}>de 2 a {KMAX}: preveja antes</text>
                </g>}
                {/* as três estratégias, definidas no próprio gráfico */}
                {(d.w < d.fs * 32 ? DEFS_CURTAS : DEFS).map((t, j) => <text key={j} className="q7-rot--peq" x={d.w - m.r} y={y(0.7)} dy={`${2.2 + j * 1.3}em`} textAnchor="end" style={{ fill: j === 2 ? "#00205B" : "#5B6475", fontWeight: 600, ...halo }}>{t}</text>)}
              </g>
            );
          }}
        </Grafico>
        {rev && <Controle rotulo="Número de árvores" valor={k} min={1} max={KMAX} passo={1} onChange={setK} mostrar={int(k)} />}
      </Painel>
      <Painel>
        <Previsao pergunta={`De 1 a ${KMAX} árvores, como anda a log loss de treino de votar e de corrigir?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setK(KMAX); }} recolher />
        <Expandir resumo="Uma árvore: por que escolher perde menos?">
          <dl className="q6-s02-um">
            <div><dt>┄ Escolher {num(L_ESC, 3)}</dt><dd>{PURAS} das {DIDATICA.length} caem em folhas puras e recebem PD 0% ou 100%, com perda zero; {MEIO.length} ficam em {pct(MEIO[0], 0)}.</dd></div>
            <div><dt>● Corrigir {num(L_COR[1], 3)}</dt><dd>soma só η = {num(CFG_DIDATICA.eta, 1)} do passo de Newton: as PDs vão a {pct(COR1[0], 0)} e {pct(COR1[1], 0)}. Com η = 1, o passo para em {pct(COR1_ETA1, 1)} e a perda seria {num(L_COR1_ETA1, 3)}.</dd></div>
            <div><dt>■ Votar: sem limite</dt><dd>a primeira amostra deixou de fora {ids(ERRADAS1)}, adimplentes, que caíram numa folha só de defaults e receberam PD {pct(1, 0)}.</dd></div>
          </dl>
        </Expandir>
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setK(KMAX); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
