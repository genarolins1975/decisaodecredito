"use client";
import { useState } from "react";
import { Botao, Controle, Kpi, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Figura } from "../pecas";
import { LUAS } from "@/lib/capitulo12/dados";
import { foraDaAmostra } from "@/lib/capitulo12/metricas";
import { amostraPreditor } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 29 · c12p29 · Bagging: o mesmo algoritmo em amostras diferentes. Figura original (Géron, cap. 7) e os pontos da aula
 * à direita. À esquerda, a amostra de um preditor entre as 20 primeiras instâncias de treino das luas: quantas vezes
 * cada uma saiu e quais ficaram de fora. Bagging sorteia com reposição, pasting sem; o controle muda o número de
 * sorteios (até 20, o tamanho do conjunto). Sorteio com semente (mulberry32): a primeira amostra usa a semente 1 e cada
 * "Sortear outra" passa à seguinte (2, 3, …). A fração esperada de fora no bagging, (1 − 1/20)^20, vem de foraDaAmostra
 * e liga ao slide 32. Estado inicial: bagging, 20 sorteios, semente 1; "Restaurar" volta a ele.
 */
const M = 20;
const CLASSE = LUAS.treino.y.slice(0, M);
type Modo = "bagging" | "pasting";

export function S29Bagging({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("bagging");
  const [k, setK] = useState(M);
  const [semente, setSemente] = useState(1);
  const c = amostraPreditor(M, k, semente, modo === "bagging");
  const fora = c.filter((v) => v === 0).length, repetidas = c.filter((v) => v > 1).length;
  const esperadoFora = modo === "bagging" ? Math.pow(1 - 1 / M, k) : (M - k) / M;
  const inicial = modo === "bagging" && k === M && semente === 1;
  return (
    <Quadro slug="c12p29" pagina={pagina} layout="gl"
      conclusao={modo === "pasting" && k === M
        ? <>Sem reposição, {int(M)} sorteios em {int(M)} instâncias pegam o conjunto inteiro: todo preditor veria os mesmos dados. O pasting precisa de amostras menores.</>
        : <>Nesta amostra, <b>{int(fora)} das {int(M)} instâncias ficaram de fora</b> ({pct(fora / M, 0)}){modo === "bagging" ? <> e {int(repetidas)} saíram mais de uma vez; em média ficam de fora {pct(esperadoFora, 1)} (slide {SLIDE.c12p32.n}), e são elas que validam o preditor (slide {SLIDE.c12p33.n})</> : <>; sem reposição, nenhuma se repete</>}.</>}
      fonte={`Instâncias: as ${int(M)} primeiras do treino das luas (make_moons, random_state=42). Sorteio com mulberry32, sementes 1, 2, 3, … na ordem dos cliques; esperado de fora no bagging: (1 − 1/${int(M)})^${int(k)}.`}>
      <Painel className="q12-s29-esq">
        <div className="q12-s29-cab">
          <p className="q7-k">Amostra de um preditor · semente {int(semente)}</p>
          <Seg rotulo="Tipo de sorteio" opcoes={[{ v: "bagging" as Modo, r: "Bagging: com reposição" }, { v: "pasting" as Modo, r: "Pasting: sem reposição" }]} valor={modo} onChange={setModo} />
        </div>
        <ol className="q12-s29-inst" aria-label={`Vezes que cada uma das ${M} instâncias saiu na amostra`}>
          {c.map((v, i) => (
            <li key={i} data-fora={v === 0 ? "1" : undefined} data-rep={v > 1 ? "1" : undefined} aria-label={`Instância ${i + 1}, classe ${CLASSE[i]}: ${v === 0 ? "ficou de fora" : `saiu ${v} ${v === 1 ? "vez" : "vezes"}`}`}>
              <span className="q12-s29-id"><i data-c={CLASSE[i]} aria-hidden="true">{CLASSE[i] ? "▲" : "●"}</i>{int(i + 1)}</span>
              <span className="q12-s29-v">{v === 0 ? "fora" : `×${int(v)}`}</span>
              <span className="q12-s29-pts" aria-hidden="true">{Array.from({ length: v }, (_, j) => <b key={j} />)}</span>
            </li>
          ))}
        </ol>
        <div className="q12-s29-rod">
          <Controle rotulo="Sorteios por preditor" valor={k} min={5} max={M} passo={1} onChange={setK} mostrar={`${int(k)} de ${int(M)}`} />
          <div className="q7-kpis q12-s29-kpis">
            <Kpi tam="mini" rotulo="De fora" valor={`${int(fora)} de ${int(M)}`} detalhe={`esperado: ${pct(esperadoFora, 1)}`} />
            <Kpi tam="mini" rotulo="Repetidas" valor={int(repetidas)} detalhe={modo === "bagging" ? "saíram mais de uma vez" : "sem reposição: nenhuma"} />
          </div>
          <div className="q7-botoes">
            <Botao prim onClick={() => setSemente((s) => s + 1)}>Sortear outra</Botao>
            <Botao sec onClick={() => { setModo("bagging"); setK(M); setSemente(1); }} desab={inicial}>Restaurar</Botao>
          </div>
        </div>
      </Painel>
      <Painel className="q12-s29-dir">
        <Figura src="bagging" alt="Do conjunto de treino saem quatro amostras sorteadas com reposição (bootstrap); cada amostra treina um preditor do mesmo tipo." credito="Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7" />
        <ul className="q12-b3-lista q12-b3-lista--peq">
          <li><b>Bagging</b>: sorteio com reposição. Uma instância pode aparecer mais de uma vez na amostra de um preditor.</li>
          <li><b>Pasting</b>: sem reposição.</li>
          <li>Os preditores são independentes: treinam em paralelo.</li>
        </ul>
      </Painel>
    </Quadro>
  );
}

// a fração esperada de fora com m sorteios entre m é a mesma conta do slide 32
if (Math.abs(Math.pow(1 - 1 / M, M) - foraDaAmostra(M)) > 1e-12) throw new Error("s29: esperado de fora diferente de foraDaAmostra");
