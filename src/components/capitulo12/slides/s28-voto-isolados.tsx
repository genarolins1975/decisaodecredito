"use client";
import { useState } from "react";
import { Grafico, Painel, Previsao, Quadro, type Opcao, type Pagina } from "@/components/capitulo7/base";
import { ACERTOS_LUAS, FONTE_LUAS, LUAS, N_TESTE_LUAS, type ModeloLua } from "@/lib/capitulo12/dados";
import { ERROS, SOBRE, UM_ACERTO, Y_TESTE } from "@/lib/capitulo12/b3";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 28 · c12p28 · O voto vence os modelos isolados, por poucos acertos. Peça principal: a matriz de erros nos pontos de
 * teste em que algum modelo erra (uma coluna por ponto, uma linha por modelo, célula cheia = erro), com as colunas
 * agrupadas por quantos dos três votantes erram (três, dois, um). Ela mostra que os erros são correlacionados: os três
 * erram juntos em 6 pontos, contra 0,2 esperado se errassem de forma independente; e que o hard voting erra exatamente
 * onde dois ou três erram. Tudo calculado das strings de previsão (b3.ts). Previsão antes de revelar: quantos pontos erra
 * o hard voting? As linhas do hard e do soft, a tabela e as conclusões só aparecem depois da tentativa. Estado
 * inicial: só as três linhas dos isolados; "Tentar outra" volta a ele.
 */
const ISOL: { k: ModeloLua; nome: string }[] = [{ k: "lr", nome: "Logística" }, { k: "rf10", nome: "Floresta 10" }, { k: "svc", nome: "SVC" }];
const VOTO: { k: ModeloLua; nome: string }[] = [{ k: "hard", nome: "Hard voting" }, { k: "soft", nome: "Soft voting" }];
const TABELA: { k: ModeloLua; nome: string }[] = [
  { k: "lr", nome: "Regressão logística" }, { k: "rf10", nome: "Floresta (10 árvores)" }, { k: "svc", nome: "SVC" }, { k: "hard", nome: "Hard voting" }, { k: "soft", nome: "Soft voting" },
];
// colunas: pontos em que algum dos cinco modelos erra, agrupados por quantos dos três isolados erram (3, 2, 1, 0)
const TODOS: ModeloLua[] = ["lr", "rf10", "svc", "hard", "soft"];
const COLS = Y_TESTE.map((_, i) => i).filter((i) => TODOS.some((k) => ERROS[k].includes(i))).sort((a, b) => SOBRE.quantos[b] - SOBRE.quantos[a] || a - b);
const GRUPOS = [3, 2, 1, 0].map((q) => ({ q, n: COLS.filter((i) => SOBRE.quantos[i] === q).length, ini: COLS.findIndex((i) => SOBRE.quantos[i] === q) })).filter((g) => g.n > 0);
const SVC_ERROS = ERROS.svc.length, HARD_ERROS = ERROS.hard.length;
if (SOBRE.tres + SOBRE.dois !== HARD_ERROS) throw new Error("s28: o hard voting deveria errar onde dois ou três erram");
const OPS: Opcao[] = [
  { texto: `Uns ${int(Math.round(SOBRE.esperadoMaioria))}: com três votos, a maioria corrige quase tudo`, certa: false, retorno: <>Seria o esperado se os três errassem de forma independente ({num(SOBRE.esperadoMaioria, 1)}). Mas em {int(SOBRE.tres)} pontos os três erram juntos, e o voto não salva nenhum deles.</> },
  { texto: `${int(HARD_ERROS)}: só ${int(SVC_ERROS - HARD_ERROS)} a menos que o SVC`, certa: true, retorno: <>Isso: a maioria erra onde dois ou três erram, {int(SOBRE.tres)} + {int(SOBRE.dois)} = {int(HARD_ERROS)} pontos. Os erros andam juntos, e o ganho é pequeno.</> },
  { texto: `${int(ERROS.lr.length)} ou mais: o voto herda os erros do pior`, certa: false, retorno: <>Um erro isolado é vencido pelos outros dois votos: os {int(SOBRE.um)} pontos em que só um erra viram acerto do conjunto.</> },
];

export function S28VotoIsolados({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const rev = esc !== null;
  const linhas = rev ? [...ISOL, ...VOTO] : ISOL;
  const tab = (
    <table><caption>Erros por ponto de teste</caption><thead><tr><th>Modelo</th><th>Erros</th></tr></thead>
      <tbody>{linhas.map((l) => <tr key={l.k}><td>{l.nome}</td><td>{int(ERROS[l.k].length)}</td></tr>)}</tbody></table>
  );
  return (
    <Quadro slug="c12p28" pagina={pagina} layout="gl"
      conclusao={rev
        ? <>O hard voting acerta {int(ACERTOS_LUAS.hard)} de {int(N_TESTE_LUAS)}, <b>{int(ACERTOS_LUAS.hard - ACERTOS_LUAS.svc)} a mais que o SVC</b>; o soft, {int(ACERTOS_LUAS.soft)}. Os três erram juntos em {int(SOBRE.tres)} pontos, onde nenhum voto ajuda. Bagging busca erros menos parecidos (slide {SLIDE.c12p29.n}).</>
        : <>Os três isolados erram {int(ERROS.lr.length)}, {int(ERROS.rf10.length)} e {int(SVC_ERROS)} pontos de teste, e em {int(SOBRE.tres)} deles erram juntos. Antes de revelar: quantos erra o voto da maioria?</>}
      fonte={`${FONTE_LUAS}. Erros calculados das previsões gravadas pela referência; esperado sob independência com as taxas de erro observadas de cada modelo.`}>
      <Painel className="q12-s28-g">
        <Grafico titulo="Onde cada modelo erra" sub={`${int(COLS.length)} pontos de teste em que algum modelo erra; nos outros ${int(N_TESTE_LUAS - COLS.length)}, todos acertam`} tabela={tab} arCelular="16 / 9"
          rotulo={`Matriz de erros: ${linhas.map((l) => `${l.nome} erra ${int(ERROS[l.k].length)}`).join("; ")}. Os três isolados erram juntos em ${int(SOBRE.tres)} pontos.`}>
          {(d) => {
            const lw = d.fs * 6.2, topo = d.fs * 2.6, linhasN = ISOL.length + VOTO.length;
            const cw = (d.w - lw - d.fs * 3.2) / COLS.length;
            const ch = Math.min(cw * 2.4, (d.h - topo - d.fs * 2.4) / (linhasN + 0.5));
            const y = (j: number) => topo + (j < ISOL.length ? j : j + 0.5) * ch;
            return (
              <g>
                {GRUPOS.map((g) => {
                  const x0 = lw + g.ini * cw, x1 = lw + (g.ini + g.n) * cw;
                  const rot = g.q === 3 ? `os três erram: ${int(g.n)}` : g.q === 2 ? `dois erram: ${int(g.n)}` : g.q === 1 ? `um erra: ${int(g.n)}` : `só o soft: ${int(g.n)}`;
                  return (
                    <g key={g.q}>
                      <line x1={x0 + 1} x2={x1 - 1} y1={topo - d.fs * 0.6} y2={topo - d.fs * 0.6} stroke={g.q >= 2 ? "#8C2332" : "#9AA1AD"} strokeWidth={2} />
                      <text className="q7-rot--peq" x={(x0 + x1) / 2} y={topo - d.fs * 1} textAnchor="middle" style={{ fill: g.q >= 2 ? "#8C2332" : "#5B6475", fontWeight: g.q >= 2 ? 700 : 500 }}>{g.n * cw > d.fs * 5 ? rot : int(g.n)}</text>
                    </g>
                  );
                })}
                {linhas.map((l, j) => (
                  <g key={l.k}>
                    <text className="q7-rot--peq" x={lw - d.fs * 0.5} y={y(j) + ch / 2} dy=".35em" textAnchor="end" style={{ fill: "#00205B", fontWeight: j >= ISOL.length ? 700 : 600 }}>{l.nome}</text>
                    {COLS.map((i, c) => {
                      const erra = ERROS[l.k].includes(i);
                      return <rect key={i} x={lw + c * cw + 1} y={y(j) + 1} width={cw - 2} height={ch - 2} rx={2} fill={erra ? "#8C2332" : "#EEF0F3"} />;
                    })}
                    <text className="q7-rot--peq" x={lw + COLS.length * cw + d.fs * 0.4} y={y(j) + ch / 2} dy=".35em" style={{ fill: "#8C2332", fontWeight: 700 }}>{int(ERROS[l.k].length)}</text>
                  </g>
                ))}
                {!rev && VOTO.map((l, j) => (
                  <g key={l.k}>
                    <text className="q7-rot--peq" x={lw - d.fs * 0.5} y={y(ISOL.length + j) + ch / 2} dy=".35em" textAnchor="end" style={{ fill: "#5B6475" }}>{l.nome}</text>
                    <rect x={lw + 1} y={y(ISOL.length + j) + 1} width={COLS.length * cw - 2} height={ch - 2} rx={3} fill="none" stroke="#B5BAC4" strokeDasharray="5 4" />
                    <text className="q7-rot--peq" x={lw + (COLS.length * cw) / 2} y={y(ISOL.length + j) + ch / 2} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>?</text>
                  </g>
                ))}
                <text className="q7-rot--peq" x={lw} y={y(linhasN - 1) + ch + d.fs * 1.3} style={{ fill: "#5B6475" }}>■ erro · cada coluna é um ponto de teste</text>
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel className="q12-s28-dir">
        <Previsao pergunta={`O SVC, melhor dos três, erra ${int(SVC_ERROS)} pontos. Quantos erra o voto da maioria (hard voting)?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        {rev && <>
          <table className="q7-tab q12-s28-tab">
            <thead><tr><th className="q7-t-l">Modelo</th><th>Acurácia no teste</th><th>Acertos em {int(N_TESTE_LUAS)}</th></tr></thead>
            <tbody>{TABELA.map((t) => <tr key={t.k} data-on={t.k === "hard" || t.k === "soft" ? "1" : undefined}><th>{t.nome}</th><td>{num(LUAS.modelos[t.k].acc, 3)}</td><td>{int(ACERTOS_LUAS[t.k])}</td></tr>)}</tbody>
          </table>
          <p className="q7-nota q12-s28-cv">Diferenças de 1 a 3 acertos ({num(UM_ACERTO * 100, 1)} a {num(3 * UM_ACERTO * 100, 1)} pontos) pedem validação cruzada antes de qualquer conclusão.</p>
        </>}
        {!rev && <p className="q7-nota">Se os três errassem de forma independente, errariam juntos em {num(SOBRE.esperadoTres, 1)} ponto, em média. Na matriz, são {int(SOBRE.tres)}.</p>}
      </Painel>
    </Quadro>
  );
}
