"use client";
import { useState } from "react";
import { Botao, Controle, Kpi, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { caminhoRoc, COR, PlanoRoc } from "../b2";
import { AUC_RF, AUC_SGD, CURVA_RF, CURVA_SGD, FONTE_MNIST } from "@/lib/capitulo12/dados";
import { aucBinormal, cruzamentoBinormal, tprBinormal } from "@/lib/capitulo12/metricas";
import { rocCrescente, tprEm } from "@/lib/capitulo12/b2";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 20 · c12p20 · Quando as curvas se cruzam, a região de operação decide (aprofundamento). Dois casos no mesmo plano:
 * dominância, com dados (floresta aleatória contra o SGD no MNIST, CURVA_RF e CURVA_SGD da validação cruzada; a
 * floresta tem TPR maior ou igual em toda FPR, conferido abaixo) e cruzamento, conceitual (dois modelos binormais,
 * A com a = 0,9815 e b = 0,5, AUC 0,81; B com a = 1,588 e b = 1,6, AUC 0,80; cruzam em FPR de 29%,
 * cruzamentoBinormal). O controle "FPR tolerada" mostra a TPR de cada modelo ali e qual vence. Estado inicial:
 * cruzamento, FPR tolerada de 5% (região de um corte pequeno). "Restaurar" volta a ele.
 */
const A = { a: 0.9815, b: 0.5 }, B = { a: 1.588, b: 1.6 };
const AUC_A = aucBinormal(A.a, A.b), AUC_B = aucBinormal(B.a, B.b);
const CRUZA = cruzamentoBinormal(A.a, A.b, B.a, B.b);
const ROC_RF = rocCrescente(CURVA_RF), ROC_SGD = rocCrescente(CURVA_SGD);
for (const p of [...ROC_RF, ...ROC_SGD]) if (tprEm(ROC_RF, p.fpr) < tprEm(ROC_SGD, p.fpr) - 1e-12) throw new Error("s20: a floresta não domina o SGD");
if (!(AUC_A > AUC_B) || Math.abs(tprBinormal(A.a, A.b, CRUZA) - tprBinormal(B.a, B.b, CRUZA)) > 1e-6) throw new Error("s20: as binormais não cruzam onde se diz");
// grade fina perto de zero (onde as curvas sobem rápido) e regular no resto
const GRADE = [...Array.from({ length: 40 }, (_, k) => 1e-4 * 10 ** (k / 13)), ...Array.from({ length: 101 }, (_, k) => k / 100)].filter((v) => v <= 1).sort((a, b) => a - b);
const F0 = 0.05;
type Modo = "dom" | "cruz";
const CASOS: Record<Modo, { m1: string; m2: string; auc1: number; auc2: number; t1: (f: number) => number; t2: (f: number) => number; pts1: { fpr: number; tpr: number }[]; pts2: { fpr: number; tpr: number }[] }> = {
  dom: { m1: "Floresta", m2: "SGD", auc1: AUC_RF, auc2: AUC_SGD, t1: (f) => tprEm(ROC_RF, f), t2: (f) => tprEm(ROC_SGD, f), pts1: [{ fpr: 0, tpr: 0 }, ...ROC_RF], pts2: [{ fpr: 0, tpr: 0 }, ...ROC_SGD] },
  cruz: { m1: "Modelo A", m2: "Modelo B", auc1: AUC_A, auc2: AUC_B, t1: (f) => tprBinormal(A.a, A.b, f), t2: (f) => tprBinormal(B.a, B.b, f), pts1: [{ fpr: 0, tpr: 0 }, ...GRADE.map((f) => ({ fpr: f, tpr: tprBinormal(A.a, A.b, f) }))], pts2: [{ fpr: 0, tpr: 0 }, ...GRADE.map((f) => ({ fpr: f, tpr: tprBinormal(B.a, B.b, f) }))] },
};

export function S20CurvasCruzam({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("cruz");
  const [f, setF] = useState(F0);
  const k = CASOS[modo], t1 = k.t1(f), t2 = k.t2(f);
  const vence = Math.abs(t1 - t2) < 0.0005 ? null : t1 > t2 ? k.m1 : k.m2;
  const ini = modo === "cruz" && f === F0;
  return (
    <Quadro slug="c12p20" pagina={pagina} layout="um"
      conclusao={modo === "cruz"
        ? <>Com FPR tolerada de {pct(f, 0)}, {vence === null ? "os dois empatam" : <><b>{vence}</b> encontra mais positivos</>} ({pct(t1, 0)} contra {pct(t2, 0)}). Abaixo de {pct(CRUZA, 0)}, A vence; acima, B. Em crédito, um corte pequeno opera na região de FPR baixa; a AUC (slide {SLIDE.c12p21.n}) não vê isso.</>
        : <>A floresta tem TPR maior ou igual em <b>toda</b> FPR (AUC {num(AUC_RF, 4)} contra {num(AUC_SGD, 4)}): com uma curva que domina, a escolha não depende do corte.</>}
      fonte={modo === "dom" ? `${FONTE_MNIST}. Floresta aleatória: probabilidade da classe 5 por validação cruzada, ${CURVA_RF.length} limiares; SGD: ${CURVA_SGD.length} limiares; TPR entre limiares por interpolação linear.`
        : `Modelos A e B conceituais, não ajustados a dados: curvas binormais TPR = Φ(a + b·Φ⁻¹(FPR)), A com a = ${num(A.a, 4)} e b = ${num(A.b, 1)} (AUC ${num(AUC_A, 2)}), B com a = ${num(B.a, 3)} e b = ${num(B.b, 1)} (AUC ${num(AUC_B, 2)}).`}>
      <div className="q12-s19">
        <div className="q12-s19-g">
          <PlanoRoc rotulo={`${k.m1} e ${k.m2}: na FPR de ${pct(f, 0)}, TPR ${pct(t1, 1)} e ${pct(t2, 1)}`} xTit="FPR" yTit="TPR" rotPerfeito={false} rotAcaso={false}>
            {(x, y, d) => (
              <g>
                {modo === "cruz" && <rect x={x(0)} y={y(1)} width={x(CRUZA) - x(0)} height={y(0) - y(1)} fill={COR.pos} fillOpacity={0.07} />}
                <path className="q7-linha" stroke="#00205B" strokeDasharray="10 6" d={caminhoRoc(k.pts2, x, y)} />
                <path className="q7-linha" stroke={COR.pos} d={caminhoRoc(k.pts1, x, y)} />
                {modo === "cruz" && <g><line x1={x(CRUZA)} x2={x(CRUZA)} y1={y(0)} y2={y(1)} stroke={COR.mudo} strokeWidth={1.5} strokeDasharray="3 4" /><text className="q7-rot--peq" x={x(CRUZA)} y={y(0.06)} dx=".35em" style={{ fill: COR.mudo }}>cruzam em {pct(CRUZA, 0)}</text>
                  <text className="q7-rot--peq" x={x(0.07)} y={y(0.94)} style={{ fill: COR.pos, fontWeight: 700 }}>A vence</text></g>}
                <line x1={x(f)} x2={x(f)} y1={y(0)} y2={y(1)} stroke={COR.lim} strokeWidth={2.5} />
                <circle cx={x(f)} cy={y(t1)} r={d.fs * 0.4} fill={COR.pos} stroke="#fff" strokeWidth={2} />
                <rect x={x(f) - d.fs * 0.35} y={y(t2) - d.fs * 0.35} width={d.fs * 0.7} height={d.fs * 0.7} fill="#00205B" stroke="#fff" strokeWidth={2} />
                <text className="q7-rot" x={x(0.55)} y={y(modo === "cruz" ? 0.8 : 1)} dy={modo === "cruz" ? "-.5em" : "-.35em"} style={{ fill: COR.pos }}>{k.m1}</text>
                <text className="q7-rot" x={x(modo === "cruz" ? 0.42 : 0.3)} y={y(modo === "cruz" ? 1 : 0.86)} dy={modo === "cruz" ? "-.35em" : "1.3em"} style={{ fill: "#00205B" }}>{k.m2} (tracejada)</text>
                <text className="q7-rot--peq" x={x(0.97)} y={y(0.5)} textAnchor="end" style={{ fill: COR.mudo }}>diagonal: acaso</text>
              </g>
            )}
          </PlanoRoc>
        </div>
        <Painel className="q12-s19-dir">
          <Seg rotulo="Caso" opcoes={[{ v: "dom", r: "Dominância: dados do MNIST" }, { v: "cruz", r: "Cruzamento: A e B conceituais" }]} valor={modo} onChange={setModo} cor />
          <Controle rotulo="FPR tolerada" valor={f} min={0.01} max={0.9} passo={0.01} onChange={setF} mostrar={pct(f, 0)} escala={["1%", "90%"]} />
          <div className="q7-kpis">
            <Kpi rotulo={`TPR de ${k.m1} (●)`} valor={pct(t1, 1)} detalhe={`AUC ${num(k.auc1, modo === "cruz" ? 2 : 4)}`} tom="prob" tam="mini" />
            <Kpi rotulo={`TPR de ${k.m2} (■)`} valor={pct(t2, 1)} detalhe={`AUC ${num(k.auc2, modo === "cruz" ? 2 : 4)}`} tam="mini" />
          </div>
          <p className="q7-p">{modo === "cruz" ? <>Mesma AUC, quase: {num(AUC_A, 2)} contra {num(AUC_B, 2)}. Na FPR tolerada, vence <b>{vence ?? "nenhum"}</b>.</> : <>Em qualquer FPR, a floresta vence: a região de operação não muda a escolha.</>}</p>
          <div className="q7-botoes"><Botao sec onClick={() => { setModo("cruz"); setF(F0); }} desab={ini}>Restaurar</Botao></div>
        </Painel>
      </div>
    </Quadro>
  );
}
