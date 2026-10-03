"use client";
import { useState } from "react";
import { Botao, Kpi, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Digito, Figura } from "../pecas";
import { PixelAlvo } from "../b1";
import { EXEMPLOS, MN } from "@/lib/capitulo12/dados";
import { pixels } from "@/lib/capitulo12/metricas";
import { pixelCentral, posicao } from "@/lib/capitulo12/b1";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int } from "@/lib/capitulo7/formato";

/**
 * 04 · c12p4 · O MNIST: 70.000 imagens de 28 × 28 = 784 pixels, cada uma com o rótulo do algarismo. Prova que a mesma
 * classe aparece com escritas diferentes: o aluno clica num pixel (ou o move com as setas) e vê linha, coluna, índice
 * no vetor de 784 e intensidade; ao trocar entre sete imagens de 5 (a primeira do treino e as seis de 5 da amostra
 * gravada pela referência), o mesmo pixel muda de valor e o rótulo não. Números: MN (n, pixels, lado) e os pixels de
 * EXEMPLOS em base.json. A figura original (Géron, cap. 3) fica à esquerda. Estado inicial: primeira imagem do treino,
 * pixel mais intenso da região central; Restaurar volta a ele.
 */
const CINCOS = [EXEMPLOS[0], ...EXEMPLOS.filter((e) => e.tipo === "amostra" && e.rotulo === 5)];
if (CINCOS.some((e) => e.rotulo !== 5)) throw new Error("s04: as imagens do seletor deveriam ser todas 5");
if (MN.lado * MN.lado !== MN.pixels) throw new Error("s04: 28 × 28 deveria ser 784");
const VALORES = CINCOS.map((e) => pixels(e.px));
const P0 = pixelCentral(CINCOS[0].px);

export function S04Mnist({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(0);
  const [p, setP] = useState(P0);
  const e = CINCOS[k];
  const { lin, col } = posicao(p);
  const v = VALORES[k][p];
  const nesse = VALORES.map((x) => x[p]);
  const acesos = nesse.filter((x) => x > 0).length;
  const lo = Math.min(...nesse), hi = Math.max(...nesse);
  const inicial = k === 0 && p === P0;
  return (
    <Quadro slug="c12p4" pagina={pagina} layout="um"
      conclusao={<>As {CINCOS.length} imagens têm o mesmo rótulo <b>5</b>, e o pixel da linha {lin}, coluna {col} vai de <b>{int(lo)} a {int(hi)}</b> entre elas: a escrita varia, o rótulo permanece. O modelo precisa generalizar para escritas que não viu; o slide {SLIDE.c12p5.n} empilha as {int(MN.n)} imagens numa matriz.</>}
      fonte={`MNIST (OpenML mnist_784, versão 1): ${int(MN.n)} imagens de ${MN.lado} × ${MN.lado} pixels, intensidade de 0 (fundo) a 255 (traço). Imagens de 5: a primeira do treino e as seis de 5 de uma amostra de doze sorteada com semente 12 entre as 3.000 primeiras de cada classe.`}>
      <div className="q12-s04">
        <Figura src="mnist-amostra" className="q12-s04-fig" alt="Grade com dez exemplos de cada algarismo do MNIST, de 0 a 9, escritos à mão por pessoas diferentes" credito="Alguns dígitos do MNIST. Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 3" />
        <Painel className="q12-s04-dig" titulo="Clique num pixel (ou use as setas)">
          <PixelAlvo px={e.px} sel={p} onSel={setP} rotulo={`Imagem ${e.i} do treino, um 5 escrito à mão, com a grade de ${MN.pixels} pixels`} />
          <p className="q12-s04-rot">rótulo: <b>5</b> · imagem {int(e.i)} do treino</p>
        </Painel>
        <Painel className="q12-s04-lado">
          <div className="q7-kpis">
            <Kpi tam="mini" rotulo="Imagens" valor={int(MN.n)} detalhe="algarismos de 0 a 9" />
            <Kpi tam="mini" rotulo="Características" valor={int(MN.pixels)} detalhe={`${MN.lado} × ${MN.lado} pixels`} />
          </div>
          <dl className="q12-s04-px" aria-live="polite">
            <div><dt>Linha</dt><dd>{lin}</dd></div>
            <div><dt>Coluna</dt><dd>{col}</dd></div>
            <div><dt>Índice</dt><dd>{lin} × {MN.lado} + {col} = <b>{int(p)}</b></dd></div>
            <div><dt>Intensidade</dt><dd><b>{int(v)}</b> <span className="q12-s04-cinza" style={{ background: `rgba(0,32,91,${v / 255})` }} aria-hidden="true" /> de 0 a 255</dd></div>
          </dl>
          <div className="q12-s04-esc">
            <p className="q7-k">Mesmo rótulo, escritas diferentes</p>
            <div className="q12-s04-mini" role="group" aria-label="Escolha uma das imagens de 5">
              {CINCOS.map((c, i) => (
                <button key={c.i} type="button" aria-pressed={i === k} onClick={() => setK(i)} aria-label={`Imagem ${c.i} do treino, um 5; neste pixel vale ${VALORES[i][p]}`}>
                  <Digito px={c.px} marca={p} rotulo={`Um 5 escrito à mão, imagem ${c.i} do treino`} />
                  <span>{int(VALORES[i][p])}</span>
                </button>
              ))}
            </div>
            <p className="q7-nota">Neste pixel, {acesos} das {CINCOS.length} imagens de 5 têm traço (valor acima de 0).</p>
          </div>
          <div className="q7-botoes"><Botao sec onClick={() => { setK(0); setP(P0); }} desab={inicial}>Restaurar</Botao></div>
        </Painel>
      </div>
    </Quadro>
  );
}
