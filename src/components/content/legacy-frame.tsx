"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Visual interativo do material original, executado em iframe com sandbox (origem opaca,
 * sem cookies nem acesso à página autenticada). O motor carregado não contém guia nem gabaritos.
 * Comunicação restrita: altura (iframe → página) e revelação de conteúdo após previsão (página → iframe).
 */
export function LegacyFrame({ slug, fallbackHtml, note, revealRef, palco }: { slug: string; fallbackHtml: string; note: string; revealRef?: React.MutableRefObject<((slug: string, choice: number) => void) | null>; palco?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(420);
  const [mode, setMode] = useState<"interativo" | "estatico">("interativo");
  const [loaded, setLoaded] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1); // palco: redução por transform (zoom externo não alcança o documento do iframe)

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      const d = e.data as { type?: string; height?: number };
      if (d?.type === "legacy:height" && typeof d.height === "number") setHeight(Math.min(Math.max(240, Math.ceil(d.height) + 8), 6000));
      if (d?.type === "legacy:ready") setLoaded(true);
    }
    addEventListener("message", onMsg);
    return () => removeEventListener("message", onMsg);
  }, []);

  // no palco a caixa tem altura fixa (66% do slide, via CSS) e o iframe é reduzido por transform para caber nela.
  // A largura do iframe fica em 100% da caixa, constante, para o documento não reflui e a altura reportada não
  // realimentar o ajuste do slide (zoom externo não alcança o documento do iframe).
  useEffect(() => {
    const caixa = caixaRef.current; if (!caixa || !caixa.closest(".slide-inner")) return;
    const ajustar = () => { const teto = caixa.clientHeight; setEscala(teto > 0 && height > teto ? Math.max(0.3, teto / height) : 1); };
    ajustar();
    const ro = new ResizeObserver(ajustar); ro.observe(caixa);
    return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    if (!revealRef) return;
    revealRef.current = (s, choice) => { ref.current?.contentWindow?.postMessage({ type: "legacy:reveal", slug: s, choice }, "*"); };
    return () => { revealRef.current = null; };
  }, [revealRef]);

  return (
    <figure className="my-2" data-legado={palco ? "" : undefined}>
      <div className="flex items-center justify-between gap-2 mb-1 no-print">
        <span className="hint">{mode === "interativo" ? "Visual interativo" : "Versão estática para leitura"}</span>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setMode(mode === "interativo" ? "estatico" : "interativo")} aria-pressed={mode === "estatico"}>
          {mode === "interativo" ? "Ver versão estática" : "Ver versão interativa"}
        </button>
      </div>
      {mode === "interativo" ? (
        <div ref={caixaRef} className="relative rounded-md border border-rule bg-ground overflow-hidden legado-caixa" style={palco ? undefined : { height }}>
          {!loaded && <p className="absolute inset-0 grid place-items-center hint" aria-live="polite">Carregando visual…</p>}
          <iframe ref={ref} title={`Visual interativo da página ${slug}`} src={`/legado/${slug}`} sandbox="allow-scripts" referrerPolicy="no-referrer"
            style={{ width: "100%", height, border: 0, display: "block", transform: escala < 1 ? `scale(${escala.toFixed(4)})` : undefined, transformOrigin: "50% 0" }} loading={palco ? "eager" : "lazy"} />
        </div>
      ) : (
        <div className="conteudo rounded-md border border-rule bg-white p-3" dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
      )}
      <figcaption className="hint mt-1">{note}</figcaption>
    </figure>
  );
}
