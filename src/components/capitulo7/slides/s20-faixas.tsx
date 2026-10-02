"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { corp, faixasFixas, faixasQuantis, wilson, type Faixa } from "@/lib/capitulo7/metricas";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 20 · c7p30 · As faixas mudam a leitura. Faixas de largura fixa entre 0% e 50% (convenção (a, b] do scikit-learn) ou
 * de mesmo tamanho pela posição na fila. Faixa vazia aparece marcada no eixo e nunca vira taxa zero; a ocupação de cada
 * faixa fica ao lado. As PDs não mudam: só o agrupamento. A terceira opção dispensa a escolha: o diagrama CORP
 * (Dimitriadis, Gneiting e Jordan, 2021) desenha a curva crescente mais próxima dos dados (regressão isotônica, slide
 * 30), em degraus que os próprios dados formam. A decomposição do Brier que vem com ela fica no slide 25, depois do Brier.
 */
type Tipo = "fixas" | "quantis" | "corp";
const C = corp(Y, PL);
/** Degraus da isotônica como faixas: casos com a mesma PD recalibrada, em ordem de PD. */
const BLOCOS: Faixa[] = (() => {
  const ord = PL.map((_, i) => i).sort((a, b) => PL[a] - PL[b] || a - b); const out: Faixa[] = []; let ids: number[] = [];
  const fecha = () => { if (!ids.length) return; const d = ids.reduce((s, i) => s + Y[i], 0), sp = ids.reduce((s, i) => s + PL[i], 0); const ic = wilson(d, ids.length);
    out.push({ j: out.length + 1, n: ids.length, d, somaPd: sp, pdMedia: sp / ids.length, obs: d / ids.length, ic, de: PL[ids[0]], ate: PL[ids[ids.length - 1]], compativel: ic ? sp / ids.length >= ic.lo && sp / ids.length <= ic.hi : null }); ids = []; };
  for (const i of ord) { if (ids.length && C.recalibrada[i] !== C.recalibrada[ids[0]]) fecha(); ids.push(i); }
  fecha(); return out;
})();
const fixas = (k: number) => faixasFixas(Y, PL, Array.from({ length: k + 1 }, (_, i) => (0.5 * i) / k));
const K_EX = 20;
const MAX = 0.5;
const F_EX = fixas(K_EX);
const VAZ_EX = F_EX.filter((f) => f.n === 0).length, PEQ_EX = F_EX.filter((f) => f.n > 0 && f.n < 30).length;
const OPS = [
  { texto: "Nenhuma: toda faixa tem alguém", certa: false, retorno: <>Largura igual não é ocupação igual: há poucas PDs acima de 35%, e as faixas de cima ficam sem casos. Confunde largura com tamanho da amostra.</> },
  { texto: `${VAZ_EX} vazias, e muitas quase vazias`, certa: true, retorno: <>Isso: {VAZ_EX} vazias e {PEQ_EX} com menos de 30 casos. Faixa vazia não tem ponto; faixa pequena dá ponto que pula.</> },
  { texto: "Mais da metade", certa: false, retorno: <>São {VAZ_EX} vazias, não {K_EX / 2} ou mais. Confunde faixa pequena com faixa vazia: as {PEQ_EX} com menos de 30 casos têm ponto, só que instável.</> },
];

export function S20Faixas({ pagina }: { pagina?: Pagina }) {
  const [tipo, setTipo] = useState<Tipo>("quantis");
  const [k, setK] = useState(10);
  const [esc, setEsc] = useState<number | null>(null);
  const F = tipo === "corp" ? BLOCOS : tipo === "quantis" ? faixasQuantis(Y, PL, k) : fixas(k);
  const vazias = F.filter((f) => f.n === 0).length, pequenas = F.filter((f) => f.n > 0 && f.n < 30).length;
  const nmax = Math.max(...F.map((f) => f.n));
  const liberado = esc !== null && OPS[esc].certa;
  const ult = F[F.length - 1], pri = F[0];
  const nFora = tipo === "corp" ? 0 : F.filter((f) => f.n > 0 && f.obs! > MAX).length;
  return (
    <Quadro slug="c7p30" pagina={pagina} layout="gl"
      conclusao={tipo === "corp" ? <>Sem escolher faixas: a curva crescente mais próxima dos dados (isotônica, detalhada no slide 30) forma <b>{BLOCOS.length} degraus</b> definidos pelos próprios dados, do menor ({Math.min(...BLOCOS.map((b) => b.n))} casos) ao maior ({int(nmax)}). O slide 25 usa essa curva para separar o Brier.</>
        : tipo === "fixas" ? <>Com {k} faixas de {pct(0.5 / k, 1)} de largura: <b>{vazias} vazia{vazias === 1 ? "" : "s"} e {pequenas} com menos de 30 casos</b>. Faixas vazias não têm ponto; pontos de faixas pequenas pulam. O agrupamento muda o desenho, não as PDs.</>
        : <>{k === 10 ? "Os decis do slide 19" : `${k} faixas de mesmo tamanho`}: nenhuma vazia, cerca de {int(Math.round(N / k))} casos cada, mas larguras desiguais: a de baixo cobre de {pct(pri.de, 1)} a {pct(pri.ate, 1)}; a de cima, de {pct(ult.de, 1)} a {pct(ult.ate, 1)}.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults; PD da logística. Fixas: bordas de 0% a 50% em passos iguais, faixa (a, b]. Mesmo tamanho: posições ⌊j·n/k + ½⌋ da fila crescente. CORP: Dimitriadis, Gneiting e Jordan (2021), PNAS 118(8); isotônica conferida com o scikit-learn.`}>
      <Painel>
        <div className="q7-g2-s20">
          <div className="q7-g2-quad">
            <Confiabilidade rotulo={tipo === "corp" ? `Diagrama CORP: ${BLOCOS.length} degraus da isotônica` : `Curva de confiabilidade com ${k} faixas ${tipo === "fixas" ? "de largura fixa" : "de mesmo tamanho"}`} max={MAX} series={[{ faixas: F.filter((f) => f.n > 0 && f.obs! <= MAX), classe: "prob", linha: tipo !== "corp" }]} anotar={false}
              extra={tipo === "corp" ? (x, y) => <path className="q7-linha q7-linha--prob" d={BLOCOS.map((b, i) => `${i ? "L" : "M"}${x(Math.min(MAX, b.de)).toFixed(1)} ${y(Math.min(MAX, b.obs!)).toFixed(1)}L${x(Math.min(MAX, b.ate)).toFixed(1)} ${y(Math.min(MAX, b.obs!)).toFixed(1)}`).join("")} />
                : (x, y, d) => { const vaz = F.filter((f) => f.n === 0), fora = F.filter((f) => f.n > 0 && f.obs! > MAX); return <g>
                  {vaz.map((f) => { const cx = x(Math.min(MAX, (f.de + f.ate) / 2)); return <line key={f.j} x1={cx} x2={cx} y1={y(0) - d.fs * 0.6} y2={y(0) + d.fs * 0.1} stroke="#5B6475" strokeWidth={2} strokeDasharray="3 3" />; })}
                  {vaz.length > 0 && <text className="q7-rot--peq" x={x(MAX)} y={y(0) - d.fs * 2.2} textAnchor="end" style={{ fill: "#5B6475", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.35em", strokeLinejoin: "round" }}>{vaz.length === 1 ? "vazia" : "vazias"}: {vaz.map((f) => `F${f.j}`).join(", ")}</text>}
                  {fora.map((f) => { const cx = x(Math.min(MAX, f.pdMedia!)); return <g key={f.j}><path d={`M${cx} ${y(MAX) - d.fs * 0.1}l${d.fs * 0.45} ${d.fs * 0.75}h${-d.fs * 0.9}Z`} fill="#176C73" /><text className="q7-rot--peq" x={cx + d.fs * 0.55} y={y(MAX) - d.fs * 0.95} style={{ fill: "#176C73", fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.35em", strokeLinejoin: "round" }}>▲ {f.d}/{f.n} = {pct(f.obs!, 0)}</text></g>; })}
                </g>; }} />
          </div>
          <div className="q7-g2-s20-lado">
            <Grafico titulo="Ocupação" sub={tipo === "corp" ? "propostas em cada degrau" : "propostas em cada faixa"} rotulo={`Ocupação ${tipo === "corp" ? "dos degraus" : "das faixas"}: ${F.map((f) => f.n).join(", ")}`} arCelular="5 / 2">
              {(d) => {
                const x = escala([0, F.length], [d.fs * 0.4, d.w - d.fs * 0.2]); const y = escala([0, nmax], [d.h - d.fs * 1.2, d.fs * 1.1]); const bw = (x(1) - x(0)) * 0.78;
                return <g>{F.map((f, i) => <g key={f.j}><rect x={x(i) + 1} y={y(f.n)} width={bw} height={Math.max(0, y(0) - y(f.n))} fill={f.n === 0 ? "none" : f.n < 30 ? "#E7E4DC" : "#9FC7C9"} stroke={f.n === 0 ? "#9AA1AD" : f.n < 30 ? "#5B6475" : "none"} strokeDasharray={f.n === 0 ? "3 3" : undefined} strokeWidth={1.5} />{(F.length <= 14 || f.n < 30) && <text className="q7-rot--peq" x={x(i) + bw / 2} y={y(f.n) - 4 - (F.length > 14 && i % 2 ? d.fs * 0.8 : 0)} textAnchor="middle" style={{ fill: "#2A3342", fontSize: F.length > 14 ? "0.8em" : undefined }}>{f.n}</text>}</g>)}<line className="q7-eixo" x1={x(0)} x2={x(F.length)} y1={y(0)} y2={y(0)} /><text className="q7-tick" x={x(0)} y={y(0)} dy="1.1em">PD menor</text><text className="q7-tick" x={x(F.length)} y={y(0)} dy="1.1em" textAnchor="end">PD maior</text></g>;
              }}
            </Grafico>
            <table className="q7-tab">
              <thead><tr><th className="q7-t-l">{tipo === "corp" ? "Degrau" : "Faixa"}</th><th>Bordas de PD</th><th>n</th><th>Obs.</th></tr></thead>
              <tbody>{F.slice(-4).map((f) => <tr key={f.j}><th>{tipo === "corp" ? "D" : "F"}{f.j}</th><td>{pct(f.de, 1)} a {pct(f.ate, 1)}</td><td>{f.n}</td><td>{f.obs === null ? "vazia" : pct(f.obs, 1)}</td></tr>)}</tbody>
            </table>
            <p className="q7-nota">As quatro {tipo === "corp" ? "degraus" : "faixas"} de maior PD. Na ocupação, contorno escuro: menos de 30 casos; tracejado: vazia.{nFora > 0 ? " Na curva, ▲: frequência acima de 50%, fora do eixo." : ""}</p>
          </div>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Com ${K_EX} faixas de largura fixa (${pct(0.5 / K_EX, 1)} cada, de 0% a 50%), quantas ficam vazias?`} opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && OPS[i].certa) { setTipo("fixas"); setK(K_EX); } }} recolher />
        <Seg rotulo="Tipo de faixa" opcoes={[{ v: "quantis" as Tipo, r: "Mesmo tamanho" }, { v: "fixas" as Tipo, r: "Largura fixa" }, { v: "corp" as Tipo, r: "Sem faixas (CORP)" }]} valor={tipo} onChange={setTipo} desab={!liberado} />
        <div className="q7-g2-linha">
          {tipo !== "corp" ? <Controle rotulo="Número de faixas" valor={k} min={3} max={20} passo={1} onChange={setK} mostrar={String(k)} escala={["3", "20"]} /> : <span />}
          <div className="q7-botoes"><Botao sec onClick={() => { setTipo("quantis"); setK(10); setEsc(null); }}>Restaurar</Botao></div>
        </div>
        {!liberado && <p className="q7-nota">Largura fixa e CORP abrem depois da previsão.</p>}
      </Painel>
    </Quadro>
  );
}
