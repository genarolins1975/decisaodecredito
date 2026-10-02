"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 22 · c6p22 · Provisório: quadro em construção. */
export function S22Apendice({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p22" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
