import Link from "next/link";

/** 404 global. Também é o limite de notFound() das áreas com moldura, que já têm main e cabeçalho:
    por isso a página não abre landmark nem repete o id do conteúdo, e o espaçamento é o do cartão. */
export default function NaoEncontrada() {
  return (
    <div className="max-w-[720px] mx-auto py-6">
      <div className="card">
        <p className="eyebrow">Página não encontrada</p>
        <h1 className="mt-1">Este endereço não existe na plataforma</h1>
        <p className="mt-3">Confira o endereço ou volte para o início.</p>
        <div className="mt-4 flex gap-2 flex-wrap"><Link href="/inicio" className="btn">Início</Link><Link href="/aulas" className="btn btn-secondary">Aulas</Link></div>
      </div>
    </div>
  );
}
