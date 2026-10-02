"use client";
import { useState } from "react";
import { Botao, LinkSlide, Painel, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, GRID, HP_CANDIDATO, LOGISTICA, RES, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { estagios, logit, perdaLog } from "@/lib/capitulo6/gbm";
import { escoreLogistica } from "@/lib/capitulo6/logistica";
import { delong, wilson, Z95 } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";
import base from "@/lib/capitulo6/base.json";

/**
 * 21 · c6p21 · O fecho. A peça principal é a lista do validador independente, com os números do candidato do comitê:
 * o boosting completo do gerador do curso, sete variáveis, julgado na validação temporal do gerador (760 propostas,
 * safras 2023-03 a 2023-07; RES de dados.ts). Cada item tem um estado (cumprido, não cumprido, a provar) e dois modos:
 * a evidência que a tela tem e o que o validador deve pedir, com o limiar. Declarações calculadas ou conferidas:
 *   referência linear  o "empate" usa o erro padrão aproximado de uma AUC isolada (Hanley e McNeil, 1982), porque o
 *                      gerador não publica as previsões por proposta do candidato; as duas AUC vêm das mesmas
 *                      propostas, e no slide 17 a correlação das duas (DeLong) foi calculada: o erro pareado seria
 *                      menor, e o validador deve pedir o DeLong pareado;
 *   nível              a logística do gerador também erra a média (RES.logit_val.pd_media, fora do Wilson): os dois
 *                      erram a safra; só há a média, falta a curva por faixa e o slope (slide 18);
 *   escolha            a AUC do candidato é a maior de 12 células escolhidas nas mesmas propostas em que se compara com
 *                      a logística, que não foi escolhida ali: a comparação favorece o boosting (slides 13 e 15);
 *   variáveis          as sete do candidato (base.json meta.features) não incluem o score de bureau dos slides 11 a 20.
 * A grade (GRID) fica à direita, menor: AUC de treino visível, de validação escondida até o envio; depois de um envio
 * errado, só a célula enviada e a melhor se abrem. A célula mais simples dentro de um erro padrão da melhor não é erro
 * (regra de um erro padrão). Com o acerto, a leitura responde às quatro perguntas do capítulo com números do caso.
 */
type G = (typeof GRID)[number];
const ARVS = [...new Set(GRID.map((g) => g.max_iter))].sort((a, b) => a - b);
const FOLHAS = [...new Set(GRID.map((g) => g.max_leaf_nodes))].sort((a, b) => a - b);
const cel = (a: number, f: number) => GRID.find((g) => g.max_iter === a && g.max_leaf_nodes === f)!;
const ORD_V = [...GRID].sort((a, b) => b.auc_val - a.auc_val);
const BEST = ORD_V[0], PIOR = ORD_V[ORD_V.length - 1];
const TOP_T = GRID.reduce((b, g) => (g.auc_treino > b.auc_treino ? g : b), GRID[0]);
const CONFERE = BEST.max_iter === HP_CANDIDATO.max_iter && BEST.max_leaf_nodes === HP_CANDIDATO.max_leaf_nodes && BEST.auc_val === HP_CANDIDATO.auc_val;
const NA_BORDA = BEST.max_iter === ARVS[0] || BEST.max_leaf_nodes === FOLHAS[0];
const META = base.meta;
const NV = META.n_val, DV = Math.round(RES.gbm_val.obs * NV), AV = NV - DV;
const TAXA = wilson(DV, NV)!;
const noWilson = (p: number) => p >= TAXA.lo && p <= TAXA.hi;
const NIVEL_OK = noWilson(RES.gbm_val.pd_media), LOGIT_OK = noWilson(RES.logit_val.pd_media);
/** Erro padrão aproximado de uma AUC isolada (Hanley e McNeil, 1982), com os defaults e adimplentes da validação temporal. */
const epAuc = (A: number) => { const q1 = A / (2 - A), q2 = (2 * A * A) / (1 + A); return Math.sqrt((A * (1 - A) + (DV - 1) * (q1 - A * A) + (AV - 1) * (q2 - A * A)) / (DV * AV)); };
const EP = epAuc(BEST.auc_val);
const DIF_LOG = RES.gbm_val.auc - RES.logit_val.auc;
const EMPATA = Math.abs(DIF_LOG) < Z95 * EP;
/** Mais simples que a melhor (nem mais árvores nem mais folhas) e dentro de um erro padrão dela: a regra de um erro padrão. */
const ACEITA = (g: G) => g !== BEST && g.max_iter <= BEST.max_iter && g.max_leaf_nodes <= BEST.max_leaf_nodes && BEST.auc_val - g.auc_val < EP;
const F0 = logit(RES.gbm_treino.obs);
const TEM_SCORE = META.features.some((v) => /score|bureau/i.test(v) && !/consulta/i.test(v));
const NCEL = GRID.length;

/** Correlação das duas AUC (logística e boosting parado, nas mesmas propostas) no slide 17, pelo DeLong. */
let CORR: number | null = null;
function correlacaoS17() {
  if (CORR !== null) return CORR;
  const EV = estagios(modelo(CFG_CARTEIRA), XV); const LL = EV.map((F) => perdaLog(F, YV));
  const k = LL.reduce((b, x, i) => (i >= 1 && x < LL[b] ? i : b), 1);
  return (CORR = delong(YV, XV.map((x) => escoreLogistica(LOGISTICA, x)), EV[k]).correlacao);
}

type Estado = "ok" | "nao" | "provar";
type Modo = "tem" | "pede";
const SELO: Record<Estado, { s: string; r: string }> = { ok: { s: "✓", r: "cumprido" }, nao: { s: "✗", r: "não cumprido" }, provar: { s: "?", r: "a provar" } };
const tom = (g: G) => (g.auc_val - PIOR.auc_val) / (BEST.auc_val - PIOR.auc_val);
const verde = (g: G) => `rgba(46,107,79,${0.1 + 0.75 * tom(g)})`;

export function S21Candidato({ pagina }: { pagina?: Pagina }) {
  const [corr] = useState(correlacaoS17);
  const [sel, setSel] = useState<G>(cel(ARVS[0], FOLHAS[0]));
  const [enviado, setEnviado] = useState<G | null>(null);
  const [modo, setModo] = useState<Modo>("tem");
  const certo = enviado === BEST, aceito = enviado !== null && ACEITA(enviado), fecha = certo || aceito;
  const abre = (g: G) => enviado !== null && (fecha || g === enviado || g === BEST);
  const retorno = !enviado ? null
    : certo ? <>Isso: a maior AUC de validação{CONFERE ? ", a regra que escolheu o candidato" : ""}.</>
      : aceito ? <>Não é erro: {num(BEST.auc_val - enviado.auc_val, 4)} abaixo da maior, dentro de um erro padrão ({num(EP, 3)}); um validador pode preferir o modelo mais simples. O candidato é o de maior AUC.</>
        : enviado === TOP_T ? <>Confunde ajuste com generalização: o maior treino, {num(TOP_T.auc_treino, 4)}, valida {num(enviado.auc_val, 4)}{enviado === PIOR ? ", a pior da grade" : ""}.</>
          : <>{num(BEST.auc_val - enviado.auc_val, 4)} abaixo da maior e não mais simples que ela: nem a regra da maior AUC nem a do mais simples a escolhem.</>;
  const restaurar = () => { setSel(cel(ARVS[0], FOLHAS[0])); setEnviado(null); setModo("tem"); };
  const s17 = <LinkSlide slug="c6p17">slide 17</LinkSlide>;
  const LISTA: { t: string; s: string; e: Estado; tem: React.ReactNode; pede: React.ReactNode }[] = [
    { t: "Referência linear", s: "c6p17", e: !EMPATA && DIF_LOG > 0 ? "ok" : "provar",
      tem: <>{num(RES.gbm_val.auc, 4)} contra {num(RES.logit_val.auc, 4)} da logística: {EMPATA ? "empata" : DIF_LOG > 0 ? "supera" : "perde"} pela régua aproximada de uma AUC ({num(EP, 3)})</>,
      pede: <>previsões por proposta e DeLong pareado (correlação {num(corr, 2)} no {s17}): IC acima de zero</> },
    { t: "Nível da PD", s: "c6p18", e: NIVEL_OK ? "ok" : "nao",
      tem: <>só a média: {pct(RES.gbm_val.pd_media, 2)} e {pct(RES.logit_val.pd_media, 2)} (logística) contra {pct(TAXA.p, 2)} ({pct(TAXA.lo, 1)} a {pct(TAXA.hi, 1)}){!NIVEL_OK && !LOGIT_OK ? ": os dois erram" : ""}</>,
      pede: <>recalibrar {!NIVEL_OK && !LOGIT_OK ? "os dois" : "o boosting"}; curva por faixa e slope: PD média no Wilson, IC do slope contendo 1</> },
    { t: "Escolha pela validação", s: "c6p15", e: "provar",
      tem: !enviado ? <>a maior AUC de {NCEL} células, nas mesmas {int(NV)} da comparação</>
        : <>{BEST.max_iter} árvores e {BEST.max_leaf_nodes} folhas{NA_BORDA ? ", na borda" : ""}: a maior de {NCEL} células nas mesmas {int(NV)}; favorece o boosting</>,
      pede: <>AUC em propostas que não escolheram a célula (slides 13 e 15){NA_BORDA ? "; grade além da borda" : ""}</> },
    { t: "Monotonia e explicação", s: "c6p20", e: "provar",
      tem: <>sem as árvores; as sete variáveis {TEM_SCORE ? "têm" : "não têm"} o score de bureau dos slides 11 a 20</>,
      pede: <>as árvores: sem queda em variável com sinal de negócio; contribuições (slide 19)</> },
    { t: "Janela fora do tempo", s: "c7p1", e: "provar",
      tem: <>{int(META.n_oot)} propostas, {META.oot.replace("safras ", "")}, congelada</>,
      pede: <>abrir uma vez, com modelo, corte e calibração congelados</> },
  ];
  return (
    <Quadro slug="c6p21" pagina={pagina} layout="gl"
      conclusao={!fecha
        ? <>Escolha a combinação que vai ao comitê; a validação abre depois do envio.</>
        : <><b>Mecanismo:</b> F₀ = {num(F0, 2)} mais {HP_CANDIDATO.max_iter} árvores × {num(HP_CANDIDATO.learning_rate, 2)}, em log odds. <b>Probabilidade:</b> PD média {pct(RES.gbm_val.pd_media, 2)} contra {pct(TAXA.p, 2)}: recalibrar. <b>Controle:</b> {BEST.max_iter} árvores, {BEST.max_leaf_nodes} folhas{NA_BORDA ? ", na borda" : ""}. <b>Prova:</b> {num(RES.gbm_val.auc, 4)} contra {num(RES.logit_val.auc, 4)}, {EMPATA ? "empate aproximado" : "diferença aproximada"}. <b>Decisão:</b> o comitê do <LinkSlide slug="c7p1">capítulo 7</LinkSlide> só troca a logística se o boosting ganhar na janela futura: complexidade custa validar e explicar.</>}
      fonte={`Candidato: boosting do gerador, sete variáveis, taxa ${num(HP_CANDIDATO.learning_rate, 2)}; validação temporal do gerador (${int(NV)} propostas, ${DV} defaults, ${META.validacao.replace("safras ", "")}), não o sorteio dos slides 11 a 20. Wilson; Hanley e McNeil (1982).`}>
      <Painel>
        <div className="q6-s21-cab">
          <p className="q7-k">Lista do validador</p>
          <Seg rotulo="O que a lista mostra" opcoes={[{ v: "tem" as Modo, r: "Evidência" }, { v: "pede" as Modo, r: "O que pedir" }]} valor={modo} onChange={setModo} cor />
        </div>
        <ol className="q6-s21-lista">
          {LISTA.map((it) => (
            <li key={it.t} data-estado={it.e}>
              <span className="q6-s21-m" aria-hidden="true">{SELO[it.e].s}</span>
              <span className="q6-s21-t"><LinkSlide slug={it.s}>{it.t}</LinkSlide></span>
              <span className="q6-s21-e">{SELO[it.e].r}</span>
              <span className="q6-s21-p">{modo === "tem" ? it.tem : it.pede}</span>
            </li>
          ))}
        </ol>
      </Painel>
      <Painel titulo="Grade · AUC de validação (treino)">
        <div className="q6-s21-grade" role="group" aria-label="Grade de hiperparâmetros: escolha uma célula">
          <span className="q6-s21-g0">folhas \ árvores</span>
          {ARVS.map((a) => <span key={a} className="q6-s21-gc">{a}</span>)}
          {FOLHAS.map((f) => [
            <span key={`r${f}`} className="q6-s21-gr">{f}</span>,
            ...ARVS.map((a) => {
              const g = cel(a, f), on = abre(g);
              return (
                <button key={`${a}-${f}`} type="button" className="q6-s21-cel" aria-pressed={g === sel} disabled={enviado !== null} data-ver={on ? (g === BEST ? "melhor" : "1") : undefined} data-escuro={on && tom(g) > 0.6 ? "1" : undefined} style={on ? { background: verde(g) } : undefined}
                  aria-label={`${a} árvores e ${f} folhas: AUC de treino ${num(g.auc_treino, 2)}${on ? `, de validação ${num(g.auc_val, 4)}` : ""}`} onClick={() => setSel(g)}>
                  <b>{on ? num(g.auc_val, 4) : "?"}</b><small>({num(g.auc_treino, 2)})</small>
                </button>
              );
            }),
          ])}
        </div>
        <div className="q6-s21-bot">
          {!enviado ? <Botao prim onClick={() => setEnviado(sel)}>Mandar ao comitê</Botao> : <Botao sec onClick={() => setEnviado(null)}>Tentar outra</Botao>}
          <Botao sec onClick={restaurar}>Restaurar</Botao>
        </div>
        {retorno && <p className="q7-retorno" data-tom={certo ? "certa" : aceito ? undefined : "errada"} aria-live="polite">{retorno}</p>}
      </Painel>
    </Quadro>
  );
}
