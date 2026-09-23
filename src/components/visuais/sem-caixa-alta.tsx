/**
 * Protege letras gregas da caixa alta. Em cabeçalhos com text-transform: uppercase, "η" vira "Η" e "β₀" vira "Β₀", que se
 * leem como H e B. O trecho grego (com o índice) sai num span que não muda de caixa (.letra-grega, em globals.css).
 */
export function SemCaixaAlta({ children }: { children: string }) {
  return <>{children.split(/([α-ω][₀-₉]*)/).map((t, i) => (i % 2 ? <span key={i} className="letra-grega">{t}</span> : t))}</>;
}
