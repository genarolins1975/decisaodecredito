"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, modelo, NV, VARIAVEIS, XA, XV, YA, YV } from "@/lib/capitulo6/dados";
import { contribuicoes, cortesDe, dependenciaParcialRapida, escore, estagios, importanciaGanho, perdaLog, sigmoide, type Modelo, type No, type Vetor } from "@/lib/capitulo6/gbm";
import { int, num, pct, sinal } from "@/lib/capitulo7/formato";

/**
 * 19 · c6p19 · Contribuições de Shapley de cada variável para a log odds de uma proposta da validação, no boosting da
 * carteira parado pela validação (o mesmo dos slides 17 e 18). contribuicoes() de gbm.ts usa a expectativa pelo
 * caminho das árvores e foi conferida com o shap.TreeExplainer em tests/capitulo6-gbm.test.ts; a soma valor esperado
 * + contribuições = escore é verificada na tela. A importância por ganho é a redução do erro quadrático do
 * pseudo-resíduo em cada corte, somada por variável e normalizada: a definição de feature_importances_ do
 * GradientBoostingClassifier; conferida fora da tela com o scikit-learn 1.9.1 (mesmos valores até 10⁻¹³) e calculada
 * aqui com os estágios da biblioteca. A proposta da previsão é escolhida por busca: aquela em que a variável que mais
 * move a log odds (em valor absoluto) não é a de maior ganho, com a maior folga entre a primeira e a segunda
 * contribuição; assim, quem responde pelo ganho erra. A alternativa certa é calculada. Quando a proposta exibida tem
 * utilização acima do último corte e contribuição negativa dela, uma nota mostra a queda da dependência parcial nesse
 * trecho (com quantas propostas de ajuste o sustentam) e leva ao slide 20.
 */
function calcular() {
  const M0 = modelo(CFG_CARTEIRA);
  const LL_V = estagios(M0, XV).map((F) => perdaLog(F, YV));
  const K_PARADA = LL_V.reduce((k, x, i) => (i >= 1 && x < LL_V[k] ? i : k), 1);
  const M = modelo({ ...CFG_CARTEIRA, arvores: K_PARADA });

  const GANHO = importanciaGanho(M, XA, YA);
  const usa = (no: No, v: number): boolean => !no.folha && (no.variavel === v || usa(no.esq, v) || usa(no.dir, v));
  const SEM_ATRASO = !M.arvores.some((a) => usa(a, 1));

  const ART0 = ["a utilização", "o atraso", "o score"], DE = ["da utilização", "do atraso", "do score"];
  const PDV = XV.map((x) => sigmoide(escore(M, x)));
  const idx = (f: (i: number) => number) => XV.reduce((b, _, i) => (f(i) > f(b) ? i : b), 0);
  // proposta da previsão, por busca: a variável que mais move a log odds dela (em valor absoluto) não é a de maior
  // ganho na carteira; entre essas, a de maior folga entre a primeira e a segunda contribuição; no empate, mais atraso
  const J_GANHO = GANHO.reduce((b, v, j) => (v > GANHO[b] ? j : b), 0);
  const PHI = XV.map((x) => contribuicoes(M, x).phi);
  const topo = (p: number[]) => p.reduce((b, v, j) => (Math.abs(v) > Math.abs(p[b]) ? j : b), 0);
  const folga = (p: number[]) => { const a = p.map(Math.abs).sort((u, v) => v - u); return a[0] - a[1]; };
  const N_RARO = PHI.filter((p) => topo(p) !== J_GANHO).length;
  const I_PREV = idx((i) => (topo(PHI[i]) !== J_GANHO ? folga(PHI[i]) * 1e3 + XV[i][1] * 1e-3 : -Infinity));
  const I_UTIL = idx((i) => (XV[i][1] >= 10 ? XV[i][0] : -1));
  const PROPOSTAS = [
    { r: "Caso da previsão", i: I_PREV },
    { r: "Utilização alta", i: I_UTIL },
    { r: "Maior PD", i: idx((i) => PDV[i]) },
    // desempate declarado: entre propostas com a mesma PD, a primeira na ordem da validação; "Menor PD" procura só
    // entre adimplentes e "Default, PD baixa" só entre defaults, para os cinco botões abrirem cinco propostas
    { r: "Menor PD", i: idx((i) => (YV[i] ? -Infinity : -PDV[i])) },
    { r: "Default, PD baixa", i: idx((i) => (YV[i] ? -PDV[i] : -Infinity)) },
  ];
  // quantas propostas empatam na PD de cada uma (a PD do boosting tem poucos valores distintos)
  const EMPATES = PROPOSTAS.map((p) => ({ todas: PDV.filter((v) => v === PDV[p.i]).length, defaults: PDV.filter((v, i) => v === PDV[p.i] && YV[i] === 1).length }));
  const C_PREV = contribuicoes(M, XV[I_PREV]);
  const J_MAX = topo(C_PREV.phi);
  const J_SEG = [0, 1, 2].filter((j) => j !== J_MAX).reduce((b, j) => (Math.abs(C_PREV.phi[j]) > Math.abs(C_PREV.phi[b]) ? j : b), J_MAX === 0 ? 1 : 0);
  const fmtV = (j: number, v: number) => (j === 0 ? `${num(v, 1)}%` : j === 1 ? `${int(v)} dias` : int(v));
  const fmtX = (x: Vetor) => `utilização de ${num(x[0], 1)}%, atraso de ${int(x[1])} dias e score ${int(x[2])}`;
  const OPS = [0, 1, 2].map((j) => ({
    texto: VARIAVEIS[j],
    certa: j === J_MAX,
    retorno: j === J_MAX ? <>{VARIAVEIS[j]}: {sinal(C_PREV.phi[j], 2)} na log odds, {num(Math.abs(C_PREV.phi[j] / C_PREV.phi[J_SEG]), 1)} vezes o que {ART0[J_SEG]} move. A carteira corta mais no {VARIAVEIS[J_GANHO].toLowerCase()}; esta proposta depende mais {DE[j]}.</>
      : j === 1 && SEM_ATRASO ? <>Confunde valor alarmante com contribuição: nenhuma das {K_PARADA} árvores corta no atraso, então {int(XV[I_PREV][1])} dias não movem esta PD nem nenhuma outra.</>
        : j === J_GANHO ? <>Confunde importância na carteira com peso na proposta: o ganho soma cortes em todas as propostas, sem sinal; o que conta aqui é onde caem os valores desta proposta, como {ART0[j]} de {fmtV(j, XV[I_PREV][j])}, nos cortes das árvores.</>
          : <>Confunde valor alarmante com contribuição: a contribuição mede o uso que o modelo faz do valor desta proposta, não o valor em si.</>,
  }));
  // utilização acima do último corte: a dependência parcial cai ali, num trecho com poucas propostas (ligação com o slide 20)
  const CORTE_U = Math.max(...cortesDe(M, 0));
  const [PD_ANTES, PD_DEPOIS] = dependenciaParcialRapida(M, XA, 0, [CORTE_U - 0.05, CORTE_U + 0.05]);
  const N_ACIMA = XA.filter((x) => Math.fround(x[0]) > CORTE_U).length;
  const ART = ART0;
  const LIM = { u: [0, 100], a: [0, 60], s: [600, 970] } as const;
  return { M0, LL_V, K_PARADA, M, GANHO, N_RARO, J_GANHO, DE, usa, SEM_ATRASO, PDV, idx, I_PREV, PROPOSTAS, EMPATES, C_PREV, J_MAX, fmtX, OPS, ART, LIM, CORTE_U, PD_ANTES, PD_DEPOIS, N_ACIMA };
}
let CACHE: ReturnType<typeof calcular> | null = null;
/** Cálculo preguiçoso: só o slide visitado paga o ajuste dos modelos (o registro importa todos os quadros). */
const dados = () => (CACHE ??= calcular());

function Cascata({ d, base, phi, ver }: { d: Dim; base: number; phi: number[]; ver: boolean }) {
  const fs = d.fs, m = { l: fs * 3.4, r: fs * 1, t: fs * 2.2, b: fs * 3.2 };
  const cum = [base]; phi.forEach((p) => cum.push(cum[cum.length - 1] + p));
  const fim = cum[3];
  const c0 = Math.min(...cum), c1 = Math.max(...cum), folga = Math.max(0.12, (c1 - c0) * 0.25);
  const lo = c0 - folga, hi = c1 + folga, passo = hi - lo > 2 ? 0.5 : hi - lo > 0.8 ? 0.2 : 0.1;
  const y = escala([lo, hi], [d.h - m.b, m.t]);
  const cols = ["Valor esperado", ...VARIAVEIS, "Escore"];
  const w = (d.w - m.l - m.r) / cols.length, bw = w * 0.56;
  const cx = (i: number) => m.l + w * (i + 0.5);
  const yt: number[] = []; for (let t = Math.ceil(lo / passo) * passo; t <= hi; t += passo) yt.push(Math.round(t * 10) / 10);
  return (
    <g>
      {yt.map((t) => <g key={t}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(t)} y2={y(t)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(t)} dy=".34em" textAnchor="end">{num(t, 1)}</text></g>)}
      <text className="q7-eixo-t" x={d.w < fs * 30 ? fs * 0.2 : m.l} y={m.t} dy="-.9em">{d.w < fs * 30 ? "Log odds (PD entre parênteses)" : "Log odds da proposta (PD entre parênteses)"}</text>
      <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={d.h - m.b} y2={d.h - m.b} />
      {cols.map((c, i) => <text key={c} className="q7-tick" x={cx(i)} y={d.h - m.b} dy="1.3em" textAnchor="middle" style={{ fontWeight: i === 0 || i === 4 ? 700 : 500 }}>{c}</text>)}
      <line x1={cx(0) - bw / 2} x2={cx(0) + bw / 2} y1={y(base)} y2={y(base)} stroke="#00205B" strokeWidth={4} />
      <text className="q7-rot--peq" x={cx(0)} y={y(base)} dy="1.4em" textAnchor="middle" style={{ fill: "#00205B" }}>{num(base, 2)} ({pct(sigmoide(base), 1)})</text>
      {phi.map((p, j) => {
        const a = cum[j], b = cum[j + 1], x0 = cx(j + 1) - bw / 2, sobe = p > 0, zero = Math.abs(p) < 1e-12;
        const top = y(Math.max(a, b)), alt = Math.max(2, Math.abs(y(a) - y(b)));
        return (
          <g key={j}>
            {ver && <line x1={cx(j) + bw / 2} x2={x0} y1={y(a)} y2={y(a)} stroke="#9AA1AD" strokeWidth={1.5} strokeDasharray="4 4" />}
            {!ver ? <><rect x={x0} y={y(base) - fs * 1.6} width={bw} height={fs * 3.2} fill="#FBFAF7" stroke="#C9CDD5" strokeDasharray="5 4" /><text className="q7-rot" x={cx(j + 1)} y={y(base)} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>?</text></>
              : zero ? <text className="q7-rot--peq" x={cx(j + 1)} y={y(a)} dy="-.6em" textAnchor="middle" style={{ fill: "#5B6475" }}>0,00: sem corte</text>
                : <>
                  <rect x={x0} y={top} width={bw} height={alt} fill={sobe ? "#176C73" : "#fff"} stroke="#176C73" strokeWidth={2.5} />
                  <text className="q7-rot" x={cx(j + 1)} y={sobe ? top : top + alt} dy={sobe ? "-.45em" : "1.15em"} textAnchor="middle" style={{ fill: "#176C73" }}>{sobe ? "▲" : "▼"} {sinal(p, 2)}</text>
                </>}
          </g>
        );
      })}
      {ver && <line x1={cx(3) + bw / 2} x2={cx(4) - bw / 2} y1={y(fim)} y2={y(fim)} stroke="#9AA1AD" strokeWidth={1.5} strokeDasharray="4 4" />}
      <circle cx={cx(4)} cy={y(fim)} r={fs * 0.5} fill="#176C73" stroke="#fff" strokeWidth={2.5} />
      <text className="q7-rot" x={cx(4)} y={y(fim)} dy={y(fim) - fs * 1.9 < 0 ? "1.7em" : "-.9em"} textAnchor="middle" style={{ fill: "#176C73" }}>{num(fim, 2)} ({pct(sigmoide(fim), 1)})</text>
    </g>
  );
}

export function S19Contribuicoes({ pagina }: { pagina?: Pagina }) {
  const { K_PARADA, M, GANHO, N_RARO, I_PREV, PROPOSTAS, EMPATES, fmtX, OPS, ART, LIM, CORTE_U, PD_ANTES, PD_DEPOIS, N_ACIMA } = dados();
  const [esc, setEsc] = useState<number | null>(null);
  const [ip, setIp] = useState(0);
  const [x, setX] = useState<number[]>([...XV[I_PREV]]);
  const revelado = esc !== null && OPS[esc].certa;
  const c = contribuicoes(M, x), f = escore(M, x), dif = Math.abs(c.base + c.phi.reduce((a, b) => a + b, 0) - f);
  const original = XV[PROPOSTAS[ip].i], editada = x.some((v, j) => v !== original[j]);
  const jm = c.phi.reduce((b, v, j) => (Math.abs(v) > Math.abs(c.phi[b]) ? j : b), 0);
  const jg = GANHO.reduce((b, v, j) => (v > GANHO[b] ? j : b), 0);
  const escolher = (i: number) => { setIp(i); setX([...XV[PROPOSTAS[i].i]]); };
  const mudar = (j: number, v: number) => setX(x.map((a, q) => (q === j ? v : a)));
  const restaurar = () => { setEsc(null); escolher(0); };
  return (
    <Quadro slug="c6p19" pagina={pagina} layout="gl"
      conclusao={!revelado
        ? <>Proposta da validação com {fmtX(XV[I_PREV])}: PD de {pct(sigmoide(escore(M, XV[I_PREV])), 1)}. A tabela traz o ganho de cada variável na carteira. Qual delas mais move esta PD? Preveja ao lado.</>
        : <>Valor esperado {num(c.base, 2)} {c.phi.map((p, j) => <span key={j}>{p < 0 ? "− " : "+ "}{num(Math.abs(p), 2)} ({VARIAVEIS[j].toLowerCase()}) </span>)}= <b>{num(f, 2)}</b>, PD de {pct(sigmoide(f), 1)}; {dif < 1e-12 ? "a soma fecha exatamente" : `diferença de ${num(dif, 12)}`}. {ip === 0 && !editada && esc !== null
          ? <><b>Sua previsão acertou</b>: {OPS[esc].retorno} Caso raro: {N_RARO} das {int(NV)} propostas.</>
          : <>O ganho põe {ART[jg]} em {pct(GANHO[jg], 0)} para a carteira, sem sinal; nesta proposta, pesa mais {ART[jm]}{!editada && ip >= 2 && EMPATES[ip].todas > 1 ? ` (${ip === 4 ? `um dos ${EMPATES[ip].defaults} defaults` : ip === 3 ? `uma das ${EMPATES[ip].todas - EMPATES[ip].defaults} adimplentes` : `uma das ${EMPATES[ip].todas} propostas`} com esta PD, a primeira na ordem da validação)` : ""}.</>} O <LinkSlide slug="c6p20">slide 20</LinkSlide> põe o atraso no modelo, na direção errada.</>}
      fonte={`Validação sorteada: ${int(NV)} propostas. Boosting parado em ${K_PARADA} árvores (taxa ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo de ${CFG_CARTEIRA.minFolha} por folha). Contribuições de Shapley pelo caminho das árvores, conferidas com o shap.TreeExplainer; ganho como no scikit-learn, nas ${int(XA.length)} propostas de ajuste.`}>
      <Painel titulo={`Da média do modelo à log odds da proposta${editada ? " (editada)" : ""}`}>
        <Grafico rotulo={`Cascata das contribuições: valor esperado ${num(c.base, 2)}; ${c.phi.map((p, j) => `${VARIAVEIS[j]} ${revelado ? sinal(p, 2) : "oculta"}`).join("; ")}; escore ${num(f, 2)}, PD ${pct(sigmoide(f), 1)}`} arCelular="5 / 4">
          {(d) => <Cascata d={d} base={c.base} phi={c.phi} ver={revelado} />}
        </Grafico>
      </Painel>
      <Painel>
        {!revelado && <Previsao rotulo="Antes de revelar" pergunta="Qual variável mais move esta PD, para cima ou para baixo?" opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />}
        {revelado && <>
          <p className="q7-k">Escolha ou edite a proposta</p>
          <div className="q7-botoes q6-s19-props" role="group" aria-label="Propostas da validação">{PROPOSTAS.map((p, i) => <button key={p.r} type="button" className="q7-btn" aria-pressed={ip === i && !editada} onClick={() => escolher(i)}>{p.r}</button>)}<Botao sec onClick={restaurar}>Restaurar</Botao></div>
          <div className="q6-s19-ctls"><Controle rotulo="Utilização" valor={x[0]} min={LIM.u[0]} max={LIM.u[1]} passo={0.1} onChange={(v) => mudar(0, v)} mostrar={`${num(x[0], 1)}%`} />
          <Controle rotulo="Atraso" valor={x[1]} min={LIM.a[0]} max={LIM.a[1]} passo={1} onChange={(v) => mudar(1, v)} mostrar={`${int(x[1])} dias`} />
          <Controle rotulo="Score" valor={x[2]} min={LIM.s[0]} max={LIM.s[1]} passo={0.1} onChange={(v) => mudar(2, v)} mostrar={num(x[2], 1)} /></div>
        </>}
        <table className="q7-tab q6-s19-tab">
          <thead><tr><th className="q7-t-l">Variável</th><th>Ganho, carteira</th><th>Contribuição, proposta</th></tr></thead>
          <tbody>{VARIAVEIS.map((v, j) => <tr key={v} data-on={revelado && j === jm ? "1" : undefined}><th>{v}</th><td>{pct(GANHO[j], 0)}</td><td>{revelado ? `${c.phi[j] > 0 ? "▲" : c.phi[j] < 0 ? "▼" : ""} ${sinal(c.phi[j], 2)}` : "?"}</td></tr>)}</tbody>
        </table>
        {revelado && (x[0] > CORTE_U && c.phi[0] < 0
          ? <p className="q7-nota">Utilização de {num(x[0], 1)}% baixa a PD: acima de {num(CORTE_U, 1)}%, a dependência parcial (PD média com a utilização fixada) cai de {pct(PD_ANTES, 2)} para {pct(PD_DEPOIS, 2)}, com {int(N_ACIMA)} das {int(XA.length)} propostas de ajuste. Sem lógica de crédito: o <LinkSlide slug="c6p20">slide 20</LinkSlide> a proíbe.</p>
          : <p className="q7-nota">Ganho: redução do erro quadrático dos pseudo-resíduos nos cortes que usam a variável, somada na carteira, normalizada e sem sinal (feature_importances_ do scikit{"\u2011"}learn).</p>)}
        {!revelado && <p className="q7-nota">Ganho: quanto os cortes na variável reduzem a perda, somado na carteira e sem sinal.</p>}
      </Painel>
    </Quadro>
  );
}
