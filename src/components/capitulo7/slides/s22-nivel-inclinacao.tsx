"use client";
import { useState } from "react";
import { Botao, Expandir, Formula, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PT, Y } from "@/lib/capitulo7/dados";
import { faixasQuantis, interceptoComSlope1, interceptoESlope, logit, transformar, type Faixa } from "@/lib/capitulo7/metricas";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 22 · c7p32 · Assinaturas de erro. Ponto de partida: a PD verdadeira do gerador (só existe porque a base é sintética),
 * distorcida de quatro jeitos com p' = σ(a + b · logit p). As duas distorções de inclinação giram em torno de 11%
 * (a = c(1 − b), c = logit 11%). Duas frequências por faixa: a esperada, que troca o desfecho pela PD verdadeira (sem
 * ruído de amostra: erro de nível dá slope 1 e intercepto −a; erro de inclinação dá slope 1/b), e a observada nos 81
 * defaults da janela, com o ruído da amostra (nela a própria PD verdadeira tem slope 1,14). Intercepto com slope fixado em
 * 1 e o par (intercepto, slope) da regressão de y em logit(PD), por máxima verossimilhança.
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
const CASOS = BASE.map((c) => {
  const p = transformar(PT, c.a, c.b);
  const calc = (y: readonly number[]) => { const s = interceptoESlope(y, p); const fx = faixasQuantis(y, p, 10); return { faixas: fx, i1: interceptoComSlope1(y, p), ...s, acima: fx.filter((f) => f.obs! > f.pdMedia!).length }; };
  const e = calc(PT);
  return { ...c, esperada: { ...e, faixas: arred(e.faixas) }, observada: calc(Y) };
});
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
  const revelado = esc !== null;
  const c = CASOS.find((x) => x.id === (foco ?? sel))!; const m = c[freq];
  const assinatura = c.b === 1 ? `pontos ${m.acima >= 5 ? "acima" : "abaixo"} da diagonal em ${Math.max(m.acima, 10 - m.acima)} das 10 faixas` : c.b > 1 ? "curva mais deitada que a diagonal" : "curva mais em pé que a diagonal";
  const abrir = (id: string) => { setSel(id); setFoco(id); };
  return (
    <Quadro slug="c7p32" pagina={pagina} layout="gl"
      conclusao={!revelado ? <>Quatro distorções da mesma PD verdadeira, cada uma com a sua forma na curva. Antes dos números: qual delas tem slope abaixo de 1?</>
        : <><b>{c.nome}</b> (a = {num(c.a, 2)}, b = {num(c.b, 2)}): {assinatura}. Slope {num(m.slope, 2)}, intercepto com slope 1 de {num(m.i1, 2)}: {c.leitura}.{freq === "observada" ? ` Com o ruído da janela, a referência já tem slope ${num(REF.slope, 2)}.` : ""}</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Base: PD verdadeira do gerador. Frequência esperada: média da PD verdadeira na faixa (sem ruído de amostra, só na base sintética). Observada: defaults da janela; nela a PD verdadeira tem intercepto ${num(REF.intercepto, 2)} e slope ${num(REF.slope, 2)}. Faixas: decis de PD prevista.`}>
      <Painel titulo={foco ? `Em foco: ${c.nome}` : "Quatro jeitos de errar a probabilidade · clique num quadro para ampliar"}>
        {foco ? (
          <div className="q7-g2-s22-foco"><div className="q7-g2-quad"><Confiabilidade titulo={`y: frequência ${freq} na faixa`} sub="x: PD média prevista" semTitulos anotar={false} rotulo={`Curva de confiabilidade: ${c.nome}, frequência ${freq}`} max={0.55} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} series={[{ faixas: m.faixas, classe: "prob", linha: true, ic: freq === "observada" }]}
            extra={(x, y) => <g><text className="q7-rot--peq" x={x(0.02)} y={y(0.52)} style={{ fill: "#5B6475" }}>▲ acima: subestima</text><text className="q7-rot--peq" x={x(0.54)} y={y(0.02)} textAnchor="end" style={{ fill: "#5B6475" }}>▼ abaixo: superestima</text></g>} /></div>
            <dl className="q7-lista">
              <div><dt>Slope</dt><dd>{revelado ? num(m.slope, 2) : "?"}</dd></div>
              <div><dt>Intercepto com slope 1</dt><dd>{num(m.i1, 2)}</dd></div>
              <div><dt>Intercepto da regressão livre</dt><dd>{num(m.intercepto, 2)}</dd></div>
              <div data-tom="mudo"><dt>Distorção aplicada</dt><dd>a = {num(c.a, 2)}, b = {num(c.b, 2)}</dd></div>
            </dl></div>
        ) : (
          <div className="q7-s22-g q7-g2-s22">
            {CASOS.map((x) => (
              <div key={x.id} role="button" tabIndex={0} className="q7-s22-m q7-g2-s22-m" data-on={sel === x.id ? "1" : "0"} onClick={() => abrir(x.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); abrir(x.id); } }} aria-label={`Ampliar: ${x.nome}`}>
                <span className="q7-s22-t">{x.nome}</span>
                <div className="q7-g2-s22-c">
                  <div className="q7-g2-quad"><Confiabilidade rotulo={`Curva de confiabilidade: ${x.nome}`} max={0.55} anotar={false} ticks={[0, 0.25, 0.5]} semTitulos series={[{ faixas: x[freq].faixas, classe: "prob", linha: true }]} /></div>
                  <span className="q7-g2-s22-v"><b>slope {revelado ? num(x[freq].slope, 2) : "?"}</b><span>intercepto com slope 1: {num(x[freq].i1, 2)}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Painel>
      <Painel>
        <Previsao pergunta="Qual quadro tem slope de calibração abaixo de 1?" opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null) setSel("extremas"); }} recolher />
        <p className="q7-k">Frequência de cada faixa</p>
        <Seg rotulo="Frequência" opcoes={[{ v: "esperada" as Freq, r: "Esperada, sem ruído" }, { v: "observada" as Freq, r: "Observada na janela" }]} valor={freq} onChange={setFreq} />
        <p className="q7-nota">Ideal: intercepto 0 e slope 1 juntos. Ao ampliar, a frequência observada traz o intervalo de cada faixa (slide 21); o slide 23 resume o erro num número.</p>
        <Expandir resumo="Como se estimam">
          <Formula f={String.raw`\operatorname{logit} P(Y=1)=\alpha+\beta\,\operatorname{logit}(\mathrm{PD})`} simbolos={[[String.raw`\beta`, "slope de calibração (ideal 1)"], [String.raw`\alpha`, "intercepto da regressão livre"]]} />
          <p className="q7-nota">O intercepto com slope fixado em 1 é outra regressão: só α, com logit(PD) como deslocamento fixo. Ele mede o erro de nível no agregado; o α da regressão livre não tem essa leitura sozinho. Os dois foram conferidos contra o statsmodels.</p>
        </Expandir>
        <div className="q7-botoes">{foco && <Botao onClick={() => setFoco(null)}>Ver os quatro</Botao>}<Botao sec onClick={() => { setFoco(null); setSel(CASOS[0].id); setEsc(null); setFreq("esperada"); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
