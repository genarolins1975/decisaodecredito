import Link from "next/link";

/** notFound() da página de aula: a página não está publicada na edição da turma selecionada. */
export default function PaginaNaoPublicada() {
  return (
    <div className="card max-w-[760px]">
      <p className="eyebrow">Página não disponível</p>
      <h1 className="mt-1">Esta página não está publicada na edição da turma selecionada</h1>
      <p className="mt-3">O endereço é válido, mas a edição da turma escolhida no seletor do topo não tem esta página publicada. Troque a turma, ou volte para a lista de aulas.</p>
      <div className="mt-4"><Link href="/aulas" className="btn">Aulas</Link></div>
    </div>
  );
}
