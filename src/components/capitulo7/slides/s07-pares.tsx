"use client";
import { useState } from "react";
import { Botao, Formula, Painel, Quadro, Seg, type Pagina } from "../base";
import { MINI } from "@/lib/capitulo7/dados";
import { aucPorPares } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 07 · c7p22 · AUC exata na mini-base: a matriz dos 5 × 15 = 75 pares, cada célula valendo 1, ½ ou 0. Com a PD
 * arredondada a pontos inteiros há um empate (#179 e #64, ambos 17%); em precisão plena ele vira inversão (16,74%
 * contra 17,19%) e a AUC cai de 0,8067 para 0,8000. Nenhum par é "observação independente": cada proposta aparece
 * em vários pares.
 */
const DS = MINI.filter((m) => m.y).sort((a, b) => b.pd - a.pd || b.pdPlena - a.pdPlena);
const AS = MINI.filter((m) => !m.y).sort((a, b) => b.pd - a.pd || b.pdPlena - a.pdPlena);
type Modo = "um" | "todos";
const valor = (a: number, b: number) => (a > b ? 1 : a === b ? 0.5 : 0);
const simbolo = (v: number) => (v === 1 ? "1" : v === 0.5 ? "½" : "0");

export function S07Pares({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("um");
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [plena, setPlena] = useState(false);
  const pdv = (m: (typeof MINI)[number]) => (plena ? m.pdPlena : m.pd);
  const c = aucPorPares(MINI.map((m) => m.y), MINI.map(pdv));
  const somaLinha = DS.map((d) => AS.reduce((s, a) => s + valor(pdv(d), pdv(a)), 0));
  const fmtPd = (m: (typeof MINI)[number]) => pct(pdv(m), plena ? 2 : 0);
  const s = sel ? { d: DS[sel[0]], a: AS[sel[1]] } : null; const v = s ? valor(pdv(s.d), pdv(s.a)) : null;
  return (
    <Quadro slug="c7p22" pagina={pagina} layout="glx"
      conclusao={modo === "todos" ? <>Soma {num(c.corretos + 0.5 * c.empates, 1)} sobre {c.pares} pares: <b>AUC {num(c.auc!, 4)}</b>. {plena ? "Em precisão plena o empate some e vira inversão." : "O empate vem do arredondamento a pontos inteiros."} A conta usa só quem ficou acima de quem: <b>mede ordenação, não nível</b>.</>
        : s ? <>#{s.d.id} ({fmtPd(s.d)}) contra #{s.a.id} ({fmtPd(s.a)}): {v === 1 ? "o default ficou acima, vale 1" : v === 0.5 ? "empate, vale ½" : "o adimplente ficou acima, vale 0"}.</> : "Clique numa célula: cada uma é um par (um default, um adimplente)."}
      fonte="Mini-base de 20 propostas da janela fora do tempo (5 defaults, 15 adimplentes), PD da logística. As mesmas propostas aparecem em vários pares: os 75 pares não são observações independentes.">
      <Painel titulo={`Linhas: os 5 defaults · colunas: os 15 adimplentes · PD ${plena ? "em precisão plena" : "em pontos inteiros"}`}>
        <div className="q7-s07-wrap">
          <table className="q7-s07" aria-label="Matriz de pares da mini-base">
            <thead><tr><th scope="col"><span className="q7-sr">Default</span></th>{AS.map((a, j) => <th key={a.id} scope="col" data-on={sel?.[1] === j ? "1" : undefined}>#{a.id}<small>{fmtPd(a)}</small></th>)}<th scope="col">soma</th></tr></thead>
            <tbody>{DS.map((d, i) => (
              <tr key={d.id}><th scope="row" data-on={sel?.[0] === i ? "1" : undefined}>#{d.id}<small>{fmtPd(d)}</small></th>
                {AS.map((a, j) => { const val = valor(pdv(d), pdv(a)); const on = modo === "todos" || (sel?.[0] === i && sel?.[1] === j); return (
                  <td key={a.id}><button type="button" className="q7-s07-c" data-v={on ? String(val) : undefined} data-sel={sel?.[0] === i && sel?.[1] === j ? "1" : undefined} onClick={() => setSel([i, j])} aria-label={`#${d.id} contra #${a.id}: ${on ? (val === 1 ? "vale 1" : val === 0.5 ? "empate, vale meio" : "vale 0") : "ainda não comparado"}`}>{on ? simbolo(val) : ""}</button></td>
                ); })}
                <td className="q7-s07-soma">{modo === "todos" ? num(somaLinha[i], 1) : ""}</td></tr>))}
            </tbody>
          </table>
        </div>
        <p className="q7-nota">Célula 1: o default recebeu PD maior. ½: PDs iguais. 0: o adimplente recebeu PD maior.</p>
      </Painel>
      <Painel titulo="A conta exata">
        <Seg rotulo="Modo" opcoes={[{ v: "um" as Modo, r: "Um par" }, { v: "todos" as Modo, r: "Todos os pares" }]} valor={modo} onChange={setModo} />
        <dl className="q7-lista">
          <div><dt>Pares que valem 1</dt><dd>{modo === "todos" ? c.corretos : "?"}</dd></div>
          <div data-tom="dec"><dt>Empates (½ cada)</dt><dd>{modo === "todos" ? c.empates : "?"}</dd></div>
          <div data-tom="def"><dt>Pares que valem 0</dt><dd>{modo === "todos" ? c.invertidos : "?"}</dd></div>
          <div><dt>Denominador</dt><dd>5 × 15 = 75</dd></div>
          <div data-tom="prob"><dt>AUC</dt><dd>{modo === "todos" ? num(c.auc!, 4) : "?"}</dd></div>
        </dl>
        <Formula f={String.raw`\mathrm{AUC}=\frac{C+\tfrac12\,E}{n_D\times n_A}`} simbolos={[["C", "pares em que o default tem PD maior"], ["E", "pares empatados"]]} />
        <div className="q7-botoes"><Botao onClick={() => setPlena(!plena)}>{plena ? "Voltar a pontos inteiros" : "Usar a PD em precisão plena"}</Botao><Botao sec onClick={() => { setModo("um"); setSel(null); setPlena(false); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
