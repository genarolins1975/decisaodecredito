import Link from "next/link";

/** 404 da raiz: endereço que não casa com nenhuma rota, servido sem moldura nenhuma. Por isso ele
    abre o próprio main, que é o alvo do pulo "Ir para o conteúdo" do layout raiz. As áreas com
    moldura têm limite próprio em (app)/not-found.tsx e professor/not-found.tsx, sem landmark. */
export default function NaoEncontrada() {
  return (
    <main id="conteudo" className="max-w-[720px] mx-auto px-4 py-12">
      <div className="card">
        <p className="eyebrow">Página não encontrada</p>
        <h1 className="mt-1">Este endereço não existe na plataforma</h1>
        <p className="mt-3">Confira o endereço ou volte para o início.</p>
        <div className="mt-4 flex gap-2 flex-wrap"><Link href="/inicio" className="btn">Início</Link><Link href="/aulas" className="btn btn-secondary">Aulas</Link></div>
      </div>
    </main>
  );
}
