"use client";
import { useState } from "react";
import { Botao, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Figura, PlanoLuas } from "../pecas";
import { LegendaLuas } from "../b3";
import { ACERTOS_LUAS, FONTE_LUAS, LUAS, N_TESTE_LUAS, N_TREINO_LUAS } from "@/lib/capitulo12/dados";
import { ERROS } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 31 · c12p31 · O ensemble suaviza a fronteira de decisão. Figura original (Géron, árvore única contra 500 árvores) à
 * direita; à esquerda, a versão nativa das duas regiões (grades arvore e bag500 gravadas pela referência) lado a lado.
 * O seletor troca os pontos entre treino e teste: no treino, a árvore recorta o plano até acertar todos os 375 pontos
 * (accTreino = 1); no teste, erra mais que o bagging, com os erros circulados. A tabela ao lado põe treino contra
 * teste para os dois modelos (accTreino e acc de LUAS.modelos). Estado inicial: pontos de teste; "Restaurar" volta.
 */
type Conj = "treino" | "teste";
const ARV = LUAS.modelos.arvore, BAG = LUAS.modelos.bag500;
// a leitura afirma que a ordem se inverte entre treino e teste
if (!(ARV.accTreino > BAG.accTreino && ARV.acc < BAG.acc)) throw new Error("s31: a ordem árvore e bagging deveria inverter do treino para o teste");
const acTreino = (a: number) => Math.round(a * N_TREINO_LUAS);

export function S31Fronteira({ pagina }: { pagina?: Pagina }) {
  const [conj, setConj] = useState<Conj>("teste");
  const t = conj === "teste";
  return (
    <Quadro slug="c12p31" pagina={pagina} layout="gl"
      conclusao={t
        ? <>No teste, a árvore erra {int(ERROS.arvore.length)} pontos e o bagging, <b>{int(ERROS.bag500.length)}</b>. No treino a ordem se inverte ({pct(ARV.accTreino, 0)} contra {pct(BAG.accTreino, 1)}): o recorte que acerta o treino é variância. Quantas instâncias cada árvore deixa de fora: slide {SLIDE.c12p32.n}.</>
        : <>No treino, a árvore acerta <b>{pct(ARV.accTreino, 0)}</b> dos {int(N_TREINO_LUAS)} pontos: a região abre ilhas para acertar pontos isolados. O bagging acerta {pct(BAG.accTreino, 1)} e desenha uma fronteira mais lisa. Troque para o teste.</>}
      fonte={`${FONTE_LUAS}. Árvore: DecisionTreeClassifier(random_state=42) sem limite de profundidade; bagging: 500 árvores, max_samples=100.`}>
      <Painel className="q12-s31-g">
        <div className="q12-s31-par">
          <PlanoLuas regiao={ARV.grade} conjunto={conj} erros={t ? ARV.pred : null} titulo="Árvore única" sub={t ? `teste: ${int(ACERTOS_LUAS.arvore)} de ${int(N_TESTE_LUAS)}` : `treino: ${int(acTreino(ARV.accTreino))} de ${int(N_TREINO_LUAS)}`}
            rotulo={`Região de decisão da árvore única com os pontos de ${conj}`} arCelular="8 / 5" />
          <PlanoLuas regiao={BAG.grade} conjunto={conj} erros={t ? BAG.pred : null} titulo="Bagging de 500 árvores" sub={t ? `teste: ${int(ACERTOS_LUAS.bag500)} de ${int(N_TESTE_LUAS)}` : `treino: ${int(acTreino(BAG.accTreino))} de ${int(N_TREINO_LUAS)}`}
            rotulo={`Região de decisão do bagging de 500 árvores com os pontos de ${conj}`} arCelular="8 / 5" />
        </div>
        <div className="q12-s31-rod">
          <Seg rotulo="Pontos mostrados" opcoes={[{ v: "teste" as Conj, r: `Teste (${int(N_TESTE_LUAS)})` }, { v: "treino" as Conj, r: `Treino (${int(N_TREINO_LUAS)})` }]} valor={conj} onChange={setConj} />
          <LegendaLuas treino={!t} teste={false} erros={t} />
          <Botao sec onClick={() => setConj("teste")} desab={t}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel className="q12-s31-dir">
        <Figura src="fronteiras-bagging" alt="Duas regiões de decisão nas luas: à esquerda, a árvore única, com fronteira recortada; à direita, o bagging de 500 árvores, com fronteira mais suave." credito="Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7" />
        <table className="q7-tab q12-s31-tab">
          <thead><tr><th className="q7-t-l">Acurácia</th><th>Treino</th><th>Teste</th></tr></thead>
          <tbody>
            <tr><th>Árvore única</th><td>{num(ARV.accTreino, 3)}</td><td>{num(ARV.acc, 3)}</td></tr>
            <tr><th>Bagging, 500</th><td>{num(BAG.accTreino, 3)}</td><td>{num(BAG.acc, 3)}</td></tr>
          </tbody>
        </table>
        <p className="q7-p q12-s31-txt">O conjunto desenha uma fronteira mais estável: troca um pouco de acerto no treino por acerto no teste.</p>
      </Painel>
    </Quadro>
  );
}
