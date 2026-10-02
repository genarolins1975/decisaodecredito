"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 17 · c6p17 · Provisório: quadro em construção. */
export function S17Logistica({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p17" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
