"use client";
import { useState } from "react";
import { Botao, escala, Grafico, LinkSlide, Painel, Quadro, Seg, type Dim, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, GRID, HP_CANDIDATO, LOGISTICA, modelo, XV, YV } from "@/lib/capitulo6/dados";
import { auc, contribuicoes, escore, estagios, perdaLog, sigmoide } from "@/lib/capitulo6/gbm";
import { escoreLogistica } from "@/lib/capitulo6/logistica";
import { calibracaoGlobal } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 21 · c6p21 · O candidato do comitê: o boosting completo do gerador do curso, com sete variáveis. A grade (GRID de
 * dados.ts) traz a AUC de treino e de validação para cada número de árvores e de folhas; só treino e validação
 * aparecem (a janela fora do tempo é do capítulo 7). A turma escolhe a combinação antes de ver a validação; a regra
 * certa (maior AUC de validação) é calculada e confere com HP_CANDIDATO. À direita, a lista de adoção que o validador
 * independente confere (Resolução CMN 4.557/2017; EBA, 2023), cada item com a prova que o capítulo produziu na carteira
 * de três variáveis, recalculada aqui com a biblioteca (os mesmos números dos slides 17 a 20).
 */
type G = (typeof GRID)[number];
const ARVS = [...new Set(GRID.map((g) => g.max_iter))].sort((a, b) => a - b);
const FOLHAS = [...new Set(GRID.map((g) => g.max_leaf_nodes))].sort((a, b) => a - b);
const cel = (a: number, f: number) => GRID.find((g) => g.max_iter === a && g.max_leaf_nodes === f)!;
const BEST = GRID.reduce((b, g) => (g.auc_val > b.auc_val ? g : b), GRID[0]);
const TOP_T = GRID.reduce((b, g) => (g.auc_treino > b.auc_treino ? g : b), GRID[0]);
const PIOR_V = GRID.reduce((b, g) => (g.auc_val < b.auc_val ? g : b), GRID[0]);
const CONFERE = BEST.max_iter === HP_CANDIDATO.max_iter && BEST.max_leaf_nodes === HP_CANDIDATO.max_leaf_nodes && BEST.auc_val === HP_CANDIDATO.auc_val;
const META = base.meta;
const MIN_T = Math.min(...GRID.map((g) => g.auc_treino)), MAX_T = TOP_T.auc_treino;
const MIN_V = PIOR_V.auc_val, MAX_V = BEST.auc_val;
/** No treino, a AUC sobe sempre que se acrescentam árvores ou folhas? (frase do rodapé, conferida na grade) */
const SEMPRE = GRID.every((g) => GRID.every((h) => !(h.max_iter >= g.max_iter && h.max_leaf_nodes >= g.max_leaf_nodes && h !== g) || h.auc_treino > g.auc_treino));

function calcular() {
  /* provas da carteira de três variáveis (as mesmas dos slides 15 a 20) */
  const M = modelo(CFG_CARTEIRA); const EV = estagios(M, XV); const LLV = EV.map((F) => perdaLog(F, YV));
  const K = LLV.reduce((b, v, i) => (i >= 1 && v < LLV[b] ? i : b), 1);
  const AUC_B = auc(YV, EV[K]), AUC_L = auc(YV, XV.map((x) => escoreLogistica(LOGISTICA, x)));
  const MM = modelo({ ...CFG_CARTEIRA, monotonia: [1, 1, -1] }); const EVM = estagios(MM, XV); const LLM = EVM.map((F) => perdaLog(F, YV));
  const KM = LLM.reduce((b, v, i) => (i >= 1 && v < LLM[b] ? i : b), 1); const AUC_M = auc(YV, EVM[KM]);
  const CAL = calibracaoGlobal(YV, EV[K].map(sigmoide));
  const M16 = modelo({ ...CFG_CARTEIRA, arvores: K });
  const SOMA_MAX = Math.max(...XV.slice(0, 50).map((x) => { const c = contribuicoes(M16, x); return Math.abs(c.base + c.phi.reduce((a, b) => a + b, 0) - escore(M16, x)); }));

  const LISTA: { t: string; p: string; s: string }[] = [
    { t: "Referência linear", p: `logística ${num(AUC_L, 4)} contra ${num(AUC_B, 4)}`, s: "c6p17" },
    { t: "Parada pela validação", p: `${K} árvores na carteira; ${HP_CANDIDATO.max_iter} e ${HP_CANDIDATO.max_leaf_nodes} folhas aqui`, s: "c6p15" },
    { t: "Monotonia", p: `AUC ${num(AUC_M, 4)} com, ${num(AUC_B, 4)} sem`, s: "c6p20" },
    { t: "Nível conferido", p: `PD média ${pct(CAL.pdMedia!, 1)}, taxa ${pct(CAL.taxa!, 1)}`, s: "c6p18" },
    { t: "Explicação por proposta", p: SOMA_MAX < 1e-12 ? "contribuições somam o escore" : `soma com erro de ${num(SOMA_MAX, 12)}`, s: "c6p19" },
  ];
  return { M, K, AUC_B, AUC_L, MM, KM, CAL, M16, SOMA_MAX, LISTA };
}
let CACHE: ReturnType<typeof calcular> | null = null;
/** Cálculo preguiçoso: só o slide visitado paga o ajuste dos modelos (o registro importa todos os quadros). */
const dados = () => (CACHE ??= calcular());

function Mapas({ d, sel, ver }: { d: Dim; sel: G; ver: boolean }) {
  const fs = d.fs, gap = fs * 2.2, topo = fs * 2.6, esq = fs * 5.2, baixo = fs * 2.4;
  const pilha = d.w < fs * 36;
  const w = pilha ? d.w - esq : (d.w - esq - gap) / 2, h = pilha ? (d.h - 2 * topo - baixo) / 2 : d.h - topo - baixo;
  const cw = w / ARVS.length, ch = h / FOLHAS.length;
  const tT = escala([MIN_T, MAX_T], [0, 1]), tV = escala([MIN_V, MAX_V], [0, 1]);
  const mapas = [
    { t: `Treino: ${int(META.n_treino)} propostas`, x0: esq, y0: topo, v: (g: G) => g.auc_treino, cor: (g: G) => `rgba(91,100,117,${0.12 + 0.6 * tT(g.auc_treino)})`, branco: (g: G) => tT(g.auc_treino) > 0.62, mostra: true },
    { t: `Validação: ${int(META.n_val)} propostas`, x0: pilha ? esq : esq + w + gap, y0: pilha ? 2 * topo + h : topo, v: (g: G) => g.auc_val, cor: (g: G) => (ver ? `rgba(46,107,79,${0.12 + 0.7 * tV(g.auc_val)})` : "#FBFAF7"), branco: (g: G) => ver && tV(g.auc_val) > 0.62, mostra: ver },
  ];
  return (
    <g>
      {mapas.map((mp) => (
        <g key={mp.t}>
          <text className="q7-eixo-t" x={mp.x0} y={mp.y0} dy="-1.25em">{mp.t}</text>
          {ARVS.map((a, i) => <text key={a} className="q7-tick" x={mp.x0 + cw * (i + 0.5)} y={mp.y0} dy="-.35em" textAnchor="middle">{a}</text>)}
          {FOLHAS.map((f, j) => ARVS.map((a, i) => {
            const g = cel(a, f), on = g === sel, x = mp.x0 + cw * i, y = mp.y0 + ch * j;
            return (
              <g key={`${a}-${f}`}>
                <rect x={x + 2} y={y + 2} width={cw - 4} height={ch - 4} rx={6} fill={mp.cor(g)} stroke={on ? "#00205B" : mp.mostra ? "none" : "#C9CDD5"} strokeWidth={on ? 4 : 1.2} strokeDasharray={!on && !mp.mostra ? "5 4" : undefined} />
                <text className="q7-rot" x={x + cw / 2} y={y + ch / 2} dy=".35em" textAnchor="middle" style={{ fill: mp.branco(g) ? "#fff" : mp.mostra ? "#00205B" : "#5B6475" }}>{mp.mostra ? num(mp.v(g), 4) : "?"}</text>
                {ver && mp.mostra && mp.x0 > esq && g === BEST && <text className="q7-rot--peq" x={x + cw / 2} y={y + ch / 2} dy="1.6em" textAnchor="middle" style={{ fill: "#fff", fontWeight: 700 }}>maior</text>}
              </g>
            );
          }))}
        </g>
      ))}
      {(pilha ? [topo, 2 * topo + h] : [topo]).map((y0) => FOLHAS.map((f, j) => <text key={`${y0}-${f}`} className="q7-tick" x={esq - fs * 0.5} y={y0 + ch * (j + 0.5)} dy=".35em" textAnchor="end">{f} folhas</text>))}
      <text className="q7-eixo-t" x={pilha ? esq + w / 2 : esq + w + gap / 2} y={d.h} dy="-.4em" textAnchor="middle">{pilha ? "Colunas: árvores; linhas: folhas" : "Número de árvores (colunas) e folhas por árvore (linhas); AUC em cada célula"}</text>
    </g>
  );
}

export function S21Candidato({ pagina }: { pagina?: Pagina }) {
  const { LISTA } = dados();
  const [a, setA] = useState(ARVS[0]);
  const [f, setF] = useState(FOLHAS[0]);
  const [enviado, setEnviado] = useState<G | null>(null);
  const sel = cel(a, f);
  const ver = enviado !== null;
  const certo = enviado === BEST;
  const retorno = !enviado ? null
    : certo ? <>Isso: a maior AUC de validação, {num(BEST.auc_val, 4)}{CONFERE ? ", que é o candidato do gerador" : ""}. O treino ({num(BEST.auc_treino, 4)}) não decide.</>
      : enviado === TOP_T ? <>Confunde ajuste com generalização: a maior AUC de treino, {num(TOP_T.auc_treino, 4)}, tem {enviado === PIOR_V ? "a pior validação," : "validação de"} {num(enviado.auc_val, 4)}.</>
        : <>Validação de {num(enviado.auc_val, 4)}, {num(BEST.auc_val - enviado.auc_val, 4)} abaixo da melhor. A regra é a maior AUC de validação, não o meio da grade.</>;
  const restaurar = () => { setA(ARVS[0]); setF(FOLHAS[0]); setEnviado(null); };
  return (
    <Quadro slug="c6p21" pagina={pagina} layout="gl"
      sub={certo ? undefined : <>Sete variáveis, {GRID.length} combinações: qual vai ao comitê, e com que provas?</>}
      conclusao={!certo
        ? <>No treino, mais árvores e mais folhas {SEMPRE ? "sempre sobem" : "tendem a subir"} a AUC, de {num(MIN_T, 4)} a {num(MAX_T, 4)}. Que combinação vai ao comitê? Escolha e envie antes de ver a validação.</>
        : <>Pela validação: <b>{BEST.max_iter} árvores e {BEST.max_leaf_nodes} folhas</b>, AUC {num(BEST.auc_val, 4)} contra {num(BEST.auc_treino, 4)} no treino, a queda do <LinkSlide slug="c6p1">slide 1</LinkSlide>. Com a lista conferida, o boosting vai ao comitê como desafiante da logística; o <LinkSlide slug="c7p1">capítulo 7</LinkSlide> abre a janela fora do tempo e julga.</>}
      fonte={`Base sintética do curso: boosting do gerador com sete variáveis, semente ${META.seed}; treino de ${int(META.n_treino)} propostas (${META.treino.replace("safras ", "")}), validação de ${int(META.n_val)} (${META.validacao.replace("safras ", "")}); taxa ${num(HP_CANDIDATO.learning_rate, 2)}. Provas da lista: carteira de três variáveis.`}>
      <Painel titulo="Boosting do gerador: AUC por árvores e folhas">
        <Grafico rotulo={`Grade de hiperparâmetros: AUC de treino de ${num(MIN_T, 4)} a ${num(MAX_T, 4)}; ${ver ? `validação de ${num(MIN_V, 4)} a ${num(MAX_V, 4)}, maior em ${BEST.max_iter} árvores e ${BEST.max_leaf_nodes} folhas` : "validação oculta até a escolha"}`} arCelular="3 / 4">
          {(d) => <Mapas d={d} sel={sel} ver={ver} />}
        </Grafico>
        <div className="q6-s21-ctl">
          <Seg rotulo="Número de árvores" opcoes={ARVS.map((v) => ({ v, r: String(v) }))} valor={a} onChange={(v) => { setA(v); }} desab={ver} />
          <Seg rotulo="Folhas por árvore" opcoes={FOLHAS.map((v) => ({ v, r: `${v} folhas` }))} valor={f} onChange={(v) => { setF(v); }} desab={ver} />
          {!ver ? <Botao prim onClick={() => setEnviado(sel)}>Mandar ao comitê</Botao> : <Botao sec onClick={() => setEnviado(null)}>Tentar outra</Botao>}
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
        {retorno && <p className="q7-retorno" data-tom={certo ? "certa" : "errada"} aria-live="polite">{retorno}</p>}
      </Painel>
      <Painel titulo="Lista do validador independente">
        <ol className="q6-s21-lista">
          {LISTA.map((it) => <li key={it.t}><span className="q6-s21-m" aria-hidden="true">✓</span><div><LinkSlide slug={it.s} className="q6-s21-t">{it.t}</LinkSlide><span className="q6-s21-p">{it.p}</span></div></li>)}
          <li data-fechado="1"><span className="q6-s21-m" aria-hidden="true">■</span><div><span className="q6-s21-t">Janela fora do tempo congelada</span><span className="q6-s21-p">{int(META.n_oot)} propostas, {META.oot.replace("safras ", "")}</span></div></li>
        </ol>
        <p className="q7-nota">Validação independente e backtesting: Resolução CMN 4.557/2017; EBA (2023).</p>
      </Painel>
    </Quadro>
  );
}
