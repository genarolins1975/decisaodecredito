"use client";
import { useEffect, useMemo, useState } from "react";
import { fmtPct } from "@/lib/visuais/metricas";
import { fracaoManifestada, mesIdx, mesesObservados, prevalenciaComImaturas, rotuloMes, safraMadura } from "@/lib/visuais/tempo";

/**
 * A base amadurece (capítulo 3). Trinta e seis safras mensais contra a data de referência. Uma safra entra quando
 * safra + horizonte + apuração cabe antes da referência; a parte tracejada é a informação que ainda não existe.
 */
const HORIZONTE = 12, APURACAO = 1, P = 0.1;
const SAFRAS = Array.from({ length: 36 }, (_, i) => mesIdx(2022, 1) + i);
const X0 = mesIdx(2022, 1), X1 = mesIdx(2026, 3);
const REF_BASE = mesIdx(2025, 1);
const PARTICAO = [{ nome: "treino", de: mesIdx(2022, 1), ate: mesIdx(2023, 2) }, { nome: "validação", de: mesIdx(2023, 3), ate: mesIdx(2023, 7) }, { nome: "fora do tempo", de: mesIdx(2023, 8), ate: mesIdx(2023, 12) }];
const W = 900, ML = 128, MR = 150, MT = 26, RH = 9, MB = 26; const XP = 6, WP = 54; const HGT = MT + SAFRAS.length * RH + MB;
const px = (m: number) => ML + ((m - X0) / (X1 - X0)) * (W - ML - MR);

export function Safras() {
  const [ref, setRef] = useState(REF_BASE);
  const [tocando, setTocando] = useState(false);
  const maduras = useMemo(() => SAFRAS.filter((s) => safraMadura(s, ref, HORIZONTE, APURACAO)), [ref]);
  const ultima = maduras.length ? maduras[maduras.length - 1] : null;
  const vies = useMemo(() => prevalenciaComImaturas(SAFRAS, ref, P, HORIZONTE, APURACAO), [ref]);
  const concedidas = SAFRAS.filter((s) => s <= ref - 1).length;

  useEffect(() => {
    if (!tocando) return;
    if (ref >= mesIdx(2026, 1)) { const t = setTimeout(() => setTocando(false), 0); return () => clearTimeout(t); }
    const t = setTimeout(() => setRef((r) => r + 1), 260);
    return () => clearTimeout(t);
  }, [tocando, ref]);

  const anos = [2022, 2023, 2024, 2025, 2026];
  return (
    <figure className="vz" data-vz="safras">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">A base amadurece · 36 safras mensais · horizonte de 12 meses e apuração de 1</p>
          <p className="vz-tit">Mova a data de referência. Só entra a safra cuja janela fechou inteira.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => { if (ref >= mesIdx(2026, 1)) setRef(mesIdx(2023, 1)); setTocando((v) => !v); }} aria-pressed={tocando}>{tocando ? "Pausar" : "Deixar o tempo passar"}</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setTocando(false); setRef(REF_BASE); }}>Voltar à referência da base (jan 2025)</button>
        </div>
      </header>
      <div className="vz-safras-grade">
        <svg className="vz-safras-svg" viewBox={`0 0 ${W} ${HGT}`} role="img" aria-label={`Na referência ${rotuloMes(ref)}, ${maduras.length} safras maduras${ultima != null ? `, a última é ${rotuloMes(ultima)}` : ""}`}>
          {anos.map((a) => <g key={a}><line x1={px(mesIdx(a, 1))} x2={px(mesIdx(a, 1))} y1={MT - 6} y2={HGT - MB + 4} className="vz-grade" /><text x={px(mesIdx(a, 1)) + 4} y={HGT - MB + 18} className="vz-tick">{a}</text></g>)}
          <rect x={px(ref)} y={MT - 6} width={px(X1) - px(ref)} height={HGT - MT - MB + 10} className="vz-futuro" />
          {ref === REF_BASE && PARTICAO.map((p) => { const y0 = MT + SAFRAS.indexOf(p.de) * RH, y1 = MT + (SAFRAS.indexOf(p.ate) + 1) * RH; return <g key={p.nome}><rect x={XP} y={y0} width={WP} height={y1 - y0} className={`vz-particao vz-particao--${p.nome === "treino" ? "treino" : p.nome === "validação" ? "val" : "oot"}`} /><text x={XP + WP / 2} y={(y0 + y1) / 2 + 3} textAnchor="middle" className="vz-particao-t">{p.nome === "fora do tempo" ? "OOT" : p.nome}</text></g>; })}
          {SAFRAS.map((s, i) => {
            const y = MT + i * RH; const obs = mesesObservados(s, ref, HORIZONTE); const madura = safraMadura(s, ref, HORIZONTE, APURACAO); const concedida = s <= ref - 1;
            const xs = px(s), xf = px(s + HORIZONTE), xo = px(s + obs), xa = px(s + HORIZONTE + APURACAO);
            return (
              <g key={s} className={`vz-safra ${madura ? "vz-safra--madura" : concedida ? "vz-safra--imatura" : "vz-safra--futura"}`}>
                {(i % 3 === 0) && <text x={ML - 6} y={y + RH - 2} textAnchor="end" className="vz-tick">{rotuloMes(s)}</text>}
                <rect x={xs} y={y + 1} width={Math.max(0, xf - xs)} height={RH - 2} className="vz-safra-janela" />
                {obs > 0 && <rect x={xs} y={y + 1} width={Math.max(0, xo - xs)} height={RH - 2} className="vz-safra-obs" />}
                <rect x={xf} y={y + 2} width={Math.max(0, xa - xf)} height={RH - 4} className="vz-safra-apur" />
                {!madura && concedida && obs > 0 && <text x={xa + 6} y={y + RH - 2} className="vz-safra-nota">{Math.round(fracaoManifestada(obs, HORIZONTE) * 100)}% dos defaults já visíveis</text>}
              </g>
            );
          })}
          <line x1={px(ref)} x2={px(ref)} y1={MT - 12} y2={HGT - MB + 6} className="vz-decisao vz-decisao--hoje" />
          <text x={px(ref)} y={MT - 14} textAnchor="middle" className="vz-decisao-t vz-decisao-t--hoje">hoje: referência {rotuloMes(ref)}</text>
        </svg>
        <div className="vz-safras-painel">
          <label className="vz-slider">
            <span className="vz-slider-rotulo"><b>Data de referência</b> <span className="vz-slider-valor">{rotuloMes(ref)}</span></span>
            <input type="range" min={mesIdx(2023, 1)} max={mesIdx(2026, 1)} step={1} value={ref} onChange={(e) => { setTocando(false); setRef(Number(e.target.value)); }} aria-valuetext={rotuloMes(ref)} />
          </label>
          <div className="vz-tiles vz-tiles--coluna" aria-live="polite">
            <div className="vz-tile"><p className="eyebrow">Safras que entram</p><p className="vz-num">{maduras.length}</p><p className="hint">{ultima != null ? `até ${rotuloMes(ultima)}` : "nenhuma janela fechou ainda"}</p></div>
            <div className="vz-tile"><p className="eyebrow">Concedidas e ainda imaturas</p><p className={`vz-num ${vies.imaturas ? "vz-num--default" : ""}`}>{vies.imaturas}</p><p className="hint">de {concedidas} já concedidas; a mais recente é a mais parecida com hoje e é a que não pode entrar</p></div>
            <div className="vz-tile"><p className="eyebrow">Se as imaturas entrassem com rótulo zero</p><p className={`vz-num ${vies.imaturas ? "vz-num--default" : ""}`}>{fmtPct(vies.comImaturas, 1)}</p><p className="hint">prevalência medida, contra {fmtPct(P, 1)} verdadeira</p></div>
          </div>
          <div className="vz-legenda vz-legenda--coluna"><span><i className="vz-sw vz-sw--madura" /> janela de 12 meses fechada e apurada</span><span><i className="vz-sw vz-sw--obs" /> meses já observados de uma safra imatura</span><span><i className="vz-sw vz-sw--faltam" /> meses que ainda faltam correr</span><span><i className="vz-sw vz-sw--apur" /> defasagem de apuração</span></div>
        </div>
      </div>
      <figcaption className="vz-fonte">Regra de inclusão: safra + horizonte + apuração menor ou igual à data de referência. Com referência em jan 2025 o conjunto fora do tempo vai até dez 2023 e nenhuma safra de 2024 entra, como na base do curso (treino jan 2022 a fev 2023, validação mar a jul 2023, fora do tempo ago a dez 2023). A fração de defaults já visíveis usa a curva ilustrativa da página seguinte, com 42% na metade da janela; a prevalência de 10% e as safras de tamanho igual são hipóteses do exemplo.</figcaption>
    </figure>
  );
}
