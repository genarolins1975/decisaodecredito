"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Dentro do slide, garante que a peça (visual nativo ou infográfico) caiba na área visível: mede a altura natural
 * e aplica um zoom entre 0,6 e 1. Fora do slide não faz nada. O ajuste é o último recurso; a variante compacta
 * (.slide-inner .vz, .info--slide) faz o grosso do trabalho.
 */
export function AjusteAoPalco({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const area = el.closest(".slide-inner .conteudo") as HTMLElement | null; if (!area) return;
    let raf = 0;
    const ajustar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.zoom = "1";
        const disponivel = area.clientHeight - 4; const natural = el.scrollHeight;
        const z = natural > disponivel ? Math.max(0.6, disponivel / natural) : 1;
        el.style.zoom = z.toFixed(3); el.dataset.zoom = z.toFixed(2);
      });
    };
    ajustar();
    const ro = new ResizeObserver(ajustar); ro.observe(area);
    const fontes = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts; fontes?.ready.then(ajustar);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="palco-ajuste">{children}</div>;
}
