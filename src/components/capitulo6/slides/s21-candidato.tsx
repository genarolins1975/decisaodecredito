"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 21 · c6p21 · Provisório: quadro em construção. */
export function S21Candidato({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p21" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
