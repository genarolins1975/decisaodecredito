"use client";
import Link from "next/link";

/** Limite de erro da área do aluno: mantém a moldura da aplicação e mostra o código para diagnóstico. */
export default function ErroArea({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card max-w-[720px]" role="alert">
      <p className="eyebrow">Falha ao montar a página</p>
      <h1 className="mt-1">Algo deu errado deste lado</h1>
      <p className="mt-3">A página não pôde ser montada. Tente de novo; se persistir, informe ao professor o código abaixo e a hora.</p>
      <p className="mt-2 font-mono text-[13px] break-all">{error.digest ? `código ${error.digest}` : error.message}</p>
      <div className="mt-4 flex gap-2 flex-wrap"><button type="button" className="btn" onClick={reset}>Tentar de novo</button><Link href="/inicio" className="btn btn-secondary">Início</Link></div>
    </div>
  );
}
