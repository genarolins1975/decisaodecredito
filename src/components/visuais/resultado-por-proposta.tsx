"use client";
import { useState } from "react";
import { esperado, fmtReais, PARAMETROS, pontoDeEquilibrio, type Parametros } from "@/lib/visuais/economia";
import { fmtPct } from "@/lib/visuais/metricas";

/**
 * Resultado econômico por proposta (capítulo 8). Modo parcelas (c8p5): as cinco parcelas de uma operação somadas uma a
 * uma. Modo equilibrio (c8p6): o ponto de equilíbrio em PD sai de uma equação, e muda com o contrato, não com o
 * cliente. Modo fracao (c8p3): a fração perdida reparte a exposição e move a fronteira de viabilidade.
 */
export type ModoResultado = "parcelas" | "equilibrio" | "fracao";
const EAD = 10000, PD = 0.1;
const CENARIOS: { rot: string; muda: string; p: Parametros; ead: number }[] = [
  { rot: "Declarado nesta aula", muda: "nada", p: PARAMETROS, ead: EAD },
  { rot: "Captação mais cara", muda: "funding de 12% para 18%", p: { ...PARAMETROS, funding: 0.18 }, ead: EAD },
  { rot: "Garantia exigida", muda: "fração perdida de 65% para 40%", p: { ...PARAMETROS, lgd: 0.4 }, ead: EAD },
  { rot: "Preço maior", muda: "receita de 28% para 34%", p: { ...PARAMETROS, receita: 0.34 }, ead: EAD },
  { rot: "Operação pequena", muda: "exposição de R$ 10.000 para R$ 2.000", p: PARAMETROS, ead: 2000 },
  { rot: "Operação grande", muda: "exposição de R$ 10.000 para R$ 60.000", p: PARAMETROS, ead: 60000 },
];

export function ResultadoPorProposta({ modo = "parcelas" }: { modo?: ModoResultado }) {
  const [k, setK] = useState(5);
  const [pd, setPd] = useState(PD);
  const [lgd, setLgd] = useState(PARAMETROS.lgd);
  const p = { ...PARAMETROS, lgd };
  const parcelas = [
    { rot: "Receita esperada", v: p.receita * EAD * (1 - pd), f: "R × (1 − PD)" },
    { rot: "Perda esperada", v: -pd * p.lgd * EAD, f: "PD × LGD × EAD" },
    { rot: "Funding", v: -p.funding * EAD, f: "F" },
    { rot: "Operação", v: -p.operacao, f: "O" },
    { rot: "Capital", v: -p.capital * EAD, f: "K" },
  ];
  const acumulado = parcelas.slice(0, k).reduce((s, x) => s + x.v, 0);
  const pdStar = pontoDeEquilibrio(EAD, p); const valor = esperado(pd, EAD, p);
  const escala = 3000;
  return (
    <figure className="vz" data-vz={`resultado-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">{modo === "parcelas" ? "Resultado econômico por proposta · uma operação de R$ 10 mil" : modo === "equilibrio" ? "O ponto de equilíbrio em PD · uma equação resolvida, não um palpite" : "Fração perdida dado o default · a mesma exposição, repartida"}</p>
          <p className="vz-tit">{modo === "parcelas" ? "Cinco parcelas, uma soma. A PD entra em uma delas, e o resultado só existe quando as cinco estão na mesa." : modo === "equilibrio" ? "Igualar o resultado esperado a zero e isolar a PD dá um limiar explícito. Ele pertence ao contrato, não ao cliente." : "Default não é perder tudo. A fração perdida é estimativa da operação, e investir em garantia move a fronteira sem tocar no modelo."}</p>
        </div>
        {modo === "parcelas" && <div className="vz-acoes"><button type="button" className="btn btn-sm" onClick={() => setK(k >= 5 ? 1 : k + 1)}>{k >= 5 ? "Recomeçar pela receita" : "Próxima parcela"}</button></div>}
      </header>
      <div className="vz-estado">{modo === "parcelas"
        ? <><b>{k === 1 ? "Comece pela receita." : `${k} de 5 parcelas somadas.`}</b> Após {k === 1 ? "este termo" : "estes termos"} o resultado acumulado é {fmtReais(acumulado)}.{k === 5 && ` Valor final R$ ${Math.round(acumulado).toLocaleString("pt-BR")}: a operação compensa.`}</>
        : modo === "equilibrio"
          ? <><b>PD da operação {fmtPct(pd, 1)}:</b> resultado esperado {fmtReais(valor)}, {valor >= 0 ? "a operação compensa" : "a operação destrói valor"} sob os parâmetros declarados, com limiar em {fmtPct(pdStar, 2)}. Avaliada com PD igual ao limiar, o motor devolve R$ 0.</>
          : <><b>Fração perdida {fmtPct(lgd)}:</b> perda no default {fmtReais(lgd * EAD)}, recuperado {fmtReais((1 - lgd) * EAD)}. PD máxima viável {fmtPct(pdStar, 2)}; acima disso a operação destrói valor.</>}</div>
      <div className="vz-rpp-grade">
        <div className="vz-grafico">
          {modo === "parcelas" ? (
            <>
              <p className="vz-grafico-t">As parcelas, somadas na ordem <span className="hint">barra dourada: acumulado</span></p>
              <div className="vz-res-soma" role="img" aria-label="Parcelas do resultado esperado">
                {parcelas.map((x, i) => { const antes = parcelas.slice(0, i).reduce((s, q) => s + q.v, 0); const on = i < k; return <div key={x.rot} className={`vz-res-soma-linha ${on ? "" : "vz-ind-futuro"}`}>
                  <span className="vz-res-soma-rot">{x.rot}</span>
                  <span className="vz-res-soma-trilho">{on && <span className={`vz-res-soma-parcela ${x.v >= 0 ? "vz-res-soma-parcela--ok" : "vz-res-soma-parcela--mais"}`} style={{ left: `${(Math.min(antes, antes + x.v) / escala) * 100}%`, width: `${(Math.abs(x.v) / escala) * 100}%` }} />}</span>
                  <span className="vz-res-soma-val">{x.v >= 0 ? "+" : "−"}R$ {Math.abs(Math.round(x.v)).toLocaleString("pt-BR")}</span>
                  <span className="vz-res-soma-acum">{on ? `= R$ ${Math.round(antes + x.v).toLocaleString("pt-BR")}` : x.f}</span>
                </div>; })}
              </div>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>PD da operação</span><span className="vz-slider-valor">{fmtPct(pd, 1)}</span></span><input type="range" min={1} max={30} step={0.5} value={pd * 100} onChange={(e) => setPd(Number(e.target.value) / 100)} /></label>
            </>
          ) : modo === "equilibrio" ? (
            <>
              <p className="vz-grafico-t">A derivação, linha a linha</p>
              <div className="vz-rpp-deriv">
                <p>Resultado esperado = R × (1 − PD) − PD × LGD × EAD − F − O − K = 0</p>
                <p>PD* = (R − F − O − K) ÷ (R + LGD × EAD)</p>
                <p>PD* = (R$ 2.800 − R$ 1.200 − R$ 120 − R$ 200) ÷ (R$ 2.800 + R$ 6.500) = <b>{fmtPct(pontoDeEquilibrio(EAD), 2)}</b></p>
              </div>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>PD da operação</span><span className="vz-slider-valor">{fmtPct(pd, 1)}</span></span><input type="range" min={1} max={30} step={0.5} value={pd * 100} onChange={(e) => setPd(Number(e.target.value) / 100)} /></label>
              <div className="vz-rpp-regua" role="img" aria-label="Régua da PD com o ponto de equilíbrio">
                <span className="vz-rpp-regua-ok" style={{ width: `${(pdStar / 0.3) * 100}%` }} />
                <span className="vz-rpp-regua-marca" style={{ left: `${(pd / 0.3) * 100}%` }} title="PD da operação" />
                <span className="vz-rpp-regua-t" style={{ left: `${(pdStar / 0.3) * 100}%` }}>PD* {fmtPct(pdStar, 2)}</span>
              </div>
            </>
          ) : (
            <>
              <p className="vz-grafico-t">Como a exposição se reparte quando há default <span className="hint">vermelho: perdido · azul: recuperado</span></p>
              <div className="vz-rpp-barra" role="img" aria-label="Exposição repartida entre perda e recuperação"><span className="vz-rpp-perda" style={{ width: `${lgd * 100}%` }}>perda {fmtReais(lgd * EAD)}</span><span className="vz-rpp-rec">recuperado {fmtReais((1 - lgd) * EAD)}</span></div>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Fração perdida dado o default</span><span className="vz-slider-valor">{fmtPct(lgd)}</span></span><input type="range" min={10} max={95} step={5} value={lgd * 100} onChange={(e) => setLgd(Number(e.target.value) / 100)} /></label>
              <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Fração perdida</th><th>Perda no default</th><th>PD máxima viável</th></tr></thead><tbody>{[0.3, 0.5, 0.65, 0.8, 0.95].map((l) => <tr key={l} className={Math.abs(l - lgd) < 1e-9 ? "vz-t-on" : undefined}><td>{fmtPct(l)}</td><td>{fmtReais(l * EAD)}</td><td>{fmtPct(pontoDeEquilibrio(EAD, { ...PARAMETROS, lgd: l }), 2)}</td></tr>)}</tbody></table></div>
            </>
          )}
        </div>
        <div className="vz-rpp-painel">
          {modo === "parcelas" && <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">EAD · PD · LGD</p><p className="vz-num">R$ 10 mil · {fmtPct(pd, 1)} · 65%</p><p className="hint">receita 28%, funding 12%, R$ 120 por operação, capital 2%</p></div>
            <div className="vz-tile"><p className="eyebrow">Valor final</p><p className={`vz-num ${esperado(pd, EAD) < 0 ? "vz-num--default" : ""}`}>{fmtReais(esperado(pd, EAD))}</p><p className="hint">R − PD × LGD × EAD − F − O − K</p></div>
          </div>}
          {modo === "equilibrio" && <><p className="vz-grafico-t">O limiar muda com o contrato, não com o cliente</p><div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Cenário</th><th>O que mudou</th><th>Ponto de equilíbrio</th></tr></thead><tbody>{CENARIOS.map((c) => <tr key={c.rot}><th scope="row">{c.rot}</th><td>{c.muda}</td><td><b>{fmtPct(pontoDeEquilibrio(c.ead, c.p), 2)}</b></td></tr>)}</tbody></table></div><p className="hint">Nenhuma linha mexe no cliente. Todas mexem no limiar: um corte único em PD não serve a contratos diferentes.</p></>}
          {modo === "fracao" && <div className="vz-tiles vz-tiles--coluna">
            <div className="vz-tile"><p className="eyebrow">Perda no default</p><p className="vz-num">{fmtReais(lgd * EAD)}</p><p className="hint">LGD × EAD; perda esperada = PD × LGD × EAD</p></div>
            <div className="vz-tile"><p className="eyebrow">PD máxima viável</p><p className="vz-num">{fmtPct(pdStar, 2)}</p><p className="hint">a mesma alavanca move a fronteira de viabilidade</p></div>
            <div className="vz-tile"><p className="eyebrow">Leitura</p><p className="vz-num vz-num--texto">Recuperação depende de garantia, cobrança e tempo. Atribuir um valor único a uma modalidade inteira é a simplificação mais cara deste capítulo, e precisa ser declarada.</p></div>
          </div>}
        </div>
      </div>
      <p className="vz-fonte">Parâmetros declarados na aula: receita de 28% da exposição se pagar, fração perdida de 65%, funding de 12%, R$ 120 por operação e capital de 2%. Operação de R$ 10 mil com PD 10%: +2.520 −650 −1.200 −120 −200 = R$ 350; ponto de equilíbrio 13,76%; com funding de 18% cai a 7,31%, com fração perdida de 40% sobe a 18,82%, os números das páginas.</p>
    </figure>
  );
}
