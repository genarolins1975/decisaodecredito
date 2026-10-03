"use client";
import { useState } from "react";
import { Botao, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Figura } from "../pecas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int } from "@/lib/capitulo7/formato";

/**
 * 23 · c12p23 · Votação: algoritmos diferentes, treinados nos mesmos dados, votam na classe de uma nova instância e
 * vence a maioria. À esquerda, a figura original (Géron, cap. 7) e os pontos da aula; à direita, os quatro preditores
 * da figura com o voto de cada um: clicar troca o voto entre as classes 1 e 2, e o voto do conjunto responde, com o
 * empate declarado quando a conta fica 2 a 2 (o VotingClassifier do scikit-learn desempata pela menor classe, como
 * argmax da contagem). Sem números de dados: as contagens são as dos votos na tela. Estado inicial: o exemplo da figura
 * (três votos na classe 1, um na 2); "Restaurar" volta a ele.
 */
const VOTANTES = ["Regressão logística", "SVM", "Floresta", "Outro algoritmo"];
const FIGURA = [1, 1, 2, 1];

export function S23Votacao({ pagina }: { pagina?: Pagina }) {
  const [votos, setVotos] = useState(FIGURA);
  const n1 = votos.filter((v) => v === 1).length, n2 = votos.length - n1;
  const venc = n1 > n2 ? 1 : n2 > n1 ? 2 : null;
  const inicial = votos.every((v, i) => v === FIGURA[i]);
  const trocar = (i: number) => setVotos((a) => a.map((v, j) => (j === i ? (v === 1 ? 2 : 1) : v)));
  return (
    <Quadro slug="c12p23" pagina={pagina} layout="qd"
      conclusao={venc === null
        ? <>Empate de {int(n1)} a {int(n2)}: com número par de votantes, a maioria pode não existir e é preciso uma regra de desempate. Por isso as contas do slide {SLIDE.c12p24.n} usam número ímpar.</>
        : <>{int(Math.max(n1, n2))} votos contra {int(Math.min(n1, n2))}: o conjunto prevê a <b>classe {venc}</b>. A maioria só corrige um votante se os outros errarem em casos diferentes; o slide {SLIDE.c12p24.n} mede quanto isso rende.</>}
      fonte="Ilustração de Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7. Votos da direita: exemplo didático, sem dados.">
      <Painel className="q12-s23-esq">
        <Figura src="votacao" alt="Quatro preditores diferentes recebem a mesma nova instância; três preveem a classe 1 e um prevê a classe 2; a previsão do conjunto, por maioria, é 1." credito="Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7" />
        <ul className="q12-b3-lista">
          <li>Algoritmos diferentes, treinados nos mesmos dados: regressão logística, SVM, floresta e outros.</li>
          <li>No exemplo, três votam na classe 1 e um na classe 2: o conjunto prevê a classe 1.</li>
        </ul>
      </Painel>
      <Painel titulo="Clique num preditor para trocar o voto" className="q12-s23-dir">
        <ol className="q12-s23-vot" aria-label="Votos dos quatro preditores">
          {votos.map((v, i) => (
            <li key={i}>
              <button type="button" className="q12-s23-b" data-v={v} onClick={() => trocar(i)} aria-label={`${VOTANTES[i]}: vota na classe ${v}. Trocar para a classe ${v === 1 ? 2 : 1}`}>
                <span className="q12-s23-c" aria-hidden="true">{v}</span>
                <span className="q12-s23-n">{VOTANTES[i]}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="q12-s23-chave" aria-hidden="true" />
        <div className="q12-s23-res" data-empate={venc === null ? "1" : undefined} aria-live="polite">
          <span className="q12-s23-c q12-s23-c--g" data-v={venc ?? 0}>{venc ?? "?"}</span>
          <div>
            <p className="q7-k">Previsão do conjunto</p>
            <p className="q12-s23-txt">{venc === null ? <>Empate: {int(n1)} a {int(n2)}</> : <>Classe {venc}, por {int(Math.max(n1, n2))} a {int(Math.min(n1, n2))}</>}</p>
            <p className="q7-nota">Classe 1: {int(n1)} {n1 === 1 ? "voto" : "votos"} · classe 2: {int(n2)} {n2 === 1 ? "voto" : "votos"}{venc === null ? " · o scikit-learn desempata pela menor classe" : ""}</p>
          </div>
        </div>
        <div className="q7-botoes"><Botao sec onClick={() => setVotos(FIGURA)} desab={inicial}>Restaurar o exemplo da figura</Botao></div>
      </Painel>
    </Quadro>
  );
}
