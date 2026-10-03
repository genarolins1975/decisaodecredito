"use client";
import { useState } from "react";
import { Botao, Controle, Formula, Kpi, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { caminhoRoc, COR, PlanoRoc, sc } from "../b2";
import { AUC_SGD, CURVA_SGD, FONTE_MNIST, HIST, INDICE_ZERO, M_SGD } from "@/lib/capitulo12/dados";
import { confusaoNoIndice } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 19 · c12p19 · Cada limiar é um ponto; o conjunto forma a curva ROC. A curva ROC do próprio detector (CURVA_SGD, um
 * ponto por borda do histograma da validação cruzada), com TPR = VP ÷ (VP + FN) = recall e FPR = FP ÷ (FP + VN); o
 * controle move o limiar e o ponto âmbar; o ponto do limiar 0 (FPR 1,3%, TPR 65,1%) fica marcado; diagonal do acaso e
 * canto do modelo perfeito. AUC 0,9605 é a do scikit-learn (roc_auc_score sobre os scores, AUC_SGD). O seletor amplia
 * o eixo da FPR para 0 a 10%, a região em que o ponto do limiar 0 está. Na aula original a curva era conceitual
 * (binormal com AUC 0,80); aqui é a do detector. Estado inicial: limiar 0, eixo inteiro. "Restaurar" volta a ele.
 */
const P0 = CURVA_SGD[INDICE_ZERO];
if (P0.fpr !== M_SGD.fpr || P0.tpr !== M_SGD.recall) throw new Error("s19: o ponto do limiar 0 não reproduz a matriz");
const I_MIN = CURVA_SGD.findIndex((p) => p.limiar >= -40000), I_MAX = CURVA_SGD.length - 2;
const ZOOM = 0.1;

export function S19Roc({ pagina }: { pagina?: Pagina }) {
  const [i, setI] = useState(INDICE_ZERO);
  const [zoom, setZoom] = useState(false);
  const p = CURVA_SGD[i], c = confusaoNoIndice(HIST, i), ini = i === INDICE_ZERO && !zoom;
  const fx = zoom ? ZOOM : 1;
  const pts = zoom ? CURVA_SGD.filter((q) => q.fpr <= ZOOM * 1.0001) : CURVA_SGD;
  return (
    <Quadro slug="c12p19" pagina={pagina} layout="um"
      conclusao={<>No limiar {sc(p.limiar)}, o ponto fica em FPR <b>{pct(p.fpr, 1)}</b> e TPR <b>{pct(p.tpr, 1)}</b>; a curva inteira resume todos os limiares, com AUC de <b>{num(AUC_SGD, 4)}</b>. O slide {SLIDE.c12p20.n} compara duas curvas; o {SLIDE.c12p21.n} lê a área.</>}
      fonte={`${FONTE_MNIST}. Um ponto por borda do histograma de scores (602 limiares); AUC de roc_auc_score sobre os scores.`}>
      <div className="q12-s19">
        <div className="q12-s19-g">
          <PlanoRoc rotulo={`Curva ROC do detector; ponto do limiar ${sc(p.limiar)} em FPR ${pct(p.fpr, 1)} e TPR ${pct(p.tpr, 1)}; AUC ${num(AUC_SGD, 4)}`} xTit={zoom ? "FPR: não 5 ditos 5 (eixo ampliado)" : undefined} xMax={fx} rotPerfeitoEm={zoom ? [0.045, 0.96] : [0.07, 0.85]}>
            {(x, y, d) => {
              return (
                <g>
                  <path d={`${caminhoRoc(pts, x, y)}L${x(pts[0].fpr)} ${y(0)}L${x(0)} ${y(0)}Z`} fill={COR.pos} fillOpacity={0.1} />
                  <path className="q7-linha" stroke={COR.pos} d={caminhoRoc(pts, x, y)} />
                  <circle cx={x(P0.fpr)} cy={y(P0.tpr)} r={d.fs * 0.5} fill="#fff" stroke={COR.mudo} strokeWidth={2.5} />
                  <text className="q7-rot--peq" x={x(P0.fpr)} y={y(P0.tpr)} dx="1em" dy={zoom ? "-.6em" : "1.6em"} style={{ fill: COR.mudo, fontWeight: 600, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>limiar 0: ({pct(P0.fpr, 1)}; {pct(P0.tpr, 1)})</text>
                  {p.fpr <= fx && <circle cx={x(p.fpr)} cy={y(p.tpr)} r={d.fs * 0.4} fill={COR.lim} stroke="#fff" strokeWidth={2} />}
                  <text className="q7-rot" x={x(fx / 2)} y={y(0.12)} style={{ fill: COR.pos }} textAnchor="middle">AUC {num(AUC_SGD, 4)}: área sob a curva</text>
                </g>
              );
            }}
          </PlanoRoc>
        </div>
        <Painel className="q12-s19-dir">
          <div className="q12-s19-f">
            <Formula f={String.raw`\mathrm{TPR}=\frac{\mathrm{VP}}{\mathrm{VP}+\mathrm{FN}}=\text{recall}`} compacta />
            <Formula f={String.raw`\mathrm{FPR}=\frac{\mathrm{FP}}{\mathrm{FP}+\mathrm{VN}}`} compacta />
          </div>
          <Controle rotulo="Limiar do score" valor={i} min={I_MIN} max={I_MAX} passo={1} onChange={setI} mostrar={sc(p.limiar)} escala={["mais 5 ditos", "menos 5 ditos"]} />
          <div className="q7-kpis">
            <Kpi rotulo="TPR" valor={pct(p.tpr, 1)} detalhe={`${int(c.vp)} de ${int(M_SGD.positivos)} cincos`} tom="prob" tam="mini" />
            <Kpi rotulo="FPR" valor={pct(p.fpr, 1)} detalhe={`${int(c.fp)} de ${int(M_SGD.negativos)} não 5`} tom="def" tam="mini" />
          </div>
          <p className="q7-p">Subir o limiar desce pela curva rumo a (0%; 0%); baixar sobe rumo a (100%; 100%). O canto superior esquerdo é o modelo perfeito.</p>
          <div className="q7-botoes">
            <Seg rotulo="Eixo da FPR" opcoes={[{ v: 0, r: "FPR de 0 a 100%" }, { v: 1, r: "de 0 a 10%" }]} valor={zoom ? 1 : 0} onChange={(v) => setZoom(v === 1)} />
            <Botao sec onClick={() => { setI(INDICE_ZERO); setZoom(false); }} desab={ini}>Restaurar</Botao>
          </div>
        </Painel>
      </div>
    </Quadro>
  );
}
