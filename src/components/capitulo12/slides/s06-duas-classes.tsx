"use client";
import { useState } from "react";
import { Botao, Kpi, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Codigo, Figura } from "../pecas";
import { CONTAGEM_DIGITOS, MN } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 06 · c12p6 · De dez classes para duas: y_binary = (y_digits == 5). Prova que o rótulo binário separa uma classe
 * positiva (True) dos outros nove algarismos (False) e que, contra os outros nove, qualquer algarismo é raro (cerca
 * de um décimo do treino). O aluno escolhe o algarismo positivo na própria barra das 60.000 imagens de treino
 * (um segmento por algarismo, largura pela contagem; os segmentos são um seletor): o código, o destaque e a
 * prevalência respondem. Números: CONTAGEM_DIGITOS (bincount
 * dos rótulos do treino em base.json) e MN.nTreino. Figura original: Géron, cap. 3. Estado inicial: o 5 (5.421 de
 * 60.000, 9,0%); Restaurar volta a ele.
 */
const N = MN.nTreino;
const soma = CONTAGEM_DIGITOS.reduce((a, b) => a + b, 0);
if (soma !== N) throw new Error("s06: a contagem por algarismo deveria somar o treino");
const PREV = CONTAGEM_DIGITOS.map((c) => c / N);
const PMIN = Math.min(...PREV), PMAX = Math.max(...PREV);
const RARO = PREV.indexOf(PMIN);
/** Início de cada algarismo na barra, em imagens acumuladas. */
const INICIO = CONTAGEM_DIGITOS.map((_, d) => CONTAGEM_DIGITOS.slice(0, d).reduce((a, b) => a + b, 0));
if (RARO !== 5) throw new Error("s06: a leitura supõe que o 5 é o algarismo mais raro do treino");

export function S06DuasClasses({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(5);
  const c = CONTAGEM_DIGITOS[k];
  const cod = [`y_binary = (y_digits == ${k})`, `y_binary[:${N}].sum()  # ${c} no treino`];
  return (
    <Quadro slug="c12p6" pagina={pagina} layout="gl"
      conclusao={<>Com o {k} como positivo, <b>{int(c)} de {int(N)}</b> imagens de treino são True ({pct(c / N, 1)}). Contra os outros nove, todo algarismo fica perto de um em dez ({pct(PMIN, 1)} a {pct(PMAX, 1)}): a classe positiva é <b>rara</b>, e o slide {SLIDE.c12p10.n} mostra o que isso faz com a acurácia.</>}
      fonte={`MNIST (OpenML mnist_784, versão 1): as ${int(N)} primeiras imagens são o treino; contagem de cada algarismo nos rótulos do treino (np.bincount). O 5 é o mais raro: ${int(CONTAGEM_DIGITOS[RARO])} imagens.`}>
      <Painel className="q12-s06-esq">
        <Codigo linhas={cod} destaque={[0]} rotulo={`Código: rótulo binário, True quando o algarismo é ${k}`} />
        <div className="q12-lin q12-s06-sel">
          <p className="q7-k">Treino por algarismo: clique no positivo</p>
          <Botao sec onClick={() => setK(5)} desab={k === 5}>Restaurar</Botao>
        </div>
        <div className="q12-s06-barra" role="group" aria-label="Algarismo positivo: cada segmento é um algarismo, com largura proporcional à sua contagem no treino">
          {CONTAGEM_DIGITOS.map((n, d) => {
            const ini = INICIO[d];
            return <button key={d} type="button" aria-pressed={d === k} aria-label={`${d}: ${n} imagens`} onClick={() => setK(d)} style={{ left: `${(ini / N) * 100}%`, width: `${(n / N) * 100}%` }}><b>{d}</b></button>;
          })}
        </div>
        <div className="q12-s06-leg" aria-hidden="true">
          <span data-pos="1">■ True: o {k}, {int(c)}</span>
          <span>□ False: os outros nove, {int(N - c)}</span>
        </div>
        <div className="q12-s06-baixo">
          <div className="q7-kpis">
            <Kpi rotulo="Positivos no treino" valor={int(c)} detalhe={`de ${int(N)} imagens`} tom="prob" />
            <Kpi rotulo="Prevalência" valor={pct(c / N, 1)} detalhe="fração de True" tom="prob" />
          </div>
          <ul className="q12-s06-bul">
            <li><b>True</b> é o {k}: a classe positiva.</li>
            <li><b>False</b> são os outros nove algarismos.</li>
            <li>No crédito, True seria o mau pagador (slide {SLIDE.c12p3.n}).</li>
          </ul>
        </div>
      </Painel>
      <Figura src="mnist-rotulos" className="q12-s06-fig" alt="Vinte imagens do MNIST em quatro linhas, cada uma com o rótulo acima, como label = 5, label = 0, label = 4" credito="As primeiras imagens do treino com o rótulo de cada uma. Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 3" />
    </Quadro>
  );
}
