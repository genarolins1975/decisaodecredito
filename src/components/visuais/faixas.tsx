"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import escores from "@/lib/visuais/escores.json";
import { wilson } from "@/lib/visuais/arvore";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { faixasIguais, logisticaNewton, sigmoide, type Proposta } from "@/lib/visuais/logistica";

/**
 * Faixas devolvem flexibilidade sem trocar de família (capítulo 4, c4p21). A mesma variável, utilização do limite,
 * tratada como contínua (um coeficiente) e em quatro faixas de contagem igual (três coeficientes): nas 16 propostas
 * didáticas, quatro casos por faixa e intervalos de Wilson que não afirmam nada; na base de treino do gerador
 * (2.103 propostas), a mesma escolha é razoável.
 */
const DID = did.base as Proposta[];
const BASES = {
  didatica: { nome: "16 propostas didáticas", x: DID.map((p) => p.util), y: DID.map((p) => p.y), yMax: 1, ticks: [0, 0.25, 0.5, 0.75, 1] },
  treino: { nome: "2.103 propostas de treino do gerador", x: escores.treino.util as number[], y: escores.treino.y as number[], yMax: 0.3, ticks: [0, 0.1, 0.2, 0.3] },
};
type Base = keyof typeof BASES;
const W = 640, H = 300, ML = 50, MR = 14, MT = 24, MB = 52;
const sx = (u: number) => ML + (u / 100) * (W - ML - MR);
const REGRAS = [
  { n: "Volume mínimo", t: "proporção da base por faixa suficiente para estimar a taxa com intervalo utilizável" },
  { n: "Monotonicidade imposta", t: "quando há hipótese econômica de direção, faixas fora de ordem indicam ruído, não descoberta" },
  { n: "Estabilidade no tempo", t: "fronteiras definidas no treino precisam continuar representativas nas safras seguintes. É o índice de estabilidade do capítulo 9" },
  { n: "Fronteiras declaradas", t: "faixas escolhidas olhando o alvo e não declaradas são uma forma silenciosa de sobreajuste" },
];

export function Faixas() {
  const [base, setBase] = useState<Base>("didatica");
  const b = BASES[base];
  const r = useMemo(() => {
    const faixas = faixasIguais(b.x, b.y).map((f) => ({ ...f, w: wilson(f.d, f.n) }));
    const [a, c] = logisticaNewton(b.x.map((v) => v / 10), b.y);
    const curva = Array.from({ length: 101 }, (_, u) => `${u ? "L" : "M"}${sx(u).toFixed(1)} ${sy(sigmoide(a + c * (u / 10)), b.yMax).toFixed(1)}`).join("");
    const monotona = faixas.every((f, i) => i === 0 || f.taxa >= faixas[i - 1].taxa);
    const largura = Math.max(...faixas.map((f) => f.w.hi - f.w.lo));
    return { faixas, a, c, curva, monotona, largura };
  }, [b]);
  const limites = r.faixas.map((f, i) => (i === 0 ? 0 : (r.faixas[i - 1].ate + f.de) / 2)).concat([100]);
  return (
    <figure className="vz" data-vz="faixas">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Laboratório: faixas devolvem flexibilidade sem trocar de família · utilização do limite</p>
          <p className="vz-tit">Cada faixa ganha o seu próprio efeito. O preço são mais parâmetros, e com poucos casos o preço é tudo.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Base">
          {(Object.keys(BASES) as Base[]).map((k) => <button key={k} type="button" className={`btn btn-sm ${base === k ? "" : "btn-secondary"}`} onClick={() => setBase(k)}>{BASES[k].nome}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>{b.nome}, quatro faixas de contagem igual:</b> {r.faixas.map((f) => `${f.n} casos`).filter((v, i, a) => a.indexOf(v) === i).join(" e ")} por faixa, taxas {r.faixas.map((f) => fmtPct(f.taxa, base === "didatica" ? 0 : 2)).join(", ")}; intervalos de Wilson com até {fmtNum(100 * r.largura, 0)} pontos de largura. {base === "didatica" ? "Nada afirmável, e a sequência nem é monótona." : "Faixas monótonas e intervalos estreitos: a mesma escolha é razoável."}</div>
      <div className="vz-fx-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Taxa de default por faixa, com intervalo de Wilson, e a logística contínua <span className="hint">um coeficiente contra três</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Taxas por faixa ${r.faixas.map((f) => fmtPct(f.taxa, 1)).join(", ")}`}>
            {b.ticks.map((v) => <g key={v}><line x1={sx(0)} x2={sx(100)} y1={sy(v, b.yMax)} y2={sy(v, b.yMax)} className="vz-grade" /><text x={ML - 6} y={sy(v, b.yMax) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text></g>)}
            {[0, 25, 50, 75, 100].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{v}%</text>)}
            <text x={sx(50)} y={H - 6} textAnchor="middle" className="vz-rotulo">utilização do limite</text>
            <text x={ML + 4} y={MT - 9} className="vz-rotulo">taxa de default</text>
            {r.faixas.map((f, i) => { const x0 = sx(limites[i]) + 2, x1 = sx(limites[i + 1]) - 2, xm = (x0 + x1) / 2; return <g key={i}>
              <rect x={x0} y={sy(Math.min(b.yMax, f.w.hi), b.yMax)} width={x1 - x0} height={sy(f.w.lo, b.yMax) - sy(Math.min(b.yMax, f.w.hi), b.yMax)} className="vz-fx-wilson" />
              <line x1={x0} x2={x1} y1={sy(Math.min(b.yMax, f.taxa), b.yMax)} y2={sy(Math.min(b.yMax, f.taxa), b.yMax)} className="vz-fx-taxa" />
              <text x={xm} y={sy(Math.min(b.yMax, f.taxa), b.yMax) - 7} textAnchor="middle" className="vz-tick vz-tick--forte">{fmtPct(f.taxa, base === "didatica" ? 0 : 1)}</text>
              <text x={xm} y={H - MB + 30} textAnchor="middle" className="vz-tick">{f.d} de {f.n}</text>
            </g>; })}
            <path d={r.curva} className="vz-curva vz-curva--ouro" />
          </svg>
          <div className="vz-legenda"><span><span className="vz-sw vz-sw--faixa" /> taxa observada na faixa, com o intervalo de Wilson de 95%</span><span><span className="vz-sw vz-sw--ouro" /> logística contínua só com utilização</span></div>
        </div>
        <div className="vz-fx-lado">
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th></th><th>Contínua</th><th>Em quatro faixas</th></tr></thead><tbody>
            <tr><th scope="row">Parâmetros</th><td>1</td><td>3</td></tr>
            <tr><th scope="row">Forma permitida</th><td>monótona e linear em log odds</td><td>qualquer, inclusive não monótona</td></tr>
            <tr><th scope="row">Risco</th><td>erro sistemático se a forma não bate</td><td>variância maior e faixas com poucos casos</td></tr>
            <tr><th scope="row">Auditoria</th><td>um coeficiente por variável</td><td>um coeficiente por faixa, com fronteiras declaradas</td></tr>
            <tr><th scope="row">Nesta base</th><td>inclinação {fmtNum(r.c, 3)} por dezena de pontos</td><td>{r.faixas.map((f) => fmtPct(f.taxa, base === "didatica" ? 0 : 1)).join(" · ")}</td></tr>
          </tbody></table></div>
          <div className="vz-tile"><p className="eyebrow">Regras que uma faixa precisa respeitar</p>
            <table className="table text-[.85em] vz-esc-usos"><tbody>{REGRAS.map((q) => <tr key={q.n}><th scope="row">{q.n}</th><td>{q.t}</td></tr>)}</tbody></table></div>
          <div className="vz-tile"><p className="eyebrow">Relação com o WoE</p><p className="vz-num vz-num--texto">O WoE, construído no capítulo 3, é exatamente este tratamento com uma escolha específica de valor por faixa: o logaritmo da razão entre a distribuição dos bons e a dos maus. Ele mantém a variável em uma única coluna e preserva a leitura por faixa.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Faixas de contagem igual sobre a utilização. Com 16 propostas: 4 por faixa, taxas 25%, 0%, 100% e 75%, Wilson de 5% a 70%, 0% a 49%, 51% a 100% e 30% a 95%. Na base de treino do gerador (2.103 propostas, 201 defaults): 525 ou 526 por faixa, taxas 4,95%, 6,65%, 9,89% e 16,73%, intervalos de 4 a 6 pontos de largura. Página complementar: não é exigida para acompanhar os capítulos seguintes.</p>
    </figure>
  );
}

function sy(v: number, yMax: number) { return MT + (1 - v / yMax) * (H - MT - MB); }
