import Link from "next/link";

/** Limite de notFound() das rotas com moldura: a casca já dá o main e o cabeçalho, então aqui vai só o cartão.
    Sem este arquivo o limite passaria a ser o 404 da raiz, que abre o próprio main e repetiria o landmark. */
export default function NaoEncontradaNaEquipe() {
  return (
    <div className="card max-w-[760px]">
      <p className="eyebrow">Página não encontrada</p>
      <h1 className="mt-1">Este endereço não existe na plataforma</h1>
      <p className="mt-3">Confira o endereço. Se você chegou aqui por um link da plataforma, avise o professor.</p>
      <div className="mt-4 flex gap-2 flex-wrap"><Link href="/professor" className="btn">Painel</Link><Link href="/professor/turmas" className="btn btn-secondary">Turmas</Link></div>
    </div>
  );
}
