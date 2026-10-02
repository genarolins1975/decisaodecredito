"use client";
import { Grafico, LinkSlide, Quadro, escala, margens, type Pagina } from "@/components/capitulo7/base";
import { CURTO, PERGUNTAS, ROTEIRO } from "@/lib/capitulo6/roteiro";
import { DIDATICA, HP_CANDIDATO, NA, NV, RES } from "@/lib/capitulo6/dados";
import base from "@/lib/capitulo6/base.json";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 01 · c6p1 · Mapa e gancho. À esquerda, o gancho: o candidato do comitê (o boosting de sete variáveis que o capítulo 7
 * julga) e a logística do gerador, cada um com a AUC no treino e na validação temporal do gerador (760 propostas,
 * safras 2023-03 a 2023-07), lidos de RES em dados.ts. A logística perde menos, e a taxa de default sobe de uma amostra
 * para a outra: a decoreba explica só parte da queda do boosting. Abaixo, as três escalas do caso (16 propostas
 * didáticas; 2.103 do treino = 1.472 de ajuste + 631 de validação sorteada, que é parte do treino; o candidato), cada
 * uma com o link para o trecho que a usa. À direita, as quatro perguntas do capítulo (PERGUNTAS do roteiro) em lista,
 * com os slides de cada uma como links no mesmo modo (apresentação ou estudo). A janela fora do tempo fica fechada até o
 * capítulo 7. Slide de consulta: a navegação é a interação, sem estado para restaurar.
 */
type P = (typeof PERGUNTAS)[number]["id"];
const SIMB: Record<P, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
const MODELOS = [
  { nome: "Boosting, candidato do comitê", curto: ["Boosting", "candidato"], t: RES.gbm_treino.auc, v: RES.gbm_val.auc, cor: "#00205B" },
  { nome: "Logística do gerador", curto: ["Logística", "do gerador"], t: RES.logit_treino.auc, v: RES.logit_val.auc, cor: "#5B6475" },
];
const TREINO = RES.gbm_treino.auc, VAL = RES.gbm_val.auc;
const QUEDA_LOG = RES.logit_treino.auc - RES.logit_val.auc;
const TAXA_T = RES.gbm_treino.obs, TAXA_V = RES.gbm_val.obs;
const META = base.meta as { seed: number; n_treino: number; n_val: number; treino: string; validacao: string; features: string[] };
const NVARS = META.features.length;
const slides = (p: P) => ROTEIRO.filter((s) => s.pergunta === p);
// a soma das duas partes do sorteio é o treino inteiro do curso (confere a escala do meio contra a base)
if (NA + NV !== META.n_treino) throw new Error("ajuste + validação não somam o treino");
// a leitura diz que a logística cai menos que o boosting e que a taxa de default sobe: conferido aqui
if (!(QUEDA_LOG < TREINO - VAL && QUEDA_LOG > 0 && TAXA_V > TAXA_T)) throw new Error("a leitura do gancho não vale nos dados");

function Gancho() {
  return (
    <Grafico titulo="AUC no treino e na validação temporal do gerador" rotulo={`${MODELOS.map((q) => `${q.nome}: AUC ${num(q.t, 4)} no treino e ${num(q.v, 4)} na validação temporal, queda de ${num(q.t - q.v, 4)}`).join("; ")}. Taxa de default ${pct(TAXA_T, 1)} no treino e ${pct(TAXA_V, 1)} na validação`} arCelular="4 / 3">
      {(d) => {
        const estreito = d.w < d.fs * 30;
        const m = margens(d.fs, { l: estreito ? 6.2 : 8.4, r: 1.6, t: 0.4, b: estreito ? 7.8 : 5.4 });
        const x = escala([0.6, 0.85], [m.l + d.fs * 0.8, d.w - m.r]);
        const alto = d.h - m.t - m.b, yr = (i: number) => m.t + alto * (0.27 + i * 0.45);
        const r = d.fs * 0.5, base0 = d.h - m.b;
        const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
        return (
          <g>
            {[0.6, 0.7, 0.8].map((v) => <g key={v}><line className="q7-grade" x1={x(v)} x2={x(v)} y1={m.t} y2={base0} /><text className="q7-tick" x={x(v)} y={base0} dy="1.25em" textAnchor="middle">{num(v, 1)}</text></g>)}
            <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={base0} y2={base0} />
            <text className="q7-eixo-t" x={d.w - m.r} y={base0} dy="1.25em" textAnchor="end">AUC</text>
            {MODELOS.map((q, i) => {
              const cy = yr(i), forte = i === 0;
              return (
                <g key={q.nome}>
                  <text className="q7-rot" x={m.l} y={cy} dy="-.25em" textAnchor="end" style={{ fill: q.cor, fontWeight: 700 }}>{q.curto[0]}</text>
                  <text className="q7-rot--peq" x={m.l} y={cy} dy="1em" textAnchor="end" style={{ fill: q.cor }}>{q.curto[1]}</text>
                  <line x1={x(q.t) - r * 1.2} x2={x(q.v) + r * 2.2} y1={cy} y2={cy} stroke={q.cor} strokeWidth={forte ? d.fs * 0.2 : d.fs * 0.13} />
                  <path d={`M${x(q.v) + r * 1.2} ${cy}l${r * 1.3} ${-r * 0.75}v${r * 1.5}Z`} fill={q.cor} />
                  <circle cx={x(q.t)} cy={cy} r={r} fill="#3D5A8A" stroke="#fff" strokeWidth={2} />
                  <rect x={x(q.v) - r} y={cy - r} width={2 * r} height={2 * r} fill="#fff" stroke="#2E6B4F" strokeWidth={3} />
                  <text className="q7-rot" x={x(q.t) - r} y={cy} dy="-.95em" textAnchor="start" style={{ fill: "#3D5A8A", ...halo }}>{num(q.t, 4)}</text>
                  <text className="q7-rot" x={x(q.v) + r} y={cy} dy="-.95em" textAnchor="end" style={{ fill: "#2E6B4F", ...halo }}>{num(q.v, 4)}</text>
                  <text className="q7-rot" x={(x(q.t) + x(q.v)) / 2} y={cy} dy={forte ? "-.7em" : "1.6em"} textAnchor="middle" style={{ fill: q.cor, fontSize: forte ? "1.25em" : "1.05em", ...halo }}>−{num(q.t - q.v, 4)}</text>
                </g>
              );
            })}
            {[
              { c: "#3D5A8A", t: `● treino: ${int(META.n_treino)} propostas`, s: `${META.treino}, default ${pct(TAXA_T, 1)}` },
              { c: "#2E6B4F", t: `□ validação temporal: ${int(META.n_val)}`, s: `${META.validacao}, default ${pct(TAXA_V, 1)}` },
            ].map((l, i) => (
              <text key={i} className="q7-rot--peq" x={d.fs * 0.2} y={base0} dy={`${estreito ? 3.1 + i * 2.5 : 3.3 + i * 1.3}em`} style={{ fill: l.c, fontWeight: 700 }}>
                {estreito ? <>{l.t}<tspan x={d.fs * 1.1} dy="1.2em" style={{ fontWeight: 500 }}>{l.s}</tspan></> : `${l.t}, ${l.s}`}
              </text>
            ))}
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
  { slug: "c6p2", n: int(DIDATICA.length), o: "propostas à mão", ate: "slides 2 a 10" },
  { slug: "c6p11", n: int(NA + NV), o: `${int(NA)} ajuste + ${int(NV)} validação sorteada`, ate: "slides 11 a 20" },
  { slug: "c6p21", n: String(NVARS), o: "variáveis no candidato", ate: "slide 21" },
];

export function S01Mapa({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p1" pagina={pagina} layout="um"
      conclusao={<>O candidato cai de <b>{num(TREINO, 4)}</b> no treino para <b>{num(VAL, 4)}</b> na validação temporal do gerador. A decoreba explica só parte: a taxa de default sobe de {pct(TAXA_T, 1)} para {pct(TAXA_V, 1)} e a logística também perde <b>{num(QUEDA_LOG, 3)}</b>. O mecanismo: <LinkSlide slug="c6p2">slide 2</LinkSlide>.</>}
      fonte={`Base sintética (semente ${META.seed}). Candidato: ${HP_CANDIDATO.max_iter} árvores de até ${HP_CANDIDATO.max_leaf_nodes} folhas, taxa ${num(HP_CANDIDATO.learning_rate, 2)}. A validação sorteada é parte do treino. Tracejado: aprofundamento.`}>
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
