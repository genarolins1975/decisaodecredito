"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Seções de uma turma, com nome de lugar e sem jargão de sistema. */
export function ClassSubnav({ id }: { id: string }) {
  const path = usePathname();
  const items = [["", "Resumo"], ["/alunos", "Alunos"], ["/encontros", "Aulas ao vivo"], ["/frequencia", "Presença"], ["/trabalhos", "Trabalhos"], ["/grupos", "Grupos"], ["/notas", "Notas"], ["/configuracoes", "Ajustes"]];
  return (
    <nav aria-label="Seções da turma" className="border-b border-rule overflow-x-auto">
      <ul className="flex gap-1 list-none m-0 p-0 whitespace-nowrap">
        {items.map(([suffix, label]) => { const href = `/professor/turmas/${id}${suffix}`; const active = suffix === "" ? path === href : path.startsWith(href); return (
          <li key={href}><Link href={href} aria-current={active ? "page" : undefined} className={`inline-flex items-center min-h-[44px] px-3 text-[14px] no-underline border-b-2 ${active ? "border-gold text-ink font-semibold" : "border-transparent text-muted hover:text-ink"}`}>{label}</Link></li>
        ); })}
      </ul>
    </nav>
  );
}
