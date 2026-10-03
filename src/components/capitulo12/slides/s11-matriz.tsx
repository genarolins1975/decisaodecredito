"use client";
import { useState } from "react";
import { Botao, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Codigo, Digito, MatrizReal, type Cel } from "../pecas";
import { CV, EXEMPLOS, FONTE_MNIST, M_SGD } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 11 · c12p11 · A matriz de confusão do detector de 5 (validação cruzada em três partes no treino do MNIST). Cada
 * célula é um botão: o painel diz o que ela conta, a fração da sua linha e, nas duas células de erro, mostra as quatro
 * imagens mais extremas do erro (os alarmes falsos com score mais alto e os 5 com score mais baixo, gravados pela
 * referência). Estado inicial: FP em foco, porque é o erro que a acurácia esconde melhor. "Restaurar" volta a ele.
 */
const COD = [
  "from sklearn.model_selection import cross_val_predict",
  "from sklearn.metrics import confusion_matrix",
  "",
  "y_train_pred = cross_val_predict(sgd_clf, X_train_digits, y_train_5, cv=3)",
  "confusion_matrix(y_train_5, y_train_pred)",
];
const LINHA: Record<Cel, { real: string; total: number }> = { vn: { real: "não 5", total: CV.vn + CV.fp }, fp: { real: "não 5", total: CV.vn + CV.fp }, fn: { real: "5", total: CV.fn + CV.vp }, vp: { real: "5", total: CV.fn + CV.vp } };
const TEXTO: Record<Cel, { nome: string; o: string }> = {
  vn: { nome: "Verdadeiro negativo", o: "imagens que não são 5 e o modelo disse que não são: acerto." },
  fp: { nome: "Falso positivo", o: "alarme falso: o modelo disse 5 para uma imagem que não é 5." },
  fn: { nome: "Falso negativo", o: "um 5 que passou despercebido: o modelo disse que não é 5." },
  vp: { nome: "Verdadeiro positivo", o: "cincos que o modelo encontrou: acerto." },
};
const FP_EX = EXEMPLOS.filter((e) => e.tipo === "fp"), FN_EX = EXEMPLOS.filter((e) => e.tipo === "fn");

export function S11Matriz({ pagina }: { pagina?: Pagina }) {
  const [foco, setFoco] = useState<Cel>("fp");
  const v = CV[foco], l = LINHA[foco], erro = foco === "fp" || foco === "fn";
  const ex = foco === "fp" ? FP_EX : foco === "fn" ? FN_EX : [];
  return (
    <Quadro slug="c12p11" pagina={pagina} layout="qd"
      conclusao={<>A acurácia junta as duas diagonais; a matriz mostra que os {int(CV.fp + CV.fn)} erros são de dois tipos: <b>{int(CV.fp)} alarmes falsos</b> e <b>{int(CV.fn)} cincos perdidos</b>. Precisão e recall (slides {SLIDE.c12p12.n} e {SLIDE.c12p13.n}) leem cada um.</>}
      fonte={`${FONTE_MNIST}. Imagens de erro: as quatro de score mais alto entre os falsos positivos e as quatro de score mais baixo entre os falsos negativos.`}>
      <div className="q12-col">
        <Codigo linhas={COD} destaque={[3, 4]} rotulo="Código: previsões por validação cruzada em três partes e matriz de confusão" compacto />
        <Painel titulo="Clique numa célula" className="q12-s11-mx">
          <MatrizReal vn={CV.vn} fp={CV.fp} fn={CV.fn} vp={CV.vp} foco={foco} onFoco={setFoco} />
        </Painel>
      </div>
      <Painel titulo={TEXTO[foco].nome} className="q12-s11-dir">
        <p className="q12-s11-num"><b data-erro={erro ? "1" : "0"}>{int(v)}</b> {TEXTO[foco].o}</p>
        <p className="q7-p">São {pct(v / l.total, 1)} das {int(l.total)} imagens que realmente {l.real === "5" ? "são 5" : "não são 5"}.</p>
        {erro ? (
          <div className="q12-s11-ex">
            <p className="q7-k">{foco === "fp" ? "Alarmes falsos mais confiantes" : "Cincos mais rejeitados"}</p>
            <ul>
              {ex.map((e) => (
                <li key={e.i}>
                  <Digito px={e.px} tom={foco === "fp" ? "def" : "ink"} rotulo={`Imagem ${e.i}: rótulo ${e.rotulo}, score ${num(e.score, 0)}, o modelo ${e.pred ? "disse 5" : "disse que não é 5"}`} />
                  <span>é {e.rotulo} · score {num(e.score, 0)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : <p className="q7-nota">As duas células de erro mostram imagens: clique em FP ou FN.</p>}
        <div className="q7-botoes"><Botao sec onClick={() => setFoco("fp")} desab={foco === "fp"}>Restaurar</Botao></div>
        <p className="q7-nota">Acurácia: ({int(CV.vn)} + {int(CV.vp)}) ÷ {int(M_SGD.n)} = {pct(M_SGD.acuracia, 1)}.</p>
      </Painel>
    </Quadro>
  );
}
