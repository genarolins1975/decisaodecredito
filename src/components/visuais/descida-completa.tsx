"use client";
import { useMemo, useState } from "react";
import did from "@/lib/visuais/did.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { BETA_AULA, distanciaAoOtimo, escore, passo, perdaIndividual, perdaLog, sigmoide, trajetoria, type Proposta } from "@/lib/visuais/logistica";
import { SemCaixaAlta } from "./sem-caixa-alta";
import { Formula } from "./tex";

/**
 * De onde vêm os coeficientes (capítulo 4, páginas 15 a 17). A perda logarítmica por proposta com os coeficientes da
 * aula; uma iteração do gradiente com todas as contas na tela; e a descida completa até 20.000 iterações, com a
 * perda e as três trajetórias. Reproduz os números do gerador (perda 0,693147 → 0,432824).
 */
export type ModoDescida = "perda" | "gradiente" | "descida";
const BASE = did.base as Proposta[];
const N_MAX = 20000;
const TRAJ = trajetoria(BASE, N_MAX);
const AMOSTRA = (() => { const s = new Set<number>(); for (let i = 0; i <= 10; i++) s.add(i); for (let e = 1; e <= 4.31; e += 0.025) s.add(Math.min(N_MAX, Math.round(10 ** e))); s.add(N_MAX); return [...s].sort((a, b) => a - b); })();
const W = 640, H = 250, ML = 50, MR = 14, MT = 16, MB = 36;
const lx = (it: number) => ML + (Math.log10(it + 1) / Math.log10(N_MAX + 1)) * (W - ML - MR);
const NOMES = ["β₀ intercepto", "β₁ utilização", "β₂ atraso"];

export function DescidaCompleta({ modo }: { modo: ModoDescida }) {
  if (modo === "perda") return <Perda />;
  if (modo === "gradiente") return <Gradiente />;
  return <Descida />;
}

/* Página c4p15: a perda de cada proposta com os coeficientes da aula. */
function Perda() {
  const [sel, setSel] = useState(2);
  const linhas = useMemo(() => BASE.map((b) => { const p = sigmoide(escore(BETA_AULA, b.util, b.atraso).z); return { ...b, p, perda: perdaIndividual(p, b.y) }; }), []);
  const media = perdaLog(BETA_AULA, BASE); const q = linhas[sel - 1];
  const porque = q.y === 1 && q.p < 0.5 ? "deu default, mas recebeu PD baixa. A perda pune previsões confiantes do lado errado." : q.y === 0 && q.p > 0.5 ? "pagou, mas recebeu PD alta. Previsão confiante do lado errado custa caro." : q.perda < 0.1 ? "previsão confiante do lado certo. Quase não custa." : "previsão do lado certo, mas sem convicção. Custa pouco.";
  const BH = 190, BML = 44, BMT = 10, BMB = 30, bx = (i: number) => BML + i * ((W - BML - 10) / 16), bw = (W - BML - 10) / 16 - 6, by = (v: number) => BMT + (1 - Math.min(1.5, v) / 1.5) * (BH - BMT - BMB);
  return (
    <figure className="vz" data-vz="descida-perda">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">De onde vêm os coeficientes · a perda do capítulo 2, agora com três parâmetros · 16 propostas</p>
          <p className="vz-tit">Os coeficientes não são escolhidos nem lidos em tabela. São o trio que minimiza a log loss na amostra.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Propostas de exemplo">
          {[2, 10, 15].map((i) => <button key={i} type="button" className={`btn btn-sm ${sel === i ? "" : "btn-secondary"}`} onClick={() => setSel(i)}>#{i}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>Proposta #{q.id}, utilização {q.util}% e atraso {q.atraso} d:</b> y = {q.y}, PD estimada {fmtPct(q.p, 2)}, perda {fmtNum(q.perda, 4)}. Por que custa: {porque} Média das 16: {fmtNum(media, 5)}, o mínimo nesta amostra.</div>
      <div className="vz-dc-grade">
        <div className="vz-dc-painel">
          <Formula f={String.raw`\text{perda}(\beta_0,\beta_1,\beta_2) = -\,\text{média}\big[\,y\ln p + (1-y)\ln(1-p)\,\big] \quad \text{com} \quad p = \sigma\big(\beta_0 + \beta_1\,\tfrac{u}{10} + \beta_2\,\tfrac{a}{10}\big)`} />
          <div className="vz-grafico">
            <p className="vz-grafico-t">Perda individual por proposta <span className="hint">linha: a média 0,43282 · clique numa barra</span></p>
            <svg viewBox={`0 0 ${W} ${BH}`} role="img" aria-label={`Perda por proposta; a maior é a #15 com ${fmtNum(linhas[14].perda, 4)}`}>
              {[0, 0.5, 1, 1.5].map((v) => <g key={v}><line x1={BML} x2={W - 10} y1={by(v)} y2={by(v)} className="vz-grade" /><text x={BML - 6} y={by(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 1)}</text></g>)}
              {linhas.map((l, i) => <g key={l.id} onClick={() => setSel(l.id)} className="vz-dc-barra-g" role="button" aria-label={`Proposta ${l.id}, perda ${fmtNum(l.perda, 4)}`} tabIndex={-1}>
                <rect x={bx(i)} y={by(l.perda)} width={bw} height={by(0) - by(l.perda)} rx={3} className={`vz-dc-barra ${l.y ? "vz-dc-barra--default" : "vz-dc-barra--pagou"} ${l.id === sel ? "vz-dc-barra--sel" : ""}`} />
                <text x={bx(i) + bw / 2} y={BH - MB + 22} textAnchor="middle" className={`vz-tick ${l.id === sel ? "vz-tick--forte" : ""}`}>#{l.id}</text>
                {l.perda > 1 && <text x={bx(i) + bw / 2} y={by(l.perda) - 5} textAnchor="middle" className="vz-tick vz-tick--forte">{fmtNum(l.perda, 2)}</text>}
              </g>)}
              <line x1={BML} x2={W - 10} y1={by(media)} y2={by(media)} className="vz-esperado" />
              <text x={W - 12} y={by(media) - 5} textAnchor="end" className="vz-ks-t">média {fmtNum(media, 5)}</text>
            </svg>
          </div>
          <div className="vz-tiles vz-tiles--3">
            <div className="vz-tile"><p className="eyebrow">desfecho y</p><p className={`vz-num ${q.y ? "vz-num--default" : ""}`}>{q.y}</p></div>
            <div className="vz-tile"><p className="eyebrow">PD estimada</p><p className="vz-num">{fmtPct(q.p, 2)}</p></div>
            <div className="vz-tile"><p className="eyebrow">perda da #{q.id}</p><p className="vz-num">{fmtNum(q.perda, 4)}</p></div>
          </div>
        </div>
        <div className="vz-dc-lado">
          <div className="table-wrap vz-dc-tabela"><table className="table text-[.85em]"><thead><tr><th>#</th><th>Util.</th><th>Atraso</th><th>y</th><th>p</th><th>perda</th></tr></thead><tbody>
            {linhas.map((l) => <tr key={l.id} className={`${l.id === sel ? "vz-t-on" : ""} ${l.perda > 1 ? "vz-t-cara" : ""}`}><th scope="row">#{l.id}</th><td>{l.util}%</td><td>{l.atraso} d</td><td className={l.y ? "vz-t-default" : "vz-t-ok"}>{l.y}</td><td>{fmtPct(l.p, 2)}</td><td className={l.perda > 1 ? "vz-t-forte" : ""}>{fmtNum(l.perda, 4)}</td></tr>)}
            <tr className="vz-t-on"><th scope="row">Média</th><td /><td /><td /><td /><td className="vz-t-forte">{fmtNum(media, 5)}</td></tr>
          </tbody></table></div>
          <div className="vz-tile"><p className="eyebrow">As duas propostas caras</p><p className="vz-num vz-num--texto">A #2 e a #15 concentram a perda. São as que contrariam o padrão: a #2 deu default com utilização de 25%, a #15 tem utilização de 90% e não deu. Mínimo nesta amostra: {fmtNum(media, 5)}. Isso é ajuste, não prova de generalização.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Coeficientes da aula β = (−5,6666; 0,7453; 1,3955), utilização em dezenas de pontos e atraso em dezenas de dias. #2: z −1,012, PD 26,65%, perda 1,3223; #15: PD 73,91%, perda 1,3435; #12: PD 99,60%, perda 0,0041. A média 0,43282 é o menor valor que estes três parâmetros conseguem nesta amostra.</p>
    </figure>
  );
}

/* Página c4p16: uma iteração de cada vez, com todas as contas. */
function Gradiente() {
  const [it, setIt] = useState(0);
  const beta = TRAJ.beta[Math.min(it, N_MAX)];
  const st = useMemo(() => passo(beta, BASE), [beta]);
  const contrib = BASE.map((b, i) => ({ id: b.id, u: b.util / 10, p: st.p[i], y: b.y, r: st.p[i] - b.y, c: (st.p[i] - b.y) * (b.util / 10) }));
  const CH = 200, CML = 44, CMT = 10, CMB = 26, cxb = (i: number) => CML + i * ((W - CML - 10) / 16), cw = (W - CML - 10) / 16 - 6, cyb = (v: number) => CMT + (1 - (v + 5) / 10) * (CH - CMT - CMB);
  const sinal = (v: number) => (v >= 0 ? "+" : "−") + fmtNum(Math.abs(v), 5);
  return (
    <figure className="vz" data-vz="descida-gradiente">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O gradiente com três parâmetros · uma iteração de cada vez · passo 0,10</p>
          <p className="vz-tit">Cada componente é a média de (p − y) vezes a variável correspondente. Os três parâmetros se movem juntos.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => setIt((v) => Math.min(N_MAX, v + 1))}>Executar uma iteração</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIt(0)}>Voltar ao início</button>
        </div>
      </header>
      <div className="vz-estado"><b>Iteração {it}, perda {fmtNum(st.perda, 5)}, distância até o ótimo {fmtNum(distanciaAoOtimo(beta), 3)}:</b> gradiente ({sinal(st.g[0])}; {sinal(st.g[1])}; {sinal(st.g[2])}). Componente negativa significa que aumentar aquele parâmetro reduziria a perda, então o parâmetro sobe.</div>
      <div className="vz-dc-grade">
        <div className="vz-dc-painel">
          <Formula f={String.raw`g_0 = \text{média}(p-y) \qquad g_1 = \text{média}\big[(p-y)\,\tfrac{u}{10}\big] \qquad g_2 = \text{média}\big[(p-y)\,\tfrac{a}{10}\big] \qquad \beta \leftarrow \beta - 0{,}10\,g`} />
          <div className="vz-tiles vz-tiles--3">
            <div className="vz-tile"><p className="eyebrow">Iteração</p><p className="vz-num">{it.toLocaleString("pt-BR")}</p></div>
            <div className="vz-tile"><p className="eyebrow">Perda atual</p><p className="vz-num">{fmtNum(st.perda, 5)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Distância até o ótimo</p><p className="vz-num vz-num--odds">{fmtNum(distanciaAoOtimo(beta), 3)}</p></div>
          </div>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Parâmetro</th><th>Valor atual</th><th>Componente do gradiente</th><th>Passo × gradiente</th><th>Valor seguinte</th></tr></thead><tbody>
            {NOMES.map((n, i) => <tr key={n}><th scope="row"><SemCaixaAlta>{n}</SemCaixaAlta></th><td>{fmtNum(beta[i], 5)}</td><td className={st.g[i] > 0 ? "vz-t-default" : "vz-t-ok"}>{sinal(st.g[i])}</td><td>{sinal(-0.1 * st.g[i])}</td><td className="vz-t-forte">{fmtNum(st.novo[i], 5)}</td></tr>)}
          </tbody></table></div>
          <p className="hint">Os três se movem na mesma iteração, e é por isso que o efeito de cada um não pode ser avaliado isoladamente durante o ajuste.</p>
        </div>
        <div className="vz-dc-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Contribuição de cada proposta para g₁ <span className="hint">(p − y) × u/10 · a média é g₁ = {fmtNum(st.g[1], 5)}</span></p>
            <svg viewBox={`0 0 ${W} ${CH}`} role="img" aria-label={`Contribuições para g1; média ${fmtNum(st.g[1], 5)}`}>
              {[-5, -2.5, 0, 2.5, 5].map((v) => <g key={v}><line x1={CML} x2={W - 10} y1={cyb(v)} y2={cyb(v)} className={v === 0 ? "vz-zero" : "vz-grade"} /><text x={CML - 6} y={cyb(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 1)}</text></g>)}
              {contrib.map((c, i) => <g key={c.id}><rect x={cxb(i)} y={Math.min(cyb(0), cyb(c.c))} width={cw} height={Math.abs(cyb(0) - cyb(c.c))} rx={2} className={`vz-dc-barra ${c.r > 0 ? "vz-dc-barra--pagou" : "vz-dc-barra--default"}`} /><text x={cxb(i) + cw / 2} y={CH - 8} textAnchor="middle" className="vz-tick">#{c.id}</text></g>)}
              <line x1={CML} x2={W - 10} y1={cyb(st.g[1])} y2={cyb(st.g[1])} className="vz-esperado" />
              <text x={W - 12} y={cyb(st.g[1]) - 5} textAnchor="end" className="vz-ks-t">média {fmtNum(st.g[1], 5)}</text>
            </svg>
          </div>
          <div className="table-wrap vz-dc-tabela"><table className="table text-[.8em]"><thead><tr><th>#</th><th>u/10</th><th>p</th><th>y</th><th>p − y</th><th>(p − y) × u/10</th></tr></thead><tbody>
            {contrib.map((c) => <tr key={c.id}><th scope="row">{c.id}</th><td>{fmtNum(c.u, 1)}</td><td>{fmtPct(c.p, 1)}</td><td>{c.y}</td><td className={c.r > 0 ? "vz-t-default" : "vz-t-ok"}>{fmtNum(c.r, 4)}</td><td>{fmtNum(c.c, 4)}</td></tr>)}
            <tr className="vz-t-on"><th scope="row">média</th><td /><td /><td /><td /><td className="vz-t-forte">{fmtNum(st.g[1], 5)}</td></tr>
          </tbody></table></div>
          <p className="hint">A coluna p − y é o resíduo. Guarde esse nome: no capítulo 6 ele deixa de alimentar um gradiente e passa a alimentar uma árvore.</p>
        </div>
      </div>
      <p className="vz-fonte">Em β = 0 toda proposta recebe p = 50%, a perda é ln 2 = 0,69315 e a distância até o ótimo é 5,883. Gradiente (+0,00000; −0,59375; −0,23438); com passo 0,10, β passa a (0; 0,05938; 0,02344). Uma iteração por clique não chega a 20.000: o procedimento precisa rodar sozinho, na próxima página.</p>
    </figure>
  );
}

/* Página c4p17: a descida completa, em blocos. */
function Descida() {
  const [it, setIt] = useState(0);
  const beta = TRAJ.beta[it], perda = TRAJ.perda[it], minimo = TRAJ.perda[N_MAX];
  const pontos = AMOSTRA.filter((k) => k <= it);
  const ly = (v: number) => MT + (1 - (v - 0.42) / 0.3) * (H - MT - MB), cy = (v: number) => MT + (1 - (v + 6) / 8) * (H - MT - MB);
  const nota = it === 0 ? "Nenhuma iteração executada. Todos os coeficientes valem zero, o que significa PD de 50% para todas as propostas."
    : it < 1000 ? "Os coeficientes ainda estão longe. Note que a perda já caiu bastante: o começo da descida rende mais do que o fim."
    : it < 15000 ? "A perda praticamente parou de cair, mas os coeficientes ainda se movem na terceira casa. Parar cedo demais produz um modelo com previsões quase iguais e coeficientes errados."
    : "Convergido. Estes são os coeficientes usados em todas as páginas anteriores deste capítulo.";
  const caminho = (f: (k: number) => number) => pontos.map((k, i) => `${i ? "L" : "M"}${lx(k).toFixed(1)} ${f(k).toFixed(1)}`).join("");
  return (
    <figure className="vz" data-vz="descida-completa">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A descida completa · a mesma regra, 20.000 vezes · passo 0,10 a partir de zero</p>
          <p className="vz-tit">Avance em blocos. A perda cai de forma monótona e estabiliza; os coeficientes ainda andam depois disso.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Avançar iterações">
          {[1, 10, 100, 1000, 10000].map((k) => <button key={k} type="button" className={`btn btn-sm ${k === 1 ? "btn-secondary" : ""}`} disabled={it >= N_MAX} onClick={() => setIt((v) => Math.min(N_MAX, v + k))}>+{k.toLocaleString("pt-BR")}</button>)}
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIt(0)}>Zerar</button>
        </div>
      </header>
      <div className="vz-estado"><b>Iterações {it.toLocaleString("pt-BR")}:</b> perda {fmtNum(perda, 6)} (mínimo atingível {fmtNum(minimo, 6)}); β = ({fmtNum(beta[0], 5)}; {fmtNum(beta[1], 5)}; {fmtNum(beta[2], 5)}). {nota}</div>
      <div className="vz-dc-grade">
        <div className="vz-dc-painel">
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">Iterações executadas</p><p className="vz-num">{it.toLocaleString("pt-BR")}</p></div>
            <div className="vz-tile"><p className="eyebrow">Perda</p><p className="vz-num">{fmtNum(perda, 6)}</p><p className="hint">mínimo atingível: {fmtNum(minimo, 6)}</p></div>
          </div>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Parâmetro</th><th>Valor agora</th><th>Valor de convergência</th><th>Falta</th></tr></thead><tbody>
            {NOMES.map((n, i) => <tr key={n}><th scope="row"><SemCaixaAlta>{n.split(" ")[0]}</SemCaixaAlta></th><td className="vz-t-forte">{fmtNum(beta[i], 5)}</td><td>{fmtNum(BETA_AULA[i], 5)}</td><td className={Math.abs(beta[i] - BETA_AULA[i]) < 0.001 ? "vz-t-ok" : ""}>{fmtNum(BETA_AULA[i] - beta[i], 5)}</td></tr>)}
          </tbody></table></div>
          <p className="hint">{nota}</p>
        </div>
        <div className="vz-dc-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Log loss por iterações <span className="hint">escala logarítmica</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Perda ${fmtNum(perda, 6)} após ${it} iterações`}>
              {[0.42, 0.5, 0.58, 0.65, 0.72].map((v) => <g key={v}><line x1={lx(0)} x2={W - MR} y1={ly(v)} y2={ly(v)} className="vz-grade" /><text x={ML - 6} y={ly(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 2)}</text></g>)}
              {[0, 1, 2, 3, 4].map((e) => <text key={e} x={lx(e === 0 ? 0 : 10 ** e - 1)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{e === 0 ? "0" : `10^${e}`}</text>)}
              <text x={(lx(0) + W - MR) / 2} y={H - 6} textAnchor="middle" className="vz-rotulo">iterações, em escala logarítmica</text>
              <line x1={lx(0)} x2={W - MR} y1={ly(minimo)} y2={ly(minimo)} className="vz-esperado" />
              <text x={W - MR - 2} y={ly(minimo) - 5} textAnchor="end" className="vz-ks-t">mínimo {fmtNum(minimo, 6)}</text>
              <path d={caminho((k) => ly(TRAJ.perda[k]))} className="vz-curva" />
              <g className="vz-regua-ponto" style={{ transform: `translate(${lx(it)}px, ${ly(perda)}px)` }}><circle r={6} /><text x={it > 3000 ? -10 : 10} y={-9} textAnchor={it > 3000 ? "end" : "start"} className="vz-ponto-t">agora {fmtNum(perda, 4)}</text></g>
            </svg>
          </div>
          <div className="vz-grafico">
            <p className="vz-grafico-t">Valor de cada coeficiente <span className="hint">as três trajetórias, para os valores de convergência</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Coeficientes após ${it} iterações: ${beta.map((v) => fmtNum(v, 3)).join(", ")}`}>
              {[-6, -4, -2, 0, 2].map((v) => <g key={v}><line x1={lx(0)} x2={W - MR} y1={cy(v)} y2={cy(v)} className={v === 0 ? "vz-zero" : "vz-grade"} /><text x={ML - 6} y={cy(v) + 4} textAnchor="end" className="vz-tick">{v}</text></g>)}
              {[0, 1, 2, 3, 4].map((e) => <text key={e} x={lx(e === 0 ? 0 : 10 ** e - 1)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{e === 0 ? "0" : `10^${e}`}</text>)}
              <text x={(lx(0) + W - MR) / 2} y={H - 6} textAnchor="middle" className="vz-rotulo">iterações, em escala logarítmica</text>
              {[0, 1, 2].map((i) => <g key={i}><line x1={lx(0)} x2={W - MR} y1={cy(BETA_AULA[i])} y2={cy(BETA_AULA[i])} className="vz-corte-linha" opacity={0.5} /><path d={caminho((k) => cy(TRAJ.beta[k][i]))} className={`vz-curva vz-dc-coef vz-dc-coef--${i}`} /><text x={W - MR - 2} y={cy(BETA_AULA[i]) - 5} textAnchor="end" className={`vz-tick vz-tick--forte vz-dc-coef-t--${i}`}>{NOMES[i]} → {fmtNum(BETA_AULA[i], 4)}</text></g>)}
            </svg>
          </div>
        </div>
      </div>
      <p className="vz-fonte">Perda 0,693147 em zero, 0,580716 em 100, 0,445906 em 1.000, 0,432824 em 10.000 e 20.000 iterações. Em 10.000, β = (−5,66246; 0,74477; 1,39439); em 20.000, (−5,66657; 0,74530; 1,39550), os valores usados nas páginas 8 a 14. Um número que aparece na tela não é evidência: ele precisa ser conferido.</p>
    </figure>
  );
}
