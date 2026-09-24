"use client";
import { useMemo, useState } from "react";
import grid from "@/lib/visuais/grid-boosting.json";
import { fmtNum } from "@/lib/visuais/metricas";

/**
 * A distância que se abre (capítulo 6, c6p17). AUC de treino, validação e fora do tempo da grade de boosting da base
 * sintética: o treino sobe sem exceção com árvores e folhas; fora do tempo desce. A turma escolhe a configuração
 * pelo treino ou pela validação e vê que a "melhor" AUC de treino é o pior modelo disponível.
 */
type Cfg = { max_iter: number; max_leaf_nodes: number; auc_val: number; auc_treino: number; auc_oot: number };
const GRADE = grid.grade as Cfg[];
const ARVORES = [60, 100, 160, 240]; const FOLHAS = [4, 8, 16];
const W = 640, H = 330, ML = 52, MR = 78, MT = 14, MB = 40;
const sx = (n: number) => ML + ((n - 40) / 220) * (W - ML - MR);
const sy = (v: number) => MT + (1 - (v - 0.6) / 0.42) * (H - MT - MB);
const COR: Record<number, string> = { 4: "vz-dist--4", 8: "vz-dist--8", 16: "vz-dist--16" };

export function DistanciaQueSeAbre() {
  const [criterio, setCriterio] = useState<"treino" | "validacao" | null>(null);
  const [sel, setSel] = useState<Cfg>(GRADE.find((c) => c.max_iter === 60 && c.max_leaf_nodes === 8)!);
  const [mostrarVal, setMostrarVal] = useState(false);
  const porTreino = useMemo(() => GRADE.reduce((a, b) => (b.auc_treino > a.auc_treino ? b : a)), []);
  const porVal = useMemo(() => GRADE.reduce((a, b) => (b.auc_val > a.auc_val ? b : a)), []);
  const escolher = (c: "treino" | "validacao") => { setCriterio(c); setSel(c === "treino" ? porTreino : porVal); };
  const linha = (folhas: number, campo: keyof Cfg) => ARVORES.map((n, i) => { const c = GRADE.find((g) => g.max_iter === n && g.max_leaf_nodes === folhas)!; return `${i ? "L" : "M"}${sx(n).toFixed(1)} ${sy(c[campo] as number).toFixed(1)}`; }).join("");
  const area = (folhas: number) => { const ida = ARVORES.map((n) => { const c = GRADE.find((g) => g.max_iter === n && g.max_leaf_nodes === folhas)!; return `${sx(n).toFixed(1)} ${sy(c.auc_treino).toFixed(1)}`; }); const volta = [...ARVORES].reverse().map((n) => { const c = GRADE.find((g) => g.max_iter === n && g.max_leaf_nodes === folhas)!; return `${sx(n).toFixed(1)} ${sy(c.auc_oot).toFixed(1)}`; }); return `M${ida.join(" L")} L${volta.join(" L")} Z`; };
  const dist = sel.auc_treino - sel.auc_oot;
  return (
    <figure className="vz" data-vz="distancia-que-se-abre">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A distância que se abre · grade de boosting · 5.000 propostas sintéticas, semente 20260501</p>
          <p className="vz-tit">Treino sobe sem exceção. Fora do tempo desce. Quem escolhe pelo treino escolhe o pior modelo da grade.</p>
        </div>
        <div className="vz-acoes">
          <div className="vz-seg" role="group" aria-label="Critério de escolha">
            <button type="button" className={`vz-seg-b ${criterio === "treino" ? "vz-seg-b--on" : ""}`} onClick={() => escolher("treino")}>Escolher pelo treino</button>
            <button type="button" className={`vz-seg-b ${criterio === "validacao" ? "vz-seg-b--on" : ""}`} onClick={() => escolher("validacao")}>Escolher pela validação</button>
          </div>
        </div>
      </header>
      <div className="vz-estado"><b>{sel.max_iter} árvores, {sel.max_leaf_nodes} folhas{criterio ? `, escolhida ${criterio === "treino" ? "pelo treino" : "pela validação"}` : ""}.</b> AUC de treino {fmtNum(sel.auc_treino, 4)}, validação {fmtNum(sel.auc_val, 4)}, fora do tempo {fmtNum(sel.auc_oot, 4)}. Distância treino menos fora do tempo: {fmtNum(dist, 4)}.</div>
      <div className="vz-dist-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">AUC por número de árvores <span className="hint">contínua: treino · tracejada: fora do tempo · área: a distância entre as duas · clique num ponto</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="AUC de treino e fora do tempo por número de árvores e folhas">
            {[0.6, 0.7, 0.8, 0.9, 1].map((v) => <g key={v}><line x1={sx(40)} x2={sx(260)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
            {ARVORES.map((n) => <text key={n} x={sx(n)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{n}</text>)}
            <text x={sx(150)} y={H - 6} textAnchor="middle" className="vz-rotulo">número de árvores</text>
            {FOLHAS.map((f) => <path key={`a${f}`} d={area(f)} className={`vz-dist-area ${COR[f]}`} />)}
            {FOLHAS.map((f) => <g key={f}>
              <path d={linha(f, "auc_treino")} className={`vz-dist-linha ${COR[f]}`} />
              <path d={linha(f, "auc_oot")} className={`vz-dist-linha vz-dist-linha--oot ${COR[f]}`} />
              {mostrarVal && <path d={linha(f, "auc_val")} className={`vz-dist-linha vz-dist-linha--val ${COR[f]}`} />}
              <text x={sx(240) + 6} y={sy(GRADE.find((g) => g.max_iter === 240 && g.max_leaf_nodes === f)!.auc_treino) + 4} className={`vz-tick vz-dist-t ${COR[f]}`}>{f} folhas</text>
            </g>)}
            {GRADE.map((c) => <g key={`${c.max_iter}-${c.max_leaf_nodes}`} className="vz-res-clic" onClick={() => { setCriterio(null); setSel(c); }}>
              <circle cx={sx(c.max_iter)} cy={sy(c.auc_treino)} r={sel === c ? 7 : 4} className={`vz-dist-pt ${COR[c.max_leaf_nodes]} ${sel === c ? "vz-dist-pt--sel" : ""}`} />
              <circle cx={sx(c.max_iter)} cy={sy(c.auc_oot)} r={sel === c ? 7 : 4} className={`vz-dist-pt vz-dist-pt--oot ${COR[c.max_leaf_nodes]} ${sel === c ? "vz-dist-pt--sel" : ""}`} />
            </g>)}
            {sel && <line x1={sx(sel.max_iter)} x2={sx(sel.max_iter)} y1={sy(sel.auc_treino)} y2={sy(sel.auc_oot)} className="vz-dist-dist" />}
          </svg>
          <label className="vz-check"><input type="checkbox" checked={mostrarVal} onChange={(e) => setMostrarVal(e.target.checked)} /> mostrar a validação (pontilhada), a amostra que decide</label>
        </div>
        <div className="vz-dist-painel">
          <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">AUC de treino</p><p className="vz-num">{fmtNum(sel.auc_treino, 4)}</p><p className="hint">{sel === porTreino ? "a maior da grade: 240 árvores e 16 folhas" : "sobe com árvores e com folhas, sem exceção"}</p></div>
            <div className="vz-tile"><p className="eyebrow">AUC fora do tempo</p><p className="vz-num vz-num--default">{fmtNum(sel.auc_oot, 4)}</p><p className="hint">{sel === porTreino ? "a pior da grade inteira" : sel === porVal ? "a melhor da grade, escolhida sem olhar o fora do tempo" : "o número que interessa, medido uma vez"}</p></div>
            <div className="vz-tile"><p className="eyebrow">Distância treino menos fora do tempo</p><p className="vz-num">{fmtNum(dist, 4)}</p><p className="hint">máxima na grade: {fmtNum(porTreino.auc_treino - porTreino.auc_oot, 4)}</p></div>
          </div>
          <div className="vz-dist-leitura"><b>{criterio === "treino" ? "A leitura que destrói o modelo." : criterio === "validacao" ? "O procedimento defensável." : "Escolha um critério."}</b> {criterio === "treino" ? "Apresentar a AUC de treino como resultado aprova o modelo com a pior AUC fora do tempo da grade." : criterio === "validacao" ? "Escolher pela validação, reportar o fora do tempo, declarar a grade e o critério antes de olhar os resultados." : "Os dois botões acima aplicam a mesma grade com critérios diferentes."}</div>
        </div>
      </div>
      <p className="vz-fonte">Gradient boosting com taxa 0,05 e mínimo de 60 por folha; grade de 4, 8 e 16 folhas por 60, 100, 160 e 240 árvores. Números do gerador. Configuração escolhida por validação: 60 árvores e 8 folhas.</p>
    </figure>
  );
}
