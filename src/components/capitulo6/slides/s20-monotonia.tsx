"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 20 · c6p20 · Provisório: quadro em construção. */
export function S20Monotonia({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p20" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
