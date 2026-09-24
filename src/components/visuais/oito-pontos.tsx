"use client";
import { useState } from "react";
import { PONTOS } from "@/lib/visuais/boosting";
import { fmtNum } from "@/lib/visuais/metricas";
import { paraTex } from "@/lib/visuais/tex";
import { ComTex, Tex } from "./tex";

/**
 * Oito pontos, uma tendência e erros locais (c6p3). O palpite inicial F₀ é a média dos oito valores de y, e o erro de
 * cada ponto é y − F₀. Clicar num ponto (ou Enter e espaço no teclado) desenha o erro dele. Substitui a cena da revisão
 * 13, cujo clique dependia de um script que a plataforma não executa: os círculos eram botões que não respondiam.
 * Os dados são os mesmos de c6p2 a c6p9 (src/lib/visuais/boosting.ts).
 */
const X = PONTOS.x, Y = PONTOS.y;
const F0 = Y.reduce((s, v) => s + v, 0) / Y.length;
const W = 760, H = 330, ML = 52, MR = 24, MT = 20, MB = 44, YMAX = 13;
const sx = (x: number) => ML + ((x - 0.5) / 8) * (W - ML - MR);
const sy = (y: number) => MT + (1 - y / YMAX) * (H - MT - MB);
const sinal = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${fmtNum(Math.abs(v), 1)}`;

export function OitoPontos() {
  const [sel, setSel] = useState(7);
  const erro = Y[sel] - F0;
  return (
    <figure className="vz" data-vz="oito-pontos">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Regressão · oito pontos · primeira rodada</p>
          <p className="vz-tit">O palpite inicial é a média; o erro de cada ponto é o que sobra dela.</p>
        </div>
      </header>

      <div className="vz-estado" aria-live="polite">
        <b><Tex f={String.raw`\boldsymbol{x = ${X[sel]}}`} className="tx-linha" />, <Tex f={String.raw`\boldsymbol{y = ${paraTex(fmtNum(Y[sel], 1))}}`} className="tx-linha" />.</b> Erro inicial: <Tex f={String.raw`y - ${paraTex(fmtNum(F0, 1))} = ${paraTex(sinal(erro))}`} className="tx-linha" />.{" "}
        {erro > 0 ? "A previsão precisa subir" : "A previsão precisa descer"}; a próxima árvore tenta explicar esse erro.
      </div>

      <div className="vz-op-grade">
        <div className="vz-op-lado">
          <p className="vz-op-k">Previsão inicial F₀</p>
          <p className="vz-op-num">{fmtNum(F0, 1)}</p>
          <p className="hint">a média dos oito valores de y, sem olhar para x</p>
        </div>
        <div className="vz-grafico">
          <p className="vz-grafico-t">Oito pontos e o palpite constante <span className="hint">clique num ponto para ver o erro dele</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Oito pontos com x de 1 a 8 e a linha da previsão inicial ${fmtNum(F0, 1)}; selecionado x = ${X[sel]}, erro ${sinal(erro)}`}>
            {[0, 4, 8, 12].map((v) => (
              <g key={v}>
                <line x1={ML} x2={W - MR} y1={sy(v)} y2={sy(v)} className="vz-grade" />
                <text x={ML - 10} y={sy(v) + 4} textAnchor="end" className="vz-tick">{v}</text>
              </g>
            ))}
            {X.map((x) => <text key={x} x={sx(x)} y={H - MB + 20} textAnchor="middle" className="vz-tick">{x}</text>)}
            <text x={(ML + W - MR) / 2} y={H - 6} textAnchor="middle" className="vz-rotulo">x</text>
            <text x={ML - 10} y={MT + 2} textAnchor="end" className="vz-rotulo">y</text>
            <line x1={ML} x2={W - MR} y1={sy(F0)} y2={sy(F0)} className="vz-op-f0" />
            <text x={ML + 6} y={sy(F0) - 8} className="vz-tick vz-op-f0-t">F₀ = {fmtNum(F0, 1)}</text>
            <line x1={sx(X[sel])} x2={sx(X[sel])} y1={sy(F0)} y2={sy(Y[sel])} className="vz-op-erro" />
            <text x={sx(X[sel]) + 12} y={(sy(F0) + sy(Y[sel])) / 2 + 4} className="vz-tick vz-op-erro-t">{sinal(erro)}</text>
            {X.map((x, i) => (
              <g key={x} role="button" tabIndex={0} aria-pressed={i === sel} aria-label={`Ponto x = ${x}, y = ${fmtNum(Y[i], 1)}, erro ${sinal(Y[i] - F0)}`}
                className={`vz-op-ponto ${i === sel ? "vz-op-ponto--on" : ""}`} onClick={() => setSel(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(i); } }}>
                <circle cx={sx(x)} cy={sy(Y[i])} r={i === sel ? 11 : 9} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <p className="vz-fonte"><ComTex t={String.raw`Oito pontos de regressão, os mesmos de c6p2 a c6p9: $x$ de 1 a 8 e $y = 2;\ 3;\ 4{,}5;\ 5;\ 8;\ 8{,}5;\ 9;\ 12$. $F_0 = 6{,}5$ é a média dos oito valores, o melhor palpite constante pela perda quadrática (página 4). Erro inicial de cada ponto: $y - F_0$.`} /></p>
    </figure>
  );
}
