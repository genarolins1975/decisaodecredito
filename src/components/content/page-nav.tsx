"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PageNav({ prev, next, position }: { prev: { href: string; title: string } | null; next: { href: string; title: string } | null; position: string }) {
  const router = useRouter();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.altKey && e.key === "ArrowRight" && next) router.push(next.href);
      if (e.altKey && e.key === "ArrowLeft" && prev) router.push(prev.href);
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [prev, next, router]);
  return (
    <nav className="mt-8 flex items-center justify-between gap-3 border-t border-rule pt-4 no-print" aria-label="Navegação entre páginas">
      {prev ? <Link href={prev.href} className="btn btn-secondary" rel="prev">← Anterior</Link> : <span />}
      <span className="hint text-center">página {position}<span className="hidden md:inline"> · Alt+← e Alt+→ também navegam</span></span>
      {next ? <Link href={next.href} className="btn" rel="next">Próxima →</Link> : <span />}
    </nav>
  );
}
