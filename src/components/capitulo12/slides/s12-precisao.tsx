"use client";
import { useState } from "react";
import { Botao, Formula, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { MatrizReal } from "../pecas";
import { cem, Marcas, type TipoMarca } from "../b2";
import { CV, FONTE_MNIST, M_SGD } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 12 · c12p12 · Precisão: quando o modelo diz 5, quanto acerta? Prova: das 4.217 vezes em que o detector disse 5, 3.530
 * eram 5 (83,7%). A matriz da validação cruzada (CV, M_SGD em dados.ts) e a fórmula ficam à vista; a turma faz a conta
 * e escolhe entre a acurácia, a precisão, o recall e o complemento. No acerto, a coluna "Previsto: 5" acende, a conta e o
 * resultado aparecem e a grade de cem marcas mostra as previsões de 5 (cada marca 1% delas: acertos e alarmes falsos,
 * arredondados pelos maiores restos). Estado inicial: previsão em aberto. "Restaurar" volta a ele.
 */
const PREV = CV.vp + CV.fp;
const [M_VP, M_FP] = cem([CV.vp, CV.fp]);
const TIPOS: TipoMarca[] = [...Array<TipoMarca>(M_VP).fill("vp"), ...Array<TipoMarca>(M_FP).fill("fp")];
const OPCOES = [
  { texto: pct(M_SGD.acuracia, 1), certa: false, retorno: <>É a <b>acurácia</b>: soma também os {int(CV.vn)} não 5 que ele acertou. A precisão olha só a coluna “Previsto: 5”.</> },
  { texto: pct(M_SGD.precisao!, 1), certa: true, retorno: <>Isso: <b>{int(CV.vp)}</b> cincos verdadeiros nas {int(PREV)} vezes em que ele disse 5.</> },
  { texto: pct(M_SGD.recall!, 1), certa: false, retorno: <>{int(CV.vp)} ÷ {int(M_SGD.positivos)} divide pelos 5 que <b>existem</b> (a linha “Real: 5”): é o recall, do slide {SLIDE.c12p13.n}. A precisão divide pelas vezes em que ele <b>disse</b> 5.</> },
  { texto: pct(CV.fp / PREV, 1), certa: false, retorno: <>É a fração de <b>alarmes falsos</b> entre as previsões de 5 ({int(CV.fp)} de {int(PREV)}): o que falta à precisão.</> },
];

export function S12Precisao({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const ok = esc !== null && OPCOES[esc].certa;
  return (
    <Quadro slug="c12p12" pagina={pagina} layout="gl"
      conclusao={ok ? <>Quando o detector diz 5, acerta <b>{pct(M_SGD.precisao!, 1)}</b> das vezes: {int(CV.fp)} das {int(PREV)} previsões de 5 são alarmes falsos. A precisão não vê os {int(CV.fn)} cincos que ele deixou passar: o recall (slide {SLIDE.c12p13.n}) mede esse erro.</>
        : esc === null ? "Faça a conta com a matriz e escolha: o resultado aparece no acerto." : "Tente outra: o resultado aparece no acerto."}
      fonte={`${FONTE_MNIST}. Precisão = VP ÷ (VP + FP). Grade: cada marca é 1% das ${int(PREV)} previsões de 5, arredondada pelos maiores restos.`}>
      <Painel className="q12-s12-esq">
        <div className="q12-s12-vis">
          <MatrizReal vn={CV.vn} fp={CV.fp} fn={CV.fn} vp={CV.vp} realce={ok ? ["fp", "vp"] : []} />
          <div className="q12-s12-f">
            <Formula f={String.raw`\text{Precisão}=\frac{\mathrm{VP}}{\mathrm{VP}+\mathrm{FP}}`} />
            <p className="q12-s12-conta">{ok ? <>{int(CV.vp)} ÷ ({int(CV.vp)} + {int(CV.fp)})<br />= {int(CV.vp)} ÷ {int(PREV)}</> : <>VP ÷ (VP + FP) = ?</>}</p>
            <p className="q12-s12-res" data-ok={ok ? "1" : "0"}>{ok ? pct(M_SGD.precisao!, 1) : "?"}</p>
            <p className="q7-p">O denominador é a coluna “Previsto: 5”: tudo o que o modelo chamou de 5.</p>
          </div>
        </div>
        <div className="q7-botoes q12-s12-rest"><Botao sec onClick={() => setEsc(null)} desab={esc === null}>Restaurar</Botao></div>
      </Painel>
      <Painel>
        <Previsao pergunta="Quando o detector diz 5, com que frequência acerta?" opcoes={OPCOES} escolha={esc} onEscolha={setEsc} recolher />
        {ok && (
          <div className="q12-s12-grade">
            <p className="q7-k">Cada marca: 1% das {int(PREV)} previsões de 5</p>
            <div className="q12-s12-gl">
              <Marcas tipos={TIPOS} rotulo={`${M_VP} de cada 100 previsões de 5 estão certas e ${M_FP} são alarmes falsos`} />
              <ul className="q7-leg q12-s12-leg">
                <li><span className="q12-s10-mk" data-t="pos" aria-hidden="true" />era 5: {int(CV.vp)}</li>
                <li><span className="q12-s12-mk" aria-hidden="true" />alarme falso: {int(CV.fp)}</li>
              </ul>
            </div>
          </div>
        )}
      </Painel>
    </Quadro>
  );
}
