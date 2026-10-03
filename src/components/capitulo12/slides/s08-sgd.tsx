"use client";
import { useState } from "react";
import { Botao, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Codigo, Digito } from "../pecas";
import { EXEMPLOS, FONTE_MNIST } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int } from "@/lib/capitulo7/formato";

/**
 * 08 · c12p8 · O primeiro classificador: SGDClassifier(loss="hinge") dá um score por imagem e prevê 5 quando o score
 * passa de 0. Prova que o modelo já rotula, e que rotular não é acertar: as doze imagens da amostra gravada pela
 * referência (seis 5 e seis de outros algarismos) ficam numa reta de score com o limiar 0; cada imagem é um botão que
 * mostra score, previsão e se acertou, e a contagem de acertos nas doze sai do dado. O score é o da validação cruzada
 * em três partes (cross_val_predict com decision_function), o mesmo que forma a matriz do slide 11. Números: EXEMPLOS
 * (score, rótulo, previsão) em base.json. Estado inicial: a imagem de score mais alto selecionada; Restaurar volta a ela.
 */
const AM = EXEMPLOS.filter((e) => e.tipo === "amostra");
if (AM.length !== 12) throw new Error("s08: a amostra deveria ter doze imagens");
if (AM.some((e) => e.pred !== e.score > 0)) throw new Error("s08: a previsão deveria ser score > 0");
const E0 = EXEMPLOS[0];
const acertou = (e: (typeof AM)[number]) => e.pred === (e.rotulo === 5);
const ACERTOS = AM.filter(acertou).length;
const CINCOS = AM.filter((e) => e.rotulo === 5), OUTROS = AM.filter((e) => e.rotulo !== 5);
const VP = CINCOS.filter((e) => e.pred).length, VN = OUTROS.filter((e) => !e.pred).length;
if (VN !== OUTROS.length) throw new Error("s08: a leitura supõe que todos os não 5 da amostra ficam abaixo de 0");
const PASSO = 10000;
const LO = Math.floor(Math.min(...AM.map((e) => e.score)) / PASSO) * PASSO, HI = Math.ceil(Math.max(...AM.map((e) => e.score)) / PASSO) * PASSO;
const TICKS = Array.from({ length: (HI - LO) / PASSO + 1 }, (_, k) => LO + k * PASSO);
const X = (s: number) => ((s - LO) / (HI - LO)) * 100;
/** Faixas: ordem do score, cada imagem na primeira faixa em que não encosta na anterior (largura de uma miniatura). */
const LARG = 8; // largura de uma miniatura em % da reta
const ORDEM = [...AM].sort((a, b) => a.score - b.score);
const FAIXA = new Map<number, number>();
{ const fim: number[] = []; for (const e of ORDEM) { const x = X(e.score); let f = fim.findIndex((u) => x - u >= LARG); if (f < 0) { f = fim.length; fim.push(0); } fim[f] = x; FAIXA.set(e.i, f); } }
const NF = Math.max(...FAIXA.values()) + 1;
const INI = ORDEM[ORDEM.length - 1].i;
const COD = [
  "from sklearn.linear_model import SGDClassifier",
  "",
  'sgd_clf = SGDClassifier(loss="hinge", random_state=42)',
  "sgd_clf.fit(X_train_digits, y_train_5)",
  "sgd_clf.predict([some_digit])",
];

export function S08Sgd({ pagina }: { pagina?: Pagina }) {
  const [sel, setSel] = useState(INI);
  const e = AM.find((x) => x.i === sel)!;
  const ok = acertou(e);
  return (
    <Quadro slug="c12p8" pagina={pagina} layout="um"
      conclusao={<>Nas doze imagens, o modelo acerta <b>{ACERTOS}</b>: os {VN} que não são 5 e {VP} dos {CINCOS.length} cincos. O modelo já prevê. Quanto podemos confiar nessas previsões? O slide {SLIDE.c12p9.n} abre as métricas.</>}
      fonte={`${FONTE_MNIST}. Score: decision_function na validação cruzada (cross_val_predict), o mesmo da matriz do slide ${SLIDE.c12p11.n}. Doze imagens do treino sorteadas com semente 12, seis 5 e seis de outros algarismos: proporção diferente da base, sem valor de estimativa.`}>
      <div className="q12-s08">
        <Codigo linhas={COD} destaque={[2]} rotulo="Código: o classificador linear ajustado por SGD e uma previsão" />
        <ul className="q12-s08-pts">
          <li><b>SGD</b> é o método de otimização: ajusta os pesos uma observação por vez e escala para bases grandes.</li>
          <li><b>loss=&quot;hinge&quot;</b> é a perda do SVM linear.</li>
          <li><b>predict</b> devolve True ou False: True quando o score passa de 0. Na primeira imagem (um {E0.rotulo}), o score é {int(E0.score)}.</li>
        </ul>
        <Painel className="q12-s08-reta" titulo="Doze imagens na reta do score: clique numa delas">
          <div className="q12-s08-area" style={{ ["--nf" as string]: NF }}>
            <div className="q12-s08-pista">
            <div className="q12-s08-reg q12-s08-reg--neg" style={{ width: `${X(0)}%` }}><span>prevê não 5</span></div>
            <div className="q12-s08-reg q12-s08-reg--pos" style={{ left: `${X(0)}%` }}><span>prevê 5</span></div>
            <div className="q12-s08-lim" style={{ left: `${X(0)}%` }}><span>limiar 0</span></div>
            {AM.map((x) => <span key={`h${x.i}`} className="q12-s08-haste" aria-hidden="true" data-on={x.i === sel ? "1" : undefined} style={{ left: `${X(x.score)}%`, ["--f" as string]: FAIXA.get(x.i)! }} />)}
            {AM.map((x) => {
              const f = FAIXA.get(x.i)!, a = acertou(x);
              return (
                <button key={x.i} type="button" className="q12-s08-im" aria-pressed={x.i === sel} data-ok={a ? "1" : "0"} onClick={() => setSel(x.i)}
                  style={{ left: `${X(x.score)}%`, ["--f" as string]: f }}
                  aria-label={`Imagem de um ${x.rotulo}, score ${int(x.score)}, o modelo ${x.pred ? "diz 5" : "diz não 5"}: ${a ? "acerto" : "erro"}`}>
                  <Digito px={x.px} rotulo={`Um ${x.rotulo}`} />
                  <span className="q12-s08-et"><i aria-hidden="true">{a ? "✓" : "✗"}</i>é {x.rotulo}</span>
                </button>
              );
            })}
            <div className="q12-s08-eixo" aria-hidden="true">
              {TICKS.map((t) => <span key={t} style={{ left: `${X(t)}%` }}>{int(t)}</span>)}
            </div>
            </div>
          </div>
        </Painel>
        <Painel className="q12-s08-info" tom="suave">
          <div className="q12-s08-sel">
            <Digito px={e.px} rotulo={`Imagem selecionada: um ${e.rotulo}`} />
            <dl>
              <div><dt>Real</dt><dd>{e.rotulo === 5 ? "5" : `${e.rotulo} (não 5)`}</dd></div>
              <div><dt>Score</dt><dd>{int(e.score)}</dd></div>
              <div><dt>Previsão</dt><dd>{e.pred ? "5" : "não 5"}</dd></div>
            </dl>
          </div>
          <p className="q12-s08-res" data-ok={ok ? "1" : "0"} aria-live="polite">{ok ? "✓ Acerto" : "✗ Erro"}: {e.rotulo === 5 ? (e.pred ? "um 5 encontrado" : "um 5 que passou abaixo do limiar") : "um não 5 corretamente recusado"}.</p>
          <p className="q12-s08-cont"><b>{ACERTOS} de {AM.length}</b> acertos · {VP} de {CINCOS.length} cincos encontrados</p>
          <div className="q7-botoes"><Botao sec onClick={() => setSel(INI)} desab={sel === INI}>Restaurar</Botao></div>
        </Painel>
      </div>
    </Quadro>
  );
}
