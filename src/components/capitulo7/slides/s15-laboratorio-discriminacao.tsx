"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { CENARIOS, D, N, PL, SEMENTE_EMBARALHAR, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaGanho, curvaRoc, fila, ganho, ks, logit, mulberry32, quantil, sigmoide, type PontoRoc } from "@/lib/capitulo7/metricas";
import { int, num, pct, vezes } from "@/lib/capitulo7/formato";

/**
 * 15 · c7p27 · Laboratório de discriminação, na janela inteira. Quatro filas: a da logística, a embaralhada, a
 * invertida e a perturbada (logit p + σ·z, com z normal padrão de semente 20261015). Um gráfico quadrado por vez, com
 * foco alternável, e as quatro medidas ao lado dele. A previsão libera os cenários. A faixa do acaso vem de 200
 * embaralhamentos das PDs da logística (sementes 1 a 200): é a variação da AUC de uma fila sem informação nesta janela.
 */
type Cen = "boa" | "aleatoria" | "invertida" | "perturbada";
type Foco = "roc" | "ks" | "ganho" | "lift";
const Z = (() => { const r = mulberry32(20261015); return PL.map(() => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }); })();
const NOMES: Record<Cen, string> = { boa: "Fila da logística", aleatoria: "Fila aleatória", invertida: "Fila invertida", perturbada: "Fila com ruído" };
const AUC0 = aucPorPares(Y, PL).auc!;
const ROC0 = curvaRoc(Y, PL);
const N_ACASO = 200;
const ACASO = (() => {
  const v: number[] = [];
  for (let s = 1; s <= N_ACASO; s++) { const r = mulberry32(s); const a = PL.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } v.push(aucPorPares(Y, a).auc!); }
  v.sort((a, b) => a - b); return { lo: quantil(v, 0.025), hi: quantil(v, 0.975) };
})();
const OPS = [
  { texto: `Continua ${num(AUC0, 2)}: a AUC não liga para o sentido`, certa: false, retorno: <>A AUC liga para o sentido: ela pergunta se o default recebeu a PD <b>maior</b>. Invertida, a resposta vira o contrário na maioria dos pares.</> },
  { texto: "Vai para perto de 0,50", certa: false, retorno: <>0,50 é o que acontece quando a fila é <b>aleatória</b>. Invertida, ela continua informativa, só que ao contrário.</> },
  { texto: `Vai para 1 − ${num(AUC0, 2)} = ${num(1 - AUC0, 2)}`, certa: true, retorno: <>Isso: cada par certo vira errado e vice versa, então a AUC vira 1 − AUC. Uma AUC abaixo de 0,5 costuma ser sentido trocado do escore.</> },
  { texto: "Não dá para prever sem recalcular", certa: false, retorno: <>Dá: inverter troca o resultado de todos os pares sem empate, então a AUC vira exatamente 1 − AUC.</> },
];

/** ROC quadrada local: a referência do sorteio fica na legenda, fora da área sombreada. */
function RocQuadro({ pts, auc }: { pts: PontoRoc[]; auc: number }) {
  return (
    <Grafico titulo="ROC" sub={`AUC ${num(auc, 4)} · cinza: logística · tracejada: sorteio, 0,5`} rotulo={`ROC do cenário, AUC ${num(auc, 4)}; referência da logística em cinza e diagonal do sorteio`} arCelular="1 / 1">
      {(d) => {
        const m = margens(d.fs, { l: 3.1, b: 2.9, t: 1.2, r: 0.8 }); const lado = Math.min(d.w - m.l - m.r, d.h - m.t - m.b);
        const x = escala([0, 1], [m.l, m.l + lado]), y = escala([0, 1], [m.t + lado, m.t]); const t = [0, 0.25, 0.5, 0.75, 1];
        const c = pts.map((p) => ({ x: x(p.fpr), y: y(p.tpr) }));
        return (
          <g>
            <Eixos x={x} y={y} xt={t} yt={t} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="Falso positivo" yTit="Verdadeiro positivo" />
            <path className="q7-area" fill="#3D5A8A" d={`${caminho(c)}L${x(1)} ${y(0)}L${x(0)} ${y(0)}Z`} />
            <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />
            <path className="q7-linha q7-linha--mudo q7-linha--fina" d={caminho(ROC0.map((p) => ({ x: x(p.fpr), y: y(p.tpr) })))} />
            <path className="q7-linha q7-linha--ord" d={caminho(c)} />
          </g>
        );
      }}
    </Grafico>
  );
}

export function S15LaboratorioDiscriminacao({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [cen, setCen] = useState<Cen>("boa");
  const [sigma, setSigma] = useState(1);
  const [foco, setFoco] = useState<Foco>("roc");
  const pd = useMemo(() => cen === "boa" ? PL : cen === "aleatoria" ? CENARIOS.filaFracaMediaCerta : cen === "invertida" ? PL.map((p) => 1 - p) : PL.map((p, i) => sigmoide(logit(p) + sigma * Z[i])), [cen, sigma]);
  const ord = useMemo(() => fila(pd), [pd]);
  const auc = aucPorPares(Y, pd).auc!, k = ks(Y, pd), g10 = ganho(Y, pd, 0.1, ord);
  const roc = useMemo(() => curvaRoc(Y, pd), [pd]); const cg = useMemo(() => curvaGanho(Y, pd, ord), [pd, ord]);
  const liberado = esc !== null && OPS[esc].certa;
  const medidas = <>AUC {num(auc, 3)}, KS {num(k.ks, 3)}, {g10.capturados} de {D} defaults nos 10% piores (lift {vezes(g10.lift!, 1)})</>;
  const graf = foco === "roc" ? <RocQuadro pts={roc} auc={auc} />
    : (
      <Grafico titulo={foco === "ks" ? "Separação ao longo da fila" : foco === "ganho" ? "Ganho acumulado" : "Lift acumulado"} sub="cinza: a fila da logística" rotulo={`Gráfico de ${foco} do cenário ${NOMES[cen]}`} arCelular="1 / 1">
        {(d) => {
          const m = margens(d.fs, { l: 3.2, b: 2.9, t: 1.2, r: 1 });
          const x = escala([0, 1], [m.l, d.w - m.r]); const ymax = foco === "lift" ? 3.2 : 1; const y = escala([foco === "ks" ? -1 : 0, ymax], [d.h - m.b, m.t]);
          const base = curvaGanho(Y, PL);
          const serie = (cv: { x: number; y: number }[], r: typeof roc) => foco === "ganho" ? cv.map((p) => ({ x: x(p.x), y: y(p.y) }))
            : foco === "lift" ? cv.filter((p) => p.x >= 0.02).map((p) => ({ x: x(p.x), y: y(Math.min(ymax, p.y / p.x)) }))
            : r.map((p) => ({ x: x(p.recusados / N), y: y(p.tpr - p.fpr) }));
          return (
            <g>
              <Eixos x={x} y={y} xt={[0, 0.25, 0.5, 0.75, 1]} yt={foco === "ks" ? [-1, -0.5, 0, 0.5, 1] : foco === "lift" ? [0, 1, 2, 3] : [0, 0.5, 1]} fx={(v) => pct(v, 0)} fy={(v) => foco === "lift" ? `${num(v, 0)}×` : foco === "ks" ? num(v, 1) : pct(v, 0)} xTit="Fração da carteira examinada" yTit={foco === "ks" ? "TPR − FPR" : foco === "ganho" ? `Defaults alcançados, de ${D}` : "Lift"} />
              {foco === "lift" && <line x1={x(0)} x2={x(1)} y1={y(1)} y2={y(1)} stroke="#5B6475" strokeDasharray="7 6" strokeWidth={2} />}
              {foco === "ganho" && <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />}
              {foco === "ks" && <line x1={x(0)} x2={x(1)} y1={y(0)} y2={y(0)} stroke="#5B6475" strokeWidth={1.5} />}
              <path className="q7-linha q7-linha--mudo q7-linha--fina" d={caminho(serie(base, ROC0))} />
              <path className="q7-linha q7-linha--ord" d={caminho(serie(cg, roc))} />
            </g>
          );
        }}
      </Grafico>
    );
  return (
    <Quadro slug="c7p27" pagina={pagina} layout="gl"
      conclusao={!liberado ? <>Fila da logística: {medidas}. Responda à previsão para liberar os outros cenários.</>
        : cen === "boa" ? <>Fila da logística: {medidas}. <b>Todas acima do acaso, na mesma direção</b>: as quatro leem a mesma ordem.</>
        : cen === "aleatoria" ? <>Fila aleatória: AUC {num(auc, 3)}, dentro da faixa do acaso ({num(ACASO.lo, 2)} a {num(ACASO.hi, 2)}); ganho e lift no nível do acaso. A média das PDs é a mesma da logística: <b>média certa não ordena</b>.</>
        : cen === "invertida" ? <>Invertida: AUC {num(auc, 4)} = 1 − {num(AUC0, 4)}; o KS por máximo de TPR − FPR fica perto de zero e a separação aparece com sinal trocado.</>
        : <>Ruído σ = {num(sigma, 1)}: {medidas}. Mais ruído, mais pares trocados, <b>todas caem juntas</b>.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Embaralhamento com semente ${SEMENTE_EMBARALHAR}; faixa do acaso: 95% central de ${N_ACASO} embaralhamentos (sementes 1 a ${N_ACASO}); ruído normal com semente 20261015 somado em log odds. KS: maior TPR − FPR.`}>
      <Painel>
        <div className="q7-g2-s15">
          <div className="q7-g2-quad">{graf}</div>
          <div className="q7-g2-s15-lado">
            <div className="q7-kpis q7-kpis--2">
              <Kpi rotulo="AUC" valor={num(auc, 3)} detalhe={`acaso ${num(ACASO.lo, 2)} a ${num(ACASO.hi, 2)}`} />
              <Kpi rotulo="KS" valor={num(k.ks, 3)} detalhe="maior TPR − FPR" />
              <Kpi rotulo="Ganho em 10%" valor={pct(g10.ganho!, 0)} detalhe={`${g10.capturados} de ${D}`} />
              <Kpi rotulo="Lift em 10%" valor={vezes(g10.lift!, 1)} detalhe="acaso: 1×" />
            </div>
            <Seg rotulo="Foco do gráfico" opcoes={[{ v: "roc" as Foco, r: "ROC" }, { v: "ks" as Foco, r: "KS" }, { v: "ganho" as Foco, r: "Ganho" }, { v: "lift" as Foco, r: "Lift" }]} valor={foco} onChange={setFoco} />
          </div>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Se a fila for invertida (o mais arriscado vai para o fim), o que acontece com a AUC de ${num(AUC0, 2)}?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher={liberado} />
        <p className="q7-k">Cenário{liberado ? "" : ": liberado depois da previsão"}</p>
        <div className="q7-g2-grade2"><Seg rotulo="Cenário" opcoes={(Object.keys(NOMES) as Cen[]).map((c) => ({ v: c, r: NOMES[c] }))} valor={cen} onChange={setCen} desab={!liberado} /></div>
        {cen === "perturbada" && <Controle rotulo="Ruído σ em log odds" valor={sigma} min={0} max={3} passo={0.1} onChange={setSigma} mostrar={num(sigma, 1)} escala={["0: a logística", "3: quase acaso"]} />}
        <div className="q7-botoes"><Botao sec onClick={() => { setEsc(null); setCen("boa"); setSigma(1); setFoco("roc"); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
