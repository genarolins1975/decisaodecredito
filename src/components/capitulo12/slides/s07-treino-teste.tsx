"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 07 · c12p7 · quadro provisório (a construir). */
export function S07TreinoTeste({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p7" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}
