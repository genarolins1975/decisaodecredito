import Link from "next/link";

/** notFound() da página de aula: a página não está publicada na edição da turma selecionada. */
export default function PaginaNaoPublicada() {
  return (
    <div className="card max-w-[760px]">
      <p className="eyebrow">Página não disponível</p>
      <h1 className="mt-1">Esta página não está publicada na edição da turma selecionada</h1>
      <p className="mt-3">O endereço é válido, mas a edição da turma escolhida no seletor do topo não tem esta página publicada. Troque a turma, ou volte para a lista de aulas.</p>
      <p className="mt-2 hint">Para o professor: o estado de publicação e a edição de cada página estão em Conteúdo, com o ano selecionado no alto; a página aberta por ver usa a edição da turma ativa no seletor, não o ano da listagem.</p>
      <div className="mt-4 flex gap-2 flex-wrap"><Link href="/aulas" className="btn">Aulas</Link><Link href="/professor/conteudo" className="btn btn-secondary">Conteúdo (professor)</Link></div>
    </div>
  );
}
