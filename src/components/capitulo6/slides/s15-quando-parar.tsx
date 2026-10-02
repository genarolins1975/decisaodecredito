"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 15 · c6p15 · Provisório: quadro em construção. */
export function S15QuandoParar({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p15" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
