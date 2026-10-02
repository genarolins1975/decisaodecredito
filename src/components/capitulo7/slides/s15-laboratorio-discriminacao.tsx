"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Legenda, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { CENARIOS, D, N, PL, SEMENTE_EMBARALHAR, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaGanho, curvaRoc, fila, ganho, ks, logit, media, mulberry32, quantil, sigmoide, transformar, type PontoRoc } from "@/lib/capitulo7/metricas";
import { int, num, pct, vezes } from "@/lib/capitulo7/formato";
import { SLIDE } from "@/lib/capitulo7/roteiro";

/**
 * 15 · c7p27 · Laboratório de discriminação, na janela inteira. Quatro filas: a da logística, a embaralhada, a
 * invertida e a perturbada (logit p + σ·z, com z normal padrão de semente 20261015). Quatro pequenos múltiplos (ROC,
 * TPR − FPR, ganho e lift), cada um com a logística em cinza, para o "juntos" ser visto de uma vez. A previsão pergunta
 * o que somar +1 em log odds a todas as PDs faz com as quatro (nada: só a ordem importa); a resposta certa abre o
 * controle de nível já em +1 (a em log odds, aplicado depois do cenário), com a tabela antes e depois, e libera os
 * cenários (trocar de cenário volta o nível a 0, para a leitura falar do cenário). A faixa do acaso vem de 200 embaralhamentos das PDs da logística (sementes 1 a 200); a escala do ruído
 * mostra a AUC calculada em σ = 3, que fica acima dessa faixa.
 */
type Cen = "boa" | "aleatoria" | "invertida" | "perturbada";
type Foco = "roc" | "ks" | "ganho" | "lift";
const Z = (() => { const r = mulberry32(20261015); return PL.map(() => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }); })();
const NOMES: Record<Cen, string> = { boa: "Fila da logística", aleatoria: "Fila aleatória", invertida: "Fila invertida", perturbada: "Fila com ruído" };
const AUC0 = aucPorPares(Y, PL).auc!;
const ROC0 = curvaRoc(Y, PL);
const N_ACASO = 200;
/** AUC com o ruído máximo do controle (σ = 3): a ponta da escala mostra o valor calculado, que fica acima da faixa do acaso. */
const SIGMA_MAX = 3;
const AUC_S3 = aucPorPares(Y, PL.map((p, i) => sigmoide(logit(p) + SIGMA_MAX * Z[i]))).auc!;
const ACASO = (() => {
  const v: number[] = [];
  for (let s = 1; s <= N_ACASO; s++) { const r = mulberry32(s); const a = PL.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } v.push(aucPorPares(Y, a).auc!); }
  v.sort((a, b) => a - b); return { lo: quantil(v, 0.025), hi: quantil(v, 0.975) };
})();
/** A previsão: somar A_PREV em log odds a todas as PDs. A PD média muda; a ordem, não. */
const A_PREV = 1;
const PDM_PREV = media(transformar(PL, A_PREV, 1))!;
const PDM0 = media(PL)!;
const OPS = [
  { texto: "Sobem: PDs maiores pegam mais defaults", certa: false, retorno: <>Todas as PDs sobem juntas e ninguém troca de lugar. Confunde nível com ordem; o nível pesa na perda (slide {SLIDE.c7p28.n}).</> },
  { texto: "Só a AUC fica; as outras dependem de corte", certa: false, retorno: <>KS e ganho leem posições da fila, não uma PD fixa. Confunde corte na fila com corte de PD, que muda a decisão (slide {SLIDE.c7p37.n}).</> },
  { texto: "Nada: as quatro só leem a ordem", certa: true, retorno: <>Isso: a mesma constante em log odds sobe todas as PDs e ninguém troca de lugar.</> },
  { texto: "Caem: as PDs ficam altas demais", certa: false, retorno: <>PD alta demais é erro de nível, medido na calibração (slides {SLIDE.c7p29.n} a {SLIDE.c7p32.n}). Confunde calibração com ordenação.</> },
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
  const ksAbs = Math.max(...s.roc.map((p) => Math.abs(p.tpr - p.fpr)));
  const g0 = ganho(Y, PL, 0.1), k0 = ks(Y, PL);
  const pdm = media(pd)!, pdm0 = media(base)!;
  const medidas = <>AUC {num(auc, 4)}, KS {num(k.ks, 3)}, {g10.capturados} de {D} defaults nos 10% piores (lift {vezes(g10.lift!, 1)})</>;
  const restaurar = () => { setEsc(null); setCen("boa"); setSigma(1); setNivel(0); };
  return (
    <Quadro slug="c7p27" pagina={pagina} layout="gl"
      conclusao={!liberado ? <>Fila da logística: {medidas}. Responda à previsão para liberar os outros cenários.</>
        : nivel !== 0 ? <>Nível {nivel > 0 ? "+" : "−"}{num(Math.abs(nivel), 1)} em log odds: a PD média vai de {pct(pdm0, 1)} a <b>{pct(pdm, 1)}</b>, e {medidas} ficam onde estavam. <b>Só a ordem move as quatro</b>; o que o nível muda, a perda esperada, é o slide {SLIDE.c7p28.n}.</>
        : cen === "boa" ? <>Fila da logística: {medidas}. Todas acima do acaso: aqui as quatro andam juntas porque leem a mesma fila. Entre modelos cujas ROC se cruzam, AUC e KS podem discordar.</>
        : cen === "aleatoria" ? <>Fila aleatória: AUC {num(auc, 4)}, dentro da faixa do acaso ({num(ACASO.lo, 2)} a {num(ACASO.hi, 2)}); ganho e lift no nível do acaso. A média das PDs é a mesma da logística: <b>média certa não ordena</b>.</>
        : cen === "invertida" ? <>Invertida: AUC {num(auc, 4)} = 1 − {num(AUC0, 4)}. Pela convenção (maior TPR − FPR), o KS cai a {num(k.ks, 3)}; medido por |TPR − FPR|, seria {num(ksAbs, 3)}{Math.abs(ksAbs - k0.ks) < 1e-9 ? ", o mesmo da logística" : ""}. A fila continua informativa, só que ao contrário: <b>KS baixo não separa fila invertida de fila sem informação</b>; a AUC abaixo de 0,5 separa.</>
        : <>Ruído σ = {num(sigma, 1)}: {medidas}. {pct(pdm0, 1) === pct(PDM0, 1) ? <>A PD média fica em {pct(PDM0, 1)}; </> : <>A PD média {pdm0 > PDM0 ? "sobe" : "cai"} de {pct(PDM0, 1)} para {pct(pdm0, 1)}, erro que um intercepto corrige; </>}o que derruba as quatro juntas são <b>os pares trocados</b>.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Embaralhamento com semente ${SEMENTE_EMBARALHAR}; faixa do acaso: 95% central de ${N_ACASO} embaralhamentos (sementes 1 a ${N_ACASO}); ruído normal com semente 20261015 somado em log odds. KS: maior TPR − FPR. Lift a partir de 2% da carteira.`}>
      <Painel>
        <div className="q7-s21-l"><Seg rotulo="Cenário" opcoes={(Object.keys(NOMES) as Cen[]).map((c) => ({ v: c, r: NOMES[c] }))} valor={cen} onChange={(c) => { setCen(c); setNivel(0); }} desab={!liberado} />{liberado ? <Botao sec onClick={restaurar}>Restaurar</Botao> : <span className="q7-nota">Cenários liberados depois da previsão</span>}</div>
        <div className="q7-g2-s15m">
          <Mini foco="roc" s={s} liftMax={liftMax} titulo={<>ROC<small>AUC {num(auc, 4)} · acaso {num(ACASO.lo, 2)} a {num(ACASO.hi, 2)}</small></>} />
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
        <Previsao pergunta={`+${num(A_PREV, 0)} em log odds em todas as PDs (média de ${pct(PDM0, 1)} a ${pct(PDM_PREV, 1)}): o que fazem AUC, KS, ganho e lift?`} opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && OPS[i].certa) { setCen("boa"); setNivel(A_PREV); } }} recolher={liberado} />
        {liberado && <p className="q7-k">Logística → cenário</p>}
        {liberado && <dl className="q7-g2-s15-ad" aria-label="As quatro medidas: logística, seta, cenário">
          {([["AUC", num(AUC0, 4), num(auc, 4)], ["KS", num(k0.ks, 3), num(k.ks, 3)], [`10% piores, de ${D}`, String(g0.capturados), String(g10.capturados)], ["Lift nos 10%", vezes(g0.lift!, 1), vezes(g10.lift!, 1)]] as const).map(([r, v0, v1]) => <div key={r}><dt>{r}</dt><dd><span>{v0}</span> → <b>{v1}</b></dd></div>)}
        </dl>}
        {liberado && cen === "perturbada" && <Controle rotulo="Ruído σ em log odds" valor={sigma} min={0} max={SIGMA_MAX} passo={0.1} onChange={setSigma} mostrar={num(sigma, 1)} escala={["0: a logística", `${num(SIGMA_MAX, 0)}: AUC perto de ${num(AUC_S3, 2)}`]} />}
      </Painel>
    </Quadro>
  );
}
