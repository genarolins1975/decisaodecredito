"use client";
import { useState } from "react";
import { Botao, Controle, escala, Expandir, Formula, Grafico, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { diferencaProporcoes, faixasQuantis, jeffreys, media, wald, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct, pp } from "@/lib/capitulo7/formato";

/**
 * 21 · c7p31 · Incerteza da frequência observada. A mesma frequência de 5% com números de casos diferentes (o controle só
 * passa por n múltiplos de 20, em que 5% é um número inteiro de defaults). Antes de liberar o controle, a turma prevê o
 * intervalo de 5 em 100; as alternativas erradas são o intervalo de 50 em 1.000 e o da aproximação normal. O intervalo
 * de Wilson encolhe com √n e nunca sai de [0, 1]; a aproximação normal (Wald), com poucos casos, dá limite inferior
 * negativo. O nível de confiança é escolhido no quadro (z de 1,645, 1,960 ou 2,576), travado em 95% até a resposta certa,
 * como o controle de casos; a leitura usa o z e o nível escolhidos. O eixo se estende quando um limite passa de 25%
 * (1 em 20 a 99% vai a 31,8%) ou quando a normal desce abaixo da faixa negativa: nenhuma linha é cortada na borda. Abaixo do gráfico, a ponte com
 * o slide 19: as faixas vizinhas F8 e F9 da logística, com o intervalo de cada uma (Wilson) e o da diferença (normal,
 * com o erro padrão das duas proporções), e não a sobreposição dos dois intervalos; os três no nível escolhido. Na expansão, o teste de Jeffreys que o BCE pede no backtesting de PD.
 */
const NS = [20, 40, 60, 100, 140, 200, 300, 500, 740, 1000, 2000];
const Z = { "90": 1.6448536269514722, "95": 1.959963984540054, "99": 2.5758293035489004 } as const;
type Nivel = keyof typeof Z;
const F = faixasQuantis(Y, PL, 10); const F8 = F[7], F9 = F[8];
const DIF = diferencaProporcoes(F8.d, F8.n, F9.d, F9.n);
/** A ponte no nível escolhido: Wilson de F8 e F9 e a diferença ± z vezes o erro padrão da diferença. */
const ponte = (z: number) => ({ f8: wilson(F8.d, F8.n, z)!, f9: wilson(F9.d, F9.n, z)!, dif: [DIF.dif - z * DIF.ep, DIF.dif + z * DIF.ep] as [number, number] });
const PDM = media(PL)!, JC = jeffreys(D, N, PDM);
const JD = F.map((f) => ({ j: f.j, p: jeffreys(f.d, f.n, f.pdMedia!) })); const JMIN = JD.reduce((a, b) => (b.p < a.p ? b : a));
const ACASO = 1 - 0.95 ** F.length;
const W100 = wilson(5, 100)!, W1000 = wilson(50, 1000)!, WA100 = wald(5, 100)!;
const faixa = (w: { lo: number; hi: number }) => `de ${pct(w.lo, 1)} a ${pct(w.hi, 1)}`;
const OPS = [
  { texto: faixa(W1000), certa: false, retorno: <>Esse é o intervalo de 50 em 1.000. Com dez vezes menos casos ele fica {num((W100.hi - W100.lo) / (W1000.hi - W1000.lo), 1)} vezes mais largo. Confunde a frequência com o número de casos.</> },
  { texto: faixa(W100), certa: true, retorno: <>Isso, e assimétrico: mais longo para cima, porque embaixo esbarra no zero.</> },
  { texto: faixa(WA100), certa: false, retorno: <>Essa é a aproximação normal, simétrica em torno de 5%. Com poucos defaults ela erra o formato; Wilson desloca o intervalo para cima.</> },
];

export function S21Wilson({ pagina }: { pagina?: Pagina }) {
  const [i, setI] = useState(0);
  const [nivel, setNivel] = useState<Nivel>("95");
  const [esc, setEsc] = useState<number | null>(null);
  const liberado = esc !== null && !!OPS[esc].certa; // só a resposta certa revela a linha e libera o controle
  const n = NS[i], d = Math.round(0.05 * n), z = Z[nivel];
  const w = wilson(d, n, z)!, wa = wald(d, n, z)!; const P = ponte(z); const zero = P.dif[0] < 0 && P.dif[1] > 0;
  const linhas = [{ rot: `${d} em ${int(n)} (controle)`, n, d, on: true, oculto: false }, { rot: "5 em 100", n: 100, d: 5, oculto: !liberado }, { rot: "50 em 1.000", n: 1000, d: 50, oculto: false }];
  return (
    <Quadro slug="c7p31" pagina={pagina} layout="gl"
      conclusao={!liberado ? <>1 default em 20: intervalo de {nivel}% <b>{faixa(wilson(1, 20, z)!)}</b>; 50 em 1.000: {faixa(wilson(50, 1000, z)!)}. Antes de mover o número de casos, preveja o intervalo de 5 em 100.</> : <>{d} default{d === 1 ? "" : "s"} em {int(n)} casos: frequência de {pct(d / n, 1)}, intervalo de {nivel}% de <b>{pct(w.lo, 1)} a {pct(w.hi, 1)}</b>. {wa.lo < 0 ? <>A aproximação normal daria limite inferior negativo ({pct(wa.lo, 1)}).</> : n >= 500 ? "Com muitos casos, os dois métodos quase coincidem." : "Mais casos, intervalo mais estreito."} As faixas do slide 19 têm cerca de {F8.n} casos: F8 observou {F8.d} em {F8.n}, intervalo de {nivel}% de {pct(P.f8.lo, 1)} a {pct(P.f8.hi, 1)}.</>}
      fonte={`Wilson (1927) para uma proporção binomial, com o denominador real de cada linha; nível de confiança de ${nivel}% nas linhas e na ponte. Exemplos ilustrativos com frequência de 5%; a comparação de faixas usa a janela fora do tempo (logística), com a diferença F8 − F9 pela aproximação normal (erro padrão das duas proporções).`}>
      <Painel titulo="A mesma frequência observada, 5%, com números de casos diferentes">
        <Grafico rotulo={linhas.map((l) => { const ww = wilson(l.d, l.n, z)!; return l.oculto ? `${l.rot}: oculto até a previsão` : `${l.rot}: ${pct(ww.lo, 1)} a ${pct(ww.hi, 1)}`; }).join("; ")} arCelular="4 / 3">
          {(dm) => {
            // eixo até 25% ou, se algum limite superior (Wilson ou normal) passar disso no nível escolhido, até o próximo
            // múltiplo de 5% acima dele: nenhuma linha sai do gráfico
            const vis = linhas.filter((l) => !l.oculto);
            const xmax = Math.max(0.25, Math.ceil(Math.max(...vis.flatMap((l) => [wilson(l.d, l.n, z)!.hi, wald(l.d, l.n, z)!.hi])) / 0.05 - 1e-9) * 0.05);
            // a faixa abaixo de 0% guarda a proporção do gráfico (um quinto do lado positivo) e cabe o limite normal mais negativo
            const xmin = -Math.ceil(Math.max(xmax / 5, 0.01 - Math.min(...vis.map((l) => wald(l.d, l.n, z)!.lo))) * 100 - 1e-9) / 100;
            // larguras estimadas dos textos (rótulo pequeno a 0,86 em; nome da linha em negrito a 1 em)
            const larg = (t: string) => t.length * dm.fs * 0.86 * 0.56, largNome = (t: string) => t.length * dm.fs * 0.6;
            const x = escala([xmin, xmax], [dm.fs * 0.6, dm.w - dm.fs * 0.6]);
            const marcas = Array.from({ length: Math.round(xmax / 0.05) + 1 }, (_, k) => Math.round(k * 5) / 100);
            // cada linha precisa do rótulo acima e da aproximação normal abaixo; a última fica acima dos rótulos do eixo
            const topo = dm.fs * 2.7, fundo = dm.h - dm.fs * 4.1; const passo = (fundo - topo) / (linhas.length - 1);
            return (
              <g>
                <rect x={x(xmin)} y={0} width={x(0) - x(xmin)} height={dm.h - dm.fs * 2.4} fill="#EEF0F3" />
                {(() => {
                  // nome da faixa impossível, centrado no espaço que sobra à esquerda do rótulo "0%" do eixo; em tela estreita, abreviado
                  const livre = x(0) - x(xmin) - dm.fs * 1.1, txt = livre >= larg("abaixo de 0%") ? "abaixo de 0%" : livre >= larg("< 0%") ? "< 0%" : null;
                  return txt && <text className="q7-rot--peq" x={(x(xmin) + x(0) - dm.fs * 1.1) / 2} y={dm.h - dm.fs * 2.4} dy="1.35em" textAnchor="middle" style={{ fill: "#5B6475" }}>{txt}</text>;
                })()}
                {marcas.map((v) => <g key={v}><line className="q7-grade" x1={x(v)} x2={x(v)} y1={0} y2={dm.h - dm.fs * 2.4} /><text className="q7-tick" x={x(v)} y={dm.h - dm.fs * 2.4} dy="1.2em" textAnchor="middle">{pct(v, 0)}</text></g>)}
                <line x1={x(0.05)} x2={x(0.05)} y1={0} y2={dm.h - dm.fs * 2.4} stroke="#176C73" strokeWidth={2} strokeDasharray="6 5" />
                {linhas.map((l, k) => { const ww = wilson(l.d, l.n, z)!, wd = wald(l.d, l.n, z)!; const cy = topo + passo * k; return l.oculto ? (
                  <g key={l.rot}>
                    <text className="q7-rot" x={x(xmin)} y={cy - dm.fs * 0.9}>{l.rot}</text>
                    <rect x={x(0)} y={cy - dm.fs * 0.5} width={x(0.2) - x(0)} height={dm.fs * 1.9} rx={6} fill="none" stroke="#9AA1AD" strokeWidth={2} strokeDasharray="6 5" />
                    <text className="q7-rot" x={x(0.1)} y={cy + dm.fs * 0.45} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>? preveja ao lado</text>
                  </g>
                ) : (
                  <g key={l.rot}>
                    <text className="q7-rot" x={x(xmin)} y={cy - dm.fs * 0.9} style={{ fill: l.on ? "#00205B" : "#2A3342" }}>{l.rot}</text>
                    <line x1={x(ww.lo)} x2={x(ww.hi)} y1={cy} y2={cy} stroke="#176C73" strokeWidth={dm.fs * 0.55} strokeLinecap="round" />
                    <circle cx={x(l.d / l.n)} cy={cy} r={dm.fs * 0.42} fill="#fff" stroke="#00205B" strokeWidth={3} />
                    {(() => {
                      // rótulo de Wilson: à direita da barra se couber; senão acima, terminando na ponta da barra, ou logo
                      // depois do nome da linha quando a barra começa embaixo dele (tela estreita)
                      const txt = `Wilson ${pct(ww.lo, 1)} a ${pct(ww.hi, 1)}`, w = larg(txt), xr = x(ww.hi) + dm.fs * 0.6;
                      if (xr + w <= dm.w - 2) return <text className="q7-rot--peq" x={xr} y={cy} dy=".35em">{txt}</text>;
                      const fimNome = x(xmin) + largNome(l.rot) + dm.fs * 0.8, xe = Math.min(x(ww.hi), dm.w - 2);
                      return xe - w >= fimNome ? <text className="q7-rot--peq" x={xe} y={cy - dm.fs * 0.75} textAnchor="end">{txt}</text>
                        : <text className="q7-rot--peq" x={Math.min(fimNome, dm.w - 2 - w)} y={cy - dm.fs * 0.9}>{txt}</text>;
                    })()}
                    <line x1={x(Math.max(xmin, wd.lo))} x2={x(wd.hi)} y1={cy + dm.fs * 1.05} y2={cy + dm.fs * 1.05} stroke="#9AA1AD" strokeWidth={dm.fs * 0.22} strokeDasharray="6 4" />
                    {(() => {
                      // rótulo da normal: à direita da linha tracejada se couber; senão logo abaixo dela
                      const txt = `normal ${pct(wd.lo, 1)} a ${pct(wd.hi, 1)}`, w = larg(txt), xr = x(wd.hi) + dm.fs * 0.6;
                      return xr + w <= dm.w - 2 ? <text className="q7-rot--peq" x={xr} y={cy + dm.fs * 1.05} dy=".35em" style={{ fill: "#5B6475" }}>{txt}</text>
                        : <text className="q7-rot--peq" x={Math.min(x(Math.max(xmin, wd.lo)), dm.w - 2 - w)} y={cy + dm.fs * 2.2} style={{ fill: "#5B6475" }}>{txt}</text>;
                    })()}
                  </g>
                ); })}
              </g>
            );
          }}
        </Grafico>
        <p className="q7-k">Ponte com o slide 19: F9 tem PD maior que F8 e observou menos · intervalos de {nivel}%</p>
        <dl className="q7-lista q7-g2-s21-l">
          <div><dt>F8: {F8.d} em {F8.n} = {pct(F8.obs!, 1)}</dt><dd>{pct(P.f8.lo, 1)} a {pct(P.f8.hi, 1)}</dd></div>
          <div><dt>F9: {F9.d} em {F9.n} = {pct(F9.obs!, 1)}</dt><dd>{pct(P.f9.lo, 1)} a {pct(P.f9.hi, 1)}</dd></div>
          <div data-tom={zero ? "mudo" : undefined}><dt>Diferença F8 − F9: {pp(DIF.dif, 1)}; {zero ? "contém o zero: a inversão é compatível com ruído" : "não contém o zero"}</dt><dd>{pp(P.dif[0], 1)} a {pp(P.dif[1], 1)}</dd></div>
        </dl>
      </Painel>
      <Painel>
        <Previsao pergunta="Com 5 defaults em 100 casos, o intervalo de 95% para a frequência vai:" opcoes={OPS} escolha={esc} onEscolha={(k) => { setEsc(k); setNivel("95"); if (k === null || !OPS[k].certa) setI(0); }} recolher />
        {liberado && <Controle rotulo="Número de casos" valor={i} min={0} max={NS.length - 1} passo={1} onChange={setI} mostrar={`${int(n)} (${d} default${d === 1 ? "" : "s"})`} />}
        <div className="q7-s21-l"><Seg rotulo="Nível de confiança" opcoes={(Object.keys(Z) as Nivel[]).map((k) => ({ v: k, r: `${k}%` }))} valor={nivel} onChange={setNivel} desab={!liberado} /><Botao sec onClick={() => { setI(0); setNivel("95"); setEsc(null); }}>Restaurar</Botao></div>
        <Expandir resumo="Fórmula e o que o intervalo cobre">
          <Formula f={String.raw`\frac{\hat p+\frac{z^2}{2n}\pm z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}`} simbolos={[[String.raw`\hat p`, "frequência observada d ÷ n"], ["z", `quantil da normal: ${num(Z[nivel], 3)} para ${nivel}%`]]} />
          <p className="q7-nota">O procedimento, repetido em muitas amostras, cobre a probabilidade de default verdadeira em cerca de {nivel}% delas; não é a probabilidade de um parâmetro fixo estar dentro deste intervalo. Supõe casos independentes com a mesma probabilidade; não inclui a incerteza do treino do modelo nem a dependência entre clientes.</p>
        </Expandir>
        <Expandir resumo="Como o supervisor testa a PD: Jeffreys">
          <Formula compacta f={String.raw`p=F_{\mathrm{Beta}}\big(\mathrm{PD};\ d+\tfrac12,\ n-d+\tfrac12\big)`} />
          <p className="q7-nota">Carteira: {D} defaults em {int(N)} contra PD média de {pct(PDM, 1)}; p = {num(JC, 3)}. A 5%, o teste não rejeita: a diferença de {pp(D / N - PDM, 1).replace("+", "")} ainda cabe no ruído de {D} defaults. Por decil, o menor p é o de F{JMIN.j} ({num(JMIN.p, 3)}); com {F.length} testes, ao menos um abaixo de 5% surgiria ao acaso em cerca de {pct(ACASO, 0)} das vezes, se fossem independentes. H0: a PD não subestima a taxa verdadeira (BCE, instruções de validação de modelos internos).</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}
