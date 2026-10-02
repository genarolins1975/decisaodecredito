"use client";
import { Grafico, LinkSlide, Quadro, escala, margens, type Pagina } from "@/components/capitulo7/base";
import { CURTO, PERGUNTAS, ROTEIRO } from "@/lib/capitulo6/roteiro";
import { DIDATICA, HP_CANDIDATO, NA, NV, RES } from "@/lib/capitulo6/dados";
import base from "@/lib/capitulo6/base.json";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 01 · c6p1 · Mapa e gancho. À esquerda, o gancho: o candidato do comitê (o boosting de sete variáveis que o capítulo 7
 * julga) ordena o treino com AUC 0,8196 e a validação com 0,6476, lidos de RES em dados.ts; ao lado, as três escalas do
 * caso (16 propostas didáticas, 2.103 do treino = 1.472 de ajuste + 631 de validação, o candidato), cada uma com o
 * link para o trecho que a usa. À direita, as quatro perguntas do capítulo (PERGUNTAS do roteiro) com os slides de cada
 * uma como links no mesmo modo (apresentação ou estudo). A janela fora do tempo fica fechada até o capítulo 7: nenhum
 * número dela aparece aqui. Slide de consulta: a navegação é a interação, sem estado para restaurar.
 */
type P = (typeof PERGUNTAS)[number]["id"];
const SIMB: Record<P, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
const TREINO = RES.gbm_treino.auc, VAL = RES.gbm_val.auc;
const META = base.meta as { n_treino: number; n_val: number; treino: string; validacao: string; features: string[] };
const NVARS = META.features.length;
const slides = (p: P) => ROTEIRO.filter((s) => s.pergunta === p);
// a soma das duas partes do sorteio é o treino inteiro do curso (confere a escala do meio contra a base)
if (NA + NV !== META.n_treino) throw new Error("ajuste + validação não somam o treino");

function Gancho() {
  return (
    <Grafico titulo="AUC do candidato do comitê" rotulo={`Candidato do comitê: AUC ${num(TREINO, 4)} no treino e ${num(VAL, 4)} na validação, queda de ${num(TREINO - VAL, 4)}; 0,5 é o acaso`} arCelular="4 / 3">
      {(d) => {
        const m = margens(d.fs, { l: 2.6, r: 1, t: 1.2, b: 3.2 });
        const y = escala([0.5, 0.9], [d.h - m.b, m.t]);
        const xa = m.l + (d.w - m.l - m.r) * 0.2, xb = m.l + (d.w - m.l - m.r) * 0.8, r = d.fs * 0.55;
        const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
        return (
          <g>
            {[0.5, 0.6, 0.7, 0.8, 0.9].map((v) => <g key={v}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(v)} dy=".34em" textAnchor="end">{num(v, 1)}</text></g>)}
            <text className="q7-rot--peq" x={d.w - m.r} y={y(0.5)} dy="-.45em" textAnchor="end" style={{ fill: "#5B6475" }}>0,5: acaso</text>
            <line x1={xa} x2={xb} y1={y(TREINO)} y2={y(VAL)} stroke="#00205B" strokeWidth={d.fs * 0.18} />
            <circle cx={xa} cy={y(TREINO)} r={r} fill="#3D5A8A" stroke="#fff" strokeWidth={2} />
            <rect x={xb - r} y={y(VAL) - r} width={2 * r} height={2 * r} fill="#fff" stroke="#2E6B4F" strokeWidth={3} />
            <text className="q7-rot" x={xa} y={y(TREINO)} dy="-1em" textAnchor="middle" style={{ fill: "#3D5A8A", ...halo }}>{num(TREINO, 4)}</text>
            <text className="q7-rot" x={xb} y={y(VAL)} dy="-1em" textAnchor="middle" style={{ fill: "#2E6B4F", ...halo }}>{num(VAL, 4)}</text>
            <text className="q7-rot" x={(xa + xb) / 2} y={(y(TREINO) + y(VAL)) / 2} dy="1.9em" textAnchor="middle" style={{ fill: "#00205B", fontSize: "1.3em", ...halo }}>−{num(TREINO - VAL, 4)}</text>
            <text className="q7-eixo-t" x={xa} y={d.h - m.b} dy="1.4em" textAnchor="middle">● treino</text>
            <text className="q7-tick" x={xa} y={d.h - m.b} dy="2.7em" textAnchor="middle">{int(META.n_treino)} propostas</text>
            <text className="q7-eixo-t" x={xb} y={d.h - m.b} dy="1.4em" textAnchor="middle" style={{ fill: "#2E6B4F" }}>□ validação</text>
            <text className="q7-tick" x={xb} y={d.h - m.b} dy="2.7em" textAnchor="middle">{int(META.n_val)} propostas</text>
          </g>
        );
      }}
    </Grafico>
  );
}

function Cartao({ p }: { p: P }) {
  const q = PERGUNTAS.find((x) => x.id === p)!;
  return (
    <section className="q7-s01-c q6-s01-c" data-p={p} aria-labelledby={`q6-s01-${p}`}>
      <h3 id={`q6-s01-${p}`}><span aria-hidden="true">{SIMB[p]}</span>{q.nome}</h3>
      <p className="q7-s01-f">{q.frase}</p>
      <ul className="q7-s01-l">{slides(p).map((s) => <li key={s.slug}><LinkSlide slug={s.slug} className={`q7-s01-k${s.nivel === "aprofundamento" ? " q7-s01-k--ap" : ""}`} rotulo={`Slide ${s.n}${s.nivel === "aprofundamento" ? ", aprofundamento" : ""}: ${s.titulo}`}><b>{s.n}</b>{s.nivel === "aprofundamento" ? null : CURTO[s.slug]}</LinkSlide></li>)}</ul>
    </section>
  );
}

const ESCALAS = [
  { slug: "c6p2", n: int(DIDATICA.length), o: "propostas didáticas, à mão", ate: "slides 2 a 10" },
  { slug: "c6p11", n: int(NA + NV), o: `${int(NA)} ajuste + ${int(NV)} validação`, ate: "slides 11 a 20" },
  { slug: "c6p21", n: String(NVARS), o: "variáveis no candidato", ate: "slide 21" },
];

export function S01Mapa({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p1" pagina={pagina} layout="um"
      conclusao={<>O candidato ordena o treino com AUC <b>{num(TREINO, 4)}</b> e a validação com <b>{num(VAL, 4)}</b>: parte do que aprendeu não vale fora do treino. O algoritmo, montado à mão, começa no <LinkSlide slug="c6p2">slide 2</LinkSlide>.</>}
      fonte={`Base sintética do curso (semente 20260501). Candidato: ${HP_CANDIDATO.max_iter} árvores de até ${HP_CANDIDATO.max_leaf_nodes} folhas, taxa ${num(HP_CANDIDATO.learning_rate, 2)}; treino de ${int(META.n_treino)} propostas (${META.treino}); validação de ${int(META.n_val)} (${META.validacao}). Tracejado: aprofundamento.`}>
      <div className="q6-s01">
        <div className="q6-s01-esq">
          <div className="q6-s01-g"><Gancho /></div>
          <p className="q7-k">Três escalas do caso</p>
          <ol className="q6-s01-esc" aria-label="Três escalas do caso">
            {ESCALAS.map((e, i) => (
              <li key={e.slug}>
                {i > 0 && <span className="q6-s01-seta" aria-hidden="true">→</span>}
                <LinkSlide slug={e.slug} className="q6-s01-e" rotulo={`${e.n} ${e.o}: ${e.ate}`}><b>{e.n}</b><span>{e.o}</span><small>{e.ate}</small></LinkSlide>
              </li>
            ))}
          </ol>
        </div>
        <div className="q6-s01-cartoes">
          {PERGUNTAS.map((q) => <Cartao key={q.id} p={q.id} />)}
        </div>
      </div>
    </Quadro>
  );
}
