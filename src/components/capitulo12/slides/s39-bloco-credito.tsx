"use client";
import { LinkSlide, Painel, type Pagina } from "@/components/capitulo7/base";
import { AberturaBloco } from "../pecas";
import { CORTE, META_VOLUME } from "@/lib/capitulo12/dados";
import { BVS } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 39 · c12p39 · Abertura do bloco 4 (Crédito). As quatro perguntas com a deste bloco em destaque; ao centro, o caso
 * em uma barra (contratos do curto prazo, maus em vinho, a meta de volume do corte em âmbar) e os três pratos da
 * decisão, cada um com a métrica que o mede e o slide em que aparece. Números: CORTE.curto (avaliaCorte sobre CASO),
 * META_VOLUME e CASO.auc (via b4.ts). Slide de navegação: cada prato e cada passo é um link; não há estado a restaurar.
 */
const C = CORTE.curto.politica; // contratos, maus e taxa são os mesmos nas três regras do horizonte
const PRATOS = [
  { id: "disc", simb: "●", nome: "Discriminação", metrica: "AUC e Gini", pergunta: "O score separa bons e maus?", slug: "c12p42" },
  { id: "tempo", simb: "■", nome: "Estabilidade no tempo", metrica: "AUC no treino contra fora do tempo", pergunta: `No exemplo de sobreajuste, a AUC cai de ${num(BVS.treino, 3)} para ${num(BVS.validacao, 3)}.`, slug: "c12p41" },
  { id: "vol", simb: "◆", nome: "Volume recusado", metrica: "Parcela da população cortada", pergunta: `A meta: menos de ${pct(META_VOLUME, 0)}.`, slug: "c12p47" },
];

export function S39BlocoCredito({ pagina }: { pagina?: Pagina }) {
  return (
    <AberturaBloco slug="c12p39" pagina={pagina}
      conclusao={<>O caso tem <b>{int(C.contratos)} contratos e {pct(C.taxaMaus, 1)} de maus</b>; o corte pode remover menos de {pct(META_VOLUME, 0)}. O slide {SLIDE.c12p40.n} define o que o corte precisa acertar.</>}
      extra={
        <Painel className="q12-s39">
          <div className="q12-s39-caso">
            <p className="q7-k">O caso, curto prazo</p>
            <p className="q12-s39-n"><b>{int(C.contratos)}</b> contratos · <b className="q12-s39-maus">{int(C.maus)}</b> maus ({pct(C.taxaMaus, 1)})</p>
            <div className="q12-s39-barra" role="img" aria-label={`Barra da população: ${pct(C.taxaMaus, 1)} de maus; a meta permite cortar menos de ${pct(META_VOLUME, 0)}`}>
              <span className="q12-s39-m" style={{ width: `${C.taxaMaus * 100}%` }} />
              <span className="q12-s39-meta" style={{ left: `${META_VOLUME * 100}%` }}><i>corte &lt; {pct(META_VOLUME, 0)}</i></span>
            </div>
            <p className="q12-s39-leg"><span><i className="q12-s39-mk" aria-hidden="true" />mau: não paga as primeiras parcelas</span><span><i className="q12-s39-mk q12-s39-mk--meta" aria-hidden="true" />limite do corte</span></p>
          </div>
          <ol className="q12-s39-pratos" aria-label="Os três pratos da decisão de corte">
            {PRATOS.map((p) => (
              <li key={p.id} data-p={p.id}>
                <LinkSlide slug={p.slug} className="q12-s39-prato" rotulo={`${p.nome}: ${p.metrica}. Slide ${SLIDE[p.slug].n}`}>
                  <b><i aria-hidden="true">{p.simb}</i> {p.nome}</b>
                  <span className="q12-s39-met">{p.metrica}</span>
                  <span>{p.pergunta}</span>
                  <small>slide {SLIDE[p.slug].n}</small>
                </LinkSlide>
              </li>
            ))}
          </ol>
        </Painel>
      } />
  );
}
