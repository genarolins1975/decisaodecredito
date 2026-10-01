"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { Roc } from "../graficos";
import { CENARIOS, D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaGanho, curvaRoc, fila, ganho, ks, logit, mulberry32, sigmoide } from "@/lib/capitulo7/metricas";
import { num, pct, vezes } from "@/lib/capitulo7/formato";

/**
 * 15 · c7p27 · Laboratório de discriminação, na janela inteira. Quatro filas: a da logística, a embaralhada, a
 * invertida e a perturbada (logit p + σ·z, com z normal padrão de semente 20261015). Um gráfico grande por vez, com
 * foco alternável, e as quatro medidas sempre à vista. A primeira pergunta pede a previsão antes de liberar os cenários.
 */
type Cen = "boa" | "aleatoria" | "invertida" | "perturbada";
type Foco = "roc" | "ks" | "ganho" | "lift";
const Z = (() => { const r = mulberry32(20261015); return PL.map(() => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }); })();
const NOMES: Record<Cen, string> = { boa: "Fila da logística", aleatoria: "Fila aleatória", invertida: "Fila invertida", perturbada: "Fila com ruído" };
const OPS = [
  { texto: "Continua 0,73: a AUC não liga para o sentido", certa: false, retorno: <>A AUC liga para o sentido: ela pergunta se o default recebeu a PD <b>maior</b>. Invertida, a resposta vira o contrário na maioria dos pares.</> },
  { texto: "Vai para perto de 0,50", certa: false, retorno: <>0,50 é o que acontece quando a fila é <b>aleatória</b>. Invertida, ela continua informativa, só que ao contrário.</> },
  { texto: "Vai para 1 − 0,73 = 0,27", certa: true, retorno: <>Isso: cada par certo vira errado e vice versa, então a AUC vira 1 − AUC. Uma AUC abaixo de 0,5 costuma ser sentido trocado do escore.</> },
  { texto: "Não dá para prever sem recalcular", certa: false, retorno: <>Dá: inverter troca o resultado de todos os pares sem empate, então a AUC vira exatamente 1 − AUC.</> },
];

export function S15LaboratorioDiscriminacao({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [cen, setCen] = useState<Cen>("boa");
  const [sigma, setSigma] = useState(1);
  const [foco, setFoco] = useState<Foco>("roc");
  const pd = useMemo(() => cen === "boa" ? PL : cen === "aleatoria" ? CENARIOS.filaFracaMediaCerta : cen === "invertida" ? PL.map((p) => 1 - p) : PL.map((p, i) => sigmoide(logit(p) + sigma * Z[i])), [cen, sigma]);
  const ord = useMemo(() => fila(pd), [pd]);
  const auc = aucPorPares(Y, pd).auc!, k = ks(Y, pd), g10 = ganho(Y, pd, 0.1, ord);
  const roc = useMemo(() => curvaRoc(Y, pd), [pd]); const cg = useMemo(() => curvaGanho(Y, pd, ord), [pd, ord]);
  const liberado = esc !== null;
  const graf = foco === "roc" ? <Roc titulo="ROC" sub={`AUC ${num(auc, 4)}`} rotulo={`ROC do cenário ${NOMES[cen]}`} series={[{ pts: curvaRoc(Y, PL), classe: "mudo" }, { pts: roc, classe: "ord", area: true }]} xTit="Falso positivo" yTit="Verdadeiro positivo" />
    : (
      <Grafico titulo={foco === "ks" ? "Separação ao longo da fila" : foco === "ganho" ? "Ganho acumulado" : "Lift acumulado"} sub="cinza: a fila da logística" rotulo={`Gráfico de ${foco} do cenário ${NOMES[cen]}`} arCelular="4 / 3">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, 1], [m.l, d.w - m.r]); const ymax = foco === "lift" ? 3.2 : 1; const y = escala([foco === "ks" ? -1 : 0, ymax], [d.h - m.b, m.t]);
          const base = curvaGanho(Y, PL);
          const serie = (cv: { x: number; y: number }[], r: typeof roc) => foco === "ganho" ? cv.map((p) => ({ x: x(p.x), y: y(p.y) }))
            : foco === "lift" ? cv.filter((p) => p.x >= 0.02).map((p) => ({ x: x(p.x), y: y(Math.min(ymax, p.y / p.x)) }))
            : r.map((p) => ({ x: x(p.recusados / N), y: y(p.tpr - p.fpr) }));
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.25, 0.5, 0.75, 1]} yt={foco === "ks" ? [-1, -0.5, 0, 0.5, 1] : foco === "lift" ? [0, 1, 2, 3] : [0, 0.5, 1]} fx={(v) => pct(v, 0)} fy={(v) => foco === "lift" ? `${num(v, 0)}×` : foco === "ks" ? num(v, 1) : pct(v, 0)} xTit="Fração da carteira, dos maiores escores para os menores" yTit={foco === "ks" ? "TPR − FPR" : foco === "ganho" ? `Defaults alcançados, de ${D}` : "Lift"} />
              {foco === "lift" && <line x1={x(0)} x2={x(1)} y1={y(1)} y2={y(1)} stroke="#5B6475" strokeDasharray="7 6" strokeWidth={2} />}
              {foco === "ganho" && <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />}
              {foco === "ks" && <line x1={x(0)} x2={x(1)} y1={y(0)} y2={y(0)} stroke="#5B6475" strokeWidth={1.5} />}
              <path className="q7-linha q7-linha--mudo q7-linha--fina" d={caminho(serie(base, curvaRoc(Y, PL)))} />
              <path className="q7-linha q7-linha--ord" d={caminho(serie(cg, roc))} />
            </g>
          );
        }}
      </Grafico>
    );
  return (
    <Quadro slug="c7p27" pagina={pagina} layout="gg"
      conclusao={!liberado ? "Responda à previsão para liberar os cenários." : cen === "boa" ? "A fila da logística: todas as medidas acima do acaso, na mesma direção." : cen === "aleatoria" ? <>Fila aleatória: AUC {num(auc, 3)}, ganho e lift no nível do acaso. A média das PDs é a mesma da logística: <b>média certa não ordena</b>.</>
        : cen === "invertida" ? <>Invertida: AUC {num(auc, 4)} = 1 − {num(aucPorPares(Y, PL).auc!, 4)}; o KS por máximo de TPR − FPR fica perto de zero e a separação aparece com sinal trocado.</> : <>Ruído σ = {num(sigma, 1)}: quanto mais ruído, mais pares trocam de lado e todas as medidas caem juntas.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Embaralhamento com semente 7; ruído normal com semente 20261015 somado em log odds. KS medido como o maior TPR − FPR (cortes do maior escore para o menor).`}>
      <Painel>
        <div className="q7-botoes">
          <Seg rotulo="Cenário" opcoes={(Object.keys(NOMES) as Cen[]).map((c) => ({ v: c, r: NOMES[c] }))} valor={cen} onChange={setCen} desab={!liberado} />
        </div>
        {cen === "perturbada" && <Controle rotulo="Ruído σ em log odds" valor={sigma} min={0} max={3} passo={0.1} onChange={setSigma} mostrar={num(sigma, 1)} escala={["0: a logística", "3: quase ao acaso"]} />}
        <div className="q7-flex1">{graf}</div>
        <Seg rotulo="Foco do gráfico" opcoes={[{ v: "roc" as Foco, r: "ROC" }, { v: "ks" as Foco, r: "KS" }, { v: "ganho" as Foco, r: "Ganho" }, { v: "lift" as Foco, r: "Lift" }]} valor={foco} onChange={setFoco} />
      </Painel>
      <Painel>
        {esc === null || !OPS[esc]?.certa ? <Previsao pergunta="Se a fila for invertida (o mais arriscado vai para o fim), o que acontece com a AUC de 0,73?" opcoes={OPS} escolha={esc} onEscolha={setEsc} /> : <Previsao pergunta="" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />}
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="AUC" valor={num(auc, 3)} tam="mini" />
          <Kpi rotulo="KS" valor={num(k.ks, 3)} tam="mini" />
          <Kpi rotulo="Ganho em 10%" valor={pct(g10.ganho!, 0)} detalhe={`${g10.capturados} de ${D}`} tam="mini" />
          <Kpi rotulo="Lift em 10%" valor={vezes(g10.lift!, 1)} tam="mini" />
        </div>
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setCen("boa"); setSigma(1); setFoco("roc"); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
