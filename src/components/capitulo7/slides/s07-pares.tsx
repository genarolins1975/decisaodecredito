"use client";
import { useState } from "react";
import { Botao, Formula, Painel, Previsao, Quadro, Seg, type Opcao, type Pagina } from "../base";
import { MINI, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 07 · c7p22 · AUC exata na mini-base: a matriz dos 5 × 15 = 75 pares, cada célula valendo 1, ½ ou 0. Com a PD
 * arredondada a pontos inteiros há um empate (#179 e #64, ambos 17%); em precisão plena ele vira inversão (16,74%
 * contra 17,19%) e a AUC cai de 0,8067 para 0,8000. A previsão só abre depois de "Todos os pares" mostrar o ½ e
 * pergunta o que se deduz da tela: quanto a AUC pode mudar (½ ÷ 75, nos dois sentidos); só a resposta certa troca a PD. A linha do #85 já vem preenchida
 * como exemplo. A AUC destes 20 casos não é a da janela (slide 6): a diferença é a variação de uma amostra de 20.
 * Nenhum par é "observação independente": cada proposta aparece em vários pares.
 */
const DS = MINI.filter((m) => m.y).sort((a, b) => b.pd - a.pd || b.pdPlena - a.pdPlena);
const AS = MINI.filter((m) => !m.y).sort((a, b) => b.pd - a.pd || b.pdPlena - a.pdPlena);
type Modo = "um" | "todos";
const valor = (a: number, b: number) => (a > b ? 1 : a === b ? 0.5 : 0);
const simbolo = (v: number) => (v === 1 ? "1" : v === 0.5 ? "½" : "0");
const AUC_J = aucPorPares(Y, PL).auc!;
const AUC_I = aucPorPares(MINI.map((m) => m.y), MINI.map((m) => m.pd)).auc!, AUC_P = aucPorPares(MINI.map((m) => m.y), MINI.map((m) => m.pdPlena)).auc!;
// o par que empata em pontos inteiros: um default e um adimplente com a mesma PD arredondada
const EMP = (() => { for (const d of DS) for (const a of AS) if (d.pd === a.pd) return { d, a }; return null; })();
const fp2 = (m: (typeof MINI)[number]) => pct(m.pdPlena, 2);
const PASSO = 0.5 / (DS.length * AS.length); // um empate desfeito: ½ ponto sobre 75 pares
const SENT = AUC_P < AUC_I ? "caiu" : AUC_P > AUC_I ? "subiu" : "ficou";
const PAR = EMP ? <>#{EMP.d.id} ({fp2(EMP.d)}) fica {EMP.d.pdPlena < EMP.a.pdPlena ? "abaixo" : "acima"} de #{EMP.a.id} ({fp2(EMP.a)})</> : null;
// a pergunta é dedutível da tela: o ½ só pode virar 1 ou 0, e cada par pesa 1/75
const OPCOES: Opcao[] = [
  { texto: <>Sobe {num(PASSO, 4)}: mais casas, mais acerto</>, retorno: <>Confunde precisão com acerto. Em precisão plena cada empate vira 1 ou 0; a direção depende do par, não do número de casas.</> },
  { texto: <>Até {num(PASSO, 4)} (½ ÷ {DS.length * AS.length}), nos dois sentidos</>, certa: true, retorno: <>Isso: o ½ vira 1 ou 0. Aqui {PAR}: o ½ vira {EMP && EMP.d.pdPlena > EMP.a.pdPlena ? "1" : "0"} e a AUC {SENT} de {num(AUC_I, 4)} para {num(AUC_P, 4)}.</> },
  { texto: "Nada: a ordem não muda", retorno: <>O arredondamento criou um empate que a precisão plena desfaz: um par de {DS.length * AS.length} deixa de valer ½, e a AUC anda {num(PASSO, 4)} num sentido ou no outro.</> },
];

export function S07Pares({ pagina }: { pagina?: Pagina }) {
  const [modo, setModo] = useState<Modo>("um");
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [esc, setEsc] = useState<number | null>(null);
  const plena = esc !== null && !!OPCOES[esc].certa; // só a resposta certa troca a PD
  const pdv = (m: (typeof MINI)[number]) => (plena ? m.pdPlena : m.pd);
  const c = aucPorPares(MINI.map((m) => m.y), MINI.map(pdv));
  const somaLinha = DS.map((d) => AS.reduce((s, a) => s + valor(pdv(d), pdv(a)), 0));
  const fmtPd = (m: (typeof MINI)[number]) => pct(pdv(m), plena ? 1 : 0);
  const s = sel ? { d: DS[sel[0]], a: AS[sel[1]] } : null; const v = s ? valor(pdv(s.d), pdv(s.a)) : null;
  return (
    <Quadro slug="c7p22" pagina={pagina} layout="glx"
      conclusao={modo === "todos" || plena ? <>Soma {num(c.corretos + 0.5 * c.empates, 1)} sobre {c.pares} pares: <b>AUC {num(c.auc!, 4)} nestes 20 casos</b>{plena ? `, contra ${num(AUC_I, 4)} em pontos inteiros` : ""}{plena && AUC_I !== AUC_P ? <>: <b>arredondar a PD {AUC_I > AUC_P ? "inflou" : "reduziu"} a AUC</b></> : ""}. Na janela, {num(AUC_J, 4)}: a diferença é a variação de uma amostra de 20. A conta mede ordenação, não nível.</>
        : s ? <>#{s.d.id} ({fmtPd(s.d)}) contra #{s.a.id} ({fmtPd(s.a)}): {v === 1 ? "o default ficou acima, vale 1" : v === 0.5 ? "empate, vale ½" : "o adimplente ficou acima, vale 0"}.</>
        : <>A linha do #{DS[0].id} já está preenchida: soma {num(somaLinha[0], 1)} de {AS.length}. Clique numa célula: cada uma é um par, um default contra um adimplente.</>}
      fonte="Mini-base de 20 propostas da janela fora do tempo (5 defaults, 15 adimplentes), PD da logística. As mesmas propostas aparecem em vários pares: os 75 pares não são observações independentes.">
      <Painel titulo={`Linhas: os 5 defaults · colunas: os 15 adimplentes · PD ${plena ? "em precisão plena" : "em pontos inteiros"}`}>
        <div className="q7-s07-wrap">
          <table className="q7-s07" aria-label="Matriz de pares da mini-base">
            <thead><tr><th scope="col"><span className="q7-sr">Default</span></th>{AS.map((a, j) => <th key={a.id} scope="col" data-on={sel?.[1] === j ? "1" : undefined}>#{a.id}<small>{fmtPd(a)}</small></th>)}<th scope="col">soma</th></tr></thead>
            <tbody>{DS.map((d, i) => (
              <tr key={d.id}><th scope="row" data-on={sel?.[0] === i ? "1" : undefined}>#{d.id}<small>{fmtPd(d)}</small></th>
                {AS.map((a, j) => { const val = valor(pdv(d), pdv(a)); const on = modo === "todos" || plena || i === 0 || (sel?.[0] === i && sel?.[1] === j); return (
                  <td key={a.id}><button type="button" className="q7-s07-c" data-v={on ? String(val) : undefined} data-sel={(sel?.[0] === i && sel?.[1] === j) || (plena && EMP && d.id === EMP.d.id && a.id === EMP.a.id) ? "1" : undefined} onClick={() => setSel([i, j])} aria-label={`#${d.id} contra #${a.id}: ${on ? (val === 1 ? "vale 1" : val === 0.5 ? "empate, vale meio" : "vale 0") : "ainda não comparado"}`}>{on ? simbolo(val) : ""}</button></td>
                ); })}
                <td className="q7-s07-soma">{modo === "todos" || plena || i === 0 ? num(somaLinha[i], 1) : ""}</td></tr>))}
            </tbody>
          </table>
        </div>
        <p className="q7-nota">Célula 1: o default recebeu PD maior. ½: PDs iguais. 0: o adimplente recebeu PD maior.</p>
      </Painel>
      <Painel titulo="A conta exata" className="q7-s07-lat">
        <div className="q7-s07-topo"><Seg rotulo="Modo" opcoes={[{ v: "um" as Modo, r: "Um par" }, { v: "todos" as Modo, r: "Todos os pares" }]} valor={plena ? "todos" : modo} onChange={setModo} /><Botao sec onClick={() => { setModo("um"); setSel(null); setEsc(null); }}>Restaurar</Botao></div>
        <dl className="q7-lista q7-s07-l q7-s07v3-l">
          <div><dt>C: valem 1</dt><dd>{modo === "todos" || plena ? c.corretos : "?"}</dd></div>
          <div data-tom="mudo"><dt>E: empates</dt><dd>{modo === "todos" || plena ? c.empates : "?"}</dd></div>
          <div><dt>Valem 0</dt><dd>{modo === "todos" || plena ? c.invertidos : "?"}</dd></div>
          <div><dt>AUC</dt><dd>{modo === "todos" || plena ? num(c.auc!, 4) : "?"}</dd></div>
        </dl>
        {(modo === "um" && esc === null) || (esc !== null && OPCOES[esc].certa) ? <Formula compacta f={String.raw`\mathrm{AUC}=\frac{C+\tfrac12\,E}{n_D\times n_A}=\frac{C+\tfrac12\,E}{${DS.length}\times ${AS.length}}`} /> : null}
        {modo === "todos" || esc !== null
          ? <Previsao rotulo="Antes de mudar a PD" pergunta={EMP ? <>O par #{EMP.d.id} × #{EMP.a.id} vale ½. Com a PD sem arredondar, quanto a AUC pode mudar?</> : "Em precisão plena, quanto a AUC pode mudar?"} opcoes={OPCOES} escolha={esc} onEscolha={setEsc} recolher />
          : <p className="q7-nota">Abra “Todos os pares” para ver o empate e a pergunta seguinte.</p>}
      </Painel>
    </Quadro>
  );
}
