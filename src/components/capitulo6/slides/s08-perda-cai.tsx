"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 08 · c6p8 · Provisório: quadro em construção. */
export function S08PerdaCai({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c6p8" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Quadro em construção.</p></Painel>
    </Quadro>
  );
}
