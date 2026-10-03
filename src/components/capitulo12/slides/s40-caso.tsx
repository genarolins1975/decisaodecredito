"use client";
import { useState } from "react";
import { Botao, Kpi, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { CORTE, FONTE_CASO, META_VOLUME } from "@/lib/capitulo12/dados";
import { HZ, PROPOSTA_MATERIAL } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 40 · c12p40 · O caso de crédito: problema, objetivo e decisão (os três cartões da aula), a proposta do material e o
 * tamanho do caso no curto prazo (CORTE.curto, avaliaCorte sobre CASO: contratos, maus, taxa). A peça principal liga
 * cada exigência do caso à métrica que a mede: a turma escolhe uma métrica por exigência e só então vê se acertou,
 * com retorno que nomeia a confusão (precisão, recall, volume e AUC respondem a perguntas distintas). "Tentar outra"
 * limpa uma linha; o estado inicial tem as três linhas em aberto e "Restaurar" volta a ele.
 */
const C = CORTE.curto.politica; // contratos, maus e taxa são os mesmos nas três regras do horizonte
type Met = "prec" | "rec" | "vol" | "auc";
const METRICAS: { v: Met; r: string }[] = [{ v: "prec", r: "Precisão" }, { v: "rec", r: "Recall" }, { v: "vol", r: "Volume do corte" }, { v: "auc", r: "AUC" }];
const EXIG: { id: string; texto: string; certa: Met; ret: Record<Met, string> }[] = [
  { id: "risco", texto: "Concentrar o corte no maior risco", certa: "prec", ret: {
    prec: "Certo: precisão é a taxa de maus entre os recusados; concentrar o risco é tê-la alta.",
    rec: "Recall conta quantos maus o corte pega, não quão arriscado é o grupo: recusar todos captura todos os maus.",
    vol: "Volume diz quantos são recusados, não quem.",
    auc: "AUC mede a ordenação em todos os limiares; o corte é um limiar só." } },
  { id: "volume", texto: `Remover menos de ${pct(META_VOLUME, 0)} da população`, certa: "vol", ret: {
    vol: `Certo: volume é a parcela da população recusada; a meta é ficar abaixo de ${pct(META_VOLUME, 0)}.`,
    prec: "Precisão olha só dentro do grupo recusado; não diz o tamanho dele.",
    rec: "Recall é uma parcela dos maus, não da população: confunde os denominadores.",
    auc: "AUC não depende do corte; o volume depende." } },
  { id: "evitar", texto: "Evitar o maior número de maus", certa: "rec", ret: {
    rec: "Certo: recall é a parcela dos maus que o corte captura.",
    prec: "Um corte pequeno e muito preciso evita poucos maus: precisão mede pureza, não captura.",
    vol: "Recusar mais não garante evitar mais maus; depende de quem é recusado.",
    auc: "AUC resume a ordenação; quantos maus saem depende do corte escolhido." } },
];
const INICIAL: Record<string, Met | null> = { risco: null, volume: null, evitar: null };

export function S40Caso({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState(INICIAL);
  const acertos = EXIG.filter((e) => esc[e.id] === e.certa).length;
  const tudo = acertos === EXIG.length;
  return (
    <Quadro slug="c12p40" pagina={pagina} layout="lg"
      conclusao={tudo ? <>Concentrar o risco é <b>precisão</b>, remover menos de {pct(META_VOLUME, 0)} é <b>volume</b>, evitar maus é <b>recall</b>. Antes de comparar regras (slide {SLIDE.c12p45.n}), o slide {SLIDE.c12p41.n} valida o modelo no tempo.</>
        : <>Ligue cada exigência a uma métrica: {acertos} de {EXIG.length} ligadas. A escolha da regra no slide {SLIDE.c12p47.n} usa as três.</>}
      fonte={`${FONTE_CASO}. ${HZ.curto.nome}: alvo ${HZ.curto.alvo} (${HZ.curto.def}); ${int(C.contratos)} contratos, ${int(C.maus)} maus.`}>
      <Painel titulo="O caso" tom="suave" className="q12-s40-caso">
        <dl className="q12-s40-cards">
          <div><dt>Problema</dt><dd>Uma parcela dos clientes não paga nenhuma prestação.</dd></div>
          <div><dt>Objetivo</dt><dd>Identificar esse público antes do escore usado na precificação.</dd></div>
          <div><dt>Decisão</dt><dd>Concentrar o corte no maior risco, removendo menos de {pct(META_VOLUME, 0)} da população.</dd></div>
        </dl>
        <div className="q7-kpis">
          <Kpi tam="mini" rotulo="Contratos" valor={int(C.contratos)} />
          <Kpi tam="mini" rotulo="Maus" valor={int(C.maus)} detalhe={pct(C.taxaMaus, 1)} tom="def" />
        </div>
        <p className="q7-nota"><b>Proposta do material:</b> {PROPOSTA_MATERIAL}</p>
      </Painel>
      <Painel className="q12-s40-lig">
        <div className="q12-s40-cab">
          <p className="q7-k">Que métrica mede cada exigência? O mau é a classe positiva</p>
          <Botao sec onClick={() => setEsc(INICIAL)} desab={EXIG.every((e) => esc[e.id] === null)}>Restaurar</Botao>
        </div>
        <ol className="q12-s40-linhas">
          {EXIG.map((e, k) => {
            const m = esc[e.id];
            const ok = m === e.certa;
            return (
              <li key={e.id} data-estado={m === null ? undefined : ok ? "certa" : "errada"}>
                <p className="q12-s40-ex"><span aria-hidden="true">{k + 1}</span>{e.texto}</p>
                <div className="q12-s40-ops" role="group" aria-label={`Métrica para: ${e.texto}`}>
                  {METRICAS.map((o) => (
                    <button key={o.v} type="button" className="q7-prev-op" aria-pressed={m === o.v} disabled={m !== null}
                      data-estado={m === o.v ? (ok ? "certa" : "errada") : undefined} onClick={() => setEsc({ ...esc, [e.id]: o.v })}>{o.r}</button>
                  ))}
                </div>
                {m !== null && (
                  <div className="q12-s40-ret">
                    <p className="q7-retorno" data-tom={ok ? "certa" : "errada"} aria-live="polite">{e.ret[m]}</p>
                    {!ok && <Botao sec onClick={() => setEsc({ ...esc, [e.id]: null })}>Tentar outra</Botao>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </Painel>
    </Quadro>
  );
}
