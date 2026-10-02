"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 07 · c6p7 · Provisório: quadro em construção. */
export function S07Taxa({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p7" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
