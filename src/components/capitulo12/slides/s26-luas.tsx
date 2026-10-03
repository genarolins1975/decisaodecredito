"use client";
import { useState } from "react";
import { Botao, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Codigo, Figura, PlanoLuas } from "../pecas";
import { LegendaLuas } from "../b3";
import { ACERTOS_LUAS, FONTE_LUAS, LUAS, N_TESTE_LUAS, N_TREINO_LUAS } from "@/lib/capitulo12/dados";
import { ERROS } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 26 · c12p26 · O problema de teste do bloco: make_moons com 500 pontos e ruído de 0,30, dividido por train_test_split
 * (375 de treino, 125 de teste, o padrão de 25%). Código da aula e figura original (Géron) à direita; à esquerda, o plano
 * nativo das luas com o seletor treino, teste ou ambos e o botão que sobrepõe a fronteira da regressão logística (grade
 * lr gravada pela referência), uma reta, com a acurácia no teste e os erros circulados. Números de LUAS (base.json).
 * Estado inicial: os 375 pontos de treino, sem fronteira; "Restaurar" volta a ele.
 */
const COD = [
  "from sklearn.model_selection import train_test_split",
  "from sklearn.datasets import make_moons",
  "",
  "X, y = make_moons(",
  "    n_samples=500, noise=0.30, random_state=42",
  ")",
  "X_train, X_test, y_train, y_test = train_test_split(",
  "    X, y, random_state=42",
  ")",
];
type Conj = "treino" | "teste" | "ambos";
const N = N_TREINO_LUAS + N_TESTE_LUAS;
const LR = LUAS.modelos.lr;
const RUIDO = 0.3; // noise=0.30 do código da aula

export function S26Luas({ pagina }: { pagina?: Pagina }) {
  const [conj, setConj] = useState<Conj>("treino");
  const [reta, setReta] = useState(false);
  const inicial = conj === "treino" && !reta;
  return (
    <Quadro slug="c12p26" pagina={pagina} layout="gl"
      conclusao={reta
        ? <>A reta da logística acerta <b>{num(LR.acc, 3)}</b> no teste ({int(ACERTOS_LUAS.lr)} de {int(N_TESTE_LUAS)}): os {int(ERROS.lr.length)} erros ficam onde as luas se encaixam. Votar com modelos que curvam a fronteira é o slide {SLIDE.c12p27.n}.</>
        : <>{int(N)} pontos: {int(N_TREINO_LUAS)} de treino e {int(N_TESTE_LUAS)} de teste ({pct(N_TESTE_LUAS / N, 0)}). As luas se encaixam: sobreponha a fronteira da logística e veja quanto uma reta erra.</>}
      fonte={FONTE_LUAS}>
      <Painel className="q12-s26-g">
        <PlanoLuas regiao={reta ? LR.grade : null} conjunto={conj} erros={reta ? LR.pred : null}
          titulo="As duas classes no plano" sub={conj === "treino" ? `${int(N_TREINO_LUAS)} pontos de treino` : conj === "teste" ? `${int(N_TESTE_LUAS)} pontos de teste` : `${int(N)} pontos, teste em destaque`}
          rotulo={`Duas luas entrelaçadas: ${conj === "treino" ? `${int(N_TREINO_LUAS)} pontos de treino` : conj === "teste" ? `${int(N_TESTE_LUAS)} pontos de teste` : `os ${int(N)} pontos`}${reta ? `, com a fronteira reta da regressão logística, que acerta ${int(ACERTOS_LUAS.lr)} de ${int(N_TESTE_LUAS)} no teste` : ""}`} arCelular="8 / 5" />
        <div className="q12-s26-ctl">
          <Seg rotulo="Pontos mostrados" opcoes={[{ v: "treino" as Conj, r: `Treino (${int(N_TREINO_LUAS)})` }, { v: "teste" as Conj, r: `Teste (${int(N_TESTE_LUAS)})` }, { v: "ambos" as Conj, r: `Ambos (${int(N)})` }]} valor={conj} onChange={setConj} />
          <Botao prim={!reta} onClick={() => { if (!reta && conj === "treino") setConj("teste"); setReta(!reta); }}>{reta ? "Tirar a fronteira" : "Sobrepor a logística"}</Botao>
          <Botao sec onClick={() => { setConj("treino"); setReta(false); }} desab={inicial}>Restaurar</Botao>
        </div>
        <LegendaLuas treino={conj !== "teste"} teste={conj !== "treino"} erros={reta && conj !== "treino"} />
      </Painel>
      <div className="q12-col q12-s26-dir">
        <Codigo linhas={COD} destaque={reta ? [] : conj === "ambos" ? [3, 4, 5] : [6, 7, 8]} rotulo="Código: gera as duas luas e separa treino e teste" compacto />
        <Painel className="q12-s26-fig">
          <Figura src="luas" alt="As duas luas da aula: pontos de duas classes em forma de meia-lua, entrelaçados, com ruído." credito="Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 7" fundo={false} />
          <ul className="q12-b3-lista q12-b3-lista--peq">
            <li>{int(N)} observações, ruído de {num(RUIDO, 2)}.</li>
            <li>{int(N_TREINO_LUAS)} para treino e {int(N_TESTE_LUAS)} para teste: o padrão separa {pct(N_TESTE_LUAS / N, 0)}.</li>
          </ul>
        </Painel>
      </div>
    </Quadro>
  );
}
