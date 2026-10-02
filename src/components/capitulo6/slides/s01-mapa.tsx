"use client";
import { Grafico, LinkSlide, Quadro, escala, margens, type Pagina } from "@/components/capitulo7/base";
import { CURTO, PERGUNTAS, ROTEIRO } from "@/lib/capitulo6/roteiro";
import { DIDATICA, HP_CANDIDATO, NA, NV, RES } from "@/lib/capitulo6/dados";
import base from "@/lib/capitulo6/base.json";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 01 · c6p1 · Mapa e gancho. A peça principal é o gancho: o candidato do comitê (o boosting de sete variáveis que o
 * capítulo 7 julga) e a logística do gerador (as mesmas sete variáveis), cada um com a AUC no treino e na validação
 * temporal do gerador (760 propostas, safras 2023-03 a 2023-07), lidos de RES em dados.ts. A queda da logística, que
 * decora pouco, estima o que a troca de safra custa; sob a seta do boosting, a queda dele se divide nessa parte e no
 * excesso. A divisão é condicional (AUCs de modelos diferentes não se somam, e um modelo com interações pode sofrer mais
 * com a troca de safra): a leitura diz "se a safra custa ao boosting o mesmo que à logística". A AUC
 * de validação do candidato é a mesma usada para escolher os hiperparâmetros (meta.gbm_hp.auc_val, conferido abaixo),
 * então é otimista. Todas as AUCs e quedas com três casas, como no título do roteiro. À direita, compactos: as três
 * escalas do caso e as quatro perguntas (PERGUNTAS do roteiro), com os slides de cada uma como links no mesmo modo
 * (apresentação ou estudo). A janela fora do tempo fica fechada até o capítulo 7. Slide de consulta: a navegação é a
 * interação, sem estado para restaurar.
 */
type P = (typeof PERGUNTAS)[number]["id"];
const SIMB: Record<P, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
const CASAS = 3; // a mesma casa decimal em toda a tela e no título (roteiro)
const MODELOS = [
  { nome: "Boosting, candidato do comitê", curto: ["Boosting", "candidato"], t: RES.gbm_treino.auc, v: RES.gbm_val.auc, cor: "#00205B" },
  { nome: "Logística do gerador", curto: ["Logística", "do gerador"], t: RES.logit_treino.auc, v: RES.logit_val.auc, cor: "#5B6475" },
];
const TREINO = RES.gbm_treino.auc, VAL = RES.gbm_val.auc;
const QUEDA = TREINO - VAL, QUEDA_LOG = RES.logit_treino.auc - RES.logit_val.auc, EXCESSO = QUEDA - QUEDA_LOG;
const FRACAO = QUEDA_LOG / QUEDA; // parte da queda do boosting que a logística também sofre
const META = base.meta as { seed: number; n_treino: number; n_val: number; treino: string; validacao: string; features: string[] };
const NVARS = META.features.length;
const slides = (p: P) => ROTEIRO.filter((s) => s.pergunta === p);
// a soma das duas partes do sorteio é o treino inteiro do curso (confere a escala do meio contra a base)
if (NA + NV !== META.n_treino) throw new Error("ajuste + validação não somam o treino");
// a leitura diz que a logística cai menos que o boosting e que a AUC de validação do candidato é a da escolha dos hiperparâmetros
if (!(QUEDA_LOG > 0 && QUEDA_LOG < QUEDA && HP_CANDIDATO.auc_val === VAL)) throw new Error("a leitura do gancho não vale nos dados");
// com três casas, as quedas exibidas fecham com os pontos exibidos (0,820 − 0,648 = 0,172)
for (const q of MODELOS) if (num(Math.round(q.t * 1000) / 1000 - Math.round(q.v * 1000) / 1000, CASAS) !== num(q.t - q.v, CASAS)) throw new Error("arredondamento das quedas não fecha");

function Gancho() {
  return (
    <Grafico titulo="AUC no treino e na validação temporal do gerador" rotulo={`${MODELOS.map((q) => `${q.nome}: AUC ${num(q.t, CASAS)} no treino e ${num(q.v, CASAS)} na validação temporal, queda de ${num(q.t - q.v, CASAS)}`).join("; ")}. Se a troca de safra custa ao boosting o mesmo que à logística (${num(QUEDA_LOG, CASAS)}), ${num(EXCESSO, CASAS)} da queda do boosting é excesso, uma estimativa`} arCelular="4 / 3">
      {(d) => {
        const estreito = d.w < d.fs * 30;
        const m = margens(d.fs, { l: estreito ? 6.2 : 8.4, r: 1.6, t: 0.6, b: estreito ? 7.4 : 5 });
        const x = escala([0.6, 0.85], [m.l + d.fs * 0.8, d.w - m.r]);
        const alto = d.h - m.t - m.b, yr = [m.t + Math.max(d.fs * 2.6, alto * 0.24), m.t + alto * 0.8];
        const r = d.fs * 0.55, base0 = d.h - m.b;
        const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
        // divisão da queda do boosting: a parte que a logística também perde e o excesso
        const yb = yr[0] + d.fs * 1.5, xs = [x(TREINO), x(TREINO - QUEDA_LOG), x(VAL)];
        const chave = (x1: number, x2: number, cor: string, txt: string, sub: string) => (
          <g>
            <path d={`M${x1} ${yb - d.fs * 0.35}V${yb}H${x2}V${yb - d.fs * 0.35}`} fill="none" stroke={cor} strokeWidth={2} />
            <text className="q7-rot--peq" x={(x1 + x2) / 2} y={yb} dy="1.25em" textAnchor="middle" style={{ fill: cor, fontWeight: 700 }}>{txt}</text>
            <text className="q7-rot--peq" x={(x1 + x2) / 2} y={yb} dy="2.45em" textAnchor="middle" style={{ fill: cor }}>{sub}</text>
          </g>
        );
        return (
          <g>
            {[0.6, 0.65, 0.7, 0.75, 0.8, 0.85].map((v) => <g key={v}><line className="q7-grade" x1={x(v)} x2={x(v)} y1={m.t} y2={base0} /><text className="q7-tick" x={x(v)} y={base0} dy="1.25em" textAnchor="middle">{num(v, 2)}</text></g>)}
            <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={base0} y2={base0} />
            <text className="q7-eixo-t" x={d.w - m.r} y={base0} dy="2.6em" textAnchor="end">AUC</text>
            {MODELOS.map((q, i) => {
              const cy = yr[i], forte = i === 0;
              return (
                <g key={q.nome}>
                  <text className="q7-rot" x={m.l} y={cy} dy="-.25em" textAnchor="end" style={{ fill: q.cor, fontWeight: 700 }}>{q.curto[0]}</text>
                  <text className="q7-rot--peq" x={m.l} y={cy} dy="1em" textAnchor="end" style={{ fill: q.cor }}>{q.curto[1]}</text>
                  <line x1={x(q.t) - r * 1.2} x2={x(q.v) + r * 2.2} y1={cy} y2={cy} stroke={q.cor} strokeWidth={forte ? d.fs * 0.22 : d.fs * 0.15} />
                  <path d={`M${x(q.v) + r * 1.2} ${cy}l${r * 1.3} ${-r * 0.75}v${r * 1.5}Z`} fill={q.cor} />
                  <circle cx={x(q.t)} cy={cy} r={r} fill="#3D5A8A" stroke="#fff" strokeWidth={2} />
                  <rect x={x(q.v) - r} y={cy - r} width={2 * r} height={2 * r} fill="#fff" stroke="#2E6B4F" strokeWidth={3} />
                  <text className="q7-rot" x={x(q.t) - r} y={cy} dy="-.95em" textAnchor="start" style={{ fill: "#3D5A8A", ...halo }}>{num(q.t, CASAS)}</text>
                  <text className="q7-rot" x={x(q.v) + r} y={cy} dy="-.95em" textAnchor="end" style={{ fill: "#2E6B4F", ...halo }}>{num(q.v, CASAS)}</text>
                  <text className="q7-rot" x={(x(q.t) + x(q.v)) / 2} y={cy} dy={forte ? "-.75em" : "-.85em"} textAnchor="middle" style={{ fill: q.cor, fontSize: forte ? "1.3em" : "1.1em", fontWeight: 700, ...halo }}>−{num(q.t - q.v, CASAS)}</text>
                </g>
              );
            })}
            {chave(xs[0], xs[1], "#5B6475", `−${num(QUEDA_LOG, CASAS)}`, "como a logística")}
            {chave(xs[1], xs[2], "#00205B", `−${num(EXCESSO, CASAS)}`, "excesso estimado")}
            {[
              { c: "#3D5A8A", t: `● treino: ${int(META.n_treino)} propostas`, s: META.treino },
              { c: "#2E6B4F", t: `□ validação temporal: ${int(META.n_val)} propostas`, s: META.validacao },
            ].map((l, i) => (
              <text key={i} className="q7-rot--peq" x={d.fs * 0.2} y={base0} dy={`${estreito ? 3.1 + i * 2.5 : 2.8 + i * 1.3}em`} style={{ fill: l.c, fontWeight: 700 }}>
                {estreito ? <>{l.t}<tspan x={d.fs * 1.1} dy="1.2em" style={{ fontWeight: 500 }}>{l.s}</tspan></> : `${l.t}, safras ${l.s.replace(/^safras /, "")}`}
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
    <section className="q6-s01-c" data-p={p} aria-labelledby={`q6-s01-${p}`}>
      <h3 id={`q6-s01-${p}`}><span aria-hidden="true">{SIMB[p]}</span>{q.nome}</h3>
      <ul className="q6-s01-l">{slides(p).map((s) => <li key={s.slug}><LinkSlide slug={s.slug} className={`q6-s01-k${s.nivel === "aprofundamento" ? " q6-s01-k--ap" : ""}`} rotulo={`Slide ${s.n}${s.nivel === "aprofundamento" ? ", aprofundamento" : ""}: ${s.titulo}`}>{s.n}</LinkSlide></li>)}</ul>
      <p className="q6-s01-f">{q.frase}</p>
    </section>
  );
}

const ESCALAS = [
  { slug: "c6p2", n: int(DIDATICA.length), o: "propostas à mão", ate: "slides 2 a 10" },
  { slug: "c6p11", n: int(NA + NV), o: `${int(NA)} ajuste + ${int(NV)} validação`, ate: "slides 11 a 20" },
  { slug: "c6p21", n: String(NVARS), o: "variáveis no candidato", ate: "slide 21" },
];

export function S01Mapa({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p1" pagina={pagina} layout="um"
      conclusao={<>O candidato cai <b>{num(QUEDA, CASAS)}</b>; a logística, que decora pouco, <b>{num(QUEDA_LOG, CASAS)}</b> ({pct(FRACAO, 0)} disso). Se a troca de safra custa ao boosting o mesmo que à logística, cerca de <b>{num(EXCESSO, CASAS)}</b> é excesso do boosting: estimativa, não medida. E {num(VAL, CASAS)} é otimista: é a AUC que escolheu os hiperparâmetros (<LinkSlide slug="c6p21">slide 21</LinkSlide>). Mecanismo: <LinkSlide slug="c6p2">slide 2</LinkSlide>.</>}
      fonte={`Base sintética (semente ${META.seed}). Candidato: ${HP_CANDIDATO.max_iter} árvores de até ${HP_CANDIDATO.max_leaf_nodes} folhas, taxa ${num(HP_CANDIDATO.learning_rate, 2)}, mínimo de ${HP_CANDIDATO.min_samples_leaf} propostas por folha, regularização l2 = ${num(HP_CANDIDATO.l2_regularization, 0)}, escolhido pela AUC na validação temporal. Logística do gerador: as mesmas ${NVARS} variáveis, sem interações. Número tracejado: aprofundamento.`}>
      <div className="q6-s01">
        <div className="q6-s01-g"><Gancho /></div>
        <div className="q6-s01-dir">
          <p className="q7-k">Três escalas do caso</p>
          <ol className="q6-s01-esc" aria-label="Três escalas do caso">
            {ESCALAS.map((e) => (
              <li key={e.slug}>
                <LinkSlide slug={e.slug} className="q6-s01-e" rotulo={`${e.n} ${e.o}: ${e.ate}`}><b>{e.n}</b><span>{e.o}</span><small>{e.ate}</small></LinkSlide>
              </li>
            ))}
          </ol>
          <p className="q7-k">Quatro perguntas</p>
          <div className="q6-s01-cartoes">
            {PERGUNTAS.map((q) => <Cartao key={q.id} p={q.id} />)}
          </div>
        </div>
      </div>
    </Quadro>
  );
}
