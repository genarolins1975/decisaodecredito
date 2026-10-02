"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 05 · c6p5 · Provisório: quadro em construção. */
export function S05PrimeiraArvore({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p5" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
