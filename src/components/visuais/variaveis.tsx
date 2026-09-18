"use client";
import { useState } from "react";

/**
 * Alvo, preditoras e tipos de variável (capítulo 2, c2p5). Quatro campos da mesma proposta: o papel e o tipo de cada
 * um pelo que representa, as operações legítimas e a armadilha temporal. A matriz mostra o que cada tipo permite.
 */
type Var = { k: string; nome: string; valor: string; tipo: string; papel: "preditora" | "alvo"; op: string; armadilha: string; permite: boolean[] };
const OPERACOES = ["ordenar", "diferenças", "faixas", "categorias", "frequência"];
const VARS: Var[] = [
  { k: "renda", nome: "Renda declarada", valor: "R$ 6.800", tipo: "quantitativa contínua", papel: "preditora", op: "ordenar, calcular diferenças e criar faixas", armadilha: "renda confirmada depois da análise não pode entrar", permite: [true, true, true, true, true] },
  { k: "ocupacao", nome: "Ocupação", valor: "autônomo", tipo: "qualitativa nominal", papel: "preditora", op: "comparar categorias; não existe distância natural", armadilha: "codificar 1, 2, 3 não cria uma ordem legítima", permite: [false, false, false, true, true] },
  { k: "atraso", nome: "Maior atraso recente", valor: "8 dias", tipo: "quantitativa discreta", papel: "preditora", op: "comparar magnitude e testar cortes", armadilha: "usar atraso ocorrido depois da proposta é vazamento", permite: [true, true, true, true, true] },
  { k: "default", nome: "Default em 12 meses", valor: "não", tipo: "binária", papel: "alvo", op: "contar frequência e estimar probabilidade", armadilha: "o evento precisa estar maduro antes de rotular", permite: [false, false, false, true, true] },
];

export function Variaveis() {
  const [k, setK] = useState("renda");
  const v = VARS.find((x) => x.k === k)!;
  return (
    <figure className="vz" data-vz="variaveis">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Alvo, preditoras e tipos de variável · quatro campos da mesma proposta</p>
          <p className="vz-tit">O papel e o tipo vêm do que a variável representa, não do formato da coluna. Cada tipo permite umas operações e proíbe outras.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Campo">{VARS.map((x) => <button key={x.k} type="button" className={`btn btn-sm ${k === x.k ? "" : "btn-secondary"}`} onClick={() => setK(x.k)}>{x.nome}</button>)}</div>
      </header>
      <div className={`vz-estado ${v.papel === "alvo" ? "vz-estado--alterado" : ""}`}><b>{v.nome}, {v.valor}: {v.papel}, {v.tipo}.</b> Operações legítimas: {v.op}. Armadilha temporal: {v.armadilha}.</div>
      <div className="vz-var-grade">
        <div className="vz-var-ficha">
          <p className="eyebrow">A proposta</p>
          {VARS.map((x) => <button key={x.k} type="button" className={`vz-var-campo ${x.k === k ? "vz-var-campo--on" : ""} ${x.papel === "alvo" ? "vz-var-campo--alvo" : ""}`} onClick={() => setK(x.k)}><span className="vz-var-nome">{x.nome}</span><b className="vz-var-valor">{x.valor}</b><em className="vz-var-papel">{x.papel}</em></button>)}
          <p className="hint">Três campos entram no modelo. O quarto é o que o modelo tenta prever, e só existe doze meses depois.</p>
        </div>
        <div className="vz-var-lado">
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">valor observado</p><p className="vz-num">{v.valor}</p><p className="hint">{v.papel}</p></div>
            <div className="vz-tile"><p className="eyebrow">tipo</p><p className="vz-num vz-num--texto">{v.tipo}</p><p className="hint">{v.op}</p></div>
          </div>
          <div className="vz-tile"><p className="eyebrow">O que cada tipo permite</p>
            <div className="table-wrap"><table className="table text-[.85em] vz-var-matriz"><thead><tr><th></th>{OPERACOES.map((o) => <th key={o}>{o}</th>)}</tr></thead><tbody>
              {VARS.map((x) => <tr key={x.k} className={x.k === k ? "vz-t-on" : ""} onClick={() => setK(x.k)} style={{ cursor: "pointer" }}><th scope="row">{x.tipo}</th>{x.permite.map((p, i) => <td key={i} className={p ? "vz-t-ok" : "vz-t-default"}>{p ? "sim" : "não"}</td>)}</tr>)}
            </tbody></table></div></div>
          <div className="vz-tile vz-tile--alerta"><p className="eyebrow">Armadilha temporal</p><p className="vz-num vz-num--texto">{v.armadilha.charAt(0).toUpperCase() + v.armadilha.slice(1)}.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Quantitativa contínua e discreta admitem ordem, diferença e faixas; nominal admite só comparação de categorias e contagem; a binária é o alvo e admite contagem de frequência, que é a probabilidade. Codificar categorias com 1, 2, 3 não cria uma ordem legítima.</p>
    </figure>
  );
}
