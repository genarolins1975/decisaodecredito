"use client";
import { useState } from "react";
import { Botao, Controle, Painel, type Pagina } from "@/components/capitulo7/base";
import { AberturaBloco } from "../pecas";
import { HistScores, sc } from "../b2";
import { HIST, INDICE_ZERO, M_SGD } from "@/lib/capitulo12/dados";
import { confusaoNoIndice } from "@/lib/capitulo12/metricas";
import { agruparHist } from "@/lib/capitulo12/b2";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int } from "@/lib/capitulo7/formato";

/**
 * 09 · c12p9 · Abertura do bloco 2 (Desempenho). As quatro perguntas com a deste bloco em destaque; ao centro, o objeto
 * que o bloco inteiro lê: o histograma dos scores do detector de 5 na validação cruzada em três partes (HIST em
 * dados.ts, 601 faixas finas agrupadas em 40 faixas de 2.250 pontos de score entre −60.000 e 30.000; as caudas somam
 * nas pontas), os 5 em barras petróleo hachuradas, os não 5 em barras azuis cheias, cada classe na sua fração, e o
 * limiar 0 em âmbar. O controle move o limiar pelas bordas do histograma (as contagens são exatas nas bordas) e
 * antecipa o slide 18; à direita, quantos 5 e quantos não 5 ficam acima do limiar. No limiar 0, a matriz do slide 11.
 * Estado inicial: limiar 0. "Restaurar" volta a ele.
 */
const BARRAS = agruparHist(HIST, -60000, 30000, 2250);
const I_MIN = HIST.bordas.findIndex((b) => b >= -20000), I_MAX = HIST.bordas.findIndex((b) => b >= 15000);
{
  const c0 = confusaoNoIndice(HIST, INDICE_ZERO);
  if (HIST.bordas[INDICE_ZERO] !== 0 || c0.vp !== M_SGD.vp || c0.fp !== M_SGD.fp) throw new Error("s09: o limiar 0 do histograma não reproduz a matriz");
}

export function S09BlocoDesempenho({ pagina }: { pagina?: Pagina }) {
  const [i, setI] = useState(INDICE_ZERO);
  const c = confusaoNoIndice(HIST, i), t = HIST.bordas[i], zero = i === INDICE_ZERO;
  return (
    <AberturaBloco slug="c12p9" pagina={pagina}
      conclusao={<>Dois erros, um limiar: no limiar 0, o detector deixa <b>{int(M_SGD.fn)} cincos</b> abaixo da linha e põe <b>{int(M_SGD.fp)} não 5</b> acima dela. O bloco mede esses erros a partir da acurácia (slide {SLIDE.c12p10.n}) e termina na AUC (slide {SLIDE.c12p21.n}).</>}
      extra={
        <Painel className="q12-s09">
          <div className="q12-s09-g">
            <HistScores barras={BARRAS} limiar={t} nPos={M_SGD.positivos} nNeg={M_SGD.negativos} rotLimiar={zero ? "limiar 0" : `limiar ${sc(t)}`}
              rotulo={`Histograma dos scores do detector: os 5 concentram-se acima de zero e os não 5 abaixo; limiar em ${sc(t)}`} arCelular="16 / 9" />
          </div>
          <div className="q12-s09-lado">
            <Controle rotulo="Limiar do score" valor={i} min={I_MIN} max={I_MAX} passo={1} onChange={setI} mostrar={sc(t)} />
            <dl className="q12-s09-n">
              <div data-c="pos"><dt>5 acima do limiar</dt><dd>{int(c.vp)} <small>de {int(M_SGD.positivos)}</small></dd></div>
              <div data-c="fp"><dt>não 5 acima: alarme falso</dt><dd>{int(c.fp)} <small>de {int(M_SGD.negativos)}</small></dd></div>
              <div data-c="fn"><dt>5 abaixo: cincos perdidos</dt><dd>{int(c.fn)}</dd></div>
            </dl>
            <Botao sec onClick={() => setI(INDICE_ZERO)} desab={zero}>Restaurar limiar 0</Botao>
          </div>
        </Painel>
      } />
  );
}
