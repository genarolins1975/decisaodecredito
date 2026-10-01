"use client";
import { useState } from "react";
import { Botao, escala, Grafico, Kpi, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, faixasQuantis, logit, sigmoide, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 18 · c7p29 · Calibração global. A logística prevê 71,6 defaults e a janela teve 81 (O/E = 1,13: risco subestimado).
 * O modelo comprimido é ilustrativo: σ(a + 0,3 · logit p), com a escolhido para que a média prevista seja exatamente a
 * taxa observada (resolvido por Newton). No total ele acerta; separado em duas metades da fila, erra para cima numa e
 * para baixo na outra.
 */
type Mod = "logistica" | "comprimido";
const TAXA = D / N;
const A_COMP = (() => { let a = 0; for (let k = 0; k < 60; k++) { let f = 0, g = 0; for (const p of PL) { const q = sigmoide(a + 0.3 * logit(p)); f += q; g += q * (1 - q); } const da = (f - D) / g; a -= da; if (Math.abs(da) < 1e-13) break; } return a; })();
const PC = transformar(PL, A_COMP, 0.3);
const DADOS: Record<Mod, { nome: string; pd: readonly number[] }> = { logistica: { nome: "Logística", pd: PL }, comprimido: { nome: "Comprimido (ilustrativo)", pd: PC } };

export function S18Global({ pagina }: { pagina?: Pagina }) {
  const [mod, setMod] = useState<Mod>("logistica");
  const [dois, setDois] = useState(false);
  const pd = DADOS[mod].pd; const g = calibracaoGlobal(Y, pd); const metades = faixasQuantis(Y, pd, 2);
  const grupos = dois ? metades.map((f, i) => ({ nome: i ? "Metade mais arriscada" : "Metade menos arriscada", prev: f.pdMedia!, obs: f.obs!, n: f.n, d: f.d })) : [{ nome: "Carteira inteira", prev: g.pdMedia!, obs: g.taxa!, n: g.n, d: g.observados }];
  return (
    <Quadro slug="c7p29" pagina={pagina} layout="gl"
      conclusao={!dois ? (mod === "logistica" ? <>A logística espera {num(g.esperados, 1)} defaults e a janela teve {D}: <b>O/E = {num(g.razaoOE!, 2)}</b>, risco subestimado em {pct(g.razaoOE! - 1, 0)} no agregado.</> : <>O comprimido acerta o total: {num(g.esperados, 1)} esperados, {D} observados, <b>O/E = {num(g.razaoOE!, 2)}</b>. Isso prova calibração? Separe a carteira.</>)
        : <>Metade de baixo: prevê {pct(metades[0].pdMedia!, 1)}, observa {pct(metades[0].obs!, 1)}. Metade de cima: prevê {pct(metades[1].pdMedia!, 1)}, observa {pct(metades[1].obs!, 1)}. {mod === "comprimido" ? <><b>Os erros se compensam na média</b>: igualdade no total não demonstra calibração por faixa.</> : "A logística erra pouco nas duas, sempre para baixo."}</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults (taxa ${pct(TAXA, 2)}). O/E = defaults observados ÷ soma das PDs: acima de 1, o modelo subestima o risco. Modelo comprimido: σ(${num(A_COMP, 4)} + 0,3 · logit p), construído só para esta demonstração.`}>
      <Painel titulo={dois ? "Duas metades da fila, previsto contra observado" : "Previsto contra observado, na carteira inteira"}>
        <Grafico rotulo={grupos.map((x) => `${x.nome}: previsto ${pct(x.prev, 1)}, observado ${pct(x.obs, 1)}`).join("; ")} arCelular="16 / 10">
          {(d) => {
            const base = d.h - d.fs * 2.8, topo = d.fs * 1.6; const y = escala([0, 0.25], [base, topo]); const gw = d.w / grupos.length; const bw = Math.min(gw * 0.26, d.fs * 5);
            return (
              <g>
                {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((v) => <g key={v}><line className="q7-grade" x1={d.fs * 2.6} x2={d.w} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={d.fs * 2.2} y={y(v)} dy=".34em" textAnchor="end">{pct(v, 0)}</text></g>)}
                {grupos.map((gr, i) => { const cx = d.fs * 2.6 + gw * i + gw / 2 - d.fs * 1.3; return (
                  <g key={gr.nome}>
                    <rect x={cx - bw - 4} y={y(gr.prev)} width={bw} height={base - y(gr.prev)} fill="#176C73" /><text className="q7-rot" x={cx - bw / 2 - 4} y={y(gr.prev) - 8} textAnchor="middle" style={{ fill: "#176C73" }}>{pct(gr.prev, 1)}</text>
                    <rect x={cx + 4} y={y(gr.obs)} width={bw} height={base - y(gr.obs)} fill="#8C2332" /><text className="q7-rot" x={cx + bw / 2 + 4} y={y(gr.obs) - 8} textAnchor="middle" style={{ fill: "#8C2332" }}>{pct(gr.obs, 1)}</text>
                    <text className="q7-eixo-t" x={cx} y={base} dy="1.3em" textAnchor="middle">{gr.nome}</text>
                    <text className="q7-tick" x={cx} y={base} dy="2.5em" textAnchor="middle">{gr.d} defaults em {gr.n}</text>
                  </g>
                ); })}
                <line className="q7-eixo" x1={d.fs * 2.6} x2={d.w} y1={base} y2={base} />
              </g>
            );
          }}
        </Grafico>
        <ul className="q7-leg"><li><span className="q7-mk" style={{ background: "#176C73", borderRadius: 2 }} />PD média prevista</li><li><span className="q7-mk" style={{ background: "#8C2332", borderRadius: 2 }} />default observado</li></ul>
      </Painel>
      <Painel>
        <Seg rotulo="Modelo" opcoes={[{ v: "logistica" as Mod, r: "Logística" }, { v: "comprimido" as Mod, r: "Comprimido" }]} valor={mod} onChange={setMod} />
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Defaults esperados" valor={num(g.esperados, 1)} detalhe="soma das PDs" tom="prob" />
          <Kpi rotulo="Observados" valor={String(D)} detalhe={`de ${N}`} tom="def" />
          <Kpi rotulo="PD média" valor={pct(g.pdMedia!, 2)} detalhe={`taxa observada ${pct(TAXA, 2)}`} />
          <Kpi rotulo="Razão O/E" valor={num(g.razaoOE!, 2)} detalhe={g.razaoOE! > 1.005 ? "acima de 1: subestima" : g.razaoOE! < 0.995 ? "abaixo de 1: superestima" : "igual a 1 no total"} tom="dec" />
        </div>
        <div className="q7-botoes"><Botao prim={!dois} onClick={() => setDois(!dois)}>{dois ? "Juntar a carteira" : "Separar em dois grupos"}</Botao><Botao sec onClick={() => { setDois(false); setMod("logistica"); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
