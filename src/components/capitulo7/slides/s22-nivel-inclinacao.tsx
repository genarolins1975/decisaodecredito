"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, margens, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PT, Y } from "@/lib/capitulo7/dados";
import { faixasQuantis, interceptoComSlope1, interceptoESlope, logit, media, slopeComIntervalo, transformar, type Faixa } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";
import { SLIDE } from "@/lib/capitulo7/roteiro";

/**
 * 22 · c7p32 · Assinaturas de erro. Ponto de partida: a PD verdadeira do gerador (só existe porque a base é sintética),
 * distorcida de quatro jeitos com p' = σ(a + b · logit p). Cada caso pronto é o que o nome diz: os de nível só deslocam
 * (b = 1, a = ±0,7); os de inclinação giram em torno do ponto que mantém a PD média igual à da verdadeira (a resolvido
 * por bisseção para cada b em aNeutro), e por isso têm intercepto com slope 1 igual a 0. Duas frequências por faixa: a
 * esperada, que troca o desfecho pela PD verdadeira (sem ruído de amostra: erro de nível dá slope 1 e intercepto −a;
 * erro de inclinação dá slope 1/b), e a observada nos 81 defaults da janela, com o ruído da amostra (nela a própria PD
 * verdadeira tem slope 1,14). Intercepto com slope fixado em 1 e o par (intercepto, slope) da regressão de y em
 * logit(PD), por máxima verossimilhança; na observada, o intervalo de Wald de 95% do slope. A leitura de qualquer
 * distorção, pronta ou criada pelo aluno no quadro ampliado, é a mesma regra (leituraComposta): nível pela PD média
 * contra a frequência esperada, com o intercepto com slope 1, e inclinação pelo slope; classificar devolve as duas
 * partes e NOME_DA_LEITURA diz que nome a regra dá (conferido por script: cada caso pronto recebe o próprio nome). As
 * miniaturas são largas (mesma escala de 0% a 55% nas quatro), com slope e intercepto numa linha abaixo. No quadro
 * ampliado, os rótulos de acima e abaixo da diagonal ficam numa linha sob o gráfico, fora da área dos dados; "Ver os
 * quatro" fica junto dos controles e "Restaurar" no alto do painel lateral. A fonte liga a frequência esperada às
 * réplicas sintéticas da janela (slides 10 e 27): é a frequência que elas dão em média. Quando a distorção passa de
 * 55%, o eixo do quadro ampliado se estende até o maior valor desenhado, com margem, e a última marca do eixo é o
 * próprio teto (60%, 80%, 90% ou 100%). Estimativa que não existe aparece como "—".
 */
type Freq = "esperada" | "observada";
export const PD_VERD = media(PT)!;
/**
 * O a que mantém a PD média da distorção igual à da verdadeira para uma inclinação b: a média de σ(a + b · logit p)
 * cresce com a, e a bisseção acha a raiz. É o ponto em torno do qual a inclinação gira sem mexer no nível.
 */
export const aNeutro = (b: number) => {
  let lo = -10, hi = 10;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (media(transformar(PT, m, b))! < PD_VERD) lo = m; else hi = m; }
  return (lo + hi) / 2;
};
/** Faixas com a frequência esperada: o "desfecho" de cada proposta é a PD verdadeira; defaults esperados arredondados para a tabela acessível. */
const arred = (fs: Faixa[]) => fs.map((f) => ({ ...f, d: Math.round(f.d) }));
/** As duas leituras de uma distorção (a, b): a esperada, sem ruído, e a observada na janela, com o intervalo do slope. */
export const medir = (a: number, b: number) => {
  const p = transformar(PT, a, b);
  const calc = (y: readonly number[]) => { const s = interceptoESlope(y, p); const fx = faixasQuantis(y, p, 10); return { faixas: fx, i1: interceptoComSlope1(y, p), ...s, acima: fx.filter((f) => f.obs! > f.pdMedia!).length, ic: null as [number, number] | null }; };
  const e = calc(PT);
  return { esperada: { ...e, faixas: arred(e.faixas) }, observada: { ...calc(Y), ic: slopeComIntervalo(Y, p).ic } };
};
/** Número da regressão na tela: "—" quando a estimativa não existe (nunca NaN); zero arredondado sem sinal (nunca "−0,00"). */
const nr = (v: number, casas = 2) => (Number.isFinite(v) ? num(Math.abs(v) < 0.5 * 10 ** -casas ? 0 : v, casas) : "—");
/**
 * Lado do nível de uma distorção (a, b), medido contra a frequência esperada (a média da PD verdadeira): a PD média
 * prevista abaixo dela é risco subestimado (pontos acima da diagonal no agregado), acima dela é superestimado. O
 * intercepto com slope 1 resolve Σ σ(logit pᵢ + α) = Σ yᵢ, que só tem raiz positiva quando a frequência passa da PD
 * média: os dois critérios dão o mesmo lado. Sem intercepto finito, o tamanho do erro vem da diferença de logits das
 * médias. Devolve null quando o nível está perto do ideal (|α| abaixo de 0,1).
 */
export const ladoDoNivel = (pdMedia: number, freq: number, i1: number): "subestimado" | "superestimado" | null => {
  const tamanho = Number.isFinite(i1) ? Math.abs(i1) : Math.abs(logit(freq) - logit(pdMedia));
  if (!(tamanho >= 0.1) || freq === pdMedia) return null;
  return freq > pdMedia ? "subestimado" : "superestimado";
};
/**
 * Regra de leitura de uma distorção qualquer (os quatro casos prontos e a do aluno): nível e inclinação a partir da
 * frequência esperada, sem ruído.
 * Nível pela PD média contra a frequência esperada, com o intercepto com slope 1 (ladoDoNivel); inclinação pelo slope
 * (abaixo de 1: PDs extremas demais; acima: comprimidas). "Deitada" e "em pé" valem na escala de log odds.
 */
export const classificar = (a: number, b: number, e: { i1: number; slope: number }) => {
  const pm = media(transformar(PT, a, b))!;
  const lado = ladoDoNivel(pm, PD_VERD, e.i1);
  const incl: "extremas" | "comprimidas" | null = !Number.isFinite(e.slope) || Math.abs(e.slope - 1) < 0.05 ? null : e.slope < 1 ? "extremas" : "comprimidas";
  return { pm, lado, incl };
};
/** O nome que a regra dá a uma distorção de um erro só (null quando há dois erros ou nenhum). */
export const NOME_DA_LEITURA = (c: ReturnType<typeof classificar>) =>
  c.lado && !c.incl ? (c.lado === "subestimado" ? "Subestimação global" : "Superestimação global")
    : !c.lado && c.incl ? (c.incl === "extremas" ? "Probabilidades extremas" : "Probabilidades comprimidas") : null;
/** A leitura que a tela mostra, montada pela regra: os dois erros, um só (com o outro no lugar) ou nenhum. */
export const leituraComposta = (a: number, b: number, e: { i1: number; slope: number }) => {
  const { pm, lado, incl: tipo } = classificar(a, b, e);
  const medias = `PD média ${pct(pm, 1)} contra ${pct(PD_VERD, 1)} da verdadeira`;
  const nivel = lado && `de nível (${medias}: risco ${lado})`;
  const incl = tipo && (tipo === "extremas" ? "de inclinação (PDs extremas demais, excesso de confiança)" : "de inclinação (PDs comprimidas, falta de confiança)");
  if (!nivel && !incl) return `nível e inclinação perto do ideal (${medias})`;
  if (!nivel) return `erro ${incl}, com o nível no lugar (${medias}); corrige-se b`;
  return `erro ${[nivel, incl].filter(Boolean).join(" e ")}; corrige-se ${incl ? "o intercepto e b" : "o intercepto"}`;
};
/**
 * Teto do eixo ampliado: 55% ou, se o maior valor desenhado mais 2 pontos de margem passar disso, o primeiro de 60%, 80%,
 * 90% e 100% que o cobre. Cada teto tem marcas que terminam nele, para o próprio eixo mostrar até onde vai.
 */
const TETOS: [number, number[]][] = [[0.55, [0, 0.1, 0.2, 0.3, 0.4, 0.5]], [0.6, [0, 0.2, 0.4, 0.6]], [0.8, [0, 0.2, 0.4, 0.6, 0.8]], [0.9, [0, 0.3, 0.6, 0.9]], [1, [0, 0.2, 0.4, 0.6, 0.8, 1]]];
const tetoDe = (v: number) => (TETOS.find(([t]) => v + 0.02 <= t + 1e-9) ?? TETOS[TETOS.length - 1]);
/** Miniatura larga: a curva ocupa o cartão; mesma escala (0% a 55%) nos quatro. */
function Mini({ faixas, nome }: { faixas: Faixa[]; nome: string }) {
  return (
    <Grafico rotulo={`Curva de confiabilidade: ${nome}`} arCelular="16 / 9">
      {(d) => {
        const m = margens(d.fs, { l: 2.6, b: 1.5, t: 0.5, r: 0.6 });
        const x = escala([0, 0.55], [m.l, d.w - m.r]), y = escala([0, 0.55], [d.h - m.b, m.t]);
        const pts = faixas.filter((f) => f.obs !== null).map((f) => ({ x: x(Math.min(0.55, f.pdMedia!)), y: y(Math.min(0.55, f.obs!)) }));
        return (
          <g>
            <Eixos x={x} y={y} xt={[0, 0.25, 0.5]} yt={[0, 0.25, 0.5]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} />
            <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(0.55)} y2={y(0.55)} />
            <path className="q7-linha q7-linha--fina q7-linha--prob" d={caminho(pts)} />
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={d.fs * 0.32} className="q7-ptc q7-ptc--prob" />)}
          </g>
        );
      }}
    </Grafico>
  );
}
/** Os quatro casos prontos: nível puro (b = 1) e inclinação pura (a = aNeutro(b)); a leitura é a mesma regra das distorções do aluno. */
const BASE = [
  { id: "sub", nome: "Subestimação global", a: -0.7, b: 1 },
  { id: "super", nome: "Superestimação global", a: 0.7, b: 1 },
  { id: "extremas", nome: "Probabilidades extremas", a: aNeutro(1.8), b: 1.8 },
  { id: "comprimidas", nome: "Probabilidades comprimidas", a: aNeutro(0.45), b: 0.45 },
];
export const CASOS = BASE.map((c) => { const r = medir(c.a, c.b); return { ...c, leitura: leituraComposta(c.a, c.b, r.esperada), ...r }; });
const REF = interceptoESlope(Y, PT);
const IDX = { sub: 0, extremas: 2, comprimidas: 3 };
const OPS = [
  { texto: "Subestimação global", certa: false, retorno: <>Erro de nível desloca a curva sem mudar a inclinação: slope {num(CASOS[IDX.sub].esperada.slope, 2)}. Confunde nível com inclinação.</> },
  { texto: "Probabilidades extremas", certa: true, retorno: <>Isso: as PDs se espalham mais que o risco (b = {num(CASOS[IDX.extremas].b, 1)}) e a curva deita: slope {num(CASOS[IDX.extremas].esperada.slope, 2)}, igual a 1 ÷ b.</> },
  { texto: "Probabilidades comprimidas", certa: false, retorno: <>Comprimidas é o contrário: tudo perto da média, curva em pé, slope {num(CASOS[IDX.comprimidas].esperada.slope, 2)}, acima de 1.</> },
];

export function S22NivelInclinacao({ pagina }: { pagina?: Pagina }) {
  const [foco, setFoco] = useState<string | null>(null);
  const [sel, setSel] = useState(CASOS[0].id);
  const [esc, setEsc] = useState<number | null>(null);
  const [freq, setFreq] = useState<Freq>("esperada");
  const [aj, setAj] = useState<{ a: number; b: number } | null>(null);
  const revelado = esc !== null && OPS[esc].certa;
  const base = CASOS.find((x) => x.id === (foco ?? sel))!;
  const proprio = useMemo(() => { if (!aj) return null; const r = medir(aj.a, aj.b); return { id: "sua", nome: "Sua distorção", a: aj.a, b: aj.b, leitura: leituraComposta(aj.a, aj.b, r.esperada), ...r }; }, [aj]);
  const c = foco && proprio ? proprio : base; const m = c[freq];
  // eixo do quadro ampliado: 55% ou, se a distorção passar disso, até o maior valor desenhado (PD, frequência ou
  // limite do intervalo), com margem; nenhum ponto fica preso na borda
  const [tetoF, ticksF] = tetoDe(Math.max(...m.faixas.flatMap((f) => [f.pdMedia ?? 0, f.obs ?? 0, freq === "observada" ? f.ic?.hi ?? 0 : 0])));
  // na distorção do aluno, a leitura composta (nível e inclinação) já descreve a forma
  const assinatura = c.id === "sua" ? null : Math.abs(c.b - 1) < 0.025 ? `pontos ${m.acima >= 5 ? "acima" : "abaixo"} da diagonal em ${Math.max(m.acima, 10 - m.acima)} das 10 faixas` : c.b > 1 ? "em log odds, curva mais deitada que a diagonal" : "em log odds, curva mais em pé que a diagonal";
  const abrir = (id: string) => { setSel(id); setFoco(id); setAj(null); };
  const verQuatro = <Botao onClick={() => { setFoco(null); setAj(null); }}>Ver os quatro</Botao>;
  return (
    <Quadro slug="c7p32" pagina={pagina} layout="gl"
      conclusao={!revelado ? <>Quatro distorções da mesma PD verdadeira, cada uma com a sua forma. Qual delas tem slope abaixo de 1?</>
        : <><b>{c.nome}</b> (a = {num(c.a, 2)}, b = {num(c.b, 2)}): {assinatura ? <>{assinatura}. Slope</> : "slope"} {nr(m.slope)}{m.ic ? ` (intervalo de 95%: ${nr(m.ic[0])} a ${nr(m.ic[1])})` : ""}, intercepto com slope 1 de {nr(m.i1)}{freq === "observada" ? "; pela frequência esperada, sem ruído" : ""}: {c.leitura}.{freq === "observada" ? ` Com o ruído da janela, a referência já tem slope ${num(REF.slope, 2)}.` : ""}</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Base: PD verdadeira do gerador (só existe em base sintética). Esperada: média da PD verdadeira na faixa, a frequência esperada nas réplicas sintéticas da janela (slides ${SLIDE.c7p24.n} e ${SLIDE.c7p16.n}: desfecho sorteado de novo pela PD verdadeira), sem ruído de amostra. Observada: defaults da janela; nela a PD verdadeira tem intercepto ${num(REF.intercepto, 2)} e slope ${num(REF.slope, 2)}. Faixas: decis de PD prevista.`}>
      <Painel titulo={foco ? `Em foco: ${c.nome}` : "Quatro jeitos de errar a probabilidade · clique num quadro para ampliar"}>
        {foco ? (
          <div className="q7-g2-s22-foco"><div className="q7-g2-quad"><Confiabilidade titulo={`y: frequência ${freq}`} sub="x: PD média prevista" semTitulos anotar={false} rotulo={`Curva de confiabilidade: ${c.nome}, frequência ${freq}, eixos de 0% a ${pct(tetoF, 0)}`} max={tetoF} ticks={ticksF} series={[{ faixas: m.faixas, classe: "prob", linha: true, ic: freq === "observada" }]}
            /><p className="q7-nota q7-s22-cantos"><span>▲ acima: subestima</span><span>▼ abaixo: superestima</span></p></div>
            <div className="q7-g2-s22-lado"><dl className="q7-lista">
              <div><dt>Slope</dt><dd>{revelado ? nr(m.slope) : "?"}</dd></div>
              {revelado && m.ic && <div data-tom="mudo"><dt>Intervalo de 95% do slope</dt><dd>{nr(m.ic[0])} a {nr(m.ic[1])}</dd></div>}
              <div><dt>Intercepto com slope 1</dt><dd>{nr(m.i1)}</dd></div>
              <div><dt>Intercepto da regressão livre</dt><dd>{nr(m.intercepto)}</dd></div>
            </dl>
            {revelado && <div className="q7-g2-s22-ctl">
              <div className="q7-s21-l"><p className="q7-k">Sua assinatura</p>{verQuatro}</div>
              <Controle rotulo="a: nível" valor={c.a} min={-2} max={2} passo={0.05} onChange={(v) => setAj({ a: v, b: c.b })} mostrar={num(c.a, 2)} />
              <Controle rotulo="b: inclinação" valor={c.b} min={0.3} max={2.5} passo={0.05} onChange={(v) => setAj({ a: c.a, b: v })} mostrar={num(c.b, 2)} />
            </div>}
            {!revelado && <div className="q7-botoes">{verQuatro}</div>}</div></div>
        ) : (
          <div className="q7-s22-g q7-g2-s22 q7-s22v3">
            {CASOS.map((x) => (
              <div key={x.id} role="button" tabIndex={0} className="q7-s22-m q7-g2-s22-m" data-on={sel === x.id ? "1" : "0"} onClick={() => abrir(x.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); abrir(x.id); } }} aria-label={`Ampliar: ${x.nome}`}>
                <span className="q7-s22-t">{x.nome}</span>
                <Mini faixas={x[freq].faixas} nome={x.nome} />
                <span className="q7-s22v3-v"><b>slope {revelado ? nr(x[freq].slope) : "?"}</b><span>intercepto (slope 1): {nr(x[freq].i1)}</span></span>
              </div>
            ))}
          </div>
        )}
      </Painel>
      <Painel>
        <Previsao pergunta="Qual quadro tem slope de calibração abaixo de 1?" opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && OPS[i].certa) setSel("extremas"); }} recolher />
        <div className="q7-s21-l"><p className="q7-k">Frequência de cada faixa</p><Botao sec onClick={() => { setFoco(null); setSel(CASOS[0].id); setEsc(null); setFreq("esperada"); setAj(null); }}>Restaurar</Botao></div>
        <Seg rotulo="Frequência" opcoes={[{ v: "esperada" as Freq, r: "Esperada, sem ruído" }, { v: "observada" as Freq, r: "Observada na janela" }]} valor={freq} onChange={setFreq} />
        <p className="q7-nota">Ideal: intercepto 0 e slope 1. Ampliada, a observada mostra intervalos (slide {SLIDE.c7p31.n}); o slide {SLIDE.c7p33.n} resume o erro num número.</p>
        <Expandir resumo="Como se estimam">
          <Formula f={String.raw`\operatorname{logit} P(Y=1)=\alpha+\beta\,\operatorname{logit}(\mathrm{PD})`} simbolos={[[String.raw`\beta`, "slope de calibração (ideal 1)"], [String.raw`\alpha`, "intercepto da regressão livre"]]} />
          <p className="q7-nota">O intercepto com slope fixado em 1 é outra regressão: só α, com logit(PD) como deslocamento fixo. Ele mede o erro de nível no agregado; o α da regressão livre não tem essa leitura sozinho. Os dois foram conferidos contra o statsmodels.</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}
