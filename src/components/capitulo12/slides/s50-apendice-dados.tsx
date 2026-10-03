"use client";
import { Fragment, useState } from "react";
import { Botao, Grafico, Painel, Quadro, Seg, escala, type Pagina } from "@/components/capitulo7/base";
import { CASO, CORTE, FONTE_CASO, META_VOLUME, REGRAS, type NomeRegra } from "@/lib/capitulo12/dados";
import { HORIZONTES, HZ, IV_FORTE, IV_FRACO, LIDER_RECALL, forcaIV, type Horizonte } from "@/lib/capitulo12/b4";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 50 · c12p50 · Apêndice: os dados do caso, como nos quadros do apêndice da aula. Para cada regra, o grupo removido e o
 * mantido, com contratos, bons e maus (CASO, base.json), e o que sai deles em avaliaCorte: população %, WoE = ln(%
 * bons ÷ % maus), taxa de maus e IV (calculado; arredonda para o declarado no material, conferido em b4.ts). Abaixo, o
 * resumo do corte (volume, precisão, recall, maus no restante, IV). À direita, a régua de IV de Siddiqi com as três
 * regras do horizonte. O seletor troca o horizonte; no longo prazo, os contratos sem classificação (contratos − bons −
 * maus) ficam fora de precisão e recall. Estado inicial: curto prazo; "Restaurar" volta a ele.
 */
const SIMB: Record<NomeRegra, string> = { politica: "●", never_paid: "▲", combinada: "◆" };

export function S50ApendiceDados({ pagina }: { pagina?: Pagina }) {
  const [h, setH] = useState<Horizonte>("curto");
  const C = CORTE[h], R = CASO[h].regras;
  const sem = C.politica.semClassificacao;
  const lider = REGRAS.find((r) => r.id === LIDER_RECALL(h))!;
  return (
    <Quadro slug="c12p50" pagina={pagina} layout="gl"
      conclusao={<>{HZ[h].nome}: {int(C.politica.contratos)} contratos, <b>{int(C.politica.maus)} maus</b> entre {int(C.politica.classificados)} classificados ({pct(C.politica.taxaMaus, 1)}). A regra {lider.nome} lidera o recall ({pct(C[lider.id].recall, 1)}) e recusa {pct(C[lider.id].volume, 1)}, acima da meta de {pct(META_VOLUME, 0)}.</>}
      fonte={`${FONTE_CASO}. Alvo ${HZ[h].alvo}. WoE = ln(% dos bons ÷ % dos maus) do grupo; IV = Σ (% bons − % maus) × WoE; volume sobre o total de contratos.`}>
      <Painel className="q12-s50-esq">
        <p className="q7-k">Contagens por regra e grupo, {HZ[h].nome.toLowerCase()}</p>
        <table className="q7-tab q12-s50-tab">
          <thead><tr><th className="q7-t-l">Regra</th><th className="q7-t-l">Grupo</th><th>Contratos</th><th>Bons</th><th>Maus</th><th>Pop. %</th><th>WoE</th><th>Taxa de maus</th><th>IV</th></tr></thead>
          <tbody>{REGRAS.map((r) => {
            const g = R[r.id], c = C[r.id];
            const linhas = [{ nome: "remover (corte)", v: g.corte, w: c.woe[0] }, { nome: "manter", v: g.resto, w: c.woe[1] }];
            return (
              <Fragment key={r.id}>{linhas.map((l, j) => (
                <tr key={l.nome} data-grupo={j === 0 ? "corte" : "resto"}>
                  {j === 0 && <th className="q7-t-l" rowSpan={2}>{SIMB[r.id]} {r.nome}</th>}
                  <td className="q7-t-l">{l.nome}</td>
                  <td>{int(l.v[0])}</td><td>{int(l.v[1])}</td><td>{int(l.v[2])}</td>
                  <td>{num((l.v[0] / c.contratos) * 100, 2)}</td><td>{num(l.w, 2)}</td><td>{pct(l.v[2] / (l.v[1] + l.v[2]), 1)}</td>
                  {j === 0 && <td rowSpan={2} className="q12-s50-iv">{num(c.iv, 3)}</td>}
                </tr>
              ))}</Fragment>
            );
          })}</tbody>
        </table>
        <p className="q7-k">{h === "longo" ? "Corte no longo prazo: a combinação segue líder em recall" : "Corte no curto prazo"}</p>
        <table className="q7-tab q12-s50-tab">
          <thead><tr><th className="q7-t-l">Regra</th><th>Volume do corte</th><th>Precisão: maus no corte</th><th>Recall: maus capturados</th><th>Maus no restante</th><th>IV</th></tr></thead>
          <tbody>{REGRAS.map((r) => {
            const c = C[r.id];
            return <tr key={r.id}><th className="q7-t-l">{SIMB[r.id]} {r.nome}</th><td data-fora={c.volume >= META_VOLUME ? "1" : undefined}>{pct(c.volume, 1)}</td><td>{pct(c.precisao, 1)}</td><td>{pct(c.recall, 1)}</td><td>{pct(c.mausNoResto, 1)}</td><td>{num(c.iv, 3)}</td></tr>;
          })}</tbody>
        </table>
      </Painel>
      <Painel>
        <div className="q12-s50-ctl">
          <Seg rotulo="Horizonte" opcoes={HORIZONTES.map((x) => ({ v: x.v, r: x.nome }))} valor={h} onChange={setH} />
          <Botao sec onClick={() => setH("curto")} desab={h === "curto"}>Restaurar</Botao>
        </div>
        <Grafico titulo="IV na régua de Siddiqi" rotulo={`Régua de IV: fraco abaixo de ${num(IV_FRACO, 1)}, médio até ${num(IV_FORTE, 1)}, forte acima. ${REGRAS.map((r) => `${r.nome}: ${num(C[r.id].iv, 3)}, ${forcaIV(C[r.id].iv)}`).join("; ")}`} arCelular="16 / 9">
          {(d) => {
            const l = d.fs * 0.8, rr = d.fs * 0.8, max = 0.4;
            const x = escala([0, max], [l, d.w - rr]);
            const yb = d.h * 0.42, hb = d.fs * 1.5;
            const zonas = [{ de: 0, ate: IV_FRACO, r: "fraco", c: "#EEF0F3" }, { de: IV_FRACO, ate: IV_FORTE, r: "médio", c: "#E3EEF0" }, { de: IV_FORTE, ate: max, r: "forte", c: "#CFE3E5" }];
            const ord = [...REGRAS].sort((a, b) => C[a.id].iv - C[b.id].iv);
            return (
              <g>
                {zonas.map((z) => (
                  <g key={z.r}>
                    <rect x={x(z.de)} y={yb} width={x(z.ate) - x(z.de)} height={hb} fill={z.c} stroke="#fff" strokeWidth={2} />
                    <text className="q7-rot--peq" x={(x(z.de) + x(z.ate)) / 2} y={yb + hb / 2} dy=".35em" textAnchor="middle" style={{ fill: "#2A3342" }}>{z.r}</text>
                  </g>
                ))}
                {[0, IV_FRACO, IV_FORTE, max].map((t) => <text key={t} className="q7-tick" x={x(t)} y={yb + hb} dy="1.2em" textAnchor="middle">{num(t, 1)}</text>)}
                {ord.map((r, i) => {
                  const cx = x(C[r.id].iv), ty = yb - d.fs * (0.9 + 1.25 * (ord.length - 1 - i));
                  return (
                    <g key={r.id} className="q7-anim-d">
                      <line x1={cx} x2={cx} y1={ty + d.fs * 0.3} y2={yb + hb} stroke="#176C73" strokeWidth={2} />
                      <text className="q7-rot--peq" x={cx} y={ty} textAnchor={cx > d.w * 0.6 ? "end" : "start"} dx={cx > d.w * 0.6 ? "-.3em" : ".3em"} style={{ fill: "#176C73", fontWeight: 700 }}>{SIMB[r.id]} {num(C[r.id].iv, 3)}</text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        </Grafico>
        <p className="q7-nota">IV: fraco abaixo de {num(IV_FRACO, 1)}, médio de {num(IV_FRACO, 1)} a {num(IV_FORTE, 1)}, forte acima (Siddiqi).</p>
        <p className="q7-nota">{sem ? <>No longo prazo, <b>{int(sem)} contratos</b> (contratos − bons − maus) não são bons nem maus e ficam fora de precisão e recall; o material não informa o motivo.</> : <>No curto prazo, todo contrato é bom ou mau: contratos = bons + maus.</>}</p>
      </Painel>
    </Quadro>
  );
}
