"use client";
import { useState } from "react";
import { Botao, Controle, Grafico, Painel, Previsao, Quadro, Seg, type Pagina } from "@/components/capitulo7/base";
import { mulberry32 } from "@/lib/capitulo7/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int } from "@/lib/capitulo7/formato";

/**
 * 41 · c12p41 · Validação fora do tempo, em esquema: uma fila de safras de concessão, do mais antigo para o mais
 * recente; o treino fica com as primeiras e a validação fora do tempo (OOT) com as seguintes, que o modelo nunca viu.
 * O controle move o início da validação. A previsão pergunta por que não sortear as safras de validação; no acerto
 * abre o seletor "sorteada", que sorteia o mesmo número de safras (mulberry32, semente 41) e conta quantas delas são
 * anteriores à última safra do treino. Esquema ilustrativo, sem datas nem dados do caso (os números de safras são do
 * desenho). Estado inicial: 8 de 12 safras no treino, fora do tempo, previsão em aberto; "Restaurar" volta a ele.
 */
const N = 12, INI = 8, SEMENTE = 41;
/** Ordem sorteada das safras (Fisher e Yates com semente): as primeiras N − ini viram a validação sorteada. */
const ORDEM = (() => { const r = mulberry32(SEMENTE), a = Array.from({ length: N }, (_, i) => i); for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
type Modo = "tempo" | "sorteio";
const OPS = [
  { texto: "Porque sobrariam poucas safras para o treino", certa: false, retorno: <>O sorteio pode separar o mesmo número de safras: o tamanho do treino não muda. Confunde <b>quantidade</b> com <b>período</b>.</> },
  { texto: "Porque a validação sorteada fica no período do treino e não testa o futuro", certa: true, retorno: <>Isso: sorteada, a validação tem safras <b>anteriores</b> a safras do treino. A concessão pergunta por safras que ainda não existem.</> },
  { texto: "Porque o sorteio muda a taxa de maus da validação", certa: false, retorno: <>Em média, o sorteio preserva a taxa de maus. O problema não é a proporção, é a <b>data</b>.</> },
];

export function S41ForaDoTempo({ pagina }: { pagina?: Pagina }) {
  const [ini, setIni] = useState(INI);
  const [modo, setModo] = useState<Modo>("tempo");
  const [esc, setEsc] = useState<number | null>(null);
  const liberado = esc !== null && OPS[esc].certa;
  const nVal = N - ini;
  const valSort = new Set(ORDEM.slice(0, nVal));
  const ehVal = (i: number) => (modo === "tempo" ? i >= ini : valSort.has(i));
  const ultimoTreino = Math.max(...Array.from({ length: N }, (_, i) => i).filter((i) => !ehVal(i)));
  const antes = Array.from({ length: N }, (_, i) => i).filter((i) => ehVal(i) && i < ultimoTreino).length;
  const restaurar = () => { setIni(INI); setModo("tempo"); setEsc(null); };
  const inicial = ini === INI && modo === "tempo" && esc === null;
  return (
    <Quadro slug="c12p41" pagina={pagina} layout="gl"
      conclusao={modo === "tempo"
        ? <>Com {int(ini)} de {int(N)} safras no treino, a validação mede <b>{int(nVal)} safras posteriores</b> a tudo o que o modelo viu. O slide {SLIDE.c12p42.n} mostra quanto a AUC cai nelas.</>
        : <>Sorteada, a validação tem <b>{int(antes)} de {int(nVal)} safras anteriores</b> à última do treino: o modelo já viu o que veio depois delas.</>}
      fonte={`Esquema ilustrativo de validação fora do tempo, como no material da aula: ${int(N)} safras de concessão, sem datas nem dados do caso; o sorteio usa mulberry32 com semente ${SEMENTE}.`}>
      <Painel className="q12-s41-esq">
        <Grafico rotulo={modo === "tempo" ? `Linha do tempo: ${ini} safras de treino seguidas de ${nVal} safras de validação fora do tempo` : `Linha do tempo com ${nVal} safras de validação sorteadas; ${antes} delas são anteriores à última safra do treino`} arCelular="1 / 1">
          {(d) => {
            const l = d.fs * 0.6, r = d.fs * 0.6, w = (d.w - l - r) / N, gap = Math.max(2, w * 0.08);
            const yB = d.h * 0.3, hB = d.h * 0.3, x = (i: number) => l + i * w;
            const yC = yB - d.fs * 1.9; // chaves acima dos blocos
            const estreito = d.w < d.fs * 34;
            const yM1 = yB + hB + d.fs * 1.5, yM2 = yM1 + d.fs * 1.6, yS = Math.min(d.h - d.fs * (d.w < d.fs * 34 ? 1.8 : 0.4), yM2 + d.fs * 2.6);
            return (
              <g>
                <defs>
                  <pattern id="q12-s41-hach" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={8} height={8} fill="#F0F7F3" /><line x1={0} y1={0} x2={0} y2={8} stroke="#2E6B4F" strokeWidth={3} strokeOpacity={0.35} /></pattern>
                  <marker id="q12-s41-seta" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto"><path d="M0 0L10 5L0 10Z" fill="#5B6475" /></marker>
                </defs>
                <line x1={l} x2={d.w - r} y1={d.fs * 0.9} y2={d.fs * 0.9} stroke="#5B6475" strokeWidth={2} markerEnd="url(#q12-s41-seta)" />
                <text className="q7-rot--peq" x={d.w - r - d.fs * 0.6} y={d.fs * 0.9} dy="-.45em" textAnchor="end" style={{ fill: "#5B6475" }}>{d.w > d.fs * 30 ? "safra de concessão, da mais antiga à mais recente" : "safra de concessão"}</text>
                {Array.from({ length: N }, (_, i) => {
                  const v = ehVal(i);
                  return (
                    <g key={i} className="q7-anim-d">
                      <rect x={x(i) + gap / 2} y={yB} width={w - gap} height={hB} rx={d.fs * 0.25} fill={v ? "url(#q12-s41-hach)" : "#3D5A8A"} stroke={v ? "#2E6B4F" : "#3D5A8A"} strokeWidth={2} />
                      {v ? <text x={x(i) + w / 2} y={yB + hB / 2} dy=".35em" textAnchor="middle" className="q7-rot" style={{ fill: "#2E6B4F" }}>■</text>
                        : <text x={x(i) + w / 2} y={yB + hB / 2} dy=".35em" textAnchor="middle" className="q7-rot" style={{ fill: "#fff" }}>●</text>}
                    </g>
                  );
                })}
                {modo === "tempo" ? (
                  <>
                    <path d={`M${x(0) + gap / 2} ${yC + d.fs * 0.5}V${yC}H${x(ini) - gap / 2}V${yC + d.fs * 0.5}`} fill="none" stroke="#3D5A8A" strokeWidth={2} />
                    <text className="q7-rot" x={(x(0) + x(ini)) / 2} y={yC} dy="-.45em" textAnchor="middle" style={{ fill: "#3D5A8A" }}>{estreito ? "Treino" : "Treino: safras mais antigas"}</text>
                    <path d={`M${x(ini) + gap / 2} ${yC + d.fs * 0.5}V${yC}H${x(N) - gap / 2}V${yC + d.fs * 0.5}`} fill="none" stroke="#2E6B4F" strokeWidth={2} />
                    <text className="q7-rot" x={nVal <= 2 ? x(N) - gap / 2 : (x(ini) + x(N)) / 2} y={yC} dy="-.45em" textAnchor={nVal <= 2 ? "end" : "middle"} style={{ fill: "#2E6B4F" }}>{estreito || nVal <= 2 ? "OOT" : nVal <= 3 ? "Fora do tempo (OOT)" : "Validação fora do tempo (OOT)"}</text>
                    {[[0, "Início do treino", "start", yM1], [ini, "Início da validação", "middle", yM2], [N, "Fim da validação", "end", yM1]].map(([i, t, a, y]) => (
                      <g key={t as string}>
                        <line x1={x(i as number)} x2={x(i as number)} y1={yB - d.fs * 0.3} y2={(y as number) - d.fs * 0.95} stroke="#2A3342" strokeWidth={1.6} strokeDasharray={i === ini ? undefined : "4 4"} />
                        <text className="q7-rot--peq" x={x(i as number)} y={y as number} textAnchor={a as "start" | "middle" | "end"} style={{ fill: "#2A3342", fontWeight: i === ini ? 700 : 500 }}>{t as string}</text>
                      </g>
                    ))}
                  </>
                ) : (
                  <>
                    <text className="q7-rot" x={d.w / 2} y={yC} dy="-.45em" textAnchor="middle" style={{ fill: "#8C2332" }}>{estreito ? "Validação sorteada" : "Validação sorteada: safras ■ entre safras de treino ●"}</text>
                    {Array.from({ length: N }, (_, i) => i).filter((i) => ehVal(i) && i < ultimoTreino).map((i) => (
                      <text key={i} className="q7-rot--peq" x={x(i) + w / 2} y={yM1} textAnchor="middle" style={{ fill: "#8C2332", fontWeight: 700 }}>antes</text>
                    ))}
                    <text className="q7-rot--peq" x={ultimoTreino >= N - 2 ? x(ultimoTreino + 1) - gap / 2 : x(ultimoTreino) + w / 2} y={yM2} textAnchor={ultimoTreino >= N - 2 ? "end" : "middle"} style={{ fill: "#3D5A8A", fontWeight: 700 }}>{ultimoTreino >= N - 2 ? "última do treino ↑" : "↑ última do treino"}</text>
                  </>
                )}
                <text className="q7-rot" x={l} y={yS} style={{ fill: "#3D5A8A" }}>● o modelo aprende com {int(N - nVal)} safras</text>
                <text className="q7-rot" x={estreito ? l : d.w - r} y={estreito ? yS + d.fs * 1.4 : yS} textAnchor={estreito ? "start" : "end"} style={{ fill: "#2E6B4F" }}>■ a validação mede {int(nVal)} {modo === "tempo" ? "safras posteriores" : "safras sorteadas"}</text>
              </g>
            );
          }}
        </Grafico>
        <div className="q12-s41-ctl">
          <Controle rotulo="Início da validação" valor={ini} min={3} max={N - 2} passo={1} onChange={setIni} mostrar={`depois de ${int(ini)} de ${int(N)} safras`} />
          {liberado && <Seg rotulo="Como separar a validação" opcoes={[{ v: "tempo" as Modo, r: "Fora do tempo" }, { v: "sorteio" as Modo, r: "Sorteada" }]} valor={modo} onChange={setModo} />}
          <Botao sec onClick={restaurar} desab={inicial}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <ul className="q12-s41-bul">
          <li>Modelos separados para <b>baixa</b> e <b>alta renda</b>.</li>
          <li>A avaliação compara <b>AUC</b>, taxa de maus por faixa de score e estabilidade ao longo das safras.</li>
        </ul>
        <Previsao pergunta="Por que não sortear a validação entre todas as safras?" opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i === null || !OPS[i].certa) setModo("tempo"); }} recolher />
        {liberado && <p className="q7-nota">Use o seletor “Sorteada” embaixo do esquema e conte as safras marcadas “antes”.</p>}
      </Painel>
    </Quadro>
  );
}
