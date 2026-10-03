"use client";
import { useState } from "react";
import { Botao, Kpi, Painel, Previsao, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { Figura } from "../pecas";
import { BVS } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 43 · c12p43 · Sobreajuste: fora do tempo, as faixas se aproximam. A figura original do exemplo de alta renda (BVS:
 * curva ROC e taxa de maus por faixa de score, treino contra validação) fica à vista desde o início. A turma prevê
 * como seria a taxa de maus por faixa se o score ainda ordenasse bem; no acerto, abrem a leitura da aula (escolhida
 * por metade da figura) e as AUC do exemplo (CASO.auc via b4.ts: 0,832 no treino, 0,645 na validação). A figura não
 * traz tabela: a leitura é qualitativa e não cita taxas por faixa. Estado inicial: previsão em aberto; "Restaurar".
 */
type Metade = "faixas" | "roc";
const OPS = [
  { texto: "Uma escada íngreme, como no treino: a taxa sobe muito da melhor para a pior faixa", certa: true, retorno: <>Isso: ordenar bem é separar as faixas. Agora compare com as barras verdes da figura.</> },
  { texto: "Todas as faixas com a mesma taxa de maus", certa: false, retorno: <>Faixas iguais seriam um score que <b>não ordena</b> nada (AUC de 0,5). Confunde ordenar bem com ser estável.</> },
  { texto: "A mesma escada do treino, com todas as taxas mais baixas", certa: false, retorno: <>A ordenação está na <b>inclinação</b> da escada, não na altura. Confunde ordenação com o nível das taxas.</> },
];
const LEITURA: Record<Metade, React.ReactNode> = {
  faixas: <>No treino (azul), a taxa de maus sobe de forma acentuada da melhor para a pior faixa. Na validação (verde), as faixas boas sobem e a pior desce: <b>a escada achata</b>.</>,
  roc: <>A curva de treino (azul) fica bem acima da de validação (laranja), que se aproxima da diagonal do acaso: <b>o score perde capacidade de ordenar</b>.</>,
};

export function S43Sobreajuste({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [metade, setMetade] = useState<Metade>("faixas");
  const liberado = esc !== null && OPS[esc].certa;
  return (
    <Quadro slug="c12p43" pagina={pagina} layout="gl"
      conclusao={liberado ? <>No treino a escada é íngreme; na validação ela achata, e a AUC cai de <b>{num(BVS.treino, 3)} para {num(BVS.validacao, 3)}</b> ({pct(BVS.variacao, 1)}). O slide {SLIDE.c12p44.n} pergunta se isso é sobreajuste ou mudança na população.</>
        : <>Antes de ler a figura: o que seria ordenar bem na validação?</>}
      fonte="Caso de crédito do material da aula: exemplo de alta renda (BVS), figura original com a curva ROC e a taxa de maus por faixa de score (0 é a melhor, 5 a pior), treino contra validação fora do tempo; AUC conforme a figura.">
      <Painel className="q12-s43-fig">
        <Figura src="bvs-roc-faixas" alt={`Exemplo de alta renda (BVS). À esquerda, curvas ROC: a de treino, com AUC de ${num(BVS.treino, 3)}, fica bem acima da de validação, com AUC de ${num(BVS.validacao, 3)}, que se aproxima da diagonal. À direita, taxa de maus por faixa de score de 0 a 5: no treino, as barras sobem de quase zero na faixa 0 até a mais alta na faixa 5; na validação, as faixas boas têm taxas maiores e a pior, menor, e a subida é mais suave.`} credito="Caso de crédito do material da aula: exemplo de alta renda (BVS), treino contra validação." />
      </Painel>
      <Painel>
        <Previsao pergunta="Se o score ainda ordenasse bem na validação, como seria a taxa de maus por faixa?" opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); setMetade("faixas"); }} recolher />
        {liberado && (
          <>
            <div className="q7-kpis">
              <Kpi tam="mini" rotulo="AUC no treino" valor={num(BVS.treino, 3)} />
              <Kpi tam="mini" rotulo="AUC na validação" valor={num(BVS.validacao, 3)} tom="val" />
            </div>
            <div className="q12-s43-ctl">
              <Seg rotulo="Metade da figura" opcoes={[{ v: "faixas" as Metade, r: "Taxa por faixa" }, { v: "roc" as Metade, r: "Curva ROC" }]} valor={metade} onChange={setMetade} />
              <Botao sec onClick={() => { setEsc(null); setMetade("faixas"); }}>Restaurar</Botao>
            </div>
            <p className="q7-p q12-s43-lei">{LEITURA[metade]}</p>
          </>
        )}
        {!liberado && <div className="q7-botoes q12-s43-bot"><Botao sec onClick={() => { setEsc(null); setMetade("faixas"); }} desab={esc === null}>Restaurar</Botao></div>}
      </Painel>
    </Quadro>
  );
}
