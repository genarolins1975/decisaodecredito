"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 46 · c12p46 · quadro provisório (a construir). */
export function S46MetricasComite({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p46" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}
