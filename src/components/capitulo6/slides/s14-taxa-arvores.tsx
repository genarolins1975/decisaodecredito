"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 14 · c6p14 · Provisório: quadro em construção. */
export function S14TaxaArvores({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p14" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
