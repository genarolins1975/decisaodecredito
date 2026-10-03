"use client";
import type { ReactNode } from "react";

/**
 * Peças comuns do bloco 3 do capítulo 12 (ensembles). LegendaLuas: a chave do plano das duas luas (PlanoLuas, em
 * pecas.tsx) com os mesmos símbolos do desenho: círculo azul para a classe 0, triângulo verde para a classe 1, cheio no
 * treino e vazado no teste, anel vinho no erro de teste. CSS em src/app/capitulo12-b3.css (prefixo q12-b3-).
 */
function Simbolo({ forma, cheio = true, cor }: { forma: "circ" | "tri" | "anel"; cheio?: boolean; cor: string }) {
  return (
    <svg className="q12-b3-sim" viewBox="0 0 20 20" aria-hidden="true">
      {forma === "circ" && <circle cx={10} cy={10} r={6} fill={cheio ? cor : "#fff"} stroke={cor} strokeWidth={2} />}
      {forma === "tri" && <path d="M10 3L17 16H3Z" fill={cheio ? cor : "#fff"} stroke={cor} strokeWidth={2} strokeLinejoin="round" />}
      {forma === "anel" && <circle cx={10} cy={10} r={7.5} fill="none" stroke={cor} strokeWidth={2.4} />}
    </svg>
  );
}

export function LegendaLuas({ teste = true, treino = true, erros = false, extra }: { teste?: boolean; treino?: boolean; erros?: boolean; extra?: ReactNode }) {
  return (
    <ul className="q12-b3-leg">
      <li><Simbolo forma="circ" cor="#3D5A8A" cheio={treino} />classe 0</li>
      <li><Simbolo forma="tri" cor="#2E6B4F" cheio={treino} />classe 1</li>
      {treino && teste && <li><Simbolo forma="circ" cor="#5B6475" cheio={false} />vazado: teste</li>}
      {erros && <li><Simbolo forma="anel" cor="#8C2332" />erro no teste</li>}
      {extra}
    </ul>
  );
}
