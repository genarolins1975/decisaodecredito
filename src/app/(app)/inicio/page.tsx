import type { Metadata } from "next";
import { requireContext } from "@/lib/context";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Visão geral" };

export default async function InicioPage() {
  const ctx = await requireContext();
  return (
    <div>
      <PageHeader eyebrow={<>{ctx.current.cls.name} · edição {ctx.current.edition.label}</>} title={`Olá, ${ctx.user.name.split(" ")[0]}`} lead="Visão geral em construção." />
    </div>
  );
}
