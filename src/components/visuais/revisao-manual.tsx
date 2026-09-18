"use client";
import { useMemo, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { avaliarCarteira } from "@/lib/visuais/politica";
import { fmtReais } from "@/lib/visuais/economia";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * Revisão manual é compra de informação (capítulo 8, c8p9). Qualidade do sinal do analista, capacidade e custo na mão
 * da turma; três medidas com três significados: o que o banco calcula, o valor real sob a PD verdadeira do gerador e o
 * realizado. Com sinal ruidoso, o relatório melhora e a carteira piora.
 */
const OPS = { pd: oot.pd as number[], ead: oot.ead as number[], y: oot.y as number[], pt: oot.pt as number[] };
const exato = (v: number) => `${v < 0 ? "−" : ""}R$ ${Math.abs(Math.round(v)).toLocaleString("pt-BR")}`;
export function RevisaoManual() {
  const [qualidade, setQualidade] = useState(0.6);
  const [capacidade, setCapacidade] = useState(120);
  const [custo, setCusto] = useState(90);
  const sem = useMemo(() => avaliarCarteira(OPS, { corte: 0.12, teto: 0.3, capacidade: 0 }), []);
  const com = useMemo(() => avaliarCarteira(OPS, { corte: 0.12, teto: 0.3, capacidade, qualidade, custoRevisao: custo }), [capacidade, qualidade, custo]);
  const dCalc = com.esperado - sem.esperado, dReal = com.valorReal! - sem.valorReal!;
  const linhas = [
    { rot: "Resultado que o banco calcula", sem: sem.esperado, com: com.esperado, usa: "a PD em que o banco acredita, inclusive a que o analista produziu" },
    { rot: "Valor real da decisão", sem: sem.valorReal!, com: com.valorReal!, usa: "a PD verdadeira do gerador. Só existe porque a base é sintética" },
    { rot: "Resultado realizado", sem: sem.realizado, com: com.realizado, usa: "os desfechos observados nesta janela, uma realização entre muitas" },
  ];
  return (
    <figure className="vz" data-vz="revisao-manual">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Revisão manual é compra de informação · corte 12%, teto 30% · 737 propostas fora do tempo</p>
          <p className="vz-tit">A revisão só cria valor quando o sinal do analista acrescenta informação. Com sinal ruidoso, o relatório melhora e a carteira piora.</p>
        </div>
      </header>
      <div className={`vz-estado ${dCalc > 0 && dReal < 0 ? "vz-estado--choque" : ""}`}><b>Efeito da revisão nesta configuração.</b> O resultado que o banco calcula muda em {exato(dCalc)}. O valor real da decisão muda em {exato(dReal)}, já descontados {exato(com.revisoes)} de custo de revisão. {dCalc > 0 && dReal < 0 ? "Os dois sinais são opostos: o relatório melhora e a carteira piora." : dReal > 0 ? "Aqui a revisão cria valor real." : "A revisão não cria valor real nesta configuração."}</div>
      <div className="vz-rev-grade">
        <div className="vz-grafico">
          <div className="vz-res-controles">
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Qualidade da informação do analista</span><span className="vz-slider-valor">{fmtPct(qualidade)}</span></span><input type="range" min={0} max={100} step={5} value={qualidade * 100} onChange={(e) => setQualidade(Number(e.target.value) / 100)} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Capacidade de revisão, casos por janela</span><span className="vz-slider-valor">{capacidade}</span></span><input type="range" min={0} max={300} step={10} value={capacidade} onChange={(e) => setCapacidade(Number(e.target.value))} /></label>
            <label className="vz-slider"><span className="vz-slider-rotulo"><span>Custo de cada revisão</span><span className="vz-slider-valor">{fmtReais(custo)}</span></span><input type="range" min={0} max={300} step={10} value={custo} onChange={(e) => setCusto(Number(e.target.value))} /></label>
          </div>
          <p className="vz-grafico-t">Três medidas com três significados</p>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Medida</th><th>Sem revisão</th><th>Com revisão</th><th>O que ela usa</th></tr></thead><tbody>{linhas.map((l) => <tr key={l.rot}><th scope="row">{l.rot}</th><td>{fmtReais(l.sem)}</td><td className={l.com - l.sem > 0 ? "vz-t-ok" : l.com - l.sem < 0 ? "vz-t-baixo" : ""}>{fmtReais(l.com)}</td><td className="hint">{l.usa}</td></tr>)}</tbody></table></div>
        </div>
        <div className="vz-rev-painel">
          <div className="vz-tiles">
            <div className="vz-tile"><p className="eyebrow">Revisados</p><p className="vz-num">{com.revisados}</p></div>
            <div className="vz-tile"><p className="eyebrow">Aprovados na revisão</p><p className="vz-num">{com.aprovadosNaRevisao}</p></div>
            <div className="vz-tile"><p className="eyebrow">Fila não atendida</p><p className="vz-num vz-num--default">{com.filaNaoAtendida}</p><p className="hint">recusados por falta de capacidade</p></div>
          </div>
          <div className="vz-tile"><p className="eyebrow">Por que os sinais se opõem</p><p className="vz-num vz-num--texto">O analista devolve uma PD; o banco acredita nela e a soma no relatório. Se o sinal é ruidoso, a PD revisada baixa mais do que a verdadeira, o relatório sobe, e a carteira aprovada piora. Suba a qualidade para ver os dois sinais se alinharem.</p></div>
        </div>
      </div>
      <p className="vz-fonte">O revisor observa z = (1 − q) × logit(PD) + q × logit(PD verdadeira) + ruído × 0,6 × (1 − q); a qualidade q é parâmetro do exercício. Com q = 60%, capacidade 120 e R$ 90: 120 revisados, 28 aprovados na revisão, 78 na fila não atendida; o calculado sobe de R$ 603 mil para R$ 605 mil e o valor real cai de R$ 471 mil para R$ 470 mil, os números da página.</p>
    </figure>
  );
}
