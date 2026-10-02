"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, modelo, NV, VARIAVEIS, XA, XV, YA, YV } from "@/lib/capitulo6/dados";
import { contribuicoes, escore, estagios, importanciaGanho, perdaLog, sigmoide, type Modelo, type No, type Vetor } from "@/lib/capitulo6/gbm";
import { int, num, pct, sinal } from "@/lib/capitulo7/formato";

/**
 * 19 · c6p19 · Contribuições de Shapley de cada variável para a log odds de uma proposta da validação, no boosting da
 * carteira parado pela validação (o mesmo dos slides 17 e 18). contribuicoes() de gbm.ts usa a expectativa pelo
 * caminho das árvores e foi conferida com o shap.TreeExplainer em tests/capitulo6-gbm.test.ts; a soma valor esperado
 * + contribuições = escore é verificada na tela. A importância por ganho é a redução do erro quadrático do
 * pseudo-resíduo em cada corte, somada por variável e normalizada: a definição de feature_importances_ do
 * GradientBoostingClassifier; conferida fora da tela com o scikit-learn 1.9.1 (mesmos valores até 10⁻¹³) e calculada
 * aqui com os estágios da biblioteca. A proposta da previsão é escolhida por regra (a de maior utilização entre as que
 * têm 10 dias de atraso ou mais); a alternativa certa é a de maior contribuição positiva, calculada.
 */
function calcular() {
  const M0 = modelo(CFG_CARTEIRA);
  const LL_V = estagios(M0, XV).map((F) => perdaLog(F, YV));
  const K_PARADA = LL_V.reduce((k, x, i) => (i >= 1 && x < LL_V[k] ? i : k), 1);
  const M = modelo({ ...CFG_CARTEIRA, arvores: K_PARADA });

  const GANHO = importanciaGanho(M, XA, YA);
  const usa = (no: No, v: number): boolean => !no.folha && (no.variavel === v || usa(no.esq, v) || usa(no.dir, v));
  const SEM_ATRASO = !M.arvores.some((a) => usa(a, 1));

  const PDV = XV.map((x) => sigmoide(escore(M, x)));
  const idx = (f: (i: number) => number) => XV.reduce((b, _, i) => (f(i) > f(b) ? i : b), 0);
  const I_PREV = idx((i) => (XV[i][1] >= 10 ? XV[i][0] : -1));
  const PROPOSTAS = [
    { r: "Utilização alta", i: I_PREV },
    { r: "Maior PD", i: idx((i) => PDV[i]) },
    { r: "Menor PD", i: idx((i) => -PDV[i]) },
    { r: "Default, PD baixa", i: idx((i) => (YV[i] ? -PDV[i] : -Infinity)) },
  ];
  const C_PREV = contribuicoes(M, XV[I_PREV]);
  const J_MAX = C_PREV.phi.reduce((b, v, j) => (v > C_PREV.phi[b] ? j : b), 0);
  const fmtX = (x: Vetor) => `utilização de ${num(x[0], 1)}%, atraso de ${int(x[1])} dias e score ${int(x[2])}`;
  const OPS = [0, 1, 2].map((j) => ({
    texto: VARIAVEIS[j],
    certa: j === J_MAX,
    retorno: j === J_MAX ? <>Isso: {sinal(C_PREV.phi[j], 2)} na log odds, mais que as outras duas somadas ({sinal(C_PREV.phi.reduce((s, v, q) => s + (q === j ? 0 : v), 0), 2)}).</>
      : j === 1 && SEM_ATRASO ? <>Nenhuma das {K_PARADA} árvores corta no atraso: a contribuição dele é zero em toda proposta, e o ganho também.</>
        : <>Confunde valor alarmante com contribuição: a {VARIAVEIS[j].toLowerCase()} desta proposta soma {sinal(C_PREV.phi[j], 2)} na log odds. A contribuição mede o uso que o modelo faz do valor.</>,
  }));
  const ART = ["a utilização", "o atraso", "o score"];
  const LIM = { u: [0, 100], a: [0, 60], s: [600, 970] } as const;
  return { M0, LL_V, K_PARADA, M, GANHO, usa, SEM_ATRASO, PDV, idx, I_PREV, PROPOSTAS, C_PREV, J_MAX, fmtX, OPS, ART, LIM };
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
      <text className="q7-eixo-t" x={m.l} y={m.t} dy="-.9em">Log odds da proposta (PD entre parênteses)</text>
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
      <text className="q7-rot" x={cx(4)} y={y(fim)} dy="-.9em" textAnchor="middle" style={{ fill: "#176C73" }}>{num(fim, 2)} ({pct(sigmoide(fim), 1)})</text>
    </g>
  );
}

export function S19Contribuicoes({ pagina }: { pagina?: Pagina }) {
  const { K_PARADA, M, GANHO, I_PREV, PROPOSTAS, fmtX, OPS, ART, LIM } = dados();
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
        ? <>Proposta da validação com {fmtX(XV[I_PREV])}: PD de {pct(sigmoide(escore(M, XV[I_PREV])), 1)}. Qual variável mais empurra essa PD para cima? Preveja ao lado.</>
        : <>Valor esperado {num(c.base, 2)} {c.phi.map((p, j) => <span key={j}>{p < 0 ? "− " : "+ "}{num(Math.abs(p), 2)} ({VARIAVEIS[j].toLowerCase()}) </span>)}= <b>{num(f, 2)}</b>, PD de {pct(sigmoide(f), 1)}; {dif < 1e-12 ? "a soma fecha exatamente" : `diferença de ${num(dif, 12)}`}. O ganho põe {ART[jg]} em {pct(GANHO[jg], 0)} para a carteira, sem sinal; nesta proposta, pesa mais {ART[jm]}. O <LinkSlide slug="c6p20">slide 20</LinkSlide> mostra o atraso entrando no modelo, e na direção errada.</>}
      fonte={`Validação sorteada: ${int(NV)} propostas. Boosting parado em ${K_PARADA} árvores (taxa 0,1, profundidade 2, mínimo de 40 por folha). Contribuições de Shapley pelo caminho das árvores, conferidas com o shap.TreeExplainer; ganho como no scikit-learn, nas ${int(XA.length)} propostas de ajuste.`}>
      <Painel titulo={`Da média do modelo à log odds da proposta${editada ? " (editada)" : ""}`}>
        <Grafico rotulo={`Cascata das contribuições: valor esperado ${num(c.base, 2)}; ${c.phi.map((p, j) => `${VARIAVEIS[j]} ${revelado ? sinal(p, 2) : "oculta"}`).join("; ")}; escore ${num(f, 2)}, PD ${pct(sigmoide(f), 1)}`} arCelular="5 / 4">
          {(d) => <Cascata d={d} base={c.base} phi={c.phi} ver={revelado} />}
        </Grafico>
      </Painel>
      <Painel>
        {!revelado && <Previsao rotulo="Antes de revelar" pergunta={`Com ${fmtX(XV[I_PREV])}, qual variável mais empurra a PD para cima?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} />}
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
        {revelado && <p className="q7-nota">Ganho: redução da perda no ajuste, somada na carteira, sem sinal. Contribuição: quanto o valor desta proposta move a log odds, com sinal. A sigmoide do valor esperado não é a PD média.</p>}
      </Painel>
    </Quadro>
  );
}
