"use client";
import { useState } from "react";
import { Botao, Controle, Grafico, Kpi, Painel, Previsao, Quadro, escala, type Pagina } from "../base";
import { D, EAD, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, interceptoComSlope1, soma, transformar } from "@/lib/capitulo7/metricas";
import { int, num, pct, reais } from "@/lib/capitulo7/formato";

/**
 * 16 · c7p28 · Uma boa fila ainda pode cobrar o risco errado. Modelo A: a logística. Modelo B: a mesma logística
 * deslocada em log odds pelo controle (+0,8 no início). Mesma fila e mesma AUC em qualquer deslocamento; defaults
 * esperados e perda esperada respondem ao nível. Perda esperada ilustrativa = Σ PD × LGD × EAD, com LGD de 65%
 * (hipótese do capítulo 8) e EAD igual ao valor de cada proposta. O deslocamento que iguala esperados e observados é
 * estimado nesta mesma janela só para mostrar que ele existe; o slide 27 explica por que isso exige amostra própria.
 */
const LGD = 0.65, INICIO = 0.8;
const pe = (p: readonly number[]) => p.reduce((s, x, i) => s + x * LGD * EAD[i], 0);
const REAL = Y.reduce((s, y, i) => s + y * LGD * EAD[i], 0);
const AUC = aucPorPares(Y, PL).auc!;
const AJUSTE = interceptoComSlope1(Y, PL);
const modelo = (nome: string, sub: string, pd: readonly number[], cor: string) => ({ nome, sub, pd, cor, auc: aucPorPares(Y, pd).auc!, esp: soma(pd), media: soma(pd) / N, pe: pe(pd) });
const A = modelo("Modelo A", "logística como estimada", PL, "#176C73");
const B0 = modelo("Modelo B", "", transformar(PL, INICIO, 1), "#A85A0C");
const sinal = (v: number) => `${v >= 0 ? "+" : "−"}${num(Math.abs(v), 2)}`;
const OPS = [
  { texto: "A, porque está mais perto do observado", certa: false, retorno: <>A está mais perto no agregado ({num(A.esp, 1)} esperados contra {D}), mas ainda subestima. E perto no total não garante perto em cada faixa: é o que os próximos slides verificam.</> },
  { texto: "B com +0,80, porque é mais conservador", certa: false, retorno: <>Conservador demais: {num(B0.esp, 1)} esperados contra {D} observados. Provisão alta demais também é erro: encarece e distorce o preço.</> },
  { texto: "Nenhuma sem antes verificar o nível, faixa a faixa", certa: true, retorno: <>Isso. A AUC é idêntica e não ajuda a escolher. A escolha pede diagnóstico de nível: média, faixas e incerteza.</> },
];

export function S16Transicao({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [delta, setDelta] = useState(INICIO);
  const B = (modelo("Modelo B", `a mesma, ${sinal(delta)} em log odds`, transformar(PL, delta, 1), "#A85A0C"));
  const M = [A, B];
  return (
    <Quadro slug="c7p28" pagina={pagina} layout="gl"
      conclusao={<>Mesma fila (AUC {num(AUC, 4)} nos dois), e a perda esperada vai de <b>{reais(A.pe)}</b> a <b>{reais(B.pe)}</b> contra {reais(REAL)} realizados. A provisão parte dessa conta: <b>o nível importa</b>, e a AUC não o vê.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults. Perda = Σ PD (ou default) × 65% × EAD; LGD hipotética do capítulo 8. Provisão por perda esperada desde 1/1/2025: Res. CMN 4.966/2021 e Res. BCB 352/2023.`}>
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
              const mx = Math.max(...vals, real) * 1.18; const y = escala([0, mx], [base, base - alt + d.fs * 1.4]); const bw = w * 0.24; const bx = (i: number) => x0 + w * (0.08 + i * 0.32);
              return <g>{vals.map((v, i) => <g key={i}><rect x={bx(i)} y={y(v)} width={bw} height={base - y(v)} fill={M[i].cor} />{(() => { const dentro = Math.abs(y(v) - d.fs * 0.8 - y(real)) < d.fs * 1.1 && base - y(v) > d.fs * 2; return <text className="q7-rot" x={bx(i) + bw / 2} y={dentro ? y(v) + d.fs * 1.3 : y(v) - d.fs * 0.4} textAnchor="middle" style={{ fill: dentro ? "#fff" : M[i].cor, fontWeight: 700 }}>{fmt(v)}</text>; })()}<text className="q7-tick" x={bx(i) + bw / 2} y={base} dy="1.2em" textAnchor="middle">{M[i].nome}</text></g>)}
                <line x1={x0 + w * 0.04} x2={x0 + w * 0.7} y1={y(real)} y2={y(real)} stroke="#8C2332" strokeWidth={3} strokeDasharray="8 5" />
                <text className="q7-rot--peq" x={x0 + w * 0.72} y={y(real)} style={{ fill: "#8C2332" }}><tspan x={x0 + w * 0.72} dy="-.2em">realizado</tspan><tspan x={x0 + w * 0.72} dy="1.15em" style={{ fontWeight: 700 }}>{fmt(real)}</tspan></text>
                <text className="q7-eixo-t" x={x0 + w * 0.04} y={d.fs * 0.9}>{tit}</text>
                <line className="q7-eixo" x1={x0 + w * 0.04} x2={x0 + w * 0.7} y1={base} y2={base} /></g>;
            };
            return <g>{bloco(0, meio, M.map((m) => m.esp), D, (v) => num(v, 0), "Defaults esperados")}{bloco(meio, meio, M.map((m) => m.pe), REAL, (v) => reais(v).replace("R$ ", ""), "Perda esperada, em R$")}</g>;
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Controle rotulo="Nível do modelo B, em log odds" valor={delta} min={-1} max={1.5} passo={0.05} onChange={setDelta} mostrar={sinal(delta)} escala={["−1,0", "+1,5"]} />
        <p className="q7-nota">A AUC não sai de {num(AUC, 4)}. Com +{num(AJUSTE, 2)}, B espera os {D} observados, mas o ajuste usou a própria janela (slide 27).</p>
        <Previsao rotulo="Escolha e justifique" pergunta="Qual PD você usaria para provisionar esta carteira?" opcoes={OPS} escolha={esc} onEscolha={setEsc} />
        <div className="q7-botoes"><Botao onClick={() => setDelta(AJUSTE)}>B no total observado</Botao><Botao sec onClick={() => { setDelta(INICIO); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
