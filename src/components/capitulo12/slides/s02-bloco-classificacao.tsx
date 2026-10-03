"use client";
import { useState } from "react";
import { Painel, Seg, type Pagina } from "@/components/capitulo7/base";
import { AberturaBloco, Digito } from "../pecas";
import { EXEMPLOS } from "@/lib/capitulo12/dados";
import { pixels } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { num } from "@/lib/capitulo7/formato";

/**
 * 02 · c12p2 · Abertura do bloco 1 (Classificação). As quatro perguntas com a deste bloco em destaque; ao centro, a
 * função que o bloco ensina a aprender: uma imagem entra (28 × 28 pixels, nove números do vetor de 784 à vista, a partir
 * do primeiro pixel aceso), o classificador devolve um rótulo. O seletor troca a imagem entre seis da amostra gravada pela referência
 * (três 5 e três que não são 5), com o rótulo verdadeiro: o modelo ainda não existe, e por isso a saída é "?" até o
 * slide 8. Embaixo, o fluxo do bloco com os links para cada passo.
 */
const AMOSTRA = [EXEMPLOS[0], ...EXEMPLOS.filter((e) => e.tipo === "amostra" && e.rotulo === 5).slice(0, 2), ...EXEMPLOS.filter((e) => e.tipo === "amostra" && e.rotulo !== 5).slice(0, 3)];

export function S02BlocoClassificacao({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(0);
  const e = AMOSTRA[k];
  const v = pixels(e.px);
  const ini = Math.max(0, v.findIndex((p) => p > 0) - 2);
  const primeiros = v.slice(ini, ini + 9);
  return (
    <AberturaBloco slug="c12p2" pagina={pagina}
      conclusao={<>Uma imagem entra e um rótulo sai: o bloco monta os dados, define o rótulo binário, separa treino e teste e chega ao primeiro classificador no slide {SLIDE.c12p8.n}.</>}
      extra={
        <Painel className="q12-s02">
          <div className="q12-s02-ent">
            <Digito px={e.px} rotulo={`Imagem de entrada: um algarismo ${e.rotulo} escrito à mão, 28 por 28 pixels`} />
            <Seg rotulo="Escolha a imagem" opcoes={AMOSTRA.map((_, i) => ({ v: i, r: String(i + 1) }))} valor={k} onChange={setK} />
          </div>
          <div className="q12-s02-vet">
            <p className="q7-k">Entra: 784 números, de 0 a 255</p>
            <p className="q12-s02-nums" aria-label={`Nove pixels a partir do pixel ${ini + 1}, perto do primeiro aceso`}>x = (… {primeiros.map((p) => num(p, 0)).join(", ")} …)</p>
          </div>
          <span className="q12-s02-seta" aria-hidden="true">→</span>
          <div className="q12-s02-f"><b>f(x)</b><span>classificador</span></div>
          <span className="q12-s02-seta" aria-hidden="true">→</span>
          <div className="q12-s02-sai">
            <p className="q7-k">Sai: um rótulo</p>
            <p className="q12-s02-rot">5 ou não 5?</p>
            <p className="q7-nota">Verdade: é <b>{e.rotulo}</b>. O modelo que responde chega no slide {SLIDE.c12p8.n}.</p>
          </div>
        </Painel>
      } />
  );
}
