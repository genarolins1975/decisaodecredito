"use client";
import { useState } from "react";
import { Painel, Seg, type Pagina } from "@/components/capitulo7/base";
import { AberturaBloco, PlanoLuas } from "../pecas";
import { ACERTOS_LUAS, LUAS, N_TESTE_LUAS, type ModeloLua } from "@/lib/capitulo12/dados";
import { ERROS } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 22 · c12p22 · Abertura do bloco 3 (Ensembles). As quatro perguntas com a deste bloco em destaque; ao centro, a prévia
 * do que o bloco prova: nos mesmos 125 pontos de teste das duas luas, a árvore de decisão única contra um ensemble, com
 * a região de decisão de cada um e os erros circulados. Números de LUAS.modelos (base.json, scikit-learn) e ACERTOS_LUAS.
 * Estado inicial: árvore única contra o bagging de 500 árvores; o seletor troca o ensemble (votação soft, bagging,
 * floresta), e voltar ao bagging é o estado inicial. Embaixo, o fluxo do bloco com os links para cada passo.
 */
const ENS: { v: ModeloLua; r: string; nome: string; frase: string }[] = [
  { v: "bag500", r: "Bagging", nome: "Bagging de 500 árvores", frase: "o bagging de 500 árvores" },
  { v: "soft", r: "Votação", nome: "Votação soft de três algoritmos", frase: "a votação soft de três algoritmos" },
  { v: "rf500", r: "Floresta", nome: "Floresta de 500 árvores", frase: "a floresta de 500 árvores" },
];
const ARV = LUAS.modelos.arvore;
const rotAcc = (k: ModeloLua) => `${num(LUAS.modelos[k].acc, 3)} · ${int(ACERTOS_LUAS[k])} de ${int(N_TESTE_LUAS)}`;
// a prévia só faz sentido se todo ensemble mostrado acerta mais que a árvore única
if (ENS.some((e) => ACERTOS_LUAS[e.v] <= ACERTOS_LUAS.arvore)) throw new Error("s22: um ensemble da prévia não supera a árvore única");

export function S22BlocoEnsembles({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState<ModeloLua>("bag500");
  const e = ENS.find((x) => x.v === k)!;
  const ganho = ACERTOS_LUAS[k] - ACERTOS_LUAS.arvore;
  return (
    <AberturaBloco slug="c12p22" pagina={pagina}
      conclusao={<>Uma árvore acerta {int(ACERTOS_LUAS.arvore)} dos {int(N_TESTE_LUAS)} pontos de teste; {e.frase} acerta <b>{int(ACERTOS_LUAS[k])}</b>. O bloco mostra por que a combinação ganha e quando o ganho é pequeno demais para concluir, a partir do slide {SLIDE.c12p23.n}.</>}
      extra={
        <Painel className="q12-s22">
          <PlanoLuas regiao={ARV.grade} conjunto="teste" erros={ARV.pred} titulo="Uma árvore de decisão" sub={rotAcc("arvore")}
            rotulo={`Duas luas, ${int(N_TESTE_LUAS)} pontos de teste e a região de decisão de uma árvore única: ${int(ERROS.arvore.length)} erros circulados`} arCelular="8 / 5" />
          <PlanoLuas regiao={LUAS.modelos[k].grade} conjunto="teste" erros={LUAS.modelos[k].pred} titulo={e.nome} sub={rotAcc(k)}
            rotulo={`Os mesmos ${int(N_TESTE_LUAS)} pontos de teste e a região de decisão de ${e.frase}: ${int(ERROS[k].length)} erros circulados`} arCelular="8 / 5" />
          <div className="q12-s22-lado">
            <p className="q7-k">Prévia do bloco</p>
            <p className="q12-s22-num"><b>+{int(ganho)}</b> acertos</p>
            <Seg rotulo="Ensemble comparado com a árvore" opcoes={ENS.map((x) => ({ v: x.v, r: x.r }))} valor={k} onChange={setK} />
            <p className="q7-nota">○ vinho: erro no teste</p>
          </div>
        </Painel>
      } />
  );
}
