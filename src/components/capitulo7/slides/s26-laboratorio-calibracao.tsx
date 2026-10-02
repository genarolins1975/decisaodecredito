"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Painel, Previsao, Quadro, margens, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, calibracaoGlobal, corp, faixasQuantis, interceptoESlope, logit, logLoss, media, sigmoide, transformar } from "@/lib/capitulo7/metricas";
import { num, pct, pp } from "@/lib/capitulo7/formato";

/**
 * 26 · c7p35 · Laboratório: boa fila, probabilidades ruins. p' = σ(a + b · logit p) sobre a logística da janela, com
 * b > 0 (estritamente crescente). Curva de confiabilidade, Brier, log loss, PD média e a transformação desenhada; a AUC
 * fica parada enquanto b > 0. Os eixos das duas curvas crescem até o maior valor transformado (sem teto falso em 50%).
 * Controles e atalhos ficam travados até a resposta certa da previsão (quem piora mais, em proporção, com b = 2,2 e a
 * mesma PD média). O exemplo "melhor ajuste" (nesta janela) usa a própria janela para estimar a e b: referência visual,
 * não avaliação independente (slide 27). Nos atalhos de excesso e falta de confiança, a é escolhido por bisseção para
 * manter a PD média da logística: só a inclinação muda; o intervalo de a (±3) comporta esses valores.
 */
const AUC0 = aucPorPares(Y, PL).auc!;
const AJ = interceptoESlope(Y, PL);
const PM = media(PL)!;
/** a que mantém a PD média da logística para um dado b (a média transformada cresce com a). */
const aMesmaMedia = (b: number) => { let lo = -10, hi = 10; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (media(transformar(PL, m, b))! < PM) lo = m; else hi = m; } return (lo + hi) / 2; };
const EXCESSO = { a: aMesmaMedia(2.2), b: 2.2 }, FALTA = { a: aMesmaMedia(0.45), b: 0.45 };
const A_MAX = 3;
const BS_ISO = corp(Y, PL).bsRc;
const BS0 = brier(Y, PL), LL0 = logLoss(Y, PL).valor;
const P_EX = transformar(PL, EXCESSO.a, EXCESSO.b);
const D_BS = brier(Y, P_EX) / BS0 - 1, D_LL = logLoss(Y, P_EX).valor / LL0 - 1;
const PRESETS = [
  { r: "Erro de nível", a: 0.8, b: 1 },
  { r: "Excesso de confiança", ...EXCESSO },
  { r: "Falta de confiança", ...FALTA },
  { r: "Melhor ajuste", a: AJ.intercepto, b: AJ.slope },
];
const OPS = [
  { texto: "A AUC cai, e o Brier junto", certa: false, retorno: <>Com b positivo ninguém troca de lugar: a fila e a AUC ficam. Confunde calibração com ordenação.</> },
  { texto: "A AUC fica; o Brier piora mais que a log loss", certa: false, retorno: <>É o contrário: o Brier tem teto e pesa pouco a confiança que falha; a log loss pune sem limite (slide 24). Confunde as duas escalas.</> },
  { texto: "A AUC fica; a log loss piora mais, em proporção", certa: true, retorno: <>Isso: Brier {pp(D_BS, 1).replace(" pp", "%")}, log loss {pp(D_LL, 1).replace(" pp", "%")}, AUC parada.</> },
];
/** Teto do eixo: 50% ou o próximo múltiplo de 25% acima do maior valor desenhado. */
const teto = (v: number) => Math.min(1, Math.max(0.5, Math.ceil(v / 0.25 - 1e-9) * 0.25));
const ticksDe = (m: number) => Array.from({ length: Math.round(m / 0.25) + 1 }, (_, i) => i * 0.25);

export function S26LaboratorioCalibracao({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [esc, setEsc] = useState<number | null>(null);
  const revelado = esc !== null && OPS[esc].certa;
  const P = useMemo(() => transformar(PL, a, b), [a, b]); const F = useMemo(() => faixasQuantis(Y, P, 10), [P]); const g = calibracaoGlobal(Y, P);
  const F0 = useMemo(() => faixasQuantis(Y, PL, 10), []);
  const auc = aucPorPares(Y, P).auc!;
  const bs = brier(Y, P), ll = logLoss(Y, P).valor;
  const juste = Math.abs(a - AJ.intercepto) < 1e-9 && Math.abs(b - AJ.slope) < 1e-9;
  const curva = Array.from({ length: 100 }, (_, i) => 0.0025 + (i / 99) * 0.4975).map((q) => ({ q, v: sigmoide(a + b * logit(q)) }));
  const tetoT = teto(Math.max(...curva.map((c) => c.v)));
  const tetoC = teto(Math.max(...F.flatMap((f) => [f.pdMedia ?? 0, f.obs ?? 0])));
  const pa = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), 2)}`;
  return (
    <Quadro slug="c7p35" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Laboratório: o que muda quando as PDs se espalham?"}
      sub={revelado ? undefined : "Antes de mexer no nível e na inclinação, preveja o efeito na AUC, no Brier e na log loss."}
      conclusao={juste ? <>Com a e b estimados na própria janela, os pontos encostam na diagonal e o Brier cai para {num(bs, 5)}: <b>o melhor ajuste de a e b nesta amostra</b>, otimista por construção; a isotônica na mesma amostra iria além ({num(BS_ISO, 5)}). O slide 27 mostra por que recalibrar exige uma amostra que o calibrador nunca viu.</>
        : !revelado ? <>Logística como estimada: PD média {pct(g.pdMedia!, 1)} contra {pct(D / N, 1)} observados; Brier {num(bs, 5)}, log loss {num(ll, 4)}, AUC {num(auc, 4)}. Com b = {num(EXCESSO.b, 1)} e a mesma PD média, o que acontece? Responda para liberar os controles.</>
        : <>a = {num(a, 2)}, b = {num(b, 2)}: PD média {pct(g.pdMedia!, 1)} contra {pct(D / N, 1)} observados; Brier {num(bs, 5)} e log loss {num(ll, 4)}. A AUC continua <b>{num(auc, 4)}</b>: com b positivo nenhuma proposta troca de lugar.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; transformação aplicada à PD da logística. Nos atalhos de excesso e falta de confiança, a mantém a PD média em ${pct(PM, 1)}.`}>
      <Painel>
        <div className="q7-s26-g">
          <Confiabilidade titulo="Confiabilidade" sub="cinza: original · petróleo: nova" rotulo={`Curva de confiabilidade com a = ${num(a, 2)} e b = ${num(b, 2)}`} max={tetoC} ticks={ticksDe(tetoC)} series={[{ faixas: F0, classe: "mudo", linha: true }, { faixas: F, classe: "prob", linha: true }]} anotar={false} />
          <Grafico titulo="A transformação" sub="tracejada cinza: sem mudança" rotulo={`Transformação p' = σ(${num(a, 2)} + ${num(b, 2)} logit p), PD nova até ${pct(tetoT, 0)} no eixo`} arCelular="1 / 1">
            {(d) => {
              const m = margens(d.fs, { l: 3, b: 2.8, t: 1, r: 0.8 }); const lado = Math.min(d.w - m.l - m.r, d.h - m.t - m.b);
              const x = escala([0, 0.5], [m.l, m.l + lado]), y = escala([0, tetoT], [m.t + lado, m.t]);
              return <g><Eixos x={x} y={y} xt={[0, 0.25, 0.5]} yt={ticksDe(tetoT)} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="PD original" yTit="PD nova" /><line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(0.5)} y2={y(0.5)} /><path className="q7-linha q7-linha--prob" d={caminho(curva.map((c) => ({ x: x(c.q), y: y(c.v) })))} /></g>;
            }}
          </Grafico>
        </div>
        <div className="q7-s26-ctl">
          {revelado ? <>
            <Controle rotulo="a: nível de todas as PDs" valor={a} min={-A_MAX} max={A_MAX} passo={0.05} onChange={setA} mostrar={pa(a)} escala={["mais baixas", "mais altas"]} />
            <Controle rotulo="b: inclinação" valor={b} min={0.2} max={3} passo={0.05} onChange={setB} mostrar={num(b, 2)} escala={["b < 1 comprime", "b > 1 espalha"]} />
          </> : <p className="q7-nota q7-g2-s26-trava">Os controles de a (nível) e b (inclinação) e os exemplos abrem com a resposta certa da previsão.</p>}
          <Botao sec onClick={() => { setA(0); setB(1); setEsc(null); }}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="AUC" valor={num(auc, 4)} detalhe={Math.abs(auc - AUC0) < 1e-12 ? "igual à original" : "mudou"} tam="mini" />
          <Kpi rotulo="PD média" valor={pct(g.pdMedia!, 1)} detalhe={`observado ${pct(D / N, 1)}`} tam="mini" tom="prob" />
          <Kpi rotulo="Brier" valor={num(bs, 5)} detalhe={bs > BS0 + 1e-12 ? `▲ pior: era ${num(BS0, 5)}` : bs < BS0 - 1e-12 ? `▼ melhor: era ${num(BS0, 5)}` : `original ${num(BS0, 5)}`} tam="mini" tom={bs < BS0 - 1e-12 ? "val" : undefined} />
          <Kpi rotulo="Log loss" valor={num(ll, 4)} detalhe={ll > LL0 + 1e-12 ? `▲ pior: era ${num(LL0, 4)}` : ll < LL0 - 1e-12 ? `▼ melhor: era ${num(LL0, 4)}` : `original ${num(LL0, 4)}`} tam="mini" tom={ll < LL0 - 1e-12 ? "val" : undefined} />
        </div>
        <Previsao pergunta={`Com b = ${num(EXCESSO.b, 1)} e a mesma PD média, o que acontece?`} opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && OPS[i].certa) { setA(EXCESSO.a); setB(EXCESSO.b); } }} recolher />
        {revelado && <div className="q7-g2-grade2 q7-g2-atalhos" role="group" aria-label="Exemplos prontos">{PRESETS.map((pr) => <Botao key={pr.r} onClick={() => { setA(pr.a); setB(pr.b); }}>{pr.r}</Botao>)}</div>}
      </Painel>
    </Quadro>
  );
}
