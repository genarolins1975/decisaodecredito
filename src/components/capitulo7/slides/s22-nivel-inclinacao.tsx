"use client";
import { useState } from "react";
import { Botao, Expandir, Formula, Painel, Quadro, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PT, Y } from "@/lib/capitulo7/dados";
import { faixasQuantis, interceptoComSlope1, interceptoESlope, logit, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 22 · c7p32 · Assinaturas de erro. Ponto de partida: a PD verdadeira do gerador (só existe porque a base é sintética),
 * distorcida de quatro jeitos com p' = σ(a + b · logit p). As duas distorções de inclinação giram em torno de 11%
 * (a = c(1 − b), c = logit 11%) para não misturar nível com inclinação. Cada quadrinho traz o intercepto com slope
 * fixado em 1 e o par (intercepto, slope) da regressão de y em logit(PD), estimados com os desfechos da janela.
 */
const C = logit(0.11);
const CASOS = [
  { id: "sub", nome: "Subestimação global", a: -0.7, b: 1, assinatura: "pontos acima da diagonal em todas as faixas", leitura: "o modelo prevê menos risco do que acontece; corrige-se com o nível (intercepto)" },
  { id: "super", nome: "Superestimação global", a: 0.7, b: 1, assinatura: "pontos abaixo da diagonal em todas as faixas", leitura: "o modelo prevê mais risco do que acontece; corrige-se com o nível" },
  { id: "extremas", nome: "Probabilidades extremas", a: C * (1 - 1.8), b: 1.8, assinatura: "curva mais deitada que a diagonal: baixas baixas demais, altas altas demais", leitura: "excesso de confiança; slope abaixo de 1" },
  { id: "comprimidas", nome: "Probabilidades comprimidas", a: C * (1 - 0.45), b: 0.45, assinatura: "curva mais em pé que a diagonal: tudo perto da média", leitura: "falta de confiança; slope acima de 1" },
].map((c) => { const p = transformar(PT, c.a, c.b); const s = interceptoESlope(Y, p); return { ...c, faixas: faixasQuantis(Y, p, 10), i1: interceptoComSlope1(Y, p), ...s }; });
const REF = interceptoESlope(Y, PT);

export function S22NivelInclinacao({ pagina }: { pagina?: Pagina }) {
  const [foco, setFoco] = useState<string | null>(null);
  const [sel, setSel] = useState(CASOS[0].id);
  const c = CASOS.find((x) => x.id === (foco ?? sel))!;
  return (
    <Quadro slug="c7p32" pagina={pagina} layout="gl"
      conclusao={<><b>{c.nome}</b>: {c.assinatura}. Intercepto com slope 1 = {num(c.i1, 2)}; regressão livre: intercepto {num(c.intercepto, 2)} e slope {num(c.slope, 2)}. Leitura: {c.leitura}.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Base das distorções: PD verdadeira do gerador (na própria janela ela tem intercepto ${num(REF.intercepto, 2)} e slope ${num(REF.slope, 2)}, por variação de amostra). Faixas: decis de PD prevista.`}>
      <Painel titulo={foco ? `Em foco: ${c.nome}` : "Quatro jeitos de errar a probabilidade · clique num quadro para ampliar"}>
        {foco ? (
          <div className="q7-flex1"><Confiabilidade rotulo={`Curva de confiabilidade: ${c.nome}`} max={0.5} series={[{ faixas: c.faixas, classe: "dec", linha: true, ic: true }]} /></div>
        ) : (
          <div className="q7-s22-g">
            {CASOS.map((x) => (
              <div key={x.id} role="button" tabIndex={0} className="q7-s22-m" data-on={sel === x.id ? "1" : "0"} onClick={() => { setSel(x.id); setFoco(x.id); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setSel(x.id); setFoco(x.id); } }} aria-label={`Ampliar: ${x.nome}`}>
                <span className="q7-s22-t">{x.nome}</span>
                <Confiabilidade rotulo={`Curva de confiabilidade: ${x.nome}`} max={0.5} anotar={false} ticks={[0, 0.25, 0.5]} semTitulos series={[{ faixas: x.faixas, classe: "dec", linha: true }]} />
                <span className="q7-s22-v">slope {num(x.slope, 2)} · intercepto com slope 1: {num(x.i1, 2)}</span>
              </div>
            ))}
          </div>
        )}
      </Painel>
      <Painel>
        <p className="q7-k">Assinatura e diagnóstico</p>
        <dl className="q7-lista">
          <div><dt>Intercepto com slope fixado em 1</dt><dd>{num(c.i1, 2)}</dd></div>
          <div><dt>Intercepto da regressão livre</dt><dd>{num(c.intercepto, 2)}</dd></div>
          <div data-tom="dec"><dt>Slope da regressão livre</dt><dd>{num(c.slope, 2)}</dd></div>
          <div data-tom="mudo"><dt>Distorção aplicada</dt><dd>a = {num(c.a, 2)}, b = {num(c.b, 2)}</dd></div>
        </dl>
        <p className="q7-p">Ideal: intercepto 0 e slope 1 <b>juntos</b>. Intercepto com slope 1 positivo indica risco subestimado no agregado.</p>
        <Expandir resumo="Como se estimam">
          <Formula f={String.raw`\operatorname{logit} P(Y=1)=\alpha+\beta\,\operatorname{logit}(\mathrm{PD})`} simbolos={[[String.raw`\beta`, "slope de calibração (ideal 1)"], [String.raw`\alpha`, "intercepto da regressão livre"]]} />
          <p className="q7-nota">O intercepto com slope fixado em 1 é outra regressão: só α, com logit(PD) como deslocamento fixo. Ele mede o erro de nível no agregado; o α da regressão livre não tem essa leitura sozinho. Os dois foram estimados por máxima verossimilhança e conferidos contra o statsmodels.</p>
        </Expandir>
        <div className="q7-botoes">{foco && <Botao onClick={() => setFoco(null)}>Ver os quatro</Botao>}<Botao sec onClick={() => { setFoco(null); setSel(CASOS[0].id); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
