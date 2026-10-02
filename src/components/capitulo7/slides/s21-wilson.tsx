"use client";
import { useState } from "react";
import { Botao, Controle, escala, Expandir, Formula, Grafico, Kpi, Painel, Quadro, Seg, type Pagina } from "../base";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { diferencaProporcoes, faixasQuantis, jeffreys, media, wald, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct, pp } from "@/lib/capitulo7/formato";

/**
 * 21 · c7p31 · Incerteza da frequência observada. A mesma frequência de 5% com números de casos diferentes: o intervalo
 * de Wilson encolhe com √n e nunca sai de [0, 1]; a aproximação normal (Wald), com poucos casos, dá limite inferior
 * negativo. O nível de confiança é escolhido no quadro (z de 1,645, 1,960 ou 2,576). Na expansão, duas faixas
 * vizinhas da logística comparadas pelo intervalo da diferença, e não pela sobreposição dos dois intervalos. Na
 * terceira expansão, o teste de Jeffreys que o BCE pede no backtesting de PD, na carteira e por decil.
 */
const NS = [20, 30, 50, 74, 100, 150, 200, 300, 500, 737, 1000, 2000];
const Z = { "90": 1.6448536269514722, "95": 1.959963984540054, "99": 2.5758293035489004 } as const;
type Nivel = keyof typeof Z;
const F = faixasQuantis(Y, PL, 10); const F8 = F[7], F9 = F[8];
const DIF = diferencaProporcoes(F8.d, F8.n, F9.d, F9.n);
const PDM = media(PL)!, JC = jeffreys(D, N, PDM);
const JD = F.map((f) => ({ j: f.j, p: jeffreys(f.d, f.n, f.pdMedia!) })); const JMIN = JD.reduce((a, b) => (b.p < a.p ? b : a));
const ACASO = 1 - 0.95 ** F.length;

export function S21Wilson({ pagina }: { pagina?: Pagina }) {
  const [i, setI] = useState(0);
  const [nivel, setNivel] = useState<Nivel>("95");
  const n = NS[i], d = Math.round(0.05 * n), z = Z[nivel];
  const w = wilson(d, n, z)!, wa = wald(d, n, z)!;
  const linhas = [{ rot: `${d} em ${int(n)} (controle)`, n, d, on: true }, { rot: "5 em 100", n: 100, d: 5 }, { rot: "50 em 1.000", n: 1000, d: 50 }];
  return (
    <Quadro slug="c7p31" pagina={pagina} layout="gl"
      conclusao={<>{d} default{d === 1 ? "" : "s"} em {int(n)} casos: frequência de {pct(d / n, 1)}, intervalo de {nivel}% de <b>{pct(w.lo, 1)} a {pct(w.hi, 1)}</b>. {wa.lo < 0 ? <>A aproximação normal daria limite inferior negativo ({pct(wa.lo, 1)}), sem sentido para uma frequência.</> : n >= 500 ? "Com muitos casos, os dois métodos quase coincidem." : "Mais casos, intervalo mais estreito."}</>}
      fonte={`Wilson (1927) para uma proporção binomial, com o denominador real de cada linha; nível de confiança de ${nivel}%. Exemplos ilustrativos com frequência de 5%; a comparação de faixas usa a janela fora do tempo (logística).`}>
      <Painel titulo="A mesma frequência observada, com números de casos diferentes">
        <Grafico rotulo={linhas.map((l) => { const ww = wilson(l.d, l.n, z)!; return `${l.rot}: ${pct(ww.lo, 1)} a ${pct(ww.hi, 1)}`; }).join("; ")} arCelular="4 / 3">
          {(dm) => {
            const x = escala([-0.05, 0.25], [dm.fs * 0.6, dm.w - dm.fs * 0.6]); const lh = (dm.h - dm.fs * 3.2) / linhas.length;
            return (
              <g>
                <rect x={x(-0.05)} y={0} width={x(0) - x(-0.05)} height={dm.h - dm.fs * 2.4} fill="#FBF2F3" />
                <text className="q7-rot--peq" x={x(-0.025)} y={dm.fs * 1.2} textAnchor="middle" style={{ fill: "#8C2332" }}>abaixo de 0%</text>
                {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((v) => <g key={v}><line className="q7-grade" x1={x(v)} x2={x(v)} y1={0} y2={dm.h - dm.fs * 2.4} /><text className="q7-tick" x={x(v)} y={dm.h - dm.fs * 2.4} dy="1.2em" textAnchor="middle">{pct(v, 0)}</text></g>)}
                <line x1={x(0.05)} x2={x(0.05)} y1={0} y2={dm.h - dm.fs * 2.4} stroke="#176C73" strokeWidth={2} strokeDasharray="6 5" />
                {linhas.map((l, k) => { const ww = wilson(l.d, l.n, z)!, wd = wald(l.d, l.n, z)!; const cy = dm.fs * 2.6 + lh * k + lh * 0.35; return (
                  <g key={l.rot}>
                    <text className="q7-rot" x={x(-0.05)} y={cy - dm.fs * 0.9} style={{ fill: l.on ? "#00205B" : "#2A3342" }}>{l.rot}</text>
                    <line x1={x(ww.lo)} x2={x(ww.hi)} y1={cy} y2={cy} stroke="#176C73" strokeWidth={dm.fs * 0.55} strokeLinecap="round" />
                    <circle cx={x(l.d / l.n)} cy={cy} r={dm.fs * 0.42} fill="#fff" stroke="#00205B" strokeWidth={3} />
                    {ww.hi > 0.17 ? <text className="q7-rot--peq" x={x(ww.hi)} y={cy - dm.fs * 0.75} textAnchor="end">Wilson {pct(ww.lo, 1)} a {pct(ww.hi, 1)}</text> : <text className="q7-rot--peq" x={x(ww.hi) + dm.fs * 0.6} y={cy} dy=".35em">Wilson {pct(ww.lo, 1)} a {pct(ww.hi, 1)}</text>}
                    <line x1={x(Math.max(-0.05, wd.lo))} x2={x(wd.hi)} y1={cy + dm.fs * 1.05} y2={cy + dm.fs * 1.05} stroke="#9AA1AD" strokeWidth={dm.fs * 0.22} strokeDasharray="6 4" />
                    <text className="q7-rot--peq" x={x(wd.hi) + dm.fs * 0.6} y={cy + dm.fs * 1.05} dy=".35em" style={{ fill: "#5B6475" }}>normal {pct(wd.lo, 1)} a {pct(wd.hi, 1)}</text>
                  </g>
                ); })}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Controle rotulo="Número de casos" valor={i} min={0} max={NS.length - 1} passo={1} onChange={setI} mostrar={`${int(n)} (${d} default${d === 1 ? "" : "s"})`} escala={["20", "2.000"]} />
        <div className="q7-s21-l"><Seg rotulo="Nível de confiança" opcoes={(Object.keys(Z) as Nivel[]).map((k) => ({ v: k, r: `${k}%` }))} valor={nivel} onChange={setNivel} /><Botao sec onClick={() => { setI(0); setNivel("95"); }}>Restaurar</Botao></div>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Largura do intervalo" valor={pp(w.hi - w.lo, 1).replace("+", "")} detalhe={`${pct(w.lo, 1)} a ${pct(w.hi, 1)}`} tom="prob" />
          <Kpi rotulo="Limite inferior normal" valor={pct(wa.lo, 1)} detalhe={wa.lo < 0 ? "negativo: sem sentido" : "dentro de [0, 1]"} tom={wa.lo < 0 ? "def" : undefined} />
        </div>
        <Expandir resumo="Fórmula e o que o intervalo cobre">
          <Formula f={String.raw`\frac{\hat p+\frac{z^2}{2n}\pm z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}`} simbolos={[[String.raw`\hat p`, "frequência observada d ÷ n"], ["z", `quantil da normal: ${String(Z[nivel]).slice(0, 5).replace(".", ",")} para ${nivel}%`]]} />
          <p className="q7-nota">O procedimento, repetido em muitas amostras, cobre a frequência verdadeira em cerca de {nivel}% delas; não é a probabilidade de um parâmetro fixo estar dentro deste intervalo. Supõe casos independentes com a mesma probabilidade; não inclui a incerteza do treino do modelo nem a dependência entre clientes.</p>
        </Expandir>
        <Expandir resumo="Duas faixas vizinhas: a diferença tem intervalo próprio">
          <p className="q7-nota">Logística, faixas F8 e F9: {F8.d} em {F8.n} ({pct(F8.obs!, 1)}) contra {F9.d} em {F9.n} ({pct(F9.obs!, 1)}). A faixa de PD maior observou menos. Diferença {pp(DIF.dif, 1)}, intervalo de 95% de {pp(DIF.ic[0], 1)} a {pp(DIF.ic[1], 1)}: contém o zero, a inversão é compatível com ruído. Sobrepor dois intervalos não é teste.</p>
        </Expandir>
        <Expandir resumo="Como o supervisor testa a PD: Jeffreys">
          <Formula compacta f={String.raw`p=F_{\mathrm{Beta}}\big(\mathrm{PD};\ d+\tfrac12,\ n-d+\tfrac12\big)`} />
          <p className="q7-nota">Carteira: {D} defaults em {int(N)} contra PD média de {pct(PDM, 1)}; p = {num(JC, 3)}. A 5%, o teste não rejeita: a diferença de {pp(D / N - PDM, 1).replace("+", "")} ainda cabe no ruído de {D} defaults. Por decil, o menor p é o de F{JMIN.j} ({num(JMIN.p, 3)}); com {F.length} testes, ao menos um abaixo de 5% surgiria ao acaso em cerca de {pct(ACASO, 0)} das vezes, se fossem independentes. H0: a PD não subestima a taxa verdadeira (BCE, instruções de validação de modelos internos).</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}
