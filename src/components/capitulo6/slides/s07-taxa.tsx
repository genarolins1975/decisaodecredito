"use client";
import { useState } from "react";
import { Botao, Controle, Formula, Grafico, LinkSlide, Painel, Previsao, Quadro, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { estagios, perdaLog, sigmoide } from "@/lib/capitulo6/gbm";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 07 · c6p7 · A taxa de aprendizagem. F ← F + η · valor da folha. Nas 16 propostas didáticas, com as quatro árvores de
 * CFG_DIDATICA (profundidade 2, mínimo 2 por folha), a log loss de treino depois de cada árvore para cada η da grade de
 * 0,05 a 1, todas do boosting da biblioteca (modelo()). A frase da leitura sobre a ordem das taxas é calculada: a
 * perda depois de 4 árvores cai quando η sobe em toda a grade (conferido abaixo). A turma prevê a taxa de menor perda de
 * treino antes de ver as curvas das outras taxas; as alternativas erradas são a taxa pequena (regularização tomada por
 * ajuste) e a taxa do curso (convenção tomada por ótimo). A leitura segue o dado: η = 1 desce mais na árvore 1, mas passa
 * do ponto na árvore seguinte, e depois de M árvores a menor perda da grade é de uma taxa abaixo de 1 (conferido abaixo).
 * O quadro não afirma nada sobre validação; quantas árvores cada taxa pede fica para o slide 14.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const M = CFG_DIDATICA.arvores;
const GRADE = Array.from({ length: 20 }, (_, i) => Math.round((i + 1) * 5) / 100);
const curva = (eta: number) => estagios(modelo({ ...CFG_DIDATICA, eta }, XD, YD), XD).map((F) => perdaLog(F, YD));
const CURVAS = new Map(GRADE.map((e) => [e, curva(e)]));
const L = (eta: number) => CURVAS.get(eta)!;
// as frases da leitura são calculadas: depois de uma árvore, a perda cai com a taxa em toda a grade (η = 1 é a menor);
// depois de M árvores, as duas menores perdas da grade
const CAI1 = GRADE.every((e, i) => i === 0 || L(e)[1] < L(GRADE[i - 1])[1]);
const TOP = [...GRADE].sort((a, b) => L(a)[M] - L(b)[M]).slice(0, 2); // TOP[0] é a menor
const ETA0 = CFG_DIDATICA.eta;
/** Primeira árvore em que a correção inteira (η = 1) fica acima da melhor taxa da grade após M árvores. */
const KPASSA = Array.from({ length: M }, (_, k) => k + 1).find((k) => L(1)[k] > L(TOP[0])[k]) ?? 0;
if (!(CAI1 && TOP[0] < 1 && KPASSA > 1 && L(1)[M] > L(TOP[0])[M])) throw new Error("a leitura do slide 7 não vale nos dados");
const MOD1 = modelo({ ...CFG_DIDATICA, eta: 1 }, XD, YD);
/** Folha dos adimplentes da primeira árvore (a folha B do slide 6): valor de Newton e quantas propostas. */
const VB = Math.min(...DIDATICA.map((_, i) => estagios(MOD1, XD)[1][i] - MOD1.f0));
const NB = DIDATICA.filter((_, i) => Math.abs(estagios(MOD1, XD)[1][i] - MOD1.f0 - VB) < 1e-9).length;

const OPCOES: Opcao[] = [
  { texto: "η = 0,1: passos pequenos erram menos", retorno: <>Confunde <b>regularização com ajuste</b>. A taxa pequena desce devagar no treino: com η = 0,1, a log loss após a árvore 1 ainda é {num(L(0.1)[1], 3)}.</> },
  { texto: "η = 1: a correção inteira", certa: true, retorno: <>Isso. {CAI1 ? "Na grade de 0,05 a 1, a perda após a árvore 1 cai a cada aumento da taxa" : "Na grade, η = 1 tem a menor perda"}: <b>{num(L(1)[1], 3)}</b> com η = 1 contra {num(L(ETA0)[1], 3)} com {num(ETA0, 1)}.</> },
  { texto: `η = ${num(ETA0, 1)}, a do curso: o meio-termo`, retorno: <>Confunde <b>convenção com ótimo</b>. {num(ETA0, 1)} é a taxa fixada para as 16, não a de menor perda; na carteira, taxa e número de árvores se escolhem juntos (slide 14).</> },
];

export function S07Taxa({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [eta, setEta] = useState(ETA0);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const l = L(eta);
  const pB = sigmoide(MOD1.f0 + eta * VB);
  return (
    <Quadro slug="c6p7" pagina={pagina} layout="gl"
      sub={rev ? undefined : "Que pedaço do passo de Newton somar a cada árvore?"}
      conclusao={!rev ? <>Com η = {num(ETA0, 1)}, a log loss de treino cai de {num(L(ETA0)[0], 3)} para {num(L(ETA0)[1], 3)} na primeira árvore. Outra taxa desceria mais? Responda ao lado.</>
        : <>Com η = {num(eta, 2)}: {num(l[M], 3)} após {M} árvores. η = 1 desce mais na árvore 1, mas passa do ponto na {KPASSA} ({num(L(1)[KPASSA], 3)} contra {num(L(TOP[0])[KPASSA], 3)} de η = {num(TOP[0], 2)}); após {M}, η = {num(TOP[0], 2)} fica em <b>{num(L(TOP[0])[M], 3)}</b>, abaixo de η = 1. A taxa muda quantas árvores são precisas: <LinkSlide slug="c6p14">slide 14</LinkSlide>.</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}). Boosting da biblioteca com ${M} árvores de profundidade ${CFG_DIDATICA.profundidade} e mínimo de ${CFG_DIDATICA.minFolha} por folha; taxa η de 0,05 a 1 em passos de 0,05. Log loss média de treino, log natural.`}>
      <Painel>
        <Grafico titulo="Log loss de treino, árvore a árvore" sub={rev ? `η = ${num(eta, 2)}; referências: ${[0.1, TOP[0], 1].filter((e) => Math.abs(e - eta) > 1e-9).map((e) => `η = ${num(e, 2)}`).join(", ")}` : `η = ${num(ETA0, 1)}; as outras taxas abrem depois da previsão`} rotulo={rev ? `Com η ${num(eta, 2)}: ${l.map((v) => num(v, 3)).join(", ")}; com η 1: ${num(L(1)[M], 3)} após ${M} árvores` : `Com η ${num(ETA0, 1)}: ${L(ETA0).map((v) => num(v, 3)).join(", ")}`} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.4, r: 8.6, t: 1.4, b: 2.9 });
            const x = escala([0, M], [m.l, d.w - m.r]), y = escala([0, 0.7], [d.h - m.b, m.t]);
            const pts = (c: number[]) => c.map((v, k) => ({ x: x(k), y: y(v) }));
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const refs = rev ? [0.1, TOP[0], 1].filter((e) => Math.abs(e - eta) > 1e-9) : [];
            // rótulos ao fim das curvas, afastados para não se sobreporem
            const fins = [...refs.map((e) => ({ e, atual: false })), { e: rev ? eta : ETA0, atual: true }].map((q) => ({ ...q, yy: y(L(q.e)[M]) })).sort((a, b) => a.yy - b.yy);
            for (let j = 1; j < fins.length; j++) if (fins[j].yy - fins[j - 1].yy < d.fs * 1.2) fins[j].yy = fins[j - 1].yy + d.fs * 1.2;
            const atual = rev ? eta : ETA0;
            return (
              <g>
                {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map((v) => <g key={v}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(v)} dy=".34em" textAnchor="end">{num(v, 1)}</text></g>)}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y(0)} y2={y(0)} />
                {Array.from({ length: M + 1 }, (_, k) => <text key={k} className="q7-tick" x={x(k)} y={y(0)} dy="1.25em" textAnchor="middle">{k === 0 ? "F₀" : `árvore ${k}`}</text>)}
                <text className="q7-eixo-t" x={m.l} y={m.t} dy="-.45em">Log loss média</text>
                {refs.map((e) => <path key={e} className="q7-linha q7-linha--mudo q7-linha--fina" strokeDasharray={e === 1 ? undefined : e === TOP[0] ? "2 5" : "8 6"} d={caminho(pts(L(e)))} />)}
                {rev && <g>
                  <circle cx={x(KPASSA)} cy={y(L(1)[KPASSA])} r={d.fs * 0.5} fill="none" stroke="#5B6475" strokeWidth={2} />
                  <text className="q7-rot--peq" x={x(KPASSA)} y={y(L(1)[KPASSA])} dx=".9em" dy="-.5em" style={{ fill: "#5B6475", fontWeight: 700, ...halo }}>η = 1 passa do ponto</text>
                </g>}
                <path className="q7-linha q7-linha--ink" d={caminho(pts(L(atual)))} />
                {L(atual).map((v, k) => <circle key={k} cx={x(k)} cy={y(v)} r={d.fs * 0.32} fill="#00205B" stroke="#fff" strokeWidth={1.5} />)}
                {L(atual).map((v, k) => (k > 0 && k < M ? <text key={`r${k}`} className="q7-rot--peq" x={x(k)} y={y(v)} dx=".5em" dy="-.6em" textAnchor="start" style={{ fill: "#00205B", ...halo }}>{num(v, 3)}</text> : null))}
                {fins.map((q) => <text key={q.e} className={q.atual ? "q7-rot" : "q7-rot--peq"} x={x(M)} y={q.yy} dx=".6em" dy=".35em" style={{ fill: q.atual ? "#00205B" : "#5B6475", ...halo }}>{q.atual ? "● " : ""}η = {num(q.e, 2)}: {num(L(q.e)[M], 3)}</text>)}
                {!rev && <g>
                  <rect x={x(0.4)} y={y(0.22)} width={x(M) - x(0.4)} height={y(0.02) - y(0.22)} rx={8} fill="none" stroke="#9AA1AD" strokeWidth={2} strokeDasharray="7 6" />
                  <text className="q7-rot" x={(x(0.4) + x(M)) / 2} y={(y(0.22) + y(0.02)) / 2} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>outras taxas: preveja antes</text>
                </g>}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Formula compacta f={String.raw`F_m(x)=F_{m-1}(x)+\eta\cdot\gamma_{\text{folha}}`} />
        <Previsao pergunta="Depois da primeira árvore, que taxa deixa a menor log loss de treino?" opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setEta(ETA0); }} recolher />
        {rev && <>
          <Controle rotulo="Taxa de aprendizagem η" valor={eta} min={0.05} max={1} passo={0.05} onChange={(v) => setEta(Math.round(v * 100) / 100)} mostrar={num(eta, 2)} />
          <dl className="q7-lista">
            <div data-tom="prob"><dt>Folha B ({int(NB)} adimplentes): PD</dt><dd>{pct(sigmoide(MOD1.f0), 0)} → {pct(pB, 1)}</dd></div>
          </dl>
        </>}
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setEta(ETA0); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
