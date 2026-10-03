"use client";
import { Grafico, LinkSlide, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { ACERTOS_LUAS, BOOST, FONTE_LUAS, IRIS, LUAS, N_TESTE_LUAS, type ModeloLua } from "@/lib/capitulo12/dados";
import { UM_ACERTO } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 38 · c12p38 · Síntese: quatro formas de produzir diversidade. Tabela da aula (método, fonte de diversidade, treino,
 * combinação e o resultado no exemplo), com cada método ligado ao slide em que começa; os números saem de LUAS.modelos,
 * IRIS e BOOST.mse (base.json). Embaixo, os acertos no teste das luas de todos os modelos do bloco num só eixo, para
 * ver que os ensembles ganham da árvore única por poucos acertos. Slide de consulta: a navegação é a interação; não há
 * estado a restaurar.
 */
const M = LUAS.modelos;
const PETALA = IRIS.importancia[2] + IRIS.importancia[3];
const LINHAS = [
  { nome: "Votação", slide: "c12p23", fonte: "Algoritmos diferentes", treino: "Paralelo", comb: "Maioria ou média das probabilidades", ex: `${num(M.hard.acc, 3)} (hard) e ${num(M.soft.acc, 3)} (soft)` },
  { nome: "Bagging", slide: "c12p29", fonte: "Amostras diferentes", treino: "Paralelo", comb: "Maioria", ex: `${num(M.bag500.acc, 3)}, contra ${num(M.arvore.acc, 3)} da árvore única` },
  { nome: "Floresta aleatória", slide: "c12p34", fonte: "Amostras e características", treino: "Paralelo", comb: "Maioria", ex: `${num(M.rf500.acc, 3)} nas luas; na Iris, pétala com ${pct(PETALA, 0)} da importância` },
  { nome: "Boosting", slide: "c12p36", fonte: "Correção sequencial dos erros", treino: "Sequencial", comb: "Soma das etapas", ex: `Regressão em três etapas: erro de ${num(BOOST.mse[0], 3)} a ${num(BOOST.mse[3], 3)}` },
];
const PONTOS: { k: ModeloLua; r: string; ens: boolean }[] = [
  { k: "arvore", r: "árvore", ens: false }, { k: "lr", r: "logística", ens: false }, { k: "rf10", r: "floresta 10", ens: true }, { k: "svc", r: "SVC", ens: false },
  { k: "hard", r: "hard", ens: true }, { k: "bag500", r: "bagging", ens: true }, { k: "soft", r: "soft", ens: true }, { k: "rf500", r: "floresta 500", ens: true },
];
const ENS = PONTOS.filter((p) => p.ens && p.k !== "rf10").map((p) => ACERTOS_LUAS[p.k]);
const MIN_E = Math.min(...ENS), MAX_E = Math.max(...ENS);
const VALS = PONTOS.map((p) => ACERTOS_LUAS[p.k]);
const LO = Math.min(...VALS) - 1, HI = Math.max(...VALS) + 1;
const GRUPOS = [...new Set(VALS)].sort((a, b) => a - b).map((v) => ({ v, ps: PONTOS.filter((p) => ACERTOS_LUAS[p.k] === v) }));
if (MIN_E <= ACERTOS_LUAS.arvore) throw new Error("s38: todo ensemble grande deveria superar a árvore única");

export function S38SinteseEnsembles({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p38" pagina={pagina} layout="um"
      conclusao={<>Nas luas, o voto, o bagging e a floresta de 500 árvores acertam de {int(MIN_E)} a <b>{int(MAX_E)} de {int(N_TESTE_LUAS)}</b>, contra {int(ACERTOS_LUAS.arvore)} da árvore única: a diversidade ajuda, por margens de poucos acertos. Próxima pergunta: como esses modelos viram decisão em uma carteira de crédito? <LinkSlide slug="c12p39" className="q12-b3-link">Slide {SLIDE.c12p39.n}</LinkSlide>.</>}
      fonte={`${FONTE_LUAS}. Iris: RandomForestClassifier(n_estimators=500, random_state=42). Boosting: ${int(BOOST.x.length)} pontos, três árvores de profundidade 2, erro quadrático médio de treino.`}>
      <div className="q12-s38">
        <Painel className="q12-s38-tab">
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">Método</th><th className="q7-t-l">Fonte de diversidade</th><th className="q7-t-l">Treino</th><th className="q7-t-l">Combinação</th><th className="q7-t-l">No exemplo da aula</th></tr></thead>
            <tbody>
              {LINHAS.map((l) => (
                <tr key={l.nome} data-seq={l.treino === "Sequencial" ? "1" : undefined}>
                  <th><LinkSlide slug={l.slide} className="q12-s38-link" rotulo={`${l.nome}, slide ${SLIDE[l.slide].n}`}>{l.nome} <small>slide {SLIDE[l.slide].n} →</small></LinkSlide></th>
                  <td className="q7-t-l">{l.fonte}</td>
                  <td className="q7-t-l"><span className="q12-s38-t">{l.treino}</span></td>
                  <td className="q7-t-l">{l.comb}</td>
                  <td className="q7-t-l">{l.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Painel>
        <Painel className="q12-s38-g">
          <Grafico titulo={`Acertos no teste das luas, de ${int(N_TESTE_LUAS)}`} sub={`cada acerto vale ${num(UM_ACERTO * 100, 1)} ponto; ■ ensemble, ○ modelo isolado`} arCelular="16 / 7"
            rotulo={`Acertos no teste: ${PONTOS.map((p) => `${p.r} ${int(ACERTOS_LUAS[p.k])}`).join("; ")}`}>
            {(d) => {
              const l = d.fs * 1.5, r = d.fs * 1.5, base = d.h - d.fs * 1.8;
              const x = (v: number) => l + ((v - LO) / (HI - LO)) * (d.w - l - r);
              return (
                <g>
                  <line x1={l} x2={d.w - r} y1={base} y2={base} className="q7-eixo" />
                  {Array.from({ length: HI - LO + 1 }, (_, i) => LO + i).map((v) => <g key={v}><line x1={x(v)} x2={x(v)} y1={base} y2={base + d.fs * 0.3} className="q7-eixo" /><text className="q7-tick" x={x(v)} y={base} dy="1.3em" textAnchor="middle">{int(v)}</text></g>)}
                  {GRUPOS.map((g) => (
                    <g key={g.v}>
                      {g.ps.map((p, j) => {
                        const cy = base - d.fs * (0.8 + j * 1.25), s = d.fs * 0.36;
                        return (
                          <g key={p.k}>
                            {p.ens ? <rect x={x(g.v) - s} y={cy - s} width={2 * s} height={2 * s} fill="#176C73" /> : <circle cx={x(g.v)} cy={cy} r={s} fill="#fff" stroke="#3D5A8A" strokeWidth={2} />}
                            <text className="q7-rot--peq" x={x(g.v) + s * 1.6} y={cy} dy=".35em" style={{ fill: p.ens ? "#176C73" : "#3D5A8A", fontWeight: 600 }}>{p.r}</text>
                          </g>
                        );
                      })}
                    </g>
                  ))}
                </g>
              );
            }}
          </Grafico>
        </Painel>
      </div>
    </Quadro>
  );
}
