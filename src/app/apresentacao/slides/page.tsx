import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession } from "@/lib/services/live";
import { Projecao } from "@/components/live/projecao-slides";

export const metadata: Metadata = { title: "Projetar os slides" };

/**
 * Janela de projeção da aula em slides. O professor navega no próprio baralho, com as setas, e a
 * janela avisa a sessão a cada troca de slide, para a tela do aluno acompanhar. O baralho continua
 * um arquivo único e offline: quem fala com a API é esta casca, não ele.
 */
export default async function ProjetarSlidesPage({ searchParams }: { searchParams: Promise<{ sessao?: string }> }) {
  const { sessao } = await searchParams;
  if (!sessao) notFound();
  let s;
  try { s = await getSession(sessao); } catch { notFound(); }
  await requireClassAccess(s.classId, ["professor", "monitor"]);
  return <Projecao sessionId={sessao} inicial={s.currentSlide} />;
}
