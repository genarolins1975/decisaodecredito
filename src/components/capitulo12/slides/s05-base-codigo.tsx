"use client";
import { useState } from "react";
import { Botao, Grafico, Painel, Quadro, Seg, type Dim, type Pagina } from "@/components/capitulo7/base";
import { Codigo } from "../pecas";
import { PixelAlvo } from "../b1";
import { EXEMPLOS, MN } from "@/lib/capitulo12/dados";
import { pixels } from "@/lib/capitulo12/metricas";
import { pixelCentral, posicao } from "@/lib/capitulo12/b1";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int } from "@/lib/capitulo7/formato";

/**
 * 05 · c12p5 · A base em código: X tem 70.000 linhas (imagens) e 784 colunas (pixels); y tem um rótulo por linha.
 * Prova o reshape: a linha escolhida de X aparece como uma faixa de 784 números (28 blocos de 28) e, dobrada em
 * 28 × 28, volta a ser a imagem, com y ao lado. O seletor de leitura acende no diagrama e no código a parte
 * correspondente (uma linha, uma coluna, o vetor y) e muda a última linha do código. Números: MN (n, pixels, lado) e
 * os pixels e rótulos de EXEMPLOS (índices do treino, que são as primeiras 60.000 linhas de X). Estado inicial: linha
 * 0 (a primeira imagem, um 5), leitura "linha = imagem"; Restaurar volta a ele.
 */
type Modo = "linha" | "coluna" | "y";
const LINHAS = [EXEMPLOS[0], ...[4, 8, 1, 9].map((d) => EXEMPLOS.find((e) => e.tipo === "amostra" && e.rotulo === d)!)];
if (LINHAS.some((e) => !e)) throw new Error("s05: faltou um exemplo da amostra");
if (MN.lado * MN.lado !== MN.pixels) throw new Error("s05: 28 × 28 deveria ser 784");
const COL = pixelCentral(EXEMPLOS[0].px);
const PC = posicao(COL);
const BASE = [
  "import numpy as np",
  "from sklearn.datasets import fetch_openml",
  "",
  'mnist = fetch_openml("mnist_784", version=1,',
  "                     as_frame=False)",
  'X_digits = mnist["data"]',
  'y_digits = mnist["target"].astype(np.uint8)',
  `X_digits.shape  # (${MN.n}, ${MN.pixels})`,
  `y_digits.shape  # (${MN.n},)`,
  "",
];
const DESTAQUE: Record<Modo, number[]> = { linha: [5, 7, 10], coluna: [5, 7, 10], y: [6, 8, 10] };

function Diagrama({ modo, i, px, d }: { modo: Modo; i: number; px: number[]; d: Dim }) {
  const fs = d.fs;
  const m = { l: fs * 2.2, r: fs * 5.6, t: fs * 2.2 };
  const faixaH = fs * 1.5, faixaY = d.h - faixaH - fs * 0.2, faixaT = faixaY - fs * 0.55;
  const yW = fs * 1.6, gap = fs * 1.1;
  const x0 = m.l, y0 = m.t, Wm = d.w - m.l - m.r - gap - yW, Hm = Math.max(fs * 4, faixaT - fs * 2.6 - y0);
  const xY = x0 + Wm + gap;
  const rowY = y0 + (i / MN.n) * Hm, bandaH = Math.max(fs * 0.45, 4);
  const colX = x0 + (COL / MN.pixels) * Wm, bandaW = Math.max(fs * 0.4, 4);
  const Ws = xY + yW - x0, cel = Ws / MN.pixels;
  const on = (k: Modo) => (modo === k ? 1 : 0.35);
  return (
    <g>
      {/* matriz X */}
      <text className="q7-eixo-t" x={x0 + Wm / 2} y={y0 - fs * 0.5} textAnchor="middle">X: {int(MN.pixels)} colunas</text>
      <text className="q7-eixo-t" transform={`translate(${x0 - fs * 0.6} ${y0 + Hm / 2}) rotate(-90)`} textAnchor="middle">{int(MN.n)} linhas</text>
      <rect x={x0} y={y0} width={Wm} height={Hm} fill="#EFF3FA" stroke="#3D5A8A" strokeWidth={1.5} />
      {Array.from({ length: 9 }, (_, k) => <line key={`h${k}`} x1={x0} x2={x0 + Wm} y1={y0 + ((k + 1) * Hm) / 10} y2={y0 + ((k + 1) * Hm) / 10} stroke="#D5DCE8" strokeWidth={1} />)}
      {Array.from({ length: 13 }, (_, k) => <line key={`v${k}`} y1={y0} y2={y0 + Hm} x1={x0 + ((k + 1) * Wm) / 14} x2={x0 + ((k + 1) * Wm) / 14} stroke="#D5DCE8" strokeWidth={1} />)}
      {/* linha escolhida */}
      <g opacity={on("linha") === 1 || modo === "y" ? 1 : 0.35}>
        <rect x={x0} y={rowY - bandaH / 2} width={Wm} height={bandaH} fill="#C9A84C" stroke="#00205B" strokeWidth={1} opacity={modo === "y" ? 0.35 : 1} />
        <text className="q7-rot--peq" x={x0 + fs * 0.3} y={rowY + bandaH / 2 + fs * 1.05} style={{ fill: "#00205B", fontWeight: 700 }}>linha {int(i)}</text>
      </g>
      {/* coluna escolhida */}
      <g opacity={on("coluna")}>
        <rect x={colX - bandaW / 2} y={y0} width={bandaW} height={Hm} fill="#C9A84C" stroke="#00205B" strokeWidth={1} />
        {modo === "coluna" && <text className="q7-rot--peq" x={colX + bandaW} y={y0 + Hm - fs * 0.4} dx=".3em" style={{ fill: "#00205B", fontWeight: 700 }}>coluna {int(COL)}</text>}
      </g>
      {/* vetor y */}
      <text className="q7-eixo-t" x={xY + yW / 2} y={y0 - fs * 0.5} textAnchor="middle">y</text>
      <rect x={xY} y={y0} width={yW} height={Hm} fill={modo === "y" ? "#EFF3FA" : "#fff"} stroke={modo === "y" ? "#00205B" : "#9AA1AD"} strokeWidth={modo === "y" ? 2.5 : 1.5} />
      <rect x={xY} y={rowY - bandaH / 2} width={yW} height={bandaH} fill="#C9A84C" stroke="#00205B" strokeWidth={1} opacity={modo === "coluna" ? 0.35 : 1} />
      <text className="q7-rot" x={xY + yW + fs * 0.4} y={rowY} dy=".35em" opacity={modo === "coluna" ? 0.35 : 1} style={{ fill: "#00205B" }}>y = {LINHAS.find((e) => e.i === i)!.rotulo}</text>
      <text className="q7-rot--peq" x={xY + yW + fs * 0.4} y={y0 + Hm} dy="-.2em" style={{ fill: "#5B6475" }}>{int(MN.n)} rótulos</text>
      {/* da linha à faixa: a linha de X ampliada */}
      <path d={`M${x0} ${rowY + bandaH / 2}L${x0} ${faixaY}M${x0 + Wm} ${rowY + bandaH / 2}L${x0 + Ws} ${faixaY}`} stroke="#9AA1AD" strokeWidth={1.2} strokeDasharray="4 4" fill="none" opacity={modo === "y" ? 0.35 : 1} />
      <text className="q7-rot--peq" x={x0 + Ws / 2} y={faixaT} textAnchor="middle" style={{ fill: "#2A3342", paintOrder: "stroke", stroke: "#fff", strokeWidth: fs * 0.3 }}>linha {int(i)} de X: {int(MN.pixels)} números em fila, {MN.lado} blocos de {MN.lado}</text>
      <rect x={x0} y={faixaY} width={Ws} height={faixaH} fill="#fff" stroke="#9AA1AD" strokeWidth={1} />
      {px.map((v, j) => (v > 0 ? <rect key={j} x={x0 + j * cel} y={faixaY} width={cel + 0.4} height={faixaH} fill={`rgba(0,32,91,${(v / 255).toFixed(3)})`} /> : null))}
      {Array.from({ length: MN.lado - 1 }, (_, k) => <line key={`b${k}`} x1={x0 + (k + 1) * MN.lado * cel} x2={x0 + (k + 1) * MN.lado * cel} y1={faixaY + faixaH * 0.6} y2={faixaY + faixaH} stroke="#9AA1AD" strokeWidth={1} />)}
      {modo === "coluna" && <rect x={x0 + COL * cel - fs * 0.25} y={faixaY - fs * 0.15} width={cel + fs * 0.5} height={faixaH + fs * 0.3} fill="none" stroke="#C9A84C" strokeWidth={fs * 0.18} />}
    </g>
  );
}

export function S05BaseCodigo({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("linha");
  const [k, setK] = useState(0);
  const e = LINHAS[k];
  const px = pixels(e.px);
  const extra = modo === "linha" ? `X_digits[${e.i}].reshape(${MN.lado}, ${MN.lado})  # a imagem`
    : modo === "coluna" ? `X_digits[:, ${COL}]  # o pixel ${COL} em todas as imagens` : `y_digits[${e.i}]  # ${e.rotulo}`;
  const inicial = modo === "linha" && k === 0;
  return (
    <Quadro slug="c12p5" pagina={pagina} layout="qd"
      conclusao={<>X tem <b>{int(MN.n)} linhas e {int(MN.pixels)} colunas</b>: cada linha é uma imagem desdobrada em {int(MN.pixels)} números, que reshape({MN.lado}, {MN.lado}) dobra de volta; y guarda um rótulo por linha, na mesma ordem. O slide {SLIDE.c12p6.n} reduz y a 5 ou não 5.</>}
      fonte={`MNIST (OpenML mnist_784, versão 1), carregado com fetch_openml como na aula. Linhas mostradas: a primeira do treino e quatro da amostra gravada pela referência (índices de X); coluna realçada: o pixel ${int(COL)} (linha ${PC.lin}, coluna ${PC.col} da imagem).`}>
      <div className="q12-col q12-s05-esq">
        <Codigo linhas={[...BASE, extra]} destaque={DESTAQUE[modo]} rotulo="Código: carregar o MNIST, separar X e y e conferir os formatos" />
        <Painel className="q12-s05-ctl">
          <p className="q7-k">Leia o diagrama por</p>
          <Seg rotulo="Parte da base em destaque" opcoes={[{ v: "linha" as Modo, r: "Linha = imagem" }, { v: "coluna" as Modo, r: "Coluna = pixel" }, { v: "y" as Modo, r: "y = rótulos" }]} valor={modo} onChange={setModo} />
          <p className="q7-k">Escolha a linha de X</p>
          <div className="q12-lin q12-s05-lin">
            <Seg rotulo="Linha de X" opcoes={LINHAS.map((x, j) => ({ v: j, r: int(x.i) }))} valor={k} onChange={setK} />
            <Botao sec onClick={() => { setModo("linha"); setK(0); }} desab={inicial}>Restaurar</Botao>
          </div>
        </Painel>
      </div>
      <Painel className="q12-s05-dir">
        <Grafico rotulo={`Diagrama: a matriz X com ${MN.n} linhas e ${MN.pixels} colunas, o vetor y com ${MN.n} rótulos, e a linha ${e.i} de X desdobrada em ${MN.pixels} números`}>
          {(d) => <Diagrama modo={modo} i={e.i} px={px} d={d} />}
        </Grafico>
        <div className="q12-s05-dobra">
          <span className="q12-s05-op">reshape({MN.lado}, {MN.lado}) →</span>
          <PixelAlvo px={e.px} sel={COL} grade={modo === "coluna"} rotulo={`Linha ${e.i} de X dobrada em ${MN.lado} por ${MN.lado}: um ${e.rotulo} escrito à mão`} marcar={modo === "coluna"} />
          <div className="q12-s05-ler">
            <span className="q12-s05-y" data-on={modo !== "coluna" ? "1" : undefined}>y = {e.rotulo}</span>
            <p className="q7-p q12-s05-txt" aria-live="polite">
              {modo === "linha" && <>A linha {int(e.i)} tem {int(MN.pixels)} números; dobrada em {MN.lado} linhas de {MN.lado}, volta a ser a imagem de um <b>{e.rotulo}</b>.</>}
              {modo === "coluna" && <>A coluna {int(COL)} é o <b>mesmo pixel</b> (linha {PC.lin}, coluna {PC.col}) em todas as {int(MN.n)} imagens; nesta, vale <b>{int(px[COL])}</b>.</>}
              {modo === "y" && <>y tem um rótulo por linha de X, na mesma ordem: <b>y[{int(e.i)}] = {e.rotulo}</b>. Nenhum pixel entra em y.</>}
            </p>
          </div>
        </div>
      </Painel>
    </Quadro>
  );
}
