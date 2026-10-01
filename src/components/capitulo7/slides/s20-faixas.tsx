"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, Painel, Quadro, Seg, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { faixasFixas, faixasQuantis } from "@/lib/capitulo7/metricas";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 20 · c7p30 · As faixas mudam a leitura. Faixas de largura fixa entre 0% e 50% (convenção (a, b] do scikit-learn) ou
 * de mesmo tamanho pela posição na fila. Faixa vazia aparece marcada no eixo e nunca vira taxa zero; a ocupação de cada
 * faixa fica embaixo. As PDs não mudam: só o agrupamento.
 */
type Tipo = "fixas" | "quantis";

export function S20Faixas({ pagina }: { pagina?: Pagina }) {
  const [tipo, setTipo] = useState<Tipo>("quantis");
  const [k, setK] = useState(10);
  const F = tipo === "quantis" ? faixasQuantis(Y, PL, k) : faixasFixas(Y, PL, Array.from({ length: k + 1 }, (_, i) => (0.5 * i) / k));
  const vazias = F.filter((f) => f.n === 0).length, pequenas = F.filter((f) => f.n > 0 && f.n < 30).length;
  const nmax = Math.max(...F.map((f) => f.n));
  return (
    <Quadro slug="c7p30" pagina={pagina} layout="qd"
      conclusao={tipo === "fixas" ? <>Com {k} faixas de {pct(0.5 / k, 1)} de largura: {vazias} vazia{vazias === 1 ? "" : "s"} e {pequenas} com menos de 30 casos. Pontos de faixas pequenas pulam muito; faixas vazias não têm ponto. <b>O agrupamento muda o desenho, não as PDs.</b></>
        : <>Com {k} faixas de mesmo tamanho (cerca de {int(Math.round(N / k))} casos cada), nenhuma fica vazia, mas as larguras variam: as faixas de cima cobrem um intervalo de PD muito maior que as de baixo.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; PD da logística. Fixas: bordas de 0% a 50% em passos iguais, faixa (a, b]. Mesmo tamanho: posições ⌊j·n/k + ½⌋ da fila crescente.`}>
      <Painel>
        <div className="q7-flex1">
          <Confiabilidade rotulo={`Curva de confiabilidade com ${k} faixas ${tipo === "fixas" ? "de largura fixa" : "de mesmo tamanho"}`} max={0.5} series={[{ faixas: F, classe: "prob", linha: true }]} anotar={false} />
        </div>
        <Grafico titulo="Ocupação" sub="propostas em cada faixa" rotulo={`Ocupação das ${k} faixas: ${F.map((f) => f.n).join(", ")}`} estilo={{ flex: "0 0 auto", height: "8.5cqw" }} arCelular="5 / 1">
          {(d) => {
            const x = escala([0, k], [d.fs * 2.4, d.w]); const y = escala([0, nmax], [d.h - d.fs * 1.4, d.fs * 0.9]); const bw = (x(1) - x(0)) * 0.78;
            return <g>{F.map((f, i) => <g key={f.j}><rect x={x(i) + 1} y={y(f.n)} width={bw} height={Math.max(0, y(0) - y(f.n))} fill={f.n === 0 ? "none" : f.n < 30 ? "#E5B48A" : "#9FC7C9"} stroke={f.n === 0 ? "#9AA1AD" : "none"} strokeDasharray="3 3" /><text className="q7-rot--peq" x={x(i) + bw / 2} y={y(f.n) - 4} textAnchor="middle" style={{ fill: "#2A3342" }}>{f.n}</text></g>)}<line className="q7-eixo" x1={x(0)} x2={x(k)} y1={y(0)} y2={y(0)} /></g>;
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Seg rotulo="Tipo de faixa" opcoes={[{ v: "quantis" as Tipo, r: "Mesmo tamanho" }, { v: "fixas" as Tipo, r: "Largura fixa" }]} valor={tipo} onChange={setTipo} />
        <Controle rotulo="Número de faixas" valor={k} min={3} max={20} passo={1} onChange={setK} mostrar={String(k)} escala={["3", "20"]} />
        <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Faixa</th><th>Bordas de PD</th><th>n</th><th>Obs.</th></tr></thead>
          <tbody>{F.slice(-6).map((f) => <tr key={f.j}><th>F{f.j}</th><td>{pct(f.de, 1)} a {pct(f.ate, 1)}</td><td>{f.n}</td><td>{f.obs === null ? "vazia" : pct(f.obs, 1)}</td></tr>)}</tbody>
        </table>
        <p className="q7-nota">As seis faixas de maior PD. Em laranja na ocupação: menos de 30 casos.</p>
        <div className="q7-botoes"><Botao onClick={() => { setTipo("fixas"); setK(20); }}>Exemplo: 20 faixas fixas</Botao><Botao sec onClick={() => { setTipo("quantis"); setK(10); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
