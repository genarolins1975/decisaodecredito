import type { Metadata } from "next";
import Link from "next/link";
import { requireContext } from "@/lib/context";
import { listSessionsForClass } from "@/lib/services/live";
import { PageHeader, Empty, StatusBadge } from "@/components/ui";
import { fmtDT } from "@/lib/time";

export const metadata: Metadata = { title: "Aula ao vivo" };

export default async function AoVivoPage() {
  const ctx = await requireContext();
  const sessions = await listSessionsForClass(ctx.current.classId);
  const visible = sessions.filter((s) => s.s.status !== "draft");
  return (
    <div>
      <PageHeader eyebrow={ctx.current.cls.name} title="Aula ao vivo" lead="Quando o professor abre a sessão, você acompanha o slide apresentado, responde às questões publicadas e faz o check-in de presença com o código mostrado em sala." />
      {visible.length === 0 ? <Empty title="Nenhuma sessão aberta agora">Esta página se atualiza quando o professor iniciar uma aula ao vivo.</Empty> : (
        <ul className="grid gap-3 md:grid-cols-2 list-none p-0 m-0">
          {visible.map(({ s, m }) => (
            <li key={s.id} className="card flex flex-col gap-2">
              <p className="eyebrow">Encontro {m.number} · {fmtDT(m.scheduledAt) || "sem data"}</p>
              <h2 className="text-lg">{m.title}</h2>
              <p><StatusBadge status={s.status} /></p>
              <Link href={`/ao-vivo/${s.id}`} className="btn btn-sm self-start">{s.status === "open" ? "Entrar na sessão" : "Ver resultados"}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
