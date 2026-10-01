"use client";
import { useState } from "react";
import { Botao, Controle, Painel, Quadro, type Pagina } from "../base";
import { Fila, Matriz } from "../pecas";
import { MINI } from "@/lib/capitulo7/dados";
import { confusao } from "@/lib/capitulo7/metricas";
import { pct } from "@/lib/capitulo7/formato";

/**
 * 08 · c7p23 · Do corte à matriz de confusão, na mini-base de 20 propostas. O controle de corte desloca a fronteira na
 * fila e atualiza VP, FP, FN e VN; positivo é "prevê default", isto é, recusa. As taxas aparecem uma por vez, cada
 * uma com o seu denominador escrito.
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
  const c = confusao(Y, P, corte);
  const k = P.filter((p) => p >= corte).length;
  const v = [c.sensibilidade, c.especificidade, c.precisao];
  const cont = [[c.vp, c.vp + c.fn], [c.vn, c.vn + c.fp], [c.vp, c.vp + c.fp]];
  return (
    <Quadro slug="c7p23" pagina={pagina} layout="um"
      conclusao={<>Com corte em {pct(corte, 0)}: {c.vp} default{c.vp === 1 ? "" : "s"} evitado{c.vp === 1 ? "" : "s"}, <b>{c.fp} {c.fp === 1 ? "bom cliente recusado" : "bons clientes recusados"}</b> e <b>{c.fn} default{c.fn === 1 ? "" : "s"} aprovado{c.fn === 1 ? "" : "s"}</b>. Prever default é decidir recusar; o default realizado só se conhece 12 meses depois.</>}
      fonte="Mini-base de 20 propostas da janela fora do tempo (5 defaults, 15 adimplentes), PD da logística em pontos inteiros. Regra: recusa quando PD ≥ corte. Positivo = default previsto = proposta recusada.">
      <div className="q7-s08">
        <Painel titulo="A fila e a fronteira de recusa" className="q7-s08-a">
          <div className="q7-s08-fila"><Fila itens={ORD} revelado compacta corteK={k < ORD.length ? k : null} rotuloCorte={`corte ${pct(corte, 0)}`} /></div>
          <Controle rotulo="Corte de PD para recusar" valor={corte} min={0.02} max={0.21} passo={0.01} onChange={setCorte} mostrar={`${pct(corte, 0)} · recusa ${k} de 20`} escala={["2%: recusa todos", "21%: aprova todos"]} />
        </Painel>
        <Painel titulo="Quatro contagens" className="q7-s08-b"><Matriz vp={c.vp} fp={c.fp} fn={c.fn} vn={c.vn} compacta /></Painel>
        <Painel titulo="Três taxas, três denominadores" className="q7-s08-c">
          {TAXAS.map((t, i) => (
            <div key={t.nome} className="q7-s08-taxa" data-on={i < nt ? "1" : "0"}>
              <p className="q7-s08-n">{t.nome}</p>
              {i < nt ? <p className="q7-s08-v"><b>{v[i] === null ? "sem recusados" : pct(v[i]!, 0)}</b> = {t.num} ÷ ({t.den}) = {cont[i][0]} ÷ {cont[i][1]}</p> : <p className="q7-s08-v q7-nota">{t.frase}</p>}
            </div>
          ))}
          <div className="q7-botoes"><Botao prim onClick={() => setNt(Math.min(3, nt + 1))} desab={nt >= 3}>Revelar a próxima taxa</Botao><Botao sec onClick={() => { setNt(0); setCorte(0.14); }}>Restaurar</Botao></div>
        </Painel>
      </div>
    </Quadro>
  );
}
