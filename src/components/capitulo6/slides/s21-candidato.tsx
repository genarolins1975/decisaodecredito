"use client";
import { useState } from "react";
import { Botao, escala, Grafico, LinkSlide, Painel, Quadro, Seg, type Dim, type Pagina } from "@/components/capitulo7/base";
import { GRID, HP_CANDIDATO, RES } from "@/lib/capitulo6/dados";
import { wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 21 · c6p21 · O fecho: o candidato do comitê é o boosting completo do gerador do curso, com sete variáveis, e a lista
 * que o validador independente confere usa os números dele, na validação temporal do gerador (760 propostas, safras
 * 2023-03 a 2023-07; RES de dados.ts): AUC contra a logística de sete variáveis nas mesmas propostas, PD média contra a
 * taxa observada com o intervalo de Wilson (defaults = taxa × n, inteiro). Cada item tem um estado calculado ou
 * declarado: cumprido, não cumprido ou a provar (monotonia e explicação não se verificam no candidato porque o gerador
 * não publica as árvores; a janela fora do tempo fica congelada para o capítulo 7). As provas de método dos slides 15 a
 * 20 vêm da validação sorteada, com três variáveis, e são as ligações de cada item.
 * A escolha de hiperparâmetros fica separada, à direita: a grade (GRID) mostra a AUC de treino e esconde a de
 * validação até o envio; a regra certa (maior AUC de validação) é calculada e confere com HP_CANDIDATO. O ótimo cai na
 * borda da grade (o menor número de árvores testado): item a provar. A diferença para a célula seguinte é comparada com
 * o erro padrão aproximado de uma AUC (Hanley e McNeil, 1982), calculado aqui com os defaults e adimplentes da amostra.
 */
type G = (typeof GRID)[number];
const ARVS = [...new Set(GRID.map((g) => g.max_iter))].sort((a, b) => a - b);
const FOLHAS = [...new Set(GRID.map((g) => g.max_leaf_nodes))].sort((a, b) => a - b);
const cel = (a: number, f: number) => GRID.find((g) => g.max_iter === a && g.max_leaf_nodes === f)!;
const ORD_V = [...GRID].sort((a, b) => b.auc_val - a.auc_val);
const BEST = ORD_V[0], SEGUNDA = ORD_V[1];
const TOP_T = GRID.reduce((b, g) => (g.auc_treino > b.auc_treino ? g : b), GRID[0]);
const CONFERE = BEST.max_iter === HP_CANDIDATO.max_iter && BEST.max_leaf_nodes === HP_CANDIDATO.max_leaf_nodes && BEST.auc_val === HP_CANDIDATO.auc_val;
const NA_BORDA = BEST.max_iter === ARVS[0];
const META = base.meta;
const NV = META.n_val, DV = Math.round(RES.gbm_val.obs * NV), AV = NV - DV;
const TAXA = wilson(DV, NV)!;
const NIVEL_OK = RES.gbm_val.pd_media >= TAXA.lo && RES.gbm_val.pd_media <= TAXA.hi;
/** Erro padrão aproximado de uma AUC (Hanley e McNeil, 1982), com os defaults e adimplentes da validação temporal. */
const epAuc = (A: number) => { const q1 = A / (2 - A), q2 = (2 * A * A) / (1 + A); return Math.sqrt((A * (1 - A) + (DV - 1) * (q1 - A * A) + (AV - 1) * (q2 - A * A)) / (DV * AV)); };
const EP = epAuc(BEST.auc_val), DIF2 = BEST.auc_val - SEGUNDA.auc_val;
const DIF_LOG = RES.gbm_val.auc - RES.logit_val.auc;
const EMPATA = Math.abs(DIF_LOG) < 1.96 * EP;

type Estado = "ok" | "nao" | "provar";
const SELO: Record<Estado, { s: string; r: string }> = { ok: { s: "✓", r: "cumprido" }, nao: { s: "✗", r: "não cumprido" }, provar: { s: "?", r: "a provar" } };

function Mapa({ d, sel, ver }: { d: Dim; sel: G; ver: boolean }) {
  const fs = d.fs, esq = fs * 4.6, topo = fs * 1.6, baixo = fs * 0.4;
  const cw = (d.w - esq) / ARVS.length, ch = (d.h - topo - baixo) / FOLHAS.length;
  const tV = escala([ORD_V[ORD_V.length - 1].auc_val, BEST.auc_val], [0, 1]);
  return (
    <g>
      <text className="q7-tick" x={esq - fs * 0.4} y={topo} dy="-.45em" textAnchor="end">árvores</text>
      {ARVS.map((a, i) => <text key={a} className="q7-tick" x={esq + cw * (i + 0.5)} y={topo} dy="-.45em" textAnchor="middle">{a}</text>)}
      {FOLHAS.map((f, j) => <text key={f} className="q7-tick" x={esq - fs * 0.4} y={topo + ch * (j + 0.5)} dy=".35em" textAnchor="end">{f} folhas</text>)}
      {FOLHAS.map((f, j) => ARVS.map((a, i) => {
        const g = cel(a, f), on = g === sel, x = esq + cw * i, y = topo + ch * j, escuro = ver && tV(g.auc_val) > 0.6;
        return (
          <g key={`${a}-${f}`}>
            <rect x={x + 2} y={y + 2} width={cw - 4} height={ch - 4} rx={6} fill={ver ? `rgba(46,107,79,${0.1 + 0.75 * tV(g.auc_val)})` : "#FBFAF7"} stroke={on ? "#00205B" : "#C9CDD5"} strokeWidth={on ? 4 : 1.2} strokeDasharray={!on && !ver ? "5 4" : undefined} />
            <text className="q7-rot" x={x + cw / 2} y={y + ch / 2} dy="-.15em" textAnchor="middle" style={{ fill: escuro ? "#fff" : ver ? "#1F5A40" : "#5B6475" }}>{ver ? num(g.auc_val, 4) : "?"}</text>
            <text className="q7-rot--peq" x={x + cw / 2} y={y + ch / 2} dy="1.25em" textAnchor="middle" style={{ fill: escuro ? "#fff" : "#5B6475" }}>{`treino ${num(g.auc_treino, 2)}`}</text>
          </g>
        );
      }))}
    </g>
  );
}

export function S21Candidato({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(ARVS[0]);
  const [f, setF] = useState(FOLHAS[0]);
  const [enviado, setEnviado] = useState<G | null>(null);
  const sel = cel(a, f);
  const ver = enviado !== null;
  const certo = enviado === BEST;
  const retorno = !enviado ? null
    : certo ? <>Isso: a maior validação{CONFERE ? ", a do candidato" : ""}.</>
      : enviado === TOP_T ? <>Confunde ajuste com generalização: o maior treino, {num(TOP_T.auc_treino, 4)}, valida {num(enviado.auc_val, 4)}.</>
        : <>Validação de {num(enviado.auc_val, 4)}, {num(BEST.auc_val - enviado.auc_val, 4)} abaixo da maior: a regra é a maior AUC de validação.</>;
  const restaurar = () => { setA(ARVS[0]); setF(FOLHAS[0]); setEnviado(null); };
  const LISTA: { t: string; s: string; e: Estado; p: React.ReactNode }[] = [
    { t: "Referência linear", s: "c6p17", e: EMPATA || DIF_LOG <= 0 ? "nao" : "ok", p: <>{num(RES.gbm_val.auc, 4)} contra {num(RES.logit_val.auc, 4)} da logística de sete variáveis: {EMPATA ? "empata" : DIF_LOG > 0 ? "supera" : "perde"}</> },
    { t: "Nível da PD", s: "c6p18", e: NIVEL_OK ? "ok" : "nao", p: <>PD média {pct(RES.gbm_val.pd_media, 2)}; observados {pct(TAXA.p, 2)} ({pct(TAXA.lo, 1)} a {pct(TAXA.hi, 1)})</> },
    { t: "Complexidade pela validação", s: "c6p15", e: certo && !NA_BORDA ? "ok" : "provar", p: !certo ? <>escolha ao lado</> : NA_BORDA
      ? <>{BEST.max_iter} e {BEST.max_leaf_nodes}, na borda da grade; {num(DIF2, 4)} acima da vizinha, com erro padrão de {num(EP, 3)}</>
      : <>{BEST.max_iter} e {BEST.max_leaf_nodes}, no interior da grade</> },
    { t: "Monotonia e explicação", s: "c6p20", e: "provar", p: <>o gerador não publica as árvores</> },
    { t: "Janela fora do tempo", s: "c7p1", e: "provar", p: <>{int(META.n_oot)} propostas, {META.oot.replace("safras ", "")}, congelada</> },
  ];
  return (
    <Quadro slug="c6p21" pagina={pagina} layout="gl"
      conclusao={!certo
        ? <>No treino, a AUC vai de {num(Math.min(...GRID.map((g) => g.auc_treino)), 4)} a {num(TOP_T.auc_treino, 4)}. Qual combinação vai ao comitê? Envie antes de ver a validação.</>
        : <><b>Mecanismo:</b> {BEST.max_iter} árvores de {BEST.max_leaf_nodes} folhas, treino {num(BEST.auc_treino, 4)}. <b>Probabilidade:</b> PD média de {pct(RES.gbm_val.pd_media, 2)} contra {pct(TAXA.p, 2)}. <b>Controle:</b> escolha pela validação, na borda. <b>Prova:</b> {num(RES.gbm_val.auc, 4)} contra {num(RES.logit_val.auc, 4)} da logística. Vai ao comitê como desafiante, com a logística de referência. A base sintética permite guardar a janela futura e conhecer a PD verdadeira: <LinkSlide slug="c7p1">capítulo 7</LinkSlide>.</>}
      fonte={`Candidato: boosting do gerador, sete variáveis, taxa ${num(HP_CANDIDATO.learning_rate, 2)}; validação temporal do gerador: ${int(NV)} propostas, ${DV} defaults, ${META.validacao.replace("safras ", "")}. Wilson de 95%; erro padrão da AUC: Hanley e McNeil (1982).`}>
      <Painel titulo={`Lista do validador · validação temporal (${int(NV)})`}>
        <ol className="q6-s21-lista">
          {LISTA.map((it) => (
            <li key={it.t} data-estado={it.e}>
              <span className="q6-s21-m" aria-hidden="true">{SELO[it.e].s}</span>
              <span className="q6-s21-t"><LinkSlide slug={it.s}>{it.t}</LinkSlide></span>
              <span className="q6-s21-e">{SELO[it.e].r}</span>
              <span className="q6-s21-p">{it.p}</span>
            </li>
          ))}
        </ol>
      </Painel>
      <Painel titulo="Escolha na grade">
        <Grafico rotulo={`Grade de hiperparâmetros do candidato: AUC de treino de cada combinação; ${ver ? `validação maior em ${BEST.max_iter} árvores e ${BEST.max_leaf_nodes} folhas, ${num(BEST.auc_val, 4)}` : "validação oculta até o envio"}`} arCelular="4 / 3">
          {(d) => <Mapa d={d} sel={sel} ver={ver} />}
        </Grafico>
        <div className="q6-s21-ctl">
          <span className="q7-k">Árvores</span>
          <Seg rotulo="Número de árvores" opcoes={ARVS.map((v) => ({ v, r: String(v) }))} valor={a} onChange={setA} desab={ver} />
          <span className="q7-k">Folhas</span>
          <Seg rotulo="Folhas por árvore" opcoes={FOLHAS.map((v) => ({ v, r: String(v) }))} valor={f} onChange={setF} desab={ver} />
          <div className="q6-s21-bot">
          {!ver ? <Botao prim onClick={() => setEnviado(sel)}>Mandar ao comitê</Botao> : <Botao sec onClick={() => setEnviado(null)}>Tentar outra</Botao>}
          <Botao sec onClick={restaurar}>Restaurar</Botao>
          </div>
        </div>
        {retorno && <p className="q7-retorno" data-tom={certo ? "certa" : "errada"} aria-live="polite">{retorno}</p>}
      </Painel>
    </Quadro>
  );
}
