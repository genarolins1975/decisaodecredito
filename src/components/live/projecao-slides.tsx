"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";

/** Lê o slide do hash do baralho e publica na sessão. Falha de rede não interrompe a aula. */
export function Projecao({ sessionId, inicial }: { sessionId: string; inicial: string | null }) {
  const quadro = useRef<HTMLIFrameElement>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const f = quadro.current;
    if (!f) return;
    let ultimo = inicial;
    const publicar = () => {
      let w: Window | null = null;
      try { w = f.contentWindow; } catch { return; }
      const m = /^#\/slide\/(\d{2})$/.exec(w?.location.hash ?? "");
      if (!m || m[1] === ultimo) return;
      ultimo = m[1];
      api(`/api/aovivo/${sessionId}/slide`, { body: { slide: m[1] } }).then(() => setErro(false)).catch(() => setErro(true));
    };
    const ligar = () => {
      try { f.contentWindow?.addEventListener("hashchange", publicar); } catch { /* origem diferente, não ocorre aqui */ }
      publicar();
    };
    f.addEventListener("load", ligar);
    ligar();
    return () => { f.removeEventListener("load", ligar); try { f.contentWindow?.removeEventListener("hashchange", publicar); } catch { /* já descarregado */ } };
  }, [sessionId, inicial]);

  return (
    <div className="fixed inset-0 bg-black">
      <iframe ref={quadro} title="Slides da aula" src={`/slides/aula-2${inicial ? `#/slide/${inicial}` : ""}`} className="w-full h-full border-0" />
      {erro && <p className="absolute bottom-2 right-3 text-[12px] text-white/80">Sem conexão com a sessão. A projeção continua; a tela dos alunos pode ficar para trás.</p>}
    </div>
  );
}
