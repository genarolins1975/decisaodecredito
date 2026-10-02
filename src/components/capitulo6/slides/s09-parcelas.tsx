"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 09 · c6p9 · Provisório: quadro em construção. */
export function S09Parcelas({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p9" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
