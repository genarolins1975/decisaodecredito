"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, LinkSlide, margens, Painel, Previsao, Quadro, type Pagina } from "../base";
import { Lista } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { betaRegularizada, calibracaoGlobal, faixasQuantis } from "@/lib/capitulo7/metricas";
import { int, num, pct, pp } from "@/lib/capitulo7/formato";

/**
 * 19 · c7p10 · A curva de confiabilidade construída diante da turma. As 737 PDs da logística, em ordem crescente,
 * são cortadas em dez faixas de mesmo tamanho; a faixa destacada vira um ponto: x = PD média prevista, y = frequência
 * observada. Antes de cada passo a turma prevê se o ponto fica acima ou abaixo da diagonal; quando o desvio da faixa é
 * menor que um desvio padrão da frequência binomial (√(p(1 − p)/n)), o retorno diz que é ruído. Com as dez faixas, uma
 * previsão conceitual (em quantas faixas a PD cabe no intervalo de 95%?) abre o intervalo de Wilson, definido na tela
 * em uma frase (o slide 21 o apresenta). "6 de 10 acima" se compara com o acaso: supondo faixas independentes, cada
 * uma acima com probabilidade de cerca de 1/2, a cauda binomial sai da beta regularizada da biblioteca (aproximação).
 * A curva é a peça principal, larga (eixos em escalas próprias, diagonal rotulada no canto vazio de baixo, à direita,
 * com uma amostra do traço), com defaults/n em cada ponto, posto por busca num lugar que não toca a diagonal, a curva,
 * outro ponto nem outro rótulo; com os intervalos, os rótulos saem do desenho (não cabem entre os traços das faixas de
 * PD baixa) e ficam no título de cada ponto e na tabela. À direita ficam a régua das faixas e a conta da faixa corrente.
 */
const F = faixasQuantis(Y, PL, 10);
const ACIMA = F.filter((f) => f.obs! > f.pdMedia!).length;
const COMPATIVEIS = F.filter((f) => f.compativel).length;
const ABAIXO = 10 - ACIMA;
/** P(X ≥ ACIMA) com X ~ Binomial(10, 1/2) = I_{1/2}(ACIMA, 10 − ACIMA + 1). */
const P_ACASO = betaRegularizada(0.5, ACIMA, 10 - ACIMA + 1);
const LARG = F.map((f) => f.ic!.hi - f.ic!.lo); const LMIN = Math.min(...LARG), LMAX = Math.max(...LARG);
const OE = calibracaoGlobal(Y, PL).razaoOE!;
const ASC = PL.map((p, i) => ({ p, y: Y[i] })).sort((a, b) => a.p - b.p);
const PMAX = ASC[ASC.length - 1].p;
type Palpite = "acima" | "abaixo" | null;
const OPS = [
  { texto: "Em nenhuma", certa: false, retorno: <>Sozinho, um ponto fora da diagonal não prova nada: com cerca de 74 casos, cada intervalo tem de {pp(LMIN, 0).replace("+", "")} a {pp(LMAX, 0).replace("+", "")} de largura. Confunde distância isolada com descalibração.</> },
  { texto: COMPATIVEIS >= 9 ? "Em todas ou quase todas" : `Em ${COMPATIVEIS}`, certa: true, retorno: <>Isso: em {COMPATIVEIS} das 10.</> },
  { texto: `Só nas ${ABAIXO} abaixo`, certa: false, retorno: <>O lado não decide: um ponto acima da diagonal pode estar perto dela, dentro do ruído. Confunde a direção do erro com a evidência dele.</> },
];

const XMAX = 0.3;
type Caixa = { x0: number; x1: number; y0: number; y1: number };
const cruza = (a: Caixa, b: Caixa) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
/** O segmento (x1, y1) a (x2, y2) passa pela caixa? Recorte de Liang e Barsky. */
function segCruza(c: Caixa, x1: number, y1: number, x2: number, y2: number) {
  let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
  for (const [p, q] of [[-dx, x1 - c.x0], [dx, c.x1 - x1], [-dy, y1 - c.y0], [dy, c.y1 - y1]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return true;
}
type Lugar = { x: number; y: number; anc: "start" | "middle" | "end" };
/**
 * Onde vai o rótulo defaults/n de cada ponto: o primeiro lugar livre, começando pelo lado do ponto longe da diagonal
 * (acima para ponto acima dela, abaixo para ponto abaixo), depois os lados e as diagonais do ponto. Livre quer dizer
 * que o rótulo, com o halo, não toca a diagonal, a curva, outro ponto, outro rótulo, as anotações dos cantos nem a
 * borda. Se algum rótulo pedido não tiver lugar, nenhum é desenhado: o valor fica no título do ponto e na tabela.
 */
function lugares(pts: { cx: number; cy: number; acima: boolean; txt: string; rot: boolean }[], r: number, fs: number, area: Caixa, linhas: [number, number, number, number][], fixos: Caixa[]): (Lugar | null)[] {
  // largura pelo desenho dos algarismos (0,56 em) e da barra (0,28 em), com 8% de folga
  const h = fs * 0.86, halo = h * 0.18, larg = (t: string) => [...t].reduce((a, ch) => a + (ch === "/" ? 0.28 : 0.56), 0) * h * 1.08;
  const bolas: Caixa[] = pts.map((p) => ({ x0: p.cx - r * 1.35, x1: p.cx + r * 1.35, y0: p.cy - r * 1.35, y1: p.cy + r * 1.35 }));
  // lugares possíveis de cada rótulo, já livres do que é fixo (borda, pontos, anotações, diagonal, curva), em ordem de preferência
  const opcoes = pts.map((p) => {
    if (!p.rot) return null;
    const w = larg(p.txt);
    // folgas que deixam a caixa do rótulo (com o halo) fora da caixa do próprio ponto, de raio 1,35 r
    const sobe = p.cy - r * 1.35 - h * 0.5, desce = p.cy + r * 1.35 + h * 1.2, gx = r * 1.35 + h * 0.25;
    const cima: [number, number, Lugar["anc"]][] = [[p.cx, sobe, "middle"], [p.cx + r * 0.5, sobe, "start"], [p.cx - r * 0.5, sobe, "end"], [p.cx, sobe - h * 1.2, "middle"]];
    const baixo: [number, number, Lugar["anc"]][] = [[p.cx, desce, "middle"], [p.cx + r * 0.5, desce, "start"], [p.cx - r * 0.5, desce, "end"], [p.cx, desce + h * 1.2, "middle"]];
    const lados: [number, number, Lugar["anc"]][] = [[p.cx + gx, p.cy + h * 0.35, "start"], [p.cx - gx, p.cy + h * 0.35, "end"], [p.cx + gx, p.cy - h * 0.5, "start"], [p.cx - gx, p.cy - h * 0.5, "end"], [p.cx + gx, p.cy + h * 1.2, "start"], [p.cx - gx, p.cy + h * 1.2, "end"]];
    return [...(p.acima ? cima : baixo), ...lados, ...(p.acima ? baixo : cima)].map(([x, y, anc]) => {
      const x0 = anc === "start" ? x : anc === "end" ? x - w : x - w / 2;
      return { l: { x, y, anc } as Lugar, c: { x0: x0 - halo, x1: x0 + w + halo, y0: y - h * 0.95 - halo, y1: y + h * 0.25 + halo } as Caixa };
    }).filter(({ c }) => !(c.x0 < area.x0 || c.x1 > area.x1 || c.y0 < area.y0 || c.y1 > area.y1)
      && ![...bolas, ...fixos].some((b) => cruza(c, b)) && !linhas.some(([a1, b1, a2, b2]) => segCruza(c, a1, b1, a2, b2)));
  });
  // busca com retrocesso: cada rótulo no primeiro lugar que não toca os já postos; se travar, volta e tenta o seguinte
  const escolha: (Lugar | null)[] = pts.map(() => null); const postos: Caixa[] = []; let passos = 0;
  const busca = (i: number): boolean => {
    if (i === pts.length) return true;
    const ops = opcoes[i]; if (!ops) return busca(i + 1);
    for (const o of ops) {
      if (++passos > 50000) return false;
      if (postos.some((b) => cruza(o.c, b))) continue;
      postos.push(o.c); escolha[i] = o.l;
      if (busca(i + 1)) return true;
      postos.pop(); escolha[i] = null;
    }
    return false;
  };
  return busca(0) ? escolha : pts.map(() => null);
}
/**
 * A curva, com defaults/n em cada ponto, em lugar livre. Com os intervalos ligados, os rótulos saem do desenho (ficam no
 * título de cada ponto e na tabela), para nenhum cruzar um traço de intervalo ou a diagonal.
 */
function Curva({ k, ic, completa }: { k: number; ic: boolean; completa: boolean }) {
  const ymax = ic ? 0.45 : 0.3;
  const vis = F.slice(0, k);
  const tab = <table><caption>Curva de confiabilidade da logística</caption><thead><tr><th>Faixa</th><th>Defaults</th><th>n</th><th>PD média</th><th>Observado</th><th>Intervalo de 95%</th></tr></thead>
    <tbody>{vis.map((f) => <tr key={f.j}><td>F{f.j}</td><td>{f.d}</td><td>{f.n}</td><td>{pct(f.pdMedia!, 1)}</td><td>{pct(f.obs!, 1)}</td><td>{pct(f.ic!.lo, 1)} a {pct(f.ic!.hi, 1)}</td></tr>)}</tbody></table>;
  return (
    <Grafico rotulo={`Curva de confiabilidade da logística: ${vis.length} de 10 faixas${ic ? ", com intervalo de 95%" : ""}`} tabela={tab} arCelular="4 / 3">
      {(d) => {
        const m = margens(d.fs, { l: 3.1, b: 2.9, t: 1.3, r: 1 });
        const x = escala([0, XMAX], [m.l, d.w - m.r]), y = escala([0, ymax], [d.h - m.b, m.t]);
        const r = d.fs * 0.42;
        const yt = ic ? [0, 0.1, 0.2, 0.3, 0.4] : [0, 0.1, 0.2, 0.3];
        const traco = Math.max(2, d.fs * 0.14);
        // anotações fixas dos cantos (caixas pela largura estimada do texto), a diagonal e a curva: o que um rótulo não pode tocar
        const hp = d.fs * 0.86, lw = (t: string) => t.length * hp * 0.6;
        const yl = y(ymax * 0.03) - d.fs * 1.35;
        const fixos: Caixa[] = [
          { x0: x(0.006), x1: x(0.006) + lw("▲ acima: risco subestimado"), y0: y(ymax * 0.93) - hp, y1: y(ymax * 0.93) + hp * 0.3 },
          { x0: x(XMAX) - d.fs * 2.3 - lw("diagonal: previsto = observado"), x1: x(XMAX), y0: yl - hp, y1: yl + hp * 0.3 },
          { x0: x(XMAX) - lw("▼ abaixo: superestimado"), x1: x(XMAX), y0: y(ymax * 0.03) - hp, y1: y(ymax * 0.03) + hp * 0.3 },
        ];
        const linhas: [number, number, number, number][] = [[x(0), y(0), x(XMAX), y(XMAX)]];
        vis.forEach((f, i) => { if (i) linhas.push([x(vis[i - 1].pdMedia!), y(vis[i - 1].obs!), x(f.pdMedia!), y(f.obs!)]); });
        // com os intervalos, os rótulos saem: nas faixas de PD baixa os traços ficam a cerca de 25 px um do outro, menos
        // que a largura de um rótulo, e a busca (com os traços como obstáculo) não acha lugar livre para todos
        const lug = ic ? null : lugares(vis.map((f) => ({ cx: x(f.pdMedia!), cy: y(f.obs!), acima: f.obs! > f.pdMedia!, txt: `${f.d}/${f.n}`, rot: completa || f.j === k })), r, d.fs, { x0: x(0), x1: d.w, y0: 0, y1: y(0) }, linhas, fixos);
        return (
          <g>
            <Eixos x={x} y={y} xt={[0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]} yt={yt} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="PD média prevista na faixa" yTit="Default observado na faixa" />
            <line className="q7-diag q7-s19-diag" x1={x(0)} y1={y(0)} x2={x(XMAX)} y2={y(XMAX)} />
            <text className="q7-rot--peq" x={x(0.006)} y={y(ymax * 0.93)} style={{ fill: "#5B6475" }}>▲ acima: risco subestimado</text>
            {/* a diagonal se identifica no canto vazio de baixo, à direita (PD de 20% a 30%, longe dos pontos e dos intervalos) */}
            {(() => { const xf = x(XMAX); return <g>
              <text className="q7-rot--peq" x={xf - d.fs * 2.3} y={yl} textAnchor="end" style={{ fill: "#5B6475" }}>diagonal: previsto = observado</text>
              <line className="q7-diag" x1={xf - d.fs * 1.9} x2={xf} y1={yl - d.fs * 0.28} y2={yl - d.fs * 0.28} />
            </g>; })()}
            <text className="q7-rot--peq" x={x(XMAX)} y={y(ymax * 0.03)} textAnchor="end" style={{ fill: "#5B6475" }}>▼ abaixo: superestimado</text>
            {vis.length > 1 && <path className="q7-linha q7-linha--fina q7-linha--prob" d={caminho(vis.map((f) => ({ x: x(f.pdMedia!), y: y(f.obs!) })))} />}
            {vis.map((f) => {
              const cx = x(f.pdMedia!), cy = y(f.obs!); const on = !completa && f.j === k;
              return (
                <g key={f.j} opacity={!completa && !on ? 0.6 : 1}>
                  <title>{`F${f.j}: ${f.d} defaults em ${f.n}, observado ${pct(f.obs!, 1)} contra PD média de ${pct(f.pdMedia!, 1)}${ic ? `; intervalo de 95% de ${pct(f.ic!.lo, 1)} a ${pct(f.ic!.hi, 1)}` : ""}`}</title>
                  {ic && <line className="q7-s19-ic q7-linha q7-linha--fina q7-linha--prob" x1={cx} x2={cx} y1={y(f.ic!.lo)} y2={y(f.ic!.hi)} strokeOpacity={0.55} strokeWidth={traco} />}
                  <circle cx={cx} cy={cy} r={on ? r * 1.35 : r} className="q7-ptc q7-ptc--prob" />
                  {/* sem lugar livre (e sempre com os intervalos), o valor fica no título do ponto e na tabela acessível */}
                  {lug && (() => { const L = lug[f.j - 1]; return L && <text className="q7-rot--peq q7-s19-rot" x={L.x} y={L.y} textAnchor={L.anc} style={{ fill: "#2A3342", fontWeight: on ? 700 : 500, paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{f.d}/{f.n}</text>; })()}
                </g>
              );
            })}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S19Confiabilidade({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(0);
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [esc, setEsc] = useState<number | null>(null);
  const ic = esc !== null && OPS[esc].certa;
  const f = k ? F[k - 1] : null;
  const avancar = (p: Palpite) => { if (k >= 10) return; setPalpites([...palpites.slice(0, k), p]); setK(k + 1); };
  const feitos = palpites.filter((p, i) => p !== null && i < k);
  const acertos = palpites.filter((p, i) => p !== null && i < k && (F[i].obs! > F[i].pdMedia! ? "acima" : "abaixo") === p).length;
  const ultimo = k ? palpites[k - 1] : null;
  const lado = f ? (f.obs! > f.pdMedia! ? "acima" : "abaixo") : null;
  const dp = f ? Math.sqrt((f.pdMedia! * (1 - f.pdMedia!)) / f.n) : 0;
  const ruido = f !== null && Math.abs(f.obs! - f.pdMedia!) < dp;
  const completa = k >= 10;
  const restaurar = () => { setK(0); setPalpites([]); setEsc(null); };
  const wilsonFrase = <>O intervalo de 95% (Wilson) é a faixa de taxas compatíveis com o que se observou em cada faixa; <LinkSlide slug="c7p31" className="q7-s10-lk">slide 21</LinkSlide>.</>;
  return (
    <Quadro slug="c7p10" pagina={pagina} layout="um"
      conclusao={!f ? "Antes de cada faixa, preveja: o ponto fica acima ou abaixo da diagonal? Cada faixa vira um ponto."
        : !completa ? <>Faixa {f.j}: {f.n} propostas com PD média de {pct(f.pdMedia!, 1)}; {f.d} {f.d === 1 ? "deu" : "deram"} default, <b>{pct(f.obs!, 1)}</b>. O ponto fica {lado} da diagonal: neste grupo a PD ficou {lado === "acima" ? "abaixo" : "acima"} da frequência observada{ruido ? ", por uma distância menor que o ruído da amostra" : ""}.</>
        : ic ? <>A PD média cai dentro do intervalo de 95% em <b>{COMPATIVEIS} das 10 faixas</b>: nenhuma distância isolada prova descalibração. E {ACIMA} de 10 acima cabe no acaso (com faixas independentes e chance de ½ para cada lado, {ACIMA} ou mais acima teria probabilidade de cerca de {num(P_ACASO, 2)}); o que pesa é o total, que o slide 21 testa.</>
        : <>Dez pontos: a curva acompanha a diagonal e fica acima dela em {ACIMA} das 10 faixas, na direção do O/E de {num(OE, 2)}. Cada distância é padrão ou ruído? Preveja ao lado antes de ver o intervalo.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults; PD da logística. Faixas de mesmo tamanho pela posição na fila crescente de PD (73 ou 74 propostas). Intervalo: Wilson de 95% com o n de cada faixa.`}>
      <div className="q7-g2-s19 q7-s19v3">
        <Painel className="q7-s19v3-g"><Curva k={k} ic={ic} completa={completa} /></Painel>
        <div className="q7-g2-s19-dir">
          {completa ? <Painel className="q7-g2-s19-r">
            <div className="q7-s21-l"><p className="q7-k">Padrão ou ruído?</p><Botao sec onClick={restaurar}>Restaurar</Botao></div>
            <p className="q7-nota">{wilsonFrase}</p>
            {!ic && <Previsao pergunta="Com o intervalo de 95% de cada faixa, em quantas das 10 a PD média cabe nele?" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />}
            {ic && <p className="q7-g2-s19-fb" data-ok="1" aria-live="polite">Acertou: a PD cabe no intervalo em {COMPATIVEIS} das 10 faixas; cada intervalo tem de {pp(LMIN, 0).replace("+", "")} a {pp(LMAX, 0).replace("+", "")} de largura.</p>}
            <Lista itens={[["Faixas acima da diagonal", `${ACIMA} de 10`], ["Observados ÷ esperados (O/E)", num(OE, 2)], ["PD dentro do intervalo", ic ? `${COMPATIVEIS} de 10` : "?"]]} />
          </Painel> : <>
            <Painel titulo={`As ${int(N)} PDs em ordem, em dez faixas`} className="q7-g2-s19-r">
              <Grafico rotulo="Faixa destacada na régua de PDs ordenadas" arCelular="5 / 1">
                {(d) => {
                  const x = escala([0, N], [0, d.w]); const h = d.h * 0.66;
                  return (
                    <g>
                      {ASC.map((a, i) => <line key={i} x1={x(i + 0.5)} x2={x(i + 0.5)} y1={h} y2={h - Math.max(2, (a.p / PMAX) * (h - 2))} stroke={a.y ? "#8C2332" : "#B5BAC4"} strokeWidth={a.y ? 2 : 1.2} />)}
                      {F.map((ff, j) => { const i0 = F.slice(0, j).reduce((s, z) => s + z.n, 0); return <g key={ff.j}><rect x={x(i0) + 1} y={h + 3} width={x(ff.n) - 2} height={d.h * 0.3} fill={k === ff.j ? "#176C73" : j < k ? "#9FC7C9" : "#E7E4DC"} rx={3} /><text className="q7-rot--peq" x={x(i0 + ff.n / 2)} y={h + 3 + d.h * 0.21} textAnchor="middle" style={{ fill: k === ff.j ? "#fff" : "#2A3342" }}>F{ff.j}</text></g>; })}
                    </g>
                  );
                }}
              </Grafico>
              <p className="q7-nota">Traço: uma proposta, altura pela PD; vinho: default.</p>
              <div className="q7-g2-s19-ctl">
                <span className="q7-k q7-s19v3-pq">Faixa {k + 1}: o ponto fica</span>
                <Botao prim onClick={() => avancar("acima")} rotulo={`Prever acima da diagonal e calcular a faixa ${k + 1}`}>▲ acima</Botao>
                <Botao prim onClick={() => avancar("abaixo")} rotulo={`Prever abaixo da diagonal e calcular a faixa ${k + 1}`}>▼ abaixo</Botao>
                <Botao onClick={() => { setPalpites([...palpites.slice(0, k), ...Array(10 - k).fill(null)]); setK(10); }}>Todas</Botao>
                <Botao sec onClick={restaurar}>Restaurar</Botao>
              </div>
            </Painel>
            <Painel titulo={f ? `A conta da faixa ${f.j}` : "A conta de cada ponto"} className="q7-g2-s19-t">
              {ultimo && f && <p className="q7-g2-s19-fb" data-ok={ultimo === lado ? "1" : "0"} aria-live="polite">{ultimo === lado ? "Acertou" : "Errou"}: ficou {lado}.{ruido ? ` Desvio de ${num(100 * Math.abs(f.obs! - f.pdMedia!), 1)} ponto, menor que o desvio padrão da frequência com ${f.n} casos (${num(100 * dp, 1)}): ruído.` : ""} Acertos: {acertos} de {feitos.length}.</p>}
              {f ? <Lista itens={[["PD média prevista (x)", pct(f.pdMedia!, 1)], [`Observado (y): ${f.d} ÷ ${f.n}`, <>{lado === "acima" ? "▲" : "▼"} {pct(f.obs!, 1)}</>, "prob"]]} />
                : <p className="q7-p">A faixa 1 reúne as {F[0].n} propostas de menor PD. Preveja onde o ponto dela vai cair.</p>}
            </Painel>
          </>}
        </div>
      </div>
    </Quadro>
  );
}
