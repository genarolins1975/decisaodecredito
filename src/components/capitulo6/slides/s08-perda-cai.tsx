"use client";
import { useState } from "react";
import { Botao, Grafico, LinkSlide, Marca, Painel, Previsao, Quadro, Seg, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { estagios, logit, perdaLog, sigmoide, valorArvore } from "@/lib/capitulo6/gbm";
import { num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 08 · c6p8 · Quatro árvores nas 16 propostas (CFG_DIDATICA: taxa 0,4, profundidade 2, mínimo 2 por folha), do boosting da
 * biblioteca. A peça é a PD de cada proposta depois de cada árvore; propostas que caem sempre nas mesmas folhas andam
 * juntas e viram uma linha só, com os números ao fim. Abaixo do eixo, a log loss de treino de cada estágio. A turma prevê
 * se a PD de todo default sobe a cada árvore antes de ver as árvores 2 a 4; as frases sobre quem recua e sobre a perda
 * que cai em todas as árvores são calculadas aqui. Que a perda caia aqui não é regra: com o valor de folha por Newton, o
 * passo pode exagerar numa folha de p extremo; o contraexemplo do retorno (EXC) é calculado com a biblioteca. Depois, o seletor de estágio e o de proposta acompanham uma proposta
 * do começo ao fim: a folha em que ela cai, η vezes o valor da folha e a PD antes e depois.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const MOD = modelo(CFG_DIDATICA, XD, YD);
const M = MOD.arvores.length, ETA = MOD.eta;
const EST = estagios(MOD, XD);
const PD = EST.map((F) => F.map(sigmoide)); // PD[k][i]
const LOSS = EST.map((F) => perdaLog(F, YD));
const CAI_SEMPRE = LOSS.every((v, k) => k === 0 || v < LOSS[k - 1]);
/** Defaults cuja PD recua em alguma árvore: [índice, árvore]. */
const RECUOS = DIDATICA.flatMap((p, i) => (p.y === 1 ? Array.from({ length: M }, (_, k) => k + 1).filter((k) => PD[k][i] < PD[k - 1][i] - 1e-12).map((k) => [i, k] as const) : []));
const [R0i] = RECUOS[0] ?? [0, 1]; // nas 16 há recuo (#10); o padrão só evita erro de módulo
/** Por proposta que recua: as árvores em que recua. */
const POR = [...new Set(RECUOS.map(([i]) => i))].map((i) => ({ i, ks: RECUOS.filter(([j]) => j === i).map(([, k]) => k) }));
const arvs = (ks: number[]) => (ks.length === 1 ? `na árvore ${ks[0]}` : `nas árvores ${ks.slice(0, -1).join(", ")} e ${ks[ks.length - 1]}`);
const FOCO0 = R0i; // a proposta acompanhada de início: o primeiro default que recua
/** Grupos de propostas com a mesma trajetória (as mesmas folhas em todas as árvores). */
const GRUPOS: number[][] = [];
DIDATICA.forEach((_, i) => { const g = GRUPOS.find((gr) => EST.every((F) => Math.abs(F[gr[0]] - F[i]) < 1e-12)); if (g) g.push(i); else GRUPOS.push([i]); });
/** Nome do grupo com as sequências comprimidas: #9, #11 a #14. */
const nomeG = (g: number[]) => {
  const corridas: number[][] = [];
  for (const i of g) { const c = corridas[corridas.length - 1]; if (c && i === c[c.length - 1] + 1) c.push(i); else corridas.push([i]); }
  const nm = corridas.map((c) => (c.length === 1 ? `#${DIDATICA[c[0]].id}` : c.length === 2 ? `#${DIDATICA[c[0]].id} e #${DIDATICA[c[1]].id}` : `#${DIDATICA[c[0]].id} a #${DIDATICA[c[c.length - 1]].id}`));
  return nm.join(", ");
};
const id = (i: number) => DIDATICA[i].id;
/**
 * Contraexemplo: uma folha em que o modelo dá p = 1% a todos e metade deu default. O valor de Newton (Σr ÷ Σp(1 − p)) é
 * enorme e, mesmo multiplicado pela taxa do slide, a perda média da folha sobe.
 */
const EXC = (() => {
  const p = 0.01, n = 100, y: number[] = Array.from({ length: n }, (_, i) => (i < n / 2 ? 1 : 0));
  const F0 = logit(p), g = y.reduce((s, v) => s + (v - p), 0) / (n * p * (1 - p));
  return { p, g, antes: perdaLog(y.map(() => F0), y), depois: perdaLog(y.map(() => F0 + ETA * g), y) };
})();
if (!(EXC.depois > EXC.antes)) throw new Error("o contraexemplo do slide 8 não vale");
const sinal = (v: number, c = 2) => `${v > 1e-12 ? "+" : ""}${num(Math.abs(v) < 1e-12 ? 0 : v, c)}`;
const rotProposta = (i: number) => `#${id(i)} · ${DIDATICA[i].y ? "default" : "adimplente"} · ${DIDATICA[i].util}%, ${DIDATICA[i].atraso} dias`;

const OPCOES: Opcao[] = [
  { texto: "Sim: a PD de todo default sobe a cada árvore", retorno: <>A árvore corrige <b>grupos</b>, não propostas: a folha soma a mesma parcela a todos que caem nela. Se um default divide a folha com adimplentes, a parcela pode ser negativa.</> },
  { texto: "Não: a perda média cai, mas a PD de um default pode recuar", certa: true, retorno: <>Isso: {POR.map((q, j) => <span key={q.i}>{j ? " e " : ""}#{id(q.i)} recua {arvs(q.ks)}</span>)}, embora tenham dado default; a log loss {CAI_SEMPRE ? "cai em todas as árvores" : "nem sempre cai"}.</> },
  { texto: "Não se sabe: a log loss pode subir numa árvore", retorno: <>Aqui ela {CAI_SEMPRE ? "cai nas quatro" : "sobe em alguma"}: {LOSS.map((v) => num(v, 3)).join(" → ")}. Costuma cair; não é garantido: o passo de Newton pode exagerar em folha com p extremo (p = {pct(EXC.p, 0)} e metade de defaults: γ = {num(EXC.g, 1)}, e com η = {num(ETA, 1)} a perda da folha vai de {num(EXC.antes, 2)} a {num(EXC.depois, 2)}); a taxa η reduz esse risco. A pergunta era outra: o que recua é a PD de uma proposta.</> },
];

export function S08PerdaCai({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [k, setK] = useState(M);
  const [foco, setFoco] = useState(FOCO0);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const ate = rev ? k : 1;
  const v = k > 0 ? valorArvore(MOD.arvores[k - 1], XD[foco]) : 0;
  const restaurar = () => { setEsc(null); setK(M); setFoco(FOCO0); };
  return (
    <Quadro slug="c6p8" pagina={pagina} layout="gl"
      conclusao={!rev ? <>Árvore 1: a log loss vai de {num(LOSS[0], 3)} a {num(LOSS[1], 3)}, e cada proposta sai de {pct(PD[0][0], 0)} para a PD da sua folha. Antes das árvores 2 a 4: a PD de todo default sobe sempre?</>
        : k === 0 ? <>No palpite, PD de {pct(PD[0][foco], 0)} para todas e log loss {num(LOSS[0], 3)}. Avance as árvores e acompanhe #{id(foco)}.</>
          : <>Árvore {k}: log loss de {num(LOSS[k - 1], 3)} a <b>{num(LOSS[k], 3)}</b>. #{id(foco)} cai numa folha de valor {sinal(v)}: soma {num(ETA, 1)} × {sinal(v)} = {sinal(ETA * v)} às log odds, e a PD vai de {pct(PD[k - 1][foco], 1)} a <b>{pct(PD[k][foco], 1)}</b>. A PD como soma de parcelas: <LinkSlide slug="c6p9">slide 9</LinkSlide>.</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}; ${YD.reduce((s, v) => s + v, 0)} defaults). Boosting da biblioteca: palpite F₀ = ${num(MOD.f0, 2)}, taxa ${num(ETA, 1)}, ${M} árvores de profundidade ${CFG_DIDATICA.profundidade}, mínimo de ${CFG_DIDATICA.minFolha} por folha, valor da folha por Newton. Log loss média de treino, log natural.`}>
      <Painel>
        <Grafico titulo="PD de cada proposta, árvore a árvore" sub="propostas nas mesmas folhas andam juntas" rotulo={`PD por estágio; ${GRUPOS.map((g) => `${nomeG(g)}: ${PD.slice(0, ate + 1).map((P) => pct(P[g[0]], 1)).join(", ")}`).join("; ")}; log loss ${LOSS.slice(0, ate + 1).map((x) => num(x, 3)).join(", ")}`} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.2, r: 9.2, t: 1.4, b: 5.6 });
            const x = escala([0, M], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const gFoco = GRUPOS.find((g) => g.includes(foco))!;
            // rótulos ao fim, afastados para não se sobreporem
            const fins = GRUPOS.map((g) => ({ g, yy: y(PD[ate][g[0]]) })).sort((a, b) => a.yy - b.yy);
            for (let j = 1; j < fins.length; j++) if (fins[j].yy - fins[j - 1].yy < d.fs * 1.15) fins[j].yy = fins[j - 1].yy + d.fs * 1.15;
            const yl = d.h - m.b + d.fs * 4.3;
            return (
              <g>
                {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(t)} y2={y(t)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(t)} dy=".34em" textAnchor="end">{pct(t, 0)}</text></g>)}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y(0)} y2={y(0)} />
                {Array.from({ length: M + 1 }, (_, s) => <text key={s} className="q7-tick" x={x(s)} y={y(0)} dy="1.25em" textAnchor="middle" style={{ fontWeight: rev && s === k ? 700 : undefined, fill: rev && s === k ? "#00205B" : undefined }}>{s === 0 ? "F₀" : `árvore ${s}`}</text>)}
                <text className="q7-eixo-t" x={m.l} y={m.t} dy="-.45em">PD</text>
                {/* log loss de treino por estágio */}
                <text className="q7-rot--peq" x={m.l} y={yl} dy="-1.35em" style={{ fill: "#5B6475" }}>log loss de treino</text>
                {LOSS.map((l, s) => <text key={s} className="q7-rot" x={x(s)} y={yl} textAnchor="middle" style={{ fill: s <= ate ? "#00205B" : "#B5BAC4", fontWeight: rev && s === k ? 800 : 600 }}>{num(l, 3)}</text>)}
                {LOSS.slice(1).map((_, s) => <text key={`s${s}`} className="q7-rot--peq" x={(x(s) + x(s + 1)) / 2} y={yl} textAnchor="middle" style={{ fill: s + 1 <= ate ? "#5B6475" : "#B5BAC4" }}>→</text>)}
                {rev && k > 0 && <rect x={x(k - 1)} y={m.t} width={x(k) - x(k - 1)} height={y(0) - m.t} fill="#EFF3FA" opacity={0.7} />}
                {GRUPOS.map((g) => {
                  const on = g === gFoco;
                  return <path key={g[0]} className="q7-anim-d" d={caminho(PD.slice(0, ate + 1).map((P, s) => ({ x: x(s), y: y(P[g[0]]) })))} fill="none" stroke="#176C73" strokeWidth={on ? 5 : 2.5} strokeOpacity={on ? 1 : 0.35} strokeLinejoin="round" />;
                })}
                {GRUPOS.map((g) => PD.slice(0, ate + 1).map((P, s) => (g === gFoco ? <circle key={`${g[0]}-${s}`} cx={x(s)} cy={y(P[g[0]])} r={d.fs * 0.3} fill="#176C73" stroke="#fff" strokeWidth={1.5} /> : null)))}
                {PD.slice(1, ate + 1).map((P, s) => (rev && s + 1 === ate ? null : <text key={`v${s}`} className="q7-rot--peq" x={x(s + 1)} y={y(P[foco])} dy={P[foco] >= PD[s][foco] ? "-.8em" : "1.5em"} textAnchor="middle" style={{ fill: "#176C73", fontWeight: 700, ...halo }}>{pct(P[foco], 1)}</text>))}
                {rev && fins.map(({ g, yy }) => {
                  const def = DIDATICA[g[0]].y === 1, mist = g.some((i) => DIDATICA[i].y !== DIDATICA[g[0]].y), on = g === gFoco;
                  return (
                    <g key={g[0]}>
                      {mist ? <><Marca x={x(ate) + d.fs * 0.9} y={yy} r={d.fs * 0.32} def={false} /><Marca x={x(ate) + d.fs * 1.65} y={yy} r={d.fs * 0.32} def /></> : <Marca x={x(ate) + d.fs * 0.9} y={yy} r={d.fs * 0.32} def={def} />}
                      <text className="q7-rot--peq" x={x(ate) + d.fs * (mist ? 2.3 : 1.55)} y={yy} dy=".35em" style={{ fill: on ? "#176C73" : "#5B6475", fontWeight: on ? 700 : 500 }}>{nomeG(g)} {pct(PD[ate][g[0]], on ? 1 : 0)}</text>
                    </g>
                  );
                })}
                {!rev && <g>
                  <rect x={x(1.25)} y={y(0.95)} width={x(M) - x(1.25)} height={y(0.05) - y(0.95)} rx={8} fill="none" stroke="#9AA1AD" strokeWidth={2} strokeDasharray="7 6" />
                  <text className="q7-rot" x={(x(1.25) + x(M)) / 2} y={y(0.5)} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>árvores 2 a 4: preveja</text>
                </g>}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao pergunta="Nas quatro árvores, a log loss de treino cai. E a PD de cada default?" opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setK(M); setFoco(FOCO0); }} recolher />
        {rev && <>
          <Seg rotulo="Estágio" opcoes={Array.from({ length: M + 1 }, (_, s) => ({ v: s, r: s === 0 ? "F₀" : `Árvore ${s}` }))} valor={k} onChange={setK} />
          <label className="q6-s08-sel"><span>Acompanhar</span>
            <select value={foco} onChange={(e) => setFoco(Number(e.target.value))}>{DIDATICA.map((_, i) => <option key={i} value={i}>{rotProposta(i)}</option>)}</select>
          </label>
        </>}
        <div className="q7-botoes"><Botao sec onClick={restaurar}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
