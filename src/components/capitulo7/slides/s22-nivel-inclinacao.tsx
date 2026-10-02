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
 * distorcida de quatro jeitos com p' = σ(a + b · logit p). As duas distorções de inclinação giram em torno de 11%
 * (a = c(1 − b), c = logit 11%). Duas frequências por faixa: a esperada, que troca o desfecho pela PD verdadeira (sem
 * ruído de amostra: erro de nível dá slope 1 e intercepto −a; erro de inclinação dá slope 1/b), e a observada nos 81
 * defaults da janela, com o ruído da amostra (nela a própria PD verdadeira tem slope 1,14). Intercepto com slope fixado em
 * 1 e o par (intercepto, slope) da regressão de y em logit(PD), por máxima verossimilhança; na observada, o intervalo
 * de Wald de 95% do slope. No quadro ampliado, a e b viram controles: o aluno cria a própria assinatura, e a leitura
 * dela compõe nível (intercepto com slope 1 e PD média) e inclinação (slope), não olha só b. As miniaturas são largas
 * (mesma escala de 0% a 55% nas quatro), com slope e intercepto numa linha abaixo. No quadro ampliado, os rótulos de
 * acima e abaixo da diagonal ficam numa linha sob o gráfico, fora da área dos dados; "Ver os quatro" fica junto dos
 * controles e "Restaurar" no alto do painel lateral, para que nenhum botão dependa da altura que sobra. A fonte
 * liga a frequência esperada às réplicas sintéticas da janela (slides 10 e 27): é a frequência que elas dão em média.
 * Quando a distorção do aluno passa de 55%, o eixo do quadro ampliado se estende até o maior valor desenhado, com
 * margem, e o subtítulo avisa; nenhum ponto fica preso na borda.
 */
type Freq = "esperada" | "observada";
const C = logit(0.11);
const BASE = [
  { id: "sub", nome: "Subestimação global", a: -0.7, b: 1, leitura: "o modelo prevê menos risco do que acontece; corrige-se com o nível (intercepto)" },
  { id: "super", nome: "Superestimação global", a: 0.7, b: 1, leitura: "o modelo prevê mais risco do que acontece; corrige-se com o nível" },
  { id: "extremas", nome: "Probabilidades extremas", a: C * (1 - 1.8), b: 1.8, leitura: "excesso de confiança: slope abaixo de 1" },
  { id: "comprimidas", nome: "Probabilidades comprimidas", a: C * (1 - 0.45), b: 0.45, leitura: "falta de confiança: slope acima de 1" },
];
/** Faixas com a frequência esperada: o "desfecho" de cada proposta é a PD verdadeira; defaults esperados arredondados para a tabela acessível. */
const arred = (fs: Faixa[]) => fs.map((f) => ({ ...f, d: Math.round(f.d) }));
/** As duas leituras de uma distorção (a, b): a esperada, sem ruído, e a observada na janela, com o intervalo do slope. */
const medir = (a: number, b: number) => {
  const p = transformar(PT, a, b);
  const calc = (y: readonly number[]) => { const s = interceptoESlope(y, p); const fx = faixasQuantis(y, p, 10); return { faixas: fx, i1: interceptoComSlope1(y, p), ...s, acima: fx.filter((f) => f.obs! > f.pdMedia!).length, ic: null as [number, number] | null }; };
  const e = calc(PT);
  return { esperada: { ...e, faixas: arred(e.faixas) }, observada: { ...calc(Y), ic: slopeComIntervalo(Y, p).ic } };
};
const PD_VERD = media(PT)!;
type Medida = ReturnType<typeof medir>["esperada"];
/**
 * Leitura de uma distorção qualquer (a do aluno): compõe nível e inclinação a partir da frequência esperada, sem ruído.
 * Nível pelo intercepto com slope 1 (positivo: o modelo prevê menos risco que o verdadeiro) e pela PD média; inclinação
 * pelo slope (abaixo de 1: PDs extremas demais; acima: comprimidas). "Deitada" e "em pé" valem na escala de log odds.
 */
const leituraComposta = (a: number, b: number, e: Medida) => {
  const pm = media(transformar(PT, a, b))!;
  const nivel = Math.abs(e.i1) < 0.1 ? null : `de nível (PD média ${pct(pm, 1)} contra ${pct(PD_VERD, 1)} da verdadeira: risco ${e.i1 > 0 ? "subestimado" : "superestimado"})`;
  const incl = Math.abs(e.slope - 1) < 0.05 ? null : e.slope < 1 ? "de inclinação (PDs extremas demais, excesso de confiança)" : "de inclinação (PDs comprimidas, falta de confiança)";
  if (!nivel && !incl) return `nível e inclinação perto do ideal (PD média ${pct(pm, 1)} contra ${pct(PD_VERD, 1)})`;
  return `erro ${[nivel, incl].filter(Boolean).join(" e ")}; corrige-se ${nivel && incl ? "o intercepto e b" : nivel ? "o intercepto" : "b"}`;
};
/** Teto do eixo ampliado: 55% ou o próximo múltiplo de 10% acima do maior valor desenhado mais 2 pontos de margem. */
const tetoDe = (v: number) => Math.min(1, Math.max(0.55, Math.ceil((v + 0.02) / 0.1 - 1e-9) * 0.1));
const ticksF = (t: number) => { const passo = t > 0.6 ? 0.2 : 0.1; return Array.from({ length: Math.floor(t / passo + 1e-9) + 1 }, (_, i) => Math.round(i * passo * 10) / 10); };
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
const CASOS = BASE.map((c) => ({ ...c, ...medir(c.a, c.b) }));
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
  const tetoF = tetoDe(Math.max(...m.faixas.flatMap((f) => [f.pdMedia ?? 0, f.obs ?? 0, freq === "observada" ? f.ic?.hi ?? 0 : 0])));
  // na distorção do aluno, a leitura composta (nível e inclinação) já descreve a forma
  const assinatura = c.id === "sua" ? null : Math.abs(c.b - 1) < 0.025 ? `pontos ${m.acima >= 5 ? "acima" : "abaixo"} da diagonal em ${Math.max(m.acima, 10 - m.acima)} das 10 faixas` : c.b > 1 ? "em log odds, curva mais deitada que a diagonal" : "em log odds, curva mais em pé que a diagonal";
  const abrir = (id: string) => { setSel(id); setFoco(id); setAj(null); };
  const verQuatro = <Botao onClick={() => { setFoco(null); setAj(null); }}>Ver os quatro</Botao>;
  return (
    <Quadro slug="c7p32" pagina={pagina} layout="gl"
      conclusao={!revelado ? <>Quatro distorções da mesma PD verdadeira, cada uma com a sua forma. Qual delas tem slope abaixo de 1?</>
        : <><b>{c.nome}</b> (a = {num(c.a, 2)}, b = {num(c.b, 2)}): {assinatura ? <>{assinatura}. Slope</> : "slope"} {num(m.slope, 2)}{m.ic ? ` (intervalo de 95%: ${num(m.ic[0], 2)} a ${num(m.ic[1], 2)})` : ""}, intercepto com slope 1 de {num(m.i1, 2)}: {c.leitura}.{freq === "observada" ? ` Com o ruído da janela, a referência já tem slope ${num(REF.slope, 2)}.` : ""}</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Base: PD verdadeira do gerador (só existe em base sintética). Esperada: média da PD verdadeira na faixa, a frequência esperada nas réplicas sintéticas da janela (slides ${SLIDE.c7p24.n} e ${SLIDE.c7p16.n}: desfecho sorteado de novo pela PD verdadeira), sem ruído de amostra. Observada: defaults da janela; nela a PD verdadeira tem intercepto ${num(REF.intercepto, 2)} e slope ${num(REF.slope, 2)}. Faixas: decis de PD prevista.`}>
      <Painel titulo={foco ? `Em foco: ${c.nome}` : "Quatro jeitos de errar a probabilidade · clique num quadro para ampliar"}>
        {foco ? (
          <div className="q7-g2-s22-foco"><div className="q7-g2-quad"><Confiabilidade titulo={`y: frequência ${freq}`} sub={tetoF > 0.55 ? `x: PD média · eixos até ${pct(tetoF, 0)}` : "x: PD média prevista"} semTitulos anotar={false} rotulo={`Curva de confiabilidade: ${c.nome}, frequência ${freq}, eixos de 0% a ${pct(tetoF, 0)}`} max={tetoF} ticks={ticksF(tetoF)} series={[{ faixas: m.faixas, classe: "prob", linha: true, ic: freq === "observada" }]}
            /><p className="q7-nota q7-s22-cantos"><span>▲ acima: subestima</span><span>▼ abaixo: superestima</span></p></div>
            <div className="q7-g2-s22-lado"><dl className="q7-lista">
              <div><dt>Slope</dt><dd>{revelado ? num(m.slope, 2) : "?"}</dd></div>
              {revelado && m.ic && <div data-tom="mudo"><dt>Intervalo de 95% do slope</dt><dd>{num(m.ic[0], 2)} a {num(m.ic[1], 2)}</dd></div>}
              <div><dt>Intercepto com slope 1</dt><dd>{num(m.i1, 2)}</dd></div>
              <div><dt>Intercepto da regressão livre</dt><dd>{num(m.intercepto, 2)}</dd></div>
            </dl>
            {revelado && <div className="q7-g2-s22-ctl">
              <div className="q7-s21-l"><p className="q7-k">Crie a sua assinatura</p>{verQuatro}</div>
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
                <span className="q7-s22v3-v"><b>slope {revelado ? num(x[freq].slope, 2) : "?"}</b><span>intercepto (slope 1): {num(x[freq].i1, 2)}</span></span>
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
