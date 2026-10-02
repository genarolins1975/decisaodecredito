"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 06 · c6p6 · Provisório: quadro em construção. */
export function S06PassoNewton({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p6" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
