"use client";
import { useState } from "react";
import { Botao, LinkSlide, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Figura } from "../pecas";
import { BVS } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { num } from "@/lib/capitulo7/formato";

/**
 * 51 · c12p51 · Apêndice: volume e taxa de maus por safra no exemplo de sobreajuste (alta renda, BVS). A figura
 * original fica em destaque desde o início; o seletor escolhe a metade a ler (volume por faixa de score ou taxa de
 * maus por faixa), com uma leitura descritiva e cautelosa do que a figura mostra (a figura não traz tabela: nenhum
 * valor por safra é citado). Links de volta para os slides 43 e 44. Único número do caso: as AUC do exemplo (b4.ts).
 * Estado inicial: taxa de maus; "Restaurar" volta a ela.
 */
type Metade = "taxa" | "volume";
const LEITURA: Record<Metade, { t: string; p: React.ReactNode }> = {
  taxa: { t: "À direita: taxa de maus por faixa", p: <>Antes da linha azul, as faixas ficam bem separadas. Perto dela, as faixas de menor risco sobem (a subida começa na safra anterior à linha) e a pior cai: <b>as taxas se aproximam</b>. É o achatamento do slide {SLIDE.c12p43.n}, safra a safra.</> },
  volume: { t: "À esquerda: volume por faixa de score", p: <>Contratos por safra, empilhados por faixa (0 é a melhor, 5 a pior). O volume total cresce no meio do período e segue alto depois da linha: a carteira mudou de tamanho, e a figura sozinha não diz se mudou de perfil.</> },
};

export function S51ApendiceSafras({ pagina }: { pagina?: Pagina }) {
  const [m, setM] = useState<Metade>("taxa");
  return (
    <Quadro slug="c12p51" pagina={pagina} layout="um"
      conclusao={<>Fora do tempo, as faixas se aproximam e a AUC do exemplo cai de {num(BVS.treino, 3)} para {num(BVS.validacao, 3)}. Subida que começa antes da linha também é compatível com mudança na população (slide {SLIDE.c12p44.n}).</>}
      fonte="Caso de crédito do material da aula: exemplo de alta renda (BVS), figura original por safra de concessão, de dezembro de 2018 a outubro de 2019; a linha azul tracejada delimita o período fora do tempo. Leitura descritiva da figura, sem os valores que a geraram.">
      <div className="q12-s51">
        <Painel className="q12-s51-fig">
          <Figura src="bvs-safras" alt="Exemplo de alta renda (BVS), por safra de dezembro de 2018 a outubro de 2019, com uma linha azul tracejada em agosto de 2019 que delimita o período fora do tempo. À esquerda, área empilhada do volume de contratos por faixa de score de 0 a 5; o total cresce de maio a julho e segue alto. À direita, taxa de maus de cada faixa por safra: antes da linha, as faixas ficam separadas; perto dela, as faixas 0, 1 e 2 sobem, já a partir de julho, e a faixa 5 cai em agosto, e as linhas se aproximam." credito="Caso de crédito do material da aula: exemplo de alta renda (BVS), volume e taxa de maus por safra." />
        </Painel>
        <Painel tom="suave" className="q12-s51-lei">
          <div className="q12-s51-ctl">
            <Seg rotulo="Metade da figura" opcoes={[{ v: "taxa" as Metade, r: "Taxa de maus" }, { v: "volume" as Metade, r: "Volume" }]} valor={m} onChange={setM} />
            <Botao sec onClick={() => setM("taxa")} desab={m === "taxa"}>Restaurar</Botao>
          </div>
          <div className="q12-s51-txt" aria-live="polite">
            <p className="q7-k">{LEITURA[m].t}</p>
            <p className="q7-p">{LEITURA[m].p}</p>
          </div>
          <p className="q7-nota q12-s51-links">Volte ao <LinkSlide slug="c12p43">slide {SLIDE.c12p43.n}</LinkSlide> (as faixas se aproximam) ou ao <LinkSlide slug="c12p44">slide {SLIDE.c12p44.n}</LinkSlide> (sobreajuste ou população?).</p>
        </Painel>
      </div>
    </Quadro>
  );
}
