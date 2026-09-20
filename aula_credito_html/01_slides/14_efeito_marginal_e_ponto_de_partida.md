# Slide 14 — O mesmo coeficiente produz efeitos diferentes na PD

**Bloco:** logit. **Tempo:** 4 min. **Reaproveitamento:** conservar exemplos de efeito marginal que estejam corretos.

## Objetivo e mensagem
Distinguir Δz constante, efeito marginal local e mudança finita de PD. Mensagem: “A resposta em probabilidade é mais intensa na região central da sigmoide.”

## Tela e composição
Título: **“Aumentar o escore em 0,40 não aumenta toda PD pelo mesmo valor”**. Uma sigmoide ampla com três segmentos destacados, partindo de PDs 2%, 10% e 40%. Embaixo, três resultados antes/depois em escala comum. Ao lado, uma pequena explicação de `dp/dcomp=0,04p(1-p)` visível somente após a intuição.

## Cálculo
Converter cada PD inicial em z, somar 0,40 e reconverter. Exibir diferença exata em p.p. como resultado principal. A derivada é uma aproximação para pequenas alterações, não a fórmula exata do salto de 10 p.p. em comprometimento. Manter esse contraste explícito no aprofundamento.

## Interação
Seleção de PD inicial entre os três cenários ou slider de 1–60%, padrão 10%. Controle de mudança em comprometimento de 0–15 p.p., padrão 10. Mostrar deslocamento horizontal em z e vertical em p. Botão “Aproximação local” acrescenta a tangente e compara variação aproximada versus exata, sem substituir o número principal.

## Roteiro
Comece nos três segmentos com a mesma largura horizontal. Peça aos alunos comparar suas alturas. Revele os valores e só então a derivada. Reduza a mudança para 1 p.p. e mostre a aproximação local ficando mais próxima. Não é necessário demonstrar a derivada em sala; inclua o desenvolvimento nas notas.

## Notas
O efeito máximo da derivada da logística ocorre em p=0,5, mas isso não significa que carteiras de crédito devam operar perto de 50% de PD. A explicação é matemática. Muitas aplicações se concentram em uma região menor da curva, e o eixo pode ser ampliado para enxergá-la.

## Ponte
“Até aqui usamos variáveis numéricas e um indicador. Como incluir uma característica com várias categorias?”

## Aceite específico
Δz deve permanecer βΔx. Valores em p.p. não podem usar unidade de odds. A comparação exata/aproximada diverge de forma calculada para mudanças maiores. Estado Δx=0 tem variação zero em ambos os métodos.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
