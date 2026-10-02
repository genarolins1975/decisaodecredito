"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 02 · c6p2 · Provisório: quadro em construção. */
export function S02TresEstrategias({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p2" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
