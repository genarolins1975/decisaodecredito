"use client";
import { Painel, Quadro, type Pagina } from "@/components/capitulo7/base";

/** 17 · c12p17 · quadro provisório (a construir). */
export function S17Limiar({ pagina }: { pagina?: Pagina }) {
  return (
    <Quadro slug="c12p17" pagina={pagina} layout="um">
      <Painel><p className="q7-p">Em construção.</p></Painel>
    </Quadro>
  );
}
