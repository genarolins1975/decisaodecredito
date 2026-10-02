"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 13 · c6p13 · Provisório: quadro em construção. */
export function S13QuatroControles({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p13" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
