"use client";
import { useState } from "react";
import { Botao, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Codigo, PlanoLuas } from "../pecas";
import { LegendaLuas } from "../b3";
import { ACERTOS_LUAS, FONTE_LUAS, LUAS, N_TESTE_LUAS, type ModeloLua } from "@/lib/capitulo12/dados";
import { ERROS } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 27 · c12p27 · Votação em código: o código da aula (logística liblinear, floresta de 10 árvores, SVC gamma="auto" e o
 * VotingClassifier com voting="hard"), com a linha do modelo escolhido acesa. O seletor troca o modelo (três isolados,
 * hard voting e soft voting) e o plano das luas mostra a região de decisão dele (grade gravada pela referência), os 125
 * pontos de teste e os erros circulados; no soft voting, o código passa a probability=True e voting="soft", como a
 * referência treinou. Números de LUAS.modelos (base.json). Estado inicial: hard voting, o modelo da aula; "Restaurar"
 * volta a ele.
 */
const OPCOES: { v: ModeloLua; r: string; nome: string }[] = [
  { v: "lr", r: "Logística", nome: "Regressão logística" },
  { v: "rf10", r: "Floresta 10", nome: "Floresta de 10 árvores" },
  { v: "svc", r: "SVC", nome: "SVC" },
  { v: "hard", r: "Hard voting", nome: "Hard voting" },
  { v: "soft", r: "Soft voting", nome: "Soft voting" },
];
const codigo = (soft: boolean) => [
  "from sklearn.ensemble import RandomForestClassifier, VotingClassifier",
  "from sklearn.linear_model import LogisticRegression",
  "from sklearn.svm import SVC",
  "",
  'log_clf = LogisticRegression(solver="liblinear", random_state=42)',
  "rnd_clf = RandomForestClassifier(n_estimators=10, random_state=42)",
  soft ? 'svm_clf = SVC(gamma="auto", probability=True, random_state=42)' : 'svm_clf = SVC(gamma="auto", random_state=42)',
  "voting_clf = VotingClassifier(",
  '    estimators=[("lr", log_clf), ("rf", rnd_clf), ("svc", svm_clf)],',
  soft ? '    voting="soft"' : '    voting="hard"',
  ")",
  "voting_clf.fit(X_train, y_train)",
];
const LINHAS: Record<string, number[]> = { lr: [4], rf10: [5], svc: [6], hard: [7, 8, 9, 10], soft: [6, 9] };
const INI: ModeloLua = "hard";
const GRADE = `${int(LUAS.grade.x[2])} × ${int(LUAS.grade.y[2])}`;
// a leitura chama o SVC de melhor isolado e diz que os dois votos o superam
if (ACERTOS_LUAS.svc < Math.max(ACERTOS_LUAS.lr, ACERTOS_LUAS.rf10) || ACERTOS_LUAS.hard <= ACERTOS_LUAS.svc || ACERTOS_LUAS.soft <= ACERTOS_LUAS.svc) throw new Error("s27: o SVC deveria ser o melhor isolado e os votos, melhores que ele");

export function S27VotacaoCodigo({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState<ModeloLua>(INI);
  const o = OPCOES.find((x) => x.v === k)!, m = LUAS.modelos[k];
  const voto = k === "hard" || k === "soft";
  return (
    <Quadro slug="c12p27" pagina={pagina} layout="gg"
      conclusao={voto
        ? <>{o.nome}: <b>{num(m.acc, 3)}</b> no teste ({int(ACERTOS_LUAS[k])} de {int(N_TESTE_LUAS)}), contra {num(LUAS.modelos.svc.acc, 3)} do SVC, o melhor isolado: {int(ACERTOS_LUAS[k] - ACERTOS_LUAS.svc)} {ACERTOS_LUAS[k] - ACERTOS_LUAS.svc === 1 ? "acerto" : "acertos"} a mais. Por que tão pouco é o slide {SLIDE.c12p28.n}.</>
        : <>{o.nome} sozinho: {num(m.acc, 3)} no teste ({int(ACERTOS_LUAS[k])} de {int(N_TESTE_LUAS)}), {int(ERROS[k].length)} erros circulados. Compare com o voto dos três (hard ou soft).</>}
      fonte={`${FONTE_LUAS}. Soft voting: SVC com probability=True. Regiões de decisão numa grade de ${GRADE} pontos.`}>
      <div className="q12-col q12-s27-esq">
        <Codigo linhas={codigo(k === "soft")} destaque={LINHAS[k]} rotulo={`Código da votação; linha acesa: ${o.nome}`} compacto />
        <Seg rotulo="Modelo mostrado no plano" opcoes={OPCOES.map((x) => ({ v: x.v, r: x.r }))} valor={k} onChange={setK} />
        <ul className="q12-b3-lista q12-b3-lista--peq">
          <li><b>voting=&quot;hard&quot;</b>: vence a classe mais prevista pelos três.</li>
          <li><b>Soft voting</b> (probability=True no SVC): a média das probabilidades decide, e votos confiantes pesam mais.</li>
        </ul>
      </div>
      <Painel className="q12-s27-dir">
        <PlanoLuas regiao={m.grade} conjunto="teste" erros={m.pred} titulo={o.nome} sub={`${num(m.acc, 3)} no teste · ${int(ACERTOS_LUAS[k])} de ${int(N_TESTE_LUAS)}`}
          rotulo={`Região de decisão de ${o.nome} e os ${int(N_TESTE_LUAS)} pontos de teste: ${int(ERROS[k].length)} erros circulados`} arCelular="8 / 5" />
        <div className="q12-s27-rod">
          <LegendaLuas treino={false} erros />
          <Botao sec onClick={() => setK(INI)} desab={k === INI}>Restaurar</Botao>
        </div>
      </Painel>
    </Quadro>
  );
}
