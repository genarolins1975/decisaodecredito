"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 08 · c12p8 · quadro provisório (a construir). */
export function S08Sgd({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p8" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}
