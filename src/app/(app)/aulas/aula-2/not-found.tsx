import Link from "next/link";

/** notFound() da Aula 2 e de cada página de slide. Como é o limite mais próximo, cobre os dois. */
export default function AulaEmSlidesNaoEncontrada() {
  return (
    <div className="card max-w-[760px]">
      <p className="eyebrow">Aula não disponível</p>
      <h1 className="mt-1">Esta aula em slides não está disponível na edição da turma selecionada</h1>
      <p className="mt-3">Os slides vão de 01 a 50. Confira o número no endereço, troque a turma no seletor do topo ou volte para a lista de aulas.</p>
      <p className="mt-2 hint">Para o professor: a aula é servida a partir do baralho compilado. Se ele não tiver sido compilado nesta instalação, rode <code>node aula_credito_html/build.mjs</code>, que regrava os arquivos de content/slides.</p>
      <div className="mt-4 flex gap-2 flex-wrap"><Link href="/aulas" className="btn">Aulas</Link><Link href="/aulas/aula-2/slide/01" className="btn btn-secondary">Slide 1</Link></div>
    </div>
  );
}
