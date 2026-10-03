"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 32 · c12p32 · quadro provisório (a construir). */
export function S32Fora37({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p32" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}
