"use client";
import { useState } from "react";
import { Botao, Kpi, Legenda, Painel, Previsao, Quadro, type Opcao, type Pagina } from "../base";
import { MINI, QUATRO } from "@/lib/capitulo7/dados";
import { SLIDE } from "@/lib/capitulo7/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 05 · c7p4 · Anatomia da fila de risco. As 20 propostas da mini-base chegam na ordem do arquivo; a turma ordena pela
 * PD, aposta quantos dos 5 defaults cairão nas 5 primeiras posições e só então revela os desfechos de cima para baixo.
 * O quadro conta os defaults no topo contra a fila perfeita (5) e a média de uma ordem ao acaso (5 × 5/20).
 */
type Item = (typeof MINI)[number];
const CHEGADA = [...MINI].sort((a, b) => a.id - b.id);
const ORDENADA = [...MINI].sort((a, b) => b.pd - a.pd || a.id - b.id);
const NDEF = MINI.filter((m) => m.y).length;
const TOPO = ORDENADA.slice(0, NDEF).filter((m) => m.y).length;
const ACASO = (NDEF * NDEF) / MINI.length;
const PD1 = ORDENADA[0].pd; // a maior PD da fila

/**
 * Fila local: na ordem de chegada a ficha não traz ordinal (a posição não diz nada sobre risco); na fila ordenada,
 * o ordinal e a régua marcam as 5 primeiras posições, que a métrica conta.
 */
function FilaS05({ itens, ordenada, rev }: { itens: Item[]; ordenada: boolean; rev: number }) {
  return (
    <div className="q7-s05-f">
      <div className="q7-s05-regua" aria-hidden="true" data-on={ordenada ? "1" : "0"}>
        <span className="q7-s05-r1">{ordenada ? `as ${NDEF} primeiras posições` : ""}</span>
        <span className="q7-s05-r2">{ordenada ? `as outras ${MINI.length - NDEF}, até o menor risco →` : ""}</span>
      </div>
      <ol className="q7-fila" aria-label={ordenada ? "Fila de risco, do maior para o menor" : "Propostas na ordem de chegada"}>
        {itens.map((it, k) => {
          const vis = k < rev;
          return (
            <li key={it.id} className="q7-fila-li" data-topo={ordenada && k < NDEF ? "1" : undefined}>
              <span className="q7-ficha" data-y={vis ? String(it.y) : "?"} data-quatro={QUATRO.some((c) => c.id === it.id) ? "1" : undefined} aria-label={`${ordenada ? `Posição ${k + 1}, ` : ""}proposta ${it.id}, PD ${pct(it.pd, 0)}${vis ? (it.y ? ", deu default" : ", pagou") : ", desfecho oculto"}`}>
                <span className="q7-ficha-pos" aria-hidden="true">{ordenada ? `${k + 1}º` : " "}</span>
                <span className="q7-ficha-pd">{pct(it.pd, 0)}</span>
                <span className="q7-ficha-mk" aria-hidden="true">{vis ? (it.y ? "D" : "") : "?"}</span>
                <span className="q7-ficha-id">#{it.id}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const OPCOES: Opcao[] = [
  { texto: "0 ou 1, como numa ordem ao acaso", retorno: <>Confunde a fila do modelo com um <b>sorteio</b>, que põe {num(ACASO, 2)} default no topo em média. A PD separa algum risco: espere mais que isso.</> },
  { texto: `Cerca de ${int(TOPO)}`, certa: true, retorno: <>Boa aposta: melhor que o acaso, longe do perfeito. Revele e confira.</> },
  { texto: `Todos os ${NDEF}`, retorno: <>Confunde <b>boa ordem com ordem perfeita</b>. PD de {pct(PD1, 0)} ainda quer dizer que {int(Math.round((1 - PD1) * 10))} em 10 pagam: o topo mistura defaults e adimplentes.</> },
];

export function S05Fila({ pagina }: { pagina?: Pagina }) {
  const [ordenada, setOrdenada] = useState(false);
  const [rev, setRev] = useState(0); // quantas posições já revelaram o desfecho, de cima para baixo
  const [esc, setEsc] = useState<number | null>(null);
  const itens = ordenada ? ORDENADA : CHEGADA;
  const vistos = itens.slice(0, rev).filter((m) => m.y).length;
  const pode = ordenada && esc !== null;
  return (
    <Quadro slug="c7p4" pagina={pagina} layout="gl"
      conclusao={!ordenada ? "Na ordem de chegada a fila não diz nada sobre risco. Ordene pela PD."
        : esc === null ? `Antes de revelar: quantos dos ${NDEF} defaults estarão nas ${NDEF} primeiras posições?`
        : rev === 0 ? "Revele os desfechos de cima para baixo, uma posição por vez."
        : rev < itens.length ? `Revele de cima para baixo: ${vistos} default${vistos === 1 ? "" : "s"} em ${rev} posições até aqui.`
        : <>Nas {NDEF} primeiras há <b>{TOPO} dos {NDEF}</b> defaults (perfeita: {NDEF}; acaso: {num(ACASO, 2)}): <b>discriminar é a ordem acompanhar os desfechos</b>. Os quatro clientes do slide {SLIDE.c7p3.n} estão nesta fila, sublinhados; no {SLIDE.c7p5.n}, cada par default × adimplente vira disputa.</>}
      fonte={`Mini-base: ${int(MINI.length)} propostas da janela fora do tempo, ${NDEF} defaults, sorteadas com semente 3; PD da logística em pontos inteiros; empates na PD seguem o número da proposta. Denominadores próprios: não somar com os da janela (737).`}>
      <Painel titulo={ordenada ? "Do maior risco estimado para o menor →" : "Na ordem em que as propostas chegaram"} className="q7-s05-p">
        <FilaS05 itens={itens} ordenada={ordenada} rev={rev} />
        <Legenda itens={[{ mk: "def", r: "deu default em 12 meses" }, { mk: "adi", r: "pagou" }, { mk: "", r: "? desfecho oculto" }]} />
      </Painel>
      <Painel className="q7-s05-lat">
        <div className="q7-botoes q7-s05-bt">
          <Botao prim={!ordenada} onClick={() => { setOrdenada(true); setRev(0); }} desab={ordenada}>1. Ordenar pela PD</Botao>
          <Botao prim={pode && rev < itens.length} onClick={() => setRev(Math.min(itens.length, rev + 1))} desab={!pode || rev >= itens.length}>2. Revelar o próximo</Botao>
          <Botao onClick={() => setRev(itens.length)} desab={!pode || rev >= itens.length}>Revelar todos</Botao>
          <Botao sec onClick={() => { setOrdenada(false); setRev(0); setEsc(null); }}>Restaurar</Botao>
        </div>
        <Previsao rotulo="Antes de revelar" pergunta={`Na fila pela PD, quantos dos ${NDEF} defaults estarão nas ${NDEF} primeiras posições?`} opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); setRev(0); }} recolher />
        <div className="q7-kpis">
          <Kpi rotulo={`Defaults nas ${NDEF} primeiras`} valor={ordenada && rev >= NDEF ? `${TOPO} de ${NDEF}` : "?"} detalhe={`fila perfeita: ${NDEF} de ${NDEF}`} tom="def" tam="mini" />
          <Kpi rotulo="Ao acaso, em média" valor={num(ACASO, 2)} detalhe={`${NDEF} posições × ${NDEF}/${MINI.length}`} tam="mini" />
        </div>
      </Painel>
    </Quadro>
  );
}
