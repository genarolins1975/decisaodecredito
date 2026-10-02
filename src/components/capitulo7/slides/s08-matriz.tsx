"use client";
import { useState } from "react";
import { Botao, Controle, Painel, Quadro, type Pagina } from "../base";
import { Fila, Matriz } from "../pecas";
import { MINI } from "@/lib/capitulo7/dados";
import { confusao } from "@/lib/capitulo7/metricas";
import { pct } from "@/lib/capitulo7/formato";
import { SLIDE } from "@/lib/capitulo7/roteiro";

/**
 * 08 · c7p23 · Do corte à matriz de confusão, na mini-base de 20 propostas. O controle de corte desloca a fronteira na
 * fila e atualiza VP, FP, FN e VN; positivo é "prevê default", isto é, recusa. As taxas aparecem uma por vez, cada
 * uma com o seu denominador escrito. Antes da precisão, a turma aposta entre três frações calculadas da matriz atual
 * (a sensibilidade, a precisão e 100%); se duas coincidirem nesse corte, a precisão abre sem aposta.
 */
const ORD = [...MINI].sort((a, b) => b.pd - a.pd || a.id - b.id);
const Y = ORD.map((m) => m.y), P = ORD.map((m) => m.pd);
const TAXAS = [
  { nome: "Sensibilidade (recall)", frase: "dos defaults, quantos o corte recusou", num: "VP", den: "VP + FN" },
  { nome: "Especificidade", frase: "dos adimplentes, quantos o corte aprovou", num: "VN", den: "VN + FP" },
  { nome: "Precisão", frase: "entre os recusados, quantos eram default", num: "VP", den: "VP + FP" },
] as const;

export function S08Matriz({ pagina }: { pagina?: Pagina }) {
  const [corte, setCorte] = useState(0.14);
  const [nt, setNt] = useState(0);
  const [ap, setAp] = useState<number | null>(null); // aposta na precisão
  const c = confusao(Y, P, corte);
  const k = P.filter((p) => p >= corte).length;
  const v = [c.sensibilidade, c.especificidade, c.precisao];
  const cont = [[c.vp, c.vp + c.fn], [c.vn, c.vn + c.fp], [c.vp, c.vp + c.fp]];
  const ops = [
    { v: c.sensibilidade, ret: `é o recall (÷ ${c.vp + c.fn} defaults); a precisão divide pelos ${k} recusados.` },
    { v: c.precisao, certa: true, ret: "" },
    { v: 1, ret: "recusar não garante default: há FP entre os recusados." },
  ];
  const vs = ops.map((o) => (o.v === null ? "" : pct(o.v, 0)));
  const aposta = nt === 2 && k > 0 && new Set(vs).size === 3; // a precisão só abre depois da aposta
  const mudaCorte = (v: number) => { setCorte(v); setAp(null); };
  return (
    <Quadro slug="c7p23" pagina={pagina} layout="um"
      conclusao={<>Com corte em {pct(corte, 0)}: {c.vp} default{c.vp === 1 ? "" : "s"} evitado{c.vp === 1 ? "" : "s"}, <b>{c.fp} {c.fp === 1 ? "bom cliente recusado" : "bons clientes recusados"}</b> e <b>{c.fn} default{c.fn === 1 ? "" : "s"} aprovado{c.fn === 1 ? "" : "s"}</b>. Positivo é a recusa. Cada corte dá uma matriz; o slide {SLIDE.c7p6.n} percorre todos.</>}
      fonte="Mini-base de 20 propostas da janela fora do tempo (5 defaults, 15 adimplentes), PD da logística em pontos inteiros. Recusa quando PD ≥ corte; desfecho observado em 12 meses.">
      <div className="q7-s08">
        <Painel titulo="A fila e a fronteira de recusa" className="q7-s08-a">
          <div className="q7-s08-fila"><Fila itens={ORD} revelado compacta corteK={k < ORD.length ? k : null} rotuloCorte={`corte ${pct(corte, 0)}`} /></div>
          <Controle rotulo="Corte de PD para recusar" valor={corte} min={0.02} max={0.21} passo={0.01} onChange={mudaCorte} mostrar={`${pct(corte, 0)} · recusa ${k} de 20`} escala={["2%: recusa todos", "21%: aprova todos"]} />
          <div className="q7-botoes"><Botao sec onClick={() => { setNt(0); setAp(null); setCorte(0.14); }}>Restaurar</Botao></div>
        </Painel>
        <Painel titulo="Quatro contagens" className="q7-s08-b"><Matriz vp={c.vp} fp={c.fp} fn={c.fn} vn={c.vn} compacta /></Painel>
        <Painel titulo="Três taxas, três denominadores" className="q7-s08-c">
          {TAXAS.map((t, i) => (
            <div key={t.nome} className="q7-s08-taxa" data-on={i < nt ? "1" : "0"}>
              <p className="q7-s08-n">{t.nome}</p>
              {i < nt ? <p className="q7-s08-v"><b>{v[i] === null ? "sem recusados" : pct(v[i]!, 0)}</b> = {t.num} ÷ ({t.den}) = {cont[i][0]} ÷ {cont[i][1]}</p>
                : i === 2 && aposta ? (ap === null ? <>
                  <p className="q7-s08-v q7-nota">{t.frase}?</p>
                  <div className="q7-s08-ops" role="group" aria-label="Alternativas para a precisão">{ops.map((o, j) => <button key={j} type="button" className="q7-btn" onClick={() => { if (o.certa) { setNt(3); setAp(null); } else setAp(j); }}>{vs[j]}</button>)}</div>
                </> : <>
                  <p className="q7-s08-v q7-s08-ret" aria-live="polite">{vs[ap]}: {ops[ap].ret}</p>
                  <Botao sec onClick={() => setAp(null)}>Tentar outra</Botao>
                </>)
                : <p className="q7-s08-v q7-nota">{t.frase}</p>}
            </div>
          ))}
          {nt < 3 && !aposta && <div className="q7-botoes"><Botao prim onClick={() => setNt(Math.min(3, nt + 1))}>Revelar a próxima taxa</Botao></div>}
        </Painel>
      </div>
    </Quadro>
  );
}
