"use client";
import { useId, useState } from "react";
import { Botao, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, escala, type Pagina } from "../base";
import { ANCORA, CAL, D, META } from "@/lib/capitulo7/dados";
import { calibradores, N_JANELAS, SEMENTE_JANELAS, vitorias } from "@/lib/capitulo7/janelas";
import { media, valoresDistintos } from "@/lib/capitulo7/metricas";
import { int, num, pct, pp, sinal } from "@/lib/capitulo7/formato";

/**
 * 27 · c7p16 · Recalibrar exige uma amostra própria. A linha do tempo da base do curso em barras com o período no eixo
 * horizontal e a espessura proporcional ao número de propostas; as setas "ajusta" e "mede" mostram onde o calibrador
 * aprende e onde é avaliado. O atalho (ajustar o Platt na janela fora do tempo e medir nela mesma) só abre depois da
 * previsão. A amostra de calibração é sintética: os mesmos proponentes da janela, sorteados com reposição (3.000
 * sorteios), com desfecho novo sorteado da PD verdadeira; não existe em dados reais, e a fonte e o desenho dizem isso.
 * Rodada 2: a janela tem 81 defaults e não distingue os calibradores (o Platt fica 0,0018 acima de sem calibrar); a
 * tabela mostra, ao lado da log loss na janela, a perda esperada pela PD verdadeira em janelas novas da mesma população
 * (calibradores de janelas.ts), em que o Platt da calibração é o melhor dos três e o atalho promete mais do que entrega.
 * Rodada 4: as janelas novas viram "réplicas sintéticas da janela", definidas na leitura; o terceiro modo, Safras
 * anteriores, mostra o que a carteira real teria: o intercepto ajustado na validação (13,2% de default) ou em treino e
 * validação juntos, aplicado à janela (ANCORA de dados.ts). O rótulo "mede" sai de cima da ponta da seta.
 * Rodada 5: a âncora não se escolhe pela janela. O seletor de âncora (última safra ou várias safras) move a seta
 * "ajusta o nível" (da barra da validação, ou de uma chave que junta treino e validação) e a linha destacada da
 * tabela; a tabela compara cada âncora também com a PD verdadeira média da janela (só na base sintética), e as duas
 * erram por cerca de 1 ponto, em lados opostos. A nota diz que no treino a logística acerta a média por construção e
 * que o intercepto pela diferença de logits é aproximação; a leitura diz que a finalidade escolhe a amostra.
 */
type Modo = "certo" | "atalho" | "safras";
type Ancora = "ultima" | "varias";
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
/** taxa de default observada em cada partição, mostrada no modo Safras anteriores */
const TAXA: Record<string, number> = { treino: ANCORA.treino.taxa, val: ANCORA.validacao.taxa, oot: ANCORA.taxaJanela };
const PM_CAL = media(C.intercepto!.pd)!;
const FAIXAS: Faixa[] = [
  { k: "treino", nome: "Treino", n: META.nTreino, de: 0, ate: 14, cor: "#3D5A8A", faz: "estima o modelo", curto: "estima o modelo" },
  { k: "val", nome: "Validação", n: META.nVal, de: 14, ate: 19, cor: "#5B6475", faz: "escolhe hiperparâmetros", curto: "hiperparâmetros" },
  { k: "oot", nome: "Janela fora do tempo", n: META.nOot, de: 19, ate: 24, cor: "#2E6B4F", faz: "a prova, uma vez", curto: "a prova" },
  { k: "cal", nome: "Calibração, sintética", n: CAL.n, de: 19, ate: 24, cor: "#176C73", faz: `${int(CAL.n)} sorteios dos mesmos proponentes`, curto: "mesmos proponentes" },
];

function Linha({ modo, ancora }: { modo: Modo; ancora: Ancora }) {
  const atalho = modo === "atalho", safras = modo === "safras", varias = safras && ancora === "varias";
  const aNivel = varias ? ANCORA.variasSafras.a : ANCORA.soValidacao.a;
  const id = useId().replace(/:/g, "");
  return (
    <Grafico rotulo={`Linha do tempo: treino ${META.nTreino}, validação ${META.nVal}, janela fora do tempo ${META.nOot} e calibração sintética ${CAL.n} sorteios dos mesmos proponentes da janela; ${atalho ? "no atalho, o calibrador é ajustado e medido na janela" : safras ? `numa carteira real, o intercepto é ajustado ${varias ? "em treino e validação juntos" : "só na validação"} (default de ${pct(TAXA.treino, 1)} no treino e ${pct(TAXA.val, 1)} na validação) e medido na janela (${pct(TAXA.oot, 1)})` : "o calibrador é ajustado na calibração e medido na janela"}`} arCelular="1 / 1">
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
        const noX = d.w - noW, noY = atalho ? cy(R.oot) : safras ? (cy(R.val) + cy(R.oot)) / 2 : (cy(R.oot) + cy(R.cal)) / 2, noH = fs * 2.6;
        const ticks = x(19) - x(14) > fs * 3.6 ? [[0, "2022-01"], [14, "2023-03"], [19, "2023-08"], [24, "2023-12"]] as const : [[0, "2022-01"], [24, "2023-12"]] as const;
        // várias safras: uma chave junta o fim das barras de treino e validação, e a seta sai do meio dela
        const xb = x(19) + fs * 0.9, yChave = (cy(R.treino) + cy(R.val)) / 2;
        const sx = x(24) + fs * 0.25, ex = noX - fs * 0.15, sxAj = varias ? xb : safras ? x(19) + fs * 0.25 : sx;
        // as duas setas nunca se cruzam: a de cima liga o topo do nó, a de baixo liga a base
        const curva = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`;
        const yAj = atalho ? cy(R.oot) - R.oot.barra * 0.3 : varias ? yChave : safras ? cy(R.val) : cy(R.cal), yMe = atalho ? cy(R.oot) + R.oot.barra * 0.3 : cy(R.oot);
        const cima = atalho || safras; // a seta de ajuste chega pelo topo do nó
        const nAj = cima ? noY - fs * 0.45 : noY + fs * 0.45, nMe = cima ? noY + fs * 0.45 : noY - fs * 0.45;
        const ajusta = curva(sxAj, yAj, ex, nAj), mede = curva(ex, nMe, sx + fs * 0.3, yMe);
        // rótulos das setas longe da ponta: a ponta de "mede" tem meia altura de 0,5 fs
        const yRotAj = varias ? cy(R.treino) - fs * 0.5 : cima ? yAj - fs * 0.5 : yAj + fs * 1.1, yRotMe = cima ? yMe + fs * 1.55 : yMe - fs * 1.05;
        return (
          <g>
            <defs>
              <pattern id={`${id}h`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#176C73" fillOpacity={0.22} /><line x1="0" y1="0" x2="0" y2="8" stroke="#176C73" strokeWidth="3" /></pattern>
              <marker id={`${id}p`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#176C73" /></marker>
              <marker id={`${id}v`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2E6B4F" /></marker>
            </defs>
            {ticks.map(([m, t]) => <g key={m}><line className="q7-grade" x1={x(m)} x2={x(m)} y1={topo - fs * 0.4} y2={R.cal.y + R.cal.h} strokeDasharray={m === 0 || m === 24 ? undefined : "4 4"} /><text className="q7-tick" x={x(m)} y={topo - fs * 0.6} textAnchor={m === 0 || m === 24 ? "start" : "middle"}>{t}</text></g>)}
            {rows.map((r) => {
              const off = (atalho || safras) && r.k === "cal";
              const by = cy(r) - r.barra / 2;
              return (
                <g key={r.k} opacity={off ? 0.4 : 1}>
                  <text className="q7-rot" x={0} y={cy(r) - fs * (r.k === "cal" ? 0.75 : 0.2)} style={{ fill: r.cor }}>{estreito && r.k === "oot" ? "Janela" : r.nome}</text>
                  <text className="q7-rot--peq" x={0} y={cy(r) + fs * (r.k === "cal" ? 0.3 : 0.85)} style={{ fill: "#2A3342" }}>{off ? "não usada" : `${int(r.n)} ${r.k === "cal" ? (estreito ? "sorteios" : "sorteios com reposição") : "propostas"}`}</text>
                  {r.k === "cal" && <text className="q7-rot--peq" x={0} y={cy(r) + fs * 1.3} style={{ fill: "#5B6475" }}>{estreito ? r.curto : `dos ${int(META.nOot)} (${int(DISTINTOS)} aparecem)`}</text>}
                  {r.k === "cal" ? <rect x={x(r.de)} y={by} width={x(r.ate) - x(r.de)} height={r.barra} fill={`url(#${id}h)`} stroke="#176C73" strokeWidth={2} strokeDasharray="6 4" rx={3} />
                    : <rect x={x(r.de)} y={by} width={x(r.ate) - x(r.de)} height={r.barra} fill={r.cor} rx={3} />}
                  {r.k === "treino" && x(r.ate) - x(r.de) > fs * 8 && <text className="q7-rot--peq" x={x(r.de) + fs * 0.5} y={cy(r)} dy=".35em" style={{ fill: "#fff" }}>{r.faz}</text>}
                  {r.k === "treino" && safras && x(r.ate) - x(r.de) > fs * 8 && <text className="q7-rot--peq" x={x(r.de) + fs * 0.5} y={cy(r) + fs * 1.2} dy=".35em" style={{ fill: "#fff", fontWeight: 700 }}>default {pct(TAXA.treino, 1)}</text>}
                  {r.k === "val" && !estreito && <text className="q7-rot--peq" x={x(r.de) - fs * 0.4} y={cy(r)} dy=".35em" textAnchor="end" style={{ fill: safras ? "#2A3342" : "#5B6475", fontWeight: safras ? 700 : undefined }}>{safras ? `default ${pct(TAXA.val, 1)}` : r.faz}</text>}
                  {r.k === "oot" && safras && !estreito && <text className="q7-rot--peq" x={x(r.de) - fs * 0.4} y={cy(r)} dy=".35em" textAnchor="end" style={{ fill: "#2A3342", fontWeight: 700 }}>default {pct(TAXA.oot, 1)}</text>}
                  {r.k === "cal" && !estreito && <text className="q7-rot--peq" x={x(r.de) - fs * 0.4} y={cy(r)} dy=".35em" textAnchor="end" style={{ fill: "#176C73" }}>desfecho novo, da PD verdadeira</text>}
                </g>
              );
            })}
            {varias && <path d={`M${x(14) + fs * 0.25} ${cy(R.treino)}H${xb}V${cy(R.val)}H${x(19) + fs * 0.25}`} fill="none" stroke="#176C73" strokeWidth={3} strokeLinejoin="round" />}
            <path d={ajusta} fill="none" stroke="#176C73" strokeWidth={3} markerEnd={`url(#${id}p)`} />
            <path d={mede} fill="none" stroke="#2E6B4F" strokeWidth={3} markerEnd={`url(#${id}v)`} />
            <text className="q7-rot--peq" x={varias ? x(14) + fs * 0.5 : sxAj + fs * 0.2} y={yRotAj} style={{ fill: "#176C73", fontWeight: 700 }}>{safras && !estreito ? "ajusta o nível" : "ajusta"}</text>
            <text className="q7-rot--peq" x={sx + fs * 0.2} y={yRotMe} style={{ fill: "#2E6B4F", fontWeight: 700 }}>mede</text>
            <rect x={noX} y={noY - noH / 2} width={noW} height={noH} rx={fs * 0.4} fill="#fff" stroke={atalho ? "#8C2332" : "#00205B"} strokeWidth={2} />
            <text className="q7-rot" x={noX + noW / 2} y={noY - fs * 0.15} textAnchor="middle" style={{ fill: "#00205B" }}>{safras ? "Nível" : "Platt"}</text>
            <text className="q7-rot--peq" x={noX + noW / 2} y={noY + fs * 0.85} textAnchor="middle" style={{ fill: "#5B6475" }}>{safras ? `a ${sinal(aNivel, 2)}` : "a, b"}</text>
            {atalho && <text className="q7-rot--peq" x={noX + noW} y={noY - noH / 2 - fs * 0.45} textAnchor="end" style={{ fill: "#8C2332", fontWeight: 700 }}>✕ leu a prova</text>}
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
  const [ancora, setAncora] = useState<Ancora>("ultima");
  // vitórias nas réplicas sintéticas da janela: sorteio sob demanda, ao abrir o slide (nunca no carregamento do módulo)
  const [VENCE] = useState(() => vitorias("pl", "platt", "sem"));
  const aberto = prev === CERTA;
  const atalho = aberto && modo === "atalho", safras = aberto && modo === "safras";
  const A = ANCORA;
  const escolher = (i: number | null) => { setPrev(i); setModo(i === CERTA ? "atalho" : "certo"); setAncora("ultima"); };
  const PT_ = A.ptJanela;
  return (
    <Quadro slug="c7p16" pagina={pagina} layout="gl"
      conclusao={safras ? <>Numa carteira real, o nível vem de safras anteriores, e a taxa oscila: {pct(TAXA.treino, 1)}, {pct(TAXA.val, 1)} e {pct(TAXA.oot, 1)}. Pela PD verdadeira da janela ({pct(PT_, 1)}), a última safra erra {pp(A.soValidacao.pdMedia - PT_)} ({pct(A.soValidacao.pdMedia, 1)}) e várias safras, {pp(A.variasSafras.pdMedia - PT_)} ({pct(A.variasSafras.pdMedia, 1)}): <b>com {D} defaults, a janela não escolhe a âncora.</b> Escolhe a finalidade, antes da janela: provisão pede o nível corrente; capital, a média de várias safras (<LinkSlide slug="c7p38">slide 36</LinkSlide>).</>
        : !atalho ? <>Platt da calibração, medido na janela: log loss {num(LL_CERTO, 4)} contra {num(LL_SEM, 4)} sem calibrar; com {D} defaults, {num(DIF, 4)} é ruído. Nas <b>réplicas sintéticas da janela</b> (os mesmos {int(META.nOot)} proponentes com o desfecho sorteado de novo pela PD verdadeira; {N_JANELAS} sorteios, só possível em base sintética), o Platt é <b>o melhor dos três ({num(C.platt!.esperada.logLoss, 4)})</b> e vence sem calibrar em {VENCE} delas.</>
        : <>Ajustado e medido na mesma janela: <b>{num(LL_ATALHO, 4)}</b>, menor que o protocolo ({num(LL_CERTO, 4)}) por construção. Nas réplicas, o atalho entrega {num(C.atalho!.esperada.logLoss, 4)}, pior que o protocolo ({num(C.platt!.esperada.logLoss, 4)}): aprendeu a sorte da janela. <b>Nunca reporte um calibrador na amostra em que ele foi ajustado.</b></>}
      fonte={safras ? `Janela fora do tempo: ${int(META.nOot)} propostas, ${D} defaults; PD verdadeira média ${pct(PT_, 2)}, só na base sintética. Treino (${int(A.treino.n)} propostas, ${A.treino.defaults} defaults) e validação (${int(A.validacao.n)}, ${A.validacao.defaults}) só existem agregados, sem PD por proposta: intercepto aproximado pela diferença de logits entre taxa e PD média (abaixo da raiz exata, slide 28), somado ao log odds de cada PD da janela.`
        : `Janela fora do tempo: ${int(META.nOot)} propostas, ${D} defaults. Calibração sintética: ${int(CAL.n)} sorteios com reposição dos ${int(META.nOot)} proponentes da janela (${int(DISTINTOS)} aparecem), desfecho da PD verdadeira (semente ${CAL.semente}); sem deriva: o ganho é um teto. Réplicas: ${N_JANELAS} sorteios (semente ${SEMENTE_JANELAS}); esperada: média exata pela PD verdadeira.`}>
      <Painel titulo="Onde o calibrador aprende e onde é medido">
        <Linha modo={aberto ? modo : "certo"} ancora={ancora} />
      </Painel>
      <Painel>
        {!safras && <dl className="q7-s27-def" aria-label="Os dois calibradores da tabela">
          <div><dt>Intercepto</dt><dd>soma a ao log odds: só o nível (<LinkSlide slug="c7p12">slide 28</LinkSlide>).</dd></div>
          <div><dt>Platt</dt><dd>σ(a + b · logit p): nível e inclinação (<LinkSlide slug="c7p13">slide 29</LinkSlide>).</dd></div>
        </dl>}
        {aberto ? (
          <div className="q7-linha-ctl"><Seg rotulo="Procedimento" opcoes={[{ v: "certo" as Modo, r: "Protocolo" }, { v: "atalho" as Modo, r: "Atalho" }, { v: "safras" as Modo, r: "Safras" }]} valor={modo} onChange={setModo} cor /><Botao sec onClick={() => escolher(null)}>Restaurar</Botao></div>
        ) : (
          <Previsao recolher pergunta={<>Atalho: Platt ajustado e medido na janela. Contra {num(LL_CERTO, 4)}, a log loss dele será...</>} escolha={prev} onEscolha={escolher}
            opcoes={[
              { certa: false, texto: "Maior, porque ajustar na prova é arriscado", retorno: "Confunde o risco com o número medido: ajustado nesses casos, o Platt minimiza essa log loss, que só pode cair. O risco aparece em outra amostra." },
              { certa: false, texto: "Igual, porque o procedimento é o mesmo", retorno: "O procedimento é o mesmo; os dados, não. Ajustado na janela, ele persegue as respostas da janela; ficar igual seria coincidência." },
              { texto: "Menor", certa: true, retorno: "Isso." },
            ]} />
        )}
        {aberto && !safras && <p className="q7-retorno" data-tom="certa">Isso: nos mesmos casos, o atalho escolhe a&nbsp;=&nbsp;{num(PLATT_OOT.a, 3)} e b&nbsp;=&nbsp;{num(PLATT_OOT.b, 3)} (protocolo: {num(PLATT_CAL.a, 3)} e {num(PLATT_CAL.b, 3)}) para minimizar a perda que vai reportar. Ler o número menor como calibrador melhor confunde ajuste com prova.</p>}
        {safras ? (<>
          <div className="q7-linha-ctl" data-ancora=""><Seg rotulo="Âncora do nível" opcoes={[{ v: "ultima" as Ancora, r: "Última safra" }, { v: "varias" as Ancora, r: "Várias safras" }]} valor={ancora} onChange={setAncora} /></div>
          <table className="q7-tab q7-tab--comp q7-s27-t">
            <thead><tr><th className="q7-t-l">Âncora do intercepto (aproximação)</th><th>PD média</th><th>O/E obs.</th><th>O/E verd.</th></tr></thead>
            <tbody>
              <tr><th>Sem recalibrar</th><td>{pct(A.sem.pdMedia, 1)}</td><td>{num(A.sem.oe, 3)}</td><td>{num(A.sem.oeVerd, 3)}</td></tr>
              <tr data-on={ancora === "ultima" ? "1" : undefined}><th>Última safra ({pct(TAXA.val, 1)})</th><td>{pct(A.soValidacao.pdMedia, 1)}</td><td>{num(A.soValidacao.oe, 3)}</td><td>{num(A.soValidacao.oeVerd, 3)}</td></tr>
              <tr data-on={ancora === "varias" ? "1" : undefined}><th>Várias safras ({pct(A.variasSafras.taxa, 1)})</th><td>{pct(A.variasSafras.pdMedia, 1)}</td><td>{num(A.variasSafras.oe, 3)}</td><td>{num(A.variasSafras.oeVerd, 3)}</td></tr>
              <tr><th>Sintética, o teto</th><td>{pct(PM_CAL, 1)}</td><td>{num(TAXA.oot / PM_CAL, 3)}</td><td>{num(PT_ / PM_CAL, 3)}</td></tr>
            </tbody>
          </table>
          <p className="q7-nota">O/E = taxa ÷ PD média: observada ({pct(TAXA.oot, 1)}, {D} defaults) ou verdadeira ({pct(PT_, 1)}). Várias safras: treino e validação. No treino, a logística acerta a média por construção ({pct(A.treino.pdMedia, 2)}): juntá-lo dilui a correção da validação, com peso de {pct(A.pesoTreino, 0)}.</p>
        </>) : <table className="q7-tab q7-tab--comp q7-s27-t">
          <thead><tr><th className="q7-t-l">Log loss da logística</th><th>Na janela</th><th>Esperada nas réplicas</th></tr></thead>
          <tbody>{LINHAS.filter((l) => aberto || l.id !== "atalho").map((l) => { const c = C[l.id]!; return (
            <tr key={l.id} data-on={(atalho ? l.id === "atalho" : l.id === "platt") ? "1" : undefined}><th>{l.r}</th><td>{num(c.janela.logLoss, 4)}</td><td>{num(c.esperada.logLoss, 4)}</td></tr>
          ); })}</tbody>
        </table>}
      </Painel>
    </Quadro>
  );
}
