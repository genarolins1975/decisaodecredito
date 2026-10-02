"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 01 · c6p1 · Provisório: quadro em construção. */
export function S01Mapa({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p1" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
