"use client";
import { useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { matrizConfusao } from "@/lib/visuais/avaliacao";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * O acerto que engana (capítulo 7, c7p2). Com evento raro, a taxa de acerto é dominada pela célula dos pagadores
 * aprovados: a regra que aprova todo mundo acerta 89,01% e captura zero default. A turma move o corte e vê as quatro
 * células, o acerto e os defaults capturados andarem em direções diferentes.
 */
const Y = oot.y as number[], PD = oot.pd as number[];
export function AcertoQueEngana() {
  const [corte, setCorte] = useState(0.12);
  const c = matrizConfusao(Y, PD, corte); const n = Y.length;
  const cel = (v: number) => ({ width: `${Math.sqrt(v / n) * 100}%`, height: `${Math.sqrt(v / n) * 100}%` });
  return (
    <figure className="vz" data-vz="acerto-que-engana">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O acerto que engana · 737 propostas fora do tempo, 81 defaults · prevalência 10,99%</p>
          <p className="vz-tit">Acerto de classificação mede a prevalência, não o modelo: a regra que não decide nada acerta {fmtPct(c.trivial, 2)}.</p>
        </div>
      </header>
      <div className="vz-estado"><b>Corte de PD para recusar {fmtPct(corte, 1)}:</b> acerto {fmtPct(c.acerto, 2)}, {c.acerto < c.trivial ? "abaixo" : "acima"} da regra trivial de {fmtPct(c.trivial, 2)}, e ainda assim este corte captura {c.capturados} dos {c.defaults} defaults. A regra trivial captura zero.</div>
      <div className="vz-ace-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">As quatro células, com área proporcional ao número de propostas <span className="hint">verde: acertos · vermelho: erros</span></p>
          <div className="vz-ace-matriz" role="img" aria-label="Matriz de confusão">
            <span className="vz-ace-eixo vz-ace-eixo--col">deu default</span><span className="vz-ace-eixo vz-ace-eixo--col2">pagou</span>
            <span className="vz-ace-eixo vz-ace-eixo--lin">recusada</span><span className="vz-ace-eixo vz-ace-eixo--lin2">aprovada</span>
            <div className="vz-ace-cel"><span className="vz-ace-quad vz-ace-quad--ok" style={cel(c.recusadaDefault)} /><b>{c.recusadaDefault}</b><small>defaults recusados</small></div>
            <div className="vz-ace-cel"><span className="vz-ace-quad vz-ace-quad--erro" style={cel(c.recusadaPagou)} /><b>{c.recusadaPagou}</b><small>pagadores recusados</small></div>
            <div className="vz-ace-cel"><span className="vz-ace-quad vz-ace-quad--erro" style={cel(c.aprovadaDefault)} /><b>{c.aprovadaDefault}</b><small>defaults aprovados</small></div>
            <div className="vz-ace-cel"><span className="vz-ace-quad vz-ace-quad--ok" style={cel(c.aprovadaPagou)} /><b>{c.aprovadaPagou}</b><small>pagadores aprovados</small></div>
          </div>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Corte de PD para recusar</span><span className="vz-slider-valor">{fmtPct(corte, 1)}</span></span><input type="range" min={1} max={60} step={0.5} value={corte * 100} onChange={(e) => setCorte(Number(e.target.value) / 100)} /></label>
        </div>
        <div className="vz-ace-painel">
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">Acerto com este corte</p><p className="vz-num">{fmtPct(c.acerto, 2)}</p><p className="hint">(defaults recusados + pagadores aprovados) ÷ 737</p></div>
            <div className="vz-tile"><p className="eyebrow">Acerto da regra trivial</p><p className="vz-num">{fmtPct(c.trivial, 2)}</p><p className="hint">aprovar todas: acerta em todo pagador e erra em todo default</p></div>
            <div className="vz-tile"><p className="eyebrow">Defaults capturados</p><p className="vz-num vz-num--default">{c.capturados} de {c.defaults}</p><p className="hint">a regra trivial captura zero</p></div>
          </div>
          <p className="hint">A célula dos pagadores aprovados é a maior em quase qualquer corte, e é ela que domina a conta. Acerto alto não diz que o modelo separa; diz que o evento é raro.</p>
        </div>
      </div>
      <p className="vz-fonte">Janela fora do tempo, PD da logística. Corte 12%: 48 defaults recusados, 164 pagadores recusados, 33 defaults aprovados, 492 pagadores aprovados; acerto 73,27% contra 89,01% da regra trivial, os números da página.</p>
    </figure>
  );
}
