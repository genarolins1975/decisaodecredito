"use client";
import { useEffect, useMemo, useState } from "react";
import { fmtPct, mesDoDefault, mulberry32, pdAcumulada, riscoMensal } from "@/lib/visuais/metricas";

/**
 * Cem vidas em doze meses (capítulo 1). Cem operações com PD de 10% em 12 meses vivem mês a mês na tela.
 * Os defaults acendem quando acontecem; o horizonte diz quais contam. Sortear muitas vezes mostra a contagem
 * variando em torno de 10: a PD não mudou, mudou a amostra.
 */
const N = 100, PD12 = 0.1, MESES = 24; const H = riscoMensal(PD12, 12);
const HORIZONTES = [6, 12, 18, 24] as const;
const MAX_HIST = 26;

function sorteio(semente: number) { const r = mulberry32(20260501 + semente * 7919); return Array.from({ length: N }, () => mesDoDefault(H, r())); }

export function CemVidas() {
  const [semente, setSemente] = useState(1);
  const [mes, setMes] = useState(0);
  const [horizonte, setHorizonte] = useState<(typeof HORIZONTES)[number]>(12);
  const [tocando, setTocando] = useState(false);
  const [hist, setHist] = useState<number[]>([]);
  const [lote, setLote] = useState(0); // sorteios ainda por acrescentar ao histograma
  const meses = useMemo(() => sorteio(semente), [semente]);
  const esperado = N * pdAcumulada(H, horizonte);
  const ocorridos = meses.filter((m) => m <= mes).length;
  const contam = meses.filter((m) => m <= mes && m <= horizonte).length;
  const depois = ocorridos - contam;

  useEffect(() => {
    if (!tocando || mes >= MESES) return;
    const t = setTimeout(() => { setMes((m) => m + 1); if (mes + 1 >= MESES) setTocando(false); }, 330);
    return () => clearTimeout(t);
  }, [tocando, mes]);

  // histograma: acrescenta um sorteio a cada tique até esgotar o lote (a contagem usa o horizonte atual)
  useEffect(() => {
    if (lote <= 0) return;
    const t = setTimeout(() => { setHist((h) => [...h, sorteio(1000 + h.length).filter((m) => m <= horizonte).length]); setLote((l) => l - 1); }, 45);
    return () => clearTimeout(t);
  }, [lote, horizonte]);

  const media = hist.length ? hist.reduce((a, b) => a + b, 0) / hist.length : null;
  const dp = hist.length > 1 && media != null ? Math.sqrt(hist.reduce((a, b) => a + (b - media) ** 2, 0) / hist.length) : null;
  const barras = useMemo(() => { const b = new Array(MAX_HIST).fill(0); hist.forEach((c) => { b[Math.min(c, MAX_HIST - 1)]++; }); return b; }, [hist]);
  const maxBarra = Math.max(1, ...barras);

  return (
    <figure className="vz" data-vz="cem-vidas">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Cem operações · PD de {fmtPct(PD12)} em 12 meses · exemplo sintético</p>
          <p className="vz-tit">Aperte o play e veja os doze meses acontecerem.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => { if (mes >= MESES) setMes(0); setTocando((v) => !v); }} aria-pressed={tocando}>{tocando ? "Pausar" : mes >= MESES ? "Ver de novo" : mes > 0 ? "Continuar" : "Reproduzir os 24 meses"}</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setTocando(false); setMes(0); setSemente((s) => s + 1); }}>Sortear outra realização</button>
        </div>
      </header>

      <div className="vz-vidas-grade">
        <div className="vz-vidas-bloco">
          <svg className="vz-vidas" viewBox="0 0 400 400" role="img" aria-label={`Cem operações; no mês ${mes}, ${contam} defaults dentro do horizonte de ${horizonte} meses`}>
            {meses.map((md, i) => { const x = (i % 10) * 40 + 4, y = Math.floor(i / 10) * 40 + 4; const estado = md <= mes ? (md <= horizonte ? "default" : "depois") : "viva"; return (
              <g key={`${i}-${estado}`} className={`vz-vida vz-vida--${estado}`} style={{ transformOrigin: `${x + 16}px ${y + 16}px` }}>
                <rect x={x} y={y} width={32} height={32} rx={5} />
                {estado !== "viva" && <text x={x + 16} y={y + 21} textAnchor="middle" className="vz-vida-mes">M{md}</text>}
              </g>
            ); })}
          </svg>
          <div className="vz-legenda"><span><i className="vz-sw vz-sw--viva" /> em dia</span><span><i className="vz-sw vz-sw--default" /> default dentro do horizonte</span><span><i className="vz-sw vz-sw--depois" /> atrasou depois do horizonte: não conta</span></div>
        </div>

        <div className="vz-vidas-painel">
          <div className="vz-tempo">
            <div className="vz-tempo-topo"><span className="eyebrow">Mês {mes} de {MESES}</span><span className="eyebrow">horizonte de {horizonte} meses</span></div>
            <input type="range" min={0} max={MESES} step={1} value={mes} onChange={(e) => { setTocando(false); setMes(Number(e.target.value)); }} aria-label="Mês" aria-valuetext={`mês ${mes}`} />
            <div className="vz-tempo-trilho" aria-hidden="true"><span className="vz-tempo-horizonte" style={{ width: `${(horizonte / MESES) * 100}%` }} /><span className="vz-tempo-cursor" style={{ left: `${(mes / MESES) * 100}%` }} /></div>
            <div className="vz-seg" role="group" aria-label="Horizonte da PD">
              {HORIZONTES.map((h) => <button key={h} type="button" className={`vz-seg-b ${h === horizonte ? "vz-seg-b--on" : ""}`} aria-pressed={h === horizonte} onClick={() => { setHorizonte(h); setHist([]); setLote(0); }}>{h} meses</button>)}
            </div>
          </div>
          <div className="vz-tiles" aria-live="polite">
            <div className="vz-tile"><p className="eyebrow">Defaults que contam</p><p className="vz-num vz-num--default">{contam}</p><p className="hint">{mes >= horizonte ? `em ${horizonte} meses` : `até o mês ${mes}, ainda em andamento`}{depois ? ` · ${depois} depois do horizonte` : ""}</p></div>
            <div className="vz-tile"><p className="eyebrow">Esperados pela PD</p><p className="vz-num">{esperado.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</p><p className="hint">PD de {fmtPct(pdAcumulada(H, horizonte), 1)} em {horizonte} meses · desvio de cerca de {Math.sqrt(esperado * (1 - esperado / N)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</p></div>
          </div>

          <div className="vz-hist">
            <div className="vz-hist-topo">
              <p className="vz-grafico-t">Muitas realizações do mesmo mundo <span className="hint">{hist.length ? `${hist.length} sorteios · média ${media!.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}${dp != null ? ` · desvio ${dp.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}` : ""}` : "a PD não muda; a contagem muda"}</span></p>
              <div className="vz-acoes"><button type="button" className="btn btn-sm btn-secondary" onClick={() => setLote((l) => l + 50)} disabled={lote > 0}>Sortear 50 vezes</button>{hist.length > 0 && <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setHist([]); setLote(0); }}>Limpar</button>}</div>
            </div>
            <svg viewBox="0 0 400 130" role="img" aria-label={hist.length ? `Histograma de ${hist.length} sorteios, média ${media!.toFixed(1)}` : "Histograma vazio"}>
              {barras.map((c, i) => { const w = 400 / MAX_HIST; const h = (c / maxBarra) * 96; return <g key={i}><rect x={i * w + 1.5} y={110 - h} width={w - 3} height={h} rx={2} className={`vz-hist-barra ${Math.abs(i - Math.round(esperado)) <= 0 ? "vz-hist-barra--esp" : ""}`} />{i % 5 === 0 && <text x={i * w + w / 2} y={124} textAnchor="middle" className="vz-tick">{i}</text>}</g>; })}
              <line x1={(esperado + 0.5) * (400 / MAX_HIST)} x2={(esperado + 0.5) * (400 / MAX_HIST)} y1={6} y2={110} className="vz-esperado" />
              <text x={(esperado + 0.5) * (400 / MAX_HIST) + 5} y={14} className="vz-ks-t">esperado {esperado.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</text>
            </svg>
          </div>
        </div>
      </div>
      <figcaption className="vz-fonte">Simulação com risco mensal constante: PD de 10% em 12 meses equivale a {fmtPct(H, 2)} ao mês, o que dá {fmtPct(pdAcumulada(H, 6), 1)} em 6 meses, {fmtPct(pdAcumulada(H, 18), 1)} em 18 e {fmtPct(pdAcumulada(H, 24), 1)} em 24. Cada quadrado é uma operação; a mesma trajetória conta ou não conforme o horizonte declarado. Com 100 casos, o desvio padrão da contagem em 12 meses é cerca de 3.</figcaption>
    </figure>
  );
}
