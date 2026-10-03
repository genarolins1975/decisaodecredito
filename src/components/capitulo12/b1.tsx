"use client";
import type { KeyboardEvent } from "react";
import { Digito } from "./pecas";
import { LADO, posicao } from "@/lib/capitulo12/b1";

/**
 * Peças do bloco 1 do capítulo 12. PixelAlvo: o dígito com a grade dos 784 pixels, em que um clique (ou as setas do
 * teclado, com o foco no dígito) escolhe o pixel; um anel dourado (a cor do realce de pixel no Digito) marca o escolhido, visível mesmo em imagem pequena.
 * É um botão: as setas não trocam de slide no palco. `marcar` falso esconde o realce (o dígito fica só como imagem). CSS em src/app/capitulo12-b1.css (q12-b1-).
 */
export function PixelAlvo({ px, sel, onSel, rotulo, grade = true, className = "", marcar = true }: { px: string; sel: number; onSel?: (i: number) => void; rotulo: string; grade?: boolean; className?: string; marcar?: boolean }) {
  const { lin, col } = posicao(sel);
  const anel = marcar && <span className="q12-b1-anel" aria-hidden="true" style={{ left: `${((col + 0.5) / LADO) * 100}%`, top: `${((lin + 0.5) / LADO) * 100}%` }} />;
  if (!onSel) return <div className={`q12-b1-alvo ${className}`}><Digito px={px} grade={grade} marca={marcar ? sel : null} rotulo={rotulo} />{anel}</div>;
  const tecla = (e: KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const m = d[e.key]; if (!m) return;
    e.preventDefault(); e.stopPropagation();
    const l = Math.min(LADO - 1, Math.max(0, lin + m[0])), c = Math.min(LADO - 1, Math.max(0, col + m[1]));
    onSel(l * LADO + c);
  };
  return (
    <button type="button" className={`q12-b1-alvo q12-b1-alvo--bt ${className}`} onKeyDown={tecla} aria-label={`${rotulo}. Pixel escolhido: linha ${lin}, coluna ${col}. Clique num pixel ou use as setas para mudar.`}>
      <Digito px={px} grade={grade} marca={sel} rotulo={rotulo} onPixel={onSel} />
      {anel}
    </button>
  );
}
