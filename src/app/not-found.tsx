import Link from "next/link";

/** 404 global: fora das áreas com moldura (rotas inexistentes). */
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
