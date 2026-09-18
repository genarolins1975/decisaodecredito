"use client";
import { useMemo, useState } from "react";
import mon from "@/lib/visuais/monitoramento.json";
import { diferencaProporcoes, PERGUNTAS, type Grupo } from "@/lib/visuais/monitoramento";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * Equidade depende da pergunta (capítulo 9, c9p6). Dois grupos declarados, quatro perguntas com numerador e
 * denominador próprios, e o intervalo da diferença. A turma escolhe a pergunta e vê o que a amostra atual consegue
 * ou não detectar; um controle multiplica a amostra para mostrar o intervalo encolher.
 */
const G1 = mon.fair.G1 as Grupo, G2 = mon.fair.G2 as Grupo;
const W = 560, H = 210, ML = 150, MR = 20;
const escalar = (g: Grupo, f: number): Grupo => ({ n: Math.round(g.n * f), tp: Math.round(g.tp * f), fp: Math.round(g.fp * f), fn: Math.round(g.fn * f), tn: Math.round(g.tn * f) });

export function Equidade() {
  const [q, setQ] = useState(0);
  const [fator, setFator] = useState(1);
  const perg = PERGUNTAS[q];
  const g1 = useMemo(() => escalar(G1, fator), [fator]), g2 = useMemo(() => escalar(G2, fator), [fator]);
  const d = diferencaProporcoes(perg.k(g1), perg.n(g1), perg.k(g2), perg.n(g2));
  const ic = (k: number, n: number) => { const p = k / n; const se = Math.sqrt((p * (1 - p)) / n); return { p, lo: Math.max(0, p - 1.96 * se), hi: Math.min(1, p + 1.96 * se) }; };
  const i1 = ic(perg.k(g1), perg.n(g1)), i2 = ic(perg.k(g2), perg.n(g2));
  const max = Math.min(1, Math.max(i1.hi, i2.hi) * 1.25);
  const sx = (v: number) => ML + (v / max) * (W - ML - MR);
  return (
    <figure className="vz" data-vz="equidade">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Equidade depende da pergunta · dois grupos declarados na janela fora do tempo · o gerador da aula</p>
          <p className="vz-tit">Quatro perguntas, quatro denominadores. Cada uma responde a uma decisão diferente, e cada uma tem a sua incerteza.</p>
        </div>
        <div className="vz-acoes">
          <div className="vz-seg" role="group" aria-label="Pergunta">
            {PERGUNTAS.map((p, i) => <button key={p.id} type="button" className={`vz-seg-b ${q === i ? "vz-seg-b--on" : ""}`} onClick={() => setQ(i)}>{p.rotulo}</button>)}
          </div>
        </div>
      </header>
      <div className="vz-estado"><b>{perg.pergunta}</b> Grupo 1: {fmtPct(d.p1, 1)} ({perg.k(g1)} de {perg.n(g1)}). Grupo 2: {fmtPct(d.p2, 1)} ({perg.k(g2)} de {perg.n(g2)}). Diferença {d.dif >= 0 ? "+" : ""}{fmtNum(d.dif * 100, 1)} pp, IC 95% de {fmtNum(d.lo * 100, 1)} a {d.hi >= 0 ? "+" : ""}{fmtNum(d.hi * 100, 1)} pp: {d.excluiZero ? "o intervalo exclui zero" : "o intervalo inclui zero, leitura incerta"}.</div>
      <div className="vz-eq-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Taxa por grupo com intervalo de 95% <span className="hint">barra: taxa · traço: intervalo</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${perg.rotulo} por grupo com intervalos`}>
            {[0, 0.25, 0.5, 0.75, 1].filter((v) => v <= max).map((v) => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={20} y2={H - 30} className="vz-grade" /><text x={sx(v)} y={H - 14} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text></g>)}
            {[{ r: "Grupo 1", n: perg.n(g1), i: i1, y: 50 }, { r: "Grupo 2", n: perg.n(g2), i: i2, y: 120 }].map((g) => <g key={g.r}>
              <text x={ML - 10} y={g.y + 5} textAnchor="end" className="vz-rotulo">{g.r} <tspan className="vz-tick">· n {g.n}</tspan></text>
              <rect x={sx(0)} y={g.y - 14} width={sx(g.i.p) - sx(0)} height={28} rx={4} className="vz-eq-barra" />
              <line x1={sx(g.i.lo)} x2={sx(g.i.hi)} y1={g.y} y2={g.y} className="vz-eq-ic" /><line x1={sx(g.i.lo)} x2={sx(g.i.lo)} y1={g.y - 9} y2={g.y + 9} className="vz-eq-ic" /><line x1={sx(g.i.hi)} x2={sx(g.i.hi)} y1={g.y - 9} y2={g.y + 9} className="vz-eq-ic" />
              <text x={sx(g.i.hi) + 8} y={g.y + 5} className="vz-ponto-t">{fmtPct(g.i.p, 1)}</text>
            </g>)}
          </svg>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>E se a amostra fosse maior, na mesma proporção?</span><span className="vz-slider-valor">{fator === 1 ? "amostra atual" : `${fator} vezes`}</span></span><input type="range" min={1} max={10} step={1} value={fator} onChange={(e) => setFator(Number(e.target.value))} /></label>
        </div>
        <div className="vz-eq-painel">
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">Diferença entre grupos</p><p className={`vz-num ${d.excluiZero ? "vz-num--default" : ""}`}>{d.dif >= 0 ? "+" : ""}{fmtNum(d.dif * 100, 1)} pp</p><p className="hint">IC 95% de {fmtNum(d.lo * 100, 1)} a {d.hi >= 0 ? "+" : ""}{fmtNum(d.hi * 100, 1)} pp</p>
              <svg viewBox="0 0 240 40" className="vz-ind-ic" role="img" aria-label="Intervalo da diferença"><line x1={20} x2={220} y1={20} y2={20} className="vz-grade" /><line x1={120} x2={120} y1={8} y2={32} className="vz-zero" /><line x1={120 + Math.max(-0.25, d.lo) * 400} x2={120 + Math.min(0.25, d.hi) * 400} y1={20} y2={20} className="vz-ind-ic-linha" /><circle cx={120 + d.dif * 400} cy={20} r={5} className="vz-ind-ic-pt" /><text x={120} y={38} textAnchor="middle" className="vz-tick">0</text><text x={20} y={38} className="vz-tick">−25 pp</text><text x={220} y={38} textAnchor="end" className="vz-tick">+25 pp</text></svg></div>
            <div className="vz-tile"><p className="eyebrow">Leitura</p><p className="vz-num vz-num--texto">{d.excluiZero ? `Com esta amostra a diferença é detectável: ${perg.rotulo.toLowerCase()} distingue os grupos. Isso ainda não diz a causa.` : fator === 1 ? "Nenhum intervalo exclui zero nesta amostra. Isso não prova igualdade: delimita o que os dados atuais conseguem detectar." : "Ainda inclui zero mesmo com a amostra maior: a diferença observada é pequena para o denominador."}</p></div>
            <div className="vz-tile"><p className="eyebrow">Numerador e denominador</p><p className="vz-num vz-num--texto">{q === 0 ? "aprovados ÷ propostas do grupo" : q === 1 ? "defaults ÷ propostas do grupo" : q === 2 ? "recusados que pagariam ÷ pagadores do grupo" : "recusados que dariam default ÷ recusados do grupo"}</p></div>
          </div>
        </div>
      </div>
      <p className="vz-fonte">Grupos e contagens do gerador (DADOS.fair: grupo 1 com 509 propostas, grupo 2 com 228). Intervalo de Wald para a diferença de proporções; aprovação 72,7% contra 68,0%, diferença 4,7 pp com IC de −2,5 a 11,9 pp, os números da página.</p>
    </figure>
  );
}
