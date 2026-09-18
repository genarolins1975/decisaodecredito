"use client";
import { useEffect, useMemo, useState } from "react";
import esc from "@/lib/visuais/escores.json";
import mon from "@/lib/visuais/monitoramento.json";
import { CONVENCOES, diferencaProporcoes, indiceDeEstabilidade, limitesDecis, simularJanela } from "@/lib/visuais/monitoramento";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * O índice que soma (capítulo 9). PSI do escore calculado ao vivo sobre dez faixas congeladas no treino, faixa a faixa,
 * com a janela final da base e um deslocamento simulado na mão da turma. Modos: faixas (c9p3, a soma), variaveis
 * (c9p4, onde a entrada mudou) e leituras (c9p5, entrada, nível e relação com incerteza antes da ação).
 */
export type ModoIndice = "faixas" | "variaveis" | "leituras";
const TR = esc.treino.sc as number[], JAN = esc.janela.sc as number[];
const EDGES = limitesDecis(TR);
const W = 560, H = 300, ML = 44, MR = 12, MT = 14, MB = 44;
const NOMES: Record<string, string> = { renda: "Renda", tempo_emprego: "Tempo de emprego", utilizacao: "Utilização", atraso_max_6m: "Atraso", comprometimento: "Comprometimento", relacionamento: "Relacionamento", consultas_bureau_3m: "Bureau" };

export function IndiceQueSoma({ modo = "faixas" }: { modo?: ModoIndice }) {
  const [delta, setDelta] = useState(0);
  const [canal, setCanal] = useState(0);
  const [k, setK] = useState(10); // faixas já somadas
  const [somando, setSomando] = useState(false);
  const janela = useMemo(() => (delta || canal ? simularJanela(JAN, delta, canal / 100) : JAN), [delta, canal]);
  const r = useMemo(() => indiceDeEstabilidade(TR, janela, EDGES), [janela]);
  useEffect(() => {
    if (!somando) return;
    const id = setTimeout(() => { if (k >= 10) setSomando(false); else setK(k + 1); }, 550);
    return () => clearTimeout(id);
  }, [somando, k]);
  const parcial = r.faixas.slice(0, k).reduce((s, f) => s + f.psi, 0);
  const maior = r.faixas.reduce((a, b) => (b.psi > a.psi ? b : a));
  const pMax = Math.max(...r.faixas.map((f) => Math.max(f.p, f.q)));
  const sx = (j: number) => ML + (j / 10) * (W - ML - MR); const bw = (W - ML - MR) / 10;
  const sy = (v: number) => MT + (1 - v / (pMax * 1.15)) * (H - MT - MB);
  const faixa = (v: number) => (v < CONVENCOES.atencao ? "abaixo de 0,10" : v < CONVENCOES.acao ? "entre 0,10 e 0,25" : "acima de 0,25");
  const simulado = delta !== 0 || canal !== 0;

  return (
    <figure className="vz" data-vz={`indice-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O índice que soma · escore de crédito · 2.103 propostas de treino contra {janela.length} da janela final · o gerador da aula</p>
          <p className="vz-tit">{modo === "faixas" ? "Dez faixas congeladas no treino. Cada uma contribui um pouco; o índice é a soma, e a soma tem endereço." : modo === "variaveis" ? "O índice do escore diz que a entrada mudou. Só a decomposição por variável diz onde." : "Três leituras antes de qualquer ação: entrada, nível e relação, cada uma com a sua incerteza."}</p>
        </div>
        {modo === "faixas" && <div className="vz-acoes"><button type="button" className="btn btn-sm" onClick={() => { setK(0); setSomando(true); }} disabled={somando}>{somando ? "Somando faixa a faixa…" : "Somar faixa a faixa"}</button></div>}
      </header>
      {modo !== "leituras" && <div className="vz-estado"><b>PSI do escore {fmtNum(r.valor, 4)}{simulado ? " na janela simulada" : " na janela final"}</b>, {faixa(r.valor)}. {r.valor < CONVENCOES.atencao ? "Entrada estável pela convenção. Isso não diz que o modelo continua bom: faltam rótulos maduros, calibração e ordenação." : r.valor < CONVENCOES.acao ? "Deslocamento a investigar: mix, canal, integração. Nenhuma alteração no modelo antes do laudo." : "Deslocamento grande. Antes de agir, a pergunta é a causa: campanha planejada e falha de integração pedem respostas diferentes."} Maior contribuição na faixa {maior.j + 1}.</div>}
      {modo === "faixas" && (
        <div className="vz-ind-grade">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Proporção por faixa <span className="hint">escuro: treino (p) · dourado: janela (q) · faixas pelos decis do treino</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Proporção de propostas por faixa de escore, treino contra janela">
              {[0, 0.05, 0.1, 0.15].filter((v) => v < pMax * 1.15).map((v) => <g key={v}><line x1={sx(0)} x2={sx(10)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtPct(v)}</text></g>)}
              {r.faixas.map((f) => <g key={f.j} className={f.j >= k ? "vz-ind-futuro" : undefined}>
                <rect x={sx(f.j) + 3} y={sy(f.p)} width={bw / 2 - 4} height={sy(0) - sy(f.p)} className="vz-ind-p" />
                <rect x={sx(f.j) + bw / 2 + 1} y={sy(f.q)} width={bw / 2 - 4} height={sy(0) - sy(f.q)} className="vz-ind-q" />
                <text x={sx(f.j) + bw / 2} y={H - MB + 14} textAnchor="middle" className="vz-tick">F{f.j + 1}</text>
                <text x={sx(f.j) + bw / 2} y={H - MB + 26} textAnchor="middle" className="vz-tick vz-ind-lim">{f.ate !== null ? `≤ ${Math.round(f.ate)}` : `> ${Math.round(f.de!)}`}</text>
                <text x={sx(f.j) + bw / 2} y={H - 6} textAnchor="middle" className={`vz-ind-psi ${f.j === maior.j ? "vz-ind-psi--maior" : ""}`}>{fmtNum(f.psi, 4)}</text>
              </g>)}
              <text x={ML} y={H - 6} textAnchor="end" className="vz-tick">ψ</text>
            </svg>
            <div className="vz-res-controles">
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Deslocar todos os escores da janela</span><span className="vz-slider-valor">{delta > 0 ? "+" : ""}{delta} pontos</span></span><input type="range" min={-60} max={60} step={5} value={delta} onChange={(e) => { setDelta(Number(e.target.value)); setK(10); }} /></label>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Misturar um canal novo, de escores baixos</span><span className="vz-slider-valor">{canal}% das propostas</span></span><input type="range" min={0} max={40} step={5} value={canal} onChange={(e) => { setCanal(Number(e.target.value)); setK(10); }} /></label>
            </div>
          </div>
          <div className="vz-ind-painel">
            <div className="vz-tiles vz-tiles--coluna">
              <div className="vz-tile"><p className="eyebrow">Soma parcial · {k} de 10 faixas</p><p className="vz-num">{fmtNum(parcial, 4)}</p><p className="hint">{k < 10 ? `faixa ${k + 1} a seguir: treino ${fmtPct(r.faixas[k].p, 2)}, janela ${fmtPct(r.faixas[k].q, 2)}, contribui ${fmtNum(r.faixas[k].psi, 5)}` : "todas as faixas somadas"}</p></div>
              <div className="vz-tile"><p className="eyebrow">Convenção de mercado</p><p className="vz-num vz-num--texto">0,10 pede atenção; 0,25 pede ação.</p><p className="hint">sem força normativa e sem determinar a ação: 0,12 por campanha planejada não pede a mesma resposta que 0,12 sem explicação</p></div>
              {simulado && <div className="vz-tile"><p className="eyebrow">Janela simulada</p><p className="vz-num vz-num--texto">{delta ? `escores ${delta > 0 ? "acima" : "abaixo"} em ${Math.abs(delta)} pontos` : ""}{delta && canal ? " e " : ""}{canal ? `${canal}% de um canal novo` : ""}</p><p className="hint">o índice cresce com deslocamento e com mistura; ele não diz qual dos dois aconteceu</p></div>}
            </div>
          </div>
        </div>
      )}
      {modo === "variaveis" && <Variaveis psiEscore={r.valor} />}
      {modo === "leituras" && <Leituras psiEscore={r.valor} />}
      <p className="vz-fonte">ψ_j = (q_j − p_j) ln(q_j ÷ p_j), com p a proporção da faixa no treino e q na janela; faixa vazia recebe piso de 0,0001 antes de renormalizar. Faixas pelos decis do treino: 731,0 · 763,9 · 786,7 · 806,1 · 824,9 · 842,7 · 860,9 · 882,3 · 908,9. Na janela final o índice calculado aqui é 0,0133; o gerador em Python, com os escores em precisão plena e faixas de contagem exatamente igual, obtém 0,0136. A diferença vem de empates no limite das faixas, com escores de uma casa decimal, e é declarada porque também é assim em produção: o número depende do tratamento das faixas.</p>
    </figure>
  );
}

function Variaveis({ psiEscore }: { psiEscore: number }) {
  const [deslocUtil, setDeslocUtil] = useState(0);
  const utilTr = esc.treino.util as number[], utilJan = esc.janela.util as number[];
  const csiUtil = useMemo(() => indiceDeEstabilidade(utilTr, utilJan.map((u) => Math.max(0, u + deslocUtil))).valor, [utilTr, utilJan, deslocUtil]);
  const csi = mon.csi as Record<string, number>;
  const linhas = Object.entries(csi).map(([v, x]) => ({ v, nome: NOMES[v] ?? v, valor: v === "utilizacao" ? csiUtil : x, vivo: v === "utilizacao" })).sort((a, b) => b.valor - a.valor);
  const max = Math.max(0.1, ...linhas.map((l) => l.valor));
  const soma = linhas.reduce((s, l) => s + l.valor, 0);
  return (
    <div className="vz-ind-grade">
      <div className="vz-grafico">
        <p className="vz-grafico-t">Índice por variável de entrada <span className="hint">faixas congeladas no treino, uma variável de cada vez · marca dourada: 0,10</span></p>
        <div className="vz-res-barras" role="img" aria-label="Índice de estabilidade por variável">
          {linhas.map((l) => <div key={l.v} className={`vz-res-barra ${l.vivo ? "vz-res-barra--on" : ""}`}>
            <span className="vz-res-barra-rot">{l.nome}</span>
            <span className="vz-res-barra-trilho vz-ind-trilho"><span className="vz-res-barra-fill" style={{ width: `${(l.valor / max) * 100}%` }} /><span className="vz-ind-marca" style={{ left: `${(0.1 / max) * 100}%` }} /></span>
            <span className="vz-res-barra-val">{fmtNum(l.valor, 3)}{l.vivo ? " ·" : ""}</span>
          </div>)}
        </div>
        <label className="vz-slider"><span className="vz-slider-rotulo"><span>Deslocar a utilização da janela</span><span className="vz-slider-valor">{deslocUtil > 0 ? "+" : ""}{deslocUtil} pontos percentuais</span></span><input type="range" min={-20} max={30} step={2} value={deslocUtil} onChange={(e) => setDeslocUtil(Number(e.target.value))} /></label>
        <p className="hint">Utilização é recalculada aqui a partir das propostas (· ao lado); as demais vêm do gerador, que tem todas as variáveis.</p>
      </div>
      <div className="vz-ind-painel">
        <div className="vz-tiles vz-tiles--coluna">
          <div className="vz-tile"><p className="eyebrow">PSI do escore</p><p className="vz-num">{fmtNum(psiEscore, 4)}</p><p className="hint">o alarme agregado</p></div>
          <div className="vz-tile"><p className="eyebrow">Soma dos índices das entradas</p><p className="vz-num">{fmtNum(soma, 3)}</p><p className="hint">maior contribuição: {linhas[0].nome.toLowerCase()} com {fmtNum(linhas[0].valor, 3)}</p></div>
          <div className="vz-tile"><p className="eyebrow">Conclusão válida</p><p className="vz-num vz-num--texto">{soma < 0.1 && psiEscore < 0.1 ? "Entrada estável. Não conclua que o modelo continua bom: faltam rótulos maduros, calibração e ordenação." : `A entrada mudou em ${linhas[0].nome.toLowerCase()}: conferir origem do campo, domínio, unidade e corte de sistema antes de tocar no modelo.`}</p></div>
        </div>
      </div>
    </div>
  );
}

function Leituras({ psiEscore }: { psiEscore: number }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const res = mon.res; const n = mon.n;
  const nivel = diferencaProporcoes(Math.round(res.logit_oot.obs * n.oot), n.oot, Math.round(res.logit_treino.obs * n.treino), n.treino);
  const opcoes = [
    { t: "A relação quebrou: reestimar já.", ok: false, por: "A ordenação fora do tempo (AUC 0,7257) não caiu contra a validação (0,6408); não há sinal de relação quebrada. Reestimar sem diagnóstico troca um modelo medido por um não medido." },
    { t: "Há candidato a mudança de nível: manter a política e continuar medindo.", ok: true, por: "A prevalência subiu 1,43 pp, mas o intervalo inclui zero. É um candidato, não um fato: a resposta proporcional é medir a próxima safra madura com o mesmo limiar declarado." },
    { t: "PSI baixo prova que nada mudou.", ok: false, por: "O índice só olha a entrada. Nível e relação exigem rótulos maduros; um PSI de 0,0136 é silêncio sobre eles, não prova." },
  ];
  return (
    <div className="vz-ind-leituras">
      <div className="vz-ind-cartoes">
        <div className="vz-ind-cartao"><p className="eyebrow">Entrada · imediato</p><p className="vz-num">{fmtNum(psiEscore, 4)}</p><p className="hint">PSI do escore, faixas congeladas no treino. Abaixo de 0,10: entrada estável pela convenção.</p></div>
        <div className="vz-ind-cartao"><p className="eyebrow">Nível · rótulo maduro</p><p className="vz-num">{nivel.dif >= 0 ? "+" : ""}{fmtNum(nivel.dif * 100, 2)} pp</p><p className="hint">default observado {fmtPct(nivel.p1, 2)} na janela contra {fmtPct(nivel.p2, 2)} no treino; IC 95% de {fmtNum(nivel.lo * 100, 2)} a +{fmtNum(nivel.hi * 100, 2)} pp, que inclui zero.</p>
          <svg viewBox="0 0 240 40" className="vz-ind-ic" role="img" aria-label="Intervalo da diferença de prevalência"><line x1={20} x2={220} y1={20} y2={20} className="vz-grade" /><line x1={120} x2={120} y1={8} y2={32} className="vz-zero" /><line x1={120 + nivel.lo * 100 * 20} x2={120 + nivel.hi * 100 * 20} y1={20} y2={20} className="vz-ind-ic-linha" /><circle cx={120 + nivel.dif * 100 * 20} cy={20} r={5} className="vz-ind-ic-pt" /><text x={120} y={38} textAnchor="middle" className="vz-tick">0</text></svg></div>
        <div className="vz-ind-cartao"><p className="eyebrow">Relação · rótulo maduro</p><p className="vz-num">AUC {fmtNum(res.logit_oot.auc, 4)}</p><p className="hint">fora do tempo, contra {fmtNum(res.logit_val.auc, 4)} na validação: a ordenação não piorou. O teste da diferença é o do capítulo 7.</p></div>
      </div>
      <p className="vz-grafico-t">Qual é o diagnóstico mais preciso?</p>
      <div className="vz-ind-opcoes">
        {opcoes.map((o, i) => <button key={i} type="button" className={`vz-ind-opcao ${escolha === i ? (o.ok ? "vz-ind-opcao--ok" : "vz-ind-opcao--nao") : ""}`} onClick={() => setEscolha(i)} aria-pressed={escolha === i}><b>{o.t}</b>{escolha === i && <span>{o.por}</span>}</button>)}
      </div>
    </div>
  );
}
