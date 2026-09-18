import Link from "next/link";

export default function CapituloNaoEncontrado() {
  return (
    <div className="card max-w-[760px]">
      <p className="eyebrow">Capítulo não disponível</p>
      <h1 className="mt-1">Este capítulo não existe ou não tem páginas publicadas na edição da turma selecionada</h1>
      <p className="mt-3">Os capítulos vão de 1 a 11. Troque a turma no seletor do topo ou volte para a lista de aulas.</p>
      <div className="mt-4"><Link href="/aulas" className="btn">Aulas</Link></div>
    </div>
  );
}
