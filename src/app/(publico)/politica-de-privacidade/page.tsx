import type { Metadata } from "next";
import Link from "next/link";
import { AvisoPrivacidade } from "@/components/legal/aviso-privacidade";

export const metadata: Metadata = { title: "Política de privacidade", robots: { index: true, follow: false } };

/** Página pública: o Google exige uma política de privacidade acessível sem login para publicar o app OAuth. */
export default function PoliticaPrivacidadePage() {
  return (
    <div className="w-full">
      <p className="eyebrow mb-1">Política de privacidade</p>
      <h1 className="mb-1">Dados tratados nesta plataforma</h1>
      <p className="hint">Laboratório de Decisão de Crédito · plataforma de apoio ao curso, de uso restrito a alunos matriculados. Última revisão: 17 de setembro de 2026.</p>
      <AvisoPrivacidade />
      <p className="text-[14px] mt-4"><Link href="/entrar">Voltar à entrada</Link></p>
    </div>
  );
}
