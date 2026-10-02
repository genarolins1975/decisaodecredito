"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, Kpi, Painel, Quadro, Seg, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { corp, faixasFixas, faixasQuantis, wilson, type Faixa } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 20 · c7p30 · As faixas mudam a leitura. Faixas de largura fixa entre 0% e 50% (convenção (a, b] do scikit-learn) ou
 * de mesmo tamanho pela posição na fila. Faixa vazia aparece marcada no eixo e nunca vira taxa zero; a ocupação de cada
 * faixa fica embaixo. As PDs não mudam: só o agrupamento. A terceira opção dispensa a escolha: o diagrama CORP
 * (Dimitriadis, Gneiting e Jordan, 2021) usa a regressão isotônica de y sobre a PD, e os próprios dados formam os
 * blocos; cada bloco vira um degrau, e o Brier se decompõe em MCB − DSC + UNC sem depender de faixas.
 */
type Tipo = "fixas" | "quantis" | "corp";
const C = corp(Y, PL), CG = corp(Y, PGR);
/** Blocos da isotônica como faixas: casos com a mesma PD recalibrada, em ordem de PD. */
const BLOCOS: Faixa[] = (() => {
  const ord = PL.map((_, i) => i).sort((a, b) => PL[a] - PL[b] || a - b); const out: Faixa[] = []; let ids: number[] = [];
  const fecha = () => { if (!ids.length) return; const d = ids.reduce((s, i) => s + Y[i], 0), sp = ids.reduce((s, i) => s + PL[i], 0); const ic = wilson(d, ids.length);
    out.push({ j: out.length + 1, n: ids.length, d, somaPd: sp, pdMedia: sp / ids.length, obs: d / ids.length, ic, de: PL[ids[0]], ate: PL[ids[ids.length - 1]], compativel: ic ? sp / ids.length >= ic.lo && sp / ids.length <= ic.hi : null }); ids = []; };
  for (const i of ord) { if (ids.length && C.recalibrada[i] !== C.recalibrada[ids[0]]) fecha(); ids.push(i); }
  fecha(); return out;
})();

export function S20Faixas({ pagina }: { pagina?: Pagina }) {
  const [tipo, setTipo] = useState<Tipo>("quantis");
  const [k, setK] = useState(10);
  const F = tipo === "corp" ? BLOCOS : tipo === "quantis" ? faixasQuantis(Y, PL, k) : faixasFixas(Y, PL, Array.from({ length: k + 1 }, (_, i) => (0.5 * i) / k));
  const vazias = F.filter((f) => f.n === 0).length, pequenas = F.filter((f) => f.n > 0 && f.n < 30).length;
  const nmax = Math.max(...F.map((f) => f.n));
  return (
    <Quadro slug="c7p30" pagina={pagina} layout="qd"
      conclusao={tipo === "corp" ? <>Sem escolher faixas: a isotônica junta os casos em <b>{BLOCOS.length} degraus</b> definidos pelos dados. O Brier de {num(C.bs, 4)} se separa em erro de calibração <b>MCB {num(C.mcb, 4)}</b>, discriminação DSC {num(C.dsc, 4)} e incerteza UNC {num(C.unc, 4)}.</>
        : tipo === "fixas" ? <>Com {k} faixas de {pct(0.5 / k, 1)} de largura: {vazias} vazia{vazias === 1 ? "" : "s"} e {pequenas} com menos de 30 casos. Pontos de faixas pequenas pulam muito; faixas vazias não têm ponto. <b>O agrupamento muda o desenho, não as PDs.</b></>
        : <>Com {k} faixas de mesmo tamanho (cerca de {int(Math.round(N / k))} casos cada), nenhuma fica vazia, mas as larguras variam: as faixas de cima cobrem um intervalo de PD muito maior que as de baixo.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; PD da logística. Fixas: bordas de 0% a 50% em passos iguais, faixa (a, b]. Mesmo tamanho: posições ⌊j·n/k + ½⌋ da fila crescente. CORP: Dimitriadis, Gneiting e Jordan (2021), PNAS 118(8); isotônica conferida com o scikit-learn.`}>
      <Painel>
        <div className="q7-flex1">
          <Confiabilidade rotulo={tipo === "corp" ? `Diagrama CORP: ${BLOCOS.length} degraus da isotônica` : `Curva de confiabilidade com ${k} faixas ${tipo === "fixas" ? "de largura fixa" : "de mesmo tamanho"}`} max={0.5} series={[{ faixas: F, classe: "prob", linha: tipo !== "corp" }]} anotar={false}
            extra={tipo === "corp" ? (x, y) => <path className="q7-linha q7-linha--prob" d={BLOCOS.map((b, i) => `${i ? "L" : "M"}${x(Math.min(0.5, b.de)).toFixed(1)} ${y(Math.min(0.5, b.obs!)).toFixed(1)}L${x(Math.min(0.5, b.ate)).toFixed(1)} ${y(Math.min(0.5, b.obs!)).toFixed(1)}`).join("")} /> : undefined} />
        </div>
        <Grafico titulo="Ocupação" sub={tipo === "corp" ? "propostas em cada degrau" : "propostas em cada faixa"} rotulo={`Ocupação das ${F.length} ${tipo === "corp" ? "degraus" : "faixas"}: ${F.map((f) => f.n).join(", ")}`} estilo={{ flex: "0 0 auto", height: "max(8.5cqw, 72px)" }} arCelular="5 / 1">
          {(d) => {
            const x = escala([0, F.length], [d.fs * 2.4, d.w]); const y = escala([0, nmax], [d.h - d.fs * 1.4, d.fs * 0.9]); const bw = (x(1) - x(0)) * 0.78;
            return <g>{F.map((f, i) => <g key={f.j}><rect x={x(i) + 1} y={y(f.n)} width={bw} height={Math.max(0, y(0) - y(f.n))} fill={f.n === 0 ? "none" : f.n < 30 ? "#E5B48A" : "#9FC7C9"} stroke={f.n === 0 ? "#9AA1AD" : "none"} strokeDasharray="3 3" /><text className="q7-rot--peq" x={x(i) + bw / 2} y={y(f.n) - 4} textAnchor="middle" style={{ fill: "#2A3342" }}>{f.n}</text></g>)}<line className="q7-eixo" x1={x(0)} x2={x(F.length)} y1={y(0)} y2={y(0)} /></g>;
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Seg rotulo="Tipo de faixa" opcoes={[{ v: "quantis" as Tipo, r: "Mesmo tamanho" }, { v: "fixas" as Tipo, r: "Largura fixa" }, { v: "corp" as Tipo, r: "Sem faixas (CORP)" }]} valor={tipo} onChange={setTipo} />
        {tipo === "corp" ? (
          <div className="q7-kpis q7-kpis--3">
            <Kpi rotulo="MCB (calibração)" valor={num(C.mcb, 4)} detalhe={`boosting ${num(CG.mcb, 4)}`} tom="prob" tam="mini" />
            <Kpi rotulo="DSC (ordenação)" valor={num(C.dsc, 4)} detalhe={`boosting ${num(CG.dsc, 4)}`} tom="val" tam="mini" />
            <Kpi rotulo="UNC" valor={num(C.unc, 4)} detalhe="da taxa média" tam="mini" />
          </div>
        ) : <Controle rotulo="Número de faixas" valor={k} min={3} max={20} passo={1} onChange={setK} mostrar={String(k)} escala={["3", "20"]} />}
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Faixa</th><th>Bordas de PD</th><th>n</th><th>Obs.</th></tr></thead>
          <tbody>{F.slice(tipo === "corp" ? -4 : -6).map((f) => <tr key={f.j}><th>{tipo === "corp" ? "D" : "F"}{f.j}</th><td>{pct(f.de, 1)} a {pct(f.ate, 1)}</td><td>{f.n}</td><td>{f.obs === null ? "vazia" : pct(f.obs, 1)}</td></tr>)}</tbody>
        </table>
        <p className="q7-nota">{tipo === "corp" ? <>Os quatro degraus de maior PD. Menor MCB, melhor calibração; maior DSC, melhor ordenação. Diagnóstico na própria amostra, não calibrador.</> : "As seis faixas de maior PD. Em laranja na ocupação: menos de 30 casos."}</p>
        <div className="q7-botoes"><Botao onClick={() => { setTipo("fixas"); setK(20); }}>Exemplo: 20 faixas fixas</Botao><Botao sec onClick={() => { setTipo("quantis"); setK(10); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
