"use client";
import Link from "next/link";

/** Limite de erro da tela de primeiro acesso: sem ele uma falha de cliente cai na tela padrão do Next, em inglês. */
export default function ErroPrimeiroAcesso({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card" role="alert">
      <p className="eyebrow">Falha ao montar a página</p>
      <h1 className="mt-1">Algo deu errado deste lado</h1>
      <p className="mt-3">A página não pôde ser montada. Tente de novo; se persistir, informe ao professor o código abaixo e a hora.</p>
      <p className="mt-2 font-mono text-[13px] break-all">{error.digest ? `código ${error.digest}` : error.message}</p>
      <div className="mt-4 flex gap-2 flex-wrap"><button type="button" className="btn" onClick={reset}>Tentar de novo</button><Link href="/entrar" className="btn btn-secondary">Entrar</Link></div>
    </div>
  );
}
