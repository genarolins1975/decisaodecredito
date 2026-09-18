"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { gini, melhorCorte, rotuloCorte, todosOsCandidatos } from "@/lib/visuais/arvore";

/**
 * Recursão: a mesma busca, dentro de cada lado (capítulo 5, c5p9). Depois de utilização ≤ 57,5%, cada nó de oito
 * propostas repete a busca exaustiva só com os seus casos; os quatro melhores candidatos de cada lado, o plano de
 * cada nó e o corte escolhido.
 */
const BASE = did.base as Proposta[];
const PW = 300, PH = 250, PML = 40, PMR = 10, PMT = 12, PMB = 34;
const su = (u: number) => PML + (u / 100) * (PW - PML - PMR), sa = (a: number) => PMT + (1 - a / 40) * (PH - PMT - PMB);

export function Recursao() {
  const [lado, setLado] = useState<"esq" | "dir">("esq");
  const nos = useMemo(() => (["esq", "dir"] as const).map((k) => {
    const grupo = BASE.filter((p) => (k === "esq" ? p.util <= 57.5 : p.util > 57.5)); const d = grupo.filter((p) => p.y).length;
    const cands = todosOsCandidatos(grupo).sort((a, b) => b.ganho - a.ganho); const melhor = melhorCorte(grupo)!;
    return { k, grupo, d, g: gini(d, grupo.length), cands, melhor, u0: k === "esq" ? 0 : 57.5, u1: k === "esq" ? 57.5 : 100 };
  }), []);
  const atual = nos.find((n) => n.k === lado)!;
  return (
    <figure className="vz" data-vz="recursao">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Recursão · a busca do nível 2 · 8 propostas de cada vez · nada de novo</p>
          <p className="vz-tit">Depois da primeira divisão, cada lado vira um problema independente, com a mesma busca exaustiva.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Nó">
          <button type="button" className={`btn btn-sm ${lado === "esq" ? "" : "btn-secondary"}`} onClick={() => setLado("esq")}>lado esquerdo</button>
          <button type="button" className={`btn btn-sm ${lado === "dir" ? "" : "btn-secondary"}`} onClick={() => setLado("dir")}>lado direito</button>
        </div>
      </header>
      <div className="vz-estado"><b>Nó {lado === "esq" ? "esquerdo, utilização ≤ 57,5%" : "direito, utilização > 57,5%"}:</b> {atual.grupo.length} propostas e {atual.d} default{atual.d === 1 ? "" : "s"}, Gini {fmtNum(atual.g, 5)}. Vence {rotuloCorte(atual.melhor.v, atual.melhor.corte)} com ganho local {fmtNum(atual.melhor.ganho, 5)}, novas folhas com {atual.melhor.esq.length} e {atual.melhor.dir.length} casos. A busca recomeça somente com os casos deste nó.</div>
      <div className="vz-rec-grade">
        {nos.map((n) => <div key={n.k} className={`vz-rec-no ${n.k === lado ? "vz-rec-no--on" : ""} ${n.k === "esq" ? "vz-cc-tile--esq" : "vz-cc-tile--dir"}`} onClick={() => setLado(n.k)}>
          <p className="eyebrow">Nó {n.k === "esq" ? "esquerdo: utilização ≤ 57,5%" : "direito: utilização > 57,5%"}</p>
          <p className="hint">Gini deste nó {fmtNum(n.g, 5)}, com {n.d} default{n.d === 1 ? "" : "s"} em {n.grupo.length} propostas</p>
          <div className="vz-rec-corpo">
            <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Plano do nó ${n.k}`} className="vz-rec-plano">
              <rect x={su(0)} y={sa(40)} width={su(100) - su(0)} height={sa(0) - sa(40)} className="vz-rec-fora" />
              <rect x={su(n.u0)} y={sa(40)} width={su(n.u1) - su(n.u0)} height={sa(0) - sa(40)} className="vz-rec-dentro" />
              {[0, 50, 100].map((u) => <text key={u} x={su(u)} y={PH - PMB + 14} textAnchor="middle" className="vz-tick">{u}%</text>)}
              {[0, 20, 40].map((a) => <text key={a} x={PML - 4} y={sa(a) + 4} textAnchor="end" className="vz-tick">{a} d</text>)}
              <text x={su(50)} y={PH - 4} textAnchor="middle" className="vz-rotulo">utilização</text>
              {n.melhor.v === "util" ? <line x1={su(n.melhor.corte)} x2={su(n.melhor.corte)} y1={sa(40)} y2={sa(0)} className="vz-arv-cand" /> : <line x1={su(n.u0)} x2={su(n.u1)} y1={sa(n.melhor.corte)} y2={sa(n.melhor.corte)} className="vz-arv-cand" />}
              {BASE.map((p) => { const dentro = n.grupo.includes(p); return <g key={p.id} style={{ transform: `translate(${su(p.util)}px, ${sa(p.atraso)}px)`, opacity: dentro ? 1 : 0.18 }}><circle r={dentro ? 8 : 5} className={p.y ? "vz-int-c--default" : "vz-int-c--pagou"} />{dentro && <text y={3.5} textAnchor="middle" className="vz-cc-id">{p.id}</text>}</g>; })}
              <text x={n.k === "esq" ? su(n.u0) + 4 : su(n.u1) - 4} y={sa(40) + 12} textAnchor={n.k === "esq" ? "start" : "end"} className="vz-ks-t">{rotuloCorte(n.melhor.v, n.melhor.corte)} · ganho {fmtNum(n.melhor.ganho, 3)}</text>
            </svg>
            <div className="table-wrap"><table className="table text-[.8em]"><thead><tr><th>Variável</th><th>Corte</th><th>esq / dir</th><th>Ganho</th></tr></thead><tbody>
              {n.cands.slice(0, 4).map((c, i) => <tr key={`${c.v}-${c.corte}`} className={i === 0 ? "vz-t-on" : ""}><th scope="row">{c.v === "util" ? "utilização" : "atraso"}</th><td>{fmtNum(c.corte, 1)}</td><td>{c.esq.length} / {c.dir.length}</td><td className={i === 0 ? "vz-t-forte" : ""}>{fmtNum(c.ganho, 5)}</td></tr>)}
            </tbody></table></div>
          </div>
        </div>)}
      </div>
      <div className="vz-tiles vz-tiles--2 vz-rec-tiles">
        <div className="vz-tile vz-tile--ok"><p className="eyebrow">Duas propriedades da recursão</p><p className="vz-num vz-num--texto">A variável da raiz pode ser escolhida de novo, com outro ponto de corte, e é o que acontece nos dois lados desta base. E a melhor divisão de um lado é escolhida sem nenhuma consideração sobre o outro: a busca é local, nó a nó.</p></div>
        <div className="vz-tile vz-tile--alerta"><p className="eyebrow">O custo de ser local</p><p className="vz-num vz-num--texto">A árvore é construída de forma gulosa. Ela escolhe o melhor corte agora, sem verificar se um corte pior agora permitiria dois cortes muito melhores depois. Não existe garantia de que a árvore encontrada seja a melhor árvore possível com aquela profundidade.</p></div>
      </div>
      <p className="vz-fonte">Nó esquerdo: Gini 0,21875, vence utilização ≤ 27,5% com ganho 0,09375 (folhas de 2 e 6). Nó direito: Gini 0,21875, utilização ≤ 87,5% e atraso ≤ 2,5 d empatam em 0,09375 e a ordem de avaliação decide pela utilização. Recursão significa repetir a mesma pergunta: qual corte reduz mais a mistura aqui dentro?</p>
    </figure>
  );
}
