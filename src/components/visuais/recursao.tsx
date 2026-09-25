"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum } from "@/lib/visuais/metricas";
import type { Proposta } from "@/lib/visuais/logistica";
import { gini, melhorCorte, rotuloCorte, todosOsCandidatos } from "@/lib/visuais/arvore";

/**
 * Recursão: a mesma busca, dentro de cada lado (capítulo 5, c5p9). Depois de utilização ≤ 57,5%, cada nó de oito
 * propostas repete a busca exaustiva só com os seus casos; os quatro melhores candidatos de cada lado, o plano de
 * cada nó e o corte escolhido. Na tabela, cada linha é um corte candidato escrito como regra, e "Propostas ≤ corte" e
 * "> corte" dizem quantas propostas do nó ele manda para cada um dos dois nós novos. Até 25/09/2026 essas duas contagens
 * ficavam numa coluna "esq / dir", que se confundia com os lados da raiz, e variável e corte ocupavam duas colunas.
 */
const BASE = did.base as Proposta[];
/* margem de cima para o rótulo do melhor corte, que antes caía sobre a #12; margem da direita para o 100% do eixo, que saía cortado */
const PW = 300, PH = 250, PML = 40, PMR = 18, PMT = 26, PMB = 34;
const su = (u: number) => PML + (u / 100) * (PW - PML - PMR), sa = (a: number) => PMT + (1 - (a + 4) / 48) * (PH - PMT - PMB);

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
      <div className="vz-estado"><b>Nó {lado === "esq" ? "esquerdo, utilização ≤ 57,5%" : "direito, utilização > 57,5%"}:</b> {atual.grupo.length} propostas e {atual.d} default{atual.d === 1 ? "" : "s"}, Gini {fmtNum(atual.g, 5)}. Vence {rotuloCorte(atual.melhor.v, atual.melhor.corte)} com ganho local {fmtNum(atual.melhor.ganho, 5)}, novas folhas com {atual.melhor.esq.length} e {atual.melhor.dir.length} propostas. A busca recomeça somente com os casos deste nó.</div>
      <div className="vz-rec-grade">
        {nos.map((n) => <div key={n.k} className={`vz-rec-no ${n.k === lado ? "vz-rec-no--on" : ""} ${n.k === "esq" ? "vz-cc-tile--esq" : "vz-cc-tile--dir"}`} onClick={() => setLado(n.k)}>
          <p className="eyebrow">Nó {n.k === "esq" ? "esquerdo: utilização ≤ 57,5%" : "direito: utilização > 57,5%"}</p>
          <p className="hint">Gini deste nó {fmtNum(n.g, 5)}, com {n.d} default{n.d === 1 ? "" : "s"} em {n.grupo.length} propostas</p>
          <div className="vz-rec-corpo">
            <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Plano do nó ${n.k}`} className="vz-rec-plano">
              <rect x={su(0)} y={sa(44)} width={su(100) - su(0)} height={sa(-4) - sa(44)} className="vz-rec-fora" />
              <rect x={su(n.u0)} y={sa(44)} width={su(n.u1) - su(n.u0)} height={sa(-4) - sa(44)} className="vz-rec-dentro" />
              {[0, 50, 100].map((u) => <text key={u} x={su(u)} y={PH - PMB + 14} textAnchor="middle" className="vz-tick">{u}%</text>)}
              {[0, 20, 40].map((a) => <text key={a} x={PML - 4} y={sa(a) + 4} textAnchor="end" className="vz-tick">{a} d</text>)}
              <text x={su(50)} y={PH - 4} textAnchor="middle" className="vz-rotulo">utilização</text>
              {n.melhor.v === "util" ? <line x1={su(n.melhor.corte)} x2={su(n.melhor.corte)} y1={sa(44)} y2={sa(-4)} className="vz-arv-cand" /> : <line x1={su(n.u0)} x2={su(n.u1)} y1={sa(n.melhor.corte)} y2={sa(n.melhor.corte)} className="vz-arv-cand" />}
              {BASE.map((p) => { const dentro = n.grupo.includes(p); return <g key={p.id} style={{ transform: `translate(${su(p.util)}px, ${sa(p.atraso)}px)`, opacity: dentro ? 1 : 0.18 }}><circle r={dentro ? 8 : 5} className={p.y ? "vz-int-c--default" : "vz-int-c--pagou"} />{dentro && <text y={3.5} textAnchor="middle" className="vz-cc-id">{p.id}</text>}</g>; })}
              <text x={n.k === "esq" ? su(n.u0) + 4 : su(n.u1) - 4} y={PMT - 8} textAnchor={n.k === "esq" ? "start" : "end"} className="vz-ks-t">{rotuloCorte(n.melhor.v, n.melhor.corte)} · ganho {fmtNum(n.melhor.ganho, 3)}</text>
            </svg>
            <div className="table-wrap"><table className="table text-[.8em] vz-rec-tab"><thead><tr><th rowSpan={2} scope="col">Corte candidato</th><th colSpan={2} scope="colgroup" className="vz-rec-grupo">Propostas</th><th rowSpan={2} scope="col">Ganho</th></tr><tr><th scope="col">≤ corte</th><th scope="col">&gt; corte</th></tr></thead><tbody>
              {n.cands.slice(0, 4).map((c, i) => <tr key={`${c.v}-${c.corte}`} className={i === 0 ? "vz-t-on" : ""}><th scope="row">{rotuloCorte(c.v, c.corte).replace("≤ ", "≤\u00a0")}</th><td>{c.esq.length}</td><td>{c.dir.length}</td><td className={i === 0 ? "vz-t-forte" : ""}>{fmtNum(c.ganho, 5)}</td></tr>)}
            </tbody></table></div>
          </div>
        </div>)}
      </div>
      <div className="vz-tiles vz-tiles--2 vz-rec-tiles">
        <div className="vz-tile vz-tile--ok"><p className="eyebrow">Duas propriedades da recursão</p><p className="vz-num vz-num--texto">A variável da raiz pode voltar com outro corte, como nos dois lados desta base. E cada lado escolhe sem olhar o outro: a busca é local, nó a nó.</p></div>
        <div className="vz-tile vz-tile--alerta"><p className="eyebrow">O custo de ser local</p><p className="vz-num vz-num--texto">A árvore é gulosa: fica com o melhor corte agora, sem testar se um corte pior abriria cortes melhores depois. Nada garante a melhor árvore possível.</p></div>
      </div>
      <p className="vz-fonte">Nó esquerdo: Gini 0,21875, vence utilização ≤ 27,5% com ganho 0,09375 (folhas de 2 e 6). Nó direito: Gini 0,21875, utilização ≤ 87,5% e atraso ≤ 2,5 d empatam em 0,09375 e a ordem de avaliação decide pela utilização. Recursão significa repetir a mesma pergunta: qual corte reduz mais a mistura aqui dentro?</p>
    </figure>
  );
}
