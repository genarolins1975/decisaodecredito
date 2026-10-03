"use client";
import { useState } from "react";
import { Grafico, Painel, Previsao, Quadro, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { Codigo } from "../pecas";
import { BASE, IRIS, VERSOES } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 35 · c12p35 · Na Iris, as medidas da pétala somam 86% da importância (título calculado no roteiro). Código da aula
 * (RandomForestClassifier de 500 árvores na Iris, feature_importances_) e barras horizontais das quatro importâncias,
 * na ordem das colunas da base (IRIS, base.json). Previsão antes das barras: quais medidas pesam mais? Enquanto a
 * previsão está aberta, o título vira pergunta e as barras ficam ocultas. Depois, a chave da pétala soma as duas
 * barras. Estado inicial: previsão em aberto; "Tentar outra" volta a ele.
 */
const COD = [
  "from sklearn.datasets import load_iris",
  "iris = load_iris()",
  "rnd_clf = RandomForestClassifier(",
  "    n_estimators=500, n_jobs=-1, random_state=42)",
  'rnd_clf.fit(iris["data"], iris["target"])',
  "rnd_clf.feature_importances_",
];
const IMP = IRIS.importancia, NOMES = IRIS.nomes;
const PETALA = [2, 3], SEPALA = [0, 1];
const soma = (ix: number[]) => ix.reduce((s, i) => s + IMP[i], 0);
const TOTAL = soma([0, 1, 2, 3]);
if (Math.abs(TOTAL - 1) > 1e-3) throw new Error("s35: as importâncias deveriam somar 100%");
if (!PETALA.every((i) => SEPALA.every((j) => IMP[i] > IMP[j]))) throw new Error("s35: as duas medidas da pétala deveriam pesar mais que as da sépala");
const OPS: Opcao[] = [
  { texto: "As da sépala: a sépala é a parte maior da flor", certa: false, retorno: <>Tamanho não é importância. As da sépala somam {pct(soma(SEPALA), 1)}: separam pouco as três espécies.</> },
  { texto: "As da pétala: comprimento e largura", certa: true, retorno: <>Isso: {pct(soma(PETALA), 1)} da importância. São as medidas que mais reduzem a impureza ao separar as espécies.</> },
  { texto: "As quatro pesam parecido, perto de 25% cada", certa: false, retorno: <>A floresta concentra: a maior pesa {pct(Math.max(...IMP), 1)} e a menor, {pct(Math.min(...IMP), 1)}.</> },
];

export function S35Importancia({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const rev = esc !== null;
  return (
    <Quadro slug="c12p35" pagina={pagina} layout="gg" titulo={rev ? undefined : "Na Iris, quais medidas pesam mais na floresta?"}
      conclusao={rev
        ? <>As medidas da pétala somam <b>{pct(soma(PETALA), 1)}</b> da importância; as {int(NOMES.length)} somam {pct(TOTAL, 0)}. Votação, bagging e floresta treinam em paralelo; o boosting combina árvores em sequência (slide {SLIDE.c12p36.n}).</>
        : <>{int(NOMES.length)} medidas de flores de três espécies. Antes de ver as barras: quais delas a floresta mais usa para separar as espécies?</>}
      fonte={`Iris (load_iris do scikit-learn): 150 flores, 3 espécies, 4 medidas em cm. RandomForestClassifier(n_estimators=500, n_jobs=-1, random_state=42); importância por redução média de impureza (Gini); ${VERSOES}, NumPy ${BASE.versoes.numpy}.`}>
      <Painel>
        <Grafico titulo="Importância das características" sub="redução média de impureza" arCelular="4 / 3"
          rotulo={rev ? `Importâncias: ${NOMES.map((n, i) => `${n}, ${pct(IMP[i], 1)}`).join("; ")}` : "Barras ocultas até a previsão"}
          tabela={rev ? <table><caption>Importância por característica</caption><thead><tr><th>Característica</th><th>Importância</th></tr></thead><tbody>{NOMES.map((n, i) => <tr key={n}><td>{n}</td><td>{pct(IMP[i], 1)}</td></tr>)}</tbody></table> : undefined}>
          {(d) => {
            const lw = d.fs * 11.5, rw = d.fs * 3.6, topo = d.fs * 0.6, base = d.h - d.fs * 2.2;
            const bh = (base - topo) / NOMES.length;
            const x = (v: number) => lw + v * (d.w - lw - rw) / 0.5;
            const yP = topo + PETALA[0] * bh + bh * 0.12, yP2 = topo + (PETALA[1] + 1) * bh - bh * 0.12;
            return (
              <g>
                <line x1={lw} x2={lw} y1={topo} y2={base} stroke="#9AA1AD" strokeWidth={1.5} />
                {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((v) => <g key={v}><line x1={x(v)} x2={x(v)} y1={topo} y2={base} className="q7-grade" /><text className="q7-tick" x={x(v)} y={base} dy="1.25em" textAnchor="middle">{pct(v, 0)}</text></g>)}
                {NOMES.map((n, i) => {
                  const cy = topo + i * bh + bh / 2, pet = PETALA.includes(i);
                  return (
                    <g key={n}>
                      <text className="q7-rot--peq" x={lw - d.fs * 0.5} y={cy} dy=".35em" textAnchor="end" style={{ fill: "#00205B", fontWeight: 600 }}>{n}</text>
                      {rev ? <>
                        <rect x={lw} y={cy - bh * 0.3} width={x(IMP[i]) - lw} height={bh * 0.6} fill={pet ? "#176C73" : "#9FCBCD"} />
                        <text className="q7-rot" x={x(IMP[i])} y={cy} dx=".4em" dy=".35em" style={{ fill: pet ? "#176C73" : "#2A3342" }}>{pct(IMP[i], 1)}</text>
                      </> : <>
                        <rect x={lw} y={cy - bh * 0.3} width={(d.w - lw - rw) * 0.5} height={bh * 0.6} fill="none" stroke="#B5BAC4" strokeDasharray="5 4" />
                        <text className="q7-rot--peq" x={lw + d.fs * 0.6} y={cy} dy=".35em" style={{ fill: "#5B6475" }}>?</text>
                      </>}
                    </g>
                  );
                })}
                {rev && <g>
                  <path d={`M${d.w - d.fs * 1.6} ${yP}h${d.fs * 0.5}V${yP2}h${-d.fs * 0.5}`} fill="none" stroke="#176C73" strokeWidth={2} />
                  <text className="q7-rot" x={d.w - d.fs * 0.35} y={(yP + yP2) / 2} textAnchor="middle" style={{ fill: "#176C73", fontSize: ".8em" }} transform={`rotate(-90 ${d.w - d.fs * 0.35} ${(yP + yP2) / 2})`}>pétala: {pct(soma(PETALA), 1)}</text>
                </g>}
                <text className="q7-eixo-t" x={(lw + d.w - rw) / 2} y={base} dy="2.5em" textAnchor="middle">Importância</text>
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <div className="q12-col">
        <Codigo linhas={COD} destaque={[5]} rotulo="Código: floresta de 500 árvores na Iris e importâncias" compacto />
        <Painel className="q12-s35-dir">
          <Previsao pergunta="Quais medidas pesam mais na floresta?" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
          {rev && <ul className="q12-b3-lista q12-b3-lista--peq">
            <li>Em crédito, é o primeiro diagnóstico de quais variáveis movem o score.</li>
            <li>Com variáveis contínuas e de muitos valores, a medida por impureza tende a inflar; confira com importância por permutação.</li>
          </ul>}
        </Painel>
      </div>
    </Quadro>
  );
}
