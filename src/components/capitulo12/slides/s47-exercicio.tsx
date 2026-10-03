"use client";
import { useState } from "react";
import { Botao, Eixos, Grafico, Painel, Previsao, Quadro, Seg, escala, margens, type Pagina } from "@/components/capitulo7/base";
import { CORTE, FONTE_CASO, META_VOLUME, REGRAS, type NomeRegra } from "@/lib/capitulo12/dados";
import { HORIZONTES, HZ, RAZAO_RECALL, forcaIV, type Horizonte } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct, vezes } from "@/lib/capitulo7/formato";

/**
 * 47 · c12p47 · Exercício do comitê: política, modelo ou os dois? A turma escolhe antes de ver os números (três regras
 * e "depende do que o comitê aceita trocar"); a escolha revela o gráfico de volume do corte (x) contra recall (y), com
 * a meta de volume (META_VOLUME) como linha âmbar, e a tabela da aula: volume, precisão, recall, maus no restante e IV,
 * todos de CORTE (avaliaCorte sobre as contagens do caso; IV calculado, com a régua de Siddiqi de b4.ts). O seletor
 * troca o horizonte. As frases "quase dobra" e "só a política cumpre a meta" são conferidas em b4.ts. Estado inicial:
 * previsão em aberto, curto prazo; "Restaurar" volta a ele.
 */
const SIMB: Record<NomeRegra, string> = { politica: "●", never_paid: "▲", combinada: "◆" };
const K = CORTE.curto;
const OPS = [
  { texto: "Política BACEN", certa: true, retorno: <>É a única que cumpre a meta: recusa {pct(K.politica.volume, 1)} da base, com a maior precisão ({pct(K.politica.precisao, 1)}). O preço: captura só {pct(K.politica.recall, 1)} dos maus.</> },
  { texto: "Never Paid", certa: false, retorno: <>Recusa {pct(K.never_paid.volume, 1)}: já passa da meta, com precisão menor que a da política ({pct(K.never_paid.precisao, 1)} contra {pct(K.politica.precisao, 1)}). Usar um modelo não basta para a regra caber na meta.</> },
  { texto: "Política e modelo", certa: false, retorno: <>Captura mais maus ({pct(K.combinada.recall, 1)}), mas recusa {pct(K.combinada.volume, 1)} da base, acima da meta de {pct(META_VOLUME, 0)}. Só vale se o comitê aceitar recusar mais.</> },
  { texto: "Depende do que o comitê aceita trocar", certa: true, retorno: <>Isso: com a meta de {pct(META_VOLUME, 0)}, só a política cabe; se o comitê aceitar recusar {pct(K.combinada.volume, 1)}, a combinação quase dobra o recall.</> },
];

export function S47Exercicio({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [h, setH] = useState<Horizonte>("curto");
  const aberto = esc !== null;
  const C = CORTE[h];
  return (
    <Quadro slug="c12p47" pagina={pagina} layout="gl"
      conclusao={!aberto ? <>Escolha antes de ver os números: o gráfico se preenche com a sua resposta.</>
        : h === "curto" ? <>A combinação quase dobra o recall da política (<b>{pct(K.combinada.recall, 1)} contra {pct(K.politica.recall, 1)}</b>, {vezes(RAZAO_RECALL, 1)}), mas recusa <b>{pct(K.combinada.volume, 1)}</b> da base, acima da meta de {pct(META_VOLUME, 0)}. Só a política cumpre a meta. Síntese no slide {SLIDE.c12p48.n}.</>
          : <>No longo prazo a ordem se mantém: a combinação lidera o recall (<b>{pct(C.combinada.recall, 1)}</b>) e recusa {pct(C.combinada.volume, 1)}; só a política (<b>{pct(C.politica.volume, 1)}</b>) cumpre a meta.</>}
      fonte={`${FONTE_CASO}. ${HZ[h].nome}: alvo ${HZ[h].alvo}; ${int(C.politica.contratos)} contratos${C.politica.semClassificacao ? `, dos quais ${int(C.politica.semClassificacao)} sem classificação ficam fora de precisão e recall` : ""}. Volume sobre o total de contratos; IV pela régua de Siddiqi.`}>
      <Painel className="q12-s47-esq">
        <Grafico titulo="Volume do corte contra recall" sub={aberto ? HZ[h].nome.toLowerCase() : "os pontos aparecem com a sua escolha"}
          rotulo={aberto ? `Volume do corte contra recall no ${HZ[h].nome.toLowerCase()}: ${REGRAS.map((r) => `${r.nome}, volume ${pct(C[r.id].volume, 1)} e recall ${pct(C[r.id].recall, 1)}`).join("; ")}. Meta: volume abaixo de ${pct(META_VOLUME, 0)}` : "Gráfico de volume do corte contra recall, com a meta de volume; os pontos aparecem depois da escolha"} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3.3, b: 2.8, t: 1.2, r: 1 });
            const x = escala([0, 0.2], [m.l, d.w - m.r]), y = escala([0, 0.45], [d.h - m.b, m.t]);
            return (
              <g>
                <rect x={x(META_VOLUME)} y={m.t} width={x(0.2) - x(META_VOLUME)} height={y(0) - m.t} fill="#FBF2E5" />
                <Eixos x={x} y={y} xt={[0, 0.05, 0.1, 0.15, 0.2]} yt={[0, 0.1, 0.2, 0.3, 0.4]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="Volume do corte: parcela da população recusada" yTit="Recall: parcela dos maus capturada" />
                <line className="q7-corte" x1={x(META_VOLUME)} x2={x(META_VOLUME)} y1={y(0)} y2={m.t} strokeDasharray="8 5" />
                <text className="q7-corte-t" x={x(META_VOLUME)} y={y(0)} dx="-.5em" dy="-.6em" textAnchor="end">meta: menos de {pct(META_VOLUME, 0)}</text>
                <text className="q7-rot--peq" x={x(0.2) - d.fs * 0.4} y={m.t} dy="2.2em" textAnchor="end" style={{ fill: "#A85A0C" }}>fora da meta</text>
                {aberto && REGRAS.map((r) => {
                  const c = C[r.id], cx = x(c.volume), cy = y(c.recall), rr = d.fs * 0.55;
                  const fora = c.volume >= META_VOLUME;
                  return (
                    <g key={r.id} className="q7-anim-d">
                      {r.id === "politica" ? <circle cx={cx} cy={cy} r={rr} fill="#00205B" stroke="#fff" strokeWidth={2} />
                        : r.id === "never_paid" ? <path d={`M${cx} ${cy - rr * 1.2}L${cx + rr * 1.1} ${cy + rr * 0.8}L${cx - rr * 1.1} ${cy + rr * 0.8}Z`} fill="#00205B" stroke="#fff" strokeWidth={2} />
                          : <path d={`M${cx} ${cy - rr * 1.2}L${cx + rr * 1.2} ${cy}L${cx} ${cy + rr * 1.2}L${cx - rr * 1.2} ${cy}Z`} fill="#00205B" stroke="#fff" strokeWidth={2} />}
                      <text className="q7-rot" x={cx} y={cy} dx={r.id === "combinada" ? "-1.3em" : "1.3em"} dy=".35em" textAnchor={r.id === "combinada" ? "end" : "start"} style={{ fill: fora ? "#A85A0C" : "#00205B", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{r.nome}</text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        </Grafico>
        {aberto && (
          <table className="q7-tab q12-s47-tab">
            <thead><tr><th className="q7-t-l">Regra</th><th>Volume do corte</th><th>Precisão: maus no corte</th><th>Recall: maus capturados</th><th>Maus no restante</th><th>IV</th></tr></thead>
            <tbody>{REGRAS.map((r) => {
              const c = C[r.id];
              return (
                <tr key={r.id} data-fora={c.volume >= META_VOLUME ? "1" : undefined}>
                  <th className="q7-t-l">{SIMB[r.id]} {r.nome}</th>
                  <td className="q12-s47-vol">{pct(c.volume, 1)}</td><td>{pct(c.precisao, 1)}</td><td>{pct(c.recall, 1)}</td><td>{pct(c.mausNoResto, 1)}</td><td>{num(c.iv, 3)} <small>{forcaIV(c.iv)}</small></td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </Painel>
      <Painel>
        <Previsao rotulo="Sua escolha" pergunta={<>Com {int(K.politica.contratos)} contratos e {pct(K.politica.taxaMaus, 1)} de maus, qual regra você levaria ao comitê?</>} opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); setH("curto"); }} recolher />
        {aberto && (
          <>
            <Seg rotulo="Horizonte" opcoes={HORIZONTES.map((x) => ({ v: x.v, r: x.nome }))} valor={h} onChange={setH} />
            <p className="q7-nota">Volume em âmbar: acima da meta. O IV mede a separação de bons e maus pela regra.</p>
          </>
        )}
        <div className="q7-botoes q12-s47-bot"><Botao sec onClick={() => { setEsc(null); setH("curto"); }} desab={esc === null && h === "curto"}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
