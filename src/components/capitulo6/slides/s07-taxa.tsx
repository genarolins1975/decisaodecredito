"use client";
import { useState } from "react";
import { Botao, Controle, Formula, Grafico, LinkSlide, Painel, Previsao, Quadro, caminho, escala, margens, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { CFG_DIDATICA, DIDATICA, XD, YD, modelo } from "@/lib/capitulo6/dados";
import { SLIDE } from "@/lib/capitulo6/roteiro";
import { estagios, perdaLog, valorArvore } from "@/lib/capitulo6/gbm";
import { num } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 08 · c6p7 · A taxa de aprendizagem. F ← F + η · valor da folha. Nas 16 propostas didáticas, com as quatro árvores de
 * CFG_DIDATICA (profundidade 2, mínimo 2 por folha), a log loss de treino depois de cada árvore para cada η da grade de
 * 0,05 a 1, todas do boosting da biblioteca (modelo()). A turma prevê que taxa desce mais rápido no treino; a certa é
 * "perto de 1" (após a árvore 1, a perda cai a cada aumento de η em toda a grade; após M árvores, cai até a melhor taxa
 * da grade, η = 1 fica um pouco acima dela, e todas as taxas a partir de PERTO terminam abaixo de todas as menores,
 * conferido abaixo). O título diz "taxas perto de 1", não "a maior", porque η = 1 não é a menor perda após M árvores. A virada está na leitura: somar só um pedaço não serve para descer mais rápido no treino, serve
 * para que nenhuma árvore, ajustada a poucos casos, pese sozinha na soma; quem julga isso é a validação (slides 15 e 16).
 * η = 1 termina acima de η = 0,95 porque da árvore 2 em diante cada taxa gera árvores diferentes, não porque o passo
 * inteiro passe do ponto: a busca em linha na árvore 2 do caminho de η = 1 dá o mínimo da perda acima de 1 vez o passo
 * (MULT, calculado abaixo com a biblioteca), ou seja, o passo inteiro ainda fica curto.
 */
const SEMENTE_BASE = base.meta.seed; // semente do gerador do curso, que também gerou as 16 propostas didáticas
const M = CFG_DIDATICA.arvores;
const GRADE = Array.from({ length: 20 }, (_, i) => Math.round((i + 1) * 5) / 100);
const curva = (eta: number) => estagios(modelo({ ...CFG_DIDATICA, eta }, XD, YD), XD).map((F) => perdaLog(F, YD));
const CURVAS = new Map(GRADE.map((e) => [e, curva(e)]));
const L = (eta: number) => CURVAS.get(eta)!;
// as frases da leitura são calculadas: depois de uma árvore, a perda cai com a taxa em toda a grade (η = 1 é a menor);
// depois de M árvores, a perda cai a cada aumento da taxa até a melhor da grade (TOP), e η = 1 fica acima dela
const CAI1 = GRADE.every((e, i) => i === 0 || L(e)[1] < L(GRADE[i - 1])[1]);
const TOP = [...GRADE].sort((a, b) => L(a)[M] - L(b)[M])[0];
const CAI_ATE_TOP = GRADE.filter((e) => e <= TOP).every((e, i) => i === 0 || L(e)[M] < L(GRADE[i - 1])[M]);
// "taxas perto de 1": a partir de PERTO, toda taxa da grade termina as M árvores abaixo de toda taxa menor
const PERTO = 0.8;
const ALTAS = GRADE.filter((e) => e >= PERTO - 1e-9), BAIXAS = GRADE.filter((e) => e < PERTO - 1e-9);
const MAX_ALTAS = Math.max(...ALTAS.map((e) => L(e)[M]));
const PERTO_DESCE = MAX_ALTAS < Math.min(...BAIXAS.map((e) => L(e)[M]));
const ETA0 = CFG_DIDATICA.eta;
const MOD1 = modelo({ ...CFG_DIDATICA, eta: 1 }, XD, YD);
const EST1 = estagios(MOD1, XD);
/** Busca em linha na árvore 2 do caminho de η = 1: o múltiplo do passo que minimiza a perda (a perda é convexa no múltiplo). */
const MULT = (() => {
  const f = (a: number) => perdaLog(EST1[1].map((v, i) => v + a * valorArvore(MOD1.arvores[1], XD[i])), YD);
  let lo = 0, hi = 4; for (let it = 0; it < 120; it++) { const u = lo + (hi - lo) / 3, w = hi - (hi - lo) / 3; if (f(u) < f(w)) hi = w; else lo = u; }
  return (lo + hi) / 2;
})();
if (!(CAI1 && CAI_ATE_TOP && PERTO_DESCE && TOP < 1 && L(1)[M] > L(TOP)[M] && MULT > 1)) throw new Error("a leitura do quadro c6p7 não vale nos dados");
/** Curvas de referência depois da previsão: a taxa pequena, a melhor da grade e a correção inteira. */
const REFS = [0.1, TOP, 1];
const ESTILO: Record<string, { tr?: string; larg: number; cor: string }> = { [String(0.1)]: { tr: "8 6", larg: 1.6, cor: "#9AA1AD" }, [String(TOP)]: { tr: "2 5", larg: 2.4, cor: "#5B6475" }, "1": { larg: 2.6, cor: "#5B6475" } };

const OPCOES: Opcao[] = [
  { texto: "η = 0,1: passos pequenos erram menos", retorno: <>Confunde <b>regularização com ajuste</b>. No treino, a taxa pequena desce devagar: após a árvore 1, {num(L(0.1)[1], 3)} com η = 0,1 contra {num(L(1)[1], 3)} com η = 1.</> },
  { texto: "Perto de 1: soma quase toda a correção", certa: true, retorno: <>Isso, no treino: após a árvore 1, a perda cai a cada aumento da taxa (<b>{num(L(1)[1], 3)}</b> com η = 1); após {M}, as de {num(PERTO, 2)} a 1 ficam todas abaixo das menores.</> },
  { texto: `η = ${num(ETA0, 1)}, a do curso: o meio-termo`, retorno: <>Confunde <b>convenção com ótimo</b>. {num(ETA0, 1)} é a taxa fixada para as 16; no treino, desce menos que as taxas perto de 1 ({num(L(ETA0)[1], 3)} contra {num(L(1)[1], 3)} após a árvore 1).</> },
];

export function S07Taxa({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [eta, setEta] = useState(ETA0);
  const rev = esc !== null && !!OPCOES[esc].certa;
  const l = L(eta);
  const refs = rev ? REFS.filter((e) => Math.abs(e - eta) > 1e-9) : [];
  return (
    <Quadro slug="c6p7" pagina={pagina} layout="gl"
      titulo={rev ? undefined : "Taxa de aprendizagem: quanto da correção somar?"}
      sub={rev ? undefined : "Que pedaço do passo de Newton somar a cada árvore?"}
      conclusao={!rev ? <>Com η = {num(ETA0, 1)}, a log loss de treino cai de {num(L(ETA0)[0], 3)} para {num(L(ETA0)[1], 3)} na primeira árvore. Que taxa desceria mais rápido? Responda ao lado.</>
        : <>No treino, a perda cai a cada aumento da taxa até η = {num(TOP, 2)} (<b>{num(L(TOP)[M], 3)}</b> após {M} árvores); η = 1 fica acima ({num(L(1)[M], 3)}) por gerar outras árvores, sem passar do ponto (ao lado). Somar só um pedaço evita que uma árvore de poucos casos pese sozinha; se compensa, diz a validação (<LinkSlide slug="c6p14">slides {SLIDE.c6p14.n}</LinkSlide> e <LinkSlide slug="c6p15">{SLIDE.c6p15.n}</LinkSlide>).</>}
      fonte={`${DIDATICA.length} propostas didáticas sintéticas dos capítulos 4 e 5 (gerador do curso, semente ${SEMENTE_BASE}). Boosting da biblioteca com ${M} árvores de profundidade ${CFG_DIDATICA.profundidade} e mínimo de ${CFG_DIDATICA.minFolha} por folha; taxa η de 0,05 a 1 em passos de 0,05. Log loss média de treino, log natural.`}>
      <Painel>
        <Grafico titulo="Log loss de treino, árvore a árvore" sub={rev ? `● η = ${num(eta, 2)}; referências: ${refs.map((e) => `η = ${num(e, 2)}`).join(", ")}` : `η = ${num(ETA0, 1)}; as outras taxas abrem depois da previsão`} rotulo={rev ? `Com η ${num(eta, 2)}: ${l.map((v) => num(v, 3)).join(", ")}; ${refs.map((e) => `com η ${num(e, 2)}: ${num(L(e)[M], 3)} após ${M} árvores`).join("; ")}` : `Com η ${num(ETA0, 1)}: ${L(ETA0).map((v) => num(v, 3)).join(", ")}`} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.4, r: 8.6, t: 1.4, b: 2.9 });
            const x = escala([0, M], [m.l, d.w - m.r]), y = escala([0, 0.7], [d.h - m.b, m.t]);
            const pts = (c: number[]) => c.map((v, k) => ({ x: x(k), y: y(v) }));
            const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
            const atual = rev ? eta : ETA0;
            // rótulos ao fim das curvas, afastados para não se sobreporem
            const fins = [...refs.map((e) => ({ e, atual: false })), { e: atual, atual: true }].map((q) => ({ ...q, yy: y(L(q.e)[M]) })).sort((a, b) => a.yy - b.yy);
            for (let j = 1; j < fins.length; j++) if (fins[j].yy - fins[j - 1].yy < d.fs * 1.2) fins[j].yy = fins[j - 1].yy + d.fs * 1.2;
            // números da curva escolhida: acima do ponto, ou abaixo quando uma referência passa logo acima
            const acima = (k: number) => !refs.some((e) => L(e)[k] > L(atual)[k] && y(L(atual)[k]) - y(L(e)[k]) < d.fs * 1.6);
            return (
              <g>
                {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map((v) => <g key={v}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(v)} dy=".34em" textAnchor="end">{num(v, 1)}</text></g>)}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y(0)} y2={y(0)} />
                {Array.from({ length: M + 1 }, (_, k) => <text key={k} className="q7-tick" x={x(k)} y={y(0)} dy="1.25em" textAnchor="middle">{k === 0 ? "F₀" : `árvore ${k}`}</text>)}
                <text className="q7-eixo-t" x={m.l} y={m.t} dy="-.45em">Log loss média</text>
                {refs.map((e) => { const st = ESTILO[String(e)]; return <path key={e} d={caminho(pts(L(e)))} fill="none" stroke={st.cor} strokeWidth={st.larg} strokeDasharray={st.tr} strokeLinejoin="round" />; })}
                {refs.filter((e) => e === TOP).map((e) => L(e).map((v, k) => (k > 0 ? <circle key={`t${k}`} cx={x(k)} cy={y(v)} r={d.fs * 0.26} fill="#fff" stroke="#5B6475" strokeWidth={1.8} /> : null)))}
                {refs.filter((e) => e === 1).map((e) => L(e).map((v, k) => (k > 0 ? <rect key={`u${k}`} x={x(k) - d.fs * 0.22} y={y(v) - d.fs * 0.22} width={d.fs * 0.44} height={d.fs * 0.44} fill="#5B6475" /> : null)))}
                <path className="q7-linha q7-linha--ink" d={caminho(pts(L(atual)))} />
                {L(atual).map((v, k) => <circle key={k} cx={x(k)} cy={y(v)} r={d.fs * 0.32} fill="#00205B" stroke="#fff" strokeWidth={1.5} />)}
                {L(atual).map((v, k) => (k > 0 && k < M ? <text key={`r${k}`} className="q7-rot--peq" x={x(k)} y={y(v)} dx=".5em" dy={acima(k) ? "-.6em" : "1.3em"} textAnchor="start" style={{ fill: "#00205B", ...halo }}>{num(v, 3)}</text> : null))}
                {fins.map((q) => <text key={q.e} className={q.atual ? "q7-rot" : "q7-rot--peq"} x={x(M)} y={q.yy} dx=".6em" dy=".35em" style={{ fill: q.atual ? "#00205B" : "#5B6475", fontWeight: q.atual ? 700 : 600, ...halo }}>{q.atual ? "● " : q.e === 1 ? "■ " : q.e === TOP ? "○ " : ""}η = {num(q.e, 2)}: {num(L(q.e)[M], 3)}</text>)}
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
        <Previsao pergunta="No treino, que taxa faz a log loss descer mais rápido?" opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setEta(ETA0); }} recolher />
        {rev && <>
          <Controle rotulo="Taxa de aprendizagem η" valor={eta} min={0.05} max={1} passo={0.05} onChange={(v) => setEta(Math.round(v * 100) / 100)} mostrar={num(eta, 2)} />
          <dl className="q7-lista">
            <div><dt>η = 1, árvore 2: mínimo em</dt><dd>{num(MULT, 2)} × o passo</dd></div>
          </dl>
        </>}
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setEta(ETA0); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
