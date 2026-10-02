"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 16 · c6p16 · Provisório: quadro em construção. */
export function S16Subamostra({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p16" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
