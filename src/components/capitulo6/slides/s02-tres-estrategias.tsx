"use client";
import { useState } from "react";
import { Botao, Controle, Eixos, Grafico, LinkSlide, Painel, Previsao, Quadro, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { ajustar, estagios, logit, perdaLog, sigmoide, type No } from "@/lib/capitulo6/gbm";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 02 · c6p2 · Escolher, votar ou corrigir. As três maneiras de combinar árvores de profundidade 2 (mínimo de 2 por folha)
 * nas 16 propostas didáticas, medidas pela log loss de treino conforme o número de árvores cresce:
 *   escolher  uma árvore no default y, PD = frequência de default da folha;
 *   votar     árvores no default y, cada uma numa amostra com reposição (semente 20260502), PD = média das frequências;
 *   corrigir  o boosting da biblioteca (CFG_DIDATICA com 20 árvores): cada árvore no erro que as anteriores deixaram.
 * As árvores de votar saem do mesmo ajustar() da biblioteca com uma árvore só: o corte sobre y − p̄ é o corte sobre y, e a
 * frequência da folha é p̄ + soma ÷ n. Uma PD de 0% dada a um default torna a log loss infinita: o quadro marca "sem
 * limite" em vez de usar o piso numérico. A turma prevê o comportamento com 20 árvores antes de ver as curvas; só no
 * acerto o controle de árvores aparece. A lista do painel mostra o alvo da árvore k para a proposta #3 nos dois métodos.
 */
const KMAX = 20, SEMENTE = 20260502, FOCO = 3; // proposta acompanhada: #3, adimplente
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
/** Frequência de default da folha em que a proposta cai: p̄ da amostra + média do resíduo da folha. */
const freq = (no: No, x: readonly number[], pbar: number) => { let a = no; while (!a.folha) a = Math.fround(x[a.variavel]) <= a.corte ? a.esq : a.dir; return pbar + a.soma / a.n; };
const arvoreY = (X: number[][], y: number[]) => { const pbar = y.reduce((s, v) => s + v, 0) / y.length; return { no: ajustar(X, y, { ...CFG_DIDATICA, eta: 1, arvores: 1 }).arvores[0], pbar }; };
/** Log loss das PDs; null quando uma PD de 0% cai num default (ou 100% num adimplente): a perda não tem limite. */
const perda = (P: number[]) => (P.some((p, i) => (YD[i] === 1 && p <= 0) || (YD[i] === 0 && p >= 1)) ? null : perdaLog(P.map((p) => logit(Math.min(1 - 1e-12, Math.max(1e-12, p)))), YD));

const UMA = arvoreY(XD as number[][], YD);
const P_ESC = XD.map((x) => freq(UMA.no, x, UMA.pbar));
const L_ESC = perda(P_ESC)!;
const sorteio = mulberry32(SEMENTE);
const AMOSTRAS = Array.from({ length: KMAX }, () => Array.from({ length: XD.length }, () => Math.floor(sorteio() * XD.length)));
const VOTO = AMOSTRAS.map((ids) => arvoreY(ids.map((i) => XD[i] as number[]), ids.map((i) => YD[i])));
const P_VOT = Array.from({ length: KMAX }, (_, k) => XD.map((x) => VOTO.slice(0, k + 1).reduce((s, t) => s + freq(t.no, x, t.pbar), 0) / (k + 1)));
const L_VOT = P_VOT.map(perda);
const MOD = modelo({ ...CFG_DIDATICA, arvores: KMAX }, XD, YD);
const EST = estagios(MOD, XD);
const L_COR = EST.map((F) => perdaLog(F, YD)); // índice k = k árvores
const iF = DIDATICA.findIndex((p) => p.id === FOCO);
const R_COR = EST.map((F) => YD[iF] - sigmoide(F[iF])); // alvo da árvore k + 1
const VEZES = AMOSTRAS.map((ids) => ids.filter((i) => i === iF).length);
const P1 = sigmoide(EST[KMAX][0]), P2 = sigmoide(EST[KMAX][1]);
const fmtL = (v: number | null) => (v === null ? "sem limite" : num(v, 3));

const OPCOES: Opcao[] = [
  { texto: "Cai nas duas: mais árvores, menos erro", retorno: <>Confunde <b>votar com corrigir</b>. Árvores que olham o mesmo y, em amostras parecidas, repetem o mesmo erro; a média delas não o corrige.</> },
  { texto: "Votar estaciona; corrigir continua caindo", certa: true, retorno: <>Isso. Com {KMAX} árvores, votar fica em <b>{fmtL(L_VOT[KMAX - 1])}</b> e corrigir vai a <b>{num(L_COR[KMAX], 3)}</b>: já é decorar (#1 e #2, vizinhas, terminam com {pct(P1, 0)} e {pct(P2, 0)}).</> },
  { texto: "Votar cai mais, porque cada árvore vê outra amostra", retorno: <>Sortear amostras deixa as árvores diferentes e a média mais estável: reduz a <b>variância</b>, não o erro que todas cometem juntas.</> },
];

export function S02TresEstrategias({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [k, setK] = useState(KMAX);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const kv = rev ? k : 2; // antes do acerto, a lista mostra a segunda árvore
  return (
    <Quadro slug="c6p2" pagina={pagina} layout="gl"
      conclusao={!rev ? <>Com uma árvore: escolher tem log loss <b>{num(L_ESC, 3)}</b>, corrigir {num(L_COR[1], 3)}, e votar não tem limite (a amostra sorteada deu PD 0% a um default). E com {KMAX} árvores?</>
        : <>Com {k} árvore{k > 1 ? "s" : ""}: votar {fmtL(L_VOT[k - 1])}, corrigir <b>{num(L_COR[k], 3)}</b>. Até {KMAX}, votar estaciona perto de {fmtL(L_VOT[KMAX - 1])} e corrigir segue caindo: cada árvore mira o erro que sobrou. A sequência parte de um palpite único: <LinkSlide slug="c6p3">slide 3</LinkSlide>.</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (utilização e atraso; ${int(YD.reduce((s, v) => s + v, 0))} defaults). Árvores de profundidade ${CFG_DIDATICA.profundidade}, mínimo de ${CFG_DIDATICA.minFolha} por folha. Votar: amostras com reposição (semente ${SEMENTE}). Corrigir: taxa ${num(CFG_DIDATICA.eta, 1)} (slide 7). Log loss média, log natural.`}>
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
                  <rect x={x(6)} y={y(0.62)} width={x(KMAX) - x(6)} height={y(0.05) - y(0.62)} rx={8} fill="none" stroke="#9AA1AD" strokeWidth={2} strokeDasharray="7 6" />
                  <text className="q7-rot" x={(x(6) + x(KMAX)) / 2} y={(y(0.62) + y(0.05)) / 2} textAnchor="middle" style={{ fill: "#5B6475" }}>de 2 a {KMAX}: preveja antes</text>
                </g>}
              </g>
            );
          }}
        </Grafico>
        {rev && <Controle rotulo="Número de árvores" valor={k} min={1} max={KMAX} passo={1} onChange={setK} mostrar={int(k)} />}
      </Painel>
      <Painel>
        <Previsao pergunta={`De 1 para ${KMAX} árvores, o que acontece com a log loss de treino?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setK(KMAX); }} recolher />
        <p className="q7-k">Alvo da árvore {kv} na proposta #{FOCO}, adimplente</p>
        <dl className="q7-lista">
          <div><dt>■ Votar: o default y{VEZES[kv - 1] ? `, sorteada ${VEZES[kv - 1]}×` : ", fora da amostra"}</dt><dd>y = 0</dd></div>
          <div><dt>● Corrigir: o erro que sobrou, y − p</dt><dd>{num(R_COR[kv - 1], 2)}</dd></div>
        </dl>
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setK(KMAX); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
