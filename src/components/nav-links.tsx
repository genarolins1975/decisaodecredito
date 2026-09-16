"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./app-shell";

export function NavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <ul className="flex gap-1 list-none m-0 p-0 whitespace-nowrap">
      {items.map((it) => {
        const active = it.exact ? path === it.href : path === it.href || path.startsWith(it.href + "/");
        return (
          <li key={it.href}>
            <Link href={it.href} aria-current={active ? "page" : undefined}
              className={`inline-flex items-center min-h-[44px] px-3 text-[13.5px] no-underline border-b-2 ${active ? "border-gold text-white font-semibold" : "border-transparent text-white/80 hover:text-white"}`}>
              {it.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
