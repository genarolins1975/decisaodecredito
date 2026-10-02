"use client";
import { useId, useState } from "react";
import { Botao, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, escala, type Pagina } from "../base";
import { CAL, D, META } from "@/lib/capitulo7/dados";
import { calibradores, N_JANELAS, vitorias } from "@/lib/capitulo7/janelas";
import { valoresDistintos } from "@/lib/capitulo7/metricas";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 27 · c7p16 · Recalibrar exige uma amostra própria. A linha do tempo da base do curso em barras com o período no eixo
 * horizontal e a espessura proporcional ao número de propostas; as setas "ajusta" e "mede" mostram onde o calibrador
 * aprende e onde é avaliado. O atalho (ajustar o Platt na janela fora do tempo e medir nela mesma) só abre depois da
 * previsão. A amostra de calibração é sintética: os mesmos proponentes da janela, sorteados com reposição (3.000
 * sorteios), com desfecho novo sorteado da PD verdadeira; não existe em dados reais, e a fonte e o desenho dizem isso.
 * Rodada 2: a janela tem 81 defaults e não distingue os calibradores (o Platt fica 0,0018 acima de sem calibrar); a
 * tabela mostra, ao lado da log loss na janela, a perda esperada pela PD verdadeira em janelas novas da mesma população
 * (calibradores de janelas.ts), em que o Platt da calibração é o melhor dos três e o atalho promete mais do que entrega.
 */
type Modo = "certo" | "atalho";
const C = calibradores("pl");
const PLATT_CAL = { a: C.platt!.a!, b: C.platt!.b! };
const PLATT_OOT = { a: C.atalho!.a!, b: C.atalho!.b! };
const LL_CERTO = C.platt!.janela.logLoss, LL_ATALHO = C.atalho!.janela.logLoss, LL_SEM = C.sem!.janela.logLoss;
/** diferença entre os valores exibidos com quatro casas, para a conta da tela fechar */
const DIF = Math.round(LL_CERTO * 1e4) / 1e4 - Math.round(LL_SEM * 1e4) / 1e4;
const DISTINTOS = valoresDistintos(CAL.indices);
const CERTA = 2;

type Faixa = { k: string; nome: string; n: number; de: number; ate: number; cor: string; faz: string; curto: string };
// meses contados desde 2022-01: treino 2022-01 a 2023-02, validação 2023-03 a 2023-07, janela 2023-08 a 2023-12
const FAIXAS: Faixa[] = [
  { k: "treino", nome: "Treino", n: META.nTreino, de: 0, ate: 14, cor: "#3D5A8A", faz: "estima o modelo", curto: "estima o modelo" },
  { k: "val", nome: "Validação", n: META.nVal, de: 14, ate: 19, cor: "#5B6475", faz: "escolhe hiperparâmetros", curto: "hiperparâmetros" },
  { k: "oot", nome: "Janela fora do tempo", n: META.nOot, de: 19, ate: 24, cor: "#2E6B4F", faz: "a prova, uma vez", curto: "a prova" },
  { k: "cal", nome: "Calibração, sintética", n: CAL.n, de: 19, ate: 24, cor: "#176C73", faz: `${int(CAL.n)} sorteios dos mesmos proponentes`, curto: "mesmos proponentes" },
];

function Linha({ atalho }: { atalho: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <Grafico rotulo={`Linha do tempo: treino ${META.nTreino}, validação ${META.nVal}, janela fora do tempo ${META.nOot} e calibração sintética ${CAL.n} sorteios dos mesmos proponentes da janela; ${atalho ? "no atalho, o calibrador é ajustado e medido na janela" : "o calibrador é ajustado na calibração e medido na janela"}`} arCelular="1 / 1">
      {(d) => {
        const fs = d.fs, estreito = d.w < 520;
        const colL = estreito ? d.w * 0.36 : d.w * 0.27, noW = fs * (estreito ? 3.4 : 4.4), gapSeta = fs * (estreito ? 2.6 : 3.8);
        const x = escala([0, 24], [colL + fs * 0.6, d.w - noW - gapSeta]);
        const topo = fs * 2, gap = fs * 0.55, minRow = fs * 2.5;
        const util = d.h - topo - gap * 3 - fs * 0.3;
        // espessura proporcional ao número de propostas; validação e janela ficam com a altura mínima da linha, a barra dentro dela segue a proporção
        const k = (util - 2 * minRow) / (META.nTreino + CAL.n);
        const altura = (n: number) => Math.max(k * n, minRow);
        let y = topo; const rows = FAIXAS.map((f) => { const h = altura(f.n); const r = { ...f, y, h, barra: k * f.n }; y += h + gap; return r; });
        const R = Object.fromEntries(rows.map((r) => [r.k, r])) as Record<string, (typeof rows)[number]>;
        const cy = (r: (typeof rows)[number]) => r.y + r.h / 2;
        const noX = d.w - noW, noY = atalho ? cy(R.oot) : (cy(R.oot) + cy(R.cal)) / 2, noH = fs * 2.6;
        const ticks = x(19) - x(14) > fs * 3.6 ? [[0, "2022-01"], [14, "2023-03"], [19, "2023-08"], [24, "2023-12"]] as const : [[0, "2022-01"], [24, "2023-12"]] as const;
        const origem = atalho ? R.oot : R.cal;
        const sx = x(24) + fs * 0.25, ex = noX - fs * 0.15;
        // as duas setas nunca se cruzam: a de cima liga o topo do nó, a de baixo liga a base
        const curva = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`;
        const yAj = atalho ? cy(R.oot) - R.oot.barra * 0.3 : cy(R.cal), yMe = atalho ? cy(R.oot) + R.oot.barra * 0.3 : cy(R.oot);
        const nAj = atalho ? noY - fs * 0.45 : noY + fs * 0.45, nMe = atalho ? noY + fs * 0.45 : noY - fs * 0.45;
        const ajusta = curva(sx, yAj, ex, nAj), mede = curva(ex, nMe, sx + fs * 0.3, yMe);
        return (
          <g>
            <defs>
              <pattern id={`${id}h`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#176C73" fillOpacity={0.22} /><line x1="0" y1="0" x2="0" y2="8" stroke="#176C73" strokeWidth="3" /></pattern>
              <marker id={`${id}p`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#176C73" /></marker>
              <marker id={`${id}v`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2E6B4F" /></marker>
            </defs>
            {ticks.map(([m, t]) => <g key={m}><line className="q7-grade" x1={x(m)} x2={x(m)} y1={topo - fs * 0.4} y2={R.cal.y + R.cal.h} strokeDasharray={m === 0 || m === 24 ? undefined : "4 4"} /><text className="q7-tick" x={x(m)} y={topo - fs * 0.6} textAnchor={m === 0 || m === 24 ? "start" : "middle"}>{t}</text></g>)}
            {rows.map((r) => {
              const off = atalho && r.k === "cal";
              const by = cy(r) - r.barra / 2;
              return (
                <g key={r.k} opacity={off ? 0.4 : 1}>
                  <text className="q7-rot" x={0} y={cy(r) - fs * (r.k === "cal" ? 0.75 : 0.2)} style={{ fill: r.cor }}>{estreito && r.k === "oot" ? "Janela" : r.nome}</text>
                  <text className="q7-rot--peq" x={0} y={cy(r) + fs * (r.k === "cal" ? 0.3 : 0.85)} style={{ fill: "#2A3342" }}>{off ? "não usada" : `${int(r.n)} ${r.k === "cal" ? "sorteios" : "propostas"}`}</text>
                  {r.k === "cal" && <text className="q7-rot--peq" x={0} y={cy(r) + fs * 1.3} style={{ fill: "#5B6475" }}>{estreito ? r.curto : `dos ${int(DISTINTOS)} proponentes da janela`}</text>}
                  {r.k === "cal" ? <rect x={x(r.de)} y={by} width={x(r.ate) - x(r.de)} height={r.barra} fill={`url(#${id}h)`} stroke="#176C73" strokeWidth={2} strokeDasharray="6 4" rx={3} />
                    : <rect x={x(r.de)} y={by} width={x(r.ate) - x(r.de)} height={r.barra} fill={r.cor} rx={3} />}
                  {r.k === "treino" && x(r.ate) - x(r.de) > fs * 8 && <text className="q7-rot--peq" x={x(r.de) + fs * 0.5} y={cy(r)} dy=".35em" style={{ fill: "#fff" }}>{r.faz}</text>}
                  {r.k === "val" && !estreito && <text className="q7-rot--peq" x={x(r.de) - fs * 0.4} y={cy(r)} dy=".35em" textAnchor="end" style={{ fill: "#5B6475" }}>{r.faz}</text>}
                  {r.k === "cal" && !estreito && <text className="q7-rot--peq" x={x(r.de) - fs * 0.4} y={cy(r)} dy=".35em" textAnchor="end" style={{ fill: "#176C73" }}>desfecho novo, da PD verdadeira</text>}
                </g>
              );
            })}
            <path d={ajusta} fill="none" stroke="#176C73" strokeWidth={3} markerEnd={`url(#${id}p)`} />
            <path d={mede} fill="none" stroke="#2E6B4F" strokeWidth={3} markerEnd={`url(#${id}v)`} />
            <text className="q7-rot--peq" x={sx + fs * 0.2} y={atalho ? yAj - fs * 0.5 : yAj + fs * 1.1} style={{ fill: "#176C73", fontWeight: 700 }}>ajusta</text>
            <text className="q7-rot--peq" x={sx + fs * 0.2} y={atalho ? yMe + fs * 1.1 : yMe - fs * 0.5} style={{ fill: "#2E6B4F", fontWeight: 700 }}>mede</text>
            <rect x={noX} y={noY - noH / 2} width={noW} height={noH} rx={fs * 0.4} fill="#fff" stroke={atalho ? "#8C2332" : "#00205B"} strokeWidth={2} />
            <text className="q7-rot" x={noX + noW / 2} y={noY - fs * 0.15} textAnchor="middle" style={{ fill: "#00205B" }}>Platt</text>
            <text className="q7-rot--peq" x={noX + noW / 2} y={noY + fs * 0.85} textAnchor="middle" style={{ fill: "#5B6475" }}>a, b</text>
            {atalho && <text className="q7-rot--peq" x={noX + noW / 2} y={noY - noH / 2 - fs * 0.45} textAnchor="middle" style={{ fill: "#8C2332", fontWeight: 700 }}>✕ leu a prova</text>}
          </g>
        );
      }}
    </Grafico>
  );
}

const LINHAS: { id: "sem" | "intercepto" | "platt" | "atalho"; r: string }[] = [
  { id: "sem", r: "Sem calibrar" },
  { id: "intercepto", r: "Intercepto, na calibração" },
  { id: "platt", r: "Platt, na calibração" },
  { id: "atalho", r: "Atalho: Platt na janela" },
];

export function S27AmostraPropria({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("certo");
  const [prev, setPrev] = useState<number | null>(null);
  // vitórias em janelas novas: sorteio sob demanda, ao abrir o slide (nunca no carregamento do módulo)
  const [VENCE] = useState(() => vitorias("pl", "platt", "sem"));
  const aberto = prev === CERTA;
  const atalho = aberto && modo === "atalho";
  const escolher = (i: number | null) => { setPrev(i); setModo(i === CERTA ? "atalho" : "certo"); };
  return (
    <Quadro slug="c7p16" pagina={pagina} layout="gl"
      conclusao={!atalho ? <>Protocolo: Platt ajustado na calibração e medido na janela, log loss {num(LL_CERTO, 4)} contra {num(LL_SEM, 4)} sem calibrar. Com {D} defaults, a diferença de {num(DIF, 4)} é ruído: em janelas novas, o Platt é <b>o melhor dos três ({num(C.platt!.esperada.logLoss, 4)})</b> e vence sem calibrar em {VENCE} de {N_JANELAS}. O <LinkSlide slug="c7p12">slide 28</LinkSlide> começa pelo intercepto.</>
        : <>Ajustado e medido na mesma janela: <b>{num(LL_ATALHO, 4)}</b>, menor que o protocolo ({num(LL_CERTO, 4)}) por construção. Em janelas novas, o atalho entrega {num(C.atalho!.esperada.logLoss, 4)}, pior que o protocolo ({num(C.platt!.esperada.logLoss, 4)}): aprendeu a sorte da janela. <b>Nunca reporte um calibrador na amostra em que ele foi ajustado.</b></>}
      fonte={`Janela fora do tempo: ${int(META.nOot)} propostas, ${D} defaults, desfecho em 12 meses. Calibração sintética: ${int(CAL.n)} sorteios dos ${int(DISTINTOS)} proponentes distintos da janela, desfecho novo da PD verdadeira (semente ${CAL.semente}). Mesma população, sem deriva: o ganho é um teto; numa carteira real, a calibração viria de safras anteriores à janela. Esperada: média exata pela PD verdadeira.`}>
      <Painel titulo="Onde o calibrador aprende e onde é medido">
        <Linha atalho={atalho} />
      </Painel>
      <Painel>
        <dl className="q7-s27-def" aria-label="Os dois calibradores da tabela">
          <div><dt>Intercepto</dt><dd>soma a ao log odds: só o nível (<LinkSlide slug="c7p12">slide 28</LinkSlide>).</dd></div>
          <div><dt>Platt</dt><dd>σ(a + b · logit p): nível e inclinação (<LinkSlide slug="c7p13">slide 29</LinkSlide>).</dd></div>
        </dl>
        {aberto ? (
          <div className="q7-linha-ctl"><Seg rotulo="Procedimento" opcoes={[{ v: "certo" as Modo, r: "Protocolo" }, { v: "atalho" as Modo, r: "Atalho" }]} valor={modo} onChange={setModo} cor /><Botao sec onClick={() => escolher(null)}>Restaurar</Botao></div>
        ) : (
          <Previsao recolher pergunta={<>Atalho: Platt ajustado e medido na janela. Contra {num(LL_CERTO, 4)}, a log loss dele será...</>} escolha={prev} onEscolha={escolher}
            opcoes={[
              { certa: false, texto: "Maior, porque ajustar na prova é arriscado", retorno: "Confunde o risco com o número medido: ajustado nesses casos, o Platt minimiza essa log loss, que só pode cair. O risco aparece em outra amostra." },
              { certa: false, texto: "Igual, porque o procedimento é o mesmo", retorno: "O procedimento é o mesmo; os dados, não. Ajustado na janela, ele persegue as respostas da janela; ficar igual seria coincidência." },
              { texto: "Menor", certa: true, retorno: "Isso." },
            ]} />
        )}
        {aberto && <p className="q7-retorno" data-tom="certa">Isso: nos mesmos casos, o atalho escolhe a&nbsp;=&nbsp;{num(PLATT_OOT.a, 3)} e b&nbsp;=&nbsp;{num(PLATT_OOT.b, 3)} (protocolo: {num(PLATT_CAL.a, 3)} e {num(PLATT_CAL.b, 3)}) para minimizar a perda que vai reportar. Ler o número menor como calibrador melhor confunde ajuste com prova.</p>}
        <table className="q7-tab q7-tab--comp q7-s27-t">
          <thead><tr><th className="q7-t-l">Log loss da logística</th><th>Na janela</th><th>Esperada</th></tr></thead>
          <tbody>{LINHAS.filter((l) => aberto || l.id !== "atalho").map((l) => { const c = C[l.id]!; return (
            <tr key={l.id} data-on={(atalho ? l.id === "atalho" : l.id === "platt") ? "1" : undefined}><th>{l.r}</th><td>{num(c.janela.logLoss, 4)}</td><td>{num(c.esperada.logLoss, 4)}</td></tr>
          ); })}</tbody>
        </table>
      </Painel>
    </Quadro>
  );
}
