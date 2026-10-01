"use client";
import { useState } from "react";
import { Botao, Kpi, Legenda, Painel, Quadro, type Pagina } from "../base";
import { Fila } from "../pecas";
import { MINI } from "@/lib/capitulo7/dados";
import { int } from "@/lib/capitulo7/formato";

/**
 * 05 · c7p4 · Anatomia da fila de risco. As 20 propostas da mini-base chegam na ordem do arquivo; a turma ordena pela
 * PD e revela os desfechos de cima para baixo. O quadro conta quantos dos 5 defaults caíram nas 5 primeiras posições,
 * contra a fila perfeita (5) e a média de uma ordem ao acaso (5 × 5/20 = 1,25).
 */
const CHEGADA = [...MINI].sort((a, b) => a.id - b.id);
const ORDENADA = [...MINI].sort((a, b) => b.pd - a.pd || a.id - b.id);
const NDEF = MINI.filter((m) => m.y).length;

export function S05Fila({ pagina }: { pagina?: Pagina }) {
  const [ordenada, setOrdenada] = useState(false);
  const [rev, setRev] = useState(0); // quantas posições já revelaram o desfecho, de cima para baixo
  const itens = ordenada ? ORDENADA : CHEGADA;
  const topo = itens.slice(0, NDEF).filter((m) => m.y).length;
  const vistos = itens.slice(0, rev).filter((m) => m.y).length;
  return (
    <Quadro slug="c7p4" pagina={pagina} layout="glx"
      conclusao={!ordenada ? "Na ordem de chegada a fila não diz nada sobre risco. Ordene pela PD." : rev < itens.length ? `Revele os desfechos de cima para baixo: ${vistos} default${vistos === 1 ? "" : "s"} em ${rev} posições até aqui.`
        : <>Nas 5 primeiras posições há <b>{topo} dos {NDEF}</b> defaults; a fila perfeita teria 5 e uma ordem ao acaso, 1,25 em média. A discriminação está na <b>relação entre a ordem e os desfechos</b>.</>}
      fonte={`Mini-base: ${int(MINI.length)} propostas reais da janela fora do tempo, ${NDEF} defaults e ${MINI.length - NDEF} adimplentes, sorteadas com semente 3; PD da logística em pontos percentuais inteiros. Denominadores próprios: não somar com os da janela (737).`}>
      <Painel titulo={ordenada ? "Do maior risco estimado para o menor →" : "Na ordem em que as propostas chegaram"}>
        <div className="q7-s05-fila">
          <Fila itens={itens} revelado={(k) => k < rev} />
        </div>
        <Legenda itens={[{ mk: "def", r: "deu default em 12 meses" }, { mk: "adi", r: "pagou" }, { mk: "", r: "? desfecho ainda oculto" }]} />
      </Painel>
      <Painel titulo="Controles">
        <div className="q7-botoes q7-col">
          <Botao prim={!ordenada} onClick={() => { setOrdenada(true); setRev(0); }} desab={ordenada}>1. Ordenar pela PD</Botao>
          <Botao prim={ordenada && rev < itens.length} onClick={() => setRev(Math.min(itens.length, rev + 1))} desab={!ordenada || rev >= itens.length}>2. Revelar o próximo</Botao>
          <Botao onClick={() => setRev(itens.length)} desab={!ordenada || rev >= itens.length}>Revelar todos</Botao>
          <Botao sec onClick={() => { setOrdenada(false); setRev(0); }}>Restaurar</Botao>
        </div>
        <div className="q7-kpis q7-kpis--col">
          <Kpi rotulo="Defaults nas 5 primeiras" valor={ordenada && rev >= NDEF ? `${topo} de ${NDEF}` : "?"} detalhe="fila perfeita: 5 de 5" tom="def" />
          <Kpi rotulo="Ao acaso, em média" valor="1,25" detalhe="5 posições × 5/20" />
        </div>
      </Painel>
    </Quadro>
  );
}
