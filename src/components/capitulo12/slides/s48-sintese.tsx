"use client";
import { useState, type ReactNode } from "react";
import { Botao, LinkSlide, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { ACERTOS_LUAS, CORTE, FONTE_LUAS, FONTE_MNIST, M_SGD, M_TRIVIAL, META_VOLUME, N_TESTE_LUAS } from "@/lib/capitulo12/dados";
import { BLOCOS, PERGUNTAS, SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 48 · c12p48 · Síntese da aula: as quatro linhas da aula (uma por bloco), cada uma com o número que a sustenta,
 * calculado (M_SGD e M_TRIVIAL do MNIST, ACERTOS_LUAS das duas luas, CORTE do caso) e o link para a abertura do bloco.
 * Clicar numa linha mostra o que ainda falta para a resposta valer numa carteira real. O "melhor isolado" é o de mais
 * acertos entre os três modelos que votam (regressão logística, floresta de 10 árvores e SVC). Estado inicial: a
 * linha de Crédito em foco; "Restaurar" volta a ela.
 */
const ISOLADOS = ["lr", "rf10", "svc"] as const;
const MELHOR = Math.max(...ISOLADOS.map((k) => ACERTOS_LUAS[k]));
if (!(ACERTOS_LUAS.soft > MELHOR)) throw new Error("s48: o voto suave não supera o melhor isolado");
const K = CORTE.curto, L = CORTE.longo;
const SIMB: Record<string, string> = { ordenacao: "●", probabilidade: "▲", decisao: "◆", validacao: "■" };
const LINHAS: { frase: string; num: string; det: ReactNode; falta: ReactNode }[] = [
  { frase: "Uma previsão precisa de alvo e amostra definidos.", num: pct(M_SGD.prevalencia, 1), det: <>das imagens de treino são 5 ({int(M_SGD.positivos)} de {int(M_SGD.n)})</>,
    falta: <>No crédito, o alvo muda o problema: {pct(K.politica.taxaMaus, 1)} de maus no curto prazo, {pct(L.politica.taxaMaus, 1)} no longo. Defina o alvo antes do modelo.</> },
  { frase: "Acurácia, precisão e recall respondem a perguntas distintas; o limiar escolhe o erro aceitável.", num: pct(M_SGD.acuracia, 1), det: <>de acurácia do detector, contra {pct(M_TRIVIAL.acuracia, 1)} do modelo que nunca diz 5</>,
    falta: <>O custo de cada erro em reais, que escolhe o limiar (slide {SLIDE.c12p16.n}): um mau aprovado e um bom recusado não custam o mesmo.</> },
  { frase: "A combinação explora a diversidade de erros entre os modelos.", num: `${int(ACERTOS_LUAS.soft)} de ${int(N_TESTE_LUAS)}`, det: <>acertos do voto suave, contra {int(MELHOR)} do melhor modelo isolado</>,
    falta: <>Um ensemble também precisa passar pela validação no tempo e ser explicado ao comitê: ganhar no teste não basta.</> },
  { frase: "O limiar e a validação no tempo conectam o modelo à decisão.", num: pct(K.combinada.recall, 1), det: <>dos maus capturados pela combinação, recusando {pct(K.combinada.volume, 1)} da base (meta: menos de {pct(META_VOLUME, 0)})</>,
    falta: <>Separar sobreajuste de mudança na população (slide {SLIDE.c12p44.n}) antes de adotar o corte, e acompanhar as safras depois.</> },
];

export function S48Sintese({ pagina }: { pagina?: Pagina }) {
  const [sel, setSel] = useState(3);
  return (
    <Quadro slug="c12p48" pagina={pagina} layout="glx"
      conclusao={<>Do rótulo ao corte: o detector supera o trivial ({pct(M_SGD.acuracia, 1)} contra {pct(M_TRIVIAL.acuracia, 1)}), o voto supera o melhor isolado ({int(ACERTOS_LUAS.soft)} contra {int(MELHOR)}) e a regra escolhida depende da meta. O slide {SLIDE.c12p49.n} volta à pergunta de abertura.</>}
      fonte={`${FONTE_MNIST}. ${FONTE_LUAS}. Caso de crédito do material da aula, curto prazo.`}>
      <Painel className="q12-s48-lista">
        <ol>
          {PERGUNTAS.map((p, i) => {
            const l = LINHAS[i];
            return (
              <li key={p.id} data-p={p.id} data-on={i === sel ? "1" : undefined}>
                <button type="button" className="q12-s48-lin" aria-pressed={i === sel} onClick={() => setSel(i)}>
                  <span className="q12-s48-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="q12-s48-nome"><i aria-hidden="true">{SIMB[p.id]}</i> {p.nome}</span>
                  <span className="q12-s48-frase">{l.frase}</span>
                  <span className="q12-s48-num"><b>{l.num}</b><small>{l.det}</small></span>
                </button>
              </li>
            );
          })}
        </ol>
      </Painel>
      <Painel tom="suave" className="q12-s48-dir">
        <p className="q7-k">{PERGUNTAS[sel].nome}: o que ainda falta</p>
        <p className="q7-p">{LINHAS[sel].falta}</p>
        <p className="q7-nota">Rever o bloco: <LinkSlide slug={BLOCOS[sel].abre}>slide {SLIDE[BLOCOS[sel].abre].n}</LinkSlide>.</p>
        <div className="q7-botoes q12-s48-bot"><Botao sec onClick={() => setSel(3)} desab={sel === 3}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
