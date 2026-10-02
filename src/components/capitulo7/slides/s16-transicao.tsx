"use client";
import { useState } from "react";
import { Grafico, Kpi, Painel, Previsao, Quadro, escala, type Pagina } from "../base";
import { CENARIOS, D, EAD, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, soma } from "@/lib/capitulo7/metricas";
import { int, num, pct, reais } from "@/lib/capitulo7/formato";

/**
 * 16 · c7p28 · Uma boa fila ainda pode cobrar o risco errado. Modelo A: a logística. Modelo B: a mesma logística com
 * +0,8 em log odds. Mesma fila e mesma AUC; defaults esperados e perda esperada muito diferentes. Perda esperada
 * ilustrativa = Σ PD × LGD × EAD, com LGD de 65% (hipótese do capítulo 8) e EAD igual ao valor de cada proposta.
 */
const LGD = 0.65;
const PB = CENARIOS.filaBoaNivelErrado;
const pe = (p: readonly number[]) => p.reduce((s, x, i) => s + x * LGD * EAD[i], 0);
const REAL = Y.reduce((s, y, i) => s + y * LGD * EAD[i], 0);
const M = [
  { nome: "Modelo A", sub: "logística como estimada", pd: PL, cor: "#176C73" },
  { nome: "Modelo B", sub: "a mesma, +0,8 em log odds", pd: PB, cor: "#A85A0C" },
].map((m) => ({ ...m, auc: aucPorPares(Y, m.pd).auc!, esp: soma(m.pd), media: soma(m.pd) / N, pe: pe(m.pd) }));
const OPS = [
  { texto: "A, porque está mais perto do observado", certa: false, retorno: <>A está mais perto no agregado ({num(M[0].esp, 1)} esperados contra {D}), mas ainda subestima. E perto no total não garante perto em cada faixa: é o que os próximos slides verificam.</> },
  { texto: "B, porque é mais conservador", certa: false, retorno: <>Conservador demais: {num(M[1].esp, 1)} esperados contra {D} observados. Provisão alta demais também é erro: encarece e distorce o preço.</> },
  { texto: "Nenhuma sem antes verificar o nível, faixa a faixa", certa: true, retorno: <>Isso. A AUC é idêntica e não ajuda a escolher. A escolha pede diagnóstico de nível: média, faixas e incerteza.</> },
];

export function S16Transicao({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  return (
    <Quadro slug="c7p28" pagina={pagina} layout="gl"
      conclusao={<>Mesma fila (AUC {num(M[0].auc, 4)} nos dois), e a perda esperada vai de <b>{reais(M[0].pe)}</b> a <b>{reais(M[1].pe)}</b> contra {reais(REAL)} realizados. Para provisionar e precificar, <b>o nível previsto importa</b>.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Perda esperada ilustrativa: Σ PD × 65% × EAD; perda realizada: Σ default × 65% × EAD. A LGD de 65% é hipótese do capítulo 8, não estimativa desta base.`}>
      <Painel titulo="Dois modelos com a mesma fila">
        <div className="q7-s16-mod">
          {M.map((m) => (
            <div key={m.nome} className="q7-s16-c" style={{ borderTopColor: m.cor }}>
              <p className="q7-s16-n">{m.nome} <small>{m.sub}</small></p>
              <div className="q7-kpis q7-kpis--2">
                <Kpi rotulo="AUC" valor={num(m.auc, 4)} tam="mini" />
                <Kpi rotulo="PD média" valor={pct(m.media, 1)} detalhe={`observado ${pct(D / N, 1)}`} tam="mini" tom="prob" />
              </div>
            </div>
          ))}
        </div>
        <Grafico titulo="Defaults esperados e perda esperada" sub="barras: modelos · linha: realizado na janela" rotulo={`Defaults esperados: A ${num(M[0].esp, 1)}, B ${num(M[1].esp, 1)}, observados ${D}. Perda esperada: A ${reais(M[0].pe)}, B ${reais(M[1].pe)}, realizada ${reais(REAL)}`} arCelular="16 / 9">
          {(d) => {
            const meio = d.w / 2, alt = d.h - d.fs * 3.2, base = d.h - d.fs * 2;
            const bloco = (x0: number, w: number, vals: number[], real: number, fmt: (v: number) => string, tit: string) => {
              const mx = Math.max(...vals, real) * 1.15; const y = escala([0, mx], [base, base - alt]); const bw = w * 0.22;
              return <g>{vals.map((v, i) => <g key={i}><rect x={x0 + w * (0.22 + i * 0.34)} y={y(v)} width={bw} height={base - y(v)} fill={M[i].cor} /><text className="q7-rot" x={x0 + w * (0.22 + i * 0.34) + bw / 2} y={y(v) + d.fs * 1.3} textAnchor="middle" style={{ fill: "#fff" }}>{fmt(v)}</text><text className="q7-tick" x={x0 + w * (0.22 + i * 0.34) + bw / 2} y={base} dy="1.2em" textAnchor="middle">{M[i].nome}</text></g>)}
                <line x1={x0 + w * 0.12} x2={x0 + w * 0.92} y1={y(real)} y2={y(real)} stroke="#8C2332" strokeWidth={3} strokeDasharray="8 5" />
                <text className="q7-rot--peq" x={x0 + w * 0.92} y={y(real) - 7} textAnchor="end" style={{ fill: "#8C2332" }}>realizado: {fmt(real)}</text>
                <text className="q7-eixo-t" x={x0 + w * 0.12} y={d.fs * 0.9}>{tit}</text>
                <line className="q7-eixo" x1={x0 + w * 0.12} x2={x0 + w * 0.92} y1={base} y2={base} /></g>;
            };
            return <g>{bloco(0, meio, M.map((m) => m.esp), D, (v) => num(v, 0), "Defaults esperados")}{bloco(meio, meio, M.map((m) => m.pe), REAL, reais, "Perda esperada")}</g>;
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao rotulo="Escolha e justifique" pergunta="Qual PD você usaria para provisionar esta carteira?" opcoes={OPS} escolha={esc} onEscolha={setEsc} />
        <p className="q7-nota">As duas filas são idênticas: as mesmas propostas nas mesmas posições. Só o nível das PDs mudou.</p>
      </Painel>
    </Quadro>
  );
}
