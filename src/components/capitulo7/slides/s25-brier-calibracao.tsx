"use client";
import { useMemo, useState } from "react";
import { Botao, Controle, escala, Expandir, Formula, Grafico, LinkSlide, Painel, Previsao, Quadro, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PGR, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, calibracaoGlobal, corp, faixasQuantis, mulberry32, quantil, transformar, type Vetor } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 25 · c7p11 · Menor Brier não prova melhor calibração. Modelo A: a logística com o nível deslocado em +a log odds
 * (boa fila; com a = 0 é a própria logística). Modelo B: PD constante igual à taxa da própria janela (nível certo no
 * agregado por construção, nenhuma separação; MCB zero por construção; usa uma informação que só existe depois e serve
 * apenas para isolar a propriedade). A decomposição CORP (Dimitriadis, Gneiting e Jordan, 2021) separa o Brier sem
 * faixas: BS = MCB − DSC + UNC, com a isotônica ajustada na própria amostra como referência. Essa MCB é viesada para
 * cima (nunca é zero, nem sob calibração perfeita); por isso cada MCB vem com a banda de consistência: a MCB de
 * REPLICAS desfechos simulados da própria PD (y ~ Bernoulli(PD), semente SEMENTE_BANDA), 5% a 95%. Em a = 0 a MCB da
 * logística cai dentro da banda (compatível com calibração, como nos slides 19 e 21). A previsão pergunta a partir de
 * que deslocamento B passa a ter o Brier menor (virada por bisseção sobre o Brier da biblioteca); a resposta certa
 * abre o controle no primeiro deslocamento da grade em que a MCB de A sai da banda e A ainda tem o Brier menor: o
 * título demonstrado. As bandas são calculadas sob demanda e guardadas por deslocamento. O boosting cru fica só na
 * expansão, como comparação de dois modelos reais.
 */
const TAXA = D / N;
const PB = PL.map(() => TAXA);
const FB = faixasQuantis(Y, PB, 1);
const CB = corp(Y, PB), CL = corp(Y, PL), CG = corp(Y, PGR);
/** Deslocamento a partir do qual o Brier de A passa o de B (o Brier de A cresce com a acima do ótimo). */
const VIRADA = (() => { let lo = 0, hi = 3; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (brier(Y, transformar(PL, m, 1)) < CB.bs) lo = m; else hi = m; } return (lo + hi) / 2; })();
const A_MEIO = 0.4, A_ALTO = 1.4;
const C_MEIO = corp(Y, transformar(PL, A_MEIO, 1)), C_ALTO = corp(Y, transformar(PL, A_ALTO, 1));
/** Banda de consistência da MCB: desfechos simulados da própria PD (calibração perfeita), 5% a 95% das réplicas. */
const REPLICAS = 200, SEMENTE_BANDA = 20261025;
type Banda = { lo: number; hi: number };
const BANDAS = new Map<string, Banda>();
function banda(chave: string, pd: Vetor): Banda {
  const c = BANDAS.get(chave); if (c) return c;
  const r = mulberry32(SEMENTE_BANDA); const v: number[] = [];
  for (let k = 0; k < REPLICAS; k++) { const ys = pd.map((p) => (r() < p ? 1 : 0)); v.push(corp(ys, pd).mcb); }
  v.sort((x, y) => x - y); const b = { lo: quantil(v, 0.05), hi: quantil(v, 0.95) }; BANDAS.set(chave, b); return b;
}
const chaveA = (a: number) => `A${Math.round(a * 10)}`;
const bandaA = (a: number) => banda(chaveA(a), transformar(PL, a, 1));
/** Primeiro deslocamento da grade (passo 0,1) em que a MCB de A sai da banda com A ainda abaixo de B no Brier. */
let SAIDA: number | null = null;
function saida() {
  if (SAIDA !== null) return SAIDA;
  const r1 = (v: number) => Math.round(v * 10) / 10;
  let a = r1(Math.floor(VIRADA * 10) / 10);
  if (brier(Y, transformar(PL, a, 1)) >= CB.bs) a = r1(a - 0.1);
  while (a > 0.05 && corp(Y, transformar(PL, r1(a - 0.1), 1)).mcb > bandaA(r1(a - 0.1)).hi) a = r1(a - 0.1);
  SAIDA = a; return SAIDA;
}
/** zero exibido sem sinal: a decomposição de B dá zero por construção, e o arredondamento não pode virar "−0". */
const n5 = (v: number) => num(Math.abs(v) < 5e-6 ? 0 : v, 5);
const OPS = [
  { texto: "Logo acima de 0", certa: false, retorno: <>Com a = {num(A_MEIO, 1)}, A ainda tem Brier {num(C_MEIO.bs, 5)} contra {num(CB.bs, 5)} de B: o erro de nível ainda é pequeno perto da separação. Confunde Brier com calibração.</> },
  { texto: `Perto de +${num(VIRADA, 1)}`, certa: true, retorno: <>Isso: só a partir de a = {num(VIRADA, 2)}. Pouco antes, a descalibração de A já sai da banda do acaso e A ainda vence no Brier.</> },
  { texto: "Nunca, porque A ordena bem", certa: false, retorno: <>Com a = {num(A_ALTO, 1)}, A tem Brier {num(C_ALTO.bs, 5)} contra {num(CB.bs, 5)} de B: o erro de calibração cresce com o deslocamento e passa a separação. Confunde Brier com discriminação.</> },
];

export function S25BrierCalibracao({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(0);
  const [esc, setEsc] = useState<number | null>(null);
  const PA = useMemo(() => transformar(PL, a, 1), [a]); const FA = useMemo(() => faixasQuantis(Y, PA, 10), [PA]);
  const CA = useMemo(() => corp(Y, PA), [PA]); const gA = calibracaoGlobal(Y, PA);
  const BA = useMemo(() => bandaA(a), [a]);
  const vence = CA.bs < CB.bs; const fora = CA.mcb > BA.hi;
  const revelado = esc !== null && OPS[esc].certa;
  const barras = [{ r: a === 0 ? "A (logística)" : `A, a = +${num(a, 1)}`, c: CA, b: BA as Banda | null }, { r: "B (constante)", c: CB, b: null }];
  const mx = Math.max(...barras.flatMap((b) => [b.c.mcb, b.c.dsc, b.b?.hi ?? 0])) * 1.05;
  const escolher = (i: number | null) => { setEsc(i); setA(i !== null && OPS[i].certa ? saida() : 0); };
  const faixaTxt = <>banda {num(BA.lo, 5)} a {num(BA.hi, 5)}</>;
  return (
    <Quadro slug="c7p11" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Menor Brier prova melhor calibração?"}
      sub={revelado ? undefined : "A ordena bem; B dá a todos a mesma PD, a taxa da janela."}
      conclusao={!revelado ? <>Com a = {num(a, 1)}: Brier de A = {num(CA.bs, 5)}; de B = {num(CB.bs, 5)}. Subindo o nível de A, quando B passa a ter o Brier menor? O controle abre depois da resposta.</>
        : vence && fora ? <>Com a = +{num(a, 1)}, a MCB de A ({num(CA.mcb, 5)}) <b>sai da banda da calibração perfeita</b> ({faixaTxt}): descalibração além do acaso. Ainda assim <b>A tem o Brier menor</b> ({num(CA.bs, 5)} contra {num(CB.bs, 5)} de B, calibrado por construção), pela separação. B só vence a partir de a = {num(VIRADA, 2)}.</>
        : vence ? <>Com a = +{num(a, 1)}: MCB de A {num(CA.mcb, 5)}, dentro da {faixaTxt}: compatível com calibração, como nos slides 19 e 21. A tem o Brier menor pela separação (DSC {num(CA.dsc, 5)}). Suba o nível até a MCB sair da banda.</>
        : <>Com a = +{num(a, 1)}, B passa a ter o Brier menor: a MCB de A ({num(CA.mcb, 5)}, banda até {num(BA.hi, 5)}) superou a separação (DSC {num(CA.dsc, 5)}). A fila não mudou; a PD média foi a {pct(gA.pdMedia!, 1)} contra {pct(TAXA, 1)} observados.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. A: σ(logit p + a) sobre a logística. B: PD constante de ${pct(TAXA, 2)}, a taxa da janela. MCB na própria amostra tem viés para cima; banda: 5% a 95% de ${REPLICAS} réplicas com desfechos sorteados da própria PD (semente ${SEMENTE_BANDA}). CORP: Dimitriadis, Gneiting e Jordan (2021).`}>
      <Painel>
        <div className="q7-g2-s25 q7-s25v3">
          <div className="q7-g2-quad"><Confiabilidade titulo={a === 0 ? "A: a logística" : "A: boa fila, nível deslocado"} sub={`AUC ${num(aucPorPares(Y, PA).auc!, 4)}`} rotulo={`Curva de confiabilidade do modelo A por decil; o modelo B é um único ponto em ${pct(TAXA, 1)}`} max={0.5} ticks={[0, 0.25, 0.5]} series={[{ faixas: FA, classe: "prob", linha: true, ic: true }]} anotar={false}
            extra={(x, y, d) => { const bx = x(FB[0].pdMedia!), by = y(FB[0].obs!), lx = x(0.015), ly = y(0.4); return <g>
              <line x1={bx - d.fs * 0.2} y1={by - d.fs * 0.45} x2={lx + d.fs * 1.2} y2={ly + d.fs * 0.3} stroke="#00205B" strokeWidth={1.5} />
              <rect x={bx - d.fs * 0.42} y={by - d.fs * 0.42} width={d.fs * 0.84} height={d.fs * 0.84} fill="#fff" stroke="#00205B" strokeWidth={2.5} />
              <text className="q7-rot--peq" x={lx} y={ly} style={{ fill: "#00205B", fontWeight: 700 }}>■ B: todos com {pct(TAXA, 1)}</text></g>; }} /></div>
          <div className="q7-s25v3-dir">
            <Grafico titulo="Brier e partes" sub={revelado ? "BS = MCB − DSC + UNC" : "partes depois da previsão"} arCelular="16 / 8" rotulo={barras.map((b) => revelado ? `${b.r}: Brier ${n5(b.c.bs)}, MCB ${n5(b.c.mcb)}${b.b ? `, banda da calibração perfeita ${n5(b.b.lo)} a ${n5(b.b.hi)}` : ""}, DSC ${n5(b.c.dsc)}` : `${b.r}: Brier ${n5(b.c.bs)}`).join("; ")}
              tabela={<table><caption>Decomposição CORP do Brier</caption><thead><tr><th>Modelo</th><th>BS</th><th>MCB</th><th>Banda da MCB</th><th>DSC</th></tr></thead><tbody>{barras.map((b) => <tr key={b.r}><td>{b.r}</td><td>{n5(b.c.bs)}</td><td>{revelado ? n5(b.c.mcb) : "oculto"}</td><td>{revelado && b.b ? `${n5(b.b.lo)} a ${n5(b.b.hi)}` : "não se aplica"}</td><td>{revelado ? n5(b.c.dsc) : "oculto"}</td></tr>)}</tbody></table>}>
              {(d) => {
                const x0 = d.fs * 0.2, x = escala([0, mx], [x0, d.w - d.fs * 9.8]); const lh = Math.min(d.fs * 5, (d.h - d.fs * 1.4) / barras.length); const bh = d.fs * 0.7;
                return <g>{barras.map((b, i) => { const y0 = lh * i + d.fs * 1.1; return <g key={b.r}>
                  <text className="q7-rot" x={x0} y={y0}>{b.r}<tspan dx="10" style={{ fill: "#5B6475", fontWeight: 400 }}>Brier {n5(b.c.bs)}</tspan></text>
                  {revelado ? <>
                    {b.b && <rect x={x(b.b.lo)} y={y0 + d.fs * 0.3} width={x(b.b.hi) - x(b.b.lo)} height={bh + d.fs * 0.4} fill="#E7E4DC" stroke="#9AA1AD" strokeDasharray="3 3" />}
                    <rect x={x0} y={y0 + d.fs * 0.5} width={Math.max(1.5, x(b.c.mcb) - x0)} height={bh} fill="#176C73" />
                    <text className="q7-rot--peq" x={Math.max(x0 + 1.5, x(Math.max(b.c.mcb, b.b?.hi ?? 0))) + d.fs * 0.35} y={y0 + d.fs * 0.5 + bh / 2} dy=".35em" style={{ fill: "#176C73", fontWeight: 700 }}>MCB {n5(b.c.mcb)}{b.b ? (b.c.mcb > b.b.hi ? " ▲ fora" : " dentro") : " (zero por construção)"}</text>
                    <rect x={x0} y={y0 + d.fs * 0.9 + bh} width={Math.max(1.5, x(b.c.dsc) - x0)} height={bh} fill="#DCE3EF" stroke="#3D5A8A" strokeWidth={1.5} />
                    <text className="q7-rot--peq" x={Math.max(x0 + 1.5, x(b.c.dsc)) + d.fs * 0.35} y={y0 + d.fs * 0.9 + bh * 1.5} dy=".35em" style={{ fill: "#3D5A8A", fontWeight: 700 }}>DSC {n5(b.c.dsc)}</text>
                  </> : <text className="q7-rot--peq" x={x0} y={y0 + d.fs * 1.4} style={{ fill: "#5B6475" }}>calibração (MCB) e separação (DSC): ?</text>}
                </g>; })}
                {revelado && <text className="q7-rot--peq" x={x0} y={Math.min(d.h - d.fs * 0.3, lh * barras.length + d.fs * 0.9)} style={{ fill: "#5B6475" }}>cinza: MCB esperada sob calibração perfeita</text>}</g>;
              }}
            </Grafico>
            <dl className="q7-s25v3-def">
              <div><dt>Isotônica</dt><dd>curva crescente mais próxima dos dados (<LinkSlide slug="c7p36" className="q7-s10-lk">slide 30</LinkSlide>).</dd></div>
              <div><dt>MCB</dt><dd>erro de calibração: o que o Brier cai com a isotônica.</dd></div>
              <div><dt>DSC</dt><dd>separação: o que a isotônica ganha da taxa média.</dd></div>
              <div><dt>UNC</dt><dd>Brier da taxa média, {num(CL.unc, 5)}, comum a todos.</dd></div>
            </dl>
          </div>
        </div>
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de mover o nível" pergunta="Subindo o nível de A, a partir de que deslocamento a o Brier de B fica menor?" opcoes={OPS} escolha={esc} onEscolha={escolher} recolher />
        {revelado ? <Controle rotulo="Nível de A: a, em log odds" valor={a} min={0} max={1.4} passo={0.1} onChange={setA} mostrar={`+${num(a, 1)}`} escala={["0: a logística", "+1,4"]} /> : null}
        <div className="q7-s25v3-acoes">
          {revelado && <Expandir resumo="Como se calcula">
            <Formula compacta f={String.raw`\mathrm{MCB}=\mathrm{BS}-\mathrm{BS}_{\mathrm{iso}},\quad \mathrm{DSC}=\mathrm{UNC}-\mathrm{BS}_{\mathrm{iso}}`} />
            <p className="q7-nota">BS<sub>iso</sub>: o Brier da isotônica, diagnóstico na amostra, não calibrador. Entre a logística e o boosting sem recalibrar, o Brier difere {num(CG.bs - CL.bs, 5)}; a separação explica {num(CL.dsc - CG.dsc, 5)} e a calibração {num(CG.mcb - CL.mcb, 5)}. Por faixas (Murphy, 1973), a soma não fecha.</p>
          </Expandir>}
          <Botao sec onClick={() => { setA(0); setEsc(null); }}>Restaurar</Botao>
        </div>
      </Painel>
    </Quadro>
  );
}
