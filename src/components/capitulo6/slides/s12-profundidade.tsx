"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 12 · c6p12 · Provisório: quadro em construção. */
export function S12Profundidade({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p12" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
