"use client";
import type { ReactNode } from "react";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * Peças reutilizáveis do capítulo 7: matriz de confusão com denominadores, grade de pessoas (cada marca é um caso) e a
 * fila de propostas. Todas recebem contagens já calculadas pelo núcleo (src/lib/capitulo7/metricas.ts).
 */

/** Matriz de confusão da regra "recusar quando PD ≥ corte": linhas são a decisão, colunas o desfecho observado. */
export function Matriz({ vp, fp, fn, vn, destaque, compacta, rotulos = true, oculta }: { vp: number; fp: number; fn: number; vn: number; destaque?: "vp" | "fp" | "fn" | "vn" | null; compacta?: boolean; rotulos?: boolean; oculta?: boolean }) {
  const d = vp + fn, a = fp + vn, n = d + a;
  const q = (v: number) => (oculta ? "?" : int(v));
  const cel = (k: "vp" | "fp" | "fn" | "vn", v: number, nome: string, cons: string, tom: "def" | "adi" | "erro" | "ok") => (
    <div className={`q7-mx-c q7-mx-c--${tom}`} data-on={destaque === k ? "1" : "0"}>
      <span className="q7-mx-v">{q(v)}</span>
      {rotulos && <span className="q7-mx-n">{nome}</span>}
      {rotulos && !compacta && <span className="q7-mx-x">{cons}</span>}
    </div>
  );
  return (
    <div className={`q7-mx ${compacta ? "q7-mx--compacta" : ""}`} role="table" aria-label={oculta ? "Matriz de confusão com os valores ocultos até a previsão" : `Matriz de confusão: ${vp} defaults recusados, ${fp} adimplentes recusados, ${fn} defaults aprovados, ${vn} adimplentes aprovados, total ${n}`}>
      <div className="q7-mx-h" role="row"><span role="columnheader" /><span role="columnheader">Deu default <small>{int(d)}</small></span><span role="columnheader">Pagou <small>{int(a)}</small></span></div>
      <div className="q7-mx-r" role="row"><span className="q7-mx-l" role="rowheader">Recusa <small>prevê default · {q(vp + fp)}</small></span>{cel("vp", vp, "VP", "default evitado", "ok")}{cel("fp", fp, "FP", "bom cliente recusado", "erro")}</div>
      <div className="q7-mx-r" role="row"><span className="q7-mx-l" role="rowheader">Aprova <small>prevê pagamento · {q(fn + vn)}</small></span>{cel("fn", fn, "FN", "default aprovado", "erro")}{cel("vn", vn, "VN", "bom cliente aprovado", "ok")}</div>
    </div>
  );
}

/**
 * Grade de pessoas: `n` marcas em `colunas`, as `d` primeiras são default (disco cheio) e o resto adimplente (anel).
 * `esperados` desenha um contorno nas posições que a PD média esperava como default, para comparar com o observado.
 */
export function Pessoas({ n, d, colunas = 10, esperados, rotulo, marcados }: { n: number; d: number; colunas?: number; esperados?: number; rotulo: string; marcados?: boolean[] }) {
  return (
    <div className="q7-pes" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }} role="img" aria-label={rotulo}>
      {Array.from({ length: n }, (_, i) => {
        const def = marcados ? marcados[i] : i < d;
        return <i key={i} className={def ? "q7-pes-d" : "q7-pes-a"} data-esp={esperados !== undefined && i < Math.round(esperados) ? "1" : undefined} />;
      })}
    </div>
  );
}

export type ItemFila = { id: number; pd: number; y: number };
/**
 * Fila de propostas, do maior risco estimado para o menor: cada ficha traz o identificador, a PD e, quando revelado, o
 * desfecho (disco cheio e "D" para default, anel para adimplente). `corte` desenha a fronteira de recusa na fila.
 */
export function Fila({ itens, revelado, corteK, selecionados, onSel, compacta, rotuloCorte }: {
  itens: ItemFila[]; revelado: boolean | ((i: number) => boolean); corteK?: number | null; selecionados?: number[]; onSel?: (id: number) => void; compacta?: boolean; rotuloCorte?: ReactNode;
}) {
  return (
    <ol className={`q7-fila ${compacta ? "q7-fila--compacta" : ""}`} aria-label="Fila de risco, do maior para o menor">
      {itens.map((it, k) => {
        const rev = typeof revelado === "function" ? revelado(k) : revelado;
        const sel = selecionados?.includes(it.id);
        const Tag = onSel ? "button" : "span";
        return (
          <li key={it.id} className="q7-fila-li" data-corte={corteK === k ? "1" : undefined}>
            {corteK === k && <span className="q7-fila-corte" aria-label="corte">{rotuloCorte}</span>}
            <Tag type={onSel ? "button" : undefined} className="q7-ficha" data-y={rev ? String(it.y) : "?"} data-sel={sel ? "1" : undefined} onClick={onSel ? () => onSel(it.id) : undefined} aria-pressed={onSel ? sel : undefined}
              aria-label={`Proposta ${it.id}, PD ${pct(it.pd, 0)}${rev ? (it.y ? ", deu default" : ", pagou") : ", desfecho oculto"}`}>
              <span className="q7-ficha-pos" aria-hidden="true">{k + 1}º</span>
              <span className="q7-ficha-pd">{pct(it.pd, 0)}</span>
              <span className="q7-ficha-mk" aria-hidden="true">{rev ? (it.y ? "D" : "") : "?"}</span>
              <span className="q7-ficha-id">#{it.id}</span>
            </Tag>
          </li>
        );
      })}
    </ol>
  );
}
