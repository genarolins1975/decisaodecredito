"use client";
import { useState } from "react";
import { Botao, Kpi, Painel, Previsao, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { cem, Marcas, type TipoMarca } from "../b2";
import { CONTAGEM_DIGITOS, FONTE_MNIST, M_SGD, M_TRIVIAL } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { CORTE } from "@/lib/capitulo12/dados";

/** O mesmo modelo trivial no caso de crédito (curto prazo): aprovar todos acerta os bons. */
const CREDITO = CORTE.curto.politica;
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 10 · c12p10 · A acurácia esconde quem errou. Prova: com 9,0% de 5 no treino, o modelo que nunca diz 5 acerta 91,0%,
 * perto dos 95,7% do detector SGD. A turma prevê a acurácia do modelo trivial (alternativas: a prevalência, o sorteio,
 * a resposta certa e a acurácia do detector); só no acerto aparecem o número, a grade com os erros do trivial e o
 * seletor que toma outro algarismo como positivo (acurácia trivial = 1 − prevalência, de CONTAGEM_DIGITOS).
 * Números: M_SGD e M_TRIVIAL (validação cruzada em três partes no treino de 60.000), CONTAGEM_DIGITOS. Estado inicial:
 * previsão em aberto, algarismo 5. "Restaurar" volta a ele.
 */
const N = M_SGD.n;
if (CONTAGEM_DIGITOS.reduce((a, b) => a + b, 0) !== N || CONTAGEM_DIGITOS[5] !== M_SGD.positivos) throw new Error("s10: contagem dos algarismos não fecha com o treino");
if (Math.abs(M_TRIVIAL.acuracia - (1 - M_SGD.prevalencia)) > 1e-12) throw new Error("s10: acurácia trivial diferente de 1 − prevalência");
const ACC_TRIV = CONTAGEM_DIGITOS.map((c) => 1 - c / N);
const MIN = Math.min(...ACC_TRIV), MAX = Math.max(...ACC_TRIV);

const OPCOES = [
  { texto: pct(M_SGD.prevalencia, 1), certa: false, retorno: <>{pct(M_SGD.prevalencia, 1)} é a <b>fração de 5</b>: são justamente as imagens que esse modelo erra. Em quais ele acerta?</> },
  { texto: "50%", certa: false, retorno: <>50% seria um <b>sorteio</b>. O modelo não sorteia: responde sempre “não 5”. Quantas imagens são não 5?</> },
  { texto: pct(M_TRIVIAL.acuracia, 1), certa: true, retorno: <>Isso: acerta os <b>{int(M_TRIVIAL.vn)} não 5</b> e erra os {int(M_TRIVIAL.fn)} cincos, sem olhar nenhuma imagem.</> },
  { texto: pct(M_SGD.acuracia, 1), certa: false, retorno: <>{pct(M_SGD.acuracia, 1)} é o <b>detector treinado</b>. Quem nunca diz 5 não olha a imagem: acerta só os não 5.</> },
];

export function S10Acuracia({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [dig, setDig] = useState(5);
  const ok = esc !== null && OPCOES[esc].certa;
  const pos = CONTAGEM_DIGITOS[dig], acc = ACC_TRIV[dig];
  const [mPos, mNeg] = cem([pos, N - pos]);
  const tipos: TipoMarca[] = [...Array<TipoMarca>(mPos).fill(ok ? "fn" : "pos"), ...Array<TipoMarca>(mNeg).fill(ok ? "vn" : "neg")];
  const restaurar = () => { setEsc(null); setDig(5); };
  return (
    <Quadro slug="c12p10" pagina={pagina} layout="gl"
      conclusao={ok ? <>Com classes desbalanceadas, a acurácia mede sobretudo a classe majoritária: <b>{pct(acc, 1)}</b> sem olhar imagem nenhuma{dig === 5 ? `, contra ${pct(M_SGD.acuracia, 1)} do detector` : ` com o ${dig} como positivo`}. No crédito do bloco 4, aprovar todos acerta {pct(1 - CREDITO.taxaMaus, 1)} ({int(CREDITO.maus)} maus em {int(CREDITO.classificados)}). A matriz (slide {SLIDE.c12p11.n}) separa cada erro.</>
        : esc === null ? "Escolha uma alternativa: a acurácia do modelo trivial aparece no acerto." : "Tente outra alternativa: o número aparece no acerto."}
      fonte={`${FONTE_MNIST}. Acurácia = acertos ÷ 60.000. Modelo trivial: prevê sempre a classe negativa; com outro algarismo positivo, acerta 1 − (imagens do algarismo ÷ 60.000).`}>
      <Painel titulo={`${int(N)} imagens de treino · cada marca é 1% delas`} className="q12-s10-esq">
        <div className="q12-s10-vis">
          <Marcas tipos={tipos} rotulo={`${mPos} de cada 100 imagens são ${dig}${ok ? ", e o modelo que nunca diz " + dig + " erra todas elas" : ""}`} />
          <div className="q12-s10-lado">
            <ul className="q7-leg q12-s10-leg">
              <li><span className="q12-s10-mk" data-t={ok ? "fn" : "pos"} aria-hidden="true" />{dig}{ok ? ": o trivial erra todos" : ""} ({pct(pos / N, 1)})</li>
              <li><span className="q12-s10-mk" data-t={ok ? "vn" : "neg"} aria-hidden="true" />não {dig}{ok ? ": acerta todos" : ""} ({pct(1 - pos / N, 1)})</li>
            </ul>
            <Kpi rotulo="Detector SGD (só para o 5)" valor={pct(M_SGD.acuracia, 1)} detalhe={`${int(M_SGD.vp + M_SGD.vn)} acertos em ${int(N)}`} tom="prob" tam="grande" />
            <Kpi rotulo={`Modelo que nunca diz ${dig}`} valor={ok ? pct(acc, 1) : "?"} detalhe={ok ? `${int(N - pos)} acertos em ${int(N)}` : "aparece no acerto"} tam="grande" />
          </div>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={<>São {int(M_SGD.positivos)} cincos em {int(N)} imagens. Quanto acerta um modelo que <b>nunca</b> diz 5?</>} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setDig(5); }} recolher />
        {ok && (
          <div className="q12-s10-dig">
            <p className="q7-k">Outro algarismo como positivo</p>
            <Seg rotulo="Algarismo tomado como classe positiva" opcoes={CONTAGEM_DIGITOS.map((_, d) => ({ v: d, r: String(d) }))} valor={dig} onChange={setDig} cor />
            <p className="q7-p">Para qualquer algarismo, o trivial acerta entre <b>{pct(MIN, 1)}</b> e <b>{pct(MAX, 1)}</b>: cerca de 90% sem informação nenhuma.</p>
            <div className="q7-botoes"><Botao sec onClick={restaurar}>Restaurar</Botao></div>
          </div>
        )}
      </Painel>
    </Quadro>
  );
}
