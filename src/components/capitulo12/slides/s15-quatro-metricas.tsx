"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 15 · c12p15 · quadro provisório (a construir). */
export function S15QuatroMetricas({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p15" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}
