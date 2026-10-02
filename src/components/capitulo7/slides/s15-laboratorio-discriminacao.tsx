"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Legenda, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { CENARIOS, D, N, PL, SEMENTE_EMBARALHAR, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaGanho, curvaRoc, fila, ganho, ks, logit, media, mulberry32, quantil, sigmoide, transformar, type PontoRoc } from "@/lib/capitulo7/metricas";
import { int, num, pct, vezes } from "@/lib/capitulo7/formato";

/**
 * 15 · c7p27 · Laboratório de discriminação, na janela inteira. Quatro filas: a da logística, a embaralhada, a
 * invertida e a perturbada (logit p + σ·z, com z normal padrão de semente 20261015). Quatro pequenos múltiplos (ROC,
 * TPR − FPR, ganho e lift), cada um com a logística em cinza, para o "juntos" ser visto de uma vez. A previsão libera
 * os cenários e o controle de nível (a em log odds, aplicado depois do cenário): ele muda a PD média e deixa as quatro
 * medidas paradas. A faixa do acaso vem de 200 embaralhamentos das PDs da logística (sementes 1 a 200).
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

type Serie = { roc: PontoRoc[]; cg: { x: number; y: number }[] };
const BASE: Serie = { roc: ROC0, cg: curvaGanho(Y, PL) };
/** Um dos quatro pequenos múltiplos: a fila do cenário em azul, a da logística em cinza fino, a referência do acaso tracejada. */
function Mini({ foco, s, titulo, liftMax }: { foco: Foco; s: Serie; titulo: ReactNode; liftMax: number }) {
  return (
    <Grafico titulo={titulo} rotulo={`${foco === "roc" ? "ROC" : foco === "ks" ? "Separação TPR − FPR ao longo da fila" : foco === "ganho" ? "Ganho acumulado" : "Lift acumulado"} do cenário, com a logística em cinza`} arCelular="4 / 3">
      {(d) => {
        const m = margens(d.fs, { l: 2.9, b: 2.5, t: 1.3, r: 0.8 });
        const sep = [s, BASE].flatMap((v) => v.roc.map((p) => p.tpr - p.fpr));
        const ymin = foco === "ks" ? Math.min(0, Math.floor(Math.min(...sep) * 4) / 4) : 0;
        const ymax = foco === "lift" ? liftMax : foco === "ks" ? Math.max(0.5, Math.ceil(Math.max(...sep) * 4) / 4) : 1;
        const x = escala([0, 1], [m.l, d.w - m.r]), y = escala([ymin, ymax], [d.h - m.b, m.t]);
        const serie = (v: Serie) => foco === "roc" ? v.roc.map((p) => ({ x: x(p.fpr), y: y(p.tpr) }))
          : foco === "ganho" ? v.cg.map((p) => ({ x: x(p.x), y: y(p.y) }))
          : foco === "lift" ? v.cg.filter((p) => p.x >= 0.02).map((p) => ({ x: x(p.x), y: y(p.y / p.x) }))
          : v.roc.map((p) => ({ x: x(p.recusados / N), y: y(p.tpr - p.fpr) }));
        const yt = foco === "ks" ? [-1, -0.5, 0, 0.5, 1].filter((v) => v >= ymin - 1e-9 && v <= ymax + 1e-9) : foco === "lift" ? Array.from({ length: Math.floor(liftMax / (liftMax > 4 ? 2 : 1)) + 1 }, (_, i) => i * (liftMax > 4 ? 2 : 1)) : [0, 0.5, 1];
        return (
          <g>
            <Eixos x={x} y={y} xt={[0, 0.5, 1]} yt={yt} fx={(v) => pct(v, 0)} fy={(v) => foco === "lift" ? `${num(v, 0)}×` : foco === "ks" ? num(v, 1) : pct(v, 0)}
              xTit={foco === "roc" ? "falso positivo" : "carteira examinada, da maior PD"} yTit={foco === "roc" ? "verdadeiro positivo" : foco === "ganho" ? `defaults alcançados, de ${D}` : undefined} />
            {foco === "roc" && <path className="q7-area" fill="#3D5A8A" d={`${caminho(serie(s))}L${x(1)} ${y(0)}L${x(0)} ${y(0)}Z`} />}
            {(foco === "roc" || foco === "ganho") && <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />}
            {foco === "lift" && <line x1={x(0)} x2={x(1)} y1={y(1)} y2={y(1)} stroke="#5B6475" strokeDasharray="7 6" strokeWidth={2} />}
            {foco === "ks" && <line x1={x(0)} x2={x(1)} y1={y(0)} y2={y(0)} stroke="#5B6475" strokeDasharray="7 6" strokeWidth={2} />}
            <path className="q7-linha q7-linha--mudo q7-linha--fina" d={caminho(serie(BASE))} />
            <path className="q7-linha q7-linha--ord" d={caminho(serie(s))} />
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
  const [nivel, setNivel] = useState(0);
  const base = useMemo(() => cen === "boa" ? PL : cen === "aleatoria" ? CENARIOS.filaFracaMediaCerta : cen === "invertida" ? PL.map((p) => 1 - p) : PL.map((p, i) => sigmoide(logit(p) + sigma * Z[i])), [cen, sigma]);
  // o nível soma a em log odds: muda todas as PDs e não troca ninguém de lugar
  const pd = useMemo(() => (nivel === 0 ? base : transformar(base, nivel, 1)), [base, nivel]);
  const ord = useMemo(() => fila(pd), [pd]);
  const auc = aucPorPares(Y, pd).auc!, k = ks(Y, pd), g10 = ganho(Y, pd, 0.1, ord);
  const s: Serie = { roc: useMemo(() => curvaRoc(Y, pd), [pd]), cg: useMemo(() => curvaGanho(Y, pd, ord), [pd, ord]) };
  const liftMax = Math.ceil(Math.max(...[s, BASE].flatMap((v) => v.cg.filter((p) => p.x >= 0.02).map((p) => p.y / p.x))) + 0.05);
  const liberado = esc !== null && OPS[esc].certa;
  const pdm = media(pd)!, pdm0 = media(base)!;
  const medidas = <>AUC {num(auc, 3)}, KS {num(k.ks, 3)}, {g10.capturados} de {D} defaults nos 10% piores (lift {vezes(g10.lift!, 1)})</>;
  const restaurar = () => { setEsc(null); setCen("boa"); setSigma(1); setNivel(0); };
  return (
    <Quadro slug="c7p27" pagina={pagina} layout="gl"
      conclusao={!liberado ? <>Fila da logística: {medidas}. Responda à previsão para liberar os outros cenários.</>
        : nivel !== 0 ? <>Nível {nivel > 0 ? "+" : "−"}{num(Math.abs(nivel), 1)} em log odds: a PD média vai de {pct(pdm0, 1)} a <b>{pct(pdm, 1)}</b>, e {medidas} ficam onde estavam. <b>Só a ordem move as quatro</b>; o que o nível muda, a perda esperada, é o slide 16.</>
        : cen === "boa" ? <>Fila da logística: {medidas}. Todas acima do acaso: aqui as quatro andam juntas porque leem a mesma fila. Entre modelos cujas ROC se cruzam, AUC e KS podem discordar.</>
        : cen === "aleatoria" ? <>Fila aleatória: AUC {num(auc, 3)}, dentro da faixa do acaso ({num(ACASO.lo, 2)} a {num(ACASO.hi, 2)}); ganho e lift no nível do acaso. A média das PDs é a mesma da logística: <b>média certa não ordena</b>.</>
        : cen === "invertida" ? <>Invertida: AUC {num(auc, 4)} = 1 − {num(AUC0, 4)}; o KS por máximo de TPR − FPR fica perto de zero e a separação aparece com sinal trocado.</>
        : <>Ruído σ = {num(sigma, 1)}: {medidas}. Mais ruído, mais pares trocados, <b>as quatro caem juntas</b>.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Embaralhamento com semente ${SEMENTE_EMBARALHAR}; faixa do acaso: 95% central de ${N_ACASO} embaralhamentos (sementes 1 a ${N_ACASO}); ruído normal com semente 20261015 somado em log odds. KS: maior TPR − FPR. Lift a partir de 2% da carteira.`}>
      <Painel>
        <div className="q7-g2-s15m">
          <Mini foco="roc" s={s} liftMax={liftMax} titulo={<>ROC<small>AUC {num(auc, 3)} · acaso {num(ACASO.lo, 2)} a {num(ACASO.hi, 2)}</small></>} />
          <Mini foco="ks" s={s} liftMax={liftMax} titulo={<>TPR − FPR ao longo da fila<small>KS {num(k.ks, 3)}</small></>} />
          <Mini foco="ganho" s={s} liftMax={liftMax} titulo={<>Ganho acumulado<small>10%: {g10.capturados} de {D}</small></>} />
          <Mini foco="lift" s={s} liftMax={liftMax} titulo={<>Lift acumulado<small>10%: {vezes(g10.lift!, 1)}</small></>} />
        </div>
        <div className="q7-g2-linha q7-g2-s15-rod">
          {liberado ? <Controle rotulo="Nível das PDs: a, em log odds" valor={nivel} min={-1.5} max={1.5} passo={0.1} onChange={setNivel} mostrar={`${nivel > 0 ? "+" : nivel < 0 ? "−" : ""}${num(Math.abs(nivel), 1)} (PD média ${pct(pdm, 1)})`} /> : <span />}
          <Legenda itens={[{ mk: "linha ord", r: "cenário" }, { mk: "linha mudo", r: "logística" }, { mk: "trac mudo", r: "acaso" }]} />
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta={`Se a fila for invertida (o mais arriscado vai para o fim), o que acontece com a AUC de ${num(AUC0, 2)}?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher={liberado} />
        <div className="q7-s21-l"><p className="q7-k">Cenário{liberado ? "" : ": liberado depois da previsão"}</p><Botao sec onClick={restaurar}>Restaurar</Botao></div>
        <div className="q7-g2-grade2"><Seg rotulo="Cenário" opcoes={(Object.keys(NOMES) as Cen[]).map((c) => ({ v: c, r: NOMES[c] }))} valor={cen} onChange={setCen} desab={!liberado} /></div>
        {liberado && cen === "perturbada" && <Controle rotulo="Ruído σ em log odds" valor={sigma} min={0} max={3} passo={0.1} onChange={setSigma} mostrar={num(sigma, 1)} escala={["0: a logística", "3: quase acaso"]} />}
      </Painel>
    </Quadro>
  );
}
