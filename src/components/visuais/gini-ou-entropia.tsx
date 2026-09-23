"use client";
import { useMemo } from "react";
import { fmtNum } from "@/lib/visuais/metricas";
import { avaliarCorte, cortesCandidatos, NOME_VAR, VARIAVEIS, type Variavel } from "@/lib/visuais/arvore";
import type { Proposta } from "@/lib/visuais/logistica";
import { BASE16 } from "./plano-16";

/**
 * Gini ou entropia (c5p17). A varredura da raiz refeita com as duas medidas: os dois critérios escolhem utilização ≤
 * 57,5%, e no atraso o Gini empata 15 e 27,5 dias, que a entropia desempata. Ao lado, o que de fato muda a árvore e
 * quando o critério importa. Substitui a página herdada, de três blocos de texto.
 */
const entropia = (d: number, n: number) => (n ? [d / n, 1 - d / n].filter((x) => x > 0).reduce((s, x) => s - x * Math.log2(x), 0) : 0);
const soma = (g: Proposta[]) => g.reduce((s, p) => s + p.y, 0);
const IMPACTO = ["A amostra", "O mínimo de casos por folha", "A profundidade", "Muito depois, o critério de impureza"];
const QUANDO: [string, string][] = [["Quase nunca", "na escolha do corte"], ["Às vezes", "com alvo de mais de duas classes"], ["Sempre", "na declaração: o relatório diz qual foi usado"]];

export function GiniOuEntropia() {
  const linhas = useMemo(() => VARIAVEIS.map((v: Variavel) => {
    const cs = cortesCandidatos(BASE16, v).map((c) => { const a = avaliarCorte(BASE16, v, c); const n = BASE16.length;
      const ent = entropia(soma(BASE16), n) - (a.esq.length / n) * entropia(soma(a.esq), a.esq.length) - (a.dir.length / n) * entropia(soma(a.dir), a.dir.length);
      return { c, gini: a.ganho, ent }; });
    const mg = Math.max(...cs.map((x) => x.gini)), me = Math.max(...cs.map((x) => x.ent));
    return { v, gini: mg, cortesGini: cs.filter((x) => Math.abs(x.gini - mg) < 1e-9).map((x) => x.c), ent: me, corteEnt: cs.find((x) => Math.abs(x.ent - me) < 1e-9)!.c };
  }), []);
  const corte = (c: number[]) => c.map((x) => x.toLocaleString("pt-BR")).join(" ou ");
  return (
    <figure className="vz" data-vz="gini-ou-entropia">
      <div className="vz-ge-grade">
        <div>
          <div className="table-wrap"><table className="table vz-ge-tabela"><thead><tr><th>Variável</th><th>Melhor corte, Gini</th><th>Ganho</th><th>Melhor corte, entropia</th><th>Ganho</th></tr></thead><tbody>
            {linhas.map((l) => <tr key={l.v} className={l.v === "util" ? "vz-t-on" : ""}><th scope="row">{NOME_VAR[l.v]}</th><td>{corte(l.cortesGini)}</td><td>{fmtNum(l.gini, 5)}</td><td>{corte([l.corteEnt])}</td><td>{fmtNum(l.ent, 5)}</td></tr>)}
          </tbody></table></div>
          <p className="vz-ge-nota">Os dois critérios escolhem a mesma raiz. Os ganhos estão em escalas diferentes (a entropia é medida em bits): compare o corte, não o número.</p>
        </div>
        <div className="vz-ge-lado">
          <div className="vz-rd-lista vz-rd-lista--ganha"><p className="vz-rd-k">O que mais muda a árvore</p><ol>{IMPACTO.map((i) => <li key={i}>{i}</li>)}</ol></div>
          <div className="vz-rd-lista vz-rd-lista--neutra"><p className="vz-rd-k">Quando o critério importa</p><dl className="vz-ge-quando">{QUANDO.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl></div>
        </div>
      </div>
      <p className="vz-fonte">Varredura dos cortes candidatos da raiz sobre as 16 propostas, com Gini e com entropia em bits (recalculada aqui). No atraso, o Gini empata os cortes de 15 e 27,5 dias em {fmtNum(linhas[1].gini, 5)} e não escolhe entre eles; a entropia prefere 27,5. A raiz não muda: utilização vence pelos dois critérios, com margem de mais de três vezes.</p>
    </figure>
  );
}
