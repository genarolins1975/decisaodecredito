"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 03 · c6p3 · Provisório: quadro em construção. */
export function S03Palpite({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p3" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
