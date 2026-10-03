"use client";
import { useState } from "react";
import { Botao, Formula, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Digito, MatrizReal } from "../pecas";
import { CV, EXEMPLOS, FONTE_MNIST, HIST, M_SGD } from "@/lib/capitulo12/dados";
import { confusaoNoIndice } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 13 · c12p13 · Recall: dos 5 que existem, quantos o modelo encontra? Prova: dos 5.421 cincos, o detector encontra 3.530
 * (65,1%); 1.891 ficam abaixo do limiar. Mesma gramática do slide 12, agora com a linha "Real: 5": a turma faz a conta
 * e escolhe entre o recall, a precisão, a acurácia e o complemento. No acerto, a linha acende, a conta e o resultado
 * aparecem e o painel mostra os quatro cincos que o modelo mais rejeitou (EXEMPLOS do tipo "fn", os de score mais
 * baixo entre os falsos negativos). Números: CV e M_SGD. Estado inicial: previsão em aberto. "Restaurar" volta a ele.
 */
const FN_EX = EXEMPLOS.filter((e) => e.tipo === "fn");
if (FN_EX.length !== 4 || FN_EX.some((e) => e.rotulo !== 5 || e.score >= 0)) throw new Error("s13: os exemplos de falso negativo não são quatro 5 com score negativo");
const TETO = Math.ceil(Math.max(...FN_EX.map((e) => e.score)) / 10000) * 10000;
// para alcançar qualquer um dos quatro, o limiar fica abaixo do maior score deles: ao menos os não 5 acima da borda seguinte
const FP_ALCANCE = confusaoNoIndice(HIST, HIST.bordas.findIndex((b) => b > Math.max(...FN_EX.map((e) => e.score)))).fp;
const OPCOES = [
  { texto: pct(M_SGD.precisao!, 1), certa: false, retorno: <>É a <b>precisão</b>: divide pelas {int(M_SGD.previstosPositivos)} vezes em que ele disse 5. O recall divide pelos 5 que existem.</> },
  { texto: pct(M_SGD.recall!, 1), certa: true, retorno: <>Isso: encontra <b>{int(CV.vp)}</b> dos {int(M_SGD.positivos)} cincos.</> },
  { texto: pct(M_SGD.acuracia, 1), certa: false, retorno: <>É a <b>acurácia</b>, dominada pelos {int(CV.vn)} não 5. A pergunta é só sobre os 5: a linha “Real: 5”.</> },
  { texto: pct(CV.fn / M_SGD.positivos, 1), certa: false, retorno: <>É a fração de cincos <b>perdidos</b> ({int(CV.fn)} de {int(M_SGD.positivos)}): o que falta ao recall.</> },
];

export function S13Recall({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const ok = esc !== null && OPCOES[esc].certa;
  return (
    <Quadro slug="c12p13" pagina={pagina} layout="gl"
      conclusao={ok ? <>O detector encontra <b>{pct(M_SGD.recall!, 1)}</b> dos cincos e deixa {int(CV.fn)} passar. Precisão de {pct(M_SGD.precisao!, 1)}, recall de {pct(M_SGD.recall!, 1)}: o slide {SLIDE.c12p14.n} junta os dois num número só.</>
        : esc === null ? "Faça a conta com a matriz e escolha: o resultado aparece no acerto." : "Tente outra: o resultado aparece no acerto."}
      fonte={`${FONTE_MNIST}. Recall = VP ÷ (VP + FN). Imagens: os quatro falsos negativos de score mais baixo.`}>
      <Painel className="q12-s12-esq">
        <div className="q12-s12-vis">
          <MatrizReal vn={CV.vn} fp={CV.fp} fn={CV.fn} vp={CV.vp} realce={ok ? ["fn", "vp"] : []} />
          <div className="q12-s12-f">
            <Formula f={String.raw`\text{Recall}=\frac{\mathrm{VP}}{\mathrm{VP}+\mathrm{FN}}`} />
            <p className="q12-s12-conta">{ok ? <>{int(CV.vp)} ÷ ({int(CV.vp)} + {int(CV.fn)})<br />= {int(CV.vp)} ÷ {int(M_SGD.positivos)}</> : <>VP ÷ (VP + FN) = ?</>}</p>
            <p className="q12-s12-res" data-ok={ok ? "1" : "0"}>{ok ? pct(M_SGD.recall!, 1) : "?"}</p>
            <p className="q7-p">O denominador é a linha “Real: 5”: todos os 5 que existem.</p>
          </div>
        </div>
        <div className="q7-botoes q12-s12-rest"><Botao sec onClick={() => setEsc(null)} desab={esc === null}>Restaurar</Botao></div>
      </Painel>
      <Painel>
        <Previsao pergunta={<>Dos {int(M_SGD.positivos)} cincos que existem, que fração o detector encontra?</>} opcoes={OPCOES} escolha={esc} onEscolha={setEsc} recolher />
        {ok && (
          <div className="q12-s13-ex">
            <p className="q7-k">Os cincos que ele mais rejeitou, com o score</p>
            <ul>
              {FN_EX.map((e) => (
                <li key={e.i}>
                  <Digito px={e.px} rotulo={`Imagem ${e.i}: é 5, score ${num(e.score, 0)}, o modelo disse que não é 5`} />
                  <span>{num(e.score, 0)}</span>
                </li>
              ))}
            </ul>
            <p className="q7-nota">Os quatro têm score abaixo de {num(TETO, 0)}: para alcançar qualquer um deles, o limiar aceitaria ao menos {int(FP_ALCANCE)} alarmes falsos.</p>
          </div>
        )}
      </Painel>
    </Quadro>
  );
}
