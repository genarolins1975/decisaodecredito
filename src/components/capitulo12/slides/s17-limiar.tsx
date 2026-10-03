"use client";
import { useState } from "react";
import { Botao, Controle, Kpi, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { Figura } from "../pecas";
import { FONTE_MNIST, M_SGD } from "@/lib/capitulo12/dados";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 17 · c12p17 · O score vira decisão quando cruza o limiar. Prova: os mesmos doze dígitos, com o limiar em três
 * posições, dão precisão 75%, 80% e 100% e recall 100%, 67% e 50%. A figura original (Géron, cap. 3) fica à vista; a
 * fita reproduz os doze dígitos na ordem do score e o controle move o limiar entre as 13 posições, com precisão e recall
 * ao vivo; a linha da tabela da aula acende quando o limiar está numa das três posições da figura. Números: contagem
 * na própria fita (a lista abaixo transcreve a figura). Estado inicial: limiar intermediário (posição 7). "Restaurar"
 * volta a ele.
 */
// Rótulos dos doze dígitos da figura limiar-doze-digitos (Géron, Mãos à obra, cap. 3), da esquerda para a direita, em
// ordem crescente de score. É a única lista digitada do slide: transcreve a figura, e as três contas abaixo a conferem.
const DIGITOS_FIGURA = [8, 7, 3, 9, 5, 2, 5, 5, 6, 5, 5, 5] as const;
const N5 = DIGITOS_FIGURA.filter((d) => d === 5).length;
/** Com o limiar na posição k (0 a 12), os dígitos de índice k em diante são previstos 5. */
const conta = (k: number) => { const acima = DIGITOS_FIGURA.slice(k); const vp = acima.filter((d) => d === 5).length; return { vp, prev: acima.length, prec: acima.length ? vp / acima.length : null, rec: vp / N5 }; };
const LINHAS = [{ k: 4, nome: "Mais baixo" }, { k: 7, nome: "Intermediário" }, { k: 9, nome: "Mais alto" }];
{
  const [a, b, c] = LINHAS.map((l) => conta(l.k));
  if (N5 !== 6 || a.vp !== 6 || a.prev !== 8 || b.vp !== 4 || b.prev !== 5 || c.vp !== 3 || c.prev !== 3) throw new Error("s17: a fita não reproduz 6/8, 4/5 e 3/3 da figura");
}
const K0 = 7;

export function S17Limiar({ pagina }: { pagina?: Pagina }) {
  const [k, setK] = useState(K0);
  const r = conta(k);
  const fr = (a: number, b: number) => `${int(a)}/${int(b)}`;
  return (
    <Quadro slug="c12p17" pagina={pagina} layout="um"
      conclusao={<>Com o limiar na posição {k}, o modelo diz 5 para {int(r.prev)} dígito{r.prev === 1 ? "" : "s"}: precisão <b>{r.prec === null ? "indefinida (0/0)" : `${fr(r.vp, r.prev)} = ${pct(r.prec, 0)}`}</b>, recall <b>{fr(r.vp, N5)} = {pct(r.rec, 0)}</b>. Subir o limiar troca recall por precisão; o slide {SLIDE.c12p18.n} faz isso com as {int(M_SGD.n)} imagens.</>}
      fonte={`Doze dígitos da figura de Géron (cap. 3), na ordem do score: contagem direta, não a base de ${int(M_SGD.n)} imagens. ${FONTE_MNIST}.`}>
      <div className="q12-s17">
        <Painel className="q12-s17-fita">
          <ol className="q12-s17-ds" aria-label={`Doze dígitos em ordem crescente de score; o limiar está antes do dígito ${k + 1}`}>
            {DIGITOS_FIGURA.map((d, i) => {
              const diz5 = i >= k, e5 = d === 5;
              const t = diz5 ? (e5 ? "vp" : "fp") : e5 ? "fn" : "vn";
              return (
                <li key={i} data-t={t} data-lim={i === k ? "1" : undefined}>
                  <span className="q12-s17-d">{d}</span>
                  <small>{t === "vp" ? "acerto" : t === "fp" ? "alarme falso" : t === "fn" ? "5 perdido" : "acerto"}</small>
                </li>
              );
            })}
            <li className="q12-s17-fim" data-lim={k === 12 ? "1" : undefined} aria-hidden="true" />
          </ol>
          <div className="q12-s17-eixo" aria-hidden="true"><span>← previsto não 5</span><b>score →</b><span>previsto 5 →</span></div>
          <Controle rotulo="Posição do limiar (0 a 12)" valor={k} min={0} max={12} passo={1} onChange={setK} mostrar={`${k}: ${int(r.prev)} previsto${r.prev === 1 ? "" : "s"} 5`} />
        </Painel>
        <Painel className="q12-s17-fig" tom="plano">
          <Figura src="limiar-doze-digitos" alt="Doze dígitos manuscritos ordenados pelo score, com três limiares: precisão 6/8, 4/5 e 3/3 e recall 6/6, 4/6 e 3/6" credito="Géron, Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow, cap. 3" />
        </Painel>
        <Painel className="q12-s17-num">
          <Kpi rotulo="Precisão" valor={r.prec === null ? "0/0" : pct(r.prec, 0)} detalhe={r.prec === null ? "indefinida: nada previsto 5" : `${fr(r.vp, r.prev)} previstos 5 são 5`} tom="prob" />
          <Kpi rotulo="Recall" valor={pct(r.rec, 0)} detalhe={`${fr(r.vp, N5)} cincos encontrados`} tom="prob" />
        </Painel>
        <Painel className="q12-s17-tab">
          <table className="q7-tab">
            <thead><tr><th className="q7-t-l">Limiar da figura</th><th>Precisão</th><th>Recall</th></tr></thead>
            <tbody>
              {LINHAS.map((l) => { const c = conta(l.k); return (
                <tr key={l.k} data-on={k === l.k ? "1" : undefined}>
                  <th scope="row"><button type="button" className="q12-s17-ir" onClick={() => setK(l.k)} aria-pressed={k === l.k}>{l.nome}</button></th>
                  <td>{fr(c.vp, c.prev)} = {pct(c.prec!, 0)}</td><td>{fr(c.vp, N5)} = {pct(c.rec, 0)}</td>
                </tr>
              ); })}
            </tbody>
          </table>
          <div className="q7-botoes"><Botao sec onClick={() => setK(K0)} desab={k === K0}>Restaurar</Botao></div>
        </Painel>
      </div>
    </Quadro>
  );
}
