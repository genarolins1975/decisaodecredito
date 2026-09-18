import Link from "next/link";

/** notFound() do editor: o identificador da página não existe mais no banco (conteúdo reimportado ou edição removida). */
export default function PaginaDoEditorNaoEncontrada() {
  return (
    <div className="card max-w-[760px]">
      <p className="eyebrow">Página não encontrada</p>
      <h1 className="mt-1">O identificador desta página não existe mais</h1>
      <p className="mt-3">A listagem de Conteúdo pode estar desatualizada em relação ao banco, por exemplo depois de uma reimportação ou da remoção de uma edição. Recarregue a listagem e abra a página de novo a partir dela.</p>
      <div className="mt-4"><Link href="/professor/conteudo" className="btn">Voltar para Conteúdo</Link></div>
    </div>
  );
}
