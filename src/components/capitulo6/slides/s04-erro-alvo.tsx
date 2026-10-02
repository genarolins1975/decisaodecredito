"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 04 · c6p4 · Provisório: quadro em construção. */
export function S04ErroAlvo({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p4" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
