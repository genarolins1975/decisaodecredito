"use client";
import { useState, type ReactNode } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Grafico, Legenda, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { CAL, CAL_PGR, D, N, PGR, PT, Y } from "@/lib/capitulo7/dados";
import { ajustarIsotonica, ajustarPlatt, aplicarIsotonica, aucPorPares, EPS_LOG, eventosPorBloco, logit, logLoss, media, perdaEsperada, sigmoide, transformar, valoresDistintos } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 30 · c7p36 · Isotônica contra Platt, ajustadas no boosting sem recalibrar, com a amostra de calibração inteira
 * (3.000 casos) ou com um dos dez blocos de 300. A isotônica é monotônica mas não estritamente: junta propostas em
 * degraus, cria empates e a AUC na janela cai. Isotônica pelo PAV com interpolação linear entre os pontos de quebra,
 * como o IsotonicRegression do scikit-learn. Rodada 3: a escada é a peça principal, com o degrau que mais empata pares
 * da janela anotado nele, e os pares viram uma faixa fina embaixo (a da isotônica escondida até a previsão certa).
 * Nos blocos pequenos, a isotônica dá PD 0% (ou 100%) a regiões inteiras; defaults da janela com PD 0% têm a log loss
 * cortada no limite de 10⁻¹⁵ (logLoss conta as limitadas), e é isso que leva a log loss da isotônica a 0,5 ou mais: a
 * lição de crédito é o piso de PD. Calibradores se comparam pela perda esperada pela PD verdadeira (perdaEsperada), não
 * pela janela de 81 defaults (slide 27). Rodada 4: a leitura conta só os empates novos (depois menos antes).
 * Rodada 5: o eixo vertical vai a 50% e as curvas são recortadas na borda (recortar), não achatadas; onde uma curva sai
 * do quadro, uma seta ▲ diz até onde ela vai (75% com 3.000 casos, 100% em vários blocos). A leitura dos blocos é
 * montada por leituraBloco, que só cita PD 0% ou 100% quando elas existem (conferida por script em todos os blocos).
 * Rodada 6: os rótulos de saída ficam acima do topo do quadro, terminando na coluna da sua seta, com detecção de
 * colisão (o segundo sobe uma linha); o rótulo dos defaults com PD 0% procura, na faixa de baixo, o primeiro lugar longe
 * de toda curva. Onde a isotônica dá PD 0% (ou 100%), a log loss esperada seria infinita: a fonte, a tabela e a
 * leitura dizem que o valor vem do limite de 10⁻¹⁵.
 */
/** Valor da isotônica (interpolação linear entre os pontos, constante fora deles) numa PD. */
const isoEm = (f: { x: number[]; y: number[] }, q: number) => aplicarIsotonica(f, [q])[0];
/** Primeira PD sem calibrar em que a curva passa de `teto`, buscada na grade de x; null se não passa até `xmax`. */
function saidaDoQuadro(g: (q: number) => number, teto: number, xmax: number): number | null {
  const passo = xmax / 2000; let ant = 0;
  for (let k = 1; k <= 2000; k++) { const q = k * passo; if (g(q) > teto) { let lo = ant, hi = q; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (g(m) > teto) hi = m; else lo = m; } return hi; } ant = q; }
  return null;
}
/** Grade de PD sem calibrar desenhada (0,3% a 55%) e pontos da isotônica no mesmo intervalo. */
const QS = Array.from({ length: 120 }, (_, i) => 0.003 + (i / 119) * 0.547);
const pontosIso = (f: { x: number[]; y: number[] }) => [{ x: 0, y: isoEm(f, 0) }, ...f.x.map((xx, i) => ({ x: xx, y: f.y[i] })).filter((q) => q.x > 0 && q.x < 0.55), { x: 0.55, y: isoEm(f, 0.55) }];
type Saida = { nome: string; q: number; max: number; cor: string };
/** Onde cada curva sai do quadro de 50% e até onde vai (no intervalo desenhado de PD sem calibrar, 0 a 55%), pela ordem de saída. */
function saidas(f: { x: number[]; y: number[] }, pc: { a: number; b: number }): Saida[] {
  const platt = (q: number) => sigmoide(pc.a + pc.b * logit(q));
  return [
    { nome: "isotônica", q: saidaDoQuadro((q) => isoEm(f, q), 0.5, 0.55), max: Math.max(...pontosIso(f).map((q) => q.y)), cor: "#00205B" },
    { nome: "Platt", q: saidaDoQuadro(platt, 0.5, 0.55), max: Math.max(...QS.map(platt)), cor: "#176C73" },
  ].filter((sx): sx is Saida => sx.q !== null).sort((u, v) => u.q - v.q);
}
type Caixa = { x0: number; x1: number; linha: number };
/**
 * Rótulos de saída acima do topo do quadro de dados, cada um terminando na coluna da sua seta (ou começando nela, se
 * não couber à esquerda); se dois se tocam na mesma linha, o segundo sobe uma linha. `ocupado` são caixas já na linha 0
 * (o título do eixo y). Largura estimada pelo número de caracteres do rótulo em negrito.
 */
function rotulosSaida(ss: Saida[], x: (v: number) => number, fs: number, xMin: number, xMax: number, ocupado: Caixa[]) {
  const caixas: Caixa[] = [...ocupado], folga = fs * 0.8;
  return ss.map((sx) => {
    const txt = `${sx.nome} até ${pct(sx.max, 0)}`, w = txt.length * fs * 0.86 * 0.6, ax = x(sx.q);
    // candidatos: terminando na coluna da seta ou começando nela, dentro dos limites; a primeira linha livre vence
    const cand = [ax + fs * 0.45 - w, ax - fs * 0.45].map((v) => Math.min(Math.max(v, xMin), xMax - w));
    const livre = (v: number, l: number) => !caixas.some((c) => c.linha === l && v < c.x1 + folga && v + w + folga > c.x0);
    let linha = 0, x0 = cand[0];
    for (;; linha++) { const v = cand.find((c) => livre(c, linha)); if (v !== undefined) { x0 = v; break; } }
    caixas.push({ x0, x1: x0 + w, linha });
    return { ...sx, txt, ax, x0, w, linha };
  });
}
type Tam = "grande" | "pequena";
function ajustes(ini: number, n: number) {
  const y = CAL.y.slice(ini, ini + n), x = CAL_PGR.slice(ini, ini + n);
  const iso = ajustarIsotonica(x, y), pc = ajustarPlatt(y, x);
  const pi = aplicarIsotonica(iso, PGR), pp = transformar(PGR, pc.a, pc.b);
  const met = (p: readonly number[]) => {
    const ll = logLoss(Y, p);
    let zeros = 0, uns = 0, defZero = 0, adiUm = 0;
    p.forEach((q, i) => { if (q <= 0) { zeros++; if (Y[i]) defZero++; } if (q >= 1) { uns++; if (!Y[i]) adiUm++; } });
    // previsões em que a log loss esperada pela PD verdadeira seria infinita (PD 0% com PD verdadeira positiva, ou 100%
    // com PD verdadeira abaixo de 1): ali a esperada também usa o limite de 10⁻¹⁵
    const espLim = p.reduce((s, q, i) => s + ((q < EPS_LOG && PT[i] > 0) || (1 - q < EPS_LOG && PT[i] < 1) ? 1 : 0), 0);
    return { distintos: valoresDistintos(p), pares: aucPorPares(Y, p), media: media(p)!, ll: ll.valor, limitadas: ll.limitadas, esp: perdaEsperada(PT, p).logLoss, espLim, zeros, uns, defZero, adiUm };
  };
  // o degrau da isotônica que mais empata pares default × adimplente da janela: d × a propostas no mesmo valor
  const grupos = new Map<number, { d: number; a: number; lo: number; hi: number }>();
  pi.forEach((q, i) => { const g = grupos.get(q) ?? { d: 0, a: 0, lo: 1, hi: 0 }; if (Y[i]) g.d++; else g.a++; g.lo = Math.min(g.lo, PGR[i]); g.hi = Math.max(g.hi, PGR[i]); grupos.set(q, g); });
  const [vDeg, gDeg] = [...grupos.entries()].reduce((m, e) => (e[1].d * e[1].a > m[1].d * m[1].a ? e : m));
  return { ini, n, x, pi, defaults: y.reduce((s, v) => s + v, 0), iso, pc, platt: met(pp), isot: met(pi), degrau: { v: vDeg, ...gDeg, empates: gDeg.d * gDeg.a }, saidas: saidas(iso, pc) };
}
const NB = CAL.nPequena;
const GRANDE = ajustes(0, CAL.n);
/** Os dez blocos consecutivos de 300 da amostra de calibração; o primeiro é o mais extremo. */
export const BLOCOS = Array.from({ length: Math.floor(CAL.n / NB) }, (_, k) => ajustes(k * NB, NB));
const EVENTOS = eventosPorBloco(CAL.y, NB);
const FAIXA_PLATT = [Math.min(...BLOCOS.map((b) => b.platt.media)), Math.max(...BLOCOS.map((b) => b.platt.media))];
const ESTADOS = [GRANDE, ...BLOCOS];
const BRUTO = { distintos: valoresDistintos(PGR), pares: aucPorPares(Y, PGR) };
/** Com b > 0, o Platt mantém todos os pares: a barra de pares é a mesma de sem calibrar. */
const MESMOS = (a: ReturnType<typeof ajustes>) => a.pc.b > 0 && a.platt.pares.corretos === BRUTO.pares.corretos && a.platt.pares.empates === BRUTO.pares.empates;

/** Trechos da poligonal com y ≤ teto, cortados exatamente na borda (sem clipPath, que deixaria a caixa do SVG fora do painel). */
function recortar(pts: { x: number; y: number }[], teto: number) {
  const runs: { x: number; y: number }[][] = [[]];
  pts.forEach((p, i) => {
    const q = pts[i - 1], dentro = p.y <= teto;
    if (q && (q.y <= teto) !== dentro) { const t = (teto - q.y) / (p.y - q.y); runs[runs.length - 1].push({ x: q.x + t * (p.x - q.x), y: teto }); if (!dentro) runs.push([]); }
    if (dentro) runs[runs.length - 1].push(p);
  });
  return runs.filter((r) => r.length > 1);
}
const nProp = (n: number) => `${int(n)} ${n === 1 ? "proposta" : "propostas"}`;
/** Leitura de um bloco de 300: cita PD 0% e 100% só quando existem; piso se um default levou PD 0%, teto se um adimplente levou PD 100%. */
export function leituraBloco(a: ReturnType<typeof ajustes>, bloco: number): ReactNode {
  const I = a.isot;
  if (I.limitadas > 0) {
    const ext = I.zeros && I.uns ? <>PD 0% a {nProp(I.zeros)} da janela e 100% a {int(I.uns)}</> : I.zeros ? <>PD 0% a {nProp(I.zeros)} da janela</> : <>PD 100% a {nProp(I.uns)} da janela</>;
    const limite = I.defZero && I.adiUm ? "piso e teto de PD" : I.defZero ? "piso de PD" : "teto de PD";
    return <>Bloco {bloco} ({a.defaults} defaults em {NB}): a isotônica dá {ext}; {I.limitadas} {I.limitadas === 1 ? "previsão dá" : "previsões dão"} probabilidade zero ao que aconteceu, cortada em 10⁻¹⁵ (+{num(CUSTO_LIM, 1)} cada), e a log loss na janela vai a <b>{num(I.ll, 4)}</b>. <b>Com poucos dados, a isotônica exige {limite}.</b> Pela PD verdadeira{I.espLim ? " (com o mesmo limite; sem ele, infinita)" : ""}, {num(I.esp, 4)} contra {num(a.platt.esp, 4)} do Platt.</>;
  }
  const melhor = a.platt.esp < I.esp ? "Platt" : "isotônica";
  return <>Bloco {bloco} ({a.defaults} defaults em {NB}): PD média {pct(a.platt.media, 1)} (Platt) e {pct(I.media, 1)} (isotônica) contra {pct(D / N, 1)} observados. Nos dez blocos, a do Platt vai de {pct(FAIXA_PLATT[0], 1)} a {pct(FAIXA_PLATT[1], 1)}: <b>com {NB} casos, o nível segue a sorte do bloco</b>. Pela PD verdadeira, o {melhor} perde menos ({num(a.platt.esp, 4)} contra {num(I.esp, 4)}).</>;
}
/** Índice da alternativa certa da previsão: a comparação só abre depois dela; errar mostra o retorno e pede nova tentativa. */
const CERTA = 1;
/** −ln do limite de 10⁻¹⁵: o que cada previsão cortada soma à log loss. */
const CUSTO_LIM = -Math.log(EPS_LOG);

export function S30Isotonica({ pagina }: { pagina?: Pagina }) {
  const [t, setT] = useState<Tam>("grande");
  const [bloco, setBloco] = useState(1);
  const [prev, setPrev] = useState<number | null>(null);
  const a = t === "grande" ? GRANDE : BLOCOS[bloco - 1];
  const revelado = prev === CERTA;
  const barras = [
    ...(MESMOS(a) ? [{ nome: "Sem calibrar e Platt", c: BRUTO.pares, dist: BRUTO.distintos }] : [{ nome: "Sem calibrar", c: BRUTO.pares, dist: BRUTO.distintos }, { nome: "Platt", c: a.platt.pares, dist: a.platt.distintos }]),
    { nome: "Isotônica", c: a.isot.pares, dist: a.isot.distintos },
  ];
  const ISO = barras.length - 1;
  const restaurar = () => { setT("grande"); setBloco(1); setPrev(null); };
  const I = a.isot, cortadas = I.limitadas > 0;
  const proxima = <>O <LinkSlide slug="c7p37">slide 31</LinkSlide> leva a recalibração à decisão.</>;
  return (
    <Quadro slug="c7p36" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Isotônica: o que acontece com a fila?"} sub={revelado ? undefined : "Uma função que nunca desce, ajustada aos dados sem forma imposta."}
      conclusao={!revelado ? <>Primeiro a previsão: a isotônica também nunca inverte duas propostas.</>
        : t === "grande" ? <>Com {int(a.n)} casos, a isotônica reduz as {int(BRUTO.distintos)} PDs distintas da janela a <b>{I.distintos}</b> degraus: {int(I.pares.empates - BRUTO.pares.empates)} pares viram empates{BRUTO.pares.empates ? <> (havia {int(BRUTO.pares.empates)})</> : null} e a AUC cai de {num(BRUTO.pares.auc!, 4)} para <b>{num(I.pares.auc!, 4)}</b>. Pela PD verdadeira, a log loss esperada fica {num(a.platt.esp, 4)} no Platt e {num(I.esp, 4)} na isotônica; a janela, com {D} defaults, não separa os dois. {proxima}</>
          : leituraBloco(a, bloco)}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults, ${int(BRUTO.pares.pares)} pares default × adimplente; empate conta meio par. Calibração sintética: sorteios dos proponentes da janela, desfecho da PD verdadeira (semente ${CAL.semente}); blocos de ${NB} consecutivos, com ${EVENTOS.join(", ")} defaults. Log loss com limite de 10⁻¹⁵, também na esperada (média exata pela PD verdadeira), que sem ele seria infinita onde a calibrada dá PD 0% ou 100%.`}>
      <Painel>
        <Grafico titulo="A transformação da isotônica e a de Platt" sub={`ajustadas em ${int(a.n)} casos; embaixo, os pares da janela`} rotulo={`Isotônica em ${a.iso.x.length} pontos, com ${I.distintos} PDs distintas na janela, e curva de Platt ajustadas em ${a.n} casos${revelado ? `; o degrau de ${pct(a.degrau.v, 1)} junta ${a.degrau.d + a.degrau.a} propostas da janela e ${int(a.degrau.empates)} empates` : ""}. Pares: ${barras.filter((b, i) => revelado || i < ISO).map((b) => `${b.nome}: ${b.c.corretos} certos, ${b.c.empates} empates, ${b.c.invertidos} invertidos`).join("; ")}${revelado ? "" : "; isotônica: aguardando a previsão"}`} arCelular="4 / 5">
          {(d) => {
            const fs = d.fs, estreito = d.w < 520, faixaH = fs * 1.1, faixaGap = fs * (estreito ? 1.6 : 0.45), faixaTopo = d.h - barras.length * (faixaH + faixaGap);
            // os rótulos de saída ficam acima do topo do quadro de dados, em uma ou duas linhas: a altura reservada é a
            // maior entre os onze estados (3.000 casos e os dez blocos), para o quadro não pular ao trocar de bloco
            const mg0 = margens(fs, { l: 3, b: 2.6, t: 1.4, r: 0.8 });
            const x = escala([0, 0.55], [mg0.l, d.w - mg0.r]);
            const yTitW = "PD calibrada".length * fs * 0.95 * 0.6, ocupado: Caixa[] = [{ x0: mg0.l, x1: mg0.l + yTitW, linha: 0 }];
            const linhas = Math.max(1, ...ESTADOS.map((e) => Math.max(0, ...rotulosSaida(e.saidas, x, fs, fs * 0.2, d.w - 2, ocupado).map((r) => r.linha + 1))));
            const mg = { ...mg0, t: fs * (2.05 + (linhas - 1) * 1.15) };
            // em tela estreita o rótulo do degrau não cabe entre as curvas: vai para duas linhas sob o título do eixo x
            const degFora = estreito && revelado, extraDeg = degFora ? fs * 2.6 : 0;
            const y = escala([0, 0.5], [faixaTopo - mg.b - fs * 0.3 - extraDeg, mg.t]);
            const cl = (v: number) => Math.min(0.5, v);
            const platt = (q: number) => sigmoide(a.pc.a + a.pc.b * logit(q));
            const isoPts = pontosIso(a.iso);
            const rotSaida = rotulosSaida(a.saidas, x, fs, fs * 0.2, d.w - 2, ocupado);
            const g = a.degrau, gx0 = x(g.lo), gx1 = x(g.hi), gy = y(cl(g.v));
            // caixa [x0, x1] × [topo, fundo] (em px) a mais de meio corpo de toda curva desenhada (Platt, isotônica, diagonal)
            const curvas = [platt, (q: number) => isoEm(a.iso, q), (q: number) => q];
            const longeDasCurvas = (x0: number, x1: number, topo: number, fundo: number) => {
              const f = fs * 0.5;
              for (let p = x0 - f; p <= x1 + f; p += fs * 0.25) { const q = x.inv(p); if (q < 0 || q > 0.55) continue; for (const c of curvas) { const cy = y(cl(c(q))); if (cy > topo - f && cy < fundo + f) return false; } }
              return true;
            };
            // rótulo do degrau ligado ao degrau por uma linha: no canto de cima à esquerda ou, se uma curva passa por ali, no
            // primeiro lugar livre descendo em meio corpo e andando para a direita em dois corpos (a ligação precisa caber)
            const deg1 = `degrau de ${pct(g.v, 1)}: ${g.d + g.a} propostas da janela`, deg2 = `${g.d} × ${g.a} = ${int(g.empates)} pares empatados`;
            const wDeg = Math.max(deg1.length * 0.53, deg2.length * 0.58) * fs * 0.86;
            const posDeg = (() => {
              for (let dy = 0; y(0.47) + dy + fs * 2.35 < gy - fs * 2; dy += fs * 0.5)
                for (let dx = 0; x(0.012) + dx + wDeg <= d.w - mg.r; dx += fs * 2)
                  if (longeDasCurvas(x(0.012) + dx, x(0.012) + dx + wDeg, y(0.47) + dy - fs * 0.45, y(0.47) + dy + fs * 1.6)) return { rx: x(0.012) + dx, ry1: y(0.47) + dy };
              return { rx: x(0.012), ry1: y(0.47) };
            })();
            const { rx, ry1 } = posDeg, ry2 = ry1 + fs * 1.15, mx = (gx0 + Math.max(gx1, gx0 + fs * 0.4)) / 2;
            const zerosDef = a.pi.map((q, i) => (q <= 0 && Y[i] ? PGR[i] : null)).filter((v): v is number => v !== null);
            // rótulo dos defaults com PD 0%: na faixa de baixo do quadro, no primeiro lugar à direita das marcas em que a
            // caixa do texto fica a mais de meio corpo de toda curva (Platt, isotônica, diagonal); as curvas sobem com a PD
            const rotZero = (() => {
              const txt = `● ${zerosDef.length} ${zerosDef.length === 1 ? "default" : "defaults"} da janela com PD 0%`, w = txt.length * fs * 0.86 * 0.6;
              const base = y(0) - fs * 0.9, topo = base - fs * 0.75, fundo = base + fs * 0.25;
              const livre = (x0: number) => longeDasCurvas(x0, x0 + w, topo, fundo);
              const ini = zerosDef.length ? x(cl(Math.max(...zerosDef))) + fs * 0.6 : x(0), fim = x(0.55) - w;
              for (let x0 = ini; x0 <= fim; x0 += fs * 0.25) if (livre(x0)) return { txt, x0, base };
              return { txt, x0: fim, base };
            })();
            const colL = estreito ? 0 : Math.min(fs * 19, d.w * 0.45), px = escala([0, BRUTO.pares.pares], [colL, d.w - mg.r]);
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} yt={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="PD sem calibrar" yTit="PD calibrada" />
                <line className="q7-diag q7-s30-curva" x1={x(0)} y1={y(0)} x2={x(0.5)} y2={y(0.5)} />
                {a.x.map((q, i) => <line key={i} x1={x(q)} x2={x(q)} y1={y(0)} y2={y(0) - fs * 0.45} stroke="#5B6475" strokeOpacity={a.n > 1000 ? 0.1 : 0.3} />)}
                {recortar(QS.map((q) => ({ x: q, y: platt(q) })), 0.5).map((run, i) => <path key={`p${i}`} className="q7-linha q7-linha--prob q7-s30-curva" d={caminho(run.map((q) => ({ x: x(q.x), y: y(q.y) })))} />)}
                {recortar(isoPts, 0.5).map((run, i) => <path key={`i${i}`} className="q7-linha q7-linha--ink q7-s30-curva" d={caminho(run.map((q) => ({ x: x(q.x), y: y(q.y) })))} />)}
                {rotSaida.map((sx) => (
                  <g key={sx.nome} className="q7-s30-saida">
                    <path d={`M${sx.ax} ${y(0.5) - fs * 0.75}l${fs * 0.42} ${fs * 0.7}h${-fs * 0.84}z`} fill={sx.cor} />
                    <text className="q7-rot q7-rot--peq q7-s30-lbl" x={sx.x0} y={y(0.5) - fs * (1.1 + sx.linha * 1.15)} style={{ fill: sx.cor, fontWeight: 700 }}>{sx.txt}</text>
                  </g>
                ))}
                {revelado && <g>
                  <line x1={gx0} x2={Math.max(gx1, gx0 + fs * 0.4)} y1={gy} y2={gy} stroke="#5B6475" strokeWidth={fs * 0.55} strokeOpacity={0.45} strokeLinecap="round" />
                  {degFora ? <>
                    <line x1={0} x2={fs * 1.2} y1={y(0) + mg.b + fs * 1.0} y2={y(0) + mg.b + fs * 1.0} stroke="#5B6475" strokeWidth={fs * 0.55} strokeOpacity={0.45} strokeLinecap="round" />
                    <text className="q7-rot q7-rot--peq q7-s30-lbl" x={fs * 1.7} y={y(0) + mg.b + fs * 1.0} dy=".35em" style={{ fill: "#2A3342" }}>{deg1}</text>
                    <text className="q7-rot q7-rot--peq q7-s30-lbl" x={fs * 1.7} y={y(0) + mg.b + fs * 2.15} dy=".35em" style={{ fill: "#5B6475", fontWeight: 700 }}>{deg2}</text>
                  </> : <>
                    <path d={`M${rx + fs * 1.2} ${ry2 + fs * 0.6}L${rx + fs * 1.2} ${gy - fs * 1.4}L${mx} ${gy - fs * 0.4}`} fill="none" stroke="#5B6475" strokeWidth={1.5} />
                    <text className="q7-rot q7-rot--peq q7-s30-lbl" x={rx} y={ry1} dy=".35em" style={{ fill: "#2A3342" }}>{deg1}</text>
                    <text className="q7-rot q7-rot--peq q7-s30-lbl" x={rx} y={ry2} dy=".35em" style={{ fill: "#5B6475", fontWeight: 700 }}>{deg2}</text>
                  </>}
                </g>}
                {revelado && zerosDef.length > 0 && <g>
                  {zerosDef.map((v, i) => <circle key={i} cx={x(cl(v))} cy={y(0) - fs * 0.05} r={fs * 0.3} className="q7-pt-def" />)}
                  <text className="q7-rot q7-rot--peq q7-s30-lbl" x={rotZero.x0} y={rotZero.base} style={{ fill: "#8C2332", fontWeight: 700 }}>{rotZero.txt}</text>
                </g>}
                {barras.map((b, k) => {
                  const y0 = faixaTopo + k * (faixaH + faixaGap) + faixaGap;
                  const nome = <text className="q7-rot--peq" x={0} y={estreito ? y0 - fs * 0.45 : y0 + faixaH / 2} dy=".35em" style={{ fill: "#2A3342", fontWeight: 600 }}>{b.nome}{k === ISO && !revelado ? "" : <tspan style={{ fill: "#5B6475", fontWeight: 500 }}>: AUC {num(b.c.auc!, 4)}{b.c.empates > BRUTO.pares.empates ? ` · ${int(b.c.empates)} empates` : ""}</tspan>}</text>;
                  if (k === ISO && !revelado) return <g key={b.nome}>{nome}<rect x={px(0)} y={y0} width={px(BRUTO.pares.pares) - px(0)} height={faixaH} fill="#FBFAF7" stroke="#C9CDD5" strokeDasharray="6 5" /><text className="q7-rot--peq" x={(px(0) + px(BRUTO.pares.pares)) / 2} y={y0 + faixaH / 2} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>? responda à previsão</text></g>;
                  const seg = [{ v: b.c.corretos, c: "#2E6B4F" }, { v: b.c.empates, c: "#5B6475" }, { v: b.c.invertidos, c: "#8C2332" }]; let acc = 0;
                  return (
                    <g key={b.nome}>
                      {nome}
                      {seg.map((sg, i) => { const r = <rect key={i} x={px(acc)} y={y0} width={Math.max(0, px(acc + sg.v) - px(acc))} height={faixaH} fill={sg.c} />; acc += sg.v; return r; })}
                    </g>
                  );
                })}
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "linha prob", r: "Platt" }, { mk: "linha ink", r: "isotônica" }, { mk: "", r: "pares: verde certos, cinza empates, vinho invertidos" }]} />
      </Painel>
      <Painel>
        {!revelado ? (
          <Previsao pergunta="A isotônica nunca inverte a ordem de duas propostas. Na janela, a AUC depois dela..." escolha={prev} onEscolha={setPrev} recolher
            opcoes={[
              { certa: false, texto: "Fica igual, como em Platt", retorno: "Ela não inverte, mas junta: é não decrescente, não estritamente crescente. Propostas diferentes no mesmo degrau ficam empatadas, e empate conta meio par." },
              { texto: "Pode cair, por causa de empates", certa: true, retorno: "Isso. Os degraus juntam propostas com PDs diferentes; pares que estavam certos viram empates e a AUC cai." },
              { certa: false, texto: "Sobe, porque a isotônica é mais flexível", retorno: "Flexibilidade melhora o ajuste do nível na amostra de calibração, não a ordenação. Uma função monotônica nunca cria pares certos novos." },
            ]} />
        ) : (
          <>
            <div className="q7-linha-ctl"><Seg rotulo="Amostra de calibração" opcoes={[{ v: "grande" as Tam, r: `${int(CAL.n)} casos` }, { v: "pequena" as Tam, r: `Blocos de ${NB}` }]} valor={t} onChange={setT} cor /><Botao sec onClick={restaurar}>Restaurar</Botao></div>
            {t === "pequena" && <Controle rotulo={`Bloco de ${NB} (de 1 a ${BLOCOS.length})`} valor={bloco} min={1} max={BLOCOS.length} passo={1} onChange={setBloco} mostrar={`${bloco}: ${EVENTOS[bloco - 1]} defaults`} />}
            <table className="q7-tab q7-tab--comp">
              <thead><tr><th className="q7-t-l">Na janela</th><th>Platt</th><th>Isotônica</th></tr></thead>
              <tbody>
                <tr><th>Parâmetros</th><td>2</td><td>{a.iso.x.length} pontos</td></tr>
                <tr><th>AUC</th><td>{num(a.platt.pares.auc!, 4)}</td><td>{num(I.pares.auc!, 4)}</td></tr>
                <tr><th>PD média</th><td>{pct(a.platt.media, 2)}</td><td>{pct(I.media, 2)}</td></tr>
                <tr data-on={I.zeros + I.uns > 0 ? "1" : undefined}><th>PD de 0% ou 100%</th><td>{a.platt.zeros + a.platt.uns}</td><td>{I.zeros + I.uns}</td></tr>
                <tr><th>Log loss na janela</th><td>{num(a.platt.ll, 4)}{a.platt.limitadas ? ` (${a.platt.limitadas})` : ""}</td><td>{num(I.ll, 4)}{I.limitadas ? ` (${I.limitadas} cortadas)` : ""}</td></tr>
                <tr><th>Log loss esperada</th><td>{num(a.platt.esp, 4)}</td><td>{num(I.esp, 4)}{I.espLim ? " (limite)" : ""}</td></tr>
              </tbody>
            </table>
            {/* nos blocos a nota sai: a leitura já conta as previsões cortadas (o número entre parênteses) e diz que a esperada é pela PD verdadeira */}
            {t === "grande" && <p className="q7-nota">Esperada: pela PD verdadeira. A janela tem {D} defaults e não separa calibradores (<LinkSlide slug="c7p16">slide 27</LinkSlide>).</p>}
          </>
        )}
        <Expandir resumo="Quando cada uma">
          <p className="q7-nota">Platt supõe que a distorção é uma reta em log odds: dois parâmetros, estável com pouco dado. A isotônica só supõe ordem: corrige formas que Platt não alcança, mas precisa de muitos casos por região de PD, devolve degraus e, nas pontas, PD 0% ou 100%. Arredondar PDs para relatório também cria empates: veja o slide 7.</p>
        </Expandir>
        {!revelado && <div className="q7-botoes"><Botao sec onClick={restaurar}>Restaurar</Botao></div>}
      </Painel>
    </Quadro>
  );
}
