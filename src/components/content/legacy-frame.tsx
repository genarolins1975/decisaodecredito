"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Visual interativo do material original, executado em iframe com sandbox (origem opaca,
 * sem cookies nem acesso à página autenticada). O motor carregado não contém guia nem gabaritos.
 * Comunicação restrita: altura (iframe → página) e revelação de conteúdo após previsão (página → iframe).
 */
export function LegacyFrame({ slug, fallbackHtml, note, revealRef }: { slug: string; fallbackHtml: string; note: string; revealRef?: React.MutableRefObject<((slug: string, choice: number) => void) | null> }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(420);
  const [mode, setMode] = useState<"interativo" | "estatico">("interativo");
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    if (!revealRef) return;
    revealRef.current = (s, choice) => { ref.current?.contentWindow?.postMessage({ type: "legacy:reveal", slug: s, choice }, "*"); };
    return () => { revealRef.current = null; };
  }, [revealRef]);

  return (
    <figure className="my-2">
      <div className="flex items-center justify-between gap-2 mb-1 no-print">
        <span className="hint">{mode === "interativo" ? "Visual interativo" : "Versão estática para leitura"}</span>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setMode(mode === "interativo" ? "estatico" : "interativo")} aria-pressed={mode === "estatico"}>
          {mode === "interativo" ? "Ver versão estática" : "Ver versão interativa"}
        </button>
      </div>
      {mode === "interativo" ? (
        <div className="relative rounded-md border border-rule bg-ground overflow-hidden">
          {!loaded && <p className="absolute inset-0 grid place-items-center hint" aria-live="polite">Carregando visual…</p>}
          <iframe ref={ref} title={`Visual interativo da página ${slug}`} src={`/legado/${slug}`} sandbox="allow-scripts" referrerPolicy="no-referrer"
            style={{ width: "100%", height, border: 0, display: "block" }} loading="lazy" />
        </div>
      ) : (
        <div className="conteudo rounded-md border border-rule bg-white p-3" dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
      )}
      <figcaption className="hint mt-1">{note}</figcaption>
    </figure>
  );
}
