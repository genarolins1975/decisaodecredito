"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { BETA_AULA, atrasoNaFronteira, escore, perdaIndividual, sigmoide, type Proposta } from "@/lib/visuais/logistica";
import { crescer, folhas } from "@/lib/visuais/arvore";
import { caminhoNaArvore } from "./arvore-diagrama";

/**
 * Árvore contra logística, com os mesmos dados (capítulo 5, c5p18). As 16 propostas no plano: a fronteira reta da
 * logística e a partição escalonada da árvore; a PD de cada família por proposta, as maiores discordâncias e a
 * perda de treino de cada uma, que não decide nada.
 */
const BASE = did.base as Proposta[];
const PW = 640, PH = 380, PML = 46, PMR = 14, PMT = 16, PMB = 40;
const su = (u: number) => PML + (u / 100) * (PW - PML - PMR), sa = (a: number) => PMT + (1 - a / 40) * (PH - PMT - PMB);
const ENTREGA = [["Fronteira", "reta", "escalonada"], ["Interação", "só se escrita", "automática"], ["PD", "contínua", "constante por região"], ["Explicação individual", "contribuições somadas", "caminho de regras"], ["Estabilidade", "alta", "baixa"], ["Extrapolação", "continua a reta", "repete a folha da borda"]];

export function DuasFamilias() {
  const [sel, setSel] = useState(5);
  const arvore = useMemo(() => crescer(BASE, 2), []);
  const fs = folhas(arvore);
  const linhas = useMemo(() => BASE.map((r) => { const pl = sigmoide(escore(BETA_AULA, r.util, r.atraso).z); const f = caminhoNaArvore(arvore, r.util, r.atraso).pop()!; const pa = f.d / f.n; const paC = Math.min(0.98, Math.max(0.02, pa)); return { ...r, pl, pa, ll: perdaIndividual(pl, r.y), la: perdaIndividual(paC, r.y) }; }), [arvore]);
  const perdaL = linhas.reduce((s, l) => s + l.ll, 0) / 16, perdaA = linhas.reduce((s, l) => s + l.la, 0) / 16;
  const q = linhas[sel - 1]; const dif = 100 * (q.pa - q.pl);
  const porque = q.pa === 0 && q.pl > 0.3 ? "A reta logística vê risco moderado; a árvore caiu numa folha sem defaults." : q.pa === 1 && q.pl < 0.6 ? "A árvore caiu numa folha só de defaults; a logística, olhando a soma das duas variáveis, vê menos risco." : Math.abs(dif) < 10 ? "As duas famílias quase concordam nesta proposta." : "A árvore repete a taxa da região; a logística responde à posição exata.";
  const fronteira = Array.from({ length: 101 }, (_, u) => [u, atrasoNaFronteira(BETA_AULA, 0.5, u)] as const).filter(([, a]) => a >= 0 && a <= 40).map(([u, a], i) => `${i ? "L" : "M"}${su(u).toFixed(1)} ${sa(a).toFixed(1)}`).join("");
  return (
    <figure className="vz" data-vz="duas-familias">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Árvore contra logística · os mesmos 16 dados · reta contra escada</p>
          <p className="vz-tit">As duas famílias erram de maneiras diferentes. A escolha depende do uso, não de superioridade geral.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Propostas de exemplo">
          {[5, 10, 15].map((i) => <button key={i} type="button" className={`btn btn-sm ${sel === i ? "" : "btn-secondary"}`} onClick={() => setSel(i)}>#{i}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>Proposta #{q.id}, utilização {q.util}% e atraso {q.atraso} d, y = {q.y}:</b> logística {fmtPct(q.pl, 1)}, árvore {fmtPct(q.pa)}, {fmtNum(Math.abs(dif), 1)} pontos de diferença. {porque} Treino: log loss {fmtNum(perdaL, 5)} contra {fmtNum(perdaA, 5)}, e essa comparação não escolhe o modelo.</div>
      <div className="vz-df-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Reta contra escada <span className="hint">linha: PD 50% da logística · regiões: a folha da árvore e sua taxa · clique numa proposta</span></p>
          <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label="Fronteira da logística e partição da árvore sobre as 16 propostas">
            {fs.map((f) => { const p = f.d / f.n; return <rect key={`${f.caixa.u0}-${f.caixa.a0}`} x={su(f.caixa.u0)} y={sa(f.caixa.a1)} width={su(f.caixa.u1) - su(f.caixa.u0)} height={sa(f.caixa.a0) - sa(f.caixa.a1)} className="vz-arv-rect" style={{ fill: p >= 0.5 ? "var(--color-alert)" : "#9db6de", fillOpacity: 0.1 + Math.abs(p - 0.5) * 0.4 }} />; })}
            {fs.map((f) => <text key={`t${f.caixa.u0}-${f.caixa.a0}`} x={su(f.caixa.u0) + 5} y={sa(f.caixa.a1) + 14} className="vz-tick vz-tick--forte">árvore {fmtPct(f.d / f.n)}</text>)}
            {[0, 25, 50, 75, 100].map((u) => <text key={u} x={su(u)} y={PH - PMB + 16} textAnchor="middle" className="vz-tick">{u}%</text>)}
            {[0, 10, 20, 30, 40].map((a) => <text key={a} x={PML - 6} y={sa(a) + 4} textAnchor="end" className="vz-tick">{a} d</text>)}
            <text x={su(50)} y={PH - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            <text x={PML + 4} y={PMT - 4} className="vz-rotulo">maior atraso em 6 meses</text>
            <path d={fronteira} className="vz-front-reta" />
            {BASE.map((p) => { const on = p.id === sel; return <g key={p.id} className={`vz-df-ponto ${on ? "vz-df-ponto--on" : ""}`} style={{ transform: `translate(${su(p.util)}px, ${sa(p.atraso)}px)`, cursor: "pointer" }} onClick={() => setSel(p.id)} role="button" aria-label={`Proposta ${p.id}`} tabIndex={-1}><circle r={on ? 11 : 8} className={p.y ? "vz-int-c--default" : "vz-int-c--pagou"} /><text y={3.5} textAnchor="middle" className="vz-cc-id">{p.id}</text></g>; })}
          </svg>
          <div className="vz-df-cartao">
            <div className="vz-tile"><p className="eyebrow">logística</p><p className="vz-num">{fmtPct(q.pl, 1)}</p><p className="hint">soma ponderada, fronteira reta</p></div>
            <div className="vz-df-x" aria-hidden="true">×</div>
            <div className="vz-tile"><p className="eyebrow">árvore</p><p className={`vz-num ${q.pa >= 0.5 ? "vz-num--default" : ""}`}>{fmtPct(q.pa)}</p><p className="hint">taxa da folha, constante na região</p></div>
          </div>
        </div>
        <div className="vz-df-lado">
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">Log loss da logística</p><p className="vz-num">{fmtNum(perdaL, 5)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Log loss da árvore</p><p className="vz-num">{fmtNum(perdaA, 5)}</p><p className="hint">piso e teto de 2% e 98% nas folhas puras</p></div>
          </div>
          <div className="vz-tile vz-tile--alerta"><p className="eyebrow">Este número não decide nada</p><p className="vz-num vz-num--texto">As duas perdas são calculadas na mesma amostra em que os dois modelos foram estimados. O capítulo 2 já mostrou que essa comparação é vazia. Com dezesseis propostas não existe amostra separada possível, e a comparação de verdade acontece no capítulo 7, na base de 5.000, com teste estatístico.</p></div>
          <div className="table-wrap vz-df-tabela"><table className="table text-[.8em]"><thead><tr><th>#</th><th>Util.</th><th>Atraso</th><th>y</th><th>Logística</th><th>Árvore</th><th>Diferença</th></tr></thead><tbody>
            {linhas.map((l) => <tr key={l.id} className={`${l.id === sel ? "vz-t-on" : ""} ${Math.abs(l.pl - l.pa) > 0.35 ? "vz-t-cara" : ""}`} onClick={() => setSel(l.id)} style={{ cursor: "pointer" }}><th scope="row">#{l.id}</th><td>{l.util}%</td><td>{l.atraso} d</td><td className={l.y ? "vz-t-default" : "vz-t-ok"}>{l.y}</td><td>{fmtPct(l.pl, 1)}</td><td>{fmtPct(l.pa)}</td><td>{fmtNum(100 * (l.pa - l.pl), 1)} pp</td></tr>)}
          </tbody></table></div>
          <p className="hint">Linhas em rosa: discordância acima de 35 pontos de PD.</p>
          <div className="vz-tile"><p className="eyebrow">O que cada família entrega</p>
            <table className="table text-[.85em]"><thead><tr><th></th><th>Logística</th><th>Árvore</th></tr></thead><tbody>{ENTREGA.map((r) => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table></div>
        </div>
      </div>
      <p className="vz-fonte">Logística com os coeficientes da aula; árvore de profundidade 2 crescida aqui. #5 (40%, 20 d, y = 0): 52,6% contra 0%; #10 (65%, 0 d, y = 1): 30,5% contra 100%; #15 (90%, 0 d, y = 0): 73,9% contra 50%. Log loss de treino 0,43282 contra 0,18844, a árvore avaliada na amostra que usou para criar as folhas. Se a árvore é instável e a logística é rígida, existe uma terceira via.</p>
    </figure>
  );
}
